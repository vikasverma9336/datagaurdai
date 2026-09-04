from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
import sqlite3
import time
from urllib.parse import parse_qs, urlparse


ROOT = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(ROOT, "dataguard.db")


SEED_ORGS = [
    ("techcorp", "TechCorp"),
    ("financecorp", "FinanceCorp"),
]

SEED_USERS = [
    ("admin@techcorp.demo", "techcorp", "admin"),
    ("user1@techcorp.demo", "techcorp", "employee"),
    ("admin@financecorp.demo", "financecorp", "admin"),
    ("user1@financecorp.demo", "financecorp", "employee"),
]

SEED_POLICIES = {
    "techcorp": {
        "PERSON": "REDACT",
        "EMAIL": "REDACT",
        "PHONE": "REDACT",
        "CUSTOMER_ID": "REDACT",
        "CREDIT_CARD": "BLOCK",
        "SECRET": "BLOCK",
    },
    "financecorp": {
        "PERSON": "BLOCK",
        "EMAIL": "BLOCK",
        "PHONE": "BLOCK",
        "CUSTOMER_ID": "BLOCK",
        "CREDIT_CARD": "BLOCK",
        "SECRET": "BLOCK",
    },
}


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = connect()
    cur = conn.cursor()

    cur.executescript(
        """
        CREATE TABLE IF NOT EXISTS organizations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          organization_id INTEGER NOT NULL,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL,
          FOREIGN KEY (organization_id) REFERENCES organizations(id)
        );

        CREATE TABLE IF NOT EXISTS policies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          organization_id INTEGER NOT NULL,
          entity_type TEXT NOT NULL,
          action TEXT NOT NULL,
          UNIQUE (organization_id, entity_type),
          FOREIGN KEY (organization_id) REFERENCES organizations(id)
        );

        CREATE TABLE IF NOT EXISTS security_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          organization_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          destination TEXT NOT NULL,
          detected_types TEXT NOT NULL,
          risk_score INTEGER NOT NULL,
          risk_level TEXT NOT NULL,
          action_taken TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (organization_id) REFERENCES organizations(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
        """
    )

    for slug, name in SEED_ORGS:
        cur.execute(
            "INSERT OR IGNORE INTO organizations (slug, name) VALUES (?, ?)",
            (slug, name),
        )

    org_ids = {
        row["slug"]: row["id"]
        for row in cur.execute("SELECT id, slug FROM organizations").fetchall()
    }

    for email, org_slug, role in SEED_USERS:
        cur.execute(
            """
            INSERT OR IGNORE INTO users (organization_id, email, role)
            VALUES (?, ?, ?)
            """,
            (org_ids[org_slug], email, role),
        )

    for org_slug, policies in SEED_POLICIES.items():
        for entity_type, action in policies.items():
            cur.execute(
                """
                INSERT INTO policies (organization_id, entity_type, action)
                VALUES (?, ?, ?)
                ON CONFLICT(organization_id, entity_type)
                DO UPDATE SET action = excluded.action
                """,
                (org_ids[org_slug], entity_type, action),
            )

    conn.commit()
    conn.close()


def get_user_by_email(email):
    conn = connect()
    row = conn.execute(
        """
        SELECT
          users.id AS user_id,
          users.email,
          users.role,
          organizations.id AS organization_id,
          organizations.slug AS organization_slug,
          organizations.name AS organization_name
        FROM users
        JOIN organizations ON organizations.id = users.organization_id
        WHERE lower(users.email) = lower(?)
        """,
        (email,),
    ).fetchone()
    conn.close()
    return row


def get_user_by_token(token):
    try:
      user_id = int(token.split(":")[0])
    except Exception:
      return None

    conn = connect()
    row = conn.execute(
        """
        SELECT
          users.id AS user_id,
          users.email,
          users.role,
          organizations.id AS organization_id,
          organizations.slug AS organization_slug,
          organizations.name AS organization_name
        FROM users
        JOIN organizations ON organizations.id = users.organization_id
        WHERE users.id = ?
        """,
        (user_id,),
    ).fetchone()
    conn.close()
    return row


def get_policy(organization_id):
    conn = connect()
    rows = conn.execute(
        """
        SELECT entity_type, action
        FROM policies
        WHERE organization_id = ?
        ORDER BY entity_type
        """,
        (organization_id,),
    ).fetchall()
    conn.close()
    return {row["entity_type"]: row["action"] for row in rows}


def user_payload(user):
    policy = get_policy(user["organization_id"])
    return {
        "token": f"{user['user_id']}:{user['organization_slug']}",
        "user": {
            "id": user["user_id"],
            "email": user["email"],
            "role": user["role"],
        },
        "organization": {
            "id": user["organization_id"],
            "slug": user["organization_slug"],
            "name": user["organization_name"],
        },
        "policy": policy,
    }


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.add_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/health":
            self.send_json({"ok": True, "service": "DataGuard AI Backend"})
            return

        if parsed.path == "/policy":
            token = parse_qs(parsed.query).get("token", [""])[0]
            user = get_user_by_token(token)
            if not user:
                self.send_json({"error": "Invalid token"}, 401)
                return
            self.send_json(user_payload(user))
            return

        if parsed.path == "/admin/overview":
            self.send_json(self.get_overview())
            return

        self.send_json({"error": "Not found"}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        body = self.read_json()

        if parsed.path == "/login":
            email = body.get("email", "")
            user = get_user_by_email(email)
            if not user:
                self.send_json({"error": "Unknown demo user"}, 401)
                return
            self.send_json(user_payload(user))
            return

        if parsed.path == "/events":
            token = self.headers.get("Authorization", "").replace("Bearer ", "")
            user = get_user_by_token(token)
            if not user:
                self.send_json({"error": "Invalid token"}, 401)
                return

            conn = connect()
            conn.execute(
                """
                INSERT INTO security_events (
                  organization_id, user_id, destination, detected_types,
                  risk_score, risk_level, action_taken, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user["organization_id"],
                    user["user_id"],
                    body.get("destination", "ChatGPT"),
                    json.dumps(body.get("detectedTypes", [])),
                    int(body.get("riskScore", 0)),
                    body.get("riskLevel", "LOW"),
                    body.get("actionTaken", "ALLOW"),
                    int(time.time()),
                ),
            )
            conn.commit()
            conn.close()
            self.send_json({"ok": True})
            return

        self.send_json({"error": "Not found"}, 404)

    def get_overview(self):
        conn = connect()
        orgs = conn.execute(
            """
            SELECT organizations.id, organizations.name, COUNT(security_events.id) AS event_count
            FROM organizations
            LEFT JOIN security_events ON security_events.organization_id = organizations.id
            GROUP BY organizations.id
            ORDER BY organizations.name
            """
        ).fetchall()
        payload = []
        for org in orgs:
            payload.append(
                {
                    "id": org["id"],
                    "name": org["name"],
                    "eventCount": org["event_count"],
                    "policy": get_policy(org["id"]),
                }
            )
        conn.close()
        return {"organizations": payload}

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length == 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def send_json(self, payload, status=200):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.add_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def add_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def log_message(self, format, *args):
        print("[DataGuard Backend]", format % args)


if __name__ == "__main__":
    init_db()
    server = ThreadingHTTPServer(("localhost", 8000), Handler)
    print("DataGuard AI Backend running at http://localhost:8000")
    print("Demo users: admin@techcorp.demo, user1@techcorp.demo")
    print("Demo users: admin@financecorp.demo, user1@financecorp.demo")
    server.serve_forever()

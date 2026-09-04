# DataGuard AI SaaS Demo

This demo adds a local backend and SQLite database to the Chrome extension.

## Architecture

```text
DataGuard AI Backend
        |
    SQLite DB
        |
  Organizations
        |
  Chrome Extension
        |
  Detect sensitive data
        |
  Apply org policy
        |
ALLOW / REDACT / BLOCK
```

## Start Backend

```powershell
npm.cmd run backend
```

Backend URL:

```text
http://localhost:8000
```

SQLite DB is created here:

```text
backend/dataguard.db
```

## Demo Users

```text
user1@techcorp.demo
admin@techcorp.demo
user1@financecorp.demo
admin@financecorp.demo
```

## Demo Policies

TechCorp:

```text
PERSON      REDACT
EMAIL       REDACT
PHONE       REDACT
CUSTOMER_ID REDACT
CREDIT_CARD BLOCK
SECRET      BLOCK
```

FinanceCorp:

```text
PERSON      BLOCK
EMAIL       BLOCK
PHONE       BLOCK
CUSTOMER_ID BLOCK
CREDIT_CARD BLOCK
SECRET      BLOCK
```

## Test Flow

1. Start backend.
2. Build extension.
3. Reload unpacked extension from `extension/dist`.
4. Open the extension popup.
5. Login as TechCorp or FinanceCorp.
6. Open ChatGPT and send a prompt containing sensitive data.

Test prompt:

```text
Customer: Rahul Sharma
Email: rahul@gmail.com
Phone: 9876543210
Customer ID: CUST-92831

Write a professional response.
```

TechCorp should recommend `REDACT`.

FinanceCorp should recommend `BLOCK`.

## Admin Overview

Open this in a browser after creating events:

```text
http://localhost:8000/admin/overview
```

Only metadata is logged. Full prompt text is not stored.

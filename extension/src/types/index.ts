export type EntityType =
  | "PERSON"
  | "EMAIL"
  | "PHONE"
  | "CUSTOMER_ID"
  | "CREDIT_CARD"
  | "SECRET";

export interface Detection {
  type: EntityType;
  start: number;
  end: number;
  confidence: number;
  risk: number;
}

export interface RiskResult {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export type Action = "BLOCK" | "REDACT" | "ALLOW";

export interface SecurityCheckResult {
  hasRisk: boolean;
  detections: Detection[];
  risk: RiskResult;
  recommendedAction: Action;
  destination: string;
  organizationName?: string;
}

export type OrgPolicy = Partial<Record<EntityType, Action>>;

export interface OrganizationSession {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
  organization: {
    id: number;
    slug: string;
    name: string;
  };
  policy: OrgPolicy;
}

export interface AIWebsiteAdapter {
  matches(): boolean;
  getPromptInput(): HTMLElement | null;
  getSubmitButton(): HTMLElement | null;
  getPromptText(): string;
  replacePrompt(text: string): void;
  submitPrompt(): void;
}

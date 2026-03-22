export type PlanType =
  | "TRIAL"
  | "BASE"
  | "PRO"
  | "ENTERPRISE"
  | "INFLUENCER_BASE"
  | "INFLUENCER_PRO"
  | "AGENCY_BASE"
  | "AGENCY_PRO"
  | "AGENCY_CUSTOM";

export interface PlanLimits {
  scheduledPostsPerMonth: number | "Unlimited";
  connectedAccounts: number | "Unlimited";
  teamMembers: number | "Unlimited";
}

export interface Plan {
  type: PlanType;
  name: string;
  price: number;
  description: string;
  features: string[];
  limits: PlanLimits;
  popular?: boolean;
  /** Stripe Price ID — populated once Stripe is configured */
  stripePriceId?: string;
  /** If true, price is negotiated — display "Custom pricing" instead of the numeric price */
  customPricing?: boolean;
  /** How many trial days this plan grants (only for TRIAL type) */
  trialDays?: number;
}

export interface UserPlan {
  currentPlan: PlanType;
  renewalDate: string;
  startDate?: string;
  status: "ACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING";
  cancelAtPeriodEnd?: boolean;
  stripeSubscriptionId?: string;
  /** ISO date when the trial period expires — only present on TRIALING status */
  trialEndsAt?: string;
}

export interface UsageStats {
  postsUsedThisMonth: number;
  postsLimit: number | "Unlimited";
  connectedAccountsCount: number;
  connectedAccountsLimit: number | "Unlimited";
  /** Number of workspaces currently owned by the workspace owner */
  workspacesOwned: number;
  /** Max workspaces allowed by the plan; "Unlimited" for agency custom */
  maxWorkspaces: number | "Unlimited";
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "open" | "draft" | "void" | "uncollectible";
  date: string;
  invoiceUrl?: string;
  description: string;
}

export interface UpcomingInvoice {
  amount: number;
  currency: string;
  dueDate: string;
  description: string;
}

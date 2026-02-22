export type PlanType = "TRIAL" | "BASE" | "PRO" | "ENTERPRISE";

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

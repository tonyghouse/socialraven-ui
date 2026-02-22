export type PlanType = "BASE" | "PRO" | "ENTERPRISE";

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
}

export interface UserPlan {
  currentPlan: PlanType;
  renewalDate: string;
  status: "ACTIVE" | "CANCELLED" | "PAST_DUE";
}

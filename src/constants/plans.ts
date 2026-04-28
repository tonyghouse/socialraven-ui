import { Clock, Star, Crown, Building2, Briefcase, Rocket, Infinity } from "lucide-react";

export type PlanType =
  | "INFLUENCER_TRIAL"
  | "INFLUENCER_BASE"
  | "INFLUENCER_PRO"
  | "AGENCY_TRIAL"
  | "AGENCY_BASE"
  | "AGENCY_PRO"
  | "AGENCY_CUSTOM";

export interface Plan {
  type: PlanType;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  customPricing?: boolean;
  trialDays?: number;
  paddlePriceId?: string;
  limits: {
    scheduledPostsPerMonth: number | "Unlimited";
    connectedAccounts: number | "Unlimited";
    teamMembers: number | "Unlimited";
  };
}

export const PLANS: Plan[] = [
  {
    type: "INFLUENCER_TRIAL",
    name: "Influencer Trial",
    price: 0,
    trialDays: 14,
    description: "Full influencer access for 14 days — no credit card required",
    features: [
      "14-day free trial",
      "Unlimited scheduled posts on all platforms except x.com",
      "Includes 20 x.com posts / month, x add-on available",
      "15 connected accounts",
      "1 workspace (main)",
      "All post types (image, video, text)",
    ],
    limits: { scheduledPostsPerMonth: "Unlimited", connectedAccounts: 15, teamMembers: 1 },
  },
  {
    type: "INFLUENCER_BASE",
    name: "Influencer Base",
    price: 12,
    description: "For creators building their presence",
    paddlePriceId: "price_todo_influencer_base_monthly",
    features: [
      "Unlimited scheduled posts on all platforms except x.com",
      "Includes 150 x.com posts / month, x add-on available",
      "15 connected accounts",
      "1 workspace (main)",
      "All post types (image, video, text)",
      "Email support",
    ],
    limits: { scheduledPostsPerMonth: "Unlimited", connectedAccounts: 15, teamMembers: 1 },
  },
  {
    type: "INFLUENCER_PRO",
    name: "Influencer Pro",
    price: 29,
    description: "For serious creators scaling their brand",
    popular: true,
    paddlePriceId: "price_todo_influencer_pro_monthly",
    features: [
      "Unlimited scheduled posts on all platforms except x.com",
      "Includes 300 x.com posts / month, x add-on available",
      "30 connected accounts",
      "1 workspace (main)",
      "Advanced analytics",
      "Priority support",
    ],
    limits: { scheduledPostsPerMonth: "Unlimited", connectedAccounts: 30, teamMembers: 1 },
  },
  {
    type: "AGENCY_TRIAL",
    name: "Agency Trial",
    price: 0,
    trialDays: 14,
    description: "Full agency access for 14 days — no credit card required",
    features: [
      "14-day free trial",
      "Up to 3 workspaces",
      "Unlimited scheduled posts on all platforms except x.com",
      "Includes 50 x.com posts / month per workspace, x add-on available",
      "30 accounts per workspace",
      "Team members (unlimited seats)",
    ],
    limits: { scheduledPostsPerMonth: "Unlimited", connectedAccounts: 30, teamMembers: "Unlimited" },
  },
  {
    type: "AGENCY_BASE",
    name: "Agency Base",
    price: 79,
    description: "For small agencies managing client brands",
    paddlePriceId: "price_todo_agency_base_monthly",
    features: [
      "Up to 3 workspaces",
      "Unlimited scheduled posts on all platforms except x.com",
      "Includes 300 x.com posts / month per workspace, x add-on available",
      "30 accounts per workspace",
      "Team members (unlimited seats)",
      "Email support",
    ],
    limits: { scheduledPostsPerMonth: "Unlimited", connectedAccounts: 30, teamMembers: "Unlimited" },
  },
  {
    type: "AGENCY_PRO",
    name: "Agency Pro",
    price: 199,
    description: "For growing agencies with multiple clients",
    popular: true,
    paddlePriceId: "price_todo_agency_pro_monthly",
    features: [
      "Up to 10 workspaces",
      "Unlimited scheduled posts on all platforms except x.com",
      "Includes 300 x.com posts / month per workspace, x add-on available",
      "30 accounts per workspace",
      "Team members (unlimited seats)",
      "Priority support",
    ],
    limits: { scheduledPostsPerMonth: "Unlimited", connectedAccounts: 30, teamMembers: "Unlimited" },
  },
  {
    type: "AGENCY_CUSTOM",
    name: "Agency Custom",
    price: 0,
    customPricing: true,
    description: "Starts at $300/month and includes 30 workspaces",
    features: [
      "Base custom price: $300 / month for 30 workspaces",
      "$3 per additional workspace / month",
      "Unlimited scheduled posts across workspaces on all platforms except x.com",
      "Custom x.com monthly allowance, x add-on available",
      "Dedicated account manager",
    ],
    limits: { scheduledPostsPerMonth: "Unlimited", connectedAccounts: "Unlimited", teamMembers: "Unlimited" },
  },
];

export const PLAN_ICONS: Record<PlanType, React.ElementType> = {
  INFLUENCER_TRIAL: Clock,
  INFLUENCER_BASE: Star,
  INFLUENCER_PRO: Crown,
  AGENCY_TRIAL: Building2,
  AGENCY_BASE: Briefcase,
  AGENCY_PRO: Rocket,
  AGENCY_CUSTOM: Infinity,
};

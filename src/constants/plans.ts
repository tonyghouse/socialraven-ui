import { Clock, Star, Crown, Building2, Briefcase, Rocket, Infinity } from "lucide-react";
import type { Plan, PlanType } from "@/model/Plan";

export const PLANS: Plan[] = [
  // ─── Influencer plans ────────────────────────────────────────────────────────
  {
    type: "INFLUENCER_TRIAL",
    name: "Influencer Trial",
    price: 0,
    trialDays: 14,
    description: "Full influencer access for 14 days — no credit card required",
    features: [
      "14-day free trial",
      "50 scheduled posts",
      "5 connected accounts",
      "1 workspace (main)",
      "All post types (image, video, text)",
    ],
    limits: {
      scheduledPostsPerMonth: 50,
      connectedAccounts: 5,
      teamMembers: 1,
    },
  },
  {
    type: "INFLUENCER_BASE",
    name: "Influencer Base",
    price: 12,
    description: "For creators building their presence",
    stripePriceId: "price_todo_influencer_base_monthly",
    features: [
      "100 scheduled posts / month",
      "5 connected accounts",
      "1 workspace (main)",
      "All post types (image, video, text)",
      "Email support",
    ],
    limits: {
      scheduledPostsPerMonth: 100,
      connectedAccounts: 5,
      teamMembers: 1,
    },
  },
  {
    type: "INFLUENCER_PRO",
    name: "Influencer Pro",
    price: 29,
    description: "For serious creators scaling their brand",
    popular: true,
    stripePriceId: "price_todo_influencer_pro_monthly",
    features: [
      "500 scheduled posts / month",
      "15 connected accounts",
      "1 workspace (main)",
      "Advanced analytics",
      "Priority support",
    ],
    limits: {
      scheduledPostsPerMonth: 500,
      connectedAccounts: 15,
      teamMembers: 1,
    },
  },
  // ─── Agency plans ─────────────────────────────────────────────────────────────
  {
    type: "AGENCY_TRIAL",
    name: "Agency Trial",
    price: 0,
    trialDays: 14,
    description: "Full agency access for 14 days — no credit card required",
    features: [
      "14-day free trial",
      "Up to 3 workspaces",
      "300 posts / month per workspace",
      "10 accounts per workspace",
      "Team members (unlimited seats)",
    ],
    limits: {
      scheduledPostsPerMonth: 300,
      connectedAccounts: 10,
      teamMembers: "Unlimited",
    },
  },
  {
    type: "AGENCY_BASE",
    name: "Agency Base",
    price: 79,
    description: "For small agencies managing client brands",
    stripePriceId: "price_todo_agency_base_monthly",
    features: [
      "Up to 3 workspaces",
      "300 posts / month per workspace",
      "10 accounts per workspace",
      "Team members (unlimited seats)",
      "Email support",
    ],
    limits: {
      scheduledPostsPerMonth: 300,
      connectedAccounts: 10,
      teamMembers: "Unlimited",
    },
  },
  {
    type: "AGENCY_PRO",
    name: "Agency Pro",
    price: 199,
    description: "For growing agencies with multiple clients",
    popular: true,
    stripePriceId: "price_todo_agency_pro_monthly",
    features: [
      "Up to 10 workspaces",
      "1000 posts / month per workspace",
      "30 accounts per workspace",
      "Team members (unlimited seats)",
      "Priority support",
    ],
    limits: {
      scheduledPostsPerMonth: 1000,
      connectedAccounts: 30,
      teamMembers: "Unlimited",
    },
  },
  {
    type: "AGENCY_CUSTOM",
    name: "Agency Custom",
    price: 0,
    customPricing: true,
    description: "Tailored for large agencies",
    features: [
      "Unlimited workspaces",
      "Unlimited posts per workspace",
      "Unlimited connected accounts",
      "Dedicated account manager",
      "Custom SLA & onboarding",
    ],
    limits: {
      scheduledPostsPerMonth: "Unlimited",
      connectedAccounts: "Unlimited",
      teamMembers: "Unlimited",
    },
  },
];

export const PLAN_ICONS: Record<PlanType, React.ElementType> = {
  INFLUENCER_TRIAL:  Clock,
  INFLUENCER_BASE:   Star,
  INFLUENCER_PRO:    Crown,
  AGENCY_TRIAL:  Building2,
  AGENCY_BASE:   Briefcase,
  AGENCY_PRO:    Rocket,
  AGENCY_CUSTOM: Infinity,
};

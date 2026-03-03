import { Clock, Lightning, Sparkle, Buildings } from "@phosphor-icons/react";
import type { Plan, PlanType } from "@/model/Plan";

export const PLANS: Plan[] = [
  {
    type: "TRIAL",
    name: "Trial",
    price: 0,
    trialDays: 14,
    description: "Full access for 14 days — no credit card required",
    features: [
      "14-day free trial",
      "50 scheduled posts",
      "5 connected accounts",
      "All post types (image, video, text)",
      "Priority support",
    ],
    limits: {
      scheduledPostsPerMonth: 50,
      connectedAccounts: 5,
      teamMembers: 3,
    },
  },
  {
    type: "BASE",
    name: "Base",
    price: 15,
    description: "For individuals getting started",
    stripePriceId: "price_todo_base_monthly",
    features: [
      "500 scheduled posts / month",
      "30 connected accounts",
      "All post types (image, video, text)",
      "Email support",
    ],
    limits: {
      scheduledPostsPerMonth: 500,
      connectedAccounts: 25,
      teamMembers: 1,
    },
  },
  {
    type: "PRO",
    name: "Pro",
    price: 25,
    description: "For creators growing their audience",
    popular: true,
    stripePriceId: "price_todo_pro_monthly",
    features: [
      "2000 scheduled posts / month",
      "100 connected accounts",
      "Advanced analytics",
      "Image, video & text posts",
      "Priority support",
    ],
    limits: {
      scheduledPostsPerMonth: 2000,
      connectedAccounts: 100,
      teamMembers: 5,
    },
  },
  {
    type: "ENTERPRISE",
    name: "Enterprise",
    price: 1000,
    customPricing: true,
    description: "For teams managing multiple brands",
    stripePriceId: "price_todo_enterprise_monthly",
    features: [
      "Unlimited scheduled posts",
      "Unlimited connected accounts",
      "Advanced analytics",
      "All post types",
      "Dedicated support",
      "Custom branding",
    ],
    limits: {
      scheduledPostsPerMonth: "Unlimited",
      connectedAccounts: "Unlimited",
      teamMembers: "Unlimited",
    },
  },
];

export const PLAN_ICONS: Record<PlanType, React.ElementType> = {
  TRIAL:      Clock,
  BASE:       Lightning,
  PRO:        Sparkle,
  ENTERPRISE: Buildings,
};

import { Clock, Zap, Sparkles, Building2 } from "lucide-react";
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
      "Advanced analytics",
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
    price: 9,
    description: "For individuals getting started",
    stripePriceId: "price_todo_base_monthly",
    features: [
      "50 scheduled posts / month",
      "3 connected accounts",
      "Basic analytics",
      "Image & text posts",
      "Email support",
    ],
    limits: {
      scheduledPostsPerMonth: 50,
      connectedAccounts: 3,
      teamMembers: 1,
    },
  },
  {
    type: "PRO",
    name: "Pro",
    price: 19,
    description: "For creators growing their audience",
    popular: true,
    stripePriceId: "price_todo_pro_monthly",
    features: [
      "150 scheduled posts / month",
      "10 connected accounts",
      "Advanced analytics",
      "Image, video & text posts",
      "Priority support",
    ],
    limits: {
      scheduledPostsPerMonth: 150,
      connectedAccounts: 10,
      teamMembers: 5,
    },
  },
  {
    type: "ENTERPRISE",
    name: "Enterprise",
    price: 49,
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
  BASE:       Zap,
  PRO:        Sparkles,
  ENTERPRISE: Building2,
};

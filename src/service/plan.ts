import { Plan, PlanType, UserPlan } from "@/model/Plan";

// Mock plan catalog
export const PLANS: Plan[] = [
  {
    type: "BASE",
    name: "Base",
    price: 0,
    description: "Get started with social scheduling",
    features: [
      "15 scheduled posts / month",
      "2 connected accounts",
      "1 team member",
      "Basic analytics",
      "Image & text posts",
    ],
    limits: {
      scheduledPostsPerMonth: 15,
      connectedAccounts: 2,
      teamMembers: 1,
    },
  },
  {
    type: "PRO",
    name: "Pro",
    price: 19,
    description: "For creators growing their audience",
    features: [
      "150 scheduled posts / month",
      "10 connected accounts",
      "5 team members",
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
    features: [
      "Unlimited scheduled posts",
      "Unlimited connected accounts",
      "Unlimited team members",
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

// Mock: returns BASE as the current plan
export async function fetchUserPlanApi(
  _getToken: () => Promise<string | null>
): Promise<UserPlan> {
  await new Promise((r) => setTimeout(r, 400));
  return {
    currentPlan: "BASE",
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
  };
}

// Mock: simulates a plan change
export async function changeUserPlanApi(
  _getToken: () => Promise<string | null>,
  newPlan: PlanType
): Promise<UserPlan> {
  await new Promise((r) => setTimeout(r, 600));
  return {
    currentPlan: newPlan,
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
  };
}

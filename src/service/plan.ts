import { PlanType, UsageStats, UserPlan } from "@/model/Plan";
import { PLANS } from "@/constants/plans";

export { PLANS };

type GetToken = () => Promise<string | null>;

// ---------------------------------------------------------------------------
// Mock APIs — replace each body with a real fetch() once backend is ready
// ---------------------------------------------------------------------------

/** GET /plans/me */
export async function fetchUserPlanApi(_getToken: GetToken): Promise<UserPlan> {
  await new Promise((r) => setTimeout(r, 400));
  // Mock: user is 7 days into their 14-day trial
  return {
    currentPlan: "TRIAL",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    renewalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "TRIALING",
    cancelAtPeriodEnd: false,
  };
}

/** PATCH /plans/me */
export async function changeUserPlanApi(
  _getToken: GetToken,
  newPlan: PlanType
): Promise<UserPlan> {
  await new Promise((r) => setTimeout(r, 700));
  return {
    currentPlan: newPlan,
    startDate: new Date().toISOString(),
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
    cancelAtPeriodEnd: false,
  };
}

/** GET /plans/usage */
export async function fetchUsageStatsApi(_getToken: GetToken): Promise<UsageStats> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    postsUsedThisMonth: 12,
    postsLimit: 50,
    connectedAccountsCount: 2,
    connectedAccountsLimit: 5,
  };
}

import { PlanType, UsageStats, UserPlan } from "@/model/Plan";
import { PLANS } from "@/constants/plans";
import { workspaceIdHeader } from "@/lib/api-headers";

export { PLANS };

type GetToken = () => Promise<string | null>;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function authHeaders(getToken: GetToken): Promise<HeadersInit> {
  const token = await getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...workspaceIdHeader(),
  };
}

/** Backend returns null for unlimited; map to "Unlimited" for the UI model */
function resolveLimit(value: number | null): number | "Unlimited" {
  return value === null || value === undefined ? "Unlimited" : value;
}

/** Backend uses -1 for unlimited workspace counts */
function resolveWorkspaceLimit(value: number | null): number | "Unlimited" {
  if (value === null || value === undefined || value === -1) return "Unlimited";
  return value;
}

// ---------------------------------------------------------------------------
// GET /plans/me
// ---------------------------------------------------------------------------

export async function fetchUserPlanApi(getToken: GetToken): Promise<UserPlan> {
  const res = await fetch(`${BACKEND}/plans/me`, {
    headers: await authHeaders(getToken),
  });
  if (!res.ok) throw new Error(`fetchUserPlan failed: ${res.status} ${res.statusText}`.trimEnd());
  const data = await res.json();
  return {
    currentPlan: data.currentPlan as PlanType,
    startDate: data.startDate,
    renewalDate: data.renewalDate,
    status: data.status,
    cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
    paddleSubscriptionId: data.paddleSubscriptionId ?? undefined,
    trialEndsAt: data.trialEndsAt ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// PATCH /plans/me
// ---------------------------------------------------------------------------

export async function changeUserPlanApi(
  getToken: GetToken,
  newPlan: PlanType
): Promise<UserPlan> {
  const res = await fetch(`${BACKEND}/plans/me`, {
    method: "PATCH",
    headers: await authHeaders(getToken),
    body: JSON.stringify({ planType: newPlan }),
  });
  if (!res.ok) throw new Error(`changePlan failed: ${res.statusText}`);
  const data = await res.json();
  return {
    currentPlan: data.currentPlan as PlanType,
    startDate: data.startDate,
    renewalDate: data.renewalDate,
    status: data.status,
    cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
    paddleSubscriptionId: data.paddleSubscriptionId ?? undefined,
    trialEndsAt: data.trialEndsAt ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// GET /plans/usage
// ---------------------------------------------------------------------------

export async function fetchUsageStatsApi(getToken: GetToken): Promise<UsageStats> {
  const res = await fetch(`${BACKEND}/plans/usage`, {
    headers: await authHeaders(getToken),
  });
  if (!res.ok) throw new Error(`fetchUsage failed: ${res.status} ${res.statusText}`.trimEnd());
  const data = await res.json();
  return {
    postsUsedThisMonth: data.postsUsedThisMonth,
    postsLimit: resolveLimit(data.postsLimit),
    connectedAccountsCount: data.connectedAccountsCount,
    connectedAccountsLimit: resolveLimit(data.accountsLimit),
    workspacesOwned: data.workspacesOwned ?? 0,
    maxWorkspaces: resolveWorkspaceLimit(data.maxWorkspaces),
  };
}

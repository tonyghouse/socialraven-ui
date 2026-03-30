"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  CreditCard,
  Shield,
  ExternalLink,
  AlertTriangle,
  CalendarDays,
  Users,
  BarChart2,
  Zap,
  Clock,
  Info,
  FileText,
  Building2,
  Lock,
} from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import {
  PLANS,
  fetchUserPlanApi,
  changeUserPlanApi,
  fetchUsageStatsApi,
} from "@/service/plan";
import { PLAN_ICONS } from "@/constants/plans";
import {
  createBillingPortalSessionApi,
  fetchUpcomingInvoiceApi,
  fetchInvoicesApi,
} from "@/service/billing";
import {
  PlanType,
  UserPlan,
  UsageStats,
  Invoice,
  UpcomingInvoice,
} from "@/model/Plan";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amountCents / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function trialDaysLeft(trialEndsAt: string): number {
  return Math.max(
    0,
    Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanStatusBadge({ status }: { status: UserPlan["status"] }) {
  const map: Record<UserPlan["status"], { label: string; cls: string }> = {
    ACTIVE: {
      label: "Active",
      cls: "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    TRIALING: {
      label: "Trial",
      cls: "border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300",
    },
    PAST_DUE: {
      label: "Past Due",
      cls: "border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300",
    },
    CANCELLED: {
      label: "Cancelled",
      cls: "border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300",
    },
  };
  const v = map[status] ?? map.ACTIVE;
  return (
    <Badge
      variant="secondary"
      className={cn("border px-2.5 py-0.5 text-xs font-semibold tracking-normal", v.cls)}
    >
      {v.label}
    </Badge>
  );
}

function InvoiceStatusBadge({ status }: { status: Invoice["status"] }) {
  const map: Record<Invoice["status"], string> = {
    paid: "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300",
    open: "border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300",
    draft: "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))] dark:bg-[hsl(var(--surface-sunken))]",
    void: "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-subtle))] dark:bg-[hsl(var(--surface-sunken))]",
    uncollectible:
      "border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300",
  };
  return (
    <Badge
      variant="secondary"
      className={cn("border text-xs font-semibold capitalize", map[status])}
    >
      {status}
    </Badge>
  );
}

function UsageBar({
  label,
  used,
  limit,
  icon: Icon,
}: {
  label: string;
  used: number;
  limit: number | "Unlimited";
  icon: React.ElementType;
}) {
  const unlimited = limit === "Unlimited";
  const pct = unlimited ? 100 : Math.min(100, Math.round((used / (limit as number)) * 100));
  const nearLimit = !unlimited && pct >= 80;
  const atLimit   = !unlimited && pct >= 100;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground-muted))]">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <span
          className={cn(
            "text-sm font-medium tabular-nums",
            atLimit
              ? "text-rose-600 dark:text-rose-300"
              : nearLimit
                ? "text-amber-600 dark:text-amber-300"
                : "text-foreground"
          )}
        >
          {unlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--surface-sunken))] dark:bg-[hsl(var(--surface-raised))]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            unlimited
              ? "w-full bg-emerald-500 dark:bg-emerald-400"
              : atLimit
                ? "bg-rose-500 dark:bg-rose-400"
                : nearLimit
                  ? "bg-amber-500 dark:bg-amber-400"
                  : "bg-[hsl(var(--accent))]"
          )}
          style={!unlimited ? { width: `${pct}%` } : undefined}
        />
      </div>
      {atLimit && (
        <p className="text-sm leading-none text-rose-600 dark:text-rose-300">
          Limit reached — upgrade to continue
        </p>
      )}
      {nearLimit && !atLimit && (
        <p className="text-sm leading-none text-amber-600 dark:text-amber-300">Approaching limit</p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { getToken } = useAuth();
  const { isOwner } = useRole();

  const [userPlan, setUserPlan]               = useState<UserPlan | null>(null);
  const [usageStats, setUsageStats]           = useState<UsageStats | null>(null);
  const [upcomingInvoice, setUpcomingInvoice] = useState<UpcomingInvoice | null>(null);
  const [invoices, setInvoices]               = useState<Invoice[]>([]);
  const [planLoading, setPlanLoading]         = useState(true);
  const [billingLoading, setBillingLoading]   = useState(true);
  const [changingTo, setChangingTo]           = useState<PlanType | null>(null);
  const [portalLoading, setPortalLoading]     = useState(false);

  useEffect(() => {
    Promise.all([fetchUserPlanApi(getToken), fetchUsageStatsApi(getToken)])
      .then(([plan, usage]) => {
        setUserPlan(plan);
        setUsageStats(usage);
      })
      .catch(() => toast.error("Failed to load plan information"))
      .finally(() => setPlanLoading(false));
  }, [getToken]);

  useEffect(() => {
    Promise.all([fetchUpcomingInvoiceApi(getToken), fetchInvoicesApi(getToken)])
      .then(([upcoming, history]) => {
        setUpcomingInvoice(upcoming);
        setInvoices(history);
      })
      .catch(() => {})
      .finally(() => setBillingLoading(false));
  }, [getToken]);

  async function handleChangePlan(planType: PlanType) {
    if (!userPlan || planType === userPlan.currentPlan) return;
    setChangingTo(planType);
    try {
      const updated = await changeUserPlanApi(getToken, planType);
      setUserPlan(updated);
      const name = PLANS.find((p) => p.type === planType)?.name ?? planType;
      toast.success(`Switched to ${name} plan`);
    } catch {
      toast.error("Failed to change plan. Please try again.");
    } finally {
      setChangingTo(null);
    }
  }

  async function handleBillingPortal() {
    setPortalLoading(true);
    try {
      const { url } = await createBillingPortalSessionApi(getToken, window.location.href);
      if (url && !url.startsWith("#")) {
        window.location.href = url;
      } else {
        toast.info("Stripe billing portal is coming soon. We'll notify you by email when it's live.");
      }
    } catch {
      toast.error("Failed to open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  }

  const currentPlan = PLANS.find((p) => p.type === userPlan?.currentPlan);
  const isPaidPlan  = (currentPlan?.price ?? 0) > 0;
  const isTrialing     = userPlan?.status === "TRIALING";
  const daysLeft       = isTrialing && userPlan?.trialEndsAt ? trialDaysLeft(userPlan.trialEndsAt) : null;

  // Hide trial-only cards once the user has moved to a paid plan
  const visiblePlans = PLANS.filter(
    (p) => !p.type.endsWith("_TRIAL") || userPlan?.currentPlan?.endsWith("_TRIAL")
  );

  return (
    <div className="w-full bg-background">
      <ProtectedPageHeader
        title="Billing & Plans"
        description="Manage your subscription, usage, and payment details."
        icon={<CreditCard className="h-4 w-4" />}
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex w-full flex-col gap-6">
        {/* Non-owner notice */}
        {!isOwner && (
          <section className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] p-4">
            <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-4 dark:bg-[hsl(var(--surface-sunken))]">
              <Lock className="h-4 w-4 shrink-0 text-[hsl(var(--foreground-muted))]" />
              <p className="text-sm text-[hsl(var(--foreground-muted))]">
                Subscription and billing details are only visible to the workspace owner.
              </p>
            </div>
          </section>
        )}

        {isOwner && (
          <>
          {/* ══════════════════════════════════════════════════
              SECTION 1 — CURRENT SUBSCRIPTION
          ══════════════════════════════════════════════════ */}
          <section className="overflow-hidden rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
            <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]/70 px-5 py-4 dark:bg-[hsl(var(--surface-sunken))] sm:px-6">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
                  Subscription
                </h2>
                <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
                  Your active plan and resource usage for this billing period.
                </p>
              </div>
            </div>
            <div className="space-y-5 px-5 py-5 sm:px-6">

            {planLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-[88px] w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
              </div>
            ) : userPlan && currentPlan ? (
              <>
                {/* Trial expiry banner */}
                {isTrialing && daysLeft !== null && (
                  <div
                    className={cn(
                      "flex flex-col justify-between gap-3 rounded-lg border px-4 py-4 sm:flex-row sm:items-center",
                      daysLeft <= 3
                        ? "border-rose-200/80 bg-rose-50 dark:border-rose-500/25 dark:bg-rose-500/10"
                        : "border-amber-200/80 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          daysLeft <= 3
                            ? "text-rose-600 dark:text-rose-300"
                            : "text-amber-600 dark:text-amber-300"
                        )}
                      />
                      <div>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            daysLeft <= 3
                              ? "text-rose-900 dark:text-rose-100"
                              : "text-amber-900 dark:text-amber-100"
                          )}
                        >
                          {daysLeft === 0
                            ? "Your trial has expired"
                            : `Your trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                        </p>
                        <p
                          className={cn(
                            "text-sm mt-0.5",
                            daysLeft <= 3
                              ? "text-rose-700 dark:text-rose-200"
                              : "text-amber-700 dark:text-amber-200"
                          )}
                        >
                          Upgrade to a paid plan to keep full access to SocialRaven.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 text-sm"
                      onClick={() =>
                        document
                          .getElementById("plans-section")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      Upgrade Now
                    </Button>
                  </div>
                )}

                {/* Plan status card */}
                <Card className="overflow-hidden rounded-lg border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-none">
                  <CardContent className="p-5">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="shrink-0 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-2.5 dark:bg-[hsl(var(--surface-sunken))]">
                          {(() => {
                            const Icon = PLAN_ICONS[userPlan.currentPlan];
                            return <Icon className="h-4 w-4 text-[hsl(var(--accent))]" />;
                          })()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-semibold">{currentPlan.name} Plan</span>
                            <PlanStatusBadge status={userPlan.status} />
                            {userPlan.cancelAtPeriodEnd && (
                              <Badge
                                variant="secondary"
                                className="border border-amber-200/70 bg-amber-50 text-sm text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300"
                              >
                                Cancels at period end
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <CalendarDays className="h-3 w-3" />
                              {isTrialing
                                ? `Trial ends ${formatDate(userPlan.trialEndsAt!)}`
                                : userPlan.cancelAtPeriodEnd
                                  ? `Expires ${formatDate(userPlan.renewalDate)}`
                                  : `Renews ${formatDate(userPlan.renewalDate)}`}
                            </span>
                            {currentPlan.price > 0 && (
                              <span className="text-sm font-medium text-muted-foreground">
                                {currentPlan.customPricing ? "Custom pricing" : `$${currentPlan.price} / month`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-3 dark:bg-[hsl(var(--surface-sunken))] lg:min-w-[280px]">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--foreground-subtle))]">
                              Status
                            </p>
                            <PlanStatusBadge status={userPlan.status} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--foreground-subtle))]">
                              Price
                            </p>
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                              {currentPlan.price > 0
                                ? currentPlan.customPricing
                                  ? "Custom pricing"
                                  : `$${currentPlan.price} / month`
                                : "Free"}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {isPaidPlan && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleBillingPortal}
                              disabled={portalLoading}
                              className="w-full gap-1.5 border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm hover:bg-[hsl(var(--surface))] dark:bg-[hsl(var(--surface))]"
                            >
                              {portalLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CreditCard className="h-3.5 w-3.5" />
                              )}
                              Manage Billing
                            </Button>
                          )}
                          {!isPaidPlan && (
                            <Button
                              size="sm"
                              className="w-full gap-1.5 text-sm shadow-none"
                              onClick={() =>
                                document
                                  .getElementById("plans-section")
                                  ?.scrollIntoView({ behavior: "smooth" })
                              }
                            >
                              <Zap className="h-3.5 w-3.5" />
                              View Plans
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cancellation warning (paid plans only) */}
                {userPlan.cancelAtPeriodEnd && !isTrialing && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Your subscription ends on <strong>{formatDate(userPlan.renewalDate)}</strong>.
                      After that your account will be paused.{" "}
                      <button
                        className="underline font-semibold hover:no-underline"
                        onClick={handleBillingPortal}
                      >
                        Reactivate
                      </button>
                    </span>
                  </div>
                )}

                {/* Usage stats */}
                {usageStats && (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <Card className="rounded-lg border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-none">
                      <CardContent className="p-4">
                        <UsageBar
                          label="Posts this month"
                          used={usageStats.postsUsedThisMonth}
                          limit={usageStats.postsLimit}
                          icon={BarChart2}
                        />
                      </CardContent>
                    </Card>
                    <Card className="rounded-lg border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-none">
                      <CardContent className="p-4">
                        <UsageBar
                          label="Connected accounts"
                          used={usageStats.connectedAccountsCount}
                          limit={usageStats.connectedAccountsLimit}
                          icon={Users}
                        />
                      </CardContent>
                    </Card>
                    <Card className="rounded-lg border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-none lg:col-span-1">
                      <CardContent className="p-4">
                        <UsageBar
                          label="Workspaces"
                          used={usageStats.workspacesOwned}
                          limit={usageStats.maxWorkspaces}
                          icon={Building2}
                        />
                        {usageStats.maxWorkspaces !== "Unlimited" &&
                          usageStats.workspacesOwned >= usageStats.maxWorkspaces && (
                            <p className="mt-2 text-sm leading-snug text-amber-600 dark:text-amber-300">
                              Workspace limit reached — upgrade your plan to create more workspaces.
                            </p>
                          )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-4">Unable to load subscription information.</p>
            )}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════
              SECTION 2 — AVAILABLE PLANS
          ══════════════════════════════════════════════════ */}
          <section
            className="overflow-hidden rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]"
            id="plans-section"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]/70 px-5 py-4 dark:bg-[hsl(var(--surface-sunken))] sm:px-6">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
                  Plans
                </h2>
                <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
                  All prices in USD, billed monthly. Upgrades take effect immediately.
                </p>
              </div>
            </div>
            <div className="space-y-5 px-5 py-5 sm:px-6">

            <div
              className={cn(
                "grid gap-4",
                visiblePlans.length === 4
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                  : "grid-cols-1 md:grid-cols-3"
              )}
            >
              {visiblePlans.map((plan, idx) => {
                const visibleCurrentIdx = visiblePlans.findIndex(
                  (p) => p.type === userPlan?.currentPlan
                );
                const isCurrent  = plan.type === userPlan?.currentPlan;
                const isUpgrade  = visibleCurrentIdx !== -1 && idx > visibleCurrentIdx;
                const isDowngrade= visibleCurrentIdx !== -1 && idx < visibleCurrentIdx;
                const isChanging = changingTo === plan.type;
                const PlanIcon   = PLAN_ICONS[plan.type];

                return (
                  <div
                    key={plan.type}
                    className={cn(
                      "relative flex flex-col gap-4 rounded-lg border p-4 transition-colors bg-[hsl(var(--surface))]",
                      isCurrent
                        ? "border-[hsl(var(--accent)/0.45)] bg-[hsl(var(--accent)/0.03)]"
                        : "border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-raised))]/45",
                      plan.popular && !isCurrent && "border-[hsl(var(--accent)/0.25)]"
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute right-4 top-4 z-10">
                        <Badge className="border border-[hsl(var(--accent)/0.18)] bg-[hsl(var(--accent)/0.08)] px-2 py-0.5 text-xs font-semibold text-[hsl(var(--accent))] shadow-none">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-1.5 dark:bg-[hsl(var(--surface-sunken))]">
                          <PlanIcon className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-base">{plan.name}</span>
                            {isCurrent && (
                              <Badge
                                variant="secondary"
                                className="border border-[hsl(var(--accent)/0.16)] bg-[hsl(var(--accent)/0.08)] px-1.5 py-0 text-xs font-semibold text-[hsl(var(--accent))]"
                              >
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm leading-snug text-[hsl(var(--foreground-muted))]">
                            {plan.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {plan.price === 0 ? (
                          <span className="text-base font-bold">Free</span>
                        ) : plan.customPricing ? (
                          <span className="text-base font-bold">Custom</span>
                        ) : (
                          <>
                            <span className="text-base font-bold">${plan.price}</span>
                            <span className="text-sm text-muted-foreground">/mo</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="flex-1 space-y-2 border-t border-[hsl(var(--border-subtle))] pt-4">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-sm">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--accent))]" />
                          <span className="text-[hsl(var(--foreground-muted))]">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "w-full text-sm",
                        !isCurrent && !plan.popular &&
                          "border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-raised))] dark:bg-[hsl(var(--surface))]"
                      )}
                      disabled={isCurrent || isChanging || changingTo !== null || planLoading}
                      onClick={() => {
                        if (plan.type === "AGENCY_CUSTOM" && isUpgrade) {
                          window.location.href =
                            "mailto:sales@socialraven.io?subject=Agency%20Plan%20Enquiry";
                          return;
                        }
                        handleChangePlan(plan.type);
                      }}
                    >
                      {isChanging ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Switching…
                        </span>
                      ) : isCurrent ? (
                        "Current plan"
                      ) : plan.type === "AGENCY_CUSTOM" && isUpgrade ? (
                        "Contact Sales"
                      ) : isUpgrade ? (
                        "Upgrade"
                      ) : isDowngrade ? (
                        "Downgrade"
                      ) : (
                        "Switch"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            <p className="text-sm leading-relaxed text-[hsl(var(--foreground-muted))]">
              Downgrades take effect at the end of the current billing period. You may cancel at any
              time without penalty. All prices exclude applicable taxes.
            </p>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════
              SECTION 3 — BILLING
          ══════════════════════════════════════════════════ */}
          <section className="overflow-hidden rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
            <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]/70 px-5 py-4 dark:bg-[hsl(var(--surface-sunken))] sm:px-6">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
                  Billing
                </h2>
                <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
                  Invoices and payment management.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBillingPortal}
                disabled={portalLoading}
                className="gap-1.5 shrink-0 border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm hover:bg-[hsl(var(--surface))] dark:bg-[hsl(var(--surface))]"
              >
                {portalLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CreditCard className="w-3 h-3" />
                )}
                Billing Portal
              </Button>
            </div>
            <div className="space-y-5 px-5 py-5 sm:px-6">

            {/* Stripe coming-soon notice */}
            <div className="flex items-start gap-3 rounded-lg border border-sky-200/80 bg-sky-50 p-4 dark:border-sky-500/25 dark:bg-sky-500/10">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-300" />
              <div>
                <p className="text-base font-medium text-sky-900 dark:text-sky-100">
                  Stripe Billing — Coming Soon
                </p>
                <p className="mt-1 text-sm leading-relaxed text-sky-700 dark:text-sky-200">
                  We are finalising our Stripe integration. Once live, you can update your payment
                  method, download VAT-compliant invoices, and manage your subscription here. You
                  will be notified by email as soon as billing goes live.
                </p>
              </div>
            </div>

            {billingLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-[72px] w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : (
              <>
                {upcomingInvoice && (
                  <Card className="rounded-lg border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-none">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                            Upcoming Charge
                          </p>
                          <p className="text-xl font-bold mt-1">
                            {formatCurrency(upcomingInvoice.amount, upcomingInvoice.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {upcomingInvoice.description} · Due {formatDate(upcomingInvoice.dueDate)}
                          </p>
                        </div>
                        <Clock className="h-9 w-9 shrink-0 text-[hsl(var(--foreground))/0.14]" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="overflow-hidden rounded-lg border-[hsl(var(--border-subtle))] shadow-none">
                  <CardHeader className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-4 pb-4 dark:bg-[hsl(var(--surface-sunken))]">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-3.5 w-3.5 text-[hsl(var(--foreground-muted))]" />
                      Invoice History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {invoices.length === 0 ? (
                      <p className="px-4 py-4 text-sm text-[hsl(var(--foreground-muted))]">
                        No invoices yet. They will appear here once a paid subscription is active.
                      </p>
                    ) : (
                      <div className="divide-y divide-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
                        {invoices.map((inv) => (
                          <div
                            key={inv.id}
                            className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-[hsl(var(--surface-raised))]/65 dark:hover:bg-[hsl(var(--surface-sunken))]"
                          >
                            <div className="min-w-0">
                              <p className="text-sm truncate">{inv.description}</p>
                              <p className="mt-0.5 text-sm text-[hsl(var(--foreground-muted))]">
                                {formatDate(inv.date)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <InvoiceStatusBadge status={inv.status} />
                              <span className="text-sm font-medium tabular-nums">
                                {formatCurrency(inv.amount, inv.currency)}
                              </span>
                              {inv.invoiceUrl && (
                                <a
                                  href={inv.invoiceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="Download invoice"
                                  className="text-[hsl(var(--foreground-muted))] transition-colors hover:text-[hsl(var(--foreground))]"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <p className="flex items-center gap-1.5 text-sm text-[hsl(var(--foreground-muted))]">
                  <Shield className="h-3 w-3 shrink-0" />
                  Payments are processed securely by Stripe. SocialRaven never stores your card details.
                </p>
              </>
            )}
            </div>
          </section>
          </>
        )}
      </div>
      </div>
    </div>
  );
}

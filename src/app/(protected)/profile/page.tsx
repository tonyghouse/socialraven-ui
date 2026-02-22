"use client";

import { UserProfile, useAuth } from "@clerk/nextjs";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    ACTIVE:    { label: "Active",    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" },
    TRIALING:  { label: "Trial",     cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
    PAST_DUE:  { label: "Past Due",  cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
    CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  };
  const v = map[status] ?? map.ACTIVE;
  return (
    <Badge variant="secondary" className={cn("text-sm font-medium", v.cls)}>
      {v.label}
    </Badge>
  );
}

function InvoiceStatusBadge({ status }: { status: Invoice["status"] }) {
  const map: Record<Invoice["status"], string> = {
    paid:          "bg-emerald-100 text-emerald-700",
    open:          "bg-amber-100 text-amber-700",
    draft:         "bg-gray-100 text-gray-500",
    void:          "bg-gray-100 text-gray-400",
    uncollectible: "bg-red-100 text-red-700",
  };
  return (
    <Badge variant="secondary" className={cn("text-sm capitalize", map[status])}>
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
  const pct       = unlimited ? 100 : Math.min(100, Math.round((used / (limit as number)) * 100));
  const nearLimit = !unlimited && pct >= 80;
  const atLimit   = !unlimited && pct >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>
        <span
          className={cn(
            "text-sm font-medium tabular-nums",
            atLimit ? "text-red-600" : nearLimit ? "text-amber-600" : "text-foreground"
          )}
        >
          {unlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            unlimited ? "bg-emerald-500 w-full" :
            atLimit   ? "bg-red-500" :
            nearLimit ? "bg-amber-500" :
            "bg-primary"
          )}
          style={!unlimited ? { width: `${pct}%` } : undefined}
        />
      </div>
      {atLimit && (
        <p className="text-sm text-red-600 leading-none">Limit reached — upgrade to continue</p>
      )}
      {nearLimit && !atLimit && (
        <p className="text-sm text-amber-600 leading-none">Approaching limit</p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { getToken } = useAuth();

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

  // Hide the TRIAL card once the user has moved to a paid plan
  const visiblePlans = PLANS.filter(
    (p) => p.type !== "TRIAL" || userPlan?.currentPlan === "TRIAL"
  );

  return (
    <div className="w-full py-8 px-8 space-y-10">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, subscription, and billing preferences.
        </p>
      </div>

      <Separator />

      {/* ══════════════════════════════════════════════════
          SECTION 1 — ACCOUNT SETTINGS (Clerk)
      ══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Update your name, email, password, and connected devices.
          </p>
        </div>
        <div className="rounded-xl overflow-hidden border border-foreground/10 shadow-sm">
          <UserProfile routing="hash" />
        </div>
      </section>

      <Separator />

      {/* ══════════════════════════════════════════════════
          SECTION 2 — CURRENT PLAN
      ══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Subscription
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your active plan and resource usage for this billing period.
          </p>
        </div>

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
                  "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4",
                  daysLeft <= 3
                    ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20"
                    : "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle
                    className={cn(
                      "w-4 h-4 mt-0.5 shrink-0",
                      daysLeft <= 3 ? "text-red-600" : "text-amber-600"
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        daysLeft <= 3 ? "text-red-900 dark:text-red-200" : "text-amber-900 dark:text-amber-200"
                      )}
                    >
                      {daysLeft === 0
                        ? "Your trial has expired"
                        : `Your trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                    </p>
                    <p
                      className={cn(
                        "text-sm mt-0.5",
                        daysLeft <= 3 ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"
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
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 p-2.5 rounded-lg bg-foreground/5 border border-foreground/10">
                      {(() => {
                        const Icon = PLAN_ICONS[userPlan.currentPlan];
                        return <Icon className="w-4 h-4" />;
                      })()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-base">{currentPlan.name} Plan</span>
                        <PlanStatusBadge status={userPlan.status} />
                        {userPlan.cancelAtPeriodEnd && (
                          <Badge variant="secondary" className="text-sm bg-amber-100 text-amber-700">
                            Cancels at period end
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {isTrialing
                            ? `Trial ends ${formatDate(userPlan.trialEndsAt!)}`
                            : userPlan.cancelAtPeriodEnd
                            ? `Expires ${formatDate(userPlan.renewalDate)}`
                            : `Renews ${formatDate(userPlan.renewalDate)}`}
                        </span>
                        {currentPlan.price > 0 && (
                          <span className="text-sm text-muted-foreground font-medium">
                            ${currentPlan.price} / month
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPaidPlan && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBillingPortal}
                        disabled={portalLoading}
                        className="gap-1.5 text-sm"
                      >
                        {portalLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5" />
                        )}
                        Manage Billing
                      </Button>
                    )}
                    {!isPaidPlan && (
                      <Button
                        size="sm"
                        className="gap-1.5 text-sm"
                        onClick={() =>
                          document
                            .getElementById("plans-section")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                      >
                        <Zap className="w-3.5 h-3.5" />
                        View Plans
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cancellation warning (paid plans only) */}
            {userPlan.cancelAtPeriodEnd && !isTrialing && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card className="border-foreground/10">
                  <CardContent className="p-4">
                    <UsageBar
                      label="Posts this month"
                      used={usageStats.postsUsedThisMonth}
                      limit={usageStats.postsLimit}
                      icon={BarChart2}
                    />
                  </CardContent>
                </Card>
                <Card className="border-foreground/10">
                  <CardContent className="p-4">
                    <UsageBar
                      label="Connected accounts"
                      used={usageStats.connectedAccountsCount}
                      limit={usageStats.connectedAccountsLimit}
                      icon={Users}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground py-4">Unable to load subscription information.</p>
        )}
      </section>

      <Separator />

      {/* ══════════════════════════════════════════════════
          SECTION 3 — AVAILABLE PLANS
      ══════════════════════════════════════════════════ */}
      <section className="space-y-4" id="plans-section">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Plans
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            All prices in USD, billed monthly. Upgrades take effect immediately.
          </p>
        </div>

        <div
          className={cn(
            "grid gap-4",
            visiblePlans.length === 4
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1 md:grid-cols-3"
          )}
        >
          {visiblePlans.map((plan, idx) => {
            // Index within visiblePlans for upgrade/downgrade logic
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
                  "relative rounded-xl border p-5 flex flex-col gap-4 transition-all bg-card",
                  isCurrent
                    ? "border-foreground/25 ring-1 ring-foreground/15 shadow-sm"
                    : "border-border hover:border-foreground/20 hover:shadow-sm",
                  plan.popular && !isCurrent && "border-primary/30"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="text-sm px-2.5 py-0.5 font-semibold shadow-sm">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-foreground/5 border border-foreground/10">
                      <PlanIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-base">{plan.name}</span>
                        {isCurrent && (
                          <Badge
                            variant="secondary"
                            className="text-sm px-1.5 py-0 bg-foreground/10 font-normal"
                          >
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                        {plan.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {plan.price === 0 ? (
                      <span className="text-base font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-base font-bold">${plan.price}</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-sm">
                      <Check className="w-3 h-3 mt-0.5 text-emerald-600 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
                  size="sm"
                  className="w-full text-sm"
                  disabled={isCurrent || isChanging || changingTo !== null || planLoading}
                  onClick={() => {
                    if (plan.type === "ENTERPRISE" && isUpgrade) {
                      window.location.href =
                        "mailto:sales@socialraven.io?subject=Enterprise%20Plan%20Enquiry";
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
                  ) : plan.type === "ENTERPRISE" && isUpgrade ? (
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

        <p className="text-sm text-muted-foreground leading-relaxed">
          Downgrades take effect at the end of the current billing period. You may cancel at any
          time without penalty. All prices exclude applicable taxes.
        </p>
      </section>

      <Separator />

      {/* ══════════════════════════════════════════════════
          SECTION 4 — BILLING
      ══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Billing
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Invoices and payment management.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleBillingPortal}
            disabled={portalLoading}
            className="gap-1.5 text-sm shrink-0"
          >
            {portalLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CreditCard className="w-3 h-3" />
            )}
            Billing Portal
          </Button>
        </div>

        {/* Stripe coming-soon notice */}
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20 p-4">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-base font-medium text-blue-900 dark:text-blue-200">
              Stripe Billing — Coming Soon
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
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
              <Card>
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
                    <Clock className="w-9 h-9 text-muted-foreground/20 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Invoice History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-3">
                {invoices.length === 0 ? (
                  <p className="px-4 pb-4 text-sm text-muted-foreground">
                    No invoices yet. They will appear here once a paid subscription is active.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between px-4 py-3 gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-sm truncate">{inv.description}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
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
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3 h-3 shrink-0" />
              Payments are processed securely by Stripe. SocialRaven never stores your card details.
            </p>
          </>
        )}
      </section>

      <Separator />

      {/* ══════════════════════════════════════════════════
          SECTION 5 — DATA & PRIVACY
      ══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Data &amp; Privacy
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your rights under GDPR and applicable US privacy laws.
          </p>
        </div>

        <Card className="border-foreground/10">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your data is stored and processed in accordance with the{" "}
                <strong className="text-foreground">
                  General Data Protection Regulation (GDPR)
                </strong>{" "}
                for EEA and UK residents, and applicable US state privacy laws including CCPA.
                We apply data minimisation principles and never sell your personal data.
                <br />
                <br />
                You have the right to access, correct, or erase your personal data at any time
                (GDPR Arts. 15–17). Submit requests to{" "}
                <a
                  href="mailto:privacy@socialraven.io"
                  className="text-foreground underline hover:no-underline"
                >
                  privacy@socialraven.io
                </a>
                . We respond within 30 days.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Terms of Service
              </a>
              <a
                href="mailto:privacy@socialraven.io?subject=Data%20Deletion%20Request"
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                Request Data Deletion (GDPR Art. 17)
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}

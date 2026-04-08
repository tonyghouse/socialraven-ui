"use client";

import { useAuth } from "@clerk/nextjs";
import { type ElementType, useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart2,
  Building2,
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Info,
  Loader2,
  Lock,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PLAN_ICONS } from "@/constants/plans";
import { useRole } from "@/hooks/useRole";
import { Invoice, PlanType, UpcomingInvoice, UsageStats, UserPlan } from "@/model/Plan";
import {
  createBillingPortalSessionApi,
  fetchInvoicesApi,
  fetchUpcomingInvoiceApi,
} from "@/service/billing";
import {
  changeUserPlanApi,
  fetchUsageStatsApi,
  fetchUserPlanApi,
  PLANS,
} from "@/service/plan";

const pageClassName = "w-full bg-[var(--ds-background-200)]";
const sectionClassName =
  "overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-none";
const sectionHeaderClassName =
  "flex items-start justify-between gap-4 border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-4 sm:px-6";
const sectionLabelClassName = "text-label-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]";
const sectionDescriptionClassName = "mt-1 text-copy-14 text-[var(--ds-gray-900)]";
const subtleTextClassName = "text-copy-14 text-[var(--ds-gray-900)]";
const quietTextClassName = "text-copy-12 text-[var(--ds-gray-900)]";
const cardClassName =
  "rounded-lg border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none";
const raisedPanelClassName =
  "rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] shadow-none";
const outlineButtonClassName =
  "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";
const primaryButtonClassName =
  "bg-[var(--ds-blue-600)] text-white shadow-none hover:bg-[var(--ds-blue-700)]";
const focusRingClassName =
  "focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";

function toneBadgeClassName(tone: "neutral" | "blue" | "green" | "amber" | "red") {
  switch (tone) {
    case "blue":
      return "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]";
    case "green":
      return "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]";
    case "amber":
      return "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]";
    case "red":
      return "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]";
    default:
      return "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]";
  }
}

function noticeClassName(tone: "blue" | "amber" | "red" | "neutral") {
  if (tone === "blue") {
    return "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]";
  }
  if (tone === "amber") {
    return "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]";
  }
  if (tone === "red") {
    return "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]";
  }
  return "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]";
}

function Sk({ className }: { className?: string }) {
  return <Skeleton className={cn("bg-[var(--ds-gray-200)]", className)} />;
}

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

function PlanStatusBadge({ status }: { status: UserPlan["status"] }) {
  const map: Record<UserPlan["status"], { label: string; cls: string }> = {
    ACTIVE: { label: "Active", cls: toneBadgeClassName("green") },
    TRIALING: { label: "Trial", cls: toneBadgeClassName("blue") },
    PAST_DUE: { label: "Past Due", cls: toneBadgeClassName("amber") },
    CANCELLED: { label: "Cancelled", cls: toneBadgeClassName("red") },
  };
  const value = map[status] ?? map.ACTIVE;

  return (
    <Badge
      variant="outline"
      className={cn("border px-2.5 py-0.5 text-copy-12 font-semibold tracking-normal", value.cls)}
    >
      {value.label}
    </Badge>
  );
}

function InvoiceStatusBadge({ status }: { status: Invoice["status"] }) {
  const map: Record<Invoice["status"], string> = {
    paid: toneBadgeClassName("green"),
    open: toneBadgeClassName("amber"),
    draft: toneBadgeClassName("neutral"),
    void: toneBadgeClassName("neutral"),
    uncollectible: toneBadgeClassName("red"),
  };

  return (
    <Badge
      variant="outline"
      className={cn("border text-copy-12 font-semibold capitalize", map[status])}
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
  icon: ElementType;
}) {
  const unlimited = limit === "Unlimited";
  const pct = unlimited ? 100 : Math.min(100, Math.round((used / (limit as number)) * 100));
  const nearLimit = !unlimited && pct >= 80;
  const atLimit = !unlimited && pct >= 100;
  const indicatorClassName = unlimited
    ? "bg-[var(--ds-green-600)]"
    : atLimit
      ? "bg-[var(--ds-red-600)]"
      : nearLimit
        ? "bg-[var(--ds-amber-600)]"
        : "bg-[var(--ds-blue-600)]";
  const valueClassName = atLimit
    ? "text-[var(--ds-red-700)]"
    : nearLimit
      ? "text-[var(--ds-amber-700)]"
      : "text-[var(--ds-gray-1000)]";

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-copy-14 font-medium text-[var(--ds-gray-900)]">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <span className={cn("text-copy-14 font-medium tabular-nums", valueClassName)}>
          {unlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--ds-gray-200)]">
        <div
          className={cn("h-full rounded-full transition-all duration-500", indicatorClassName)}
          style={!unlimited ? { width: `${pct}%` } : undefined}
        />
      </div>

      {atLimit && (
        <p className="text-copy-13 leading-none text-[var(--ds-red-700)]">
          Limit reached - upgrade to continue
        </p>
      )}
      {nearLimit && !atLimit && (
        <p className="text-copy-13 leading-none text-[var(--ds-amber-700)]">Approaching limit</p>
      )}
    </div>
  );
}

export default function BillingPage() {
  const { getToken } = useAuth();
  const { isOwner } = useRole();

  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [upcomingInvoice, setUpcomingInvoice] = useState<UpcomingInvoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(true);
  const [changingTo, setChangingTo] = useState<PlanType | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

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
      const name = PLANS.find((plan) => plan.type === planType)?.name ?? planType;
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
        toast.info("Paddle billing portal is coming soon. We'll notify you by email when it's live.");
      }
    } catch {
      toast.error("Failed to open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  }

  const currentPlan = PLANS.find((plan) => plan.type === userPlan?.currentPlan);
  const isPaidPlan = (currentPlan?.price ?? 0) > 0;
  const isTrialing = userPlan?.status === "TRIALING";
  const daysLeft = isTrialing && userPlan?.trialEndsAt ? trialDaysLeft(userPlan.trialEndsAt) : null;
  const visiblePlans = PLANS.filter(
    (plan) => !plan.type.endsWith("_TRIAL") || userPlan?.currentPlan?.endsWith("_TRIAL")
  );

  return (
    <div className={pageClassName}>
      <ProtectedPageHeader
        title="Billing & Plans"
        description="Manage your subscription, usage, and payment details."
        icon={<CreditCard className="h-4 w-4" />}
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col gap-6">
          {!isOwner && (
            <section className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4">
              <div className="flex items-center gap-3 rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-4">
                <Lock className="h-4 w-4 shrink-0 text-[var(--ds-gray-900)]" />
                <p className={subtleTextClassName}>
                  Subscription and billing details are only visible to the workspace owner.
                </p>
              </div>
            </section>
          )}

          {isOwner && (
            <>
              <section className={sectionClassName}>
                <div className={sectionHeaderClassName}>
                  <div className="space-y-1">
                    <h2 className={sectionLabelClassName}>Subscription</h2>
                    <p className={sectionDescriptionClassName}>
                      Your active plan and resource usage for this billing period.
                    </p>
                  </div>
                </div>

                <div className="space-y-5 px-5 py-5 sm:px-6">
                  {planLoading ? (
                    <div className="space-y-3">
                      <Sk className="h-[88px] w-full rounded-xl" />
                      <div className="grid grid-cols-2 gap-3">
                        <Sk className="h-20 rounded-xl" />
                        <Sk className="h-20 rounded-xl" />
                      </div>
                    </div>
                  ) : userPlan && currentPlan ? (
                    <>
                      {isTrialing && daysLeft !== null && (
                        <div
                          className={cn(
                            "flex flex-col justify-between gap-3 rounded-lg border px-4 py-4 sm:flex-row sm:items-center",
                            daysLeft <= 3 ? noticeClassName("red") : noticeClassName("amber")
                          )}
                        >
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div>
                              <p className="text-label-14">
                                {daysLeft === 0
                                  ? "Your trial has expired"
                                  : `Your trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                              </p>
                              <p className="mt-0.5 text-copy-14">
                                Upgrade to a paid plan to keep full access to SocialRaven.
                              </p>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            className={cn("shrink-0 text-sm", primaryButtonClassName, focusRingClassName)}
                            onClick={() =>
                              document.getElementById("plans-section")?.scrollIntoView({ behavior: "smooth" })
                            }
                          >
                            Upgrade Now
                          </Button>
                        </div>
                      )}

                      <Card className={cn("overflow-hidden", cardClassName)}>
                        <CardContent className="p-5">
                          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="shrink-0 rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-2.5">
                                {(() => {
                                  const Icon = PLAN_ICONS[userPlan.currentPlan];
                                  return <Icon className="h-4 w-4 text-[var(--ds-blue-700)]" />;
                                })()}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-heading-18 text-[var(--ds-gray-1000)]">
                                    {currentPlan.name} Plan
                                  </span>
                                  <PlanStatusBadge status={userPlan.status} />
                                  {userPlan.cancelAtPeriodEnd && (
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "border text-copy-12 font-semibold",
                                        toneBadgeClassName("amber")
                                      )}
                                    >
                                      Cancels at period end
                                    </Badge>
                                  )}
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                                  <span className={cn("flex items-center gap-1", subtleTextClassName)}>
                                    <CalendarDays className="h-3 w-3" />
                                    {isTrialing
                                      ? `Trial ends ${formatDate(userPlan.trialEndsAt!)}`
                                      : userPlan.cancelAtPeriodEnd
                                        ? `Expires ${formatDate(userPlan.renewalDate)}`
                                        : `Renews ${formatDate(userPlan.renewalDate)}`}
                                  </span>
                                  {currentPlan.price > 0 && (
                                    <span className={cn("font-medium", subtleTextClassName)}>
                                      {currentPlan.customPricing ? "Custom pricing" : `$${currentPlan.price} / month`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className={cn("grid gap-3 p-3 lg:min-w-[280px]", raisedPanelClassName)}>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <p className={sectionLabelClassName}>Status</p>
                                  <PlanStatusBadge status={userPlan.status} />
                                </div>
                                <div className="space-y-1">
                                  <p className={sectionLabelClassName}>Price</p>
                                  <p className="text-label-14 text-[var(--ds-gray-1000)]">
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
                                    className={cn(
                                      "w-full gap-1.5 text-sm",
                                      outlineButtonClassName,
                                      focusRingClassName
                                    )}
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
                                    className={cn(
                                      "w-full gap-1.5 text-sm",
                                      primaryButtonClassName,
                                      focusRingClassName
                                    )}
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

                      {userPlan.cancelAtPeriodEnd && !isTrialing && (
                        <div
                          className={cn(
                            "flex items-start gap-2.5 rounded-xl border p-4 text-copy-14",
                            noticeClassName("amber")
                          )}
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>
                            Your subscription ends on <strong>{formatDate(userPlan.renewalDate)}</strong>.
                            After that your account will be paused.{" "}
                            <button
                              className="font-semibold underline hover:no-underline"
                              onClick={handleBillingPortal}
                            >
                              Reactivate
                            </button>
                          </span>
                        </div>
                      )}

                      {usageStats && (
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                          <Card className={cardClassName}>
                            <CardContent className="p-4">
                              <UsageBar
                                label="Posts this month"
                                used={usageStats.postsUsedThisMonth}
                                limit={usageStats.postsLimit}
                                icon={BarChart2}
                              />
                            </CardContent>
                          </Card>
                          <Card className={cardClassName}>
                            <CardContent className="p-4">
                              <UsageBar
                                label="Connected accounts"
                                used={usageStats.connectedAccountsCount}
                                limit={usageStats.connectedAccountsLimit}
                                icon={Users}
                              />
                            </CardContent>
                          </Card>
                          <Card className={cn(cardClassName, "lg:col-span-1")}>
                            <CardContent className="p-4">
                              <UsageBar
                                label="Workspaces"
                                used={usageStats.workspacesOwned}
                                limit={usageStats.maxWorkspaces}
                                icon={Building2}
                              />
                              {usageStats.maxWorkspaces !== "Unlimited" &&
                                usageStats.workspacesOwned >= usageStats.maxWorkspaces && (
                                  <p className="mt-2 text-copy-13 leading-snug text-[var(--ds-amber-700)]">
                                    Workspace limit reached - upgrade your plan to create more workspaces.
                                  </p>
                                )}
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="py-4 text-copy-14 text-[var(--ds-gray-900)]">
                      Unable to load subscription information.
                    </p>
                  )}
                </div>
              </section>

              <section className={sectionClassName} id="plans-section">
                <div className={sectionHeaderClassName}>
                  <div className="space-y-1">
                    <h2 className={sectionLabelClassName}>Plans</h2>
                    <p className={sectionDescriptionClassName}>
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
                    {visiblePlans.map((plan, index) => {
                      const visibleCurrentIndex = visiblePlans.findIndex(
                        (candidate) => candidate.type === userPlan?.currentPlan
                      );
                      const isCurrent = plan.type === userPlan?.currentPlan;
                      const isUpgrade = visibleCurrentIndex !== -1 && index > visibleCurrentIndex;
                      const isDowngrade = visibleCurrentIndex !== -1 && index < visibleCurrentIndex;
                      const isChanging = changingTo === plan.type;
                      const PlanIcon = PLAN_ICONS[plan.type];

                      return (
                        <div
                          key={plan.type}
                          className={cn(
                            "relative flex flex-col gap-4 rounded-lg border p-4 transition-colors",
                            isCurrent
                              ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)]"
                              : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]",
                            plan.popular &&
                              !isCurrent &&
                              "border-[var(--ds-blue-200)]"
                          )}
                        >
                          {plan.popular && (
                            <div className="absolute right-4 top-4 z-10">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "border px-2 py-0.5 text-copy-12 font-semibold shadow-none",
                                  toneBadgeClassName("blue")
                                )}
                              >
                                Most Popular
                              </Badge>
                            </div>
                          )}

                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={cn(
                                  "rounded-md border p-1.5",
                                  isCurrent
                                    ? "border-[var(--ds-blue-200)] bg-[var(--ds-background-100)]"
                                    : "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]"
                                )}
                              >
                                <PlanIcon className="h-3.5 w-3.5 text-[var(--ds-blue-700)]" />
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-heading-18 text-[var(--ds-gray-1000)]">
                                    {plan.name}
                                  </span>
                                  {isCurrent && (
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "border px-1.5 py-0 text-copy-12 font-semibold",
                                        toneBadgeClassName("blue")
                                      )}
                                    >
                                      Current
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-0.5 text-copy-14 leading-snug text-[var(--ds-gray-900)]">
                                  {plan.description}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              {plan.price === 0 ? (
                                <span className="text-heading-18 text-[var(--ds-gray-1000)]">Free</span>
                              ) : plan.customPricing ? (
                                <span className="text-heading-18 text-[var(--ds-gray-1000)]">Custom</span>
                              ) : (
                                <>
                                  <span className="text-heading-18 text-[var(--ds-gray-1000)]">
                                    ${plan.price}
                                  </span>
                                  <span className="text-copy-14 text-[var(--ds-gray-900)]">/mo</span>
                                </>
                              )}
                            </div>
                          </div>

                          <ul className="flex-1 space-y-2 border-t border-[var(--ds-gray-400)] pt-4">
                            {plan.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-1.5 text-copy-14">
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ds-blue-700)]" />
                                <span className="text-[var(--ds-gray-900)]">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full text-sm",
                              isCurrent
                                ? "border-[var(--ds-blue-200)] bg-[var(--ds-background-100)] text-[var(--ds-blue-700)] hover:bg-[var(--ds-background-100)] hover:text-[var(--ds-blue-700)]"
                                : plan.popular
                                  ? primaryButtonClassName
                                  : outlineButtonClassName,
                              focusRingClassName
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
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Switching...
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

                  <p className="text-copy-14 leading-relaxed text-[var(--ds-gray-900)]">
                    Downgrades take effect at the end of the current billing period. You may cancel at any
                    time without penalty. All prices exclude applicable taxes.
                  </p>
                </div>
              </section>

              <section className={sectionClassName}>
                <div className={sectionHeaderClassName}>
                  <div className="space-y-1">
                    <h2 className={sectionLabelClassName}>Billing</h2>
                    <p className={sectionDescriptionClassName}>Invoices and payment management.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBillingPortal}
                    disabled={portalLoading}
                    className={cn(
                      "shrink-0 gap-1.5 text-sm",
                      outlineButtonClassName,
                      focusRingClassName
                    )}
                  >
                    {portalLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CreditCard className="h-3 w-3" />
                    )}
                    Billing Portal
                  </Button>
                </div>

                <div className="space-y-5 px-5 py-5 sm:px-6">
                  <div className={cn("flex items-start gap-3 rounded-lg border p-4", noticeClassName("blue"))}>
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-heading-16">Paddle Billing - Coming Soon</p>
                      <p className="mt-1 text-copy-14 leading-relaxed">
                        We are finalising our Paddle integration. Once live, you can update your payment
                        method, download VAT-compliant invoices, and manage your subscription here. You
                        will be notified by email as soon as billing goes live.
                      </p>
                    </div>
                  </div>

                  {billingLoading ? (
                    <div className="space-y-3">
                      <Sk className="h-[72px] w-full rounded-xl" />
                      <Sk className="h-24 w-full rounded-xl" />
                    </div>
                  ) : (
                    <>
                      {upcomingInvoice && (
                        <Card className={cardClassName}>
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className={sectionLabelClassName}>Upcoming Charge</p>
                                <p className="mt-1 text-heading-24 text-[var(--ds-gray-1000)]">
                                  {formatCurrency(upcomingInvoice.amount, upcomingInvoice.currency)}
                                </p>
                                <p className="mt-0.5 text-copy-14 text-[var(--ds-gray-900)]">
                                  {upcomingInvoice.description} · Due {formatDate(upcomingInvoice.dueDate)}
                                </p>
                              </div>
                              <Clock className="h-9 w-9 shrink-0 text-[var(--ds-gray-700)]" />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Card className={cn("overflow-hidden", cardClassName)}>
                        <CardHeader className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4 pb-4">
                          <CardTitle className="flex items-center gap-2 text-label-14 text-[var(--ds-gray-1000)]">
                            <FileText className="h-3.5 w-3.5 text-[var(--ds-gray-900)]" />
                            Invoice History
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          {invoices.length === 0 ? (
                            <p className="px-4 py-4 text-copy-14 text-[var(--ds-gray-900)]">
                              No invoices yet. They will appear here once a paid subscription is active.
                            </p>
                          ) : (
                            <div className="divide-y divide-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
                              {invoices.map((invoice) => (
                                <div
                                  key={invoice.id}
                                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-[var(--ds-gray-100)]"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-copy-14 text-[var(--ds-gray-1000)]">
                                      {invoice.description}
                                    </p>
                                    <p className="mt-0.5 text-copy-13 text-[var(--ds-gray-900)]">
                                      {formatDate(invoice.date)}
                                    </p>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-3">
                                    <InvoiceStatusBadge status={invoice.status} />
                                    <span className="text-copy-14 font-medium tabular-nums text-[var(--ds-gray-1000)]">
                                      {formatCurrency(invoice.amount, invoice.currency)}
                                    </span>
                                    {invoice.invoiceUrl && (
                                      <a
                                        href={invoice.invoiceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Download invoice"
                                        className="text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]"
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

                      <p className="flex items-center gap-1.5 text-copy-14 text-[var(--ds-gray-900)]">
                        <Shield className="h-3 w-3 shrink-0" />
                        Payments are processed securely by Paddle. SocialRaven never stores your card details.
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

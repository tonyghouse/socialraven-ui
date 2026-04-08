"use client";

import { useAuth } from "@clerk/nextjs";
import { type ElementType, type ReactNode, useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart2,
  Building2,
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  ExternalLink,
  Info,
  Loader2,
  Lock,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { PLAN_ICONS } from "@/constants/plans";
import { usePlan } from "@/hooks/usePlan";
import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/utils";
import { Invoice, Plan, PlanType, UpcomingInvoice, UsageStats, UserPlan } from "@/model/Plan";
import { createBillingPortalSessionApi, fetchInvoicesApi, fetchUpcomingInvoiceApi } from "@/service/billing";
import { changeUserPlanApi, fetchUsageStatsApi, fetchUserPlanApi, PLANS } from "@/service/plan";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const pageClassName =
  "w-full bg-[linear-gradient(180deg,var(--ds-background-200)_0%,var(--ds-background-100)_15rem,var(--ds-background-100)_100%)]";
const sectionClassName = "w-full";
const sectionHeaderClassName =
  "flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between";
const sectionLabelClassName = "text-label-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]";
const sectionTitleClassName = "mt-1 text-heading-16 text-[var(--ds-gray-1000)]";
const subtleTextClassName = "text-copy-14 text-[var(--ds-gray-900)]";
const quietTextClassName = "text-copy-13 text-[var(--ds-gray-900)]";
const insetPanelClassName =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] shadow-none";
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

function planPriceLabel(plan: Plan) {
  if (plan.customPricing) return "Custom";
  if (plan.price === 0) return "Free";
  return `$${plan.price}`;
}

function planPriceNote(plan: Plan) {
  if (plan.customPricing) return "sales-assisted pricing";
  if (plan.price === 0) return "no monthly charge";
  return "/ month";
}

function nextBillingLabel(userPlan: UserPlan, isTrialing: boolean) {
  if (isTrialing) return "Trial ends";
  if (userPlan.cancelAtPeriodEnd) return "Access ends";
  return "Renews";
}

function statusLabel(status: UserPlan["status"]) {
  switch (status) {
    case "TRIALING":
      return "Trial";
    case "PAST_DUE":
      return "Past due";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Active";
  }
}

function SectionHeader({
  label,
  title,
  actions,
  divider = false,
}: {
  label: string;
  title: string;
  actions?: ReactNode;
  divider?: boolean;
}) {
  return (
    <div className={cn("space-y-4", !divider && "pb-4")}>
      <div className={sectionHeaderClassName}>
        <div className="min-w-0">
          <p className={sectionLabelClassName}>{label}</p>
          <h2 className={sectionTitleClassName}>{title}</h2>
        </div>
        {actions ? <div className="w-full sm:w-auto sm:shrink-0">{actions}</div> : null}
      </div>
      {divider ? <div className="h-px w-full bg-[var(--ds-gray-400)]" /> : null}
    </div>
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

function OverviewMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className={sectionLabelClassName}>{label}</p>
      <p className="mt-1 truncate text-label-14 text-[var(--ds-gray-1000)]">{value}</p>
    </div>
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
    <div className="space-y-2.5 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-copy-14 text-[var(--ds-gray-900)]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ds-gray-100)] text-[var(--ds-blue-700)]">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="truncate">{label}</span>
        </div>
        <span className={cn("shrink-0 text-label-14-mono", valueClassName)}>
          {unlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--ds-gray-200)]">
        <div
          className={cn("h-full rounded-full transition-all duration-500", indicatorClassName)}
          style={!unlimited ? { width: `${pct}%` } : undefined}
        />
      </div>

      {atLimit ? (
        <p className="text-copy-13 text-[var(--ds-red-700)]">Limit reached</p>
      ) : nearLimit ? (
        <p className="text-copy-13 text-[var(--ds-amber-700)]">Approaching limit</p>
      ) : (
        <p className="text-copy-13 text-[var(--ds-gray-900)]">Within allowance</p>
      )}
    </div>
  );
}

function PlanPrice({
  plan,
  align = "left",
  large = false,
}: {
  plan: Plan;
  align?: "left" | "right";
  large?: boolean;
}) {
  const largeClassName = large ? "text-heading-32" : "text-heading-24";

  return (
    <div className={cn("flex flex-col gap-1", align === "right" ? "items-start xl:items-end" : "items-start")}>
      <div className={cn("flex items-end gap-1.5", align === "right" && "xl:justify-end")}>
        <span className={cn(largeClassName, "text-[var(--ds-gray-1000)]")}>{planPriceLabel(plan)}</span>
        {!plan.customPricing && plan.price > 0 ? (
          <span className="pb-1 text-copy-13 text-[var(--ds-gray-900)]">{planPriceNote(plan)}</span>
        ) : null}
      </div>
      {(plan.customPricing || plan.price === 0) && (
        <span className="text-copy-13 text-[var(--ds-gray-900)]">{planPriceNote(plan)}</span>
      )}
    </div>
  );
}

function PlanRow({
  plan,
  isCurrent,
  isUpgrade,
  isDowngrade,
  isChanging,
  isBusy,
  onSelect,
}: {
  plan: Plan;
  isCurrent: boolean;
  isUpgrade: boolean;
  isDowngrade: boolean;
  isChanging: boolean;
  isBusy: boolean;
  onSelect: (planType: PlanType) => void;
}) {
  const PlanIcon = PLAN_ICONS[plan.type];
  const isContactSales = plan.type === "AGENCY_CUSTOM" && isUpgrade;

  return (
    <div
      className={cn(
        "px-5 py-5 transition-colors sm:px-6",
        isCurrent
          ? "bg-[linear-gradient(180deg,var(--ds-background-100)_0%,var(--ds-blue-100)_100%)]"
          : "bg-[var(--ds-background-100)]"
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                isCurrent
                  ? "border-[var(--ds-blue-200)] bg-[var(--ds-background-100)] text-[var(--ds-blue-700)]"
                  : "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
              )}
            >
              <PlanIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-heading-20 text-[var(--ds-gray-1000)]">{plan.name}</h3>
                {isCurrent ? (
                  <Badge
                    variant="outline"
                    className={cn(
                      "border px-2 py-0.5 text-copy-12 font-semibold",
                      toneBadgeClassName("blue")
                    )}
                  >
                    Current
                  </Badge>
                ) : null}
                {plan.popular && !isCurrent ? (
                  <Badge
                    variant="outline"
                    className={cn(
                      "border px-2 py-0.5 text-copy-12 font-semibold",
                      toneBadgeClassName("blue")
                    )}
                  >
                    Popular
                  </Badge>
                ) : null}
              </div>
              <p className={cn("mt-1", subtleTextClassName)}>{plan.description}</p>
              <div className="pt-3 sm:hidden">
                <PlanPrice plan={plan} />
              </div>
            </div>
          </div>

          <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-copy-14 text-[var(--ds-gray-900)]">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ds-blue-700)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 xl:w-[220px] xl:items-end xl:text-right">
          <div className="hidden sm:block">
            <PlanPrice plan={plan} align="right" />
          </div>

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
            disabled={isCurrent || isChanging || isBusy}
            onClick={() => onSelect(plan.type)}
          >
            {isChanging ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Switching...
              </span>
            ) : isCurrent ? (
              "Current plan"
            ) : isContactSales ? (
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
      </div>
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  return (
    <>
      <div className="space-y-3 px-4 py-4 md:hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">{invoice.description}</p>
            <p className={cn("mt-1", quietTextClassName)}>{formatDate(invoice.date)}</p>
          </div>
          <p className="shrink-0 text-label-14-mono text-[var(--ds-gray-1000)]">
            {formatCurrency(invoice.amount, invoice.currency)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <InvoiceStatusBadge status={invoice.status} />

          {invoice.invoiceUrl ? (
            <a
              href={invoice.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-copy-13 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]"
            >
              View invoice
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="hidden gap-3 px-4 py-4 md:grid md:grid-cols-[minmax(0,1fr)_110px_120px_36px] md:items-center">
        <div className="min-w-0">
          <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">{invoice.description}</p>
          <p className={cn("mt-1", quietTextClassName)}>{formatDate(invoice.date)}</p>
        </div>

        <div className="md:justify-self-start">
          <InvoiceStatusBadge status={invoice.status} />
        </div>

        <div className="text-label-14-mono text-[var(--ds-gray-1000)]">
          {formatCurrency(invoice.amount, invoice.currency)}
        </div>

        <div className="flex md:justify-end">
          {invoice.invoiceUrl ? (
            <a
              href={invoice.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download invoice"
              className="text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default function BillingPage() {
  const { getToken } = useAuth();
  const { syncFromUserPlan } = usePlan();
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
        syncFromUserPlan(plan);
      })
      .catch(() => toast.error("Failed to load plan information"))
      .finally(() => setPlanLoading(false));
  }, [getToken, syncFromUserPlan]);

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

    const currentIndex = visiblePlans.findIndex((plan) => plan.type === userPlan.currentPlan);
    const selectedIndex = visiblePlans.findIndex((plan) => plan.type === planType);
    const isUpgrade = currentIndex !== -1 && selectedIndex > currentIndex;

    if (planType === "AGENCY_CUSTOM" && isUpgrade) {
      window.location.href = "mailto:sales@socialraven.io?subject=Agency%20Plan%20Enquiry";
      return;
    }

    setChangingTo(planType);
    try {
      const updated = await changeUserPlanApi(getToken, planType);
      setUserPlan(updated);
      syncFromUserPlan(updated);
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

  function scrollToPlans() {
    document.getElementById("plans-section")?.scrollIntoView({ behavior: "smooth" });
  }

  const currentPlan = PLANS.find((plan) => plan.type === userPlan?.currentPlan);
  const isPaidPlan = Boolean(currentPlan?.customPricing || (currentPlan?.price ?? 0) > 0);
  const isTrialing = userPlan?.status === "TRIALING";
  const daysLeft = isTrialing && userPlan?.trialEndsAt ? trialDaysLeft(userPlan.trialEndsAt) : null;
  const visiblePlans = PLANS.filter(
    (plan) => !plan.type.endsWith("_TRIAL") || userPlan?.currentPlan?.endsWith("_TRIAL")
  );
  const visibleCurrentIndex = visiblePlans.findIndex((plan) => plan.type === userPlan?.currentPlan);

  return (
    <div className={pageClassName}>
      <ProtectedPageHeader
        title="Billing & Plans"
        description="Manage your subscription, usage, and payment details."
        icon={<CreditCard className="h-4 w-4" />}
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col gap-8">
          {!isOwner ? (
            <section className={sectionClassName}>
              <div className={cn("flex items-center gap-3 px-4 py-4 sm:max-w-[640px]", insetPanelClassName)}>
                <Lock className="h-4 w-4 shrink-0 text-[var(--ds-gray-900)]" />
                <p className={subtleTextClassName}>
                  Subscription and billing details are only visible to the workspace owner.
                </p>
              </div>
            </section>
          ) : (
            <>
              <section className={sectionClassName}>
                <SectionHeader label="Subscription" title="Current plan" />

                <div className="space-y-4">
                  {planLoading ? (
                    <>
                      <Sk className="h-[248px] w-full rounded-2xl sm:h-[220px] lg:h-[164px]" />
                      <div className="grid gap-0 overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] divide-y divide-[var(--ds-gray-400)] md:grid-cols-3 md:divide-x md:divide-y-0">
                        <Sk className="h-[116px] rounded-none" />
                        <Sk className="h-[116px] rounded-none" />
                        <Sk className="h-[116px] rounded-none" />
                      </div>
                    </>
                  ) : userPlan && currentPlan ? (
                    <>
                      <div className="rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4 sm:p-5 lg:rounded-none lg:border-x-0 lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0 lg:pb-6">
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-8">
                          <div className="min-w-0 space-y-4 lg:pr-8 lg:border-r lg:border-[var(--ds-gray-400)]">
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ds-gray-100)] text-[var(--ds-blue-700)]">
                                {(() => {
                                  const Icon = PLAN_ICONS[userPlan.currentPlan];
                                  return <Icon className="h-4 w-4" />;
                                })()}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-heading-24 text-[var(--ds-gray-1000)]">
                                    {currentPlan.name}
                                  </h3>
                                  <PlanStatusBadge status={userPlan.status} />
                                  {userPlan.cancelAtPeriodEnd ? (
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "border px-2.5 py-0.5 text-copy-12 font-semibold",
                                        toneBadgeClassName("amber")
                                      )}
                                    >
                                      Cancels at period end
                                    </Badge>
                                  ) : null}
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-copy-14 text-[var(--ds-gray-900)]">
                                  <span className="flex items-center gap-1.5">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    {nextBillingLabel(userPlan, Boolean(isTrialing))}{" "}
                                    {formatDate(isTrialing ? userPlan.trialEndsAt! : userPlan.renewalDate)}
                                  </span>
                                  {userPlan.startDate ? <span>Started {formatDate(userPlan.startDate)}</span> : null}
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-4 border-t border-[var(--ds-gray-400)] pt-4 sm:grid-cols-3 sm:gap-6">
                              <OverviewMeta
                                label={isTrialing ? "Trial" : "Plan"}
                                value={
                                  isTrialing && daysLeft !== null
                                    ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                                    : statusLabel(userPlan.status)
                                }
                              />
                              <OverviewMeta
                                label="Billing"
                                value={currentPlan.customPricing ? "Custom" : currentPlan.price === 0 ? "Free" : "Monthly"}
                              />
                              <OverviewMeta
                                label="Portal"
                                value={isPaidPlan ? "Available soon" : "Upgrade to unlock"}
                              />
                            </div>

                            {isTrialing && daysLeft !== null ? (
                              <div
                                className={cn(
                                  "flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                                  daysLeft <= 3 ? noticeClassName("red") : noticeClassName("amber")
                                )}
                              >
                                <div className="flex items-start gap-2.5">
                                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                  <p className="text-copy-14">
                                    {daysLeft === 0
                                      ? "Your trial has expired."
                                      : `Your trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  className={cn("shrink-0 text-sm", primaryButtonClassName, focusRingClassName)}
                                  onClick={scrollToPlans}
                                >
                                  Upgrade now
                                </Button>
                              </div>
                            ) : null}

                            {userPlan.cancelAtPeriodEnd && !isTrialing ? (
                              <div
                                className={cn(
                                  "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-copy-14",
                                  noticeClassName("amber")
                                )}
                              >
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>
                                  Subscription ends on <strong>{formatDate(userPlan.renewalDate)}</strong>.{" "}
                                  <button
                                    className="font-semibold underline hover:no-underline"
                                    onClick={handleBillingPortal}
                                  >
                                    Reactivate
                                  </button>
                                </span>
                              </div>
                            ) : null}
                          </div>

                          <div className="border-t border-[var(--ds-gray-400)] pt-4 sm:pt-5 lg:border-t-0 lg:pt-0 lg:pl-1">
                            <p className={sectionLabelClassName}>Monthly rate</p>
                            <div className="mt-2">
                              <PlanPrice plan={currentPlan} large />
                            </div>
                            <Button
                              size="sm"
                              variant={isPaidPlan ? "outline" : "default"}
                              onClick={isPaidPlan ? handleBillingPortal : scrollToPlans}
                              disabled={portalLoading}
                              className={cn(
                                "mt-4 w-full gap-1.5 text-sm",
                                isPaidPlan ? outlineButtonClassName : primaryButtonClassName,
                                focusRingClassName
                              )}
                            >
                              {portalLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : isPaidPlan ? (
                                <CreditCard className="h-3.5 w-3.5" />
                              ) : (
                                <Zap className="h-3.5 w-3.5" />
                              )}
                              {isPaidPlan ? "Manage billing" : "View plans"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {usageStats ? (
                        <div className="grid overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] divide-y divide-[var(--ds-gray-400)] md:grid-cols-3 md:divide-x md:divide-y-0">
                          <UsageBar
                            label="Posts this month"
                            used={usageStats.postsUsedThisMonth}
                            limit={usageStats.postsLimit}
                            icon={BarChart2}
                          />
                          <UsageBar
                            label="Connected accounts"
                            used={usageStats.connectedAccountsCount}
                            limit={usageStats.connectedAccountsLimit}
                            icon={Users}
                          />
                          <div className="space-y-2.5 p-4 sm:p-5">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-2 text-copy-14 text-[var(--ds-gray-900)]">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ds-gray-100)] text-[var(--ds-blue-700)]">
                                  <Building2 className="h-3.5 w-3.5" />
                                </div>
                                <span className="truncate">Workspaces</span>
                              </div>
                              <span className="shrink-0 text-label-14-mono text-[var(--ds-gray-1000)]">
                                {usageStats.maxWorkspaces === "Unlimited"
                                  ? `${usageStats.workspacesOwned} / ∞`
                                  : `${usageStats.workspacesOwned} / ${usageStats.maxWorkspaces}`}
                              </span>
                            </div>

                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--ds-gray-200)]">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  usageStats.maxWorkspaces === "Unlimited"
                                    ? "bg-[var(--ds-green-600)]"
                                    : usageStats.workspacesOwned >= usageStats.maxWorkspaces
                                      ? "bg-[var(--ds-amber-600)]"
                                      : "bg-[var(--ds-blue-600)]"
                                )}
                                style={
                                  usageStats.maxWorkspaces === "Unlimited"
                                    ? undefined
                                    : {
                                        width: `${Math.min(
                                          100,
                                          Math.round(
                                            (usageStats.workspacesOwned / usageStats.maxWorkspaces) * 100
                                          )
                                        )}%`,
                                      }
                                }
                              />
                            </div>

                            <p className="text-copy-13 text-[var(--ds-gray-900)]">
                              {usageStats.maxWorkspaces !== "Unlimited" &&
                              usageStats.workspacesOwned >= usageStats.maxWorkspaces
                                ? "Workspace limit reached"
                                : "Within allowance"}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="py-4 text-copy-14 text-[var(--ds-gray-900)]">
                      Unable to load subscription information.
                    </p>
                  )}
                </div>
              </section>

              <section className={cn(sectionClassName, "pt-3")} id="plans-section">
                <SectionHeader label="Plans" title="Change subscription" divider />

                <div className="overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] md:rounded-none md:border-0">
                  <div className="divide-y divide-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
                    {visiblePlans.map((plan, index) => {
                      const isCurrent = plan.type === userPlan?.currentPlan;
                      const isUpgrade = visibleCurrentIndex !== -1 && index > visibleCurrentIndex;
                      const isDowngrade = visibleCurrentIndex !== -1 && index < visibleCurrentIndex;
                      const isChanging = changingTo === plan.type;

                      return (
                        <PlanRow
                          key={plan.type}
                          plan={plan}
                          isCurrent={isCurrent}
                          isUpgrade={isUpgrade}
                          isDowngrade={isDowngrade}
                          isChanging={isChanging}
                          isBusy={changingTo !== null || planLoading}
                          onSelect={handleChangePlan}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4">
                  <p className={quietTextClassName}>
                    Downgrades apply at the end of the current billing period. Taxes are added where required.
                  </p>
                </div>
              </section>

              <section className={cn(sectionClassName, "pt-3")}>
                <SectionHeader
                  label="Billing"
                  title="Invoices"
                  divider
                  actions={
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBillingPortal}
                      disabled={portalLoading}
                      className={cn("w-full gap-1.5 text-sm sm:w-auto", outlineButtonClassName, focusRingClassName)}
                    >
                      {portalLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CreditCard className="h-3 w-3" />
                      )}
                      Billing portal
                    </Button>
                  }
                />

                <div className="space-y-4">
                  <div
                    className={cn(
                      "flex items-start gap-3 rounded-xl border px-4 py-3 sm:max-w-[760px]",
                      noticeClassName("blue")
                    )}
                  >
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-copy-14">
                      Paddle billing is being finalized. Payment updates and invoice downloads will appear here when live.
                    </p>
                  </div>

                  {billingLoading ? (
                    <div className="space-y-3">
                      <Sk className="h-[96px] w-full rounded-xl" />
                      <Sk className="h-[240px] w-full rounded-xl" />
                    </div>
                  ) : (
                    <>
                      {upcomingInvoice ? (
                        <div
                          className={cn(
                            "flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
                            insetPanelClassName
                          )}
                        >
                          <div className="min-w-0">
                            <p className={sectionLabelClassName}>Upcoming charge</p>
                            <p className="mt-2 text-heading-24 text-[var(--ds-gray-1000)]">
                              {formatCurrency(upcomingInvoice.amount, upcomingInvoice.currency)}
                            </p>
                            <p className={cn("mt-1", subtleTextClassName)}>
                              {upcomingInvoice.description} • Due {formatDate(upcomingInvoice.dueDate)}
                            </p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-700)]">
                            <Clock className="h-4 w-4 shrink-0" />
                          </div>
                        </div>
                      ) : null}

                      <div className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
                        <div className="hidden grid-cols-[minmax(0,1fr)_110px_120px_36px] items-center gap-4 border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3 text-label-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)] md:grid">
                          <span>Invoice</span>
                          <span>Status</span>
                          <span>Amount</span>
                          <span />
                        </div>

                        {invoices.length === 0 ? (
                          <div className="px-4 py-6 text-copy-14 text-[var(--ds-gray-900)]">
                            No invoices yet.
                          </div>
                        ) : (
                          <div className="divide-y divide-[var(--ds-gray-400)]">
                            {invoices.map((invoice) => (
                              <InvoiceRow key={invoice.id} invoice={invoice} />
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="flex items-center gap-1.5 text-copy-13 text-[var(--ds-gray-900)]">
                        <Shield className="h-3.5 w-3.5 shrink-0" />
                        Payments are processed by Paddle. SocialRaven does not store card details.
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

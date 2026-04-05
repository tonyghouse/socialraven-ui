import Link from "next/link";

import { PLANS } from "@/constants/plans";
import { PublicCard } from "@/components/public/public-layout";

const PAID_PLANS = PLANS.filter((plan) => !plan.type.endsWith("_TRIAL"));

function ctaClasses(isPrimary: boolean) {
  return isPrimary
    ? "inline-flex min-h-10 items-center justify-center rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--accent))]/90"
    : "inline-flex min-h-10 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--surface-raised))]";
}

export function PricingGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {PAID_PLANS.map((plan, index) => {
        const isAgencyCustom = plan.type === "AGENCY_CUSTOM";
        const ctaHref = isAgencyCustom
          ? "mailto:sales@socialraven.io?subject=Agency%20Plan%20Enquiry"
          : "/sign-up";
        const centeredLastRowClass =
          PAID_PLANS.length === 5 && index === 3
            ? "lg:col-span-2 lg:col-start-2"
            : PAID_PLANS.length === 5 && index === 4
              ? "lg:col-span-2 lg:col-start-4"
              : "lg:col-span-2";

        return (
          <PublicCard
            key={plan.type}
            className={`p-6 shadow-sm ${centeredLastRowClass} ${plan.popular ? "border-[hsl(var(--accent))]" : ""}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base leading-5 font-bold tracking-[-0.01em] text-[hsl(var(--foreground))]">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                  {plan.description}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium leading-4 ${
                  plan.popular
                    ? "border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                    : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]"
                }`}
              >
                {plan.popular ? "Recommended" : "Standard"}
              </span>
            </div>

            <div className="mt-6">
              {plan.customPricing ? (
                <p className="text-[1.75rem] leading-8 font-bold tracking-[-0.02em] text-[hsl(var(--foreground))]">
                  Custom pricing
                </p>
              ) : (
                <div className="flex items-end gap-2">
                  <span className="text-[1.75rem] leading-8 font-bold tracking-[-0.02em] text-[hsl(var(--foreground))]">
                    ${plan.price}
                  </span>
                  <span className="pb-1 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                    per month
                  </span>
                </div>
              )}
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link href={ctaHref} className={ctaClasses(Boolean(plan.popular))}>
                {isAgencyCustom ? "Contact sales" : "Start free trial"}
              </Link>
            </div>
          </PublicCard>
        );
      })}
    </div>
  );
}

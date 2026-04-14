import Link from "next/link";

import { PLANS } from "@/constants/plans";
import { PublicCard } from "@/components/public/public-layout";

const PAID_PLANS = PLANS.filter((plan) => !plan.type.endsWith("_TRIAL"));
const AGENCY_CUSTOM_PRICING_SHEET_HREF = "/downloads/agency-custom-pricing-sheet.pdf";

function ctaClasses(isPrimary: boolean) {
  return isPrimary
    ? "inline-flex min-h-10 items-center justify-center rounded-md bg-[#2A1D32] px-4 py-2 text-label-14 text-white transition-colors duration-150 hover:bg-[hsl(277_30%_10%)] dark:bg-[hsl(277_40%_50%)] dark:hover:bg-[hsl(277_44%_56%)]"
    : "inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-2 text-label-14 text-[var(--ds-gray-1000)] transition-colors duration-150 hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";
}

export function PricingGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {PAID_PLANS.map((plan, index) => {
        const isAgencyCustom = plan.type === "AGENCY_CUSTOM";
        const ctaHref = isAgencyCustom
          ? "mailto:team+sales@socialraven.io?subject=Agency%20Plan%20Enquiry"
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
            className={`p-6 shadow-none ${centeredLastRowClass} ${plan.popular ? "border-[hsl(277_38%_62%)] bg-[linear-gradient(180deg,var(--ds-background-100)_0%,hsl(277_55%_96%)_100%)] dark:border-[hsl(277_38%_38%)] dark:bg-[linear-gradient(180deg,var(--ds-background-100)_0%,hsl(277_30%_12%)_100%)]" : "bg-[var(--ds-background-100)]"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">
                  {plan.name}
                </h3>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
                  {plan.description}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-label-12 ${
                  plan.popular
                    ? "border-[hsl(277_40%_80%)] bg-[hsl(277_55%_96%)] text-[#2A1D32] dark:border-[hsl(277_32%_30%)] dark:bg-[hsl(277_30%_14%)] dark:text-[hsl(277_42%_60%)]"
                    : "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
                }`}
              >
                {plan.popular ? "Recommended" : "Standard"}
              </span>
            </div>

            <div className="mt-6">
              {plan.customPricing ? (
                <div className="space-y-1">
                  <p className="text-heading-32 text-[var(--ds-gray-1000)]">
                    $300+
                  </p>
                  <p className="text-copy-13 text-[var(--ds-gray-900)]">
                    includes 30 workspaces
                  </p>
                  <p className="text-copy-12 text-[#2A1D32] dark:text-[hsl(277_40%_56%)]">
                    $3 per additional workspace / month
                  </p>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <span className="text-heading-32 text-[var(--ds-gray-1000)]">
                    ${plan.price}
                  </span>
                  <span className="pb-1 text-copy-13 text-[var(--ds-gray-900)]">
                    per month
                  </span>
                </div>
              )}
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-copy-13 text-[var(--ds-gray-900)]">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#2A1D32] dark:bg-[hsl(277_40%_52%)]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-start gap-4">
              <Link href={ctaHref} className={ctaClasses(Boolean(plan.popular))}>
                {isAgencyCustom ? "Contact sales" : "Create trial workspace"}
              </Link>
              {isAgencyCustom ? (
                <a
                  href={AGENCY_CUSTOM_PRICING_SHEET_HREF}
                  className="inline-flex text-copy-13 text-[#2A1D32] underline underline-offset-2 transition-colors hover:text-[hsl(277_30%_10%)] dark:text-[hsl(277_40%_56%)] dark:hover:text-[hsl(277_44%_64%)]"
                >
                  Download pricing sheet
                </a>
              ) : null}
            </div>
          </PublicCard>
        );
      })}
    </div>
  );
}

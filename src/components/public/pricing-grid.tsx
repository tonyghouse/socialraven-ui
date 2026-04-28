import Link from "next/link";

import { PLANS } from "@/constants/plans";
import { PublicCard } from "@/components/public/public-layout";

const PAID_PLANS = PLANS.filter((plan) => !plan.type.endsWith("_TRIAL"));
const INFLUENCER_PLANS = PAID_PLANS.filter((plan) => plan.type.startsWith("INFLUENCER"));
const AGENCY_PLANS = PAID_PLANS.filter((plan) => plan.type.startsWith("AGENCY"));

function ctaClasses(isPrimary: boolean) {
  return isPrimary
    ? "inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--ds-blue-600)] px-4 py-2 text-label-14 text-white transition-colors duration-150 hover:bg-[var(--ds-blue-700)]"
    : "inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-2 text-label-14 text-[var(--ds-gray-1000)] transition-colors duration-150 hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";
}

function isUnlimitedSchedulingFeature(feature: string) {
  return feature.startsWith("Unlimited scheduled posts") || feature.startsWith("Unlimited scheduled posts per workspace");
}

function isXAllowanceFeature(feature: string) {
  return feature.includes("x.com");
}

function renderFeatureCopy(feature: string) {
  if (isUnlimitedSchedulingFeature(feature)) {
    return (
      <>
        <span className="pricing-shine-text font-semibold">Unlimited</span>
        {feature.slice("Unlimited".length)}
      </>
    );
  }

  return feature;
}

export function PricingGrid() {
  const renderPlanCard = (plan: typeof PAID_PLANS[number], className = "") => {
    const isAgencyCustom = plan.type === "AGENCY_CUSTOM";
    const ctaHref = isAgencyCustom
      ? "mailto:team+sales@socialraven.io?subject=Agency%20Plan%20Enquiry"
      : "/sign-up";

    return (
      <PublicCard
        key={plan.type}
        className={`p-6 shadow-none ${className} ${plan.popular ? "border-[var(--ds-blue-400)] bg-[linear-gradient(180deg,var(--ds-background-100)_0%,var(--ds-blue-100)_100%)]" : "bg-[var(--ds-background-100)]"}`}
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
                ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
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
              <p className="text-copy-12 text-[var(--ds-blue-700)]">
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
          {plan.features.map((feature) => {
            const unlimitedSchedulingFeature = isUnlimitedSchedulingFeature(feature);
            const xAllowanceFeature = isXAllowanceFeature(feature);

            return (
              <li
                key={feature}
                className={`flex items-start gap-3 ${
                  xAllowanceFeature
                    ? "text-copy-13 text-[var(--ds-gray-800)]"
                    : unlimitedSchedulingFeature
                      ? "text-copy-13 font-medium text-[var(--ds-gray-1000)]"
                      : "text-copy-13 text-[var(--ds-gray-900)]"
                }`}
              >
                <span
                  className={`rounded-full ${
                    unlimitedSchedulingFeature
                      ? "mt-1.5 h-1.5 w-1.5 bg-[var(--ds-blue-700)]"
                      : xAllowanceFeature
                        ? "mt-1.5 h-1.5 w-1.5 bg-[var(--ds-gray-500)]"
                        : "mt-1.5 h-1.5 w-1.5 bg-[var(--ds-blue-600)]"
                  }`}
                />
                <span>{renderFeatureCopy(feature)}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col items-start gap-4">
          <Link href={ctaHref} className={ctaClasses(Boolean(plan.popular))}>
            {isAgencyCustom ? "Contact sales" : "Create trial workspace"}
          </Link>
        </div>
      </PublicCard>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {INFLUENCER_PLANS.map((plan, index) =>
          renderPlanCard(
            plan,
            index === 0
              ? "lg:col-span-2 lg:col-start-2"
              : "lg:col-span-2 lg:col-start-4"
          )
        )}
        {AGENCY_PLANS.map((plan, index) =>
          renderPlanCard(
            plan,
            index === 0
              ? "lg:col-span-2 lg:col-start-1"
              : index === 1
                ? "lg:col-span-2 lg:col-start-3"
                : "lg:col-span-2 lg:col-start-5"
          )
        )}
      </div>

      <div className="px-1">
        <p className="text-copy-13 text-[var(--ds-gray-900)]">
          <span className="pricing-shine-text font-semibold">Unlimited</span> scheduling across supported platforms.
        </p>
        <p className="mt-1 text-copy-12 text-[var(--ds-gray-700)]">
          Every plan includes an x.com monthly allowance, and extra x.com volume is available with an add-on.
        </p>
      </div>
    </div>
  );
}

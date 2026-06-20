import Link from "next/link";
import { Check } from "@vibe/icons";
import type { CSSProperties } from "react";

import { PLAN_ICONS, PLANS } from "@/constants/plans";
import { PublicCard } from "@/components/public/public-layout";
import { PublicLozenge } from "@/components/public/public-site-primitives";
import { cn } from "@/lib/utils";

export type PricingMode = "influencer" | "agency";

type PricingModeStyle = CSSProperties & {
  "--pricing-mode-accent": string;
  "--pricing-mode-soft": string;
};

const MODE_STYLES: Record<PricingMode, PricingModeStyle> = {
  influencer: {
    "--pricing-mode-accent": "var(--primary-color)",
    "--pricing-mode-soft":
      "color-mix(in srgb, var(--primary-color) 6%, var(--primary-background-color))",
  },
  agency: {
    "--pricing-mode-accent": "var(--color-aquamarine)",
    "--pricing-mode-soft":
      "color-mix(in srgb, var(--color-aquamarine) 7%, var(--primary-background-color))",
  },
};

const PAID_PLANS = PLANS.filter((plan) => !plan.type.endsWith("_TRIAL"));

function ctaClasses(isPrimary: boolean) {
  return isPrimary
    ? "inline-flex min-h-10 items-center justify-center rounded-[0.875rem] border border-[var(--primary-color)] bg-[var(--primary-color)] px-4 py-2 text-label-14 text-white transition-colors duration-150 hover:border-[var(--primary-hover-color)] hover:bg-[var(--primary-hover-color)]"
    : "inline-flex min-h-10 items-center justify-center rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-4 py-2 text-label-14 text-[var(--primary-text-color)] transition-colors duration-150 hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)]";
}

function isUnlimitedSchedulingFeature(feature: string) {
  return (
    feature.startsWith("Unlimited scheduled posts") ||
    feature.startsWith("Unlimited scheduled posts per workspace")
  );
}

function isXAllowanceFeature(feature: string) {
  return feature.includes("x.com");
}

function renderFeatureCopy(feature: string) {
  if (isUnlimitedSchedulingFeature(feature)) {
    return (
      <>
        <span className="font-semibold text-[var(--primary-text-color)]">Unlimited</span>
        {feature.slice("Unlimited".length)}
      </>
    );
  }

  return feature;
}

export function PricingGrid({ mode }: { mode?: PricingMode }) {
  if (!mode) {
    return (
      <div className="space-y-6">
        <PricingGrid mode="influencer" />
        <PricingGrid mode="agency" />
      </div>
    );
  }

  const plans = PAID_PLANS.filter((plan) =>
    mode === "influencer"
      ? plan.type.startsWith("INFLUENCER")
      : plan.type.startsWith("AGENCY"),
  );
  const modeLabel = mode === "influencer" ? "Influencer" : "Agency";
  const modeStyle = MODE_STYLES[mode];

  return (
    <div
      className={cn(
        "grid gap-5",
        mode === "influencer"
          ? "mx-auto max-w-5xl md:grid-cols-2"
          : "md:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {plans.map((plan) => {
        const Icon = PLAN_ICONS[plan.type];
        const isAgencyCustom = plan.type === "AGENCY_CUSTOM";
        const ctaHref = isAgencyCustom
          ? "mailto:team+sales@socialraven.io?subject=Agency%20Plan%20Enquiry"
          : "/sign-up";

        return (
          <PublicCard
            key={plan.type}
            className={cn(
              "card-hover h-full min-w-0 overflow-hidden p-0 shadow-none",
              plan.popular && "border-[var(--primary-color)]",
            )}
            style={modeStyle}
          >
            <div className="flex h-full min-w-0 flex-col">
              <div className="flex items-start justify-between gap-4 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4 md:px-6">
                <div className="flex min-w-0 items-start gap-3.5">
                  <span className="mt-1 h-9 w-0.5 shrink-0 rounded-full bg-[var(--pricing-mode-accent)] opacity-60" />
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-[var(--ui-border-color)] bg-[var(--pricing-mode-soft)] text-[var(--pricing-mode-accent)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-label-12 uppercase tracking-[0.1em] text-[var(--secondary-text-color)]">
                      {modeLabel} plan
                    </p>
                    <h3 className="text-heading-16 text-[var(--primary-text-color)] [overflow-wrap:anywhere]">
                      {plan.name}
                    </h3>
                  </div>
                </div>
                <PublicLozenge appearance={plan.popular ? "information" : "default"}>
                  {plan.popular ? "Recommended" : "Standard"}
                </PublicLozenge>
              </div>

              <div className="flex flex-1 flex-col px-5 py-5 md:px-6 md:py-6">
                <p className="min-h-10 text-copy-14 text-[var(--secondary-text-color)]">
                  {plan.description}
                </p>

                <div className="mt-5 min-h-[4.75rem]">
                  {plan.customPricing ? (
                    <div className="space-y-1">
                      <p className="text-heading-32 text-[var(--primary-text-color)]">$300+</p>
                      <p className="text-copy-13 text-[var(--secondary-text-color)]">
                        includes 30 workspaces
                      </p>
                      <p className="text-copy-12 text-[var(--secondary-text-color)]">
                        $3 per additional workspace / month
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <span className="text-heading-32 text-[var(--primary-text-color)]">
                        ${plan.price}
                      </span>
                      <span className="pb-1 text-copy-13 text-[var(--secondary-text-color)]">
                        per month
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={ctaHref}
                  className={cn(ctaClasses(Boolean(plan.popular)), "mt-5 w-full")}
                >
                  {isAgencyCustom ? "Contact sales" : "Create trial workspace"}
                </Link>

                <div className="mt-6 border-t border-[var(--ui-border-color)] pt-5">
                  <p className="mb-4 text-label-12 uppercase tracking-[0.1em] text-[var(--secondary-text-color)]">
                    Plan includes
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => {
                      const unlimitedSchedulingFeature = isUnlimitedSchedulingFeature(feature);
                      const xAllowanceFeature = isXAllowanceFeature(feature);

                      return (
                        <li
                          key={feature}
                          className={cn(
                            "flex min-w-0 items-start gap-2.5 text-copy-13",
                            unlimitedSchedulingFeature
                              ? "font-medium text-[var(--primary-text-color)]"
                              : "text-[var(--secondary-text-color)]",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-[var(--primary-background-color)]",
                              xAllowanceFeature
                                ? "border-[var(--ui-border-color)] text-[var(--placeholder-color)]"
                                : "border-[var(--ui-border-color)] text-[var(--pricing-mode-accent)]",
                            )}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                          <span className="[overflow-wrap:anywhere]">
                            {renderFeatureCopy(feature)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </PublicCard>
        );
      })}
    </div>
  );
}

import { Board, Check, Security, Time } from "@vibe/icons";
import type { ComponentType } from "react";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LIVE_PLATFORM_COUNT,
} from "@/components/landing-page/landing-page-constants";

type StatItem = {
  Icon: ComponentType<{ className?: string }>;
  value: string;
  unit?: string;
  label: string;
  detail: string;
  railClassName: string;
  tileClassName: string;
};

const STAT_ITEMS: StatItem[] = [
  {
    Icon: Board,
    value: String(LIVE_PLATFORM_COUNT),
    label: "Live platforms",
    detail: "Ready to connect",
    railClassName: "bg-[var(--primary-color)]",
    tileClassName:
      "bg-[color-mix(in_srgb,var(--primary-color)_12%,var(--primary-background-color))] text-[var(--primary-color)]",
  },
  {
    Icon: Time,
    value: "14",
    unit: "days",
    label: "Free trial",
    detail: "No card required",
    railClassName: "bg-[var(--color-working_orange)]",
    tileClassName:
      "bg-[color-mix(in_srgb,var(--color-working_orange)_16%,var(--primary-background-color))] text-[var(--color-dark-orange)]",
  },
  {
    Icon: Security,
    value: "OAuth",
    label: "Secure connections",
    detail: "Official API access",
    railClassName: "bg-[var(--color-done-green)]",
    tileClassName:
      "bg-[color-mix(in_srgb,var(--color-done-green)_14%,var(--primary-background-color))] text-[var(--positive-color)]",
  },
];

const WORKFLOW_STEPS = ["Plan", "Review", "Publish"] as const;

export function LandingPageStatsBarSection() {
  return (
    <section
      aria-labelledby="landing-stats-title"
      className="border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] py-6 sm:py-8"
    >
      <div className={LANDING_PAGE_CONTAINER_CLASS}>
        <div className="overflow-hidden rounded-[1.25rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] shadow-[0_0.75rem_2rem_rgba(41,47,76,0.08)] dark:shadow-[0_0.75rem_2rem_rgba(0,0,0,0.26)]">
          <div className="grid lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,2.1fr)]">
            <div className="flex min-h-[8.75rem] flex-col justify-between gap-5 border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] p-5 sm:p-6 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.75rem] bg-[var(--primary-selected-color)] text-[var(--primary-color)]">
                  <Check className="h-[1.125rem] w-[1.125rem]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.8125rem] font-semibold leading-5 text-[var(--secondary-text-color)]">
                    Launch workspace
                  </p>
                  <h2
                    id="landing-stats-title"
                    className="font-[var(--font-vibe-title)] text-[1.25rem] font-semibold leading-[1.4] tracking-normal text-[var(--primary-text-color)]"
                  >
                    SocialRaven at a glance
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {WORKFLOW_STEPS.map((step) => (
                  <span
                    key={step}
                    className="inline-flex h-7 items-center rounded-full border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-3 text-[0.75rem] font-semibold leading-none text-[var(--secondary-text-color)]"
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>

            <dl className="grid sm:grid-cols-3">
              {STAT_ITEMS.map(
                (
                  {
                    Icon,
                    value,
                    unit,
                    label,
                    detail,
                    railClassName,
                    tileClassName,
                  },
                  index,
                ) => (
                  <div
                    key={label}
                    className={`relative min-h-[9.25rem] p-5 sm:p-6 ${
                      index < STAT_ITEMS.length - 1
                        ? "border-b border-[var(--layout-border-color)] sm:border-b-0 sm:border-r"
                        : ""
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-6 h-11 w-1 rounded-r-full ${railClassName}`}
                      aria-hidden="true"
                    />
                    <div className="flex h-full flex-col justify-between gap-5 pl-2">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-[0.8125rem] font-semibold leading-5 text-[var(--secondary-text-color)]">
                          {label}
                        </dt>
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.75rem] ${tileClassName}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>

                      <div>
                        <dd className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 font-[var(--font-vibe-title)] text-[2rem] font-semibold leading-none tracking-normal text-[var(--primary-text-color)]">
                          {value}
                          {unit && (
                            <span className="text-[0.875rem] font-semibold leading-5 text-[var(--secondary-text-color)]">
                              {unit}
                            </span>
                          )}
                        </dd>
                        <p className="mt-2 text-[0.8125rem] leading-5 text-[var(--secondary-text-color)]">
                          {detail}
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Globe } from "lucide-react";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
  LIVE_PLATFORM_COUNT,
  PLATFORMS,
} from "@/components/landing-page/landing-page-constants";
import { LandingPageLabel } from "@/components/landing-page/landing-page-label";

export function LandingPagePlatformHubSection() {
  return (
    <section className="border-y border-[var(--ds-gray-200)] bg-white py-24 dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-200)]">
      <div className={LANDING_PAGE_CONTAINER_CLASS}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={LANDING_PAGE_VIEWPORT}
          variants={LANDING_PAGE_STAGGER_VARIANT}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <motion.div variants={LANDING_PAGE_FADE_VARIANT}>
            <LandingPageLabel>Integrations</LandingPageLabel>
          </motion.div>
          <motion.h2
            variants={LANDING_PAGE_FADE_VARIANT}
            className="mt-4 text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]"
          >
            Every platform.
            <br />
            One clean workflow.
          </motion.h2>
          <motion.p
            variants={LANDING_PAGE_FADE_VARIANT}
            className="mt-3 text-[1rem] leading-[1.7] text-[var(--ds-gray-700)]"
          >
            The same interface across every connected channel.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={LANDING_PAGE_VIEWPORT}
          variants={LANDING_PAGE_STAGGER_VARIANT}
          className="mx-auto max-w-[72rem]"
        >
          <div className="overflow-hidden rounded-[2rem] border border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] shadow-[0_16px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[var(--ds-background-100)]">
            <div className="flex flex-col gap-3 border-b border-[var(--ds-gray-200)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--ds-gray-200)] bg-white dark:border-white/10 dark:bg-white/[0.05]">
                  <Globe className="h-5 w-5 text-[var(--ds-gray-700)] dark:text-white/70" />
                </div>
                <div>
                  <p className="text-[1rem] font-semibold tracking-[-0.02em] text-[var(--ds-gray-1000)]">
                    Connected platforms
                  </p>
                  <p className="mt-1 text-[0.75rem] text-[var(--ds-gray-500)]">Everything lives in the same publishing flow.</p>
                </div>
              </div>

              <p className="text-[0.75rem] font-medium text-[var(--ds-gray-500)] sm:self-auto">{LIVE_PLATFORM_COUNT} platforms</p>
            </div>

            <div className="p-5">
              <div className="flex flex-wrap items-stretch justify-center gap-3 lg:flex-nowrap lg:justify-between">
                {PLATFORMS.map(({ Icon, name, color, bg, soon }) => (
                  <motion.div
                    key={name}
                    variants={LANDING_PAGE_FADE_VARIANT}
                    className={`flex min-w-[8.25rem] items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors duration-150 lg:min-w-0 lg:flex-1 ${
                      soon
                        ? "border-[var(--ds-gray-200)] bg-[var(--ds-gray-100)] opacity-60 dark:border-white/10 dark:bg-white/[0.03]"
                        : "border-[var(--ds-gray-200)] bg-white hover:bg-[var(--ds-gray-100)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
                    }`}
                    aria-label={soon ? `${name} coming soon` : `${name} integration`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                      <Icon className={`h-[1.125rem] w-[1.125rem] ${color}`} />
                    </div>
                    <p className="min-w-0 text-[0.875rem] font-semibold tracking-[-0.02em] text-[var(--ds-gray-1000)]">
                      {name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

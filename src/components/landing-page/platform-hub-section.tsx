import { motion } from "framer-motion";
import { Globe } from "lucide-react";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
  PLATFORMS,
} from "@/components/landing-page/landing-page-constants";
import { LandingPageLabel } from "@/components/landing-page/landing-page-label";

export function LandingPagePlatformHubSection() {
  return (
    <section className="border-y border-[var(--ds-gray-200)] bg-white py-24 dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-200)]">
      <div className={LANDING_PAGE_CONTAINER_CLASS}>
        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT} className="mb-14 flex flex-col items-center text-center">
          <motion.div variants={LANDING_PAGE_FADE_VARIANT}><LandingPageLabel>Integrations</LandingPageLabel></motion.div>
          <motion.h2 variants={LANDING_PAGE_FADE_VARIANT} className="mt-4 max-w-xl text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
            Publish to every platform that matters.
          </motion.h2>
          <motion.p variants={LANDING_PAGE_FADE_VARIANT} className="mt-3 max-w-lg text-[1rem] leading-[1.7] text-[var(--ds-gray-700)]">
            One workflow, all major platforms.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT} className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[hsl(212_86%_48%)] bg-white shadow-[0_0_0_8px_hsl(212_86%_48%/0.08)] dark:bg-[var(--ds-background-100)]">
            <Globe className="h-7 w-7 text-[hsl(212_86%_48%)]" />
          </div>

          <div className="relative h-10 w-px overflow-hidden bg-[var(--ds-gray-200)] dark:bg-white/[0.08]">
            <div className="fiber-v absolute inset-x-0 h-[50%] bg-gradient-to-b from-transparent via-[hsl(212_86%_58%)] to-transparent" />
          </div>

          <div className="w-full">
            <div className="relative mx-[calc((100%-1.5rem)/14)] h-px overflow-hidden bg-[var(--ds-gray-200)] sm:mx-[calc((100%-3rem)/14)] md:mx-[calc((100%-4.5rem)/14)] dark:bg-white/[0.08]">
              <div className="fiber-h absolute inset-y-0 left-1/2 w-full bg-gradient-to-r from-transparent via-[hsl(212_86%_58%)] to-transparent" />
            </div>

            <div className="grid grid-cols-7 gap-1 pt-2 sm:gap-2 md:gap-3">
              {PLATFORMS.map(({ Icon, name, color, bg, soon }, i) => (
                <div key={name} className="flex flex-col items-center">
                  <div className="relative h-4 w-px overflow-hidden bg-[var(--ds-gray-200)] dark:bg-white/[0.08] md:h-8">
                    <div
                      className="fiber-v absolute inset-x-0 h-[50%] bg-gradient-to-b from-transparent via-[hsl(212_86%_58%)] to-transparent"
                      style={{ animationDelay: `${i * 0.22}s` }}
                    />
                  </div>

                  <motion.div
                    variants={LANDING_PAGE_FADE_VARIANT}
                    className={`group flex aspect-square w-full items-center justify-center rounded-xl border p-1 transition-all duration-200 md:aspect-auto md:flex-col md:gap-3 md:rounded-2xl md:p-5 ${
                      soon
                        ? "border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] opacity-50 dark:bg-white/[0.02]"
                        : "border-[var(--ds-gray-200)] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] dark:bg-[var(--ds-background-100)]"
                    }`}
                    aria-label={soon ? `${name} coming soon` : name}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded-md md:h-11 md:w-11 md:rounded-xl ${bg}`}>
                      <Icon className={`h-3 w-3 md:h-5 md:w-5 ${color}`} />
                    </div>
                    <div className="hidden text-center md:block">
                      <p className={`text-[0.6875rem] font-semibold ${soon ? "text-[var(--ds-gray-400)]" : "text-[var(--ds-gray-900)]"}`}>{name}</p>
                      {soon && <p className="mt-0.5 text-[0.5625rem] font-medium text-[var(--ds-gray-400)]">Soon</p>}
                    </div>
                    <span className="sr-only">{soon ? `${name} coming soon` : name}</span>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

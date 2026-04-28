import { motion } from "framer-motion";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
  STEPS,
} from "@/components/landing-page/landing-page-constants";
import { LandingPageLabel } from "@/components/landing-page/landing-page-label";

export function LandingPageHowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className={LANDING_PAGE_CONTAINER_CLASS}>
        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT} className="mb-14 flex flex-col items-center text-center">
          <motion.div variants={LANDING_PAGE_FADE_VARIANT}><LandingPageLabel>How it works</LandingPageLabel></motion.div>
          <motion.h2 variants={LANDING_PAGE_FADE_VARIANT} className="mt-4 max-w-xl text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
            Up and running in minutes.
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT} className="relative grid gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[calc((100%-3rem)/6)] top-8 hidden h-px w-[calc((200%+3rem)/3)] border-t-2 border-dashed border-[var(--ds-gray-300)] md:block" aria-hidden="true" />
          {STEPS.map(({ n, Icon, title, body }) => (
            <motion.div key={n} variants={LANDING_PAGE_FADE_VARIANT} className="flex flex-col items-center text-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--ds-gray-200)] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-[var(--ds-background-100)]">
                <Icon className="h-6 w-6 text-[hsl(212_86%_48%)]" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(212_86%_48%)] text-[0.5625rem] font-bold text-white">{n}</span>
              </div>
              <h3 className="mt-5 text-[1.0625rem] font-bold tracking-[-0.02em] text-[var(--ds-gray-1000)]">{title}</h3>
              <p className="mt-2 text-[0.875rem] leading-[1.65] text-[var(--ds-gray-700)]">{body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

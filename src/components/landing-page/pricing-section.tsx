import { motion } from "framer-motion";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
} from "@/components/landing-page/landing-page-constants";
import { LandingPageLabel } from "@/components/landing-page/landing-page-label";
import { PricingGrid } from "@/components/public/pricing-grid";

export function LandingPagePricingSection() {
  return (
    <section id="pricing" className="border-y border-[var(--ds-gray-200)] bg-white py-24 dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-200)]">
      <div className={LANDING_PAGE_CONTAINER_CLASS}>
        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT} className="mb-14">
          <motion.div variants={LANDING_PAGE_FADE_VARIANT}><LandingPageLabel>Pricing</LandingPageLabel></motion.div>
          <motion.h2 variants={LANDING_PAGE_FADE_VARIANT} className="mt-4 max-w-xl text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
            Unlimited scheduling. Clear pricing.
          </motion.h2>
          <motion.p variants={LANDING_PAGE_FADE_VARIANT} className="mt-3 text-[1rem] text-[var(--ds-gray-700)]">
            Start free for 14 days. Unlimited scheduling is included across supported platforms, with a separate x.com monthly allowance on each plan.
          </motion.p>
        </motion.div>
        <PricingGrid />
      </div>
    </section>
  );
}

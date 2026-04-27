import { motion } from "framer-motion";

import {
  FEATURES,
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
} from "@/components/landing-page/landing-page-constants";
import { LandingPageLabel } from "@/components/landing-page/landing-page-label";

export function LandingPageFeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className={LANDING_PAGE_CONTAINER_CLASS}>
        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT} className="mb-14">
          <motion.div variants={LANDING_PAGE_FADE_VARIANT}><LandingPageLabel>Features</LandingPageLabel></motion.div>
          <motion.h2 variants={LANDING_PAGE_FADE_VARIANT} className="mt-4 max-w-2xl text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
            Everything you need to run<br />your social presence.
          </motion.h2>
          <motion.p variants={LANDING_PAGE_FADE_VARIANT} className="mt-3 max-w-lg text-[1rem] leading-[1.7] text-[var(--ds-gray-700)]">
            One clean interface. No tab juggling. No copy-pasting captions across platforms.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map(({ Icon, tag, title, description, iconCls, mockBg }) => (
            <motion.div
              key={title}
              variants={LANDING_PAGE_FADE_VARIANT}
              className="group overflow-hidden rounded-2xl border border-[var(--ds-gray-200)] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-100)]"
            >
              <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${mockBg}`}>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${iconCls}`}>
                  <Icon className="h-7 w-7" />
                </div>
              </div>
              <div className="p-6">
                <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[var(--ds-gray-500)]">{tag}</p>
                <h3 className="text-[1.0625rem] font-bold tracking-[-0.02em] text-[var(--ds-gray-1000)]">{title}</h3>
                <p className="mt-2 text-[0.875rem] leading-[1.65] text-[var(--ds-gray-700)]">{description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

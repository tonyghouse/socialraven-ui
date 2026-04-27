import { motion } from "framer-motion";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
  TESTIMONIALS,
} from "@/components/landing-page/landing-page-constants";
import { LandingPageLabel } from "@/components/landing-page/landing-page-label";

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5 fill-amber-400" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.172c.969 0 1.371 1.24.588 1.81l-3.374 2.452a1 1 0 00-.364 1.118l1.287 3.967c.3.922-.755 1.688-1.54 1.118L10 14.347l-3.957 2.872c-.784.57-1.838-.196-1.539-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.054 9.394c-.783-.57-.38-1.81.588-1.81h4.172a1 1 0 00.95-.69l1.285-3.967z" />
        </svg>
      ))}
    </div>
  );
}

export function LandingPageTestimonialsSection() {
  return (
    <section className="py-24">
      <div className={LANDING_PAGE_CONTAINER_CLASS}>
        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT} className="mb-14 flex flex-col items-center text-center">
          <motion.div variants={LANDING_PAGE_FADE_VARIANT}><LandingPageLabel>Testimonials</LandingPageLabel></motion.div>
          <motion.h2 variants={LANDING_PAGE_FADE_VARIANT} className="mt-4 max-w-xl text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
            Trusted by teams that publish every day.
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT}>
          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <motion.div key={t.name} variants={LANDING_PAGE_FADE_VARIANT} className="flex flex-col rounded-2xl border border-[var(--ds-gray-200)] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-100)]">
                <Stars />
                <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-[1.65] text-[var(--ds-gray-800)]">&ldquo;{t.quote}&rdquo;</blockquote>
                <div className="mt-5 flex items-center gap-3 border-t border-[var(--ds-gray-100)] pt-5 dark:border-[var(--ds-gray-400)]">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold ${t.avatarBg}`}>{t.initials}</div>
                  <div>
                    <p className="text-[0.875rem] font-semibold text-[var(--ds-gray-1000)]">{t.name}</p>
                    <p className="text-[0.75rem] text-[var(--ds-gray-500)]">{t.role} · {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {TESTIMONIALS.slice(3, 5).map((t) => (
              <motion.div key={t.name} variants={LANDING_PAGE_FADE_VARIANT} className="flex flex-col rounded-2xl border border-[var(--ds-gray-200)] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-100)]">
                <Stars />
                <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-[1.65] text-[var(--ds-gray-800)]">&ldquo;{t.quote}&rdquo;</blockquote>
                <div className="mt-5 flex items-center gap-3 border-t border-[var(--ds-gray-100)] pt-5 dark:border-[var(--ds-gray-400)]">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold ${t.avatarBg}`}>{t.initials}</div>
                  <div>
                    <p className="text-[0.875rem] font-semibold text-[var(--ds-gray-1000)]">{t.name}</p>
                    <p className="text-[0.75rem] text-[var(--ds-gray-500)]">{t.role} · {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

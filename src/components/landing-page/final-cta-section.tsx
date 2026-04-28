import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import {
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
} from "@/components/landing-page/landing-page-constants";

export function LandingPageFinalCtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-[var(--ds-gray-200)] bg-white py-32 dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-200)]">
      <div className="pointer-events-none absolute inset-0 dark:hidden" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 120%, hsl(212 86% 82% / 0.22) 0%, transparent 60%)" }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 120%, hsl(212 86% 54% / 0.12) 0%, transparent 60%)" }} aria-hidden="true" />

      <div className="relative">
        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT} className="flex flex-col items-center text-center">
          <motion.h2 variants={LANDING_PAGE_FADE_VARIANT} className="text-[clamp(2.5rem,6.5vw,5rem)] font-black leading-[0.92] tracking-[-0.048em] text-[var(--ds-gray-1000)]">
            Ready to take control of<br />your <span className="gradient-text">social presence?</span>
          </motion.h2>
          <motion.p variants={LANDING_PAGE_FADE_VARIANT} className="mt-6 max-w-lg text-[1.0625rem] leading-[1.7] text-[var(--ds-gray-700)]">
            Start your free 14-day trial. No credit card required. Just clean, professional social publishing — from one workspace.
          </motion.p>
          <motion.div variants={LANDING_PAGE_FADE_VARIANT} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-[hsl(212_86%_48%)] px-8 text-[0.9375rem] font-semibold text-white shadow-[0_4px_16px_hsl(212_86%_48%/0.38)] transition-all duration-150 hover:bg-[hsl(212_86%_43%)] hover:shadow-[0_6px_24px_hsl(212_86%_48%/0.48)]"
            >
              Start for free — no card needed
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center rounded-xl border border-[var(--ds-gray-300)] bg-white px-8 text-[0.9375rem] font-medium text-[var(--ds-gray-900)] transition-all duration-150 hover:border-[var(--ds-gray-400)] hover:shadow-sm dark:bg-white/5 dark:hover:bg-white/10"
            >
              View pricing
            </Link>
          </motion.div>
          <motion.div variants={LANDING_PAGE_FADE_VARIANT} className="mt-6 flex flex-wrap items-center justify-center gap-5 text-[0.8125rem] text-[var(--ds-gray-600)]">
            {["No credit card required", "GDPR-conscious", "OAuth-secured", "Cancel anytime"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
  PERSONAS,
} from "@/components/landing-page/landing-page-constants";
import { LandingPageLabel } from "@/components/landing-page/landing-page-label";

export function LandingPagePersonasSection() {
  return (
    <section id="solutions" className="border-y border-[var(--ds-gray-200)] bg-white py-24 dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-200)]">
      <div className={LANDING_PAGE_CONTAINER_CLASS}>
        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT} className="mb-14">
          <motion.div variants={LANDING_PAGE_FADE_VARIANT}><LandingPageLabel>Who it&apos;s for</LandingPageLabel></motion.div>
          <motion.h2 variants={LANDING_PAGE_FADE_VARIANT} className="mt-4 max-w-xl text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
            Different workflows, one platform.
          </motion.h2>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT} className="grid gap-4 lg:grid-cols-2">
          {PERSONAS.map((p) => (
            <motion.div
              key={p.tag}
              variants={LANDING_PAGE_FADE_VARIANT}
              className={`flex flex-col rounded-2xl border border-[var(--ds-gray-200)] bg-white p-7 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] dark:bg-[var(--ds-background-100)] ${p.accent}`}
            >
              <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold ${p.chip}`}>{p.tag}</span>
              <h3 className="mt-5 text-[1.25rem] font-bold leading-[1.2] tracking-[-0.025em] text-[var(--ds-gray-1000)]">{p.headline}</h3>
              <p className="mt-3 text-[0.875rem] leading-[1.65] text-[var(--ds-gray-700)]">{p.body}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2.5 text-[0.875rem] text-[var(--ds-gray-800)]">
                    <Check className={`h-3.5 w-3.5 shrink-0 ${p.checkCls}`} />
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="mt-8 border-t border-[var(--ds-gray-100)] pt-6 dark:border-[var(--ds-gray-400)]">
                <Link href="/sign-up" className={`text-[0.875rem] font-semibold transition-colors ${p.link}`}>
                  Start free trial →
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

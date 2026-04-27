"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  FAQ_ITEMS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
} from "@/components/landing-page/landing-page-constants";
import { LandingPageLabel } from "@/components/landing-page/landing-page-label";

export function LandingPageFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-3xl px-6 md:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT} className="mb-12">
          <motion.div variants={LANDING_PAGE_FADE_VARIANT}><LandingPageLabel>FAQ</LandingPageLabel></motion.div>
          <motion.h2 variants={LANDING_PAGE_FADE_VARIANT} className="mt-4 text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
            Common questions.
          </motion.h2>
        </motion.div>
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="border-b border-[var(--ds-gray-200)] last:border-b-0 dark:border-[var(--ds-gray-400)]">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none"
                aria-expanded={openFaq === i}
              >
                <span className="text-[0.9375rem] font-semibold text-[var(--ds-gray-1000)]">{item.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--ds-gray-500)] transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="pb-5 text-[0.9375rem] leading-[1.65] text-[var(--ds-gray-700)]">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

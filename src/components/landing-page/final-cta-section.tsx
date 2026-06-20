"use client";

import { Check, NavigationChevronRight } from "@vibe/icons";
import { motion } from "framer-motion";
import Link from "next/link";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
} from "@/components/landing-page/landing-page-constants";

const TRIAL_DETAILS = [
  "No credit card required",
  "GDPR-conscious",
  "OAuth-secured",
  "Cancel anytime",
] as const;

export function LandingPageFinalCtaSection() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] py-16 sm:py-20"
    >
      <div className={`${LANDING_PAGE_CONTAINER_CLASS} box-border`}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={LANDING_PAGE_VIEWPORT}
          variants={LANDING_PAGE_STAGGER_VARIANT}
          className="relative min-w-0 overflow-hidden rounded-[1.25rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] shadow-[0_1rem_2.5rem_rgba(41,47,76,0.09)] dark:shadow-[0_1rem_2.5rem_rgba(0,0,0,0.28)]"
        >
          <span
            className="absolute inset-x-0 top-0 z-10 h-1 bg-[var(--primary-color)]"
            aria-hidden="true"
          />

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.65fr)]">
            <div className="p-6 pt-9 sm:p-10 sm:pt-12 lg:p-12 lg:pt-14 xl:p-14 xl:pt-16">
              <motion.h2
                id="final-cta-title"
                variants={LANDING_PAGE_FADE_VARIANT}
                className="max-w-4xl font-[var(--font-vibe-title)] text-[2.25rem] font-bold leading-[1.08] tracking-normal text-[var(--primary-text-color)] sm:text-[2.75rem] lg:text-[3.25rem]"
              >
                Ready to take control of your{" "}
                <span className="text-[var(--primary-color)]">
                  social presence?
                </span>
              </motion.h2>

              <motion.p
                variants={LANDING_PAGE_FADE_VARIANT}
                className="mt-5 max-w-2xl text-[1rem] leading-7 text-[var(--secondary-text-color)] sm:text-[1.0625rem]"
              >
                Start your free 14-day trial. No credit card required. Just
                clean, professional social publishing — from one workspace.
              </motion.p>

              <motion.div
                variants={LANDING_PAGE_FADE_VARIANT}
                className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
              >
                <Link
                  href="/sign-up"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[0.875rem] border border-[var(--primary-color)] bg-[var(--primary-color)] px-4 text-[0.875rem] font-semibold text-white transition-colors hover:border-[var(--primary-hover-color)] hover:bg-[var(--primary-hover-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary-background-color)] sm:w-auto sm:px-6 sm:text-[0.9375rem]"
                >
                  Start for free — no card needed
                  <NavigationChevronRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-6 text-[0.9375rem] font-semibold text-[var(--primary-text-color)] transition-colors hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary-background-color)] sm:w-auto"
                >
                  View pricing
                </Link>
              </motion.div>
            </div>

            <motion.aside
              variants={LANDING_PAGE_FADE_VARIANT}
              aria-label="Trial details"
              className="border-t border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10"
            >
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
                Trial details
              </p>

              <ul className="mt-5 overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)]">
                {TRIAL_DETAILS.map((detail, index) => (
                  <li
                    key={detail}
                    className={`flex min-h-14 items-center gap-3 px-4 py-3 text-[0.8125rem] font-semibold text-[var(--primary-text-color)] ${
                      index < TRIAL_DETAILS.length - 1
                        ? "border-b border-[var(--layout-border-color)]"
                        : ""
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.625rem] bg-[var(--primary-selected-color)] text-[var(--primary-color)]">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.aside>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

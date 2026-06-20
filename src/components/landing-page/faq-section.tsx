"use client";

import { Accordion, AccordionItem } from "@vibe/core";
import { Email, Help, NavigationChevronRight } from "@vibe/icons";
import { motion } from "framer-motion";
import Link from "next/link";

import {
  FAQ_ITEMS,
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
} from "@/components/landing-page/landing-page-constants";
import { LandingPageLabel } from "@/components/landing-page/landing-page-label";

export function LandingPageFaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-b border-[var(--layout-border-color)] bg-[var(--primary-background-color)] py-20 sm:py-24"
    >
      <div className={`${LANDING_PAGE_CONTAINER_CLASS} box-border`}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={LANDING_PAGE_VIEWPORT}
          variants={LANDING_PAGE_STAGGER_VARIANT}
          className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16 xl:gap-24"
        >
          <div className="lg:pt-3">
            <motion.div variants={LANDING_PAGE_FADE_VARIANT}>
              <LandingPageLabel>FAQ</LandingPageLabel>
            </motion.div>

            <motion.h2
              id="faq-title"
              variants={LANDING_PAGE_FADE_VARIANT}
              className="mt-4 max-w-xl font-[var(--font-vibe-title)] text-[2.25rem] font-bold leading-[1.08] tracking-normal text-[var(--primary-text-color)] sm:text-[2.75rem] lg:text-[3.125rem]"
            >
              Answers, without the runaround.
            </motion.h2>

            <motion.p
              variants={LANDING_PAGE_FADE_VARIANT}
              className="mt-5 max-w-md text-[1rem] leading-7 text-[var(--secondary-text-color)]"
            >
              The essentials on trials, supported channels, security, and
              managing client work in SocialRaven.
            </motion.p>

            <motion.div
              variants={LANDING_PAGE_FADE_VARIANT}
              className="mt-8 max-w-md overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)]"
            >
              <div className="flex items-start gap-4 p-5 sm:p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.75rem] bg-[var(--primary-selected-color)] text-[var(--primary-color)]">
                  <Email className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[0.9375rem] font-semibold text-[var(--primary-text-color)]">
                    Need a more specific answer?
                  </h3>
                  <p className="mt-1 text-[0.8125rem] leading-5 text-[var(--secondary-text-color)]">
                    Tell us about your workflow and our team will point you in
                    the right direction.
                  </p>
                </div>
              </div>
              <Link
                href="/contact"
                className="flex items-center justify-between gap-3 border-t border-[var(--layout-border-color)] bg-[var(--primary-background-color)] px-5 py-3.5 text-[0.8125rem] font-semibold text-[var(--primary-color)] transition-colors hover:bg-[var(--primary-highlighted-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary-color)] sm:px-6"
              >
                Contact our team
                <NavigationChevronRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          </div>

          <motion.div
            variants={LANDING_PAGE_FADE_VARIANT}
            className="min-w-0 overflow-hidden rounded-[1.25rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] shadow-[0_0.75rem_2rem_rgba(41,47,76,0.08)] dark:shadow-[0_0.75rem_2rem_rgba(0,0,0,0.26)]"
          >
            <div className="flex items-center justify-between gap-5 border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.75rem] bg-[var(--primary-selected-color)] text-[var(--primary-color)]">
                  <Help className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[0.8125rem] font-semibold text-[var(--primary-text-color)]">
                    Frequently asked questions
                  </p>
                  <p className="mt-0.5 text-[0.6875rem] text-[var(--secondary-text-color)]">
                    Product, plans, and platform access
                  </p>
                </div>
              </div>
              <span className="hidden rounded-full border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-3 py-1.5 text-[0.6875rem] font-semibold text-[var(--secondary-text-color)] sm:inline-flex">
                {FAQ_ITEMS.length} topics
              </span>
            </div>

            <div className="px-4 py-2 sm:px-6 sm:py-3">
              <Accordion defaultIndex={[0]} className="bg-transparent px-0 py-0">
                {FAQ_ITEMS.map((item, index) => (
                  <AccordionItem
                    key={item.q}
                    title={item.q}
                    hideBorder={index === FAQ_ITEMS.length - 1}
                    iconSize={20}
                    headerClassName="py-5 text-[0.9375rem] font-semibold leading-6 text-[var(--primary-text-color)] transition-colors hover:text-[var(--primary-color)] sm:text-[1rem]"
                    contentClassName="max-w-2xl pb-5 pr-5 pt-0 text-[0.9375rem] leading-6 text-[var(--secondary-text-color)] sm:pr-10"
                  >
                    {item.a}
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

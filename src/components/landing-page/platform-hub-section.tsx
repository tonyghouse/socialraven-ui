import { Check, Integrations, Security } from "@vibe/icons";
import { motion } from "framer-motion";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
  LIVE_PLATFORM_COUNT,
  LIVE_PLATFORMS,
} from "@/components/landing-page/landing-page-constants";
import { LandingPageLabel } from "@/components/landing-page/landing-page-label";

const FEATURED_PLATFORMS = LIVE_PLATFORMS;

export function LandingPagePlatformHubSection() {
  return (
    <section
      aria-labelledby="platform-hub-title"
      className="border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] py-20 sm:py-24"
    >
      <div className={LANDING_PAGE_CONTAINER_CLASS}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={LANDING_PAGE_VIEWPORT}
          variants={LANDING_PAGE_STAGGER_VARIANT}
          className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-end"
        >
          <div>
            <motion.div variants={LANDING_PAGE_FADE_VARIANT}>
              <LandingPageLabel>Integrations</LandingPageLabel>
            </motion.div>
            <motion.h2
              id="platform-hub-title"
              variants={LANDING_PAGE_FADE_VARIANT}
              className="mt-4 max-w-3xl font-[var(--font-vibe-title)] text-[2.25rem] font-bold leading-[1.08] tracking-normal text-[var(--primary-text-color)] sm:text-[2.75rem] lg:text-[3.125rem]"
            >
              Every channel, one publishing flow.
            </motion.h2>
          </div>
          <motion.p
            variants={LANDING_PAGE_FADE_VARIANT}
            className="max-w-xl text-[1rem] leading-7 text-[var(--secondary-text-color)] lg:justify-self-end"
          >
            Connect your social accounts and manage every post from the same
            workspace.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={LANDING_PAGE_VIEWPORT}
          variants={LANDING_PAGE_STAGGER_VARIANT}
          className="mt-12 overflow-hidden rounded-[1.25rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] shadow-[0_0.75rem_2rem_rgba(41,47,76,0.08)] dark:shadow-[0_0.75rem_2rem_rgba(0,0,0,0.26)]"
        >
          <motion.div
            variants={LANDING_PAGE_FADE_VARIANT}
            className="flex flex-col gap-3 border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.75rem] bg-[var(--primary-selected-color)] text-[var(--primary-color)]">
                <Integrations className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[0.8125rem] font-semibold text-[var(--primary-text-color)]">
                  Supported platforms
                </p>
                <p className="mt-0.5 text-[0.6875rem] text-[var(--secondary-text-color)]">
                  One connection flow for every channel
                </p>
              </div>
            </div>
            <span className="w-fit rounded-full border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-3 py-1.5 text-[0.6875rem] font-semibold text-[var(--secondary-text-color)]">
              {LIVE_PLATFORM_COUNT} live integrations
            </span>
          </motion.div>

          <div className="grid grid-cols-2 gap-px bg-[var(--layout-border-color)] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {FEATURED_PLATFORMS.map(
              ({ Icon, name, color, bg, dot }) => (
                <motion.article
                  key={name}
                  variants={LANDING_PAGE_FADE_VARIANT}
                  className="relative flex min-h-44 flex-col justify-between bg-[var(--primary-background-color)] p-4 sm:p-5"
                >
                  <span
                    className={`absolute inset-x-4 top-0 h-1 sm:inset-x-5 ${dot}`}
                    aria-hidden="true"
                  />
                  <div className="flex items-start justify-between gap-3 pt-2">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-[0.875rem] ${bg}`}
                    >
                      <Icon className={`h-5 w-5 ${color}`} />
                    </span>
                    <span
                      className="mt-1 h-2 w-2 rounded-full bg-[var(--color-done-green)]"
                      aria-label="Available"
                    />
                  </div>
                  <div>
                    <h3 className="text-heading-16 tracking-normal text-[var(--primary-text-color)]">
                      {name}
                    </h3>
                    <p className="mt-1 text-[0.6875rem] font-medium text-[var(--secondary-text-color)]">
                      Ready to connect
                    </p>
                  </div>
                </motion.article>
              ),
            )}
          </div>

          <motion.div
            variants={LANDING_PAGE_FADE_VARIANT}
            className="grid border-t border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] sm:grid-cols-2"
          >
            <div className="flex items-center gap-3 px-5 py-4 sm:border-r sm:border-[var(--layout-border-color)] sm:px-6">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.625rem] bg-[var(--primary-selected-color)] text-[var(--primary-color)]">
                <Security className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[0.75rem] font-semibold text-[var(--primary-text-color)]">
                  OAuth-secured connections
                </p>
                <p className="mt-0.5 text-[0.6875rem] text-[var(--secondary-text-color)]">
                  Connect through official platform APIs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-[var(--layout-border-color)] px-5 py-4 sm:border-t-0 sm:px-6">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.625rem] bg-[var(--positive-color-selected)] text-[var(--positive-color)]">
                <Check className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[0.75rem] font-semibold text-[var(--primary-text-color)]">
                  No password sharing
                </p>
                <p className="mt-0.5 text-[0.6875rem] text-[var(--secondary-text-color)]">
                  Keep account credentials private
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

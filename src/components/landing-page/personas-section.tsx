import {
  Check,
  NavigationChevronRight,
  PersonRound,
  Team,
  Workspace,
} from "@vibe/icons";
import { motion } from "framer-motion";
import Link from "next/link";
import type { ComponentType } from "react";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
  LIVE_PLATFORM_COUNT,
} from "@/components/landing-page/landing-page-constants";
import { LandingPageLabel } from "@/components/landing-page/landing-page-label";

type PersonaItem = {
  audience: string;
  title: string;
  description: string;
  points: string[];
  Icon: ComponentType<{ className?: string }>;
  railClassName: string;
  iconClassName: string;
  modeClassName: string;
};

const PERSONA_ITEMS: PersonaItem[] = [
  {
    audience: "Influencer mode",
    title: "One main workspace for your content.",
    description: "Plan and publish your own content from one place.",
    points: [
      "One main workspace",
      `All ${LIVE_PLATFORM_COUNT} platforms`,
      "Content calendar",
      "Scheduling and post history",
    ],
    Icon: PersonRound,
    railClassName: "bg-[var(--primary-color)]",
    iconClassName:
      "bg-[var(--primary-selected-color)] text-[var(--primary-color)]",
    modeClassName:
      "bg-[color-mix(in_srgb,var(--primary-color)_9%,var(--primary-background-color))] text-[var(--primary-color)]",
  },
  {
    audience: "Agency mode",
    title: "Multiple workspaces for clients and teams.",
    description: "Manage each brand separately and invite your team.",
    points: [
      "Multiple workspaces",
      "Multiple users",
      "Client approvals",
      "Post history per workspace",
    ],
    Icon: Team,
    railClassName: "bg-[var(--color-aquamarine)]",
    iconClassName:
      "bg-[var(--color-aquamarine-selected)] text-[var(--color-teal)]",
    modeClassName:
      "bg-[color-mix(in_srgb,var(--color-aquamarine)_14%,var(--primary-background-color))] text-[var(--color-teal)]",
  },
];

export function LandingPagePersonasSection() {
  return (
    <section
      id="solutions"
      aria-labelledby="personas-title"
      className="border-b border-[var(--layout-border-color)] bg-[var(--primary-background-color)] py-20 sm:py-24"
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
              <LandingPageLabel>Who it&apos;s for</LandingPageLabel>
            </motion.div>
            <motion.h2
              id="personas-title"
              variants={LANDING_PAGE_FADE_VARIANT}
              className="mt-4 max-w-3xl font-[var(--font-vibe-title)] text-[2.25rem] font-bold leading-[1.08] tracking-normal text-[var(--primary-text-color)] sm:text-[2.75rem] lg:text-[3.125rem]"
            >
              Choose the mode that fits your work.
            </motion.h2>
          </div>
          <motion.p
            variants={LANDING_PAGE_FADE_VARIANT}
            className="max-w-xl text-[1rem] leading-7 text-[var(--secondary-text-color)] lg:justify-self-end"
          >
            Influencer mode has one main workspace. Agency mode supports
            multiple workspaces and multiple users.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={LANDING_PAGE_VIEWPORT}
          variants={LANDING_PAGE_STAGGER_VARIANT}
          className="mt-12 overflow-hidden rounded-[1.25rem] border border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] shadow-[0_0.75rem_2rem_rgba(41,47,76,0.08)] dark:shadow-[0_0.75rem_2rem_rgba(0,0,0,0.26)]"
        >
          <motion.div
            variants={LANDING_PAGE_FADE_VARIANT}
            className="flex flex-col gap-3 border-b border-[var(--layout-border-color)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.75rem] bg-[var(--primary-selected-color)] text-[var(--primary-color)]">
                <Workspace className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[0.8125rem] font-semibold text-[var(--primary-text-color)]">
                  Compare modes
                </p>
                <p className="mt-0.5 text-[0.6875rem] text-[var(--secondary-text-color)]">
                  Pick the setup built for your work
                </p>
              </div>
            </div>
            <span className="w-fit rounded-full border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-3 py-1.5 text-[0.6875rem] font-semibold text-[var(--secondary-text-color)]">
              Influencer or Agency
            </span>
          </motion.div>

          <div className="grid lg:grid-cols-2">
            {PERSONA_ITEMS.map(
              (
                {
                  audience,
                  title,
                  description,
                  points,
                  Icon,
                  railClassName,
                  iconClassName,
                  modeClassName,
                },
                index,
              ) => (
                <motion.article
                  key={audience}
                  variants={LANDING_PAGE_FADE_VARIANT}
                  className={`relative flex flex-col bg-[var(--primary-background-color)] p-5 sm:p-7 lg:p-8 ${
                    index === 0
                      ? "border-b border-[var(--layout-border-color)] lg:border-b-0 lg:border-r"
                      : ""
                  }`}
                >
                  <span
                    className={`absolute inset-x-5 top-0 h-1 sm:inset-x-7 lg:inset-x-8 ${railClassName}`}
                    aria-hidden="true"
                  />

                  <div
                    className={`flex items-center gap-3 rounded-[0.875rem] px-4 py-3.5 ${modeClassName}`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.875rem] ${iconClassName}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-[var(--font-vibe-title)] text-[1.25rem] font-bold leading-6 tracking-normal">
                      {audience}
                    </h3>
                  </div>

                  <h4 className="mt-6 max-w-lg font-[var(--font-vibe-title)] text-[1.5rem] font-semibold leading-[1.3] tracking-normal text-[var(--primary-text-color)] sm:text-[1.625rem]">
                    {title}
                  </h4>
                  <p className="mt-3 max-w-xl text-[0.875rem] leading-6 text-[var(--secondary-text-color)]">
                    {description}
                  </p>

                  <ul className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 border-t border-[var(--layout-border-color)] pt-3 text-[0.8125rem] font-medium leading-5 text-[var(--primary-text-color)]"
                      >
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--positive-color-selected)] text-[var(--positive-color)]">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              ),
            )}
          </div>

          <motion.div
            variants={LANDING_PAGE_FADE_VARIANT}
            className="flex flex-col gap-4 border-t border-[var(--layout-border-color)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <div>
              <p className="text-[0.8125rem] font-semibold text-[var(--primary-text-color)]">
                14-day free trial · No credit card required
              </p>
            </div>
            <Link
              href="/sign-up"
              className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-[0.75rem] bg-[var(--primary-color)] px-5 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-[var(--primary-hover-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2"
            >
              Start free trial
              <NavigationChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

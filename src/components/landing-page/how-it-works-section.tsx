import {
  Calendar,
  Check,
  Globe,
  ScheduledSend,
} from "@vibe/icons";
import { motion } from "framer-motion";
import type { ComponentType } from "react";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
  LIVE_PLATFORM_COUNT,
} from "@/components/landing-page/landing-page-constants";
import { LandingPageLabel } from "@/components/landing-page/landing-page-label";

type StepPreviewProps = {
  className?: string;
};

type HowItWorksStep = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
  Preview: ComponentType<StepPreviewProps>;
  railClassName: string;
  iconClassName: string;
};

const CONNECTED_CHANNELS = [
  {
    shortName: "Ig",
    name: "Instagram",
    tileClassName:
      "bg-[color-mix(in_srgb,var(--color-bazooka)_14%,var(--primary-background-color))] text-[var(--color-dark-red)]",
  },
  {
    shortName: "Li",
    name: "LinkedIn",
    tileClassName:
      "bg-[var(--primary-selected-color)] text-[var(--primary-color)]",
  },
  {
    shortName: "Yt",
    name: "YouTube",
    tileClassName:
      "bg-[color-mix(in_srgb,var(--color-stuck-red)_12%,var(--primary-background-color))] text-[var(--color-stuck-red)]",
  },
] as const;

function ConnectedAccountsPreview({ className = "" }: StepPreviewProps) {
  return (
    <div
      className={`overflow-hidden rounded-[0.875rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] px-3.5 py-3">
        <p className="text-[0.75rem] font-semibold text-[var(--primary-text-color)]">
          Connected profiles
        </p>
        <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-[var(--positive-color)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-done-green)]" />
          Secure
        </span>
      </div>

      <div className="divide-y divide-[var(--layout-border-color)] px-3.5">
        {CONNECTED_CHANNELS.map(({ shortName, name, tileClassName }) => (
          <div key={name} className="flex items-center gap-2.5 py-2.5">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[0.625rem] font-bold ${tileClassName}`}
            >
              {shortName}
            </span>
            <span className="min-w-0 flex-1 truncate text-[0.75rem] font-medium text-[var(--primary-text-color)]">
              {name}
            </span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--positive-color-selected)] text-[var(--positive-color)]">
              <Check className="h-2.5 w-2.5" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const WEEK_DAYS = [
  { day: "M", date: "9", active: false },
  { day: "T", date: "10", active: false },
  { day: "W", date: "11", active: false },
  { day: "T", date: "12", active: true },
  { day: "F", date: "13", active: false },
] as const;

function SchedulePreview({ className = "" }: StepPreviewProps) {
  return (
    <div
      className={`overflow-hidden rounded-[0.875rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] px-3.5 py-3">
        <p className="text-[0.75rem] font-semibold text-[var(--primary-text-color)]">
          Launch week
        </p>
        <Calendar className="h-3.5 w-3.5 text-[var(--secondary-text-color)]" />
      </div>

      <div className="p-3.5">
        <div className="grid grid-cols-5 gap-1.5">
          {WEEK_DAYS.map(({ day, date, active }) => (
            <div
              key={`${day}-${date}`}
              className={`flex min-h-12 flex-col items-center justify-center rounded-lg border text-center ${
                active
                  ? "border-[var(--primary-color)] bg-[var(--primary-selected-color)] text-[var(--primary-color)]"
                  : "border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] text-[var(--secondary-text-color)]"
              }`}
            >
              <span className="text-[0.5625rem] font-semibold uppercase">
                {day}
              </span>
              <span className="mt-0.5 text-[0.75rem] font-bold">{date}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-lg border border-[var(--layout-border-color)] p-2.5">
          <span className="h-9 w-9 shrink-0 rounded-lg bg-[color-mix(in_srgb,var(--color-aquamarine)_18%,var(--primary-background-color))]">
            <span className="mx-auto mt-2.5 block h-1.5 w-5 rounded-full bg-[var(--color-aquamarine)]" />
            <span className="mx-auto mt-1 block h-1.5 w-3 rounded-full bg-[var(--color-bright-blue)]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.6875rem] font-semibold text-[var(--primary-text-color)]">
              Spring campaign
            </p>
            <p className="mt-0.5 text-[0.625rem] text-[var(--secondary-text-color)]">
              3 channels · 9:30 AM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const PUBLISH_STATUSES = [
  { channel: "Instagram", state: "Live", isLive: true },
  { channel: "LinkedIn", state: "Queued", isLive: false },
  { channel: "YouTube", state: "Queued", isLive: false },
] as const;

function PublishPreview({ className = "" }: StepPreviewProps) {
  return (
    <div
      className={`overflow-hidden rounded-[0.875rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] px-3.5 py-3">
        <p className="text-[0.75rem] font-semibold text-[var(--primary-text-color)]">
          Publishing status
        </p>
        <span className="text-[0.6875rem] font-medium text-[var(--secondary-text-color)]">
          Today
        </span>
      </div>

      <div className="p-3.5">
        <div className="overflow-hidden rounded-lg border border-[var(--layout-border-color)]">
          {PUBLISH_STATUSES.map(({ channel, state, isLive }, index) => (
            <div
              key={channel}
              className={`grid grid-cols-[minmax(0,1fr)_4.75rem] items-center ${
                index > 0 ? "border-t border-[var(--layout-border-color)]" : ""
              }`}
            >
              <span className="truncate px-3 py-2.5 text-[0.6875rem] font-medium text-[var(--primary-text-color)]">
                {channel}
              </span>
              <span
                className={`flex h-full items-center justify-center gap-1.5 border-l border-[var(--layout-border-color)] px-2 text-[0.625rem] font-semibold ${
                  isLive
                    ? "bg-[var(--positive-color-selected)] text-[var(--positive-color)]"
                    : "bg-[var(--primary-selected-color)] text-[var(--primary-color)]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isLive
                      ? "bg-[var(--color-done-green)]"
                      : "bg-[var(--primary-color)]"
                  }`}
                />
                {state}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 text-[0.6875rem] font-medium text-[var(--secondary-text-color)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--positive-color-selected)] text-[var(--positive-color)]">
            <Check className="h-2.5 w-2.5" />
          </span>
          Delivery is tracked automatically
        </div>
      </div>
    </div>
  );
}

const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: "01",
    eyebrow: "Connect",
    title: "Bring your channels together",
    description: `Link any of ${LIVE_PLATFORM_COUNT} supported platforms through official OAuth. Your passwords never touch SocialRaven.`,
    Icon: Globe,
    Preview: ConnectedAccountsPreview,
    railClassName: "bg-[var(--primary-color)]",
    iconClassName:
      "bg-[var(--primary-selected-color)] text-[var(--primary-color)]",
  },
  {
    number: "02",
    eyebrow: "Prepare",
    title: "Build one post, then schedule it",
    description:
      "Add the caption and media once, choose the right channels, and place it on your shared content calendar.",
    Icon: Calendar,
    Preview: SchedulePreview,
    railClassName: "bg-[var(--color-orange)]",
    iconClassName:
      "bg-[color-mix(in_srgb,var(--color-orange)_20%,var(--primary-background-color))] text-[var(--color-dark-orange)]",
  },
  {
    number: "03",
    eyebrow: "Publish",
    title: "Let every post ship on time",
    description:
      "SocialRaven publishes on schedule and keeps each channel’s delivery status visible in one workspace.",
    Icon: ScheduledSend,
    Preview: PublishPreview,
    railClassName: "bg-[var(--color-done-green)]",
    iconClassName:
      "bg-[var(--positive-color-selected)] text-[var(--positive-color)]",
  },
];

export function LandingPageHowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
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
              <LandingPageLabel>How it works</LandingPageLabel>
            </motion.div>
            <motion.h2
              id="how-it-works-title"
              variants={LANDING_PAGE_FADE_VARIANT}
              className="mt-4 max-w-3xl font-[var(--font-vibe-title)] text-[2.25rem] font-bold leading-[1.08] tracking-normal text-[var(--primary-text-color)] sm:text-[2.75rem] lg:text-[3.125rem]"
            >
              From first login to first scheduled post.
            </motion.h2>
          </div>
          <motion.p
            variants={LANDING_PAGE_FADE_VARIANT}
            className="max-w-xl text-[1rem] leading-7 text-[var(--secondary-text-color)] lg:justify-self-end"
          >
            A guided setup keeps the work simple: connect, prepare, and
            publish without a handoff or setup call.
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
                <Check className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[0.8125rem] font-semibold text-[var(--primary-text-color)]">
                  Your launch checklist
                </p>
                <p className="mt-0.5 text-[0.6875rem] text-[var(--secondary-text-color)]">
                  A clear path from setup to publish
                </p>
              </div>
            </div>
            <span className="w-fit rounded-full border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-3 py-1.5 text-[0.6875rem] font-semibold text-[var(--secondary-text-color)]">
              Usually under 5 minutes
            </span>
          </motion.div>

          <div className="grid lg:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map(
              (
                {
                  number,
                  eyebrow,
                  title,
                  description,
                  Icon,
                  Preview,
                  railClassName,
                  iconClassName,
                },
                index,
              ) => (
                <motion.article
                  key={number}
                  variants={LANDING_PAGE_FADE_VARIANT}
                  className={`relative flex flex-col p-5 sm:p-6 lg:min-h-[29rem] ${
                    index < HOW_IT_WORKS_STEPS.length - 1
                      ? "border-b border-[var(--layout-border-color)] lg:border-b-0 lg:border-r"
                      : ""
                  }`}
                >
                  <span
                    className={`absolute inset-x-5 top-0 h-1 sm:inset-x-6 ${railClassName}`}
                    aria-hidden="true"
                  />

                  <div className="flex items-start justify-between gap-4 pt-2">
                    <div>
                      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
                        Step {number}
                      </p>
                      <p className="mt-1 text-[0.8125rem] font-semibold text-[var(--primary-text-color)]">
                        {eyebrow}
                      </p>
                    </div>
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.875rem] ${iconClassName}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>

                  <h3 className="mt-6 max-w-[18rem] text-heading-20 tracking-normal text-[var(--primary-text-color)]">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-sm text-[0.875rem] leading-6 text-[var(--secondary-text-color)]">
                    {description}
                  </p>

                  <Preview className="mt-7 lg:mt-auto" />
                </motion.article>
              ),
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import {
  Board,
  Calendar,
  Chart,
  Comment,
  Integrations,
  Security,
  Send,
  Team,
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

type WorkflowStep = {
  Icon: ComponentType<{ className?: string }>;
  number: string;
  title: string;
  detail: string;
  accentClassName: string;
  iconClassName: string;
};

type FeatureItem = {
  Icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description: string;
  accentClassName: string;
  iconClassName: string;
};

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    Icon: Calendar,
    number: "01",
    title: "Plan",
    detail: "Organize campaigns",
    accentClassName: "bg-[var(--primary-color)]",
    iconClassName:
      "bg-[var(--primary-selected-color)] text-[var(--primary-color)]",
  },
  {
    Icon: Comment,
    number: "02",
    title: "Review",
    detail: "Keep feedback attached",
    accentClassName: "bg-[var(--color-done-green)]",
    iconClassName:
      "bg-[var(--positive-color-selected)] text-[var(--positive-color)]",
  },
  {
    Icon: Send,
    number: "03",
    title: "Publish",
    detail: `Send to ${LIVE_PLATFORM_COUNT} platforms`,
    accentClassName: "bg-[var(--color-orange)]",
    iconClassName:
      "bg-[color-mix(in_srgb,var(--color-orange)_20%,var(--primary-background-color))] text-[var(--color-dark-orange)]",
  },
  {
    Icon: Chart,
    number: "04",
    title: "Track",
    detail: "See what shipped",
    accentClassName: "bg-[var(--color-bright-blue)]",
    iconClassName:
      "bg-[var(--color-bright-blue-selected)] text-[var(--color-royal)]",
  },
];

const FEATURES: FeatureItem[] = [
  {
    Icon: Board,
    eyebrow: "Planning",
    title: "One calendar for every campaign",
    description:
      "See each draft, owner, status, and publish date in one view.",
    accentClassName: "bg-[var(--primary-color)]",
    iconClassName:
      "bg-[var(--primary-selected-color)] text-[var(--primary-color)]",
  },
  {
    Icon: Team,
    eyebrow: "Approvals",
    title: "Feedback stays beside the post",
    description:
      "Share a review link and keep every decision in context.",
    accentClassName: "bg-[var(--color-done-green)]",
    iconClassName:
      "bg-[var(--positive-color-selected)] text-[var(--positive-color)]",
  },
  {
    Icon: Security,
    eyebrow: "Security",
    title: "Connect accounts without passwords",
    description:
      "Use official OAuth connections with workspace-level access.",
    accentClassName: "bg-[var(--color-bazooka)]",
    iconClassName:
      "bg-[var(--negative-color-selected)] text-[var(--negative-color)]",
  },
  {
    Icon: Integrations,
    eyebrow: "Scale",
    title: "Keep every brand clearly separated",
    description:
      "Run multiple clients through one consistent publishing process.",
    accentClassName: "bg-[var(--color-aquamarine)]",
    iconClassName:
      "bg-[var(--color-aquamarine-selected)] text-[var(--color-teal)]",
  },
];

const CAPABILITIES = [
  "Draft queues",
  "Client links",
  "Channel variants",
  "Workspace roles",
  "Post history",
  "Reports",
] as const;

function WorkflowBand() {
  return (
    <div className="border-y border-[var(--layout-border-color)]">
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {WORKFLOW_STEPS.map(
          (
            {
              Icon,
              number,
              title,
              detail,
              accentClassName,
              iconClassName,
            },
            index,
          ) => (
            <article
              key={title}
              className={`relative min-h-40 p-5 sm:p-6 ${
                index % 2 === 0
                  ? "border-r border-[var(--layout-border-color)]"
                  : ""
              } ${
                index < 2
                  ? "border-b border-[var(--layout-border-color)] lg:border-b-0"
                  : ""
              } ${
                index === 1
                  ? "lg:border-r lg:border-[var(--layout-border-color)]"
                  : ""
              } ${index === 2 ? "lg:border-r lg:border-[var(--layout-border-color)]" : ""}`}
            >
              <span
                className={`absolute inset-x-5 top-0 h-1 sm:inset-x-6 ${accentClassName}`}
                aria-hidden="true"
              />
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClassName}`}
                >
                  <Icon className="h-[1.125rem] w-[1.125rem]" />
                </span>
                <span className="text-label-12 font-semibold text-[var(--secondary-text-color)]">
                  {number}
                </span>
              </div>
              <h3 className="mt-5 text-heading-16 tracking-normal text-[var(--primary-text-color)]">
                {title}
              </h3>
              <p className="mt-1 text-[0.8125rem] leading-5 text-[var(--secondary-text-color)]">
                {detail}
              </p>
            </article>
          ),
        )}
      </div>
    </div>
  );
}

function CapabilityStrip() {
  return (
    <div className="grid gap-4 border-b border-[var(--layout-border-color)] py-5 md:grid-cols-[8rem_minmax(0,1fr)] md:items-center">
      <p className="text-[0.75rem] font-semibold uppercase tracking-normal text-[var(--secondary-text-color)]">
        Also included
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {CAPABILITIES.map((capability) => (
          <span
            key={capability}
            className="inline-flex items-center gap-2 text-[0.8125rem] font-medium text-[var(--primary-text-color)]"
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]"
              aria-hidden="true"
            />
            {capability}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeatureGrid() {
  return (
    <div className="grid overflow-hidden rounded-lg border border-[var(--layout-border-color)] md:grid-cols-2">
      {FEATURES.map(
        (
          {
            Icon,
            eyebrow,
            title,
            description,
            accentClassName,
            iconClassName,
          },
          index,
        ) => (
          <article
            key={title}
            className={`relative grid min-h-48 grid-cols-[2.75rem_minmax(0,1fr)] gap-4 bg-[var(--primary-background-color)] p-5 sm:p-6 ${
              index % 2 === 0
                ? "md:border-r md:border-[var(--layout-border-color)]"
                : ""
            } ${
              index < 2
                ? "border-b border-[var(--layout-border-color)]"
                : index === 2
                  ? "border-b border-[var(--layout-border-color)] md:border-b-0"
                  : ""
            }`}
          >
            <span
              className={`absolute left-0 top-6 h-11 w-1 rounded-r-full ${accentClassName}`}
              aria-hidden="true"
            />
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconClassName}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.75rem] font-semibold uppercase tracking-normal text-[var(--secondary-text-color)]">
                {eyebrow}
              </p>
              <h3 className="mt-2 text-heading-20 tracking-normal text-[var(--primary-text-color)]">
                {title}
              </h3>
              <p className="mt-2 max-w-lg text-[0.875rem] leading-6 text-[var(--secondary-text-color)]">
                {description}
              </p>
            </div>
          </article>
        ),
      )}
    </div>
  );
}

export function LandingPageFeaturesSection() {
  return (
    <section
      id="features"
      className="border-b border-[var(--layout-border-color)] bg-[var(--primary-background-color)] py-20 sm:py-24"
    >
      <div className={LANDING_PAGE_CONTAINER_CLASS}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={LANDING_PAGE_VIEWPORT}
          variants={LANDING_PAGE_STAGGER_VARIANT}
          className="max-w-3xl"
        >
          <motion.div variants={LANDING_PAGE_FADE_VARIANT}>
            <LandingPageLabel>Features</LandingPageLabel>
          </motion.div>
          <motion.h2
            variants={LANDING_PAGE_FADE_VARIANT}
            className="mt-4 font-[var(--font-vibe-title)] text-[2.25rem] font-bold leading-[1.08] tracking-normal text-[var(--primary-text-color)] sm:text-[2.75rem] lg:text-[3.125rem]"
          >
            Plan, approve, and publish without the handoffs.
          </motion.h2>
          <motion.p
            variants={LANDING_PAGE_FADE_VARIANT}
            className="mt-5 max-w-xl text-[1rem] leading-7 text-[var(--secondary-text-color)]"
          >
            One workspace keeps every post moving from draft to report.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={LANDING_PAGE_VIEWPORT}
          variants={LANDING_PAGE_STAGGER_VARIANT}
          className="mt-12"
        >
          <motion.div variants={LANDING_PAGE_FADE_VARIANT}>
            <WorkflowBand />
          </motion.div>
          <motion.div variants={LANDING_PAGE_FADE_VARIANT}>
            <CapabilityStrip />
          </motion.div>
          <motion.div
            variants={LANDING_PAGE_FADE_VARIANT}
            className="mt-8"
          >
            <FeatureGrid />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

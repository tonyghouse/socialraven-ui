"use client";

import {
  Board,
  Calendar,
  Chart,
  Check,
  NavigationChevronRight,
  Team,
  Time,
} from "@vibe/icons";
import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_EASE_OUT,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LIVE_PLATFORM_COUNT,
  LIVE_PLATFORMS,
} from "@/components/landing-page/landing-page-constants";

const CALENDAR_DAYS = [
  {
    day: "Mon",
    date: "7",
    post: {
      title: "Launch teaser",
      time: "9:00 AM",
      platforms: [0, 1],
      label: "Scheduled",
      rail: "bg-[var(--color-bright-blue)]",
      tone: "bg-[var(--primary-selected-color)] text-[var(--primary-color)]",
    },
  },
  {
    day: "Tue",
    date: "8",
    post: {
      title: "Behind the scenes",
      time: "12:30 PM",
      platforms: [3, 4],
      label: "Review",
      rail: "bg-[var(--warning-color)]",
      tone:
        "bg-[var(--warning-color-selected)] text-[var(--fixed-dark-color)]",
    },
  },
  {
    day: "Wed",
    date: "9",
    post: {
      title: "Creator spotlight",
      time: "10:00 AM",
      platforms: [0, 2],
      label: "Draft",
      rail: "bg-[var(--color-winter)]",
      tone:
        "bg-[var(--allgrey-background-color)] text-[var(--secondary-text-color)]",
    },
  },
  {
    day: "Thu",
    date: "10",
    post: {
      title: "Product reveal",
      time: "4:00 PM",
      platforms: [0, 1, 2],
      label: "Scheduled",
      rail: "bg-[var(--color-bright-blue)]",
      tone: "bg-[var(--primary-selected-color)] text-[var(--primary-color)]",
    },
  },
  {
    day: "Fri",
    date: "11",
    post: {
      title: "Launch roundup",
      time: "6:30 PM",
      platforms: [0, 1, 2, 3],
      label: "Approved",
      rail: "bg-[var(--color-done-green)]",
      tone:
        "bg-[var(--positive-color-selected)] text-[var(--positive-color-hover)] dark:text-white",
    },
  },
] as const;

const PRODUCT_NAV = [
  { Icon: Calendar, label: "Calendar", active: true },
  { Icon: Board, label: "Queue", active: false },
  { Icon: Team, label: "Approvals", active: false },
  { Icon: Chart, label: "Reports", active: false },
] as const;

const WEEKLY_ACTIVITY = [55, 40, 75, 50, 85, 65, 100] as const;

function PlatformIcons({ indexes }: { indexes: readonly number[] }) {
  return (
    <div className="flex -space-x-1" aria-label={`${indexes.length} channels`}>
      {indexes.slice(0, 3).map((platformIndex) => {
        const platform = LIVE_PLATFORMS[platformIndex];
        if (!platform) return null;
        const { Icon, name } = platform;

        return (
          <span
            key={name}
            className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--primary-background-color)] bg-[var(--allgrey-background-color)] text-[var(--secondary-text-color)]"
            title={name}
          >
            <Icon className="h-2.5 w-2.5" />
          </span>
        );
      })}
      {indexes.length > 3 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-[var(--primary-background-color)] bg-[var(--ui-background-color)] px-1 text-[0.5625rem] font-semibold text-[var(--secondary-text-color)]">
          +{indexes.length - 3}
        </span>
      )}
    </div>
  );
}

function CalendarPost({
  post,
}: {
  post: (typeof CALENDAR_DAYS)[number]["post"];
}) {
  return (
    <div className="relative overflow-hidden rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] p-2.5 pl-3.5 shadow-[0_0.25rem_0.75rem_rgba(41,47,76,0.05)]">
      <span className={`absolute inset-y-0 left-0 w-1 ${post.rail}`} aria-hidden="true" />
      <p className="truncate text-label-12 font-semibold text-[var(--primary-text-color)]">
        {post.title}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[0.625rem] text-[var(--secondary-text-color)]">
          <Time className="h-3 w-3" />
          {post.time}
        </div>
        <PlatformIcons indexes={post.platforms} />
      </div>
      <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[0.625rem] font-semibold ${post.tone}`}>
        {post.label}
      </span>
    </div>
  );
}

function MiniWidgetShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] p-3 shadow-[0_1rem_2.5rem_rgba(41,47,76,0.12)] ${className}`}
    >
      {children}
    </div>
  );
}

function CampaignLiveWidget() {
  return (
    <MiniWidgetShell>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] bg-[var(--positive-color-selected)] text-[var(--positive-color-hover)] dark:text-white">
          <Check className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-heading-14 text-[var(--primary-text-color)]">Campaign live</p>
          <p className="truncate text-label-12 text-[var(--secondary-text-color)]">Published just now</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--ui-border-color)] pt-3">
        <PlatformIcons indexes={[0, 1, 2, 3]} />
        <span className="shrink-0 text-label-12 font-semibold text-[var(--positive-color)]">
          {LIVE_PLATFORM_COUNT} channels
        </span>
      </div>
    </MiniWidgetShell>
  );
}

function ReviewQueueWidget() {
  return (
    <MiniWidgetShell>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[0.7rem] bg-[var(--warning-color-selected)] text-[var(--fixed-dark-color)]">
          <Team className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-heading-14 text-[var(--primary-text-color)]">Review queue</p>
          <p className="truncate text-label-12 text-[var(--secondary-text-color)]">3 posts need sign-off</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--ui-background-color)]">
        <div className="h-full w-[72%] rounded-full bg-[var(--warning-color)]" />
      </div>
      <p className="mt-2 text-right text-[0.6875rem] text-[var(--secondary-text-color)]">8 of 11 approved</p>
    </MiniWidgetShell>
  );
}

function WeeklyActivityWidget() {
  return (
    <MiniWidgetShell>
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-[0.65rem] bg-[var(--primary-selected-color)] text-[var(--primary-color)]">
          <Chart className="h-3.5 w-3.5" />
        </span>
        <p className="text-label-12 font-semibold text-[var(--secondary-text-color)]">Posts this week</p>
      </div>
      <p className="mt-1 text-[1.45rem] font-bold leading-none tracking-[-0.04em] text-[var(--primary-text-color)]">48</p>
      <div className="mt-2.5 flex h-9 items-end gap-1">
        {WEEKLY_ACTIVITY.map((height, index) => (
          <span
            key={height}
            className="flex-1 rounded-[0.1875rem] bg-[var(--primary-color)]"
            style={{
              height: `${height}%`,
              opacity: 0.24 + index * 0.1,
            }}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[0.625rem] font-semibold text-[var(--positive-color)]">↑ 28% vs last week</p>
    </MiniWidgetShell>
  );
}

function ConnectedAccountsWidget() {
  return (
    <MiniWidgetShell>
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-[0.65rem] bg-[var(--primary-selected-color)] text-[var(--primary-color)]">
          <Board className="h-3.5 w-3.5" />
        </span>
        <p className="truncate text-label-12 font-semibold text-[var(--primary-text-color)]">Connected accounts</p>
      </div>
      <div className="space-y-1">
        {LIVE_PLATFORMS.slice(0, 4).map(({ Icon, name, dot }) => (
          <div key={name} className="flex items-center gap-2">
            <Icon className="h-3 w-3 text-[var(--secondary-text-color)]" />
            <span className="min-w-0 flex-1 truncate text-[0.625rem] text-[var(--secondary-text-color)]">{name}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          </div>
        ))}
      </div>
    </MiniWidgetShell>
  );
}

function PublishingCalendarPreview() {
  return (
    <div className="relative mx-auto max-w-[62rem] px-3 sm:px-5 lg:px-6">
      <div
        className="absolute inset-x-2 bottom-[-1rem] top-[3rem] rounded-[1.5rem] bg-[color-mix(in_srgb,var(--primary-color)_7%,var(--primary-background-color))] sm:inset-x-3 sm:bottom-[-1.5rem] lg:inset-x-4"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, x: -18, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.55, delay: 0.78, ease: LANDING_PAGE_EASE_OUT }}
        className="absolute -left-[14rem] top-[5.5rem] z-20 hidden w-[14.5rem] origin-top-left 2xl:block"
      >
        <CampaignLiveWidget />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 18, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.55, delay: 0.92, ease: LANDING_PAGE_EASE_OUT }}
        className="absolute -right-[14rem] top-[5.5rem] z-20 hidden w-[14rem] origin-top-right 2xl:block"
      >
        <ReviewQueueWidget />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -18, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.55, delay: 1.04, ease: LANDING_PAGE_EASE_OUT }}
        className="absolute -left-[13rem] bottom-2 z-20 hidden w-[12rem] 2xl:block"
      >
        <WeeklyActivityWidget />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 18, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.55, delay: 1.16, ease: LANDING_PAGE_EASE_OUT }}
        className="absolute -right-[13rem] bottom-2 z-20 hidden w-[13rem] 2xl:block"
      >
        <ConnectedAccountsWidget />
      </motion.div>

      <div className="relative overflow-hidden rounded-[1.25rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] shadow-[0_1.5rem_4rem_rgba(41,47,76,0.14)] dark:shadow-[0_1.5rem_4rem_rgba(0,0,0,0.34)]">
        <div className="flex min-h-[4.25rem] items-center gap-3 border-b border-[var(--layout-border-color)] px-3.5 sm:px-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.75rem] bg-[var(--primary-selected-color)] text-[var(--primary-color)]">
            <Calendar className="h-[1.125rem] w-[1.125rem]" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-heading-14 text-[var(--primary-text-color)]">Publishing calendar</p>
            <p className="truncate text-label-12 text-[var(--secondary-text-color)]">Spring launch · {LIVE_PLATFORM_COUNT} channels</p>
          </div>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <span className="inline-flex h-9 items-center rounded-[0.75rem] border border-[var(--ui-border-color)] px-3 text-label-13 text-[var(--primary-text-color)]">Apr 7–11</span>
            <span className="inline-flex h-9 items-center rounded-[0.75rem] border border-[var(--primary-color)] bg-[var(--primary-color)] px-3.5 text-label-13 font-semibold text-white">+ New post</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-[4rem_minmax(0,1fr)]">
          <aside className="hidden border-r border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] px-2 py-4 sm:block">
            <div className="space-y-2">
              {PRODUCT_NAV.map(({ Icon, label, active }) => (
                <div
                  key={label}
                  title={label}
                  className={`flex h-10 items-center justify-center rounded-[0.75rem] ${
                    active
                      ? "bg-[var(--primary-selected-color)] text-[var(--primary-color)]"
                      : "text-[var(--secondary-text-color)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 bg-[var(--allgrey-background-color)] p-3 sm:p-4 lg:p-5">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-heading-16 text-[var(--primary-text-color)]">Spring product launch</p>
                <p className="mt-0.5 text-label-12 text-[var(--secondary-text-color)]">12 scheduled posts · 3 awaiting approval</p>
              </div>
              <div className="hidden items-center gap-2 text-label-12 text-[var(--secondary-text-color)] lg:flex">
                <span className="h-2 w-2 rounded-full bg-[var(--color-done-green)]" />
                75% ready
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
              {CALENDAR_DAYS.map(({ day, date, post }, dayIndex) => (
                <div
                  key={day}
                  className={`min-h-[13.5rem] rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] p-2.5 ${
                    dayIndex > 1 ? "hidden md:block" : ""
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between px-0.5">
                    <span className="text-label-12 font-semibold uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">{day}</span>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-label-12 font-semibold ${dayIndex === 0 ? "bg-[var(--primary-color)] text-white" : "bg-[var(--allgrey-background-color)] text-[var(--primary-text-color)]"}`}>{date}</span>
                  </div>
                  <CalendarPost post={post} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.78, ease: LANDING_PAGE_EASE_OUT }}
        className="relative z-10 mt-4 hidden grid-cols-2 gap-3 lg:grid xl:grid-cols-4 2xl:hidden"
      >
        <CampaignLiveWidget />
        <ReviewQueueWidget />
        <WeeklyActivityWidget />
        <ConnectedAccountsWidget />
      </motion.div>
    </div>
  );
}

export function LandingPageHeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--layout-border-color)] bg-[var(--primary-background-color)] pb-20 pt-[8.5rem] sm:pb-24 sm:pt-[9.5rem]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.38] dark:opacity-[0.16]"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--layout-border-color) 72%, transparent) 0.125rem, transparent 0.13rem)",
          backgroundSize: "1.9rem 1.9rem",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 78%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 78%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--primary-color)_9%,transparent),transparent_67%)]"
        aria-hidden="true"
      />

      <div className={`${LANDING_PAGE_CONTAINER_CLASS} relative`}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={LANDING_PAGE_STAGGER_VARIANT}
          className="mx-auto flex max-w-[49rem] flex-col items-center text-center"
        >
          <motion.h1
            variants={LANDING_PAGE_FADE_VARIANT}
            className="max-w-[48rem] font-[var(--font-vibe-title)] text-[clamp(2.65rem,5vw,4.55rem)] font-bold leading-[0.96] tracking-[-0.052em] text-[var(--primary-text-color)]"
          >
            The Intelligence Layer for{" "}
            <span className="text-[var(--primary-color)]">Social Media</span>
          </motion.h1>

          <motion.p
            variants={LANDING_PAGE_FADE_VARIANT}
            className="mt-6 max-w-[38rem] text-[1.0625rem] leading-[1.7] text-[var(--secondary-text-color)] sm:text-[1.125rem]"
          >
            Plan content, manage conversations, track performance, and spot what is coming next across every social media channel.
          </motion.p>

          <motion.div variants={LANDING_PAGE_FADE_VARIANT} className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[0.875rem] border border-[var(--primary-color)] bg-[var(--primary-color)] px-6 text-label-16 font-semibold text-white transition-colors hover:border-[var(--primary-hover-color)] hover:bg-[var(--primary-hover-color)] focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary-background-color)] sm:w-auto"
            >
              Start for free
              <NavigationChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-6 text-label-16 font-semibold text-[var(--primary-text-color)] transition-colors hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)] focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary-background-color)] sm:w-auto"
            >
              View pricing
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 34, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.38, ease: LANDING_PAGE_EASE_OUT }}
          className="mt-14 sm:mt-16"
        >
          <PublishingCalendarPreview />
        </motion.div>
      </div>
    </section>
  );
}

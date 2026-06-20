import {
  Check,
  DoubleCheck,
  Filter,
  Inbox,
  MoreActions,
  NavigationChevronRight,
  PersonRound,
  Reply,
  Search,
  Send,
} from "@vibe/icons";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
  LIVE_PLATFORM_COUNT,
} from "@/components/landing-page/landing-page-constants";

type InboxMessage = {
  Icon: ComponentType<{ className?: string }>;
  account: string;
  initials: string;
  message: string;
  time: string;
  channelClassName: string;
  avatarClassName: string;
  unread?: boolean;
  selected?: boolean;
};

const INBOX_MESSAGES: InboxMessage[] = [
  {
    Icon: Instagram,
    account: "Demo Creator",
    initials: "DC",
    message: "Can I share this with my team?",
    time: "2m",
    channelClassName:
      "bg-[color-mix(in_srgb,var(--color-bazooka)_14%,var(--primary-background-color))] text-[var(--color-dark-red)]",
    avatarClassName:
      "bg-[color-mix(in_srgb,var(--color-bazooka)_18%,var(--primary-background-color))] text-[var(--color-dark-red)]",
    unread: true,
    selected: true,
  },
  {
    Icon: Twitter,
    account: "Launch Team",
    initials: "LT",
    message: "This workflow just saved our launch.",
    time: "8m",
    channelClassName:
      "bg-[color-mix(in_srgb,var(--color-chili-blue)_18%,var(--primary-background-color))] text-[var(--color-dark-blue)]",
    avatarClassName:
      "bg-[color-mix(in_srgb,var(--color-chili-blue)_20%,var(--primary-background-color))] text-[var(--color-dark-blue)]",
    unread: true,
  },
  {
    Icon: Linkedin,
    account: "Content Ops",
    initials: "CO",
    message: "Sharing this with our content team.",
    time: "16m",
    channelClassName:
      "bg-[var(--primary-selected-color)] text-[var(--primary-color)]",
    avatarClassName:
      "bg-[color-mix(in_srgb,var(--color-steel)_38%,var(--primary-background-color))] text-[var(--color-navy)]",
  },
  {
    Icon: Facebook,
    account: "Sample Studio",
    initials: "SS",
    message: "Is the next webinar open yet?",
    time: "34m",
    channelClassName:
      "bg-[var(--primary-selected-color)] text-[var(--primary-color)]",
    avatarClassName:
      "bg-[color-mix(in_srgb,var(--color-aquamarine)_18%,var(--primary-background-color))] text-[var(--color-teal)]",
  },
  {
    Icon: Youtube,
    account: "Social Desk",
    initials: "SD",
    message: "Subscribed. Great breakdown!",
    time: "1h",
    channelClassName:
      "bg-[color-mix(in_srgb,var(--color-stuck-red)_12%,var(--primary-background-color))] text-[var(--color-stuck-red)]",
    avatarClassName:
      "bg-[color-mix(in_srgb,var(--color-orange)_18%,var(--primary-background-color))] text-[var(--color-dark-orange)]",
  },
];

const INBOX_FILTERS = [
  { label: "All messages", count: "12", active: true },
  { label: "Unread", count: "5", active: false },
  { label: "Assigned to me", count: "3", active: false },
  { label: "Done", count: "", active: false },
] as const;

function ConversationList() {
  return (
    <div className="hidden min-w-0 border-r border-[var(--layout-border-color)] bg-[var(--primary-background-color)] md:block">
      <div className="flex h-14 items-center justify-between border-b border-[var(--layout-border-color)] px-4">
        <div>
          <p className="text-[0.8125rem] font-semibold text-[var(--primary-text-color)]">
            All messages
          </p>
          <p className="mt-0.5 text-[0.625rem] text-[var(--secondary-text-color)]">
            Newest first
          </p>
        </div>
        <button
          type="button"
          aria-label="Filter conversations"
          title="Filter conversations"
          className="flex h-8 w-8 items-center justify-center rounded-[0.625rem] text-[var(--icon-color)] transition-colors hover:bg-[var(--primary-background-hover-color)]"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      <div>
        {INBOX_MESSAGES.map(
          ({
            Icon,
            account,
            initials,
            message,
            time,
            channelClassName,
            avatarClassName,
            unread,
            selected,
          }) => (
            <div
              key={account}
              className={`relative flex min-h-[5.25rem] gap-3 border-b border-[var(--layout-border-color)] px-4 py-3 transition-colors ${
                selected
                  ? "bg-[var(--primary-highlighted-color)]"
                  : "hover:bg-[var(--allgrey-background-color)]"
              }`}
            >
              {selected ? (
                <span
                  className="absolute inset-y-0 left-0 w-1 bg-[var(--primary-color)]"
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold ${avatarClassName}`}
              >
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-[0.75rem] font-semibold text-[var(--primary-text-color)]">
                    {account}
                  </p>
                  <span className="shrink-0 text-[0.625rem] text-[var(--secondary-text-color)]">
                    {time}
                  </span>
                </div>
                <p className="mt-1 truncate text-[0.6875rem] text-[var(--secondary-text-color)]">
                  {message}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md ${channelClassName}`}
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="text-[0.625rem] font-medium text-[var(--secondary-text-color)]">
                    Comment
                  </span>
                  {unread ? (
                    <span className="ml-auto h-2 w-2 rounded-full bg-[var(--primary-color)]" />
                  ) : null}
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function InboxNavigation() {
  return (
    <aside className="hidden border-r border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] lg:block">
      <div className="border-b border-[var(--layout-border-color)] px-4 py-4">
        <p className="text-[0.6875rem] font-semibold text-[var(--secondary-text-color)]">
          Views
        </p>
        <div className="mt-2 space-y-1">
          {INBOX_FILTERS.map(({ label, count, active }) => (
            <div
              key={label}
              className={`flex h-9 items-center gap-2.5 rounded-[0.625rem] px-3 text-[0.75rem] font-medium ${
                active
                  ? "bg-[var(--primary-selected-color)] text-[var(--primary-color)]"
                  : "text-[var(--secondary-text-color)]"
              }`}
            >
              <Inbox className="h-3.5 w-3.5" />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {count ? (
                <span
                  className={`text-[0.625rem] font-semibold ${
                    active
                      ? "text-[var(--primary-color)]"
                      : "text-[var(--secondary-text-color)]"
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-[0.6875rem] font-semibold text-[var(--secondary-text-color)]">
            Channels
          </p>
          <span className="text-[0.625rem] text-[var(--secondary-text-color)]">
            {LIVE_PLATFORM_COUNT} active
          </span>
        </div>
        <div className="mt-3 space-y-2.5">
          {[
            {
              label: "Instagram",
              className: "bg-[var(--color-bazooka)]",
            },
            {
              label: "LinkedIn",
              className: "bg-[var(--primary-color)]",
            },
            {
              label: "YouTube",
              className: "bg-[var(--color-stuck-red)]",
            },
          ].map(({ label, className }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 text-[0.6875rem] font-medium text-[var(--secondary-text-color)]"
            >
              <span className={`h-2 w-2 rounded-full ${className}`} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ConversationThread() {
  return (
    <div className="flex min-w-0 flex-col bg-[var(--primary-background-color)]">
      <div className="flex min-h-14 items-center gap-3 border-b border-[var(--layout-border-color)] px-4 sm:px-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-bazooka)_18%,var(--primary-background-color))] text-[0.625rem] font-bold text-[var(--color-dark-red)]">
          DC
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.75rem] font-semibold text-[var(--primary-text-color)]">
            Demo Creator
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[0.625rem] text-[var(--secondary-text-color)]">
            <Instagram className="h-3 w-3 text-[var(--color-dark-red)]" />
            Instagram comment
          </p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-[0.625rem] border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-2.5 py-1.5 text-[0.625rem] font-medium text-[var(--secondary-text-color)] sm:inline-flex">
          <PersonRound className="h-3 w-3" />
          Assigned to you
        </span>
        <button
          type="button"
          aria-label="Conversation actions"
          title="Conversation actions"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.625rem] text-[var(--icon-color)] transition-colors hover:bg-[var(--primary-background-hover-color)]"
        >
          <MoreActions className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 p-4 sm:p-5">
        <div className="flex items-center gap-3 rounded-[0.75rem] border border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] p-3">
          <span className="flex h-11 w-11 shrink-0 flex-col justify-center gap-1 rounded-[0.625rem] bg-[color-mix(in_srgb,var(--color-aquamarine)_18%,var(--primary-background-color))] px-2">
            <span className="h-1.5 w-full rounded-full bg-[var(--color-aquamarine)]" />
            <span className="h-1.5 w-3/4 rounded-full bg-[var(--color-bright-blue)]" />
            <span className="h-1.5 w-1/2 rounded-full bg-[var(--color-orange)]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.6875rem] font-semibold text-[var(--primary-text-color)]">
              Campaign planning without the chaos
            </p>
            <p className="mt-1 text-[0.625rem] text-[var(--secondary-text-color)]">
              Published today at 9:30 AM
            </p>
          </div>
          <NavigationChevronRight className="h-3.5 w-3.5 text-[var(--icon-color)]" />
        </div>

        <div className="mt-5 flex items-start gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-bazooka)_18%,var(--primary-background-color))] text-[0.5625rem] font-bold text-[var(--color-dark-red)]">
            DC
          </span>
          <div className="max-w-[82%] rounded-[0.75rem] rounded-tl-sm bg-[var(--allgrey-background-color)] px-3.5 py-3">
            <p className="text-[0.75rem] leading-5 text-[var(--primary-text-color)]">
              Can I share this with my team? The workflow is exactly what we
              need.
            </p>
            <p className="mt-1.5 text-[0.5625rem] text-[var(--secondary-text-color)]">
              2 minutes ago
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start justify-end gap-2.5">
          <div className="max-w-[82%] rounded-[0.75rem] rounded-tr-sm bg-[var(--primary-selected-color)] px-3.5 py-3">
            <p className="text-[0.75rem] leading-5 text-[var(--primary-text-color)]">
              Absolutely. I&apos;ll send the full guide here once it is ready.
            </p>
            <p className="mt-1.5 flex items-center justify-end gap-1 text-[0.5625rem] text-[var(--primary-color)]">
              <DoubleCheck className="h-3 w-3" />
              Sent by you
            </p>
          </div>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-color)] text-[0.5625rem] font-bold text-white">
            SR
          </span>
        </div>
      </div>

      <div className="border-t border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] p-3 sm:p-4">
        <div className="rounded-[0.75rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] p-2.5 focus-within:border-[var(--primary-color)]">
          <div className="flex min-h-10 items-center gap-2 px-1">
            <Reply className="h-4 w-4 shrink-0 text-[var(--icon-color)]" />
            <span className="min-w-0 flex-1 truncate text-[0.6875rem] text-[var(--placeholder-color)]">
              Reply to Demo Creator on Instagram...
            </span>
            <button
              type="button"
              aria-label="Send reply"
              title="Send reply"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.625rem] bg-[var(--primary-color)] text-white transition-colors hover:bg-[var(--primary-hover-color)]"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 px-1">
          <p className="flex items-center gap-1.5 text-[0.5625rem] text-[var(--secondary-text-color)]">
            <Check className="h-3 w-3 text-[var(--positive-color)]" />
            Reply from SocialRaven
          </p>
          <button
            type="button"
            className="text-[0.5625rem] font-semibold text-[var(--primary-color)]"
          >
            Mark done
          </button>
        </div>
      </div>
    </div>
  );
}

export function LandingPageUnifiedInboxSection() {
  return (
    <section
      id="unified-inbox"
      className="scroll-mt-16 border-y border-[var(--layout-border-color)] bg-[var(--primary-background-color)] py-20 sm:py-24"
    >
      <div className={LANDING_PAGE_CONTAINER_CLASS}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={LANDING_PAGE_VIEWPORT}
          variants={LANDING_PAGE_STAGGER_VARIANT}
        >
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
            <div>
              <motion.div variants={LANDING_PAGE_FADE_VARIANT}>
                <span className="inline-flex items-center gap-2 rounded-[0.75rem] border border-[var(--primary-selected-hover-color)] bg-[var(--primary-selected-color)] px-3 py-1.5 text-[0.6875rem] font-semibold text-[var(--primary-color)]">
                  <Inbox className="h-3.5 w-3.5" />
                  Unified inbox
                </span>
              </motion.div>
              <motion.h2
                variants={LANDING_PAGE_FADE_VARIANT}
                className="mt-5 max-w-2xl font-[var(--font-vibe-title)] text-[2rem] font-bold leading-[1.15] tracking-normal text-[var(--primary-text-color)] sm:text-[2.5rem]"
              >
                Every conversation. One clear queue.
              </motion.h2>
            </div>

            <motion.div variants={LANDING_PAGE_FADE_VARIANT}>
              <p className="max-w-md text-[0.9375rem] leading-6 text-[var(--secondary-text-color)]">
                Review comments and DMs, assign replies, and respond without
                switching tabs.
              </p>
              <Link
                href="/sign-up"
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-[0.75rem] bg-[var(--primary-color)] px-4 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-[var(--primary-hover-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2"
              >
                Start free trial
                <NavigationChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            variants={LANDING_PAGE_FADE_VARIANT}
            className="mt-10 overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)]"
          >
            <div className="flex h-14 items-center gap-3 border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] px-4 sm:px-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[0.625rem] bg-[var(--primary-selected-color)] text-[var(--primary-color)]">
                <Inbox className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[0.75rem] font-semibold text-[var(--primary-text-color)]">
                  Unified inbox
                </p>
                <p className="mt-0.5 text-[0.5625rem] text-[var(--secondary-text-color)]">
                  {LIVE_PLATFORM_COUNT} connected channels
                </p>
              </div>
              <div className="ml-auto hidden h-8 w-48 items-center gap-2 rounded-[0.625rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-3 text-[0.625rem] text-[var(--placeholder-color)] sm:flex lg:w-56">
                <Search className="h-3.5 w-3.5" />
                Search messages
              </div>
              <span className="rounded-[0.625rem] bg-[var(--primary-selected-color)] px-2.5 py-1.5 text-[0.625rem] font-semibold text-[var(--primary-color)]">
                12 new
              </span>
            </div>

            <div className="grid min-h-[31rem] md:grid-cols-[17.5rem_minmax(0,1fr)] lg:grid-cols-[12rem_17.5rem_minmax(0,1fr)]">
              <InboxNavigation />
              <ConversationList />
              <ConversationThread />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

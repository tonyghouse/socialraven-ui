"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Globe,
  LayoutGrid,
  Loader2,
  Plus,
  Users,
  X,
} from "lucide-react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getHours,
  getMinutes,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { cn } from "@/lib/utils";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { CalendarPageSkeleton } from "@/components/calendar/calendar-page-skeleton";
import { fetchCalendarPostsApi } from "@/service/calendarPosts";
import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import type { CalendarPostResponse } from "@/model/CalendarPostResponse";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";

type CalendarView = "month" | "week";

const PLATFORM_META: Record<string, { label: string; accent: string }> = {
  instagram: { label: "Instagram", accent: "var(--chart-categorical-4)" },
  x: { label: "X / Twitter", accent: "var(--chart-neutral)" },
  linkedin: { label: "LinkedIn", accent: "var(--chart-categorical-2)" },
  facebook: { label: "Facebook", accent: "var(--chart-categorical-5)" },
  youtube: { label: "YouTube", accent: "var(--chart-categorical-1)" },
  threads: { label: "Threads", accent: "var(--chart-neutral)" },
  tiktok: { label: "TikTok", accent: "var(--chart-categorical-6)" },
};

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; text: string; border: string; label: string; Icon: React.ElementType }
> = {
  SCHEDULED: {
    color: "hsl(var(--accent))",
    bg: "bg-[var(--ds-plum-100)]",
    text: "text-[var(--ds-plum-700)]",
    border: "border-[var(--ds-plum-200)]",
    label: "Scheduled",
    Icon: Clock,
  },
  PUBLISHED: {
    color: "var(--ds-green-600)",
    bg: "bg-[var(--ds-green-100)]",
    text: "text-[var(--ds-green-700)]",
    border: "border-[var(--ds-green-200)]",
    label: "Published",
    Icon: CheckCircle2,
  },
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 64;

const pageClassName = "flex h-screen flex-col bg-[var(--ds-background-200)]";
const surfaceClassName = "bg-[var(--ds-background-100)]";
const dividerClassName = "border-[var(--ds-gray-400)]";
const sectionStripClassName = "border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]";
const mutedTextClassName = "text-[var(--ds-gray-900)]";
const strongTextClassName = "text-[var(--ds-gray-1000)]";
const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";
const CONTROL_BUTTON_CLASS =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-label-14 text-[var(--ds-gray-1000)] transition-colors hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] disabled:pointer-events-none disabled:opacity-50";

const ICON_BUTTON_CLASS =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] transition-colors hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]";

const PRIMARY_BUTTON_CLASS =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[hsl(var(--accent))] px-3.5 text-label-14 text-white transition-colors hover:bg-[hsl(var(--accent-hover))]";

const SUBTLE_BADGE_CLASS =
  "inline-flex items-center gap-1.5 rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-900)]";

const SEGMENTED_CONTROL_CLASS =
  "flex items-center rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-1";

const SEGMENTED_BUTTON_CLASS =
  "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-label-13 transition-colors";

function platformLabel(platform: string) {
  return PLATFORM_META[platform]?.label ?? platform;
}

function platformAccent(platform: string) {
  return PLATFORM_META[platform]?.accent ?? "var(--ds-gray-700)";
}

function platformSurfaceStyle(platform: string, backgroundPercent = 12, borderPercent = 28) {
  const accent = platformAccent(platform);

  return {
    backgroundColor: `color-mix(in srgb, ${accent} ${backgroundPercent}%, var(--ds-background-100))`,
    borderColor: `color-mix(in srgb, ${accent} ${borderPercent}%, var(--ds-gray-400))`,
  };
}

function getUTCRangeForMonth(date: Date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const paddedStart = addDays(start, -1);
  const paddedEnd = addDays(end, 2);
  return { startDate: paddedStart.toISOString(), endDate: paddedEnd.toISOString() };
}

function getUTCRangeForWeek(date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const paddedStart = addDays(weekStart, -1);
  const paddedEnd = addDays(weekEnd, 2);
  return { startDate: paddedStart.toISOString(), endDate: paddedEnd.toISOString() };
}

function groupPostsByDay(posts: CalendarPostResponse[]) {
  const map = new Map<string, CalendarPostResponse[]>();
  for (const post of posts) {
    const key = format(new Date(post.scheduledTime), "yyyy-MM-dd");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(post);
  }
  return map;
}

function getDayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function formatHour(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function formatTime(isoUtc: string) {
  return format(new Date(isoUtc), "h:mm a");
}

function PostChip({
  post,
  accountMap,
  onClick,
}: {
  post: CalendarPostResponse;
  accountMap: Map<string, ConnectedAccount>;
  onClick?: () => void;
}) {
  const PlatformIcon = PLATFORM_ICONS[post.platform];
  const color = platformAccent(post.platform);
  const account = accountMap.get(post.providerUserId);
  const statusColor = STATUS_CONFIG[post.postStatus]?.color ?? "var(--ds-gray-700)";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={`${account?.username ?? post.providerUserId} · ${platformLabel(post.platform)} · ${formatTime(post.scheduledTime)}`}
      className={cn(
        "group flex w-full items-center gap-1.5 overflow-hidden rounded-md border px-2 py-1.5 text-left transition-opacity hover:opacity-90",
        focusRingClassName
      )}
      style={platformSurfaceStyle(post.platform, 10, 28)}
    >
      {PlatformIcon ? <PlatformIcon className="shrink-0" style={{ width: 11, height: 11, color }} /> : null}
      <span className="flex-1 truncate text-label-12 leading-none text-[var(--ds-gray-1000)]">
        {account?.username ?? post.platform}
      </span>
      <span className="shrink-0 rounded-full" style={{ width: 5, height: 5, backgroundColor: statusColor }} />
    </button>
  );
}

function PostTimelineCard({
  post,
  accountMap,
  onNavigate,
}: {
  post: CalendarPostResponse;
  accountMap: Map<string, ConnectedAccount>;
  onNavigate: () => void;
}) {
  const PlatformIcon = PLATFORM_ICONS[post.platform];
  const color = platformAccent(post.platform);
  const account = accountMap.get(post.providerUserId);
  const statusCfg = STATUS_CONFIG[post.postStatus];
  const StatusIcon = statusCfg?.Icon ?? Clock;

  return (
    <button
      onClick={onNavigate}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-3 text-left transition-colors hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]",
        focusRingClassName
      )}
    >
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 14%, var(--ds-background-100))`,
        }}
      >
        {PlatformIcon ? <PlatformIcon style={{ width: 16, height: 16, color }} /> : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="truncate text-label-14 text-[var(--ds-gray-1000)]">
            {account?.username ?? post.providerUserId}
          </span>
          <span className="shrink-0 text-label-12 text-[var(--ds-gray-900)]">
            {platformLabel(post.platform)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-label-12 text-[var(--ds-gray-900)]">{formatTime(post.scheduledTime)}</span>
          {statusCfg ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-copy-12 font-medium",
                statusCfg.bg,
                statusCfg.text,
                statusCfg.border
              )}
            >
              <StatusIcon style={{ width: 8, height: 8 }} />
              {statusCfg.label}
            </span>
          ) : null}
          <span
            className="rounded-full px-2 py-0.5 text-copy-12 font-medium"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 14%, var(--ds-background-100))`,
              color,
            }}
          >
            {post.postCollectionType}
          </span>
        </div>
      </div>
    </button>
  );
}

function DayDetailSheet({
  open,
  onClose,
  day,
  posts,
  accountMap,
}: {
  open: boolean;
  onClose: () => void;
  day: Date | null;
  posts: CalendarPostResponse[];
  accountMap: Map<string, ConnectedAccount>;
}) {
  const router = useRouter();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const postsByHour = useMemo(() => {
    const map = new Map<number, CalendarPostResponse[]>();
    for (const post of posts) {
      const hour = getHours(new Date(post.scheduledTime));
      if (!map.has(hour)) map.set(hour, []);
      map.get(hour)!.push(post);
    }
    return map;
  }, [posts]);

  function scheduleAt(hour: number) {
    if (!day) return;
    router.push(`/schedule-post?date=${format(day, "yyyy-MM-dd")}&time=${String(hour).padStart(2, "0")}:00`);
    onClose();
  }

  function viewPost(post: CalendarPostResponse) {
    router.push(`/scheduled-posts/${post.postCollectionId}`);
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />

          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="pointer-events-auto flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-xl"
            >
              <div className="flex items-start justify-between border-b border-[var(--ds-gray-400)] px-5 py-4">
                <div>
                  <p className="mb-1 text-label-12 text-[var(--ds-gray-900)]">{day ? format(day, "EEEE") : ""}</p>
                  <h2 className="text-heading-20 tracking-[-0.005em] text-[var(--ds-gray-1000)]">
                    {day ? format(day, "MMMM d, yyyy") : ""}
                  </h2>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-[var(--ds-gray-900)]" />
                    <span className="text-label-12 text-[var(--ds-gray-900)]">{timezone}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={cn(ICON_BUTTON_CLASS, focusRingClassName)}
                  aria-label="Close day details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-2.5">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[var(--ds-gray-900)]" />
                <span className="text-label-12 text-[var(--ds-gray-900)]">
                  {posts.length === 0 ? "No posts for this day. Pick an hour to schedule." : `${posts.length} post${posts.length !== 1 ? "s" : ""} scheduled`}
                </span>
                {posts.length > 0 ? (
                  <div className="ml-auto flex items-center gap-1">
                    {[...new Set(posts.map((post) => post.platform))].map((platform) => {
                      const PlatformIcon = PLATFORM_ICONS[platform];
                      const color = platformAccent(platform);
                      return PlatformIcon ? (
                        <PlatformIcon key={platform} style={{ width: 12, height: 12, color }} />
                      ) : null;
                    })}
                  </div>
                ) : null}
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="py-2">
                  {HOURS.map((hour) => {
                    const hourPosts = (postsByHour.get(hour) ?? []).sort(
                      (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
                    );

                    return (
                      <div key={hour}>
                        <div className="flex items-center gap-3 px-4 py-1">
                          <span className="w-12 shrink-0 text-right text-label-12 text-[var(--ds-gray-900)]">
                            {formatHour(hour)}
                          </span>
                          <div className="h-px flex-1 bg-[var(--ds-gray-400)]" />
                        </div>

                        {hourPosts.length > 0 ? (
                          <div className="space-y-1.5 px-4 pb-2 pl-[4.5rem]">
                            {hourPosts.map((post) => (
                              <PostTimelineCard
                                key={post.id}
                                post={post}
                                accountMap={accountMap}
                                onNavigate={() => viewPost(post)}
                              />
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => scheduleAt(hour)}
                            className={cn(
                              "group flex w-full items-center gap-1.5 pb-1 pl-[4.5rem] pr-4 text-left text-label-12 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-plum-700)]",
                              focusRingClassName
                            )}
                          >
                            <Plus className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                            <span className="opacity-0 transition-opacity group-hover:opacity-100">Schedule a post here</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-[var(--ds-gray-400)] px-5 py-4">
                <button
                  onClick={() => {
                    if (!day) return;
                    router.push(`/schedule-post?date=${format(day, "yyyy-MM-dd")}&time=09:00`);
                    onClose();
                  }}
                  className={cn(PRIMARY_BUTTON_CLASS, focusRingClassName, "w-full")}
                >
                  <Plus className="h-4 w-4" />
                  Schedule post for this day
                </button>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function MonthView({
  currentDate,
  postsByDay,
  accountMap,
  onDayClick,
  onSchedule,
}: {
  currentDate: Date;
  postsByDay: Map<string, CalendarPostResponse[]>;
  accountMap: Map<string, ConnectedAccount>;
  onDayClick: (day: Date) => void;
  onSchedule: (date: string, time: string) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  while (days.length < 42) days.push(addDays(days[days.length - 1], 1));

  const dayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxChips = 3;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="grid shrink-0 grid-cols-7 border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
        {dayHeaders.map((label) => (
          <div key={label} className="py-3 text-center text-label-12 text-[var(--ds-gray-900)]">
            {label}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 overflow-hidden" style={{ gridTemplateRows: "repeat(6, 1fr)" }}>
        {days.map((day, index) => {
          const key = getDayKey(day);
          const dayPosts = postsByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, currentDate);
          const todayFlag = isToday(day);
          const overflow = dayPosts.length - maxChips;

          return (
            <div
              key={index}
              className={cn(
                "group relative overflow-hidden border-b border-r border-[var(--ds-gray-400)] p-2 transition-colors",
                !inMonth && "bg-[var(--ds-gray-100)]",
                todayFlag && "bg-[var(--ds-plum-100)]",
                "hover:bg-[var(--ds-gray-100)]"
              )}
              onClick={() => onDayClick(day)}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-label-12 transition-colors",
                    todayFlag
                      ? "bg-[hsl(var(--accent))] !text-white"
                      : inMonth
                        ? "text-[var(--ds-gray-1000)]"
                        : "text-[var(--ds-gray-900)]"
                  )}
                >
                  {format(day, "d")}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSchedule(format(day, "yyyy-MM-dd"), "09:00");
                  }}
                  className={cn(
                    "rounded-md p-1 text-transparent transition-all group-hover:text-[var(--ds-gray-900)] hover:bg-[var(--ds-plum-100)] hover:!text-[var(--ds-plum-700)]",
                    focusRingClassName
                  )}
                  title="Schedule post"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-1">
                {dayPosts.slice(0, maxChips).map((post) => (
                  <PostChip key={post.id} post={post} accountMap={accountMap} onClick={() => onDayClick(day)} />
                ))}
                {overflow > 0 ? (
                  <button
                    className={cn(
                      "pl-1 text-label-12 text-[var(--ds-plum-700)] transition-colors hover:text-[var(--ds-plum-800)]",
                      focusRingClassName
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDayClick(day);
                    }}
                  >
                    +{overflow} more
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  currentDate,
  postsByDay,
  accountMap,
  onDayClick,
  onSchedule,
}: {
  currentDate: Date;
  postsByDay: Map<string, CalendarPostResponse[]>;
  accountMap: Map<string, ConnectedAccount>;
  onDayClick: (day: Date) => void;
  onSchedule: (date: string, time: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
  const timeGutter = 56;

  useEffect(() => {
    if (!scrollRef.current) return;
    const hour = new Date().getHours();
    scrollRef.current.scrollTop = Math.max(0, (hour - 2) * HOUR_HEIGHT);
  }, []);

  const now = new Date();
  const nowTop = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;
  const todayInView = weekDays.some((day) => isToday(day));

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="grid shrink-0 border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]" style={{ gridTemplateColumns: `${timeGutter}px repeat(7, 1fr)` }}>
        <div className="border-r border-[var(--ds-gray-400)]" />
        {weekDays.map((day) => {
          const todayFlag = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "cursor-pointer border-l border-[var(--ds-gray-400)] py-2.5 text-center transition-colors hover:bg-[var(--ds-background-100)]",
                todayFlag && "bg-[var(--ds-plum-100)]"
              )}
              onClick={() => onDayClick(day)}
            >
              <p className={cn("text-label-12", todayFlag ? "text-[var(--ds-plum-700)]" : "text-[var(--ds-gray-900)]")}>
                {format(day, "EEE")}
              </p>
              <div
                className={cn(
                  "mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-label-14",
                  todayFlag ? "bg-[hsl(var(--accent))] !text-white" : "text-[var(--ds-gray-1000)]"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        <div className="relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
          <div className="absolute bottom-0 left-0 top-0" style={{ width: timeGutter }}>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 text-right text-label-12 text-[var(--ds-gray-900)]"
                style={{ top: hour * HOUR_HEIGHT + 4 }}
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-[var(--ds-gray-400)]"
              style={{ top: hour * HOUR_HEIGHT }}
            />
          ))}

          {todayInView ? (
            <div className="pointer-events-none absolute z-20" style={{ top: nowTop, left: timeGutter, right: 0 }}>
              <div className="relative flex items-center">
                <div className="absolute -left-[0.3125rem] h-2.5 w-2.5 rounded-full bg-[var(--ds-red-600)]" />
                <div className="ml-1 h-[0.09375rem] flex-1 bg-[var(--ds-red-600)] opacity-75" />
              </div>
            </div>
          ) : null}

          {weekDays.map((day, dayIndex) => {
            const key = getDayKey(day);
            const dayPosts = postsByDay.get(key) ?? [];
            const postsByHour = new Map<number, CalendarPostResponse[]>();

            for (const post of dayPosts) {
              const hour = getHours(new Date(post.scheduledTime));
              if (!postsByHour.has(hour)) postsByHour.set(hour, []);
              postsByHour.get(hour)!.push(post);
            }

            return (
              <div
                key={day.toISOString()}
                className="absolute bottom-0 top-0 border-l border-[var(--ds-gray-400)]"
                style={{
                  left: `calc(${timeGutter}px + ${dayIndex} * (100% - ${timeGutter}px) / 7)`,
                  width: `calc((100% - ${timeGutter}px) / 7)`,
                }}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="group absolute left-0 right-0 cursor-pointer transition-colors hover:bg-[var(--ds-plum-100)]/60"
                    style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    onClick={() => onSchedule(format(day, "yyyy-MM-dd"), `${String(hour).padStart(2, "0")}:00`)}
                  >
                    <Plus className="absolute right-1 top-1 h-3 w-3 text-[var(--ds-plum-700)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                ))}

                {Array.from(postsByHour.entries()).flatMap(([hour, hourPosts]) =>
                  hourPosts.map((post, postIndex) => {
                    const minute = getMinutes(new Date(post.scheduledTime));
                    const topOffset = hour * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT * 0.5 + postIndex * 22 + 2;
                    const PlatformIcon = PLATFORM_ICONS[post.platform];
                    const color = platformAccent(post.platform);
                    const account = accountMap.get(post.providerUserId);
                    const statusColor = STATUS_CONFIG[post.postStatus]?.color ?? "var(--ds-gray-700)";

                    return (
                      <button
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDayClick(day);
                        }}
                        title={`${account?.username ?? ""} · ${platformLabel(post.platform)} · ${formatTime(post.scheduledTime)}`}
                        className={cn(
                          "absolute z-10 flex items-center gap-1 rounded-md border text-copy-12 font-medium text-[var(--ds-gray-1000)] transition-opacity hover:opacity-90",
                          focusRingClassName
                        )}
                        style={{
                          left: 3,
                          right: 3,
                          top: topOffset,
                          height: 22,
                          ...platformSurfaceStyle(post.platform, 10, 32),
                        }}
                      >
                        {PlatformIcon ? <PlatformIcon style={{ width: 9, height: 9, marginLeft: 4, flexShrink: 0 }} /> : null}
                        <span className="flex-1 truncate px-0.5">{account?.username ?? post.platform}</span>
                        <span className="mr-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: statusColor }} />
                      </button>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FilterBar({
  accounts,
  selectedAccountIds,
  onAccountToggle,
  onClearFilters,
}: {
  accounts: ConnectedAccount[];
  selectedAccountIds: string[];
  onAccountToggle: (id: string) => void;
  onClearFilters: () => void;
}) {
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hasFilters = selectedAccountIds.length > 0;
  const accountLabel =
    selectedAccountIds.length === 0
      ? "All accounts"
      : `${selectedAccountIds.length} account${selectedAccountIds.length !== 1 ? "s" : ""}`;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={cn("flex flex-wrap items-center gap-2 border-t px-4 py-3", dividerClassName, surfaceClassName)}>
      <div className={SUBTLE_BADGE_CLASS}>
        <Filter className="h-3 w-3 shrink-0" />
        Filters
      </div>

      <div className="relative" ref={accountRef}>
        <button
          onClick={() => setAccountOpen((current) => !current)}
          className={cn(
            CONTROL_BUTTON_CLASS,
            focusRingClassName,
            hasFilters
              ? "border-[var(--ds-plum-300)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)] hover:border-[var(--ds-plum-400)] hover:bg-[var(--ds-plum-200)]"
              : mutedTextClassName
          )}
        >
          <Users className="h-3.5 w-3.5 shrink-0" />
          {accountLabel}
          <ChevronRight className={cn("h-3 w-3 transition-transform", accountOpen && "rotate-90")} />
        </button>

        <AnimatePresence>
          {accountOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 top-full z-30 mt-1.5 w-72 overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-[0_1rem_2.5rem_rgba(15,23,42,0.12)]"
            >
              <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-2">
                <p className="text-label-12 text-[var(--ds-gray-900)]">
                  {accounts.length} account{accounts.length !== 1 ? "s" : ""} in scope
                </p>
              </div>
              <div className="max-h-64 space-y-1 overflow-y-auto p-1">
                {accounts.length === 0 ? (
                  <p className="px-2 py-3 text-center text-label-13 text-[var(--ds-gray-900)]">No accounts in this group</p>
                ) : (
                  accounts.map((account) => {
                    const PlatformIcon = PLATFORM_ICONS[account.platform];
                    const color = platformAccent(account.platform);
                    const checked = selectedAccountIds.includes(account.providerUserId);

                    return (
                      <button
                        key={account.providerUserId}
                        onClick={() => onAccountToggle(account.providerUserId)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left text-label-13 transition-colors",
                          focusRingClassName,
                          checked
                            ? strongTextClassName
                            : "border-transparent text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-400)] hover:bg-[var(--ds-gray-100)]"
                        )}
                        style={checked ? platformSurfaceStyle(account.platform, 10, 32) : undefined}
                      >
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: checked
                              ? `color-mix(in srgb, ${color} 14%, var(--ds-background-100))`
                              : "var(--ds-gray-100)",
                          }}
                        >
                          {PlatformIcon ? <PlatformIcon style={{ width: 12, height: 12, color }} /> : null}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">{account.username}</p>
                          <p className="text-label-12 text-[var(--ds-gray-900)]">{platformLabel(account.platform)}</p>
                        </div>
                        {checked ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {hasFilters ? (
        <button
          onClick={onClearFilters}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-label-13 transition-colors hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]",
            mutedTextClassName,
            focusRingClassName
          )}
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      ) : null}

      <div className={cn(SUBTLE_BADGE_CLASS, "ml-auto")}>
        <Globe className="h-3 w-3 shrink-0" />
        <span className="max-w-[10rem] truncate">{timezone}</span>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<CalendarPostResponse[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const accountMap = useMemo(() => new Map(accounts.map((account) => [account.providerUserId, account])), [accounts]);

  useEffect(() => {
    let cancelled = false;

    async function loadAccounts() {
      try {
        setLoadingData(true);
        const data = await fetchAllConnectedAccountsApi(getToken);
        if (!cancelled) setAccounts(data ?? []);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load accounts");
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    loadAccounts();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  useEffect(() => {
    if (loadingData) return;
    let cancelled = false;

    async function loadPosts() {
      try {
        setLoadingPosts(true);
        const range = view === "month" ? getUTCRangeForMonth(currentDate) : getUTCRangeForWeek(currentDate);
        const data = await fetchCalendarPostsApi(getToken, range.startDate, range.endDate);
        if (!cancelled) setPosts((data ?? []).filter((post) => post.postStatus !== "FAILED"));
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load calendar posts");
      } finally {
        if (!cancelled) setLoadingPosts(false);
      }
    }

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, [view, currentDate, loadingData, getToken]);

  const filteredPosts = useMemo(() => {
    if (selectedAccountIds.length === 0) return posts;
    const allowedIds = new Set(selectedAccountIds);
    return posts.filter((post) => allowedIds.has(post.providerUserId));
  }, [posts, selectedAccountIds]);

  const postsByDay = useMemo(() => groupPostsByDay(filteredPosts), [filteredPosts]);
  const selectedDayPosts = useMemo(
    () => (selectedDay ? postsByDay.get(getDayKey(selectedDay)) ?? [] : []),
    [selectedDay, postsByDay]
  );

  function goBack() {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  }

  function goForward() {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  function handleDayClick(day: Date) {
    setSelectedDay(day);
    setSheetOpen(true);
  }

  function handleSchedule(date: string, time: string) {
    router.push(`/schedule-post?date=${date}&time=${time}`);
  }

  function handleAccountToggle(id: string) {
    setSelectedAccountIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  const headerLabel =
    view === "month"
      ? format(currentDate, "MMMM yyyy")
      : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")} - ${format(
          endOfWeek(currentDate, { weekStartsOn: 1 }),
          "MMM d, yyyy"
        )}`;

  if (loadingData) {
    return <CalendarPageSkeleton />;
  }

  if (error) {
    return (
      <div className={cn(pageClassName, "items-center justify-center px-6")}>
        <div className="flex max-w-sm flex-col items-center gap-4 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-6 py-8 text-center shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--ds-red-100)] text-[var(--ds-red-700)]">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-label-14 text-[var(--ds-gray-1000)]">Calendar data could not be loaded.</p>
            <p className="text-copy-12 text-[var(--ds-gray-900)]">{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setLoadingData(true);
            }}
            className={cn(PRIMARY_BUTTON_CLASS, focusRingClassName)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={pageClassName}>
      <div className="shrink-0">
        <ProtectedPageHeader
          title="Content Calendar"
          description="Track scheduled publishing across connected accounts."
          icon={<Calendar className="h-4 w-4" />}
          className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95"
          actions={
            <>
              <div className={SUBTLE_BADGE_CLASS}>
                <Clock className="h-3.5 w-3.5" />
                {headerLabel}
                {loadingPosts ? <Loader2 className="ml-1 h-3.5 w-3.5 animate-spin" /> : null}
              </div>

              <div className="flex items-center gap-1">
                <button onClick={goBack} className={cn(ICON_BUTTON_CLASS, focusRingClassName)} aria-label="Previous period">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={goToday} className={cn(CONTROL_BUTTON_CLASS, focusRingClassName)}>
                  Today
                </button>
                <button onClick={goForward} className={cn(ICON_BUTTON_CLASS, focusRingClassName)} aria-label="Next period">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className={SEGMENTED_CONTROL_CLASS}>
                <button
                  onClick={() => setView("month")}
                  className={cn(
                    SEGMENTED_BUTTON_CLASS,
                    focusRingClassName,
                    view === "month"
                      ? "bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-sm"
                      : "text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)]"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Month
                </button>
                <button
                  onClick={() => setView("week")}
                  className={cn(
                    SEGMENTED_BUTTON_CLASS,
                    focusRingClassName,
                    view === "week"
                      ? "bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-sm"
                      : "text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)]"
                  )}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Week
                </button>
              </div>

              <button
                onClick={() => handleSchedule(format(new Date(), "yyyy-MM-dd"), "09:00")}
                className={cn(PRIMARY_BUTTON_CLASS, focusRingClassName)}
              >
                <Plus className="h-4 w-4" />
                Schedule post
              </button>
            </>
          }
        />

        <div className={cn(sectionStripClassName, "px-4 py-2.5 text-label-13 sm:px-6", mutedTextClassName)}>
          {loadingPosts
            ? "Refreshing calendar data"
            : filteredPosts.length > 0
              ? `${filteredPosts.length} post${filteredPosts.length !== 1 ? "s" : ""} in view`
              : "No scheduled posts in the current view"}
        </div>

        <FilterBar
          accounts={accounts}
          selectedAccountIds={selectedAccountIds}
          onAccountToggle={handleAccountToggle}
          onClearFilters={() => setSelectedAccountIds([])}
        />
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-sm rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
              <Users className="h-8 w-8 text-[var(--ds-gray-700)] opacity-70" />
            </div>
            <h3 className="mb-2 text-heading-20 text-[var(--ds-gray-1000)]">No connected accounts</h3>
            <p className="mb-5 text-label-14 leading-relaxed text-[var(--ds-gray-900)]">
              Connect your social accounts to start scheduling posts and see everything visualized here.
            </p>
            <a href="/connect-accounts" className={cn(PRIMARY_BUTTON_CLASS, focusRingClassName)}>
              Connect accounts
            </a>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className={cn("flex flex-1 flex-col overflow-hidden border-t", dividerClassName, surfaceClassName)}>
              {view === "month" ? (
                <MonthView
                  currentDate={currentDate}
                  postsByDay={postsByDay}
                  accountMap={accountMap}
                  onDayClick={handleDayClick}
                  onSchedule={handleSchedule}
                />
              ) : (
                <WeekView
                  currentDate={currentDate}
                  postsByDay={postsByDay}
                  accountMap={accountMap}
                  onDayClick={handleDayClick}
                  onSchedule={handleSchedule}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <DayDetailSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        day={selectedDay}
        posts={selectedDayPosts}
        accountMap={accountMap}
      />
    </div>
  );
}

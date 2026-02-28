"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Globe,
  Users,
  Filter,
  CalendarDays,
  LayoutGrid,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isToday,
  addDays,
  getHours,
  getMinutes,
  eachDayOfInterval,
} from "date-fns";
import { cn } from "@/lib/utils";
import { fetchCalendarPostsApi } from "@/service/calendarPosts";
import { fetchAccountGroupsApi } from "@/service/accountGroups";
import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import type { CalendarPostResponse } from "@/model/CalendarPostResponse";
import type { AccountGroup } from "@/model/AccountGroup";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";

// ── Constants ─────────────────────────────────────────────────────────────────

type CalendarView = "month" | "week";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#e1306c",
  x: "#18181b",
  linkedin: "#0077b5",
  facebook: "#1877f2",
  youtube: "#ff0000",
  threads: "#101010",
  tiktok: "#69C9D0",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  x: "X / Twitter",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  youtube: "YouTube",
  threads: "Threads",
  tiktok: "TikTok",
};

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; text: string; border: string; label: string; Icon: React.ElementType }
> = {
  SCHEDULED: { color: "#3b82f6", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Scheduled", Icon: Clock },
  POSTED:    { color: "#22c55e", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Published", Icon: CheckCircle2 },
  FAILED:    { color: "#ef4444", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Failed", Icon: XCircle },
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 64; // px per hour in week view

// ── Utilities ─────────────────────────────────────────────────────────────────

function getUTCRangeForMonth(date: Date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const paddedStart = addDays(start, -1);
  const paddedEnd = addDays(end, 2);
  return { startDate: paddedStart.toISOString(), endDate: paddedEnd.toISOString() };
}

function getUTCRangeForWeek(date: Date) {
  const wStart = startOfWeek(date, { weekStartsOn: 1 });
  const wEnd = endOfWeek(date, { weekStartsOn: 1 });
  const paddedStart = addDays(wStart, -1);
  const paddedEnd = addDays(wEnd, 2);
  return { startDate: paddedStart.toISOString(), endDate: paddedEnd.toISOString() };
}

function groupPostsByDay(posts: CalendarPostResponse[]): Map<string, CalendarPostResponse[]> {
  const map = new Map<string, CalendarPostResponse[]>();
  for (const post of posts) {
    const key = format(new Date(post.scheduledTime), "yyyy-MM-dd");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(post);
  }
  return map;
}

function getDayKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function formatHour(hour: number): string {
  if (hour === 0)  return "12 AM";
  if (hour < 12)   return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function formatTime(isoUtc: string): string {
  return format(new Date(isoUtc), "h:mm a");
}

// ── PostChip (compact chip for month / week views) ────────────────────────────

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
  const color        = PLATFORM_COLORS[post.platform] ?? "#94a3b8";
  const account      = accountMap.get(post.providerUserId);
  const statusColor  = STATUS_CONFIG[post.postStatus]?.color ?? "#94a3b8";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={`${account?.username ?? post.providerUserId} · ${PLATFORM_LABELS[post.platform] ?? post.platform} · ${formatTime(post.scheduledTime)}`}
      className="group flex items-center gap-1 rounded-md border w-full px-1.5 py-1 transition-all duration-150 hover:shadow-sm active:scale-95 text-left overflow-hidden"
      style={{ backgroundColor: color + "14", borderColor: color + "40" }}
    >
      {PlatformIcon && (
        <PlatformIcon
          className="shrink-0"
          style={{ width: 11, height: 11, color }}
        />
      )}
      <span className="text-[10px] font-medium truncate flex-1 leading-none" style={{ color }}>
        {account?.username ?? post.platform}
      </span>
      <span
        className="shrink-0 rounded-full"
        style={{ width: 5, height: 5, backgroundColor: statusColor }}
      />
    </button>
  );
}

// ── PostTimelineCard (used in day-detail sheet) ───────────────────────────────

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
  const color        = PLATFORM_COLORS[post.platform] ?? "#94a3b8";
  const account      = accountMap.get(post.providerUserId);
  const statusCfg    = STATUS_CONFIG[post.postStatus];
  const StatusIcon   = statusCfg?.Icon ?? Clock;

  return (
    <button
      onClick={onNavigate}
      className="w-full flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card hover:shadow-md hover:border-border transition-all duration-200 text-left group"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: color + "1a" }}
      >
        {PlatformIcon && <PlatformIcon style={{ width: 16, height: 16, color }} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-semibold text-foreground truncate">
            {account?.username ?? post.providerUserId}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {PLATFORM_LABELS[post.platform] ?? post.platform}
          </span>
        </div>
        {post.title && (
          <p className="text-[11px] text-muted-foreground truncate mb-1">{post.title}</p>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">
            {formatTime(post.scheduledTime)}
          </span>
          {statusCfg && (
            <span className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold border", statusCfg.bg, statusCfg.text, statusCfg.border)}>
              <StatusIcon style={{ width: 8, height: 8 }} />
              {statusCfg.label}
            </span>
          )}
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: color + "1a", color }}
          >
            {post.postCollectionType}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── DayDetailSheet ────────────────────────────────────────────────────────────

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
  const router   = useRouter();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const postsByHour = useMemo(() => {
    const map = new Map<number, CalendarPostResponse[]>();
    for (const p of posts) {
      const h = getHours(new Date(p.scheduledTime));
      if (!map.has(h)) map.set(h, []);
      map.get(h)!.push(p);
    }
    return map;
  }, [posts]);

  function scheduleAt(hour: number) {
    if (!day) return;
    router.push(
      `/schedule-post?date=${format(day, "yyyy-MM-dd")}&time=${String(hour).padStart(2, "0")}:00`
    );
    onClose();
  }

  function viewPost(post: CalendarPostResponse) {
    router.push(`/scheduled-posts/${post.postCollectionId}`);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-background border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-border/60 bg-card/60">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                  {day ? format(day, "EEEE") : ""}
                </p>
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  {day ? format(day, "MMMM d, yyyy") : ""}
                </h2>
                <div className="flex items-center gap-1 mt-1.5">
                  <Globe className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{timezone}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary bar */}
            <div className="px-5 py-2.5 bg-muted/30 border-b border-border/40 flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">
                {posts.length === 0
                  ? "No posts — click an hour to schedule"
                  : `${posts.length} post${posts.length !== 1 ? "s" : ""} scheduled`}
              </span>
              {posts.length > 0 && (
                <div className="flex items-center gap-1 ml-auto">
                  {[...new Set(posts.map((p) => p.platform))].map((pl) => {
                    const PIcon = PLATFORM_ICONS[pl];
                    const c = PLATFORM_COLORS[pl] ?? "#94a3b8";
                    return PIcon ? <PIcon key={pl} style={{ width: 12, height: 12, color: c }} /> : null;
                  })}
                </div>
              )}
            </div>

            {/* 24-hour timeline */}
            <div className="flex-1 overflow-y-auto">
              <div className="py-2">
                {HOURS.map((hour) => {
                  const hourPosts = (postsByHour.get(hour) ?? []).sort(
                    (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
                  );
                  return (
                    <div key={hour}>
                      {/* Hour separator */}
                      <div className="flex items-center gap-3 px-4 py-1">
                        <span className="text-[10px] font-semibold text-muted-foreground w-12 text-right shrink-0">
                          {formatHour(hour)}
                        </span>
                        <div className="flex-1 h-px bg-border/40" />
                      </div>

                      {/* Posts at this hour */}
                      {hourPosts.length > 0 ? (
                        <div className="px-4 pl-[72px] pb-2 space-y-1.5">
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
                          className="w-full pl-[72px] pr-4 pb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/40 hover:text-blue-500 transition-colors group text-left"
                        >
                          <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            Schedule a post here
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border/60">
              <button
                onClick={() => {
                  if (!day) return;
                  router.push(`/schedule-post?date=${format(day, "yyyy-MM-dd")}&time=09:00`);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Schedule post for this day
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── MonthView ─────────────────────────────────────────────────────────────────

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
  const monthEnd   = endOfMonth(currentDate);
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd    = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days       = eachDayOfInterval({ start: gridStart, end: gridEnd });
  // ensure 6 full rows
  while (days.length < 42) days.push(addDays(days[days.length - 1], 1));

  const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const MAX_CHIPS   = 3;

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Column headers */}
      <div className="grid grid-cols-7 border-b border-border/50 bg-muted/20 shrink-0">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="py-2.5 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="flex-1 grid grid-cols-7 overflow-hidden" style={{ gridTemplateRows: "repeat(6, 1fr)" }}>
        {days.map((day, idx) => {
          const key        = getDayKey(day);
          const dayPosts   = postsByDay.get(key) ?? [];
          const inMonth    = isSameMonth(day, currentDate);
          const todayFlag  = isToday(day);
          const overflow   = dayPosts.length - MAX_CHIPS;

          return (
            <div
              key={idx}
              className={cn(
                "relative border-b border-r border-border/30 p-1.5 cursor-pointer group",
                "transition-colors duration-100 overflow-hidden",
                !inMonth && "bg-muted/15",
                todayFlag && "bg-blue-50/60",
                "hover:bg-accent/5"
              )}
              onClick={() => onDayClick(day)}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-bold transition-colors",
                    todayFlag
                      ? "bg-blue-600 text-white shadow-sm"
                      : inMonth
                      ? "text-foreground"
                      : "text-muted-foreground/35"
                  )}
                >
                  {format(day, "d")}
                </span>
                {/* Quick-add button (hover reveal) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSchedule(format(day, "yyyy-MM-dd"), "09:00");
                  }}
                  className="p-0.5 rounded text-transparent group-hover:text-muted-foreground/50 hover:!text-blue-500 hover:bg-blue-50 transition-all duration-150"
                  title="Schedule post"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Post chips */}
              <div className="space-y-0.5">
                {dayPosts.slice(0, MAX_CHIPS).map((post) => (
                  <PostChip
                    key={post.id}
                    post={post}
                    accountMap={accountMap}
                    onClick={() => onDayClick(day)}
                  />
                ))}
                {overflow > 0 && (
                  <button
                    className="text-[10px] font-semibold text-blue-500 hover:text-blue-700 pl-1 transition-colors"
                    onClick={(e) => { e.stopPropagation(); onDayClick(day); }}
                  >
                    +{overflow} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── WeekView ──────────────────────────────────────────────────────────────────

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
  const weekDays  = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

  // Scroll to current hour on mount
  useEffect(() => {
    if (scrollRef.current) {
      const h = new Date().getHours();
      scrollRef.current.scrollTop = Math.max(0, (h - 2) * HOUR_HEIGHT);
    }
  }, []);

  const now           = new Date();
  const nowTop        = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;
  const todayInView   = weekDays.some((d) => isToday(d));
  const TIME_GUTTER   = 56; // px

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Week header row */}
      <div
        className="grid shrink-0 border-b border-border/50 bg-muted/20"
        style={{ gridTemplateColumns: `${TIME_GUTTER}px repeat(7, 1fr)` }}
      >
        <div className="border-r border-border/30" />
        {weekDays.map((day) => {
          const todayFlag = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "py-2.5 text-center border-l border-border/30 cursor-pointer hover:bg-muted/30 transition-colors",
                todayFlag && "bg-blue-50/70"
              )}
              onClick={() => onDayClick(day)}
            >
              <p className={cn("text-[11px] font-bold uppercase tracking-wider", todayFlag ? "text-blue-600" : "text-muted-foreground")}>
                {format(day, "EEE")}
              </p>
              <div className={cn("mx-auto w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mt-0.5", todayFlag ? "bg-blue-600 text-white" : "text-foreground")}>
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
        <div className="relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>

          {/* Time gutter */}
          <div className="absolute top-0 left-0 bottom-0" style={{ width: TIME_GUTTER }}>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 text-[10px] font-medium text-muted-foreground/60 text-right"
                style={{ top: hour * HOUR_HEIGHT + 4 }}
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Hour grid lines (spans full width) */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-border/20"
              style={{ top: hour * HOUR_HEIGHT }}
            />
          ))}

          {/* Current time red indicator */}
          {todayInView && (
            <div
              className="absolute z-20 pointer-events-none"
              style={{ top: nowTop, left: TIME_GUTTER, right: 0 }}
            >
              <div className="relative flex items-center">
                <div className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="flex-1 h-[1.5px] bg-red-500 opacity-75 ml-1" />
              </div>
            </div>
          )}

          {/* Day columns */}
          {weekDays.map((day, di) => {
            const colLeft  = TIME_GUTTER + di * ((100 - 0) / 7);  // % won't work here, need px
            const key      = getDayKey(day);
            const dayPosts = postsByDay.get(key) ?? [];

            // Group posts by hour for stacking
            const byHour = new Map<number, CalendarPostResponse[]>();
            for (const p of dayPosts) {
              const h = getHours(new Date(p.scheduledTime));
              if (!byHour.has(h)) byHour.set(h, []);
              byHour.get(h)!.push(p);
            }

            return (
              <div
                key={day.toISOString()}
                className="absolute top-0 bottom-0 border-l border-border/25"
                style={{
                  left:  `calc(${TIME_GUTTER}px + ${di} * (100% - ${TIME_GUTTER}px) / 7)`,
                  width: `calc((100% - ${TIME_GUTTER}px) / 7)`,
                }}
              >
                {/* Hour clickable slots */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 hover:bg-blue-50/25 cursor-pointer group transition-colors"
                    style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    onClick={() => onSchedule(format(day, "yyyy-MM-dd"), `${String(hour).padStart(2, "0")}:00`)}
                  >
                    <Plus className="absolute top-1 right-1 w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}

                {/* Post chips, stacked within each hour */}
                {Array.from(byHour.entries()).flatMap(([hour, hPosts]) =>
                  hPosts.map((post, pi) => {
                    const minute     = getMinutes(new Date(post.scheduledTime));
                    const topOffset  = hour * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT * 0.5 + pi * 20 + 2;
                    const PlatformIcon = PLATFORM_ICONS[post.platform];
                    const color      = PLATFORM_COLORS[post.platform] ?? "#94a3b8";
                    const account    = accountMap.get(post.providerUserId);
                    const statusColor = STATUS_CONFIG[post.postStatus]?.color ?? "#94a3b8";

                    return (
                      <button
                        key={post.id}
                        onClick={(e) => { e.stopPropagation(); onDayClick(day); }}
                        title={`${account?.username ?? ""} · ${PLATFORM_LABELS[post.platform] ?? post.platform} · ${formatTime(post.scheduledTime)}`}
                        className="absolute z-10 flex items-center gap-1 rounded border text-[10px] font-medium transition-all hover:shadow-md active:scale-95"
                        style={{
                          left:           2,
                          right:          2,
                          top:            topOffset,
                          height:         18,
                          backgroundColor: color + "18",
                          borderColor:     color + "55",
                          color,
                        }}
                      >
                        {PlatformIcon && (
                          <PlatformIcon style={{ width: 9, height: 9, marginLeft: 3, flexShrink: 0 }} />
                        )}
                        <span className="truncate flex-1 px-0.5">
                          {account?.username ?? post.platform}
                        </span>
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0 mr-1.5"
                          style={{ backgroundColor: statusColor }}
                        />
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

// ── FilterBar ─────────────────────────────────────────────────────────────────

function FilterBar({
  groups,
  accounts,
  selectedGroupId,
  selectedAccountIds,
  onGroupChange,
  onAccountToggle,
  onClearFilters,
}: {
  groups: AccountGroup[];
  accounts: ConnectedAccount[];
  selectedGroupId: string;
  selectedAccountIds: string[];
  onGroupChange: (id: string) => void;
  onAccountToggle: (id: string) => void;
  onClearFilters: () => void;
}) {
  const [groupOpen,   setGroupOpen]   = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const groupRef   = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const timezone   = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (groupRef.current   && !groupRef.current.contains(e.target as Node))   setGroupOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const groupedIds = useMemo(() => new Set(groups.flatMap((g) => g.accountIds)), [groups]);

  const scopeAccounts = useMemo(() => {
    if (selectedGroupId === "all")       return accounts;
    if (selectedGroupId === "ungrouped") return accounts.filter((a) => !groupedIds.has(a.providerUserId));
    const grp = groups.find((g) => g.id === selectedGroupId);
    return grp ? accounts.filter((a) => grp.accountIds.includes(a.providerUserId)) : accounts;
  }, [selectedGroupId, groups, accounts, groupedIds]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const hasFilters    = selectedGroupId !== "all" || selectedAccountIds.length > 0;
  const groupLabel    = selectedGroupId === "all" ? "All groups" : selectedGroupId === "ungrouped" ? "Ungrouped" : selectedGroup?.name ?? "Group";
  const accountLabel  = selectedAccountIds.length === 0 ? "All accounts" : `${selectedAccountIds.length} account${selectedAccountIds.length !== 1 ? "s" : ""}`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40 bg-background/80 backdrop-blur-sm flex-wrap">
      <Filter className="w-3 h-3 text-muted-foreground/60 shrink-0" />

      {/* Group selector */}
      <div className="relative" ref={groupRef}>
        <button
          onClick={() => { setGroupOpen((v) => !v); setAccountOpen(false); }}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
            selectedGroupId !== "all"
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
          )}
        >
          {selectedGroup?.color && (
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selectedGroup.color }} />
          )}
          {groupLabel}
          <ChevronRight className={cn("w-3 h-3 transition-transform duration-200", groupOpen && "rotate-90")} />
        </button>

        <AnimatePresence>
          {groupOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 mt-1.5 w-52 bg-card border border-border rounded-xl shadow-xl z-30 overflow-hidden"
            >
              <div className="p-1">
                {[
                  { id: "all",       name: "All groups",  color: undefined },
                  ...groups.map((g) => ({ id: g.id, name: g.name, color: g.color })),
                  { id: "ungrouped", name: "Ungrouped",   color: undefined },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { onGroupChange(item.id); setGroupOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                      selectedGroupId === item.id ? "bg-blue-50 text-blue-700" : "text-foreground/70 hover:bg-muted"
                    )}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color ?? "#94a3b8" }}
                    />
                    {item.name}
                    {selectedGroupId === item.id && <CheckCircle2 className="w-3 h-3 ml-auto text-blue-500" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account selector */}
      <div className="relative" ref={accountRef}>
        <button
          onClick={() => { setAccountOpen((v) => !v); setGroupOpen(false); }}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
            selectedAccountIds.length > 0
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
          )}
        >
          <Users className="w-3 h-3 shrink-0" />
          {accountLabel}
          <ChevronRight className={cn("w-3 h-3 transition-transform duration-200", accountOpen && "rotate-90")} />
        </button>

        <AnimatePresence>
          {accountOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 mt-1.5 w-64 bg-card border border-border rounded-xl shadow-xl z-30 overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-border/40">
                <p className="text-[11px] text-muted-foreground font-medium">
                  {scopeAccounts.length} account{scopeAccounts.length !== 1 ? "s" : ""} in scope
                </p>
              </div>
              <div className="p-1 max-h-64 overflow-y-auto">
                {scopeAccounts.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3 px-2">No accounts in this group</p>
                ) : (
                  scopeAccounts.map((acc) => {
                    const PIcon   = PLATFORM_ICONS[acc.platform];
                    const color   = PLATFORM_COLORS[acc.platform] ?? "#94a3b8";
                    const checked = selectedAccountIds.includes(acc.providerUserId);
                    return (
                      <button
                        key={acc.providerUserId}
                        onClick={() => onAccountToggle(acc.providerUserId)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors",
                          checked ? "bg-blue-50 text-blue-700" : "text-foreground/70 hover:bg-muted"
                        )}
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: color + "1a" }}>
                          {PIcon && <PIcon style={{ width: 12, height: 12, color }} />}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold truncate">{acc.username}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{acc.platform}</p>
                        </div>
                        {checked && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}

      {/* Timezone pill — right-aligned */}
      <div className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/60 text-[10px] text-muted-foreground">
        <Globe className="w-3 h-3 shrink-0" />
        <span className="truncate max-w-[160px]">{timezone}</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [view, setView]               = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts]             = useState<CalendarPostResponse[]>([]);
  const [groups, setGroups]           = useState<AccountGroup[]>([]);
  const [accounts, setAccounts]       = useState<ConnectedAccount[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const [selectedGroupId,    setSelectedGroupId]    = useState("all");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [sheetOpen,   setSheetOpen]   = useState(false);

  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [a.providerUserId, a])),
    [accounts]
  );

  // Derived: which providerUserIds to filter on
  const activeProviderUserIds = useMemo(() => {
    if (selectedAccountIds.length > 0) return selectedAccountIds;
    const groupedIds = new Set(groups.flatMap((g) => g.accountIds));
    if (selectedGroupId === "all")       return [];
    if (selectedGroupId === "ungrouped") return accounts.filter((a) => !groupedIds.has(a.providerUserId)).map((a) => a.providerUserId);
    const grp = groups.find((g) => g.id === selectedGroupId);
    return grp ? grp.accountIds : [];
  }, [selectedGroupId, selectedAccountIds, groups, accounts]);

  // Load groups + accounts once
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoadingData(true);
        const [gs, accs] = await Promise.all([
          fetchAccountGroupsApi(getToken),
          fetchAllConnectedAccountsApi(getToken),
        ]);
        if (cancelled) return;
        setGroups(gs ?? []);
        setAccounts(accs ?? []);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load accounts");
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [getToken]);

  // Fetch posts when view / date / filters change
  useEffect(() => {
    if (loadingData) return;
    let cancelled = false;
    async function fetchPosts() {
      try {
        setLoadingPosts(true);
        const range = view === "month"
          ? getUTCRangeForMonth(currentDate)
          : getUTCRangeForWeek(currentDate);

        const data = await fetchCalendarPostsApi(
          getToken,
          range.startDate,
          range.endDate,
          activeProviderUserIds.length > 0 ? activeProviderUserIds : undefined
        );
        if (!cancelled) setPosts(data ?? []);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load calendar posts");
      } finally {
        if (!cancelled) setLoadingPosts(false);
      }
    }
    fetchPosts();
    return () => { cancelled = true; };
  }, [view, currentDate, activeProviderUserIds, loadingData, getToken]);

  const postsByDay = useMemo(() => groupPostsByDay(posts), [posts]);

  function goBack()    { view === "month" ? setCurrentDate(subMonths(currentDate, 1)) : setCurrentDate(subWeeks(currentDate, 1)); }
  function goForward() { view === "month" ? setCurrentDate(addMonths(currentDate, 1)) : setCurrentDate(addWeeks(currentDate, 1)); }
  function goToday()   { setCurrentDate(new Date()); }

  function handleDayClick(day: Date) {
    setSelectedDay(day);
    setSheetOpen(true);
  }

  function handleSchedule(date: string, time: string) {
    router.push(`/schedule-post?date=${date}&time=${time}`);
  }

  function handleGroupChange(id: string) {
    setSelectedGroupId(id);
    setSelectedAccountIds([]);
  }

  function handleAccountToggle(id: string) {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const headerLabel = view === "month"
    ? format(currentDate, "MMMM yyyy")
    : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")} – ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d, yyyy")}`;

  const selectedDayPosts = useMemo(
    () => (selectedDay ? postsByDay.get(getDayKey(selectedDay)) ?? [] : []),
    [selectedDay, postsByDay]
  );

  if (loadingData) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground">Loading calendar…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={() => { setError(null); setLoadingData(true); }} className="text-xs text-blue-500 hover:underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-border bg-card/95 backdrop-blur-xl shadow-sm">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">

            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center shrink-0">
                <Calendar className="w-[18px] h-[18px] text-blue-500" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground tracking-tight leading-tight">Content Calendar</h1>
                <p className="text-xs text-muted-foreground leading-tight">
                  {loadingPosts
                    ? "Refreshing…"
                    : posts.length > 0
                    ? `${posts.length} post${posts.length !== 1 ? "s" : ""} in view`
                    : "Visual overview of all your scheduled content"}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1.5">
              <button onClick={goBack} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={goToday} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
                Today
              </button>
              <button onClick={goForward} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="mx-1.5 h-5 w-px bg-border" />
              <h2 className="text-sm font-bold text-foreground min-w-[140px]">{headerLabel}</h2>
              {loadingPosts && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/60 ml-0.5" />}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setView("month")}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all", view === "month" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Month
              </button>
              <button
                onClick={() => setView("week")}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all", view === "week" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Week
              </button>
            </div>
          </div>
        </div>

        <FilterBar
          groups={groups}
          accounts={accounts}
          selectedGroupId={selectedGroupId}
          selectedAccountIds={selectedAccountIds}
          onGroupChange={handleGroupChange}
          onAccountToggle={handleAccountToggle}
          onClearFilters={() => { setSelectedGroupId("all"); setSelectedAccountIds([]); }}
        />
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {accounts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-2">No connected accounts</h3>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Connect your social accounts to start scheduling posts and see everything visualised here.
            </p>
            <a href="/connect-accounts" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
              Connect Accounts
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
            className="flex-1 overflow-hidden flex flex-col"
          >
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
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Day Detail Sheet ──────────────────────────────────────────────────── */}
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

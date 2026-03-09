"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";

import {
  Clock,
  Calendar,
  Link2,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Zap,
  BarChart2,
  ChevronRight,
  Sparkles,
  Activity,
  Globe,
  ImageIcon,
  Video,
  FileText,
  RefreshCw,
} from "lucide-react";

import { fetchPaginatedPostsApi } from "@/service/pagingatedPosts";
import { fetchConnectedAccountsApi } from "@/service/connectedAccounts";
import { fetchPostCollectionsApi } from "@/service/fetchPostCollections";
import { fetchUsageStatsApi, fetchUserPlanApi } from "@/service/plan";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { cn } from "@/lib/utils";

import type { PostResponse } from "@/model/PostResponse";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { UsageStats, UserPlan } from "@/model/Plan";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function relativeTime(iso: string | undefined): { label: string; urgent: boolean } {
  if (!iso) return { label: "—", urgent: false };
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return { label: "Past due", urgent: true };
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (hrs < 1) return { label: "< 1 hour", urgent: true };
  if (hrs < 6) return { label: `In ${hrs}h`, urgent: true };
  if (hrs < 24) return { label: `In ${hrs}h`, urgent: false };
  if (days === 1) return { label: "Tomorrow", urgent: false };
  return { label: `In ${days}d`, urgent: false };
}

function formatShort(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

// ─── platform colours (gradient pair) ─────────────────────────────────────────

const PLATFORM_GRAD: Record<string, string> = {
  instagram: "from-pink-500 to-rose-500",
  x: "from-slate-600 to-slate-800",
  linkedin: "from-blue-600 to-blue-800",
  facebook: "from-blue-500 to-blue-700",
  youtube: "from-red-500 to-red-700",
  threads: "from-slate-600 to-slate-900",
  tiktok: "from-slate-800 to-zinc-900",
};

const PLATFORM_BG: Record<string, string> = {
  instagram: "bg-pink-50 dark:bg-pink-900/20",
  x: "bg-slate-100 dark:bg-slate-800/40",
  linkedin: "bg-blue-50 dark:bg-blue-900/20",
  facebook: "bg-blue-50 dark:bg-blue-900/20",
  youtube: "bg-red-50 dark:bg-red-900/20",
  threads: "bg-slate-100 dark:bg-slate-800/40",
  tiktok: "bg-slate-100 dark:bg-slate-800/40",
};

const TYPE_META = {
  IMAGE: { Icon: ImageIcon, label: "Image", cls: "text-violet-600 bg-violet-50 border-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800/30" },
  VIDEO: { Icon: Video,     label: "Video", cls: "text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30" },
  TEXT:  { Icon: FileText,  label: "Text",  cls: "text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/30" },
} as const;

// ─── page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [scheduledPosts, setScheduledPosts] = useState<PostResponse[]>([]);
  const [publishedCols,  setPublishedCols]  = useState<PostCollectionResponse[]>([]);
  const [failedPosts,    setFailedPosts]    = useState<PostResponse[]>([]);
  const [accounts,       setAccounts]       = useState<ConnectedAccount[]>([]);
  const [usageStats,     setUsageStats]     = useState<UsageStats | null>(null);
  const [userPlan,       setUserPlan]       = useState<UserPlan | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [refreshKey,     setRefreshKey]     = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [upcomingRes, accountsRes, publishedRes, failedRes, usageRes, planRes] = await Promise.all([
          fetchPaginatedPostsApi(getToken, 0, "SCHEDULED"),
          fetchConnectedAccountsApi(getToken, null),
          fetchPostCollectionsApi(getToken, 0, "published"),
          fetchPaginatedPostsApi(getToken, 0, "FAILED"),
          fetchUsageStatsApi(getToken),
          fetchUserPlanApi(getToken),
        ]);
        setScheduledPosts(upcomingRes.content);
        setAccounts(accountsRes);
        setPublishedCols(publishedRes.content);
        setFailedPosts(failedRes.content);
        setUsageStats(usageRes);
        setUserPlan(planRes);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken, refreshKey]);

  // ── derived ────────────────────────────────────────────────────────────────

  const today        = new Date().toISOString().slice(0, 10);
  const weekFromNow  = new Date(Date.now() + 7 * 86_400_000).toISOString();
  const scheduledToday    = scheduledPosts.filter((p) => p.scheduledTime?.startsWith(today)).length;
  const scheduledThisWeek = scheduledPosts.filter((p) => p.scheduledTime && p.scheduledTime <= weekFromNow).length;
  const failedCount  = failedPosts.length;
  const firstName    = user?.firstName ?? "";

  // platform distribution (scheduled queue)
  const platformCounts: Record<string, number> = {};
  scheduledPosts.forEach((p) => {
    if (p.provider) platformCounts[p.provider] = (platformCounts[p.provider] ?? 0) + 1;
  });
  const topPlatforms = Object.entries(platformCounts).sort(([, a], [, b]) => b - a).slice(0, 6);

  // post type distribution (scheduled)
  const typeCounts: Record<string, number> = {};
  scheduledPosts.forEach((p) => {
    const type = (p as any).postType ?? "TEXT";
    typeCounts[type] = (typeCounts[type] ?? 0) + 1;
  });

  // trial days left
  const trialDaysLeft = userPlan?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(userPlan.trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;

  // usage progress
  const postsProgress = usageStats
    ? typeof usageStats.postsLimit === "number"
      ? Math.min(100, (usageStats.postsUsedThisMonth / usageStats.postsLimit) * 100)
      : 0
    : 0;
  const accsProgress = usageStats && typeof usageStats.connectedAccountsLimit === "number"
    ? Math.min(100, (usageStats.connectedAccountsCount / usageStats.connectedAccountsLimit) * 100)
    : 0;

  // ── loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
        </div>
      </main>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-background">

      {/* ── Sticky header ────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[17px] font-semibold text-foreground tracking-tight leading-tight">
              {getGreeting()}{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your content hub — everything at a glance
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Failed badge */}
            {failedCount > 0 && (
              <Link href="/scheduled-posts">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {failedCount} failed
                </div>
              </Link>
            )}

            {/* Refresh */}
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* New post CTA */}
            <Link href="/schedule-post">
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm">
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Post</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Trial banner ─────────────────────────────────────────── */}
      {userPlan?.status === "TRIALING" && trialDaysLeft !== null && (
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-violet-200 flex-shrink-0" />
              <span className="font-semibold text-white">Free trial active</span>
              <span className="text-violet-200 hidden sm:inline">·</span>
              <span className="text-violet-100 hidden sm:inline">
                {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining
              </span>
            </div>
            <Link
              href="/profile"
              className="text-xs font-semibold text-white/90 hover:text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap border border-white/20"
            >
              Upgrade plan →
            </Link>
          </div>
        </div>
      )}

      {/* ── Page content ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Stats row — 4 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={Calendar}    label="Scheduled Today"  value={scheduledToday}      accent />
          <StatCard icon={Clock}       label="This Week"        value={scheduledThisWeek} />
          <StatCard icon={TrendingUp}  label="Published Total"  value={publishedCols.length} />
          <StatCard icon={Link2}       label="Accounts"         value={accounts.length} />
        </div>

        {/* ── Two-column layout ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT — 2/3 */}
          <div className="lg:col-span-2 space-y-5">

            {/* Upcoming Posts */}
            <section className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <h2 className="text-[14px] font-semibold text-foreground">Upcoming Posts</h2>
                  {scheduledPosts.length > 0 && (
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/40">
                      {scheduledPosts.length}
                    </span>
                  )}
                </div>
                <Link
                  href="/scheduled-posts"
                  className="flex items-center gap-1 text-xs font-medium text-accent hover:opacity-75 transition-opacity"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {scheduledPosts.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No posts scheduled"
                  desc="Schedule content to multiple platforms at once"
                  cta="Schedule your first post"
                  href="/schedule-post"
                />
              ) : (
                <div className="divide-y divide-border/40">
                  {scheduledPosts.slice(0, 6).map((post) => {
                    const PlatformIcon = post.provider ? PLATFORM_ICONS[post.provider] : null;
                    const { label: timeLabel, urgent } = relativeTime(post.scheduledTime);

                    return (
                      <Link key={post.id} href="/scheduled-posts">
                        <div className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-muted/30 transition-colors group cursor-pointer">
                          {/* Platform gradient icon */}
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-sm",
                              post.provider
                                ? PLATFORM_GRAD[post.provider] ?? "from-slate-500 to-slate-700"
                                : "from-slate-400 to-slate-600"
                            )}
                          >
                            {PlatformIcon && <PlatformIcon className="w-4 h-4 text-white" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate leading-snug">
                              {post.title || "Untitled Post"}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                              {post.provider}
                            </p>
                          </div>

                          {/* Time chip */}
                          <span
                            className={cn(
                              "text-[11px] font-semibold px-2 py-1 rounded-lg border flex-shrink-0",
                              urgent
                                ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30"
                                : "bg-muted/40 text-muted-foreground border-border/40"
                            )}
                          >
                            {timeLabel}
                          </span>

                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Platform distribution */}
            {topPlatforms.length > 0 && (
              <section className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                      <BarChart2 className="w-3.5 h-3.5 text-violet-500" />
                    </div>
                    <h2 className="text-[14px] font-semibold text-foreground">Scheduled by Platform</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">{scheduledPosts.length} post{scheduledPosts.length !== 1 ? "s" : ""} queued</span>
                </div>

                <div className="p-5 space-y-3.5">
                  {topPlatforms.map(([platform, count]) => {
                    const Icon = PLATFORM_ICONS[platform];
                    const pct  = Math.round((count / scheduledPosts.length) * 100);
                    return (
                      <div key={platform} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-sm",
                            PLATFORM_GRAD[platform] ?? "from-slate-500 to-slate-700"
                          )}
                        >
                          {Icon && <Icon className="w-4 h-4 text-white" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-foreground capitalize">{platform}</span>
                            <span className="text-xs text-muted-foreground">
                              {count} post{count !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-accent/70 transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        <span className="text-xs font-bold text-muted-foreground w-9 text-right tabular-nums">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Recently Published */}
            {publishedCols.length > 0 && (
              <section className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <h2 className="text-[14px] font-semibold text-foreground">Recently Published</h2>
                  </div>
                  <Link
                    href="/published-posts"
                    className="flex items-center gap-1 text-xs font-medium text-accent hover:opacity-75 transition-opacity"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="divide-y divide-border/40">
                  {publishedCols.slice(0, 4).map((col) => {
                    const platforms = Array.from(new Set(col.posts.map((p) => p.provider)));
                    const typeMeta  = TYPE_META[col.postCollectionType as keyof typeof TYPE_META] ?? TYPE_META.TEXT;
                    const TypeIcon  = typeMeta.Icon;

                    return (
                      <Link key={col.id} href={`/published-posts/${col.id}`}>
                        <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group cursor-pointer">
                          {/* Stacked platform icons */}
                          <div className="flex items-center flex-shrink-0" style={{ width: Math.min(platforms.length, 3) * 18 + 10 }}>
                            {platforms.slice(0, 3).map((platform, i) => {
                              const Icon = PLATFORM_ICONS[platform];
                              return (
                                <div
                                  key={platform}
                                  className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center border-2 border-card bg-gradient-to-br shadow-sm",
                                    PLATFORM_GRAD[platform] ?? "from-slate-500 to-slate-700"
                                  )}
                                  style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }}
                                >
                                  {Icon && <Icon className="w-3 h-3 text-white" />}
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{col.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{formatShort(col.scheduledTime)}</p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-lg border", typeMeta.cls)}>
                              <TypeIcon className="w-2.5 h-2.5" />
                              {typeMeta.label}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">
                              Published
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT — 1/3 */}
          <div className="space-y-4">

            {/* Usage & Plan */}
            {usageStats && (
              <section className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <h2 className="text-[14px] font-semibold text-foreground">Usage This Month</h2>
                </div>

                <div className="p-5 space-y-4">
                  {/* Posts bar */}
                  <UsageBar
                    label="Posts published"
                    used={usageStats.postsUsedThisMonth}
                    limit={usageStats.postsLimit}
                    progress={postsProgress}
                    colorClass={
                      postsProgress > 85 ? "bg-red-400" :
                      postsProgress > 60 ? "bg-amber-400" : "bg-accent"
                    }
                  />

                  {/* Accounts bar */}
                  <UsageBar
                    label="Connected accounts"
                    used={usageStats.connectedAccountsCount}
                    limit={usageStats.connectedAccountsLimit}
                    progress={accsProgress}
                    colorClass="bg-violet-400"
                  />

                  {/* Plan chip */}
                  {userPlan && (
                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="text-xs text-muted-foreground">Current plan</span>
                      <span
                        className={cn(
                          "text-[11px] font-bold px-2.5 py-1 rounded-full border",
                          userPlan.currentPlan === "TRIAL"      ? "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800/40" :
                          userPlan.currentPlan === "PRO"        ? "bg-accent/10 text-accent border-accent/20" :
                          userPlan.currentPlan === "ENTERPRISE" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400" :
                          "bg-muted text-muted-foreground border-border/50"
                        )}
                      >
                        {userPlan.currentPlan}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Connected Accounts */}
            <section className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5 text-sky-500" />
                </div>
                <h2 className="text-[14px] font-semibold text-foreground">Connected Accounts</h2>
              </div>

              <div className="p-5">
                {accounts.length === 0 ? (
                  <div className="text-center py-4">
                    <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground mb-1">No accounts connected</p>
                    <p className="text-xs text-muted-foreground mb-3">Connect your social media accounts to start scheduling</p>
                    <Link href="/connect-accounts">
                      <button className="text-xs font-semibold text-accent hover:opacity-75 transition-opacity">
                        Connect an account →
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {accounts.slice(0, 5).map((acc) => {
                      const Icon = PLATFORM_ICONS[acc.platform];
                      return (
                        <div key={acc.providerUserId} className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-sm",
                              PLATFORM_GRAD[acc.platform] ?? "from-slate-500 to-slate-700"
                            )}
                          >
                            {Icon && <Icon className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground capitalize">{acc.platform}</p>
                            <p className="text-[11px] text-muted-foreground truncate">@{acc.username}</p>
                          </div>
                          {/* Active indicator */}
                          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-sm" title="Active" />
                        </div>
                      );
                    })}

                    {accounts.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{accounts.length - 5} more
                      </p>
                    )}

                    <div className="pt-2 border-t border-border/40">
                      <Link href="/connect-accounts">
                        <button className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground py-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <Link2 className="w-3 h-3" />
                          Manage accounts
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <h2 className="text-[14px] font-semibold text-foreground">Quick Actions</h2>
              </div>

              <div className="p-2">
                <QuickAction href="/schedule-post"   icon={PlusCircle} label="Schedule a post"    desc="Create & publish content"    accent />
                <QuickAction href="/scheduled-posts" icon={Clock}       label="Scheduled posts"    desc="View your upcoming queue" />
                <QuickAction href="/calendar"        icon={Calendar}    label="Content calendar"   desc="Monthly overview at a glance" />
                <QuickAction href="/connect-accounts" icon={Link2}      label="Connect accounts"   desc="Add social media platforms" />
              </div>
            </section>

            {/* Failed posts alert */}
            {failedCount > 0 && (
              <Link href="/scheduled-posts">
                <div className="rounded-2xl bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-800/30 p-4 hover:bg-red-100/60 dark:hover:bg-red-900/25 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        {failedCount} post{failedCount !== 1 ? "s" : ""} failed to publish
                      </p>
                      <p className="text-xs text-red-500/80 mt-0.5">
                        Review and reschedule to fix publishing issues
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0" />
                  </div>
                </div>
              </Link>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5 shadow-sm transition-all duration-200",
        danger
          ? "bg-red-50 border-red-100 dark:bg-red-900/15 dark:border-red-800/30"
          : "bg-card border-border/50 hover:shadow-md hover:border-border/80"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 leading-none">
            {label}
          </p>
          <p
            className={cn(
              "text-3xl font-bold tracking-tight tabular-nums mt-1",
              danger ? "text-red-600 dark:text-red-400" : "text-foreground"
            )}
          >
            {value}
          </p>
        </div>
        <div
          className={cn(
            "p-2.5 rounded-xl flex-shrink-0",
            danger ? "bg-red-100 dark:bg-red-900/30" :
            accent ? "bg-accent/10" : "bg-muted/60"
          )}
        >
          <Icon
            className={cn(
              "w-4 h-4",
              danger ? "text-red-500" :
              accent ? "text-accent" : "text-muted-foreground"
            )}
          />
        </div>
      </div>
    </div>
  );
}

function UsageBar({
  label,
  used,
  limit,
  progress,
  colorClass,
}: {
  label: string;
  used: number;
  limit: number | "Unlimited";
  progress: number;
  colorClass: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {used} / {limit === "Unlimited" ? "∞" : limit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", colorClass)}
          style={{ width: `${progress}%` }}
        />
      </div>
      {limit !== "Unlimited" && (
        <p className="text-[11px] text-muted-foreground mt-1">
          {Math.round(progress)}% of limit used
        </p>
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  desc,
  accent,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  desc?: string;
  accent?: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group cursor-pointer",
          accent ? "hover:bg-accent/8" : "hover:bg-muted/50"
        )}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            accent ? "bg-accent/10" : "bg-muted/70"
          )}
        >
          <Icon className={cn("w-4 h-4", accent ? "text-accent" : "text-muted-foreground")} />
        </div>

        <div className="flex-1 min-w-0">
          <span className={cn("text-sm font-medium block leading-snug", accent ? "text-accent" : "text-foreground")}>
            {label}
          </span>
          {desc && (
            <span className="text-[11px] text-muted-foreground leading-none">{desc}</span>
          )}
        </div>

        <ArrowRight className="w-3 h-3 text-muted-foreground/30 group-hover:translate-x-0.5 group-hover:text-muted-foreground/60 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}

function EmptyState({
  icon: Icon,
  title,
  desc,
  cta,
  href,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/10 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-accent/50" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground mb-4 max-w-[220px] leading-relaxed">{desc}</p>
      <Link href={href}>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:opacity-75 transition-opacity bg-accent/8 px-4 py-2 rounded-xl border border-accent/10">
          {cta} <ArrowRight className="w-3 h-3" />
        </button>
      </Link>
    </div>
  );
}

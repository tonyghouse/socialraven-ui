"use client";

import AtlassianButton, { LinkButton } from "@atlaskit/button/new";
import ProgressBar from "@atlaskit/progress-bar";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";

import {
  Clock,
  Calendar,
  Link2,
  PlusCircle,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Zap,
  BarChart2,
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
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
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

const PLATFORM_BG: Record<string, string> = {
  instagram: "bg-[hsl(var(--surface-raised))] text-pink-600 dark:text-pink-300",
  x: "bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground))]",
  linkedin: "bg-[hsl(var(--surface-raised))] text-blue-600 dark:text-blue-300",
  facebook: "bg-[hsl(var(--surface-raised))] text-blue-600 dark:text-blue-300",
  youtube: "bg-[hsl(var(--surface-raised))] text-red-600 dark:text-red-300",
  threads: "bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground))]",
  tiktok: "bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground))]",
};

const TYPE_META = {
  IMAGE: { Icon: ImageIcon, label: "Image" },
  VIDEO: { Icon: Video, label: "Video" },
  TEXT: { Icon: FileText, label: "Text" },
} as const;

const sectionClassName =
  "overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgb(0 0 0 / 0.08)]";

const rowHoverClassName =
  "transition-colors duration-150 hover:bg-[hsl(var(--surface-raised))]/70";

const badgeVariants = {
  neutral: "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]",
  subtle: "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground))]",
  accent: "border-[hsl(var(--accent))]/15 bg-[hsl(var(--accent))]/8 text-[hsl(var(--accent))]",
  success: "border-[hsl(var(--success))]/18 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  warning: "border-[hsl(var(--warning))]/18 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
} as const;

// ─── page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [scheduledPosts, setScheduledPosts] = useState<PostResponse[]>([]);
  const [publishedCols,  setPublishedCols]  = useState<PostCollectionResponse[]>([]);
  const [accounts,       setAccounts]       = useState<ConnectedAccount[]>([]);
  const [usageStats,     setUsageStats]     = useState<UsageStats | null>(null);
  const [userPlan,       setUserPlan]       = useState<UserPlan | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [refreshKey,     setRefreshKey]     = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [upcomingRes, accountsRes, publishedRes, usageRes, planRes] =
          await Promise.allSettled([
            fetchPaginatedPostsApi(getToken, 0, "SCHEDULED"),
            fetchConnectedAccountsApi(getToken, null),
            fetchPostCollectionsApi(getToken, 0, "published"),
            fetchUsageStatsApi(getToken),
            fetchUserPlanApi(getToken),
          ]);

        if (upcomingRes.status === "fulfilled")  setScheduledPosts(upcomingRes.value.content);
        if (accountsRes.status === "fulfilled")  setAccounts(accountsRes.value);
        if (publishedRes.status === "fulfilled") setPublishedCols(publishedRes.value.content);
        if (usageRes.status === "fulfilled")     setUsageStats(usageRes.value);
        if (planRes.status === "fulfilled")      setUserPlan(planRes.value);

        const errors = [upcomingRes, accountsRes, publishedRes, usageRes, planRes]
          .filter((r) => r.status === "rejected")
          .map((r) => (r as PromiseRejectedResult).reason);
        if (errors.length > 0) console.error("Dashboard load errors:", errors);
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
    return <DashboardPageSkeleton />;
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">

      <ProtectedPageHeader
        title={`${getGreeting()}${firstName ? `, ${firstName}` : ""}`}
        description="Your content hub, everything at a glance."
        actions={
          <>
            <AtlassianButton
              appearance="subtle"
              onClick={() => setRefreshKey((k) => k + 1)}
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </AtlassianButton>

            <LinkButton appearance="primary" href="/schedule-post">
              <span className="inline-flex items-center gap-1.5">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Post</span>
                <span className="sm:hidden">New</span>
              </span>
            </LinkButton>
          </>
        }
      />

      {/* ── Trial banner ─────────────────────────────────────────── */}
      {userPlan?.status === "TRIALING" && trialDaysLeft !== null && (
        <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-4 py-3 dark:bg-[hsl(var(--surface-sunken))] sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <StatusBadge variant="accent">Trial</StatusBadge>
                <p className="text-sm font-medium leading-5 text-[hsl(var(--foreground))]">
                  Free trial active
                </p>
              </div>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))] dark:text-[hsl(var(--foreground-subtle))]">
                {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining on your trial.
              </p>
            </div>
            <LinkButton appearance="primary" href="/profile">
              Upgrade plan
            </LinkButton>
          </div>
        </div>
      )}

      {/* ── Page content ─────────────────────────────────────────── */}
      <div className="space-y-6 px-4 py-6 sm:px-6">

        {/* Stats row — 4 cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
          <StatCard icon={Calendar}    label="Scheduled Today"  value={scheduledToday}      accent />
          <StatCard icon={Clock}       label="This Week"        value={scheduledThisWeek} />
          <StatCard icon={TrendingUp}  label="Published Total"  value={publishedCols.length} />
          <StatCard icon={Link2}       label="Accounts"         value={accounts.length} />
        </div>

        {/* ── Two-column layout ───────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* LEFT — 2/3 */}
          <div className="space-y-5 lg:col-span-2">

            {/* Upcoming Posts */}
            <section className={sectionClassName}>
              <div className="flex items-center justify-between border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Upcoming Posts</h2>
                  {scheduledPosts.length > 0 && (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-1.5 py-0.5 text-xs font-medium leading-4 text-[hsl(var(--foreground-muted))]">
                      {scheduledPosts.length}
                    </span>
                  )}
                </div>
                <LinkButton appearance="subtle" href="/scheduled-posts" spacing="compact">
                  View all
                </LinkButton>
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
                <div className="divide-y divide-[hsl(var(--border-subtle))]">
                  {scheduledPosts.slice(0, 6).map((post) => {
                    const PlatformIcon = post.provider ? PLATFORM_ICONS[post.provider] : null;
                    const { label: timeLabel, urgent } = relativeTime(post.scheduledTime ?? "");

                    return (
                      <Link key={post.id} href="/scheduled-posts">
                        <div className={cn("group flex cursor-pointer items-center gap-3.5 px-5 py-3.5", rowHoverClassName)}>
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))]",
                              post.provider
                                ? PLATFORM_BG[post.provider] ?? "bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground))]"
                                : "bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground))]"
                            )}
                          >
                            {PlatformIcon && <PlatformIcon className="h-4 w-4" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium leading-5 text-[hsl(var(--foreground))]">
                              {post.description || "No content"}
                            </p>
                            <p className="mt-0.5 text-xs leading-4 text-[hsl(var(--foreground-muted))] capitalize">
                              {post.provider}
                            </p>
                          </div>

                          <StatusBadge variant={urgent ? "warning" : "neutral"}>
                            {timeLabel}
                          </StatusBadge>

                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--foreground-subtle))] transition-all group-hover:translate-x-0.5 group-hover:text-[hsl(var(--accent))]" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Platform distribution */}
            {topPlatforms.length > 0 && (
              <section className={sectionClassName}>
                <div className="flex items-center justify-between border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
                      <BarChart2 className="h-3.5 w-3.5" />
                    </div>
                    <h2 className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Scheduled by Platform</h2>
                  </div>
                  <span className="text-xs leading-4 text-[hsl(var(--foreground-muted))]">{scheduledPosts.length} post{scheduledPosts.length !== 1 ? "s" : ""} queued</span>
                </div>

                <div className="space-y-4 p-5">
                  {topPlatforms.map(([platform, count]) => {
                    const Icon = PLATFORM_ICONS[platform];
                    const pct  = Math.round((count / scheduledPosts.length) * 100);
                    return (
                      <div key={platform} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))]",
                            PLATFORM_BG[platform] ?? "bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground))]"
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium leading-5 text-[hsl(var(--foreground))] capitalize">{platform}</span>
                            <span className="text-xs leading-4 text-[hsl(var(--foreground-muted))]">
                              {count} post{count !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <ProgressBar ariaLabel={`${platform} scheduled posts`} value={pct / 100} appearance="default" />
                        </div>

                        <span className="w-9 text-right text-xs font-medium leading-4 tabular-nums text-[hsl(var(--foreground-muted))]">
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
              <section className={sectionClassName}>
                <div className="flex items-center justify-between border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
                      <CheckCircle className="h-3.5 w-3.5" />
                    </div>
                    <h2 className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Recently Published</h2>
                  </div>
                  <LinkButton appearance="subtle" href="/published-posts" spacing="compact">
                    View all
                  </LinkButton>
                </div>

                <div className="divide-y divide-[hsl(var(--border-subtle))]">
                  {publishedCols.slice(0, 4).map((col) => {
                    const platforms = Array.from(new Set(col.posts.map((p) => p.provider)));
                    const typeMeta  = TYPE_META[col.postCollectionType as keyof typeof TYPE_META] ?? TYPE_META.TEXT;
                    const TypeIcon  = typeMeta.Icon;

                    return (
                      <Link key={col.id} href={`/published-posts/${col.id}`}>
                        <div className={cn("group flex cursor-pointer items-center gap-4 px-5 py-3.5", rowHoverClassName)}>
                          <div className="flex items-center flex-shrink-0" style={{ width: Math.min(platforms.length, 3) * 18 + 10 }}>
                            {platforms.slice(0, 3).map((platform, i) => {
                              const Icon = PLATFORM_ICONS[platform];
                              return (
                                <div
                                  key={platform}
                                  className={cn(
                                    "flex h-7 w-7 items-center justify-center rounded-full border-2 border-[hsl(var(--surface))]",
                                    PLATFORM_BG[platform] ?? "bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground))]"
                                  )}
                                  style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }}
                                >
                                  {Icon && <Icon className="h-3 w-3" />}
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium leading-5 text-[hsl(var(--foreground))]">{col.description}</p>
                            <p className="mt-0.5 text-xs leading-4 text-[hsl(var(--foreground-muted))]">{col.scheduledTime ? formatShort(col.scheduledTime) : ""}</p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <StatusBadge variant="neutral">
                              <span className="inline-flex items-center gap-1">
                                <TypeIcon className="h-2.5 w-2.5" />
                                <span>{typeMeta.label}</span>
                              </span>
                            </StatusBadge>
                            <StatusBadge variant="success">Published</StatusBadge>
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
              <section className={sectionClassName}>
                <div className="flex items-center gap-2 border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Usage This Month</h2>
                </div>

                <div className="p-5 space-y-4">
                  <UsageBar
                    label="Posts published"
                    used={usageStats.postsUsedThisMonth}
                    limit={usageStats.postsLimit}
                    progress={postsProgress}
                  />

                  <UsageBar
                    label="Connected accounts"
                    used={usageStats.connectedAccountsCount}
                    limit={usageStats.connectedAccountsLimit}
                    progress={accsProgress}
                  />

                  {userPlan && (
                    <div className="flex items-center justify-between border-t border-[hsl(var(--border-subtle))] pt-2">
                      <span className="text-xs leading-4 text-[hsl(var(--foreground-muted))]">Current plan</span>
                      <StatusBadge
                        variant={
                          userPlan.currentPlan.endsWith("_TRIAL")
                            ? "accent"
                            : userPlan.currentPlan.endsWith("_PRO")
                              ? "accent"
                              : userPlan.currentPlan.startsWith("AGENCY")
                                ? "warning"
                                : "neutral"
                        }
                      >
                        {userPlan.currentPlan}
                      </StatusBadge>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Connected Accounts */}
            <section className={sectionClassName}>
              <div className="flex items-center gap-2 border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Connected Accounts</h2>
              </div>

              <div className="p-5">
                {accounts.length === 0 ? (
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-4 py-4 dark:bg-[hsl(var(--surface-sunken))]">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge variant="warning">Attention</StatusBadge>
                        <p className="text-sm font-medium leading-5 text-[hsl(var(--foreground))]">
                          No accounts connected
                        </p>
                      </div>
                      <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))] dark:text-[hsl(var(--foreground-subtle))]">
                        Connect your social media accounts to start scheduling.
                      </p>
                      <div>
                        <LinkButton appearance="primary" href="/connect-accounts">
                          Connect an account
                        </LinkButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {accounts.slice(0, 5).map((acc) => {
                      const Icon = PLATFORM_ICONS[acc.platform];
                      return (
                        <div key={acc.providerUserId} className="flex items-center gap-3 rounded-lg px-1 py-1.5">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))]",
                              PLATFORM_BG[acc.platform] ?? "bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground))]"
                            )}
                          >
                            {Icon && <Icon className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-5 text-[hsl(var(--foreground))] capitalize">{acc.platform}</p>
                            <p className="truncate text-xs leading-4 text-[hsl(var(--foreground-muted))]">@{acc.username}</p>
                          </div>
                          <StatusBadge variant="success">Active</StatusBadge>
                        </div>
                      );
                    })}

                    {accounts.length > 5 && (
                      <p className="text-center text-xs leading-4 text-[hsl(var(--foreground-muted))]">
                        +{accounts.length - 5} more
                      </p>
                    )}

                    <div className="border-t border-[hsl(var(--border-subtle))] pt-2">
                      <TokenLink href="/connect-accounts" fullWidth>
                        <span className="inline-flex items-center gap-1.5">
                          <Link2 className="h-3 w-3" />
                          <span>Manage accounts</span>
                        </span>
                      </TokenLink>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Actions */}
            <section className={sectionClassName}>
              <div className="flex items-center gap-2 border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Quick Actions</h2>
              </div>

              <div className="p-2">
                <QuickAction href="/schedule-post"   icon={PlusCircle} label="Schedule a post"    desc="Create & publish content"    accent />
                <QuickAction href="/scheduled-posts" icon={Clock}       label="Scheduled posts"    desc="View your upcoming queue" />
                <QuickAction href="/calendar"        icon={Calendar}    label="Content calendar"   desc="Monthly overview at a glance" />
                <QuickAction href="/connect-accounts" icon={Link2}      label="Connect accounts"   desc="Add social media platforms" />
              </div>
            </section>

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
        "rounded-xl border p-4 shadow-[0_1px_2px_rgb(0 0 0 / 0.08)] transition-colors duration-150",
        danger
          ? "border-red-200 bg-red-50/70 dark:border-red-900/40 dark:bg-red-950/20"
          : "border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-raised))]/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="mb-1.5 text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 text-[28px] font-bold leading-8 tracking-[-0.01em] tabular-nums",
              danger ? "text-red-600 dark:text-red-400" : "text-[hsl(var(--foreground))]"
            )}
          >
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            danger
              ? "border-red-200 bg-red-100 text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
              : accent
                ? "border-[hsl(var(--accent))]/15 bg-[hsl(var(--accent))]/8 text-[hsl(var(--accent))]"
                : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: keyof typeof badgeVariants;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-xs font-medium leading-4",
        badgeVariants[variant]
      )}
    >
      {children}
    </span>
  );
}

function TokenLink({
  href,
  children,
  fullWidth,
}: {
  href: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm font-medium leading-5 text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--foreground))]",
        fullWidth && "flex w-full"
      )}
    >
      {children}
    </Link>
  );
}

function UsageBar({
  label,
  used,
  limit,
  progress,
}: {
  label: string;
  used: number;
  limit: number | "Unlimited";
  progress: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium leading-5 text-[hsl(var(--foreground))]">{label}</span>
        <span className="text-xs leading-4 tabular-nums text-[hsl(var(--foreground-muted))]">
          {used} / {limit === "Unlimited" ? "∞" : limit}
        </span>
      </div>
      <ProgressBar ariaLabel={label} value={Math.max(0, Math.min(1, progress / 100))} appearance="default" />
      {limit !== "Unlimited" && (
        <p className="mt-1 text-xs leading-4 text-[hsl(var(--foreground-muted))]">
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
          "group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
          accent ? "hover:bg-[hsl(var(--accent))]/6" : "hover:bg-[hsl(var(--surface-raised))]"
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
            accent
              ? "border-[hsl(var(--accent))]/15 bg-[hsl(var(--accent))]/8 text-[hsl(var(--accent))]"
              : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <span className={cn("block text-sm font-medium leading-5", accent ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--foreground))]")}>
            {label}
          </span>
          {desc && (
            <span className="text-xs leading-4 text-[hsl(var(--foreground-muted))]">{desc}</span>
          )}
        </div>

        <ArrowRight className="h-3 w-3 shrink-0 text-[hsl(var(--foreground-subtle))] transition-all group-hover:translate-x-0.5 group-hover:text-[hsl(var(--foreground-muted))]" />
      </div>
    </Link>
  );
}

// ─── skeleton ─────────────────────────────────────────────────────────────────

function Bone({ className }: { className?: string }) {
  return <div className={cn("rounded-lg bg-muted animate-pulse", className)} />;
}

function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">

      <div className="sticky top-0 z-10 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))]/95 backdrop-blur-sm">
        <div className="flex h-[60px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="space-y-2">
            <Bone className="h-4 w-44" />
            <Bone className="h-3 w-56" />
          </div>
          <div className="flex items-center gap-2">
            <Bone className="h-8 w-8 rounded-xl" />
            <Bone className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6 sm:px-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[0_1px_2px_rgb(0 0 0 / 0.08)]">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2 flex-1">
                  <Bone className="h-2.5 w-24" />
                  <Bone className="h-8 w-12 rounded-lg" />
                </div>
                <Bone className="h-9 w-9 rounded-xl flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* LEFT — 2/3 */}
          <div className="space-y-5 lg:col-span-2">

            {/* Upcoming posts section */}
            <div className={sectionClassName}>
              <div className="flex items-center justify-between border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                <div className="flex items-center gap-2">
                  <Bone className="w-7 h-7 rounded-lg" />
                  <Bone className="h-4 w-32" />
                </div>
                <Bone className="h-3 w-14" />
              </div>
              <div className="divide-y divide-[hsl(var(--border-subtle))]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3.5 px-5 py-3.5">
                    <Bone className="w-9 h-9 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <Bone className="h-3.5 w-3/4" />
                      <Bone className="h-2.5 w-1/4" />
                    </div>
                    <Bone className="h-6 w-14 rounded-lg flex-shrink-0" />
                    <Bone className="h-3.5 w-3.5 rounded flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Platform distribution section */}
            <div className={sectionClassName}>
              <div className="flex items-center justify-between border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                <div className="flex items-center gap-2">
                  <Bone className="w-7 h-7 rounded-lg" />
                  <Bone className="h-4 w-44" />
                </div>
                <Bone className="h-3 w-20" />
              </div>
              <div className="space-y-3.5 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Bone className="w-8 h-8 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center justify-between">
                        <Bone className="h-3 w-16" />
                        <Bone className="h-3 w-12" />
                      </div>
                      <Bone className="h-1.5 w-full rounded-full" />
                    </div>
                    <Bone className="h-3 w-9 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recently published section */}
            <div className={sectionClassName}>
              <div className="flex items-center justify-between border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                <div className="flex items-center gap-2">
                  <Bone className="w-7 h-7 rounded-lg" />
                  <Bone className="h-4 w-36" />
                </div>
                <Bone className="h-3 w-14" />
              </div>
              <div className="divide-y divide-[hsl(var(--border-subtle))]">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                    <Bone className="w-10 h-7 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <Bone className="h-3.5 w-2/3" />
                      <Bone className="h-2.5 w-1/3" />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Bone className="h-5 w-14 rounded-lg" />
                      <Bone className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT — 1/3 */}
          <div className="space-y-4">

            {/* Usage & Plan */}
            <div className={sectionClassName}>
              <div className="flex items-center gap-2 border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                <Bone className="w-7 h-7 rounded-lg" />
                <Bone className="h-4 w-36" />
              </div>
              <div className="p-5 space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Bone className="h-3 w-28" />
                      <Bone className="h-3 w-12" />
                    </div>
                    <Bone className="h-2 w-full rounded-full" />
                    <Bone className="h-2.5 w-24" />
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-[hsl(var(--border-subtle))] pt-2">
                  <Bone className="h-3 w-20" />
                  <Bone className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>

            {/* Connected Accounts */}
            <div className={sectionClassName}>
              <div className="flex items-center gap-2 border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                <Bone className="w-7 h-7 rounded-lg" />
                <Bone className="h-4 w-40" />
              </div>
              <div className="p-5 space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Bone className="w-9 h-9 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <Bone className="h-3 w-16" />
                      <Bone className="h-2.5 w-24" />
                    </div>
                    <Bone className="w-2 h-2 rounded-full flex-shrink-0" />
                  </div>
                ))}
                <div className="border-t border-[hsl(var(--border-subtle))] pt-2">
                  <Bone className="h-8 w-full rounded-lg" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={sectionClassName}>
              <div className="flex items-center gap-2 border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                <Bone className="w-7 h-7 rounded-lg" />
                <Bone className="h-4 w-28" />
              </div>
              <div className="p-2 space-y-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <Bone className="w-8 h-8 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <Bone className="h-3.5 w-32" />
                      <Bone className="h-2.5 w-40" />
                    </div>
                    <Bone className="h-3 w-3 rounded flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
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
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]">
        <Icon className="h-5 w-5 text-[hsl(var(--foreground-muted))]" />
      </div>
      <p className="mb-1 text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">{title}</p>
      <p className="mb-4 max-w-[220px] text-sm leading-5 text-[hsl(var(--foreground-muted))]">{desc}</p>
      <LinkButton appearance="subtle" href={href}>
        {cta}
      </LinkButton>
    </div>
  );
}

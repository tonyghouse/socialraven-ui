"use client";

import { type ButtonHTMLAttributes, type ReactNode, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart2,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  ImageIcon,
  Link2,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  Video,
  Zap,
} from "lucide-react";
import { fetchPaginatedPostsApi } from "@/service/pagingatedPosts";
import { fetchConnectedAccountsApi } from "@/service/connectedAccounts";
import { fetchPostCollectionsApi } from "@/service/fetchPostCollections";
import { fetchUsageStatsApi, fetchUserPlanApi } from "@/service/plan";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";
import type { PostResponse } from "@/model/PostResponse";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { UsageStats, UserPlan } from "@/model/Plan";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function relativeTime(iso: string | undefined): { label: string; urgent: boolean } {
  if (!iso) return { label: "—", urgent: false };

  const diff = new Date(iso).getTime() - Date.now();

  if (diff < 0) return { label: "Past due", urgent: true };

  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (hours < 1) return { label: "< 1 hour", urgent: true };
  if (hours < 6) return { label: `In ${hours}h`, urgent: true };
  if (hours < 24) return { label: `In ${hours}h`, urgent: false };
  if (days === 1) return { label: "Tomorrow", urgent: false };

  return { label: `In ${days}d`, urgent: false };
}

function formatShort(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

const PLATFORM_ACCENT: Record<string, string> = {
  instagram: "var(--chart-categorical-4)",
  x: "var(--chart-neutral)",
  linkedin: "var(--chart-categorical-2)",
  facebook: "var(--chart-categorical-5)",
  youtube: "var(--ds-red-600)",
  threads: "var(--ds-gray-1000)",
  tiktok: "var(--ds-gray-1000)",
};

const TYPE_META = {
  IMAGE: { Icon: ImageIcon, label: "Image" },
  VIDEO: { Icon: Video, label: "Video" },
  TEXT: { Icon: FileText, label: "Text" },
} as const;

const pageClassName = "min-h-screen bg-[var(--ds-background-200)]";
const sectionClassName =
  "overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm";
const sectionHeaderClassName = "flex items-center justify-between border-b border-[var(--ds-gray-400)] px-5 py-4";
const sectionTitleClassName = "text-label-14 text-[var(--ds-gray-1000)]";
const bodyTextClassName = "text-label-14 leading-6 text-[var(--ds-gray-900)]";
const metaTextClassName = "text-copy-12 text-[var(--ds-gray-900)]";
const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";
const rowHoverClassName = "transition-colors duration-150 hover:bg-[var(--ds-gray-100)]";

const badgeVariants = {
  neutral: "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]",
  subtle: "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]",
  accent: "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
  success: "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
  warning: "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]",
} as const;

function platformAccent(provider: string | undefined) {
  if (!provider) return "var(--ds-gray-1000)";
  return PLATFORM_ACCENT[provider] ?? "var(--ds-gray-1000)";
}

function platformSurfaceStyle(provider: string | undefined, backgroundPercent = 10, borderPercent = 24) {
  const accent = platformAccent(provider);

  return {
    backgroundColor: `color-mix(in srgb, ${accent} ${backgroundPercent}%, var(--ds-background-100))`,
    borderColor: `color-mix(in srgb, ${accent} ${borderPercent}%, var(--ds-gray-400))`,
  };
}

function ActionButton({
  tone = "secondary",
  compact = false,
  iconOnly = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary";
  compact?: boolean;
  iconOnly?: boolean;
}) {
  const toneClassName =
    tone === "primary"
      ? "border-transparent bg-[var(--ds-blue-600)] text-white hover:bg-[var(--ds-blue-700)]"
      : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";

  const sizeClassName = iconOnly
    ? compact
      ? "h-8 w-8 px-0"
      : "h-9 w-9 px-0"
    : compact
      ? "h-8 px-2.5 text-label-13"
      : "h-9 px-3.5 text-label-14";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border transition-colors disabled:pointer-events-none disabled:opacity-50",
        toneClassName,
        sizeClassName,
        focusRingClassName,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function ActionLink({
  href,
  tone = "secondary",
  compact = false,
  fullWidth = false,
  className,
  children,
}: {
  href: string;
  tone?: "primary" | "secondary";
  compact?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const toneClassName =
    tone === "primary"
      ? "border-transparent bg-[var(--ds-blue-600)] text-white hover:bg-[var(--ds-blue-700)]"
      : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";

  const sizeClassName = compact ? "h-8 px-2.5 text-label-13" : "h-9 px-3.5 text-label-14";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border transition-colors",
        toneClassName,
        sizeClassName,
        focusRingClassName,
        fullWidth && "flex w-full",
        className
      )}
    >
      {children}
    </Link>
  );
}

function SectionIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-blue-700)]">
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

function StatusBadge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: keyof typeof badgeVariants;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-label-12",
        badgeVariants[variant]
      )}
    >
      {children}
    </span>
  );
}

function ProgressTrack({
  value,
  color = "var(--ds-blue-600)",
}: {
  value: number;
  color?: string;
}) {
  const width = Math.max(0, Math.min(100, value * 100));

  return (
    <div className="h-2 overflow-hidden rounded-full bg-[var(--ds-gray-200)]">
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { syncFromUserPlan } = usePlan();

  const [scheduledPosts, setScheduledPosts] = useState<PostResponse[]>([]);
  const [publishedCols, setPublishedCols] = useState<PostCollectionResponse[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [upcomingRes, accountsRes, publishedRes, usageRes, planRes] = await Promise.allSettled([
          fetchPaginatedPostsApi(getToken, 0, "SCHEDULED"),
          fetchConnectedAccountsApi(getToken, null),
          fetchPostCollectionsApi(getToken, 0, "published"),
          fetchUsageStatsApi(getToken),
          fetchUserPlanApi(getToken),
        ]);

        if (upcomingRes.status === "fulfilled") setScheduledPosts(upcomingRes.value.content);
        if (accountsRes.status === "fulfilled") setAccounts(accountsRes.value);
        if (publishedRes.status === "fulfilled") setPublishedCols(publishedRes.value.content);
        if (usageRes.status === "fulfilled") setUsageStats(usageRes.value);
        if (planRes.status === "fulfilled") {
          setUserPlan(planRes.value);
          syncFromUserPlan(planRes.value);
        }

        const errors = [upcomingRes, accountsRes, publishedRes, usageRes, planRes]
          .filter((result) => result.status === "rejected")
          .map((result) => (result as PromiseRejectedResult).reason);

        if (errors.length > 0) {
          console.error("Dashboard load errors:", errors);
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [getToken, refreshKey, syncFromUserPlan]);

  const today = new Date().toISOString().slice(0, 10);
  const weekFromNow = new Date(Date.now() + 7 * 86_400_000).toISOString();
  const scheduledToday = scheduledPosts.filter((post) => post.scheduledTime?.startsWith(today)).length;
  const scheduledThisWeek = scheduledPosts.filter((post) => post.scheduledTime && post.scheduledTime <= weekFromNow).length;
  const firstName = user?.firstName ?? "";

  const platformCounts: Record<string, number> = {};
  scheduledPosts.forEach((post) => {
    if (post.provider) {
      platformCounts[post.provider] = (platformCounts[post.provider] ?? 0) + 1;
    }
  });
  const topPlatforms = Object.entries(platformCounts).sort(([, a], [, b]) => b - a).slice(0, 6);

  const trialDaysLeft = userPlan?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(userPlan.trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;

  const postsProgress =
    usageStats && typeof usageStats.postsLimit === "number"
      ? Math.min(100, (usageStats.postsUsedThisMonth / usageStats.postsLimit) * 100)
      : 0;

  const accsProgress =
    usageStats && typeof usageStats.connectedAccountsLimit === "number"
      ? Math.min(100, (usageStats.connectedAccountsCount / usageStats.connectedAccountsLimit) * 100)
      : 0;

  if (loading) {
    return <DashboardPageSkeleton />;
  }

  return (
    <main className={pageClassName}>
      <ProtectedPageHeader
        title={`${getGreeting()}${firstName ? `, ${firstName}` : ""}`}
        description="Your content hub, everything at a glance."
        className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95"
        actions={
          <>
            <ActionButton
              iconOnly
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
              onClick={() => setRefreshKey((current) => current + 1)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </ActionButton>

            <ActionLink href="/schedule-post" tone="primary">
              <span className="inline-flex items-center gap-1.5">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Post</span>
                <span className="sm:hidden">New</span>
              </span>
            </ActionLink>
          </>
        }
      />

      {userPlan?.status === "TRIALING" && trialDaysLeft !== null ? (
        <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <StatusBadge variant="accent">Trial</StatusBadge>
                <p className={sectionTitleClassName}>Free trial active</p>
              </div>
              <p className={bodyTextClassName}>
                {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining on your trial.
              </p>
            </div>
            <ActionLink href="/profile" tone="primary">
              Upgrade plan
            </ActionLink>
          </div>
        </div>
      ) : null}

      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={Calendar} label="Scheduled Today" value={scheduledToday} accent />
          <StatCard icon={Clock} label="This Week" value={scheduledThisWeek} />
          <StatCard icon={TrendingUp} label="Published Total" value={publishedCols.length} />
          <StatCard icon={Link2} label="Accounts" value={accounts.length} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <section className={sectionClassName}>
              <div className={sectionHeaderClassName}>
                <div className="flex items-center gap-2">
                  <SectionIcon icon={Clock} />
                  <h2 className={sectionTitleClassName}>Upcoming Posts</h2>
                  {scheduledPosts.length > 0 ? (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-1.5 py-0.5 text-label-12 text-[var(--ds-gray-900)]">
                      {scheduledPosts.length}
                    </span>
                  ) : null}
                </div>
                <ActionLink href="/scheduled-posts" compact>
                  View all
                </ActionLink>
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
                <div className="divide-y divide-[var(--ds-gray-400)]">
                  {scheduledPosts.slice(0, 6).map((post) => {
                    const PlatformIcon = post.provider ? PLATFORM_ICONS[post.provider] : null;
                    const { label: timeLabel, urgent } = relativeTime(post.scheduledTime ?? "");

                    return (
                      <Link key={post.id} href="/scheduled-posts" className="block">
                        <div className={cn("group flex items-center gap-3.5 px-5 py-3.5", rowHoverClassName)}>
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                            style={platformSurfaceStyle(post.provider)}
                          >
                            {PlatformIcon ? (
                              <PlatformIcon className="h-4 w-4" style={{ color: platformAccent(post.provider) }} />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">
                              {post.description || "No content"}
                            </p>
                            <p className="mt-0.5 text-copy-12 capitalize text-[var(--ds-gray-900)]">
                              {post.provider}
                            </p>
                          </div>

                          <StatusBadge variant={urgent ? "warning" : "neutral"}>
                            {timeLabel}
                          </StatusBadge>

                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--ds-gray-800)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--ds-blue-700)]" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {topPlatforms.length > 0 ? (
              <section className={sectionClassName}>
                <div className={sectionHeaderClassName}>
                  <div className="flex items-center gap-2">
                    <SectionIcon icon={BarChart2} />
                    <h2 className={sectionTitleClassName}>Scheduled by Platform</h2>
                  </div>
                  <span className={metaTextClassName}>
                    {scheduledPosts.length} post{scheduledPosts.length !== 1 ? "s" : ""} queued
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  {topPlatforms.map(([platform, count]) => {
                    const PlatformIcon = PLATFORM_ICONS[platform];
                    const percent = Math.round((count / scheduledPosts.length) * 100);

                    return (
                      <div key={platform} className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                          style={platformSurfaceStyle(platform)}
                        >
                          {PlatformIcon ? (
                            <PlatformIcon className="h-4 w-4" style={{ color: platformAccent(platform) }} />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-label-14 capitalize text-[var(--ds-gray-1000)]">{platform}</span>
                            <span className={metaTextClassName}>
                              {count} post{count !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <ProgressTrack value={percent / 100} color={platformAccent(platform)} />
                        </div>

                        <span className="w-9 text-right text-copy-12 tabular-nums text-[var(--ds-gray-900)]">
                          {percent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {publishedCols.length > 0 ? (
              <section className={sectionClassName}>
                <div className={sectionHeaderClassName}>
                  <div className="flex items-center gap-2">
                    <SectionIcon icon={CheckCircle} />
                    <h2 className={sectionTitleClassName}>Recently Published</h2>
                  </div>
                  <ActionLink href="/published-posts" compact>
                    View all
                  </ActionLink>
                </div>

                <div className="divide-y divide-[var(--ds-gray-400)]">
                  {publishedCols.slice(0, 4).map((collection) => {
                    const platforms = Array.from(new Set(collection.posts.map((post) => post.provider)));
                    const typeMeta =
                      TYPE_META[collection.postCollectionType as keyof typeof TYPE_META] ?? TYPE_META.TEXT;
                    const TypeIcon = typeMeta.Icon;

                    return (
                      <Link key={collection.id} href={`/published-posts/${collection.id}`} className="block">
                        <div className={cn("group flex items-center gap-4 px-5 py-3.5", rowHoverClassName)}>
                          <div
                            className="flex shrink-0 items-center"
                            style={{ width: Math.min(platforms.length, 3) * 18 + 10 }}
                          >
                            {platforms.slice(0, 3).map((platform, index) => {
                              const PlatformIcon = PLATFORM_ICONS[platform];

                              return (
                                <div
                                  key={platform}
                                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--ds-background-100)]"
                                  style={{
                                    marginLeft: index === 0 ? 0 : -8,
                                    zIndex: 10 - index,
                                    ...platformSurfaceStyle(platform, 12, 24),
                                  }}
                                >
                                  {PlatformIcon ? (
                                    <PlatformIcon className="h-3 w-3" style={{ color: platformAccent(platform) }} />
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">
                              {collection.description}
                            </p>
                            <p className="mt-0.5 text-copy-12 text-[var(--ds-gray-900)]">
                              {collection.scheduledTime ? formatShort(collection.scheduledTime) : ""}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
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
            ) : null}
          </div>

          <div className="space-y-4">
            {usageStats ? (
              <section className={sectionClassName}>
                <div className="flex items-center gap-2 border-b border-[var(--ds-gray-400)] px-5 py-4">
                  <SectionIcon icon={Activity} />
                  <h2 className={sectionTitleClassName}>Usage This Month</h2>
                </div>

                <div className="space-y-4 p-5">
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

                  {userPlan ? (
                    <div className="flex items-center justify-between border-t border-[var(--ds-gray-400)] pt-2">
                      <span className={metaTextClassName}>Current plan</span>
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
                  ) : null}
                </div>
              </section>
            ) : null}

            <section className={sectionClassName}>
              <div className="flex items-center gap-2 border-b border-[var(--ds-gray-400)] px-5 py-4">
                <SectionIcon icon={Globe} />
                <h2 className={sectionTitleClassName}>Connected Accounts</h2>
              </div>

              <div className="p-5">
                {accounts.length === 0 ? (
                  <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge variant="warning">Attention</StatusBadge>
                        <p className={sectionTitleClassName}>No accounts connected</p>
                      </div>
                      <p className={bodyTextClassName}>
                        Connect your social media accounts to start scheduling.
                      </p>
                      <div>
                        <ActionLink href="/connect-accounts" tone="primary">
                          Connect an account
                        </ActionLink>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {accounts.slice(0, 5).map((account) => {
                      const PlatformIcon = PLATFORM_ICONS[account.platform];

                      return (
                        <div key={account.providerUserId} className="flex items-center gap-3 rounded-lg px-1 py-1.5">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                            style={platformSurfaceStyle(account.platform)}
                          >
                            {PlatformIcon ? (
                              <PlatformIcon className="h-4 w-4" style={{ color: platformAccent(account.platform) }} />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-label-14 capitalize text-[var(--ds-gray-1000)]">
                              {account.platform}
                            </p>
                            <p className="truncate text-copy-12 text-[var(--ds-gray-900)]">
                              @{account.username}
                            </p>
                          </div>
                          <StatusBadge variant="success">Active</StatusBadge>
                        </div>
                      );
                    })}

                    {accounts.length > 5 ? (
                      <p className="text-center text-copy-12 text-[var(--ds-gray-900)]">
                        +{accounts.length - 5} more
                      </p>
                    ) : null}

                    <div className="border-t border-[var(--ds-gray-400)] pt-2">
                      <ActionLink href="/connect-accounts" fullWidth>
                        <span className="inline-flex items-center gap-1.5">
                          <Link2 className="h-3 w-3" />
                          <span>Manage accounts</span>
                        </span>
                      </ActionLink>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className={sectionClassName}>
              <div className="flex items-center gap-2 border-b border-[var(--ds-gray-400)] px-5 py-4">
                <SectionIcon icon={Zap} />
                <h2 className={sectionTitleClassName}>Quick Actions</h2>
              </div>

              <div className="p-2">
                <QuickAction
                  href="/schedule-post"
                  icon={PlusCircle}
                  label="Schedule a post"
                  desc="Create & publish content"
                  accent
                />
                <QuickAction
                  href="/scheduled-posts"
                  icon={Clock}
                  label="Scheduled posts"
                  desc="View your upcoming queue"
                />
                <QuickAction
                  href="/calendar"
                  icon={Calendar}
                  label="Content calendar"
                  desc="Monthly overview at a glance"
                />
                <QuickAction
                  href="/connect-accounts"
                  icon={Link2}
                  label="Connect accounts"
                  desc="Add social media platforms"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4 shadow-sm transition-colors hover:bg-[var(--ds-gray-100)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="mb-1.5 text-copy-12 text-[var(--ds-gray-900)]">{label}</p>
          <p className="mt-1 text-[28px] font-semibold leading-8 tracking-[-0.01em] tabular-nums text-[var(--ds-gray-1000)]">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            accent
              ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
              : "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
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
    <div className="px-5 py-8">
      <div className="rounded-xl border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)]">
          <Icon className="h-4 w-4" />
        </div>
        <p className={sectionTitleClassName}>{title}</p>
        <p className={cn("mt-2", bodyTextClassName)}>{desc}</p>
        <div className="mt-5">
          <ActionLink href={href} tone="primary">
            {cta}
          </ActionLink>
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
}: {
  label: string;
  used: number;
  limit: number | "Unlimited";
  progress: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-label-14 text-[var(--ds-gray-1000)]">{label}</span>
        <span className="text-copy-12 tabular-nums text-[var(--ds-gray-900)]">
          {used} / {limit === "Unlimited" ? "∞" : limit}
        </span>
      </div>
      <ProgressTrack value={progress / 100} />
      {limit !== "Unlimited" ? (
        <p className="mt-1 text-copy-12 text-[var(--ds-gray-900)]">
          {Math.round(progress)}% of limit used
        </p>
      ) : null}
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
    <Link href={href} className="block">
      <div
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
          accent ? "hover:bg-[var(--ds-blue-100)]" : "hover:bg-[var(--ds-gray-100)]"
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
            accent
              ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
              : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)]"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <span className={cn("block text-label-14", accent ? "text-[var(--ds-blue-700)]" : "text-[var(--ds-gray-1000)]")}>
            {label}
          </span>
          {desc ? (
            <span className="text-copy-12 text-[var(--ds-gray-900)]">{desc}</span>
          ) : null}
        </div>

        <ArrowRight className="h-3 w-3 shrink-0 text-[var(--ds-gray-800)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--ds-gray-1000)]" />
      </div>
    </Link>
  );
}

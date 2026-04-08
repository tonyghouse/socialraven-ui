"use client";

import { type ElementType, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  BarChart2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Heart,
  MessageCircle,
  Minus,
  MousePointerClick,
  RefreshCw,
  Share2,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";

import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import { useRole } from "@/hooks/useRole";
import { fetchConnectedAccountsApi } from "@/service/connectedAccounts";
import {
  fetchAnalyticsOverviewApi,
  fetchBestTimesApi,
  fetchEngagementTimelineApi,
  fetchPlatformStatsApi,
  fetchTopPostsApi,
  type AnalyticsOverview,
  type DateRange,
  type HeatmapCell,
  type PlatformStats,
  type SnapshotType,
  type TimelineChartRow,
  type TopPost,
} from "@/service/analytics";

const PLATFORM_META: Record<string, { label: string; chartColor: string }> = {
  youtube: { label: "YouTube", chartColor: "var(--chart-categorical-1)" },
  linkedin: { label: "LinkedIn", chartColor: "var(--chart-categorical-2)" },
  x: { label: "X / Twitter", chartColor: "var(--chart-categorical-3)" },
  instagram: { label: "Instagram", chartColor: "var(--chart-categorical-4)" },
  facebook: { label: "Facebook", chartColor: "var(--chart-categorical-5)" },
  tiktok: { label: "TikTok", chartColor: "var(--chart-categorical-6)" },
  threads: { label: "Threads", chartColor: "var(--chart-neutral)" },
};

const ACTIVE_PROVIDERS = ["youtube", "linkedin", "x"] as const;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PROXY_DOMAINS = ["linkedin.com", "licdn.com"];

const pageClassName = "min-h-screen bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)]";
const surfaceClassName =
  "overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-none";
const dividerClassName = "border-[var(--ds-gray-400)]";
const subtleButtonClassName =
  "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-[var(--ds-background-100)]";
const segmentedControlClassName =
  "flex items-center gap-1 rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-1";
const segmentedButtonClassName =
  "rounded-md px-3 py-1.5 text-label-14 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)]";

function meta(provider: string) {
  return PLATFORM_META[provider.toLowerCase()] ?? {
    label: provider,
    chartColor: "var(--chart-neutral)",
  };
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function proxyImg(url?: string | null): string | null {
  if (!url) return null;
  return PROXY_DOMAINS.some((domain) => url.toLowerCase().includes(domain))
    ? `/api/proxy-image?url=${encodeURIComponent(url)}`
    : url;
}

function initials(name?: string) {
  return (name ?? "?")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function heatmapCellColor(intensity: number) {
  if (intensity <= 0) return "var(--ds-gray-100)";
  if (intensity <= 0.2) return "var(--ds-blue-100)";
  if (intensity <= 0.4) return "var(--ds-blue-200)";
  if (intensity <= 0.6) return "var(--ds-blue-300)";
  if (intensity <= 0.8) return "var(--ds-blue-400)";
  return "var(--ds-blue-500)";
}

function Sk({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--ds-gray-200)]", className)}
    />
  );
}

function Trend({ value }: { value: number | null }) {
  if (value === null) return null;

  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--ds-green-200)] bg-[var(--ds-green-100)] px-2.5 py-1 text-label-12 text-[var(--ds-green-700)]">
        <TrendingUp className="h-3 w-3" />+{value.toFixed(1)}%
      </span>
    );
  }

  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--ds-red-200)] bg-[var(--ds-red-100)] px-2.5 py-1 text-label-12 text-[var(--ds-red-700)]">
        <TrendingDown className="h-3 w-3" />
        {value.toFixed(1)}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-900)]">
      <Minus className="h-3 w-3" />0%
    </span>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: ElementType;
  label: string;
  value: string;
  trend?: number | null;
}) {
  return (
    <section className={cn(surfaceClassName, "p-4")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
          <Icon className="h-4 w-4" />
        </div>
        {trend !== undefined ? <Trend value={trend ?? null} /> : null}
      </div>

      <div className="mt-3">
        <p className="text-label-12 text-[var(--ds-gray-900)]">{label}</p>
        <p className="mt-1 text-heading-32 text-[var(--ds-gray-1000)]">{value}</p>
      </div>
    </section>
  );
}

function AccountChip({
  account,
  isSelected,
  onClick,
}: {
  account: ConnectedAccount;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const src = proxyImg(account.profilePicLink);
  const platformMeta = meta(account.platform);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
        isSelected
          ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)]"
          : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
      )}
    >
      <Avatar className="h-6 w-6 shrink-0">
        {!imgErr && src ? (
          <AvatarImage
            src={src}
            alt={account.username}
            onError={() => setImgErr(true)}
          />
        ) : (
          <AvatarFallback className="bg-[var(--ds-gray-200)] text-label-12 text-[var(--ds-gray-900)]">
            {initials(account.username)}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="min-w-0">
        <p
          className={cn(
            "max-w-[120px] truncate text-label-14",
            isSelected
              ? "text-[var(--ds-blue-700)]"
              : "text-[var(--ds-gray-1000)]"
          )}
        >
          {account.username}
        </p>
      </div>

      <span
        className={cn(
          "rounded-full border px-2 py-0.5 text-label-12",
          isSelected
            ? "border-[var(--ds-blue-200)] bg-[var(--ds-background-100)] text-[var(--ds-blue-700)]"
            : "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
        )}
      >
        {platformMeta.label}
      </span>
    </button>
  );
}

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const { canExportClientReports } = useRole();

  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [snapshotType, setSnapshotType] = useState<SnapshotType>("T30D");

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [acctLoading, setAcctLoading] = useState(true);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [platStats, setPlatStats] = useState<PlatformStats[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [timeline, setTimeline] = useState<TimelineChartRow[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const connectedAccounts = await fetchConnectedAccountsApi(getToken, null);
        setAccounts(connectedAccounts);
      } catch (loadError) {
        console.error(loadError);
      } finally {
        setAcctLoading(false);
      }
    }

    void loadAccounts();
  }, [getToken]);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.providerUserId === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  );

  const activeProvider = selectedAccount?.platform.toLowerCase() ?? null;

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setError(null);

    try {
      const [nextOverview, nextPlatformStats, nextTopPosts, nextTimeline, nextHeatmap] =
        await Promise.all([
          fetchAnalyticsOverviewApi(getToken, dateRange),
          fetchPlatformStatsApi(getToken, dateRange),
          fetchTopPostsApi(getToken, dateRange, snapshotType),
          fetchEngagementTimelineApi(getToken, dateRange),
          fetchBestTimesApi(getToken),
        ]);

      setOverview(nextOverview);
      setPlatStats(nextPlatformStats);
      setTopPosts(nextTopPosts);
      setTimeline(nextTimeline);
      setHeatmap(nextHeatmap);
      setLastRefreshed(new Date());
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [dateRange, getToken, snapshotType]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const filteredPlatStats = activeProvider
    ? platStats.filter((stat) => stat.provider.toLowerCase() === activeProvider)
    : platStats;

  const filteredTopPosts = activeProvider
    ? topPosts.filter((post) => post.provider.toLowerCase() === activeProvider)
    : topPosts;

  const filteredTimeline = useMemo(() => {
    if (!activeProvider) return timeline;

    return timeline.map((row) => {
      const nextRow: TimelineChartRow = {
        date: row.date,
        youtube: 0,
        linkedin: 0,
        x: 0,
      };

      if (activeProvider === "youtube") nextRow.youtube = row.youtube;
      if (activeProvider === "linkedin") nextRow.linkedin = row.linkedin;
      if (activeProvider === "x") nextRow.x = row.x;

      return nextRow;
    });
  }, [activeProvider, timeline]);

  const displayOverview = useMemo(() => {
    if (!activeProvider || filteredPlatStats.length === 0) return overview;

    const stat = filteredPlatStats[0];
    return {
      totalImpressions: stat.impressions,
      totalReach: stat.reach,
      totalLikes: stat.likes,
      totalComments: stat.comments,
      totalShares: stat.shares,
      totalVideoViews: stat.videoViews,
      followerGrowth: stat.followerGrowth,
      totalPosts: stat.postsPublished,
      avgEngagementRate: stat.engagementRate,
    } satisfies AnalyticsOverview;
  }, [activeProvider, filteredPlatStats, overview]);

  const hasData = !!displayOverview && (
    displayOverview.totalImpressions +
      displayOverview.totalReach +
      displayOverview.totalPosts >
    0
  );

  const rangeLabel =
    dateRange === "7d"
      ? "Last 7 days"
      : dateRange === "30d"
      ? "Last 30 days"
      : "Last 90 days";

  return (
    <div className={pageClassName}>
      <ProtectedPageHeader
        title="Analytics"
        description="Performance overview across connected social channels."
        icon={<BarChart2 className="h-4 w-4" />}
        actions={
          <>
            <div className={segmentedControlClassName}>
              {(["7d", "30d", "90d"] as DateRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setDateRange(range)}
                  className={cn(
                    segmentedButtonClassName,
                    dateRange === range
                      ? "border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]"
                      : "text-[var(--ds-gray-900)] hover:bg-[var(--ds-background-100)] hover:text-[var(--ds-gray-1000)]"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>

            {canExportClientReports ? (
              <Button
                asChild
                type="button"
                variant="outline"
                size="sm"
                className={cn("h-9 rounded-md", subtleButtonClassName)}
              >
                <Link href="/client-reports">
                  <FileText className="h-4 w-4" />
                  <span>Client Reports</span>
                </Link>
              </Button>
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => void fetchAnalytics()}
              disabled={analyticsLoading}
              aria-label="Refresh analytics"
              className={cn("h-9 w-9 rounded-md", subtleButtonClassName)}
            >
              <RefreshCw
                className={cn("h-4 w-4", analyticsLoading && "animate-spin")}
              />
            </Button>
          </>
        }
      />

      <main className="w-full space-y-6 px-4 py-6 sm:px-6">
        <section className={cn(surfaceClassName, "p-4")}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-heading-16 text-[var(--ds-gray-1000)]">Overview</p>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                {activeProvider && selectedAccount
                  ? `Showing ${meta(activeProvider).label} analytics for ${selectedAccount.username}.`
                  : "Showing analytics across all connected accounts."}
              </p>
            </div>

            <div className="space-y-1 text-right">
              <p className="text-label-12 text-[var(--ds-gray-900)]">{rangeLabel}</p>
              <p className="text-label-12 text-[var(--ds-gray-900)]">
                {lastRefreshed
                  ? `Updated ${lastRefreshed.toLocaleTimeString()}`
                  : "Waiting for first refresh"}
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-[var(--ds-red-200)] bg-[var(--ds-red-100)] px-4 py-3 text-label-14 text-[var(--ds-red-700)]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => void fetchAnalytics()}
              className="text-label-12 underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : null}

        <section className={surfaceClassName}>
          <div className="px-4 py-4">
            <div className="mb-3">
              <p className="text-heading-16 text-[var(--ds-gray-1000)]">
                Connected Accounts
              </p>
              <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                {selectedAccount
                  ? `Viewing analytics for ${selectedAccount.username}.`
                  : "Select an account to filter the analytics view."}
              </p>
            </div>

            {acctLoading ? (
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Sk key={index} className="h-10 w-36 rounded-lg" />
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                No connected accounts. Go to{" "}
                <Link
                  href="/connect-accounts"
                  className="text-[var(--ds-blue-700)] underline underline-offset-2"
                >
                  Connect Accounts
                </Link>
                .
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {accounts.map((account) => (
                  <AccountChip
                    key={account.providerUserId}
                    account={account}
                    isSelected={selectedAccountId === account.providerUserId}
                    onClick={() =>
                      setSelectedAccountId(
                        selectedAccountId === account.providerUserId
                          ? null
                          : account.providerUserId
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {analyticsLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Sk key={index} className="h-[112px] rounded-xl" />
            ))
          ) : (
            <>
              <KpiCard
                icon={Eye}
                label="Impressions"
                value={hasData ? fmt(displayOverview!.totalImpressions) : "—"}
              />
              <KpiCard
                icon={Users}
                label="Reach"
                value={hasData ? fmt(displayOverview!.totalReach) : "—"}
              />
              <KpiCard
                icon={Heart}
                label="Engagements"
                value={
                  hasData
                    ? fmt(
                        displayOverview!.totalLikes +
                          displayOverview!.totalComments +
                          displayOverview!.totalShares
                      )
                    : "—"
                }
              />
              <KpiCard
                icon={TrendingUp}
                label="Eng. Rate"
                value={
                  hasData
                    ? `${displayOverview!.avgEngagementRate.toFixed(1)}%`
                    : "—"
                }
              />
              <KpiCard
                icon={Users}
                label="Follower Growth"
                value={hasData ? fmt(displayOverview!.followerGrowth) : "—"}
              />
              <KpiCard
                icon={BarChart2}
                label="Posts Published"
                value={hasData ? String(displayOverview!.totalPosts) : "—"}
              />
            </>
          )}
        </div>

        {!activeProvider ? (
          <section className={surfaceClassName}>
            <SectionHeader icon={BarChart2} title="Platform Breakdown" />

            {analyticsLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Sk key={index} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : platStats.length === 0 ? (
              <EmptyState text="No analytics data yet. Publish some posts to see platform metrics." />
            ) : (
              <div className={cn("divide-y", dividerClassName)}>
                {platStats.map((stat) => {
                  const platformMeta = meta(stat.provider);
                  const PlatformIcon =
                    PLATFORM_ICONS[stat.provider.toLowerCase()] ?? BarChart2;
                  const engagements =
                    stat.likes + stat.comments + stat.shares;
                  const maxImpressions = Math.max(
                    ...platStats.map((item) => item.impressions),
                    1
                  );

                  return (
                    <div key={stat.provider} className="px-5 py-4">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
                          <PlatformIcon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex items-center justify-between gap-3">
                            <span className="text-label-14 text-[var(--ds-gray-1000)]">
                              {platformMeta.label}
                            </span>
                            <span className="text-label-12 text-[var(--ds-gray-900)]">
                              {fmt(stat.impressions)} impressions
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--ds-gray-100)]">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${(stat.impressions / maxImpressions) * 100}%`,
                                backgroundColor: platformMeta.chartColor,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pl-11 text-label-12 text-[var(--ds-gray-900)]">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {fmt(stat.likes)} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {fmt(stat.comments)} comments
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          {fmt(stat.shares)} shares
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {fmt(engagements)} total
                        </span>
                        {stat.videoViews > 0 ? (
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            {fmt(stat.videoViews)} views
                          </span>
                        ) : null}
                        {stat.clicks > 0 ? (
                          <span className="flex items-center gap-1">
                            <MousePointerClick className="h-3 w-3" />
                            {fmt(stat.clicks)} clicks
                          </span>
                        ) : null}
                        <span className="ml-auto text-label-13 text-[var(--ds-gray-1000)]">
                          {stat.engagementRate.toFixed(1)}% eng. rate
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}

        <section className={surfaceClassName}>
          <SectionHeader
            icon={TrendingUp}
            title="Engagement Timeline"
            sub="likes + comments + shares per day"
          />

          <div className="p-5">
            {analyticsLoading ? (
              <Sk className="h-[220px] rounded-xl" />
            ) : filteredTimeline.length === 0 ? (
              <EmptyState text="No engagement data yet for the selected period." />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={filteredTimeline}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    {ACTIVE_PROVIDERS.map((provider) => (
                      <linearGradient
                        key={provider}
                        id={`grad-${provider}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={meta(provider).chartColor}
                          stopOpacity={0.18}
                        />
                        <stop
                          offset="95%"
                          stopColor={meta(provider).chartColor}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    ))}
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--ds-gray-400)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--ds-gray-900)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: string) =>
                      new Date(value).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })
                    }
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--ds-gray-900)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => fmt(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--ds-background-100)",
                      border: "1px solid var(--ds-gray-400)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "var(--ds-gray-1000)",
                    }}
                    cursor={{
                      stroke: "var(--ds-gray-400)",
                      strokeDasharray: "3 3",
                    }}
                    labelFormatter={(value: string) =>
                      new Date(value).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })
                    }
                    formatter={(value: number, name: string) => [
                      fmt(value),
                      meta(name).label,
                    ]}
                  />
                  {ACTIVE_PROVIDERS.filter(
                    (provider) => !activeProvider || provider === activeProvider
                  ).map((provider) => (
                    <Area
                      key={provider}
                      type="monotone"
                      dataKey={provider}
                      stroke={meta(provider).chartColor}
                      strokeWidth={2}
                      fill={`url(#grad-${provider})`}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className={surfaceClassName}>
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 px-5 py-4",
              "border-b",
              dividerClassName
            )}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-blue-600)]">
                <Star className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">
                Top Posts
              </h2>
            </div>

            <div className={segmentedControlClassName}>
              {(["T24H", "T7D", "T30D", "T90D"] as SnapshotType[]).map((snapshot) => (
                <button
                  key={snapshot}
                  type="button"
                  onClick={() => setSnapshotType(snapshot)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-label-12 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)]",
                    snapshotType === snapshot
                      ? "border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]"
                      : "text-[var(--ds-gray-900)] hover:bg-[var(--ds-background-100)] hover:text-[var(--ds-gray-1000)]"
                  )}
                >
                  {snapshot}
                </button>
              ))}
            </div>
          </div>

          {analyticsLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <Sk key={index} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : filteredTopPosts.length === 0 ? (
            <EmptyState text="No posts found for this snapshot window. Analytics are collected after posts are published." />
          ) : (
            <div className={cn("divide-y", dividerClassName)}>
              {filteredTopPosts.slice(0, 10).map((post, index) => {
                const platformMeta = meta(post.provider);
                const PlatformIcon =
                  PLATFORM_ICONS[post.provider.toLowerCase()] ?? BarChart2;
                const engagements = post.likes + post.comments + post.shares;

                return (
                  <div
                    key={`${post.postId}-${post.provider}`}
                    className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[var(--ds-gray-100)]"
                  >
                    <span className="mt-0.5 w-5 shrink-0 text-label-12 text-[var(--ds-gray-900)]">
                      {index + 1}
                    </span>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
                      <PlatformIcon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-copy-14 text-[var(--ds-gray-1000)]">
                        {post.content ?? "(No preview)"}
                      </p>
                      <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">
                        {fmtDate(post.publishedAt)} · {platformMeta.label}
                      </p>
                    </div>

                    <div className="hidden shrink-0 grid-cols-4 gap-x-5 text-right sm:grid">
                      {[
                        { label: "Impressions", value: fmt(post.impressions) },
                        { label: "Reach", value: fmt(post.reach) },
                        { label: "Engag.", value: fmt(engagements) },
                        {
                          label: "Eng. Rate",
                          value: `${post.engagementRate.toFixed(1)}%`,
                        },
                      ].map((column) => (
                        <div key={column.label}>
                          <p className="text-label-12 text-[var(--ds-gray-900)]">
                            {column.label}
                          </p>
                          <p className="text-label-12 text-[var(--ds-gray-1000)]">
                            {column.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--ds-gray-900)]" />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {analyticsLoading || heatmap.length > 0 ? (
          <section className={surfaceClassName}>
            <SectionHeader
              icon={Clock}
              title="Best Time to Post"
              sub="based on your published post performance"
            />

            <div className="overflow-x-auto p-5">
              {analyticsLoading ? (
                <Sk className="h-40 rounded-xl" />
              ) : (
                <div className="min-w-[560px]">
                  <div className="mb-1 flex items-center">
                    <div className="w-10 shrink-0" />
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <div
                        key={hour}
                        className="flex-1 text-center text-label-12 text-[var(--ds-gray-900)]"
                      >
                        {hour % 3 === 0 ? `${hour}h` : ""}
                      </div>
                    ))}
                  </div>

                  {DAY_LABELS.map((day, dayIndex) => {
                    const isoDay = dayIndex + 1;
                    const maxAverage = Math.max(
                      ...heatmap.map((cell) => cell.avgEngagement),
                      1
                    );

                    return (
                      <div key={day} className="mb-0.5 flex items-center">
                        <div className="w-10 shrink-0 pr-2 text-right text-label-12 text-[var(--ds-gray-900)]">
                          {day}
                        </div>

                        {Array.from({ length: 24 }).map((_, hour) => {
                          const cell = heatmap.find(
                            (entry) =>
                              entry.dayOfWeek === isoDay &&
                              entry.hourOfDay === hour
                          );
                          const intensity = cell
                            ? cell.avgEngagement / maxAverage
                            : 0;

                          return (
                            <div
                              key={hour}
                              title={
                                cell
                                  ? `${day} ${hour}:00 — avg ${Math.round(cell.avgEngagement)} eng (${cell.postCount} posts)`
                                  : `${day} ${hour}:00 — no data`
                              }
                              className="mx-[1px] h-6 flex-1 rounded-sm border border-transparent"
                              style={{
                                backgroundColor: heatmapCellColor(intensity),
                              }}
                            />
                          );
                        })}
                      </div>
                    );
                  })}

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <span className="text-label-12 text-[var(--ds-gray-900)]">
                      Less
                    </span>
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map((value) => (
                      <div
                        key={value}
                        className="h-3.5 w-6 rounded-sm border border-[var(--ds-gray-400)]"
                        style={{ backgroundColor: heatmapCellColor(value) }}
                      />
                    ))}
                    <span className="text-label-12 text-[var(--ds-gray-900)]">
                      More
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : null}

        <section>
          <div className="mb-3 flex items-center gap-3">
            <span className="text-label-12 text-[var(--ds-gray-900)]">
              Coming Soon
            </span>
            <div className="h-px flex-1 bg-[var(--ds-gray-400)]" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                id: "instagram",
                desc: "Reels views, story reach, saves",
              },
              {
                id: "facebook",
                desc: "Page insights, reach & growth",
              },
              {
                id: "threads",
                desc: "Views, reposts, replies",
              },
              {
                id: "tiktok",
                desc: "Views, shares, completion rate",
              },
            ].map((platform) => {
              const platformMeta = meta(platform.id);
              const PlatformIcon = PLATFORM_ICONS[platform.id] ?? BarChart2;

              return (
                <div key={platform.id} className={surfaceClassName}>
                  <div className="flex flex-col gap-2 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
                      <PlatformIcon className="h-4 w-4" />
                    </div>
                    <p className="text-label-14 text-[var(--ds-gray-1000)]">
                      {platformMeta.label}
                    </p>
                    <p className="text-label-12 text-[var(--ds-gray-900)]">
                      {platform.desc}
                    </p>
                    <span className="mt-1 inline-flex w-fit rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2 py-0.5 text-label-12 text-[var(--ds-gray-900)]">
                      Coming soon
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="h-6" />
      </main>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  sub,
}: {
  icon: ElementType;
  title: string;
  sub?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 px-5 py-4",
        "border-b",
        dividerClassName
      )}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-blue-600)]">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">{title}</h2>
      {sub ? (
        <span className="text-label-12 text-[var(--ds-gray-900)]">{sub}</span>
      ) : null}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-copy-14 text-[var(--ds-gray-900)]">{text}</p>
    </div>
  );
}

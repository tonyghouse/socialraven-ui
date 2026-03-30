"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Eye,
  Users,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  BarChart2,
  Clock,
  MessageCircle,
  Share2,
  MousePointerClick,
  Video,
  Star,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchConnectedAccountsApi } from "@/service/connectedAccounts";
import {
  fetchAnalyticsOverviewApi,
  fetchPlatformStatsApi,
  fetchTopPostsApi,
  fetchEngagementTimelineApi,
  fetchBestTimesApi,
  type DateRange,
  type SnapshotType,
  type AnalyticsOverview,
  type PlatformStats,
  type TopPost,
  type TimelineChartRow,
  type HeatmapCell,
} from "@/service/analytics";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";

// ─── Platform meta ────────────────────────────────────────────────────────────

const PLATFORM_META: Record<
  string,
  { label: string; chartColor: string }
> = {
  youtube:  { label: "YouTube", chartColor: "hsl(var(--chart-1))" },
  linkedin: { label: "LinkedIn", chartColor: "hsl(var(--chart-2))" },
  x:        { label: "X / Twitter", chartColor: "hsl(var(--chart-5))" },
  instagram:{ label: "Instagram", chartColor: "hsl(var(--chart-3))" },
  facebook: { label: "Facebook", chartColor: "hsl(var(--chart-4))" },
};

function meta(provider: string) {
  return PLATFORM_META[provider.toLowerCase()] ?? {
    label: provider, chartColor: "hsl(var(--foreground-subtle))",
  };
}

const ACTIVE_PROVIDERS = ["youtube", "linkedin", "x"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysFromRange(r: DateRange) {
  return r === "7d" ? 7 : r === "30d" ? 30 : 90;
}

const PROXY_DOMAINS = ["linkedin.com", "licdn.com"];
function proxyImg(url?: string | null): string | null {
  if (!url) return null;
  return PROXY_DOMAINS.some((d) => url.toLowerCase().includes(d))
    ? `/api/proxy-image?url=${encodeURIComponent(url)}`
    : url;
}
function initials(name?: string) {
  return (name ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-foreground/[0.06]", className)} />;
}

// ─── Trend badge ──────────────────────────────────────────────────────────────

function Trend({ value }: { value: number | null }) {
  if (value === null) return null;
  if (value > 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--success))]">
        <TrendingUp className="h-3 w-3" />+{value.toFixed(1)}%
      </span>
    );
  if (value < 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--destructive))]">
        <TrendingDown className="h-3 w-3" />{value.toFixed(1)}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--foreground-subtle))]">
      <Minus className="h-3 w-3" />0%
    </span>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: number | null;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]">
          <Icon className="h-4 w-4" />
        </div>
        {trend !== undefined && <Trend value={trend ?? null} />}
      </div>
      <div>
        <p className="text-[12px] font-medium text-[hsl(var(--foreground-muted))]">{label}</p>
        {loading
          ? <Sk className="mt-2 h-7 w-20" />
          : <p className="mt-1 text-[24px] font-semibold leading-tight text-[hsl(var(--foreground))]">{value}</p>
        }
      </div>
    </div>
  );
}

// ─── Account chip (small, for the accounts row) ───────────────────────────────

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
  const m = meta(account.platform);

  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-lg border px-2.5 py-2 transition-colors",
        isSelected
          ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/[0.08]"
          : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-raised))]"
      )}
    >
      <Avatar className="h-6 w-6 shrink-0">
        {!imgErr && src
          ? <AvatarImage src={src} alt={account.username} onError={() => setImgErr(true)} />
          : <AvatarFallback className="bg-[hsl(var(--surface-raised))] text-[10px] font-semibold text-[hsl(var(--foreground-muted))]">
              {initials(account.username)}
            </AvatarFallback>
        }
      </Avatar>
      <div className="min-w-0 text-left">
        <p className={cn("max-w-[120px] truncate text-[13px] font-medium", isSelected ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--foreground))]")}>
          {account.username}
        </p>
      </div>
      <span className="rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--foreground-muted))]">
        {m.label}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function AnalyticsPage() {
  const { getToken } = useAuth();

  // ── Filters ──────────────────────────────────────────────────────────────
  const [dateRange, setDateRange]         = useState<DateRange>("30d");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null); // providerUserId
  const [snapshotType, setSnapshotType]   = useState<SnapshotType>("T30D");

  // ── Account data ──────────────────────────────────────────────────────────
  const [accounts, setAccounts]   = useState<ConnectedAccount[]>([]);
  const [acctLoading, setAcctLoading] = useState(true);

  // ── Analytics data ────────────────────────────────────────────────────────
  const [overview, setOverview]       = useState<AnalyticsOverview | null>(null);
  const [platStats, setPlatStats]     = useState<PlatformStats[]>([]);
  const [topPosts, setTopPosts]       = useState<TopPost[]>([]);
  const [timeline, setTimeline]       = useState<TimelineChartRow[]>([]);
  const [heatmap, setHeatmap]         = useState<HeatmapCell[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // ── Load accounts ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const accts = await fetchConnectedAccountsApi(getToken, null);
        setAccounts(accts);
      } catch (e) {
        console.error(e);
      } finally {
        setAcctLoading(false);
      }
    }
    load();
  }, [getToken]);

  // ── Selected account object ───────────────────────────────────────────────
  const selectedAccount = useMemo(
    () => accounts.find((a) => a.providerUserId === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  );

  // ── Active provider filter (from selected account) ────────────────────────
  const activeProvider = selectedAccount?.platform.toLowerCase() ?? null;

  // ── Fetch analytics ───────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setError(null);
    try {
      const [ov, ps, tp, tl, hm] = await Promise.all([
        fetchAnalyticsOverviewApi(getToken, dateRange),
        fetchPlatformStatsApi(getToken, dateRange),
        fetchTopPostsApi(getToken, dateRange, snapshotType),
        fetchEngagementTimelineApi(getToken, dateRange),
        fetchBestTimesApi(getToken),
      ]);
      setOverview(ov);
      setPlatStats(ps);
      setTopPosts(tp);
      setTimeline(tl);
      setHeatmap(hm);
      setLastRefreshed(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [getToken, dateRange, snapshotType]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // ── Derived: filtered by active provider ─────────────────────────────────
  const filteredPlatStats = activeProvider
    ? platStats.filter((s) => s.provider.toLowerCase() === activeProvider)
    : platStats;

  const filteredTopPosts = activeProvider
    ? topPosts.filter((p) => p.provider.toLowerCase() === activeProvider)
    : topPosts;

  const filteredTimeline = useMemo(() => {
    if (!activeProvider) return timeline;
    return timeline.map((row) => {
      const next: TimelineChartRow = { date: row.date, youtube: 0, linkedin: 0, x: 0 };
      if (activeProvider === "youtube")  next.youtube  = row.youtube;
      if (activeProvider === "linkedin") next.linkedin = row.linkedin;
      if (activeProvider === "x")        next.x        = row.x;
      return next;
    });
  }, [timeline, activeProvider]);

  // ── Computed overview from platform stats when single provider ────────────
  const displayOverview = useMemo(() => {
    if (!activeProvider || filteredPlatStats.length === 0) return overview;
    const s = filteredPlatStats[0];
    return {
      totalImpressions:  s.impressions,
      totalReach:        s.reach,
      totalLikes:        s.likes,
      totalComments:     s.comments,
      totalShares:       s.shares,
      totalVideoViews:   s.videoViews,
      followerGrowth:    s.followerGrowth,
      totalPosts:        s.postsPublished,
      avgEngagementRate: s.engagementRate,
    } satisfies AnalyticsOverview;
  }, [activeProvider, filteredPlatStats, overview]);

  const hasData = !!displayOverview && (
    displayOverview.totalImpressions + displayOverview.totalReach + displayOverview.totalPosts > 0
  );

  const rangeLabel = dateRange === "7d" ? "Last 7 days" : dateRange === "30d" ? "Last 30 days" : "Last 90 days";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen page-bg">

      <ProtectedPageHeader
        title="Analytics"
        description="Performance overview across connected social channels."
        icon={<BarChart2 className="h-4 w-4" />}
        actions={
          <>
            <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-1">
              {(["7d", "30d", "90d"] as DateRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                    dateRange === r
                      ? "bg-[hsl(var(--surface))] text-[hsl(var(--foreground))] shadow-sm"
                      : "text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))]"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={fetchAnalytics}
              disabled={analyticsLoading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--surface-raised))] hover:text-[hsl(var(--foreground))]"
              aria-label="Refresh analytics"
            >
              <RefreshCw className={cn("h-4 w-4", analyticsLoading && "animate-spin")} />
            </button>
          </>
        }
      />

      <main className="flex-1 w-full space-y-6 px-4 py-6 sm:px-6">
        <section className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[16px] font-semibold text-[hsl(var(--foreground))]">Overview</p>
              <p className="text-[13px] text-[hsl(var(--foreground-muted))]">
                {activeProvider && selectedAccount
                  ? `Showing ${meta(activeProvider).label} analytics for ${selectedAccount.username}.`
                  : "Showing analytics across all connected accounts."}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[12px] font-medium text-[hsl(var(--foreground-subtle))]">{rangeLabel}</p>
              <p className="text-[12px] text-[hsl(var(--foreground-muted))]">
                {lastRefreshed ? `Updated ${lastRefreshed.toLocaleTimeString()}` : "Waiting for first refresh"}
              </p>
            </div>
          </div>
        </section>

        {/* ── Error banner ──────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-[hsl(var(--destructive))]/25 bg-[hsl(var(--destructive))]/10 px-4 py-3 text-[13px] text-[hsl(var(--destructive))]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={fetchAnalytics} className="text-[12px] font-semibold underline underline-offset-2">Retry</button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            ACCOUNT GROUPS + ACCOUNTS SELECTOR
        ───────────────────────────────────────────────────────────────── */}
        <section className="overflow-hidden rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-sm">

          {/* Connected Accounts */}
          <div className="px-4 py-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[16px] font-semibold text-[hsl(var(--foreground))]">Connected Accounts</p>
                <p className="text-[13px] text-[hsl(var(--foreground-muted))]">
                  {selectedAccount
                    ? `Viewing analytics for ${selectedAccount.username}.`
                    : "Select an account to filter the analytics view."}
                </p>
              </div>
            </div>

            {acctLoading ? (
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: 4 }).map((_, i) => <Sk key={i} className="h-9 w-36" />)}
              </div>
            ) : accounts.length === 0 ? (
              <p className="text-[13px] text-[hsl(var(--foreground-muted))]">
                No connected accounts. Go to{" "}
                <a href="/connect-accounts" className="text-[hsl(var(--accent))] underline underline-offset-2">Connect Accounts</a>.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {accounts.map((a) => (
                  <AccountChip
                    key={a.providerUserId}
                    account={a}
                    isSelected={selectedAccountId === a.providerUserId}
                    onClick={() =>
                      setSelectedAccountId(
                        selectedAccountId === a.providerUserId ? null : a.providerUserId
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            KPI CARDS
        ───────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {analyticsLoading
            ? Array.from({ length: 6 }).map((_, i) => <Sk key={i} className="h-[100px]" />)
            : (
              <>
                <KpiCard icon={Eye}        label="Impressions"    value={hasData ? fmt(displayOverview!.totalImpressions) : "—"} loading={false} />
                <KpiCard icon={Users}      label="Reach"          value={hasData ? fmt(displayOverview!.totalReach) : "—"}        loading={false} />
                <KpiCard icon={Heart}      label="Engagements"    value={hasData ? fmt(displayOverview!.totalLikes + displayOverview!.totalComments + displayOverview!.totalShares) : "—"} loading={false} />
                <KpiCard icon={TrendingUp} label="Eng. Rate"      value={hasData ? `${displayOverview!.avgEngagementRate.toFixed(1)}%` : "—"} loading={false} />
                <KpiCard icon={Users}      label="Follower Growth" value={hasData ? fmt(displayOverview!.followerGrowth) : "—"}   loading={false} />
                <KpiCard icon={BarChart2}  label="Posts Published" value={hasData ? String(displayOverview!.totalPosts) : "—"}    loading={false} />
              </>
            )
          }
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            PLATFORM BREAKDOWN
        ───────────────────────────────────────────────────────────────── */}
        {!activeProvider && (
          <section className="overflow-hidden rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-sm">
            <SectionHeader icon={BarChart2} title="Platform Breakdown" />

            {analyticsLoading ? (
              <div className="p-5 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Sk key={i} className="h-14" />)}</div>
            ) : platStats.length === 0 ? (
              <EmptyState text="No analytics data yet. Publish some posts to see platform metrics." />
            ) : (
              <div className="divide-y divide-[hsl(var(--border-subtle))]">
                {platStats.map((s) => {
                  const m = meta(s.provider);
                  const PlatIcon = PLATFORM_ICONS[s.provider.toLowerCase()] ?? BarChart2;
                  const engagements = s.likes + s.comments + s.shares;
                  const maxImp = Math.max(...platStats.map((p) => p.impressions), 1);

                  return (
                    <div key={s.provider} className="px-5 py-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]">
                          <PlatIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[13px] font-semibold text-[hsl(var(--foreground))]">{m.label}</span>
                            <span className="text-[12px] text-[hsl(var(--foreground-muted))]">{fmt(s.impressions)} impressions</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--surface-raised))]">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${(s.impressions / maxImp) * 100}%`, backgroundColor: m.chartColor }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pl-11 text-[11px] text-[hsl(var(--foreground-muted))]">
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{fmt(s.likes)} likes</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{fmt(s.comments)} comments</span>
                        <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{fmt(s.shares)} shares</span>
                        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{fmt(engagements)} total</span>
                        {s.videoViews > 0 && <span className="flex items-center gap-1"><Video className="h-3 w-3" />{fmt(s.videoViews)} views</span>}
                        {s.clicks > 0 && <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{fmt(s.clicks)} clicks</span>}
                        <span className="ml-auto font-semibold text-[hsl(var(--foreground))]">{s.engagementRate.toFixed(1)}% eng. rate</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            ENGAGEMENT TIMELINE
        ───────────────────────────────────────────────────────────────── */}
        <section className="overflow-hidden rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-sm">
          <SectionHeader
            icon={TrendingUp}
            title="Engagement Timeline"
            sub="likes + comments + shares per day"
          />

          <div className="p-5">
            {analyticsLoading ? (
              <Sk className="h-[200px]" />
            ) : filteredTimeline.length === 0 ? (
              <EmptyState text="No engagement data yet for the selected period." />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={filteredTimeline} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    {ACTIVE_PROVIDERS.map((p) => (
                      <linearGradient key={p} id={`grad-${p}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={meta(p).chartColor} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={meta(p).chartColor} stopOpacity={0}    />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border-subtle))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--foreground-subtle))" }}
                    tickLine={false} axisLine={false}
                    tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--foreground-subtle))" }}
                    tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => fmt(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--surface))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "hsl(var(--foreground))",
                    }}
                    cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }}
                    labelFormatter={(v: string) => new Date(v).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                    formatter={(value: number, name: string) => [fmt(value), meta(name).label]}
                  />
                  {ACTIVE_PROVIDERS.filter((p) => !activeProvider || p === activeProvider).map((p) => (
                    <Area
                      key={p}
                      type="monotone"
                      dataKey={p}
                      stroke={meta(p).chartColor}
                      strokeWidth={2}
                      fill={`url(#grad-${p})`}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            TOP POSTS
        ───────────────────────────────────────────────────────────────── */}
        <section className="overflow-hidden rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border-subtle))] px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
                <Star className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-[16px] font-semibold text-[hsl(var(--foreground))]">Top Posts</h2>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-1">
              {(["T24H", "T7D", "T30D", "T90D"] as SnapshotType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setSnapshotType(t)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
                    snapshotType === t
                      ? "bg-[hsl(var(--surface))] text-[hsl(var(--foreground))] shadow-sm"
                      : "text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))]"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {analyticsLoading ? (
            <div className="p-5 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Sk key={i} className="h-16" />)}</div>
          ) : filteredTopPosts.length === 0 ? (
            <EmptyState text="No posts found for this snapshot window. Analytics are collected after posts are published." />
          ) : (
            <div className="divide-y divide-[hsl(var(--border-subtle))]">
              {filteredTopPosts.slice(0, 10).map((post, idx) => {
                const m = meta(post.provider);
                const PlatIcon = PLATFORM_ICONS[post.provider.toLowerCase()] ?? BarChart2;
                const engagements = post.likes + post.comments + post.shares;

                return (
                  <div
                    key={`${post.postId}-${post.provider}`}
                    className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[hsl(var(--surface-raised))]"
                  >
                    <span className="mt-0.5 w-5 shrink-0 text-[12px] font-semibold text-[hsl(var(--foreground-subtle))]">{idx + 1}</span>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]">
                      <PlatIcon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-2 text-[13px] leading-snug text-[hsl(var(--foreground))]">
                        {post.content ?? "(No preview)"}
                      </p>
                      <p className="mt-1 text-[11px] text-[hsl(var(--foreground-muted))]">
                        {fmtDate(post.publishedAt)} · {m.label}
                      </p>
                    </div>

                    <div className="hidden sm:grid grid-cols-4 gap-x-5 text-right shrink-0">
                      {[
                        { label: "Impressions", value: fmt(post.impressions)   },
                        { label: "Reach",       value: fmt(post.reach)         },
                        { label: "Engag.",      value: fmt(engagements)        },
                        { label: "Eng. Rate",   value: `${post.engagementRate.toFixed(1)}%` },
                      ].map((col) => (
                        <div key={col.label}>
                          <p className="text-[10px] text-[hsl(var(--foreground-subtle))]">{col.label}</p>
                          <p className="text-[12px] font-semibold text-[hsl(var(--foreground))]">{col.value}</p>
                        </div>
                      ))}
                    </div>

                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--foreground-subtle))]" />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            BEST TIME TO POST — HEATMAP
        ───────────────────────────────────────────────────────────────── */}
        {(analyticsLoading || heatmap.length > 0) && (
          <section className="overflow-hidden rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-sm">
            <SectionHeader icon={Clock} title="Best Time to Post" sub="based on your published post performance" />

            <div className="p-5 overflow-x-auto">
              {analyticsLoading ? (
                <Sk className="h-40" />
              ) : (
                <div className="min-w-[560px]">
                  {/* Hour axis */}
                  <div className="flex items-center mb-1">
                    <div className="w-10 shrink-0" />
                    {Array.from({ length: 24 }).map((_, h) => (
                      <div key={h} className="flex-1 text-center text-[9px] text-[hsl(var(--foreground-subtle))]">
                        {h % 3 === 0 ? `${h}h` : ""}
                      </div>
                    ))}
                  </div>

                  {DAY_LABELS.map((day, di) => {
                    const isoDay = di + 1;
                    return (
                      <div key={day} className="flex items-center mb-0.5">
                        <div className="w-10 shrink-0 pr-2 text-right text-[10px] font-medium text-[hsl(var(--foreground-muted))]">{day}</div>
                        {Array.from({ length: 24 }).map((_, hour) => {
                          const cell = heatmap.find((c) => c.dayOfWeek === isoDay && c.hourOfDay === hour);
                          const maxAvg = Math.max(...heatmap.map((c) => c.avgEngagement), 1);
                          const intensity = cell ? cell.avgEngagement / maxAvg : 0;
                          return (
                            <div
                              key={hour}
                              title={cell
                                ? `${day} ${hour}:00 — avg ${Math.round(cell.avgEngagement)} eng (${cell.postCount} posts)`
                                : `${day} ${hour}:00 — no data`
                              }
                              className="flex-1 h-6 rounded-sm mx-[1px]"
                              style={{ backgroundColor: cell ? `hsl(var(--chart-1) / ${0.08 + intensity * 0.72})` : "hsl(var(--surface-raised))" }}
                            />
                          );
                        })}
                      </div>
                    );
                  })}

                  <div className="flex items-center gap-2 mt-3 justify-end">
                    <span className="text-[10px] text-[hsl(var(--foreground-muted))]">Less</span>
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
                      <div key={v} className="h-3.5 w-6 rounded-sm border border-[hsl(var(--border-subtle))]" style={{ backgroundColor: `hsl(var(--chart-1) / ${0.08 + v * 0.72})` }} />
                    ))}
                    <span className="text-[10px] text-[hsl(var(--foreground-muted))]">More</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            COMING SOON
        ───────────────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-3 flex items-center gap-3">
            <span className="text-[12px] font-semibold text-[hsl(var(--foreground-muted))]">Coming Soon</span>
            <div className="h-px flex-1 bg-[hsl(var(--border-subtle))]" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { id: "instagram", grad: "from-pink-500 via-rose-500 to-orange-400", desc: "Reels views, story reach, saves" },
              { id: "facebook",  grad: "from-blue-500 to-blue-700",               desc: "Page insights, reach & growth"  },
              { id: "threads",   grad: "from-slate-700 to-slate-900",             desc: "Views, reposts, replies"        },
              { id: "tiktok",    grad: "from-slate-800 via-pink-500 to-cyan-400", desc: "Views, shares, completion rate" },
            ].map((p) => {
              const m = meta(p.id);
              const PlatIcon = PLATFORM_ICONS[p.id] ?? BarChart2;
              return (
                <div key={p.id} className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
                  <div className="flex flex-col gap-2 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]">
                      <PlatIcon className="h-4 w-4" />
                    </div>
                    <p className="text-[13px] font-semibold text-[hsl(var(--foreground))]">{m.label}</p>
                    <p className="text-[11px] leading-snug text-[hsl(var(--foreground-muted))]">{p.desc}</p>
                    <span className="mt-1 inline-flex w-fit rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--foreground-muted))]">
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

// ─── Shared micro-components ──────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ElementType;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-[hsl(var(--border-subtle))] px-5 py-4">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <h2 className="text-[16px] font-semibold text-[hsl(var(--foreground))]">{title}</h2>
      {sub && <span className="ml-0.5 text-[12px] text-[hsl(var(--foreground-muted))]">{sub}</span>}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-[13px] text-[hsl(var(--foreground-muted))]">{text}</p>
    </div>
  );
}

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
import { fetchAccountGroupsApi } from "@/service/accountGroups";
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
import type { AccountGroup } from "@/model/AccountGroup";

// ─── Platform meta ────────────────────────────────────────────────────────────

const PLATFORM_META: Record<
  string,
  { label: string; chartColor: string; badgeCls: string; iconBg: string }
> = {
  youtube:  { label: "YouTube",     chartColor: "#ef4444", badgeCls: "bg-red-50 text-red-600",    iconBg: "bg-red-100"   },
  linkedin: { label: "LinkedIn",    chartColor: "#2563eb", badgeCls: "bg-blue-50 text-blue-700",  iconBg: "bg-blue-100"  },
  x:        { label: "X / Twitter", chartColor: "#334155", badgeCls: "bg-slate-100 text-slate-600", iconBg: "bg-slate-100" },
  instagram:{ label: "Instagram",   chartColor: "#ec4899", badgeCls: "bg-pink-50 text-pink-600",  iconBg: "bg-pink-100"  },
  facebook: { label: "Facebook",    chartColor: "#3b82f6", badgeCls: "bg-blue-50 text-blue-800",  iconBg: "bg-blue-100"  },
};

function meta(provider: string) {
  return PLATFORM_META[provider.toLowerCase()] ?? {
    label: provider, chartColor: "#94a3b8",
    badgeCls: "bg-slate-100 text-slate-600", iconBg: "bg-slate-100",
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
      <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
        <TrendingUp className="h-3 w-3" />+{value.toFixed(1)}%
      </span>
    );
  if (value < 0)
    return (
      <span className="flex items-center gap-0.5 text-[11px] font-semibold text-red-500">
        <TrendingDown className="h-3 w-3" />{value.toFixed(1)}%
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-foreground/35">
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
  accentCls,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: number | null;
  loading: boolean;
  accentCls: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 shadow-sm p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center justify-center h-8 w-8 rounded-xl", accentCls)}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
        {trend !== undefined && <Trend value={trend ?? null} />}
      </div>
      <div>
        <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">{label}</p>
        {loading
          ? <Sk className="h-7 w-20 mt-1" />
          : <p className="text-2xl font-bold text-foreground leading-tight mt-0.5">{value}</p>
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
        "flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border transition-all duration-150 shrink-0",
        isSelected
          ? "border-accent bg-accent/[0.08] shadow-sm"
          : "border-border/50 bg-card hover:border-border hover:bg-foreground/[0.02]"
      )}
    >
      <Avatar className="h-6 w-6 shrink-0">
        {!imgErr && src
          ? <AvatarImage src={src} alt={account.username} onError={() => setImgErr(true)} />
          : <AvatarFallback className="bg-gradient-to-br from-accent/25 to-accent/10 text-accent text-[9px] font-bold">
              {initials(account.username)}
            </AvatarFallback>
        }
      </Avatar>
      <div className="text-left min-w-0">
        <p className={cn("text-[12px] font-medium truncate max-w-[100px]", isSelected ? "text-accent" : "text-foreground/70")}>
          {account.username}
        </p>
      </div>
      <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full", m.badgeCls)}>
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
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null); // providerUserId
  const [snapshotType, setSnapshotType]   = useState<SnapshotType>("T30D");

  // ── Account/group data ────────────────────────────────────────────────────
  const [accounts, setAccounts]   = useState<ConnectedAccount[]>([]);
  const [groups, setGroups]       = useState<AccountGroup[]>([]);
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

  // ── Load accounts + groups ────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [accts, grps] = await Promise.all([
          fetchConnectedAccountsApi(getToken, null),
          fetchAccountGroupsApi(getToken),
        ]);
        setAccounts(accts);
        setGroups(grps);
      } catch (e) {
        console.error(e);
      } finally {
        setAcctLoading(false);
      }
    }
    load();
  }, [getToken]);

  // ── Accounts visible for selected group ───────────────────────────────────
  const groupAccounts = useMemo(() => {
    if (!selectedGroupId) return accounts;
    const grp = groups.find((g) => g.id === selectedGroupId);
    if (!grp) return accounts;
    return accounts.filter((a) => grp.accountIds.includes(a.providerUserId));
  }, [accounts, groups, selectedGroupId]);

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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen page-bg">

      {/* ─── Sticky header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 h-16 flex items-center border-b border-border/60 bg-background/80 backdrop-blur-xl px-4 sm:px-6 shrink-0 gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-accent/10 shrink-0">
            <BarChart2 className="h-3.5 w-3.5 text-accent" />
          </div>
          <h1 className="text-[14px] font-semibold text-foreground/80 truncate">Analytics</h1>
          {lastRefreshed && (
            <span className="hidden sm:block text-[11px] text-foreground/35">
              · {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-foreground/[0.05] p-0.5">
          {(["7d", "30d", "90d"] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150",
                dateRange === r ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={analyticsLoading}
          className="p-2 rounded-xl text-foreground/40 hover:text-foreground/70 hover:bg-foreground/[0.05] transition-colors"
          aria-label="Refresh analytics"
        >
          <RefreshCw className={cn("h-4 w-4", analyticsLoading && "animate-spin")} />
        </button>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 py-6 space-y-5">

        {/* ── Error banner ──────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={fetchAnalytics} className="text-[12px] font-semibold underline underline-offset-2">Retry</button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            ACCOUNT GROUPS + ACCOUNTS SELECTOR
        ───────────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">

          {/* Account Groups */}
          <div className="px-4 pt-4 pb-3 border-b border-border/40">
            <p className="text-[10px] font-semibold text-foreground/35 uppercase tracking-widest mb-2.5">
              Account Groups
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {/* All */}
              <button
                onClick={() => { setSelectedGroupId(null); setSelectedAccountId(null); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium border transition-all duration-150",
                  selectedGroupId === null
                    ? "bg-foreground text-background border-foreground"
                    : "border-border/50 text-foreground/60 hover:border-border hover:text-foreground"
                )}
              >
                All
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-md",
                  selectedGroupId === null ? "bg-white/20" : "bg-foreground/[0.06] text-foreground/40"
                )}>
                  {accounts.length}
                </span>
              </button>

              {acctLoading
                ? Array.from({ length: 3 }).map((_, i) => <Sk key={i} className="h-8 w-24" />)
                : groups.map((g) => {
                    const cnt = g.accountIds.filter((id) => accounts.some((a) => a.providerUserId === id)).length;
                    const isActive = selectedGroupId === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => { setSelectedGroupId(isActive ? null : g.id); setSelectedAccountId(null); }}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium border transition-all duration-150",
                          isActive
                            ? "text-white border-transparent"
                            : "border-border/50 text-foreground/60 hover:border-border hover:text-foreground"
                        )}
                        style={isActive ? { backgroundColor: g.color, borderColor: g.color } : {}}
                      >
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                        {g.name}
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-md",
                          isActive ? "bg-white/20" : "bg-foreground/[0.06] text-foreground/40"
                        )}>
                          {cnt}
                        </span>
                      </button>
                    );
                  })
              }
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold text-foreground/35 uppercase tracking-widest mb-2.5">
              Connected Accounts
              {selectedAccount && (
                <span className="ml-2 normal-case font-normal text-foreground/50">
                  — viewing <span className="font-semibold text-accent">{selectedAccount.username}</span>
                </span>
              )}
            </p>

            {acctLoading ? (
              <div className="flex items-center gap-2 flex-wrap">
                {Array.from({ length: 4 }).map((_, i) => <Sk key={i} className="h-9 w-36" />)}
              </div>
            ) : groupAccounts.length === 0 ? (
              <p className="text-[12px] text-foreground/35">
                No connected accounts in this group. Go to{" "}
                <a href="/connect-accounts" className="text-accent underline underline-offset-2">Connect Accounts</a>.
              </p>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {groupAccounts.map((a) => (
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {analyticsLoading
            ? Array.from({ length: 6 }).map((_, i) => <Sk key={i} className="h-[100px]" />)
            : (
              <>
                <KpiCard icon={Eye}        label="Impressions"    value={hasData ? fmt(displayOverview!.totalImpressions) : "—"} loading={false} accentCls="bg-violet-500" />
                <KpiCard icon={Users}      label="Reach"          value={hasData ? fmt(displayOverview!.totalReach) : "—"}        loading={false} accentCls="bg-blue-500"   />
                <KpiCard icon={Heart}      label="Engagements"    value={hasData ? fmt(displayOverview!.totalLikes + displayOverview!.totalComments + displayOverview!.totalShares) : "—"} loading={false} accentCls="bg-rose-500"  />
                <KpiCard icon={TrendingUp} label="Eng. Rate"      value={hasData ? `${displayOverview!.avgEngagementRate.toFixed(1)}%` : "—"} loading={false} accentCls="bg-emerald-500" />
                <KpiCard icon={Users}      label="Follower Growth" value={hasData ? fmt(displayOverview!.followerGrowth) : "—"}   loading={false} accentCls="bg-amber-500"  />
                <KpiCard icon={BarChart2}  label="Posts Published" value={hasData ? String(displayOverview!.totalPosts) : "—"}    loading={false} accentCls="bg-accent"       />
              </>
            )
          }
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            PLATFORM BREAKDOWN
        ───────────────────────────────────────────────────────────────── */}
        {!activeProvider && (
          <section className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
            <SectionHeader icon={BarChart2} title="Platform Breakdown" />

            {analyticsLoading ? (
              <div className="p-5 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Sk key={i} className="h-14" />)}</div>
            ) : platStats.length === 0 ? (
              <EmptyState text="No analytics data yet. Publish some posts to see platform metrics." />
            ) : (
              <div className="divide-y divide-border/40">
                {platStats.map((s) => {
                  const m = meta(s.provider);
                  const PlatIcon = PLATFORM_ICONS[s.provider.toLowerCase()] ?? BarChart2;
                  const engagements = s.likes + s.comments + s.shares;
                  const maxImp = Math.max(...platStats.map((p) => p.impressions), 1);

                  return (
                    <div key={s.provider} className="px-5 py-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn("flex items-center justify-center h-8 w-8 rounded-lg shrink-0", m.iconBg)}>
                          <PlatIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[13px] font-semibold text-foreground">{m.label}</span>
                            <span className="text-[12px] text-foreground/50">{fmt(s.impressions)} impressions</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${(s.impressions / maxImp) * 100}%`, backgroundColor: m.chartColor }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pl-11 flex-wrap text-[11px] text-foreground/50">
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{fmt(s.likes)} likes</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{fmt(s.comments)} comments</span>
                        <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{fmt(s.shares)} shares</span>
                        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{fmt(engagements)} total</span>
                        {s.videoViews > 0 && <span className="flex items-center gap-1"><Video className="h-3 w-3" />{fmt(s.videoViews)} views</span>}
                        {s.clicks > 0 && <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{fmt(s.clicks)} clicks</span>}
                        <span className="ml-auto font-semibold text-foreground/70">{s.engagementRate.toFixed(1)}% eng. rate</span>
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
        <section className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "rgba(15,23,42,0.35)" }}
                    tickLine={false} axisLine={false}
                    tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "rgba(15,23,42,0.35)" }}
                    tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => fmt(v)}
                  />
                  <Tooltip
                    contentStyle={{ background: "white", border: "1px solid rgba(15,23,42,0.08)", borderRadius: 10, fontSize: 12 }}
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
        <section className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-accent/10">
                <Star className="h-3.5 w-3.5 text-accent" />
              </div>
              <h2 className="text-[13px] font-semibold text-foreground/70">Top Posts</h2>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-foreground/[0.05] p-0.5">
              {(["T24H", "T7D", "T30D", "T90D"] as SnapshotType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setSnapshotType(t)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150",
                    snapshotType === t ? "bg-white shadow-sm text-foreground" : "text-foreground/45 hover:text-foreground/70"
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
            <div className="divide-y divide-border/40">
              {filteredTopPosts.slice(0, 10).map((post, idx) => {
                const m = meta(post.provider);
                const PlatIcon = PLATFORM_ICONS[post.provider.toLowerCase()] ?? BarChart2;
                const engagements = post.likes + post.comments + post.shares;

                return (
                  <div
                    key={`${post.postId}-${post.provider}`}
                    className="px-5 py-4 flex items-start gap-4 hover:bg-foreground/[0.015] transition-colors"
                  >
                    <span className="text-[12px] font-bold text-foreground/20 w-5 shrink-0 mt-0.5">{idx + 1}</span>

                    <div className={cn("flex items-center justify-center h-8 w-8 rounded-lg shrink-0", m.iconBg)}>
                      <PlatIcon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground/80 line-clamp-2 leading-snug">
                        {post.content ?? "(No preview)"}
                      </p>
                      <p className="text-[11px] text-foreground/35 mt-1">
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
                          <p className="text-[10px] text-foreground/35">{col.label}</p>
                          <p className="text-[12px] font-semibold text-foreground">{col.value}</p>
                        </div>
                      ))}
                    </div>

                    <ChevronRight className="h-4 w-4 text-foreground/20 shrink-0 mt-1" />
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
          <section className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
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
                      <div key={h} className="flex-1 text-center text-[9px] text-foreground/30">
                        {h % 3 === 0 ? `${h}h` : ""}
                      </div>
                    ))}
                  </div>

                  {DAY_LABELS.map((day, di) => {
                    const isoDay = di + 1;
                    return (
                      <div key={day} className="flex items-center mb-0.5">
                        <div className="w-10 shrink-0 text-[10px] font-medium text-foreground/40 pr-2 text-right">{day}</div>
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
                              style={{ backgroundColor: `rgba(59,130,246,${0.05 + intensity * 0.85})` }}
                            />
                          );
                        })}
                      </div>
                    );
                  })}

                  <div className="flex items-center gap-2 mt-3 justify-end">
                    <span className="text-[10px] text-foreground/35">Less</span>
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
                      <div key={v} className="h-3.5 w-6 rounded-sm" style={{ backgroundColor: `rgba(59,130,246,${0.05 + v * 0.85})` }} />
                    ))}
                    <span className="text-[10px] text-foreground/35">More</span>
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
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] font-semibold text-foreground/30 uppercase tracking-widest">Coming Soon</span>
            <div className="flex-1 h-px bg-foreground/[0.06]" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "instagram", grad: "from-pink-500 via-rose-500 to-orange-400", desc: "Reels views, story reach, saves" },
              { id: "facebook",  grad: "from-blue-500 to-blue-700",               desc: "Page insights, reach & growth"  },
              { id: "threads",   grad: "from-slate-700 to-slate-900",             desc: "Views, reposts, replies"        },
              { id: "tiktok",    grad: "from-slate-800 via-pink-500 to-cyan-400", desc: "Views, shares, completion rate" },
            ].map((p) => {
              const m = meta(p.id);
              const PlatIcon = PLATFORM_ICONS[p.id] ?? BarChart2;
              return (
                <div key={p.id} className="relative rounded-2xl border border-border/40 bg-card overflow-hidden">
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.04]", p.grad)} />
                  <div className="relative p-4 flex flex-col gap-2">
                    <div className={cn("h-8 w-8 rounded-xl bg-gradient-to-br flex items-center justify-center", p.grad)}>
                      <PlatIcon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-[13px] font-semibold text-foreground/70">{m.label}</p>
                    <p className="text-[11px] text-foreground/40 leading-snug">{p.desc}</p>
                    <span className="inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-medium bg-foreground/[0.06] text-foreground/40 mt-1">
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
    <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2">
      <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-accent/10 shrink-0">
        <Icon className="h-3.5 w-3.5 text-accent" />
      </div>
      <h2 className="text-[13px] font-semibold text-foreground/70">{title}</h2>
      {sub && <span className="text-[11px] text-foreground/35 ml-0.5">{sub}</span>}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-[13px] text-foreground/35">{text}</p>
    </div>
  );
}

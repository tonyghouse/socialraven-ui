"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  Heart,
  Users,
  Calendar,
  BarChart2,
  Clock,
  Zap,
  Search,
  ChevronLeft,
  ChevronRight,
  Activity,
  Loader2,
  AlertCircle,
  X as XIcon,
  Layers,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { fetchAccountGroupsApi } from "@/service/accountGroups";
import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import type { AccountGroup } from "@/model/AccountGroup";

// ── Constants ─────────────────────────────────────────────────────────────────

type Period = "1W" | "15D" | "1M" | "3M";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "1W",  label: "1 Week"   },
  { value: "15D", label: "15 Days"  },
  { value: "1M",  label: "1 Month"  },
  { value: "3M",  label: "3 Months" },
];

const PERIOD_DAYS: Record<Period, number> = {
  "1W":  7,
  "15D": 15,
  "1M":  30,
  "3M":  90,
};

const ACCOUNTS_PER_PAGE = 8;

const PLATFORM_META: Record<
  string,
  { label: string; color: string; badge: string }
> = {
  linkedin:  { label: "LinkedIn",    color: "#0077b5", badge: "bg-blue-50 text-blue-700 border-blue-200"    },
  instagram: { label: "Instagram",   color: "#e1306c", badge: "bg-pink-50 text-pink-600 border-pink-200"    },
  x:         { label: "X / Twitter", color: "#18181b", badge: "bg-slate-100 text-slate-600 border-slate-200"},
  facebook:  { label: "Facebook",    color: "#1877f2", badge: "bg-blue-50 text-blue-800 border-blue-200"    },
  youtube:   { label: "YouTube",     color: "#ff0000", badge: "bg-red-50 text-red-600 border-red-200"       },
  threads:   { label: "Threads",     color: "#101010", badge: "bg-gray-100 text-gray-600 border-gray-200"   },
  tiktok:    { label: "TikTok",      color: "#69C9D0", badge: "bg-teal-50 text-teal-600 border-teal-200"    },
};

// Reference baseline: "all accounts combined" 30-day totals used for scaling.
const BASE_1M_TOTAL_REACH = 724_000;

// Base timeline shapes (represent "all accounts" totals, scaled per group).
const BASE_TIMELINE: Record<
  Period,
  Array<{ date: string; reach: number; impressions: number }>
> = {
  "1W": [
    { date: "Mon", reach: 18400,  impressions: 52000  },
    { date: "Tue", reach: 22100,  impressions: 61000  },
    { date: "Wed", reach: 19800,  impressions: 55000  },
    { date: "Thu", reach: 31200,  impressions: 88000  },
    { date: "Fri", reach: 28500,  impressions: 79000  },
    { date: "Sat", reach: 15200,  impressions: 41000  },
    { date: "Sun", reach: 12800,  impressions: 35000  },
  ],
  "15D": [
    { date: "Feb 8",  reach: 62000,  impressions: 175000 },
    { date: "Feb 10", reach: 71000,  impressions: 200000 },
    { date: "Feb 12", reach: 85000,  impressions: 238000 },
    { date: "Feb 14", reach: 79000,  impressions: 222000 },
    { date: "Feb 16", reach: 91000,  impressions: 256000 },
    { date: "Feb 18", reach: 88000,  impressions: 247000 },
    { date: "Feb 20", reach: 97000,  impressions: 272000 },
    { date: "Feb 22", reach: 104000, impressions: 291000 },
  ],
  "1M": [
    { date: "Jan 25", reach: 52000,  impressions: 148000 },
    { date: "Jan 28", reach: 61000,  impressions: 172000 },
    { date: "Jan 31", reach: 58000,  impressions: 161000 },
    { date: "Feb 3",  reach: 74000,  impressions: 208000 },
    { date: "Feb 6",  reach: 82000,  impressions: 231000 },
    { date: "Feb 9",  reach: 79000,  impressions: 222000 },
    { date: "Feb 12", reach: 91000,  impressions: 256000 },
    { date: "Feb 15", reach: 88000,  impressions: 247000 },
    { date: "Feb 18", reach: 98000,  impressions: 278000 },
    { date: "Feb 21", reach: 104000, impressions: 294000 },
  ],
  "3M": [
    { date: "Dec 1",  reach: 280000, impressions: 790000  },
    { date: "Dec 15", reach: 310000, impressions: 875000  },
    { date: "Jan 1",  reach: 360000, impressions: 1020000 },
    { date: "Jan 15", reach: 410000, impressions: 1160000 },
    { date: "Feb 1",  reach: 480000, impressions: 1360000 },
    { date: "Feb 15", reach: 520000, impressions: 1480000 },
  ],
};

const HEATMAP_DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEATMAP_HOURS = ["6am", "9am", "12pm", "3pm", "6pm", "9pm"];
const HEATMAP_VALUES = [
  [22, 68, 82, 79, 88, 61],
  [19, 71, 85, 83, 91, 68],
  [24, 65, 78, 81, 87, 64],
  [21, 74, 88, 92, 95, 72],
  [18, 69, 81, 85, 84, 59],
  [28, 48, 62, 71, 76, 82],
  [31, 42, 58, 66, 72, 78],
];

const AI_INSIGHTS = [
  {
    icon: "🎯",
    bg: "bg-blue-50",    border: "border-blue-200",
    badge: "Timing",     badgeColor: "text-blue-700 border-blue-300",
    title: "Peak window: Thu 3–6 PM",
    desc:  "Thursday 3–6 PM delivers the highest engagement. Schedule premium content here for maximum impact.",
  },
  {
    icon: "🎬",
    bg: "bg-purple-50",  border: "border-purple-200",
    badge: "Content",    badgeColor: "text-purple-700 border-purple-300",
    title: "Video outperforms by 2.8×",
    desc:  "Video posts achieve 2.8× more reach than static images. Increasing video output boosts overall reach significantly.",
  },
  {
    icon: "🌍",
    bg: "bg-green-50",   border: "border-green-200",
    badge: "Audience",   badgeColor: "text-green-700 border-green-300",
    title: "EU audience surging +34%",
    desc:  "German and French audiences grew 34% this period. Localised DE/FR content could unlock 2× EU engagement.",
  },
  {
    icon: "🔁",
    bg: "bg-amber-50",   border: "border-amber-200",
    badge: "Strategy",   badgeColor: "text-amber-700 border-amber-300",
    title: "Cross-posting opportunity",
    desc:  "Top LinkedIn posts could gain 3× more reach on Instagram with vertical format. Repurpose for instant ROI.",
  },
];

// ── Mock stats (deterministic hash of providerUserId — consistent per account) ─

interface BaseStats {
  followers:       number;
  engRate:         number;
  reach30D:        number;
  impressions30D:  number;
  engagements30D:  number;
  posts30D:        number;
  published30D:    number;
  followerGrowth30D: number;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mockBaseStats(providerUserId: string, platform: string): BaseStats {
  const h = hashStr(providerUserId);

  const cfg: Record<string, { eMin: number; eMax: number; rMult: number }> = {
    instagram: { eMin: 3.5, eMax: 7.5,  rMult: 1.4 },
    youtube:   { eMin: 4.0, eMax: 9.0,  rMult: 1.2 },
    linkedin:  { eMin: 2.5, eMax: 5.5,  rMult: 0.9 },
    facebook:  { eMin: 2.0, eMax: 4.5,  rMult: 1.1 },
    x:         { eMin: 1.5, eMax: 4.0,  rMult: 0.8 },
    tiktok:    { eMin: 4.0, eMax: 12.0, rMult: 1.6 },
    threads:   { eMin: 2.0, eMax: 5.0,  rMult: 0.9 },
  };

  const c   = cfg[platform] ?? { eMin: 2.0, eMax: 5.0, rMult: 1.0 };
  const r1  = (h         & 0xFFFF) / 0xFFFF;
  const r2  = ((h >>  8) & 0xFFFF) / 0xFFFF;
  const r3  = ((h >> 16) & 0xFFFF) / 0xFFFF;
  const r4  = ((h >>  4) & 0xFFFF) / 0xFFFF;

  const followers    = Math.round(4_000 + r1 * 96_000);
  const engRate      = +(c.eMin + r2 * (c.eMax - c.eMin)).toFixed(1);
  const reach30D     = Math.round(followers * c.rMult * (0.12 + r3 * 0.28));
  const imp30D       = Math.round(reach30D  * (2.2 + r4 * 1.1));
  const posts30D     = Math.round(6 + r1 * 24);
  const pub30D       = Math.min(Math.round(posts30D * (0.85 + r2 * 0.13)), posts30D);
  const growth30D    = Math.round(followers * (0.012 + r3 * 0.04));

  return {
    followers,
    engRate,
    reach30D,
    impressions30D:   imp30D,
    engagements30D:   Math.round(reach30D * engRate / 100),
    posts30D,
    published30D:     pub30D,
    followerGrowth30D: growth30D,
  };
}

function scaledStats(base: BaseStats, period: Period) {
  const s = PERIOD_DAYS[period] / 30;
  return {
    reach:         Math.round(base.reach30D         * s),
    impressions:   Math.round(base.impressions30D   * s),
    engagements:   Math.round(base.engagements30D   * s),
    followers:     base.followers,
    followerGrowth: Math.round(base.followerGrowth30D * s),
    engRate:       base.engRate,
    posts:         Math.round(base.posts30D          * s),
    published:     Math.round(base.published30D      * s),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

function heatColor(v: number) {
  if (v >= 85) return "bg-blue-600";
  if (v >= 70) return "bg-blue-400";
  if (v >= 55) return "bg-blue-300";
  if (v >= 40) return "bg-blue-200";
  return "bg-blue-100";
}

function getInitials(name: string): string {
  return name.split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { getToken } = useAuth();

  // ── Remote data ──────────────────────────────────────────────────────────
  const [groups,   setGroups]   = useState<AccountGroup[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [selectedTabId,    setSelectedTabId]    = useState<string>("");
  const [period,           setPeriod]           = useState<Period>("1M");
  const [search,           setSearch]           = useState("");
  const [platformFilter,   setPlatformFilter]   = useState("all");
  const [page,             setPage]             = useState(0);

  // ── Load groups + accounts ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [gs, accs] = await Promise.all([
          fetchAccountGroupsApi(getToken),
          fetchAllConnectedAccountsApi(getToken),
        ]);
        if (cancelled) return;
        const safeGroups = gs ?? [];
        const safeAccounts = accs ?? [];
        setGroups(safeGroups);
        setAccounts(safeAccounts);
        setSelectedTabId(safeGroups.length > 0 ? safeGroups[0].id : "ungrouped");
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load analytics");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [getToken]);

  // ── Derived: ungrouped accounts ───────────────────────────────────────────
  const groupedIds = useMemo(
    () => new Set(groups.flatMap((g) => g.accountIds)),
    [groups]
  );

  const ungroupedAccounts = useMemo(
    () => accounts.filter((a) => !groupedIds.has(a.providerUserId)),
    [accounts, groupedIds]
  );

  // ── Tabs (groups + optional "Ungrouped") ──────────────────────────────────
  const tabs = useMemo(() => {
    const result: Array<{
      id: string;
      label: string;
      color?: string;
      count: number;
    }> = groups.map((g) => ({
      id:    g.id,
      label: g.name,
      color: g.color,
      count: accounts.filter((a) => g.accountIds.includes(a.providerUserId)).length,
    }));

    if (ungroupedAccounts.length > 0 || groups.length === 0) {
      result.push({
        id:    "ungrouped",
        label: "Ungrouped",
        count: ungroupedAccounts.length,
      });
    }

    return result;
  }, [groups, accounts, ungroupedAccounts]);

  // ── Selected group ────────────────────────────────────────────────────────
  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedTabId),
    [groups, selectedTabId]
  );

  // ── Accounts in the selected tab ──────────────────────────────────────────
  const selectedAccounts = useMemo(() => {
    if (selectedTabId === "ungrouped") return ungroupedAccounts;
    if (!selectedGroup) return [];
    return accounts.filter((a) => selectedGroup.accountIds.includes(a.providerUserId));
  }, [selectedTabId, selectedGroup, accounts, ungroupedAccounts]);

  // ── Platforms present in the current tab ──────────────────────────────────
  const scopePlatforms = useMemo(
    () => [...new Set(selectedAccounts.map((a) => a.platform))],
    [selectedAccounts]
  );

  // ── Client-side search + platform filter ──────────────────────────────────
  const filteredAccounts = useMemo(
    () =>
      selectedAccounts.filter((a) => {
        const matchName     = a.username.toLowerCase().includes(search.toLowerCase());
        const matchPlatform = platformFilter === "all" || a.platform === platformFilter;
        return matchName && matchPlatform;
      }),
    [selectedAccounts, search, platformFilter]
  );

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages    = Math.max(1, Math.ceil(filteredAccounts.length / ACCOUNTS_PER_PAGE));
  const pagedAccounts = useMemo(
    () => filteredAccounts.slice(page * ACCOUNTS_PER_PAGE, (page + 1) * ACCOUNTS_PER_PAGE),
    [filteredAccounts, page]
  );

  // Reset page when filter changes
  useEffect(() => { setPage(0); }, [search, platformFilter, selectedTabId]);

  // ── Tab switch (also clears search/filter) ────────────────────────────────
  const switchTab = useCallback((id: string) => {
    setSelectedTabId(id);
    setSearch("");
    setPlatformFilter("all");
    setPage(0);
  }, []);

  // ── Aggregate KPI stats for selected accounts ─────────────────────────────
  const groupStats = useMemo(() => {
    if (!selectedAccounts.length) return null;

    let reach = 0, impressions = 0, followers = 0, followerGrowth = 0;
    let totalEngRate = 0, posts = 0, published = 0, reach30DTotal = 0;

    for (const acc of selectedAccounts) {
      const base = mockBaseStats(acc.providerUserId, acc.platform);
      const s    = scaledStats(base, period);
      reach         += s.reach;
      impressions   += s.impressions;
      followers     += s.followers;
      followerGrowth += s.followerGrowth;
      totalEngRate  += s.engRate;
      posts         += s.posts;
      published     += s.published;
      reach30DTotal += base.reach30D;
    }

    return {
      reach,
      impressions,
      followers,
      followerGrowth,
      avgEngRate:  +(totalEngRate / selectedAccounts.length).toFixed(1),
      posts,
      published,
      successRate: posts > 0 ? +((published / posts) * 100).toFixed(1) : 0,
      reach30DTotal,
    };
  }, [selectedAccounts, period]);

  // ── Timeline (group's reach fraction × base timeline) ─────────────────────
  const timeline = useMemo(() => {
    const scale = groupStats
      ? groupStats.reach30DTotal / BASE_1M_TOTAL_REACH
      : 0;
    return BASE_TIMELINE[period].map((d) => ({
      date:        d.date,
      reach:       Math.round(d.reach       * scale),
      impressions: Math.round(d.impressions * scale),
    }));
  }, [period, groupStats]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const scopeColor = selectedGroup?.color;
  const scopeLabel = selectedTabId === "ungrouped"
    ? "Ungrouped accounts"
    : selectedGroup?.name ?? "";

  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? period;

  return (
    <main className="min-h-screen bg-background">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Title + period selector */}
          <div className="flex items-center justify-between gap-4 py-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/10 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground tracking-tight">Analytics</h1>
                <p className="text-xs text-muted-foreground">
                  {selectedAccounts.length > 0
                    ? `${selectedAccounts.length} account${selectedAccounts.length !== 1 ? "s" : ""} in scope`
                    : "Select a group to view analytics"}
                </p>
              </div>
            </div>

            {/* Period pills */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {PERIOD_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPeriod(value)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                    period === value
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Group tabs */}
          {tabs.length > 0 && (
            <div className="flex items-center gap-1.5 pb-3 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap shrink-0",
                    selectedTabId === tab.id
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {tab.color && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tab.color }}
                    />
                  )}
                  {tab.label}
                  <span
                    className={cn(
                      "px-1.5 rounded text-[10px]",
                      selectedTabId === tab.id
                        ? "bg-white/20 text-background"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── No accounts ── */}
      {accounts.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-foreground/60">No connected accounts</p>
          <p className="text-xs text-muted-foreground mt-1">
            Connect accounts in{" "}
            <a href="/connect-accounts" className="text-blue-500 hover:underline">
              Connect Accounts
            </a>{" "}
            to see analytics.
          </p>
        </div>
      )}

      {/* ── Main content ── */}
      {accounts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* ── Scope banner ── */}
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs flex-wrap"
            style={
              scopeColor
                ? { backgroundColor: scopeColor + "10", borderColor: scopeColor + "30" }
                : undefined
            }
          >
            {scopeColor ? (
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: scopeColor }}
              />
            ) : (
              <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="font-semibold text-foreground">{scopeLabel}</span>
            <span className="text-border">·</span>
            <span className="text-muted-foreground">
              {selectedAccounts.length} account{selectedAccounts.length !== 1 ? "s" : ""}
            </span>

            {scopePlatforms.length > 0 && (
              <>
                <span className="text-border">·</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {scopePlatforms.map((p) => {
                    const meta = PLATFORM_META[p];
                    return (
                      <span
                        key={p}
                        className={cn(
                          "px-1.5 py-0 rounded-full text-[10px] font-medium border",
                          meta?.badge
                        )}
                      >
                        {meta?.label ?? p}
                      </span>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ── KPI Row ── */}
          {groupStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <KpiCard
                label="Total Reach"
                value={fmt(groupStats.reach)}
                icon={<Eye className="w-4 h-4" />}
                accent="blue"
              />
              <KpiCard
                label="Impressions"
                value={fmt(groupStats.impressions)}
                icon={<Activity className="w-4 h-4" />}
                accent="purple"
              />
              <KpiCard
                label="Avg Engagement"
                value={`${groupStats.avgEngRate}%`}
                icon={<Heart className="w-4 h-4" />}
                accent="pink"
              />
              <KpiCard
                label="Total Followers"
                value={fmt(groupStats.followers)}
                icon={<Users className="w-4 h-4" />}
                accent="green"
                sub={`+${fmt(groupStats.followerGrowth)} gained`}
              />
              <KpiCard
                label="Posts Published"
                value={`${groupStats.published}`}
                icon={<Calendar className="w-4 h-4" />}
                accent="amber"
                sub={`${groupStats.successRate}% success rate`}
              />
            </div>
          )}

          {/* ── Reach & Impressions chart ── */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base">Reach &amp; Impressions</CardTitle>
                  <CardDescription className="text-xs">
                    {scopeLabel} · {periodLabel}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    Reach
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                    Impressions
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="gRA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="gIA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: 11 }}
                    tickFormatter={fmt}
                    width={46}
                  />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    fill="url(#gIA)"
                  />
                  <Area
                    type="monotone"
                    dataKey="reach"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#gRA)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ── Account Breakdown ── */}
          <div className="space-y-3">

            {/* Section header + search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
                <h2 className="text-sm font-semibold text-foreground">Accounts</h2>
                <Badge variant="secondary" className="text-xs">
                  {filteredAccounts.length}
                  {filteredAccounts.length !== selectedAccounts.length &&
                    ` of ${selectedAccounts.length}`}
                </Badge>
              </div>

              {/* Search */}
              <div className="relative sm:ml-auto">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-7 py-1.5 text-xs rounded-lg border border-border bg-background outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 w-full sm:w-48 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Platform filter chips (only when multiple platforms in scope) */}
            {scopePlatforms.length > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground shrink-0">Platform:</span>
                <button
                  onClick={() => setPlatformFilter("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                    platformFilter === "all"
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  All
                </button>
                {scopePlatforms.map((p) => {
                  const meta    = PLATFORM_META[p];
                  const isActive = platformFilter === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPlatformFilter(isActive ? "all" : p)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                        isActive
                          ? "text-white border-transparent shadow-sm"
                          : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                      )}
                      style={isActive ? { backgroundColor: meta?.color } : undefined}
                    >
                      {meta?.label ?? p}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {selectedAccounts.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-border rounded-xl">
                <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No accounts in this group
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add accounts in{" "}
                  <a href="/connect-accounts" className="text-blue-500 hover:underline">
                    Connect Accounts
                  </a>
                </p>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="py-14 text-center border border-dashed border-border rounded-xl">
                <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No accounts found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different search term or clear the filters
                </p>
              </div>
            ) : (
              <>
                {/* Account cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {pagedAccounts.map((acc) => (
                    <AccountCard
                      key={acc.providerUserId}
                      account={acc}
                      period={period}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted-foreground">
                      Showing{" "}
                      {page * ACCOUNTS_PER_PAGE + 1}–
                      {Math.min((page + 1) * ACCOUNTS_PER_PAGE, filteredAccounts.length)}{" "}
                      of {filteredAccounts.length} accounts
                    </p>

                    <div className="flex items-center gap-1.5">
                      {/* Prev */}
                      <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Page numbers (≤7) or text indicator */}
                      {totalPages <= 7 ? (
                        Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setPage(i)}
                            className={cn(
                              "w-7 h-7 rounded-lg text-xs font-medium border transition-all",
                              page === i
                                ? "bg-foreground text-background border-foreground"
                                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                            )}
                          >
                            {i + 1}
                          </button>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground px-2">
                          Page {page + 1} of {totalPages}
                        </span>
                      )}

                      {/* Next */}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Best Times heatmap ── */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Best Times to Post
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Engagement score by day &amp; hour — darker = higher performance
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Low</span>
                  {["bg-blue-100","bg-blue-200","bg-blue-300","bg-blue-400","bg-blue-600"].map((c) => (
                    <div key={c} className={`w-5 h-3 rounded-sm ${c}`} />
                  ))}
                  <span className="text-xs text-muted-foreground">High</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[360px]">
                  <div className="flex ml-10 mb-1.5">
                    {HEATMAP_HOURS.map((h) => (
                      <div
                        key={h}
                        className="flex-1 text-center text-xs text-muted-foreground"
                      >
                        {h}
                      </div>
                    ))}
                  </div>
                  {HEATMAP_DAYS.map((day, di) => (
                    <div key={day} className="flex items-center gap-1 mb-1.5">
                      <span className="w-9 text-xs text-muted-foreground shrink-0">
                        {day}
                      </span>
                      {HEATMAP_VALUES[di].map((v, hi) => (
                        <div
                          key={hi}
                          title={`${day} ${HEATMAP_HOURS[hi]}: score ${v}`}
                          className={cn(
                            "flex-1 h-7 rounded-md cursor-default transition-colors",
                            heatColor(v)
                          )}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── AI Smart Insights ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">Smart Insights</h2>
              <Badge variant="secondary" className="text-xs">AI-powered</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AI_INSIGHTS.map((ins, i) => (
                <div key={i} className={cn("p-4 rounded-xl border", ins.bg, ins.border)}>
                  <div className="flex items-start justify-between mb-2.5">
                    <span className="text-2xl">{ins.icon}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", ins.badgeColor)}
                    >
                      {ins.badge}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {ins.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {ins.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </main>
  );
}

// ── AccountCard ───────────────────────────────────────────────────────────────

function AccountCard({
  account,
  period,
}: {
  account: ConnectedAccount;
  period: Period;
}) {
  const base  = useMemo(
    () => mockBaseStats(account.providerUserId, account.platform),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [account.providerUserId, account.platform]
  );
  const stats = useMemo(() => scaledStats(base, period), [base, period]);
  const meta  = PLATFORM_META[account.platform];
  const publishRate =
    base.posts30D > 0 ? (base.published30D / base.posts30D) * 100 : 100;

  return (
    <div
      className="rounded-xl border border-border/60 bg-card hover:shadow-md transition-shadow overflow-hidden"
      style={{ borderTop: `2.5px solid ${meta?.color ?? "#94a3b8"}` }}
    >
      <div className="p-3.5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{ backgroundColor: meta?.color ?? "#94a3b8" }}
          >
            {getInitials(account.username)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate">
              {account.username}
            </p>
            <span
              className={cn(
                "inline-block px-1.5 py-0 text-[10px] font-medium rounded-full border capitalize",
                meta?.badge ?? "bg-gray-100 text-gray-600 border-gray-200"
              )}
            >
              {meta?.label ?? account.platform}
            </span>
          </div>
        </div>

        {/* Stats 2×2 grid */}
        <div className="grid grid-cols-2 gap-1.5">
          <MiniStat label="Reach"       value={fmt(stats.reach)} />
          <MiniStat
            label="Followers"
            value={fmt(stats.followers)}
            sub={`+${fmt(stats.followerGrowth)}`}
          />
          <MiniStat label="Impressions" value={fmt(stats.impressions)} />
          <MiniStat label="Eng. Rate"   value={`${stats.engRate}%`} highlight />
        </div>

        {/* Posts published bar */}
        <div className="mt-2.5 pt-2.5 border-t border-border/50">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span>Posts published</span>
            <span className="font-semibold text-foreground">
              {stats.published} / {stats.posts}
            </span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width:           `${Math.min(publishRate, 100)}%`,
                backgroundColor: meta?.color ?? "#94a3b8",
                opacity:         0.8,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── KpiCard ───────────────────────────────────────────────────────────────────

const ACCENT_MAP = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-600"   },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
  pink:   { bg: "bg-pink-50",   text: "text-pink-600"   },
  green:  { bg: "bg-green-50",  text: "text-green-600"  },
  amber:  { bg: "bg-amber-50",  text: "text-amber-600"  },
};

function KpiCard({
  label,
  value,
  icon,
  accent,
  sub,
}: {
  label:  string;
  value:  string;
  icon:   React.ReactNode;
  accent: keyof typeof ACCENT_MAP;
  sub?:   string;
}) {
  const { bg, text } = ACCENT_MAP[accent];
  return (
    <Card className="border-border/60 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", bg)}>
          <span className={text}>{icon}</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── MiniStat ─────────────────────────────────────────────────────────────────

function MiniStat({
  label,
  value,
  sub,
  highlight,
}: {
  label:     string;
  value:     string;
  sub?:      string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("text-xs font-bold text-foreground", highlight && "text-blue-600")}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-green-600">{sub}</p>}
    </div>
  );
}

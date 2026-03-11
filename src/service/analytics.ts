// src/service/analytics.ts
// Real analytics service — all calls go to the backend API.

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

type GetToken = () => Promise<string | null>;

// ─── Types matching backend DTOs exactly ──────────────────────────────────────

export type DateRange = "7d" | "30d" | "90d";
export type SnapshotType = "T24H" | "T7D" | "T30D" | "T90D";

export interface AnalyticsOverview {
  totalImpressions: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalVideoViews: number;
  followerGrowth: number;
  totalPosts: number;
  avgEngagementRate: number;
}

export interface PlatformStats {
  provider: string; // "youtube" | "linkedin" | "x"
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  videoViews: number;
  followerGrowth: number;
  postsPublished: number;
  engagementRate: number;
}

// Backend returns flat list: one row per (date, provider)
export interface TimelinePoint {
  date: string;
  provider: string;
  value: number;
}

// Pivoted form used by the chart
export interface TimelineChartRow {
  date: string;
  youtube: number;
  linkedin: number;
  x: number;
}

export interface TopPost {
  postId: number;
  provider: string;
  providerPostId: string | null;
  content: string | null;
  publishedAt: string | null;
  snapshotType: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

export interface HeatmapCell {
  dayOfWeek: number; // 1=Mon … 7=Sun (ISO)
  hourOfDay: number; // 0–23
  avgEngagement: number;
  postCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dateRangeToDays(range: DateRange): number {
  return range === "7d" ? 7 : range === "30d" ? 30 : 90;
}

async function apiFetch<T>(
  getToken: GetToken,
  path: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const token = await getToken();
  const url = new URL(`${BACKEND}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.append(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Analytics API ${path}: ${res.status} - ${body}`);
  return JSON.parse(body) as T;
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function fetchAnalyticsOverviewApi(
  getToken: GetToken,
  dateRange: DateRange
): Promise<AnalyticsOverview> {
  return apiFetch<AnalyticsOverview>(getToken, "/analytics/overview", {
    days: dateRangeToDays(dateRange),
  });
}

export async function fetchPlatformStatsApi(
  getToken: GetToken,
  dateRange: DateRange
): Promise<PlatformStats[]> {
  return apiFetch<PlatformStats[]>(getToken, "/analytics/platforms", {
    days: dateRangeToDays(dateRange),
  });
}

export async function fetchTopPostsApi(
  getToken: GetToken,
  dateRange: DateRange,
  snapshotType: SnapshotType
): Promise<TopPost[]> {
  return apiFetch<TopPost[]>(getToken, "/analytics/posts", {
    days: dateRangeToDays(dateRange),
    snapshotType,
  });
}

export async function fetchEngagementTimelineApi(
  getToken: GetToken,
  dateRange: DateRange
): Promise<TimelineChartRow[]> {
  const raw = await apiFetch<TimelinePoint[]>(getToken, "/analytics/timeline", {
    days: dateRangeToDays(dateRange),
  });

  // Pivot flat list → { date, youtube, linkedin, x }
  const map = new Map<string, TimelineChartRow>();
  for (const point of raw) {
    if (!map.has(point.date)) {
      map.set(point.date, { date: point.date, youtube: 0, linkedin: 0, x: 0 });
    }
    const row = map.get(point.date)!;
    const p = point.provider.toLowerCase() as "youtube" | "linkedin" | "x";
    if (p === "youtube" || p === "linkedin" || p === "x") {
      row[p] = row[p] + point.value;
    }
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchBestTimesApi(
  getToken: GetToken
): Promise<HeatmapCell[]> {
  return apiFetch<HeatmapCell[]>(getToken, "/analytics/heatmap");
}

import { apiHeaders } from "@/lib/api-headers";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

type GetToken = () => Promise<string | null>;

export type DateRange = "7d" | "30d" | "90d";

export interface AnalyticsSelectOption {
  value: string;
  label: string;
}

export interface AnalyticsShellSummary {
  connectedAccountCount: number;
  campaignCount: number;
  publishedPostCount: number;
  trackedPostCount: number;
  milestoneSnapshotCount: number;
  accountDailySnapshotCount: number;
  pendingJobCount: number;
  lastAnalyticsAt: string | null;
  hasLiveData: boolean;
}

export interface AnalyticsFilterOptions {
  platforms: AnalyticsSelectOption[];
  accounts: AnalyticsSelectOption[];
  campaigns: AnalyticsSelectOption[];
  contentTypes: AnalyticsSelectOption[];
}

export interface AnalyticsProviderCoverage {
  provider: string;
  connectedAccountCount: number;
  postAnalyticsState: string;
  accountAnalyticsState: string;
  freshnessStatus: string;
  trackedPostCount: number;
  milestoneSnapshotCount: number;
  accountDailySnapshotCount: number;
  lastPostAnalyticsAt: string | null;
  lastAccountAnalyticsAt: string | null;
  lastSuccessfulJobAt: string | null;
  lastAttemptedJobAt: string | null;
  lastManualRefreshRequestedAt: string | null;
  metricAvailability: AnalyticsMetricAvailabilityWindow[];
  supportedPostMetrics: string[];
  supportedAccountMetrics: string[];
  collectionModes: string[];
  lastErrorSummary: string | null;
}

export interface AnalyticsShellResponse {
  summary: AnalyticsShellSummary;
  filters: AnalyticsFilterOptions;
  coverage: AnalyticsProviderCoverage[];
}

export interface AnalyticsManualRefreshProviderResult {
  provider: string;
  scheduledJobs: number;
  status: string;
  reason: string;
  nextAllowedAt: string | null;
}

export interface AnalyticsManualRefreshResponse {
  results: AnalyticsManualRefreshProviderResult[];
}

export interface AnalyticsOverviewMetric {
  key: string;
  label: string;
  format: "number" | "percent";
  currentValue: number;
  previousValue: number;
  deltaValue: number;
  deltaPercent: number | null;
}

export interface AnalyticsWorkspaceOverview {
  currentRangeLabel: string;
  previousRangeLabel: string;
  currentStartAt: string;
  currentEndAt: string;
  previousStartAt: string;
  previousEndAt: string;
  metrics: AnalyticsOverviewMetric[];
}

export interface AnalyticsPostRow {
  postId: number;
  provider: string;
  providerUserId: string;
  providerPostId: string | null;
  accountName: string | null;
  campaignId: number | null;
  campaignLabel: string | null;
  content: string | null;
  postType: string;
  mediaFormat: string;
  freshnessStatus: string;
  publishedAt: string | null;
  lastCollectedAt: string | null;
  hasLiveMetrics: boolean;
  metricAvailability: AnalyticsMetricAvailabilityWindow[];
  impressions: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  clicks: number | null;
  videoViews: number | null;
  watchTimeMinutes: number | null;
  engagements: number | null;
  engagementRate: number | null;
}

export interface AnalyticsMetricAvailabilityWindow {
  metrics: string[];
  label: string | null;
  status: string | null;
  source: string | null;
  windowStartsAt: string | null;
  windowEndsAt: string | null;
  eligiblePostCount: number | null;
  totalPostCount: number | null;
  note: string | null;
}

export interface AnalyticsPostTableResponse {
  sortBy: string;
  sortDirection: string;
  page: number;
  size: number;
  totalCount: number;
  hasNext: boolean;
  rows: AnalyticsPostRow[];
}

export interface AnalyticsPostRankingsResponse {
  metric: string;
  topPosts: AnalyticsPostRow[];
  worstPosts: AnalyticsPostRow[];
}

export interface AnalyticsLinkedInPageActivityRow {
  providerUserId: string;
  accountName: string | null;
  followers: number | null;
  followerDelta: number | null;
  pageViews: number | null;
  uniquePageViews: number | null;
  clicks: number | null;
  pageViewSharePercent: number | null;
  clickSharePercent: number | null;
  lastSnapshotDate: string | null;
}

export interface AnalyticsLinkedInPageActivityResponse {
  currentRangeLabel: string;
  currentStartDate: string;
  currentEndDate: string;
  trackedAccounts: number;
  totalPageViews: number;
  totalUniquePageViews: number;
  totalClicks: number;
  totalFollowerDelta: number;
  rows: AnalyticsLinkedInPageActivityRow[];
}

export interface AnalyticsYouTubeChannelActivityTrendPoint {
  snapshotDate: string;
  videoViews: number | null;
  watchTimeMinutes: number | null;
  subscriberDelta: number | null;
}

export interface AnalyticsYouTubeChannelActivityRow {
  providerUserId: string;
  accountName: string | null;
  followers: number | null;
  subscriberDelta: number | null;
  videoViews: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  watchTimeMinutes: number | null;
  viewSharePercent: number | null;
  watchTimeSharePercent: number | null;
  lastSnapshotDate: string | null;
}

export interface AnalyticsYouTubeChannelActivityResponse {
  currentRangeLabel: string;
  currentStartDate: string;
  currentEndDate: string;
  trackedAccounts: number;
  totalVideoViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalWatchTimeMinutes: number;
  totalSubscriberDelta: number;
  trend: AnalyticsYouTubeChannelActivityTrendPoint[];
  rows: AnalyticsYouTubeChannelActivityRow[];
}

export interface AnalyticsTikTokCreatorActivityTrendPoint {
  snapshotDate: string;
  followers: number | null;
  likesTotal: number | null;
  videoCount: number | null;
}

export interface AnalyticsTikTokCreatorActivityRow {
  providerUserId: string;
  accountName: string | null;
  followers: number | null;
  following: number | null;
  likesTotal: number | null;
  videoCount: number | null;
  followerDelta: number | null;
  likesDelta: number | null;
  videoDelta: number | null;
  followerSharePercent: number | null;
  likesSharePercent: number | null;
  lastSnapshotDate: string | null;
}

export interface AnalyticsTikTokCreatorActivityResponse {
  currentRangeLabel: string;
  currentStartDate: string;
  currentEndDate: string;
  trackedAccounts: number;
  totalFollowers: number;
  totalFollowing: number;
  totalLikesTotal: number;
  totalVideoCount: number;
  totalFollowerDelta: number;
  totalLikesDelta: number;
  totalVideoDelta: number;
  trend: AnalyticsTikTokCreatorActivityTrendPoint[];
  rows: AnalyticsTikTokCreatorActivityRow[];
}

export interface AnalyticsTrendExplorerPoint {
  bucketKey: string;
  bucketStartDate: string;
  bucketEndDate: string;
  performanceValue: number;
  postsPublished: number;
  averagePerformancePerPost: number | null;
}

export interface AnalyticsTrendExplorerResponse {
  currentRangeLabel: string;
  currentStartAt: string;
  currentEndAt: string;
  metric: string;
  metricLabel: string;
  metricFormat: "number" | "percent";
  totalPerformanceValue: number;
  totalPostsPublished: number;
  averagePerformancePerPost: number | null;
  daily: AnalyticsTrendExplorerPoint[];
  weekly: AnalyticsTrendExplorerPoint[];
}

export interface AnalyticsBreakdownRow {
  key: string;
  label: string;
  postsPublished: number;
  performanceValue: number;
  outputSharePercent: number | null;
  performanceSharePercent: number | null;
  shareGapPercent: number | null;
  averagePerformancePerPost: number | null;
}

export interface AnalyticsBreakdownResponse {
  currentRangeLabel: string;
  currentStartAt: string;
  currentEndAt: string;
  dimension: string;
  dimensionLabel: string;
  metric: string;
  metricLabel: string;
  metricFormat: "number" | "percent";
  totalPostsPublished: number;
  totalPerformanceValue: number;
  averagePerformancePerPost: number | null;
  rows: AnalyticsBreakdownRow[];
}

export interface AnalyticsShellParams {
  dateRange: DateRange;
  platform?: string | null;
  providerUserId?: string | null;
  campaignId?: string | null;
  contentType?: string | null;
}

function dateRangeToDays(range: DateRange): number {
  return range === "7d" ? 7 : range === "30d" ? 30 : 90;
}

async function request<T>(
  getToken: GetToken,
  path: string,
  init?: RequestInit,
  params?: Record<string, string | number | null | undefined>
): Promise<T> {
  const url = new URL(`${BACKEND}${path}`);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      ...(await apiHeaders(getToken)),
      ...(init?.headers ?? {}),
    },
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Analytics API ${path}: ${response.status} - ${body}`);
  }

  return JSON.parse(body) as T;
}

export async function fetchAnalyticsShellApi(
  getToken: GetToken,
  params: AnalyticsShellParams
): Promise<AnalyticsShellResponse> {
  return request<AnalyticsShellResponse>(getToken, "/analytics/shell", undefined, {
    days: dateRangeToDays(params.dateRange),
    platform: params.platform,
    providerUserId: params.providerUserId,
    campaignId: params.campaignId,
    contentType: params.contentType,
  });
}

export async function requestAnalyticsRefreshApi(
  getToken: GetToken,
  params: Pick<AnalyticsShellParams, "platform" | "providerUserId">
): Promise<AnalyticsManualRefreshResponse> {
  return request<AnalyticsManualRefreshResponse>(
    getToken,
    "/analytics/refresh",
    { method: "POST" },
    {
      platform: params.platform,
      providerUserId: params.providerUserId,
    }
  );
}

export async function fetchAnalyticsWorkspaceOverviewApi(
  getToken: GetToken,
  params: AnalyticsShellParams
): Promise<AnalyticsWorkspaceOverview> {
  return request<AnalyticsWorkspaceOverview>(
    getToken,
    "/analytics/workspace-overview",
    undefined,
    {
      days: dateRangeToDays(params.dateRange),
      platform: params.platform,
      providerUserId: params.providerUserId,
      campaignId: params.campaignId,
      contentType: params.contentType,
    }
  );
}

export async function fetchAnalyticsPostTableApi(
  getToken: GetToken,
  params: AnalyticsShellParams & {
    sortBy?: string;
    sortDirection?: string;
    page?: number;
    size?: number;
  }
): Promise<AnalyticsPostTableResponse> {
  return request<AnalyticsPostTableResponse>(getToken, "/analytics/post-table", undefined, {
    days: dateRangeToDays(params.dateRange),
    platform: params.platform,
    providerUserId: params.providerUserId,
    campaignId: params.campaignId,
    contentType: params.contentType,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
    page: params.page,
    size: params.size,
  });
}

export async function fetchAnalyticsPostRankingsApi(
  getToken: GetToken,
  params: AnalyticsShellParams & {
    metric?: string;
    limit?: number;
  }
): Promise<AnalyticsPostRankingsResponse> {
  return request<AnalyticsPostRankingsResponse>(
    getToken,
    "/analytics/post-rankings",
    undefined,
    {
      days: dateRangeToDays(params.dateRange),
      platform: params.platform,
      providerUserId: params.providerUserId,
      campaignId: params.campaignId,
      contentType: params.contentType,
      metric: params.metric,
      limit: params.limit,
    }
  );
}

export async function fetchAnalyticsLinkedInPageActivityApi(
  getToken: GetToken,
  params: Pick<AnalyticsShellParams, "dateRange" | "platform" | "providerUserId">
): Promise<AnalyticsLinkedInPageActivityResponse> {
  return request<AnalyticsLinkedInPageActivityResponse>(
    getToken,
    "/analytics/linkedin-page-activity",
    undefined,
    {
      days: dateRangeToDays(params.dateRange),
      platform: params.platform,
      providerUserId: params.providerUserId,
    }
  );
}

export async function fetchAnalyticsYouTubeChannelActivityApi(
  getToken: GetToken,
  params: Pick<AnalyticsShellParams, "dateRange" | "platform" | "providerUserId">
): Promise<AnalyticsYouTubeChannelActivityResponse> {
  return request<AnalyticsYouTubeChannelActivityResponse>(
    getToken,
    "/analytics/youtube-channel-activity",
    undefined,
    {
      days: dateRangeToDays(params.dateRange),
      platform: params.platform,
      providerUserId: params.providerUserId,
    }
  );
}

export async function fetchAnalyticsTikTokCreatorActivityApi(
  getToken: GetToken,
  params: Pick<AnalyticsShellParams, "dateRange" | "platform" | "providerUserId">
): Promise<AnalyticsTikTokCreatorActivityResponse> {
  return request<AnalyticsTikTokCreatorActivityResponse>(
    getToken,
    "/analytics/tiktok-creator-activity",
    undefined,
    {
      days: dateRangeToDays(params.dateRange),
      platform: params.platform,
      providerUserId: params.providerUserId,
    }
  );
}

export async function fetchAnalyticsTrendExplorerApi(
  getToken: GetToken,
  params: AnalyticsShellParams & {
    metric?: string;
  }
): Promise<AnalyticsTrendExplorerResponse> {
  return request<AnalyticsTrendExplorerResponse>(getToken, "/analytics/trend-explorer", undefined, {
    days: dateRangeToDays(params.dateRange),
    platform: params.platform,
    providerUserId: params.providerUserId,
    campaignId: params.campaignId,
    contentType: params.contentType,
    metric: params.metric,
  });
}

export async function fetchAnalyticsBreakdownEngineApi(
  getToken: GetToken,
  params: AnalyticsShellParams & {
    dimension?: string;
    metric?: string;
  }
): Promise<AnalyticsBreakdownResponse> {
  return request<AnalyticsBreakdownResponse>(
    getToken,
    "/analytics/breakdown-engine",
    undefined,
    {
      days: dateRangeToDays(params.dateRange),
      platform: params.platform,
      providerUserId: params.providerUserId,
      campaignId: params.campaignId,
      contentType: params.contentType,
      dimension: params.dimension,
      metric: params.metric,
    }
  );
}

export type ClientReportTemplate =
  | "EXECUTIVE_SUMMARY"
  | "ENGAGEMENT_SPOTLIGHT"
  | "GROWTH_SNAPSHOT";

export type ClientReportCadence = "WEEKLY" | "MONTHLY";
export type ClientReportScope = "WORKSPACE" | "CAMPAIGN";

export interface ClientReportLink {
  id: string;
  token: string;
  reportTitle: string;
  clientLabel: string | null;
  agencyLabel: string | null;
  reportScope: ClientReportScope;
  campaignId: number | null;
  campaignLabel: string | null;
  templateType: ClientReportTemplate;
  reportDays: number;
  recipientName: string | null;
  recipientEmail: string | null;
  expiresAt: string;
  revokedAt: string | null;
  lastAccessedAt: string | null;
  createdAt: string;
  active: boolean;
}

export interface ClientReportSchedule {
  id: number;
  reportTitle: string;
  recipientName: string | null;
  recipientEmail: string;
  clientLabel: string | null;
  agencyLabel: string | null;
  reportScope: ClientReportScope;
  campaignId: number | null;
  campaignLabel: string | null;
  templateType: ClientReportTemplate;
  reportDays: number;
  cadence: ClientReportCadence;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  hourOfDayUtc: number;
  shareExpiryHours: number;
  active: boolean;
  lastSentAt: string | null;
  nextSendAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientReportLinkRequest {
  reportTitle?: string;
  clientLabel?: string;
  agencyLabel?: string;
  reportScope?: ClientReportScope;
  campaignId?: number;
  templateType?: ClientReportTemplate;
  reportDays?: number;
  commentary?: string;
  expiresAt?: string;
  recipientName?: string;
  recipientEmail?: string;
}

export interface CreateClientReportScheduleRequest {
  reportTitle?: string;
  recipientName?: string;
  recipientEmail: string;
  clientLabel?: string;
  agencyLabel?: string;
  reportScope?: ClientReportScope;
  campaignId?: number;
  templateType?: ClientReportTemplate;
  reportDays?: number;
  commentary?: string;
  cadence?: ClientReportCadence;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hourOfDayUtc?: number;
  shareExpiryHours?: number;
}

export interface ClientReportSnapshotRequest {
  reportTitle?: string;
  clientLabel?: string;
  agencyLabel?: string;
  reportScope?: ClientReportScope;
  campaignId?: number;
  templateType?: ClientReportTemplate;
  reportDays?: number;
  commentary?: string;
  expiresAt?: string;
}

export interface ClientReportSummary {
  currentRangeLabel: string;
  currentStartAt: string;
  currentEndAt: string;
  impressions: number;
  engagements: number;
  engagementRate: number;
  clicks: number;
  videoViews: number;
  postsPublished: number;
}

export interface ClientReportPlatformPerformance {
  provider: string;
  platformLabel: string;
  postsPublished: number;
  engagements: number;
  impressions: number;
  averageEngagementsPerPost: number | null;
  outputSharePercent: number | null;
  engagementSharePercent: number | null;
  impressionSharePercent: number | null;
}

export interface ClientReportTopPost {
  postId: number;
  provider: string;
  platformLabel: string;
  accountName: string | null;
  campaignId: number | null;
  campaignLabel: string | null;
  content: string | null;
  postType: string;
  mediaFormat: string;
  publishedAt: string | null;
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

export interface ClientReportTrendPoint {
  bucketKey: string;
  bucketStartDate: string;
  bucketEndDate: string;
  engagements: number;
  postsPublished: number;
  averageEngagementsPerPost: number | null;
}

export interface ClientReportForecastRange {
  lowValue: number | null;
  expectedValue: number | null;
  highValue: number | null;
}

export interface ClientReportForecastItem {
  available: boolean;
  label: string;
  confidenceTier: string | null;
  slotLabel: string | null;
  forecastDays: number | null;
  plannedPosts: number | null;
  comparablePosts: number;
  liftPercent: number | null;
  range: ClientReportForecastRange | null;
  basisSummary: string | null;
  unavailableReason: string | null;
}

export interface ClientReportForecastSummary {
  metric: string;
  metricLabel: string;
  metricFormat: "number" | "percent";
  planningWindowLabel: string;
  basisNote: string;
  nextPostPrediction: ClientReportForecastItem;
  nextBestSlot: ClientReportForecastItem;
  planningWindowProjection: ClientReportForecastItem;
}

export interface ClientReportContributionRow {
  key: string;
  label: string;
  postsPublished: number;
  performanceValue: number;
  outputSharePercent: number | null;
  performanceSharePercent: number | null;
  shareGapPercent: number | null;
  averagePerformancePerPost: number | null;
}

export interface ClientReportContribution {
  dimension: string;
  dimensionLabel: string;
  rows: ClientReportContributionRow[];
}

export interface ClientReportCampaignInsight {
  campaignId: number;
  campaignLabel: string | null;
  postsPublished: number;
  engagements: number;
  averageEngagementsPerPost: number | null;
  benchmarkAverage: number | null;
  liftPercent: number | null;
  percentile: number | null;
  rank: number | null;
  comparableCount: number;
  trend: ClientReportTrendPoint[];
  platformBreakdown: ClientReportContribution | null;
  accountBreakdown: ClientReportContribution | null;
}

export interface PublicClientReport {
  reportTitle: string;
  clientLabel: string;
  agencyLabel: string;
  workspaceName: string;
  companyName: string;
  logoUrl: string | null;
  templateType: ClientReportTemplate;
  reportDays: number;
  reportWindowLabel: string;
  reportScope: ClientReportScope;
  reportScopeLabel: string;
  campaignId: number | null;
  campaignLabel: string | null;
  commentary: string;
  highlights: string[];
  generatedAt: string;
  linkExpiresAt: string | null;
  summary: ClientReportSummary;
  platformPerformance: ClientReportPlatformPerformance[];
  topPosts: ClientReportTopPost[];
  trend: ClientReportTrendPoint[];
  forecast: ClientReportForecastSummary | null;
  campaignInsight: ClientReportCampaignInsight | null;
}

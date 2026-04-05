export type ClientReportTemplate =
  | "EXECUTIVE_SUMMARY"
  | "ENGAGEMENT_SPOTLIGHT"
  | "GROWTH_SNAPSHOT";

export type ClientReportCadence = "WEEKLY" | "MONTHLY";

export interface ClientReportLink {
  id: string;
  token: string;
  reportTitle: string;
  clientLabel: string | null;
  agencyLabel: string | null;
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
  templateType?: ClientReportTemplate;
  reportDays?: number;
  commentary?: string;
  cadence?: ClientReportCadence;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hourOfDayUtc?: number;
  shareExpiryHours?: number;
}

export interface AnalyticsOverviewSnapshot {
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

export interface PlatformStatsSnapshot {
  provider: string;
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

export interface TopPostSnapshot {
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

export interface TimelinePointSnapshot {
  date: string;
  provider: string;
  totalEngagements: number;
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
  commentary: string;
  highlights: string[];
  generatedAt: string;
  linkExpiresAt: string;
  overview: AnalyticsOverviewSnapshot;
  platformStats: PlatformStatsSnapshot[];
  topPosts: TopPostSnapshot[];
  timeline: TimelinePointSnapshot[];
}

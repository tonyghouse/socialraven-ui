import { ConnectedAccount } from "./ConnectedAccount";
import { MediaResponse } from "./MediaResponse";

export interface PostAnalyticsSummary {
  freshnessStatus: string | null;
  lastCollectedAt: string | null;
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

export interface PostResponse {
  id: number;
  postCollectionId: number;
  description: string;
  provider: string;
  postStatus: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED"
  scheduledTime: string | null;
  media: MediaResponse[];
  connectedAccount: ConnectedAccount;
  analytics: PostAnalyticsSummary | null;
}

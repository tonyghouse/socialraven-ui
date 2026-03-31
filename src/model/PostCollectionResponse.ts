import { PostResponse } from "./PostResponse";
import { MediaResponse } from "./MediaResponse";

export interface PostCollectionResponse {
  id: number;
  description: string;
  scheduledTime: string | null;
  postCollectionType: "IMAGE" | "VIDEO" | "TEXT";
  overallStatus: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "PARTIAL_SUCCESS" | "FAILED";
  posts: PostResponse[];
  media: MediaResponse[];
  platformConfigs?: Record<string, any>;
  failureState?: "NONE" | "RECOVERY_REQUIRED" | "RECOVERED" | "ESCALATED_TO_ADMIN";
  failureReasonSummary?: string | null;
  recoveryNotificationAttemptCount?: number;
  recoveryCollectionId?: number | null;
  recoverySourceCollectionId?: number | null;
  recoveryRequired?: boolean;
  recoveryHandled?: boolean;
  publishedChannelCount?: number;
  failedChannelCount?: number;
}

export interface PostCollectionResponsePage {
  content: PostCollectionResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

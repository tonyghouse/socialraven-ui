import type { MediaResponse } from "./MediaResponse";
import type { PostCollaborationThread } from "./PostCollaboration";

export type ReviewLinkShareScope = "CAMPAIGN" | "SELECTED_POSTS";

export interface PostCollectionReviewLink {
  id: string;
  token: string;
  createdByUserId: string;
  createdByDisplayName: string;
  shareScope: ReviewLinkShareScope;
  sharedPostIds: number[];
  passcodeProtected: boolean;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  active: boolean;
}

export interface CreatePostCollectionReviewLinkRequest {
  expiresAt?: string;
  passcode?: string;
  shareScope?: ReviewLinkShareScope;
  sharedPostIds?: number[];
}

export interface PublicReviewChannel {
  platform: string | null;
  username: string | null;
  profilePicLink: string | null;
}

export interface PublicPostCollectionReviewResponse {
  collectionId: number;
  description: string;
  scheduledTime: string | null;
  postCollectionType: "IMAGE" | "VIDEO" | "TEXT" | null;
  overallStatus:
    | "DRAFT"
    | "IN_REVIEW"
    | "CHANGES_REQUESTED"
    | "APPROVED"
    | "SCHEDULED"
    | "PUBLISHED"
    | "PARTIAL_SUCCESS"
    | "FAILED";
  reviewStatus: "DRAFT" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";
  nextApprovalStage: "APPROVER" | "OWNER_FINAL" | null;
  shareScope: ReviewLinkShareScope;
  channels: PublicReviewChannel[];
  media: MediaResponse[];
  platformConfigs?: Record<string, any> | null;
  collaborationThreads: PostCollaborationThread[];
  linkExpiresAt: string;
  linkExpired: boolean;
  linkRevoked: boolean;
  canComment: boolean;
  canApprove: boolean;
  canReject: boolean;
}

export interface PublicReviewCommentRequest {
  reviewerName: string;
  reviewerEmail: string;
  body: string;
  anchorStart?: number;
  anchorEnd?: number;
  anchorText?: string;
  mediaId?: number;
  mediaMarkerX?: number;
  mediaMarkerY?: number;
}

export interface PublicReviewDecisionRequest {
  reviewerName: string;
  reviewerEmail: string;
  note?: string;
}

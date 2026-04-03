import type { MediaResponse } from "./MediaResponse";
import type { PostCollaborationThread } from "./PostCollaboration";

export interface PostCollectionReviewLink {
  id: string;
  token: string;
  createdByUserId: string;
  createdByDisplayName: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  active: boolean;
}

export interface CreatePostCollectionReviewLinkRequest {
  expiresAt?: string;
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
    | "SCHEDULED"
    | "PUBLISHED"
    | "PARTIAL_SUCCESS"
    | "FAILED";
  reviewStatus: "DRAFT" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";
  nextApprovalStage: "APPROVER" | "OWNER_FINAL" | null;
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
}

export interface PublicReviewDecisionRequest {
  reviewerName: string;
  reviewerEmail: string;
  note?: string;
}

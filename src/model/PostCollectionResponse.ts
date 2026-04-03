import { PostResponse } from "./PostResponse";
import { MediaResponse } from "./MediaResponse";

export interface PostCollectionReviewHistoryResponse {
  id: number;
  action:
    | "SUBMITTED"
    | "RESUBMITTED"
    | "STEP_APPROVED"
    | "APPROVED"
    | "CHANGES_REQUESTED"
    | "REAPPROVAL_REQUIRED"
    | "REMINDER_SENT"
    | "ESCALATED";
  fromStatus: "DRAFT" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";
  toStatus: "DRAFT" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";
  actorType: "WORKSPACE_USER" | "CLIENT_REVIEWER" | "SYSTEM";
  actorUserId: string | null;
  actorDisplayName: string;
  note: string | null;
  createdAt: string;
}

export interface PostCollectionVersionResponse {
  id: number;
  versionNumber: number;
  versionEvent:
    | "CREATED"
    | "UPDATED"
    | "SUBMITTED"
    | "RESUBMITTED"
    | "STEP_APPROVED"
    | "APPROVED"
    | "CHANGES_REQUESTED"
    | "REAPPROVAL_REQUIRED"
    | "SCHEDULED_DIRECT"
    | "RECOVERY_CREATED";
  actorType: "WORKSPACE_USER" | "CLIENT_REVIEWER" | "SYSTEM";
  actorUserId: string | null;
  actorDisplayName: string;
  createdAt: string;
  reviewStatus: "DRAFT" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";
  draft: boolean;
  scheduledTime: string | null;
}

export interface PostCollectionApprovalDiffItemResponse {
  field: "description" | "scheduledTime" | "accounts" | "media" | "platformConfigs" | string;
  label: string;
  valueType: "text" | "datetime" | "list" | "json" | string;
  beforeValue: string;
  afterValue: string;
}

export interface PostCollectionApprovalDiffResponse {
  approvedVersionId: number;
  approvedVersionNumber: number;
  currentVersionId: number;
  currentVersionNumber: number;
  hasChanges: boolean;
  changes: PostCollectionApprovalDiffItemResponse[];
}

export interface PostCollectionResponse {
  id: number;
  description: string;
  scheduledTime: string | null;
  postCollectionType: "IMAGE" | "VIDEO" | "TEXT";
  overallStatus:
    | "DRAFT"
    | "IN_REVIEW"
    | "CHANGES_REQUESTED"
    | "SCHEDULED"
    | "PUBLISHED"
    | "PARTIAL_SUCCESS"
    | "FAILED";
  reviewStatus: "DRAFT" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";
  reviewSubmittedAt: string | null;
  approvedAt: string | null;
  approvalLocked: boolean;
  approvalLockedAt: string | null;
  requiredApprovalSteps: number;
  completedApprovalSteps: number;
  nextApprovalStage: "APPROVER" | "OWNER_FINAL" | null;
  posts: PostResponse[];
  media: MediaResponse[];
  reviewHistory?: PostCollectionReviewHistoryResponse[] | null;
  approvalReminderAttemptCount?: number;
  lastApprovalReminderSentAt?: string | null;
  nextApprovalReminderAt?: string | null;
  approvalEscalatedAt?: string | null;
  versionHistory?: PostCollectionVersionResponse[] | null;
  approvedDiff?: PostCollectionApprovalDiffResponse | null;
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

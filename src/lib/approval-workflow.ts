import {
  WorkspaceApprovalMode,
  WorkspaceApprovalRule,
  WorkspaceResponse,
} from "@/model/Workspace";
import { PostType } from "@/model/PostType";

export const APPROVAL_MODE_METADATA: Record<
  WorkspaceApprovalMode,
  { label: string; description: string }
> = {
  NONE: {
    label: "No approval required",
    description: "Any publisher can schedule directly without review.",
  },
  OPTIONAL: {
    label: "Optional approval",
    description: "Publishers can schedule directly while other teammates submit into review.",
  },
  REQUIRED: {
    label: "Required approval",
    description: "Every scheduled item enters a single-step approval queue before publishing.",
  },
  MULTI_STEP: {
    label: "Multi-step approval",
    description: "Every scheduled item requires an approver review followed by final owner sign-off.",
  },
};

const APPROVAL_MODE_RANK: Record<WorkspaceApprovalMode, number> = {
  NONE: 0,
  OPTIONAL: 1,
  REQUIRED: 2,
  MULTI_STEP: 3,
};

export function approvalModeLabel(mode: WorkspaceApprovalMode) {
  return APPROVAL_MODE_METADATA[mode].label;
}

export function approvalModeDescription(mode: WorkspaceApprovalMode) {
  return APPROVAL_MODE_METADATA[mode].description;
}

export function canDirectScheduleForMode(
  approvalMode: WorkspaceApprovalMode,
  canPublishPosts: boolean
) {
  return approvalMode === "NONE" || (approvalMode === "OPTIONAL" && canPublishPosts);
}

export function resolveEffectiveApprovalMode(input: {
  workspaceMode?: WorkspaceApprovalMode | null;
  approvalRules?: WorkspaceApprovalRule[] | null;
  approvalModeOverride?: WorkspaceApprovalMode | null;
  providerUserIds?: string[];
  postType?: PostType | null;
}) {
  const workspaceMode = input.workspaceMode ?? "OPTIONAL";
  if (input.approvalModeOverride) {
    return input.approvalModeOverride;
  }

  const approvalRules = input.approvalRules ?? [];
  const providerUserIds = input.providerUserIds ?? [];
  const postType = input.postType ?? null;

  const accountModes = providerUserIds
    .map((providerUserId) =>
      approvalRules.find(
        (rule) =>
          rule.scopeType === "ACCOUNT" && rule.scopeValue === providerUserId
      )?.approvalMode
    )
    .filter((mode): mode is WorkspaceApprovalMode => !!mode);

  if (accountModes.length > 0) {
    return accountModes.reduce((strictest, current) =>
      APPROVAL_MODE_RANK[current] > APPROVAL_MODE_RANK[strictest] ? current : strictest
    );
  }

  if (postType) {
    const contentTypeMode = approvalRules.find(
      (rule) =>
        rule.scopeType === "CONTENT_TYPE" && rule.scopeValue === postType
    )?.approvalMode;
    if (contentTypeMode) {
      return contentTypeMode;
    }
  }

  return workspaceMode;
}

export function resolveWorkspaceApprovalMode(
  workspace: WorkspaceResponse | null | undefined,
  input: {
    approvalModeOverride?: WorkspaceApprovalMode | null;
    providerUserIds?: string[];
    postType?: PostType | null;
  }
) {
  return resolveEffectiveApprovalMode({
    workspaceMode: workspace?.approvalMode,
    approvalRules: workspace?.approvalRules,
    approvalModeOverride: input.approvalModeOverride,
    providerUserIds: input.providerUserIds,
    postType: input.postType,
  });
}

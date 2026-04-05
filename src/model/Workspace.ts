export type WorkspaceRole = "OWNER" | "ADMIN" | "EDITOR" | "READ_ONLY";
export type WorkspaceApprovalMode = "NONE" | "OPTIONAL" | "REQUIRED" | "MULTI_STEP";
export type WorkspaceApprovalRuleScope = "ACCOUNT" | "CONTENT_TYPE";
export type WorkspaceCapability =
  | "APPROVE_POSTS"
  | "PUBLISH_POSTS"
  | "REQUEST_CHANGES"
  | "MANAGE_APPROVAL_RULES"
  | "SHARE_REVIEW_LINKS"
  | "MANAGE_ASSET_LIBRARY"
  | "EXPORT_CLIENT_REPORTS";

export interface WorkspaceApprovalRule {
  id: number;
  scopeType: WorkspaceApprovalRuleScope;
  scopeValue: string;
  approvalMode: WorkspaceApprovalMode;
}

export interface WorkspaceResponse {
  id: string;
  companyId: string;
  name: string;
  companyName: string | null;
  companyLogoS3Key: string | null;
  logoS3Key: string | null;
  role: WorkspaceRole;
  approvalMode: WorkspaceApprovalMode;
  autoScheduleAfterApproval: boolean;
  ownerFinalApprovalRequired: boolean;
  approverUserIds: string[];
  publisherUserIds: string[];
  approvalRules: WorkspaceApprovalRule[];
  capabilities: WorkspaceCapability[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateWorkspaceRequest {
  name: string;
  companyId?: string;
  companyName?: string;
  logoS3Key?: string;
}

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

export interface WorkspaceInvitation {
  token: string;
  workspaceId: string;
  invitedEmail: string;
  role: WorkspaceRole;
  invitedBy: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface InviteRequest {
  email: string;
  role: WorkspaceRole;
  workspaceIds: string[];
}

export interface AcceptInviteRequest {
  token: string;
}

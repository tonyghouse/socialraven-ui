export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface WorkspaceResponse {
  id: string;
  name: string;
  companyName: string | null;
  ownerUserId: string;
  logoS3Key: string | null;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateWorkspaceRequest {
  name: string;
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

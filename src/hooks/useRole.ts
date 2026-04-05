import { useWorkspace } from "@/context/WorkspaceContext";
import {
  WorkspaceCapability,
  WorkspaceResponse,
  WorkspaceRole,
} from "@/model/Workspace";

function defaultCapabilitiesForRole(role: WorkspaceRole): WorkspaceCapability[] {
  switch (role) {
    case "OWNER":
    case "ADMIN":
      return [
        "APPROVE_POSTS",
        "PUBLISH_POSTS",
        "REQUEST_CHANGES",
        "MANAGE_APPROVAL_RULES",
        "SHARE_REVIEW_LINKS",
        "MANAGE_ASSET_LIBRARY",
        "EXPORT_CLIENT_REPORTS",
      ];
    case "EDITOR":
      return ["REQUEST_CHANGES"];
    case "READ_ONLY":
    default:
      return [];
  }
}

function capabilitiesForWorkspace(
  workspace: WorkspaceResponse | null | undefined
): Set<WorkspaceCapability> {
  const role: WorkspaceRole = workspace?.role ?? "READ_ONLY";
  return new Set<WorkspaceCapability>(
    workspace?.capabilities?.length
      ? workspace.capabilities
      : defaultCapabilitiesForRole(role)
  );
}

/**
 * Derives role-based permission flags from the active workspace.
 * Defaults to the most restrictive role (READ_ONLY) when no workspace is loaded.
 *
 * Role hierarchy: OWNER > ADMIN > EDITOR > READ_ONLY
 *
 * - canWrite:            EDITOR, ADMIN, OWNER — can create/edit/delete posts, connect accounts
 * - canManageWorkspace:  ADMIN, OWNER         — can access workspace settings, manage members, send invites
 * - isOwner:             OWNER only            — billing tab, danger zone
 */
export function useRole() {
  const { activeWorkspace, workspaces } = useWorkspace();
  const role: WorkspaceRole = activeWorkspace?.role ?? "READ_ONLY";
  const capabilities = capabilitiesForWorkspace(activeWorkspace);
  const canSeeAgencyOps = workspaces.some((workspace) => {
    const workspaceCapabilities = capabilitiesForWorkspace(workspace);
    return (
      workspaceCapabilities.has("APPROVE_POSTS") ||
      workspaceCapabilities.has("REQUEST_CHANGES")
    );
  });

  return {
    role,
    capabilities: Array.from(capabilities),
    isViewer: role === "READ_ONLY",
    canWrite: role !== "READ_ONLY",
    canManageWorkspace: role === "OWNER" || role === "ADMIN",
    canApprovePosts: capabilities.has("APPROVE_POSTS"),
    canPublishPosts: capabilities.has("PUBLISH_POSTS"),
    canRequestChanges: capabilities.has("REQUEST_CHANGES"),
    canManageApprovalRules: capabilities.has("MANAGE_APPROVAL_RULES"),
    canShareReviewLinks: capabilities.has("SHARE_REVIEW_LINKS"),
    canManageAssetLibrary: capabilities.has("MANAGE_ASSET_LIBRARY"),
    canExportClientReports: capabilities.has("EXPORT_CLIENT_REPORTS"),
    canSeeAgencyOps,
    canSeeApprovalQueue:
      capabilities.has("APPROVE_POSTS") || capabilities.has("REQUEST_CHANGES"),
    isOwner: role === "OWNER",
  };
}

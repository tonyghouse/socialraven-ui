import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceCapability, WorkspaceRole } from "@/model/Workspace";

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
      ];
    case "EDITOR":
      return ["REQUEST_CHANGES"];
    case "READ_ONLY":
    default:
      return [];
  }
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
  const { activeWorkspace } = useWorkspace();
  const role: WorkspaceRole = activeWorkspace?.role ?? "READ_ONLY";
  const capabilities = new Set<WorkspaceCapability>(
    activeWorkspace?.capabilities?.length
      ? activeWorkspace.capabilities
      : defaultCapabilitiesForRole(role)
  );

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
    canSeeApprovalQueue:
      capabilities.has("APPROVE_POSTS") || capabilities.has("REQUEST_CHANGES"),
    isOwner: role === "OWNER",
  };
}

import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceRole } from "@/model/Workspace";

/**
 * Derives role-based permission flags from the active workspace.
 * Defaults to the most restrictive role (VIEWER) when no workspace is loaded.
 *
 * Role hierarchy: OWNER > ADMIN > MEMBER > VIEWER
 *
 * - canWrite:            MEMBER, ADMIN, OWNER — can create/edit/delete posts, connect accounts
 * - canManageWorkspace:  ADMIN, OWNER         — can access workspace settings, manage members, send invites
 * - isOwner:             OWNER only            — billing tab, danger zone
 */
export function useRole() {
  const { activeWorkspace } = useWorkspace();
  const role: WorkspaceRole = activeWorkspace?.role ?? "VIEWER";

  return {
    role,
    isViewer:             role === "VIEWER",
    canWrite:             role !== "VIEWER",
    canManageWorkspace:   role === "OWNER" || role === "ADMIN",
    isOwner:              role === "OWNER",
  };
}

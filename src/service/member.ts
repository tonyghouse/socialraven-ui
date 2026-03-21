import { WorkspaceMember, WorkspaceRole } from "@/model/Workspace";
import { apiHeaders } from "@/lib/api-headers";

type GetToken = () => Promise<string | null>;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

/** GET /workspaces/{id}/members — list members of a workspace */
export async function getMembersApi(
  getToken: GetToken,
  workspaceId: string
): Promise<WorkspaceMember[]> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/workspaces/${workspaceId}/members`, {
    headers,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`getMembers failed: ${res.status} - ${body}`);
  }
  return res.json();
}

/** PATCH /workspaces/{id}/members/{userId} — change a member's role (OWNER only) */
export async function updateMemberRoleApi(
  getToken: GetToken,
  workspaceId: string,
  userId: string,
  role: WorkspaceRole
): Promise<WorkspaceMember> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(
    `${BACKEND}/workspaces/${workspaceId}/members/${userId}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ role }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`updateMemberRole failed: ${res.status} - ${body}`);
  }
  return res.json();
}

/** DELETE /workspaces/{id}/members/{userId} — remove a member */
export async function removeMemberApi(
  getToken: GetToken,
  workspaceId: string,
  userId: string
): Promise<void> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(
    `${BACKEND}/workspaces/${workspaceId}/members/${userId}`,
    {
      method: "DELETE",
      headers,
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`removeMember failed: ${res.status} - ${body}`);
  }
}

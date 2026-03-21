import {
  AcceptInviteRequest,
  InviteRequest,
  WorkspaceInvitation,
} from "@/model/Workspace";
import { apiHeaders, workspaceIdHeader } from "@/lib/api-headers";

type GetToken = () => Promise<string | null>;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

/** POST /workspaces/invite — send invitation (multi-workspace, Option A) */
export async function sendInviteApi(
  getToken: GetToken,
  req: InviteRequest
): Promise<WorkspaceInvitation[]> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/workspaces/invite`, {
    method: "POST",
    headers,
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`sendInvite failed: ${res.status} - ${body}`);
  }
  return res.json();
}

/** GET /workspaces/{id}/invitations — list pending invitations for a workspace */
export async function getInvitationsApi(
  getToken: GetToken,
  workspaceId: string
): Promise<WorkspaceInvitation[]> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/workspaces/${workspaceId}/invitations`, {
    headers,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`getInvitations failed: ${res.status} - ${body}`);
  }
  return res.json();
}

/** DELETE /workspaces/invitations/{token} — revoke an invitation */
export async function revokeInvitationApi(
  getToken: GetToken,
  token: string
): Promise<void> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/workspaces/invitations/${token}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`revokeInvitation failed: ${res.status} - ${body}`);
  }
}

/** POST /workspaces/invitations/accept — accept an invitation by token */
export async function acceptInvitationApi(
  getToken: GetToken,
  req: AcceptInviteRequest
): Promise<{ workspaceId: string }> {
  const token = await getToken();
  const res = await fetch(`${BACKEND}/workspaces/invitations/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`acceptInvitation failed: ${res.status} - ${body}`);
  }
  return res.json();
}

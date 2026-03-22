import { CreateWorkspaceRequest, WorkspaceResponse } from "@/model/Workspace";
import { apiHeaders } from "@/lib/api-headers";

type GetToken = () => Promise<string | null>;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getMyWorkspacesApi(
  getToken: GetToken
): Promise<WorkspaceResponse[]> {
  const token = await getToken();
  const res = await fetch(`${BACKEND}/workspaces/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`getMyWorkspaces failed: ${res.status}`);
  return res.json();
}

export async function createWorkspaceApi(
  getToken: GetToken,
  req: CreateWorkspaceRequest
): Promise<WorkspaceResponse> {
  const token = await getToken();
  const res = await fetch(`${BACKEND}/workspaces`, {
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
    throw new Error(`createWorkspace failed: ${res.status} - ${body}`);
  }
  return res.json();
}

export async function updateWorkspaceApi(
  getToken: GetToken,
  workspaceId: string,
  req: { name?: string; companyName?: string }
): Promise<WorkspaceResponse> {
  const headers = await apiHeaders(getToken, { "X-Workspace-Id": workspaceId });
  const res = await fetch(`${BACKEND}/workspaces/${workspaceId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`updateWorkspace failed: ${res.status} - ${body}`);
  }
  return res.json();
}

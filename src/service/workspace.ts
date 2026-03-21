import { CreateWorkspaceRequest, WorkspaceResponse } from "@/model/Workspace";

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

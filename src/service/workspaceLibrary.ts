import { workspaceIdHeader } from "@/lib/api-headers";
import type {
  UpsertWorkspaceLibraryBundleRequest,
  UpsertWorkspaceLibraryItemRequest,
  WorkspaceLibraryBundle,
  WorkspaceLibraryItem,
  WorkspaceLibraryResponse,
} from "@/model/WorkspaceLibrary";

async function readError(res: Response): Promise<never> {
  const body = await res.text();
  throw new Error(`Backend error: ${res.status} - ${body}`);
}

export async function getWorkspaceLibraryApi(
  getToken: () => Promise<string | null>,
  approvedOnly = false
): Promise<WorkspaceLibraryResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  }

  const token = await getToken();
  const res = await fetch(
    `${backendUrl}/workspace-library?approvedOnly=${approvedOnly ? "true" : "false"}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...workspaceIdHeader(),
      },
    }
  );

  if (!res.ok) {
    return readError(res);
  }

  return res.json() as Promise<WorkspaceLibraryResponse>;
}

export async function createWorkspaceLibraryItemApi(
  getToken: () => Promise<string | null>,
  payload: UpsertWorkspaceLibraryItemRequest
): Promise<WorkspaceLibraryItem> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/workspace-library/items`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return readError(res);
  }

  return res.json() as Promise<WorkspaceLibraryItem>;
}

export async function updateWorkspaceLibraryItemApi(
  getToken: () => Promise<string | null>,
  itemId: number,
  payload: UpsertWorkspaceLibraryItemRequest
): Promise<WorkspaceLibraryItem> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/workspace-library/items/${itemId}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return readError(res);
  }

  return res.json() as Promise<WorkspaceLibraryItem>;
}

export async function deleteWorkspaceLibraryItemApi(
  getToken: () => Promise<string | null>,
  itemId: number
): Promise<void> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/workspace-library/items/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
  });

  if (!res.ok) {
    return readError(res);
  }
}

export async function createWorkspaceLibraryBundleApi(
  getToken: () => Promise<string | null>,
  payload: UpsertWorkspaceLibraryBundleRequest
): Promise<WorkspaceLibraryBundle> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/workspace-library/bundles`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return readError(res);
  }

  return res.json() as Promise<WorkspaceLibraryBundle>;
}

export async function updateWorkspaceLibraryBundleApi(
  getToken: () => Promise<string | null>,
  bundleId: number,
  payload: UpsertWorkspaceLibraryBundleRequest
): Promise<WorkspaceLibraryBundle> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/workspace-library/bundles/${bundleId}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return readError(res);
  }

  return res.json() as Promise<WorkspaceLibraryBundle>;
}

export async function deleteWorkspaceLibraryBundleApi(
  getToken: () => Promise<string | null>,
  bundleId: number
): Promise<void> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/workspace-library/bundles/${bundleId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
  });

  if (!res.ok) {
    return readError(res);
  }
}

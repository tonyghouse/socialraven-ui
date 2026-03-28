import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import { workspaceIdHeader } from "@/lib/api-headers";

export interface PostMediaPayload {
  fileName: string;
  mimeType: string;
  fileUrl: string;
  fileKey: string;
  size: number;
}

export interface UpdatePostCollectionPayload {
  description?: string;
  scheduledTime?: string; // ISO 8601 UTC string
  platformConfigs?: Record<string, any>;
  /** Newly uploaded S3 media files to add */
  newMedia?: PostMediaPayload[];
  /** Keys of existing media files to retain (omitted keys get removed) */
  keepMediaKeys?: string[];
  /** Updated list of connected accounts (replaces current account list) */
  connectedAccounts?: ConnectedAccount[];
}

export async function updatePostCollectionApi(
  getToken: () => Promise<string | null>,
  collectionId: string | number,
  payload: UpdatePostCollectionPayload
): Promise<PostCollectionResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  }

  const token = await getToken();

  const res = await fetch(`${backendUrl}/post-collections/${collectionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...workspaceIdHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  return res.json() as Promise<PostCollectionResponse>;
}

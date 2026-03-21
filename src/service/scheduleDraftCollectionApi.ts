import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { workspaceIdHeader } from "@/lib/api-headers";

export async function scheduleDraftCollectionApi(
  getToken: () => Promise<string | null>,
  collectionId: number,
  scheduledTime: string
): Promise<PostCollectionResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/post-collections/${collectionId}/schedule`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
    body: JSON.stringify({ scheduledTime }),
  });

  const body = await res.text();

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  return JSON.parse(body) as PostCollectionResponse;
}

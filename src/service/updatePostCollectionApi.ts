import type { PostCollectionResponse } from "@/model/PostCollectionResponse";

export interface UpdatePostCollectionPayload {
  title?: string;
  description?: string;
  scheduledTime?: string; // ISO 8601 UTC string
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
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  return res.json() as Promise<PostCollectionResponse>;
}

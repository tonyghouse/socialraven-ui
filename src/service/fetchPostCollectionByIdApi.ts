import type { PostCollectionResponse } from "@/model/PostCollectionResponse";

export async function fetchPostCollectionByIdApi(
  getToken: () => Promise<string | null>,
  collectionId: string | number
): Promise<PostCollectionResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");

  const token = await getToken();

  const res = await fetch(`${backendUrl}/post-collections/${collectionId}`, {
    headers: {
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  return res.json() as Promise<PostCollectionResponse>;
}

import { workspaceIdHeader } from "@/lib/api-headers";

export async function deletePostCollectionApi(
  getToken: () => Promise<string | null>,
  collectionId: string | number
): Promise<void> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  }

  const token = await getToken();

  const res = await fetch(`${backendUrl}/post-collections/${collectionId}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...workspaceIdHeader(),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }
}

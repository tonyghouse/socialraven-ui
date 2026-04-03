// src/service/connectedAccounts.ts
import { PostCollection } from "@/model/PostCollection";
import { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { workspaceIdHeader } from "@/lib/api-headers";

export async function postConnectedAccountsApi(
  getToken: () => Promise<string | null>,
  post: PostCollection
): Promise<PostCollectionResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/post-collections/schedule`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
    body: JSON.stringify(post),
  });

  const body = await res.text(); // read once

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  // backend returns string → parse safely
  const parsed = JSON.parse(body) as PostCollectionResponse;

  return parsed;
}

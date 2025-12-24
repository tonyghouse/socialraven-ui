// src/service/connectedAccounts.ts
import { PostCollection } from "@/model/PostCollection";

export async function postConnectedAccountsApi(
  getToken: () => Promise<string | null>,
  post: PostCollection
): Promise<PostCollection> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/post-collections/schedule`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(post),
  });

  const body = await res.text(); // read once

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  // backend returns string → parse safely
  const parsed = JSON.parse(body) as PostCollection;

  return parsed;
}

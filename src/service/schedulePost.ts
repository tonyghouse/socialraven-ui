// src/service/connectedAccounts.ts
import { SchedulePost } from "@/model/SchedulePost";

export async function postConnectedAccountsApi(
  getToken: () => Promise<string | null>,
  post: SchedulePost
): Promise<SchedulePost> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/posts/schedule`, {
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
  const parsed = JSON.parse(body) as SchedulePost;

  return parsed;
}

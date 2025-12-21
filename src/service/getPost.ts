// src/service/posts.ts
import { PostResponse } from "@/model/PostResponse";

export async function fetchPostByIdApi(
  getToken: () => Promise<string | null>,
  postId: string
): Promise<PostResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  }

  // ✅ Parse string → number
  const parsedPostId = Number(postId);
  if (!Number.isFinite(parsedPostId)) {
    throw new Error(`Invalid postId: ${postId}`);
  }

  const token = await getToken();

  const url = new URL(`${backendUrl}/posts/${parsedPostId}`);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  return (await res.json()) as PostResponse;
}

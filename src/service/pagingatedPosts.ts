// src/service/posts.ts
import { PostResponsePage } from "@/model/PostResponsePage"; // you will create this

export async function fetchPaginatedPostsApi(
  getToken: () => Promise<string | null>,
  page: number,
  postStatus : string| null
): Promise<PostResponsePage> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const url = new URL(`${backendUrl}/posts/`);
  url.searchParams.append("page", page.toString());
  if(postStatus!=null){
    url.searchParams.append("postStatus", postStatus);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await res.text();

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  return JSON.parse(body) as PostResponsePage;
}

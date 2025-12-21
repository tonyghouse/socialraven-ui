export async function deletePostByIdApi(
  getToken: () => Promise<string | null>,
  postId: string
): Promise<void> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  }

  const parsedPostId = Number(postId);
  if (!Number.isFinite(parsedPostId)) {
    throw new Error(`Invalid postId: ${postId}`);
  }

  const token = await getToken();

  const res = await fetch(`${backendUrl}/posts/${parsedPostId}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }
}

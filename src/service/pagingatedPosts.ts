// src/service/posts.ts
import { PostResponsePage } from "@/model/PostResponsePage";

export async function fetchPaginatedPostsApi(
  getToken: () => Promise<string | null>,
  page: number,
  postStatus: string | null
): Promise<PostResponsePage> {

  console.log("========== fetchPaginatedPostsApi START ==========");

  try {
    console.log("[INPUT] page:", page);
    console.log("[INPUT] postStatus:", postStatus);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log("[CONFIG] NEXT_PUBLIC_BACKEND_URL:", backendUrl);

    if (!backendUrl) {
      console.error("[ERROR] Backend URL is undefined!");
      throw new Error("Backend URL is not configured");
    }

    console.log("[AUTH] Fetching token...");
    const token = await getToken();

    if (!token) {
      console.warn("[AUTH] Token is null or undefined!");
    } else {
      console.log("[AUTH] Token received. Length:", token.length);
    }

    const url = new URL(`${backendUrl}/posts/`);
    url.searchParams.append("page", page.toString());

    if (postStatus != null) {
      url.searchParams.append("postStatus", postStatus);
      console.log("[QUERY] postStatus appended:", postStatus);
    } else {
      console.log("[QUERY] postStatus not provided");
    }

    console.log("[REQUEST] Final URL:", url.toString());

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    console.log("[REQUEST] Headers:", {
      ...headers,
      Authorization: token ? `Bearer <${token.length}-char-token>` : "Bearer null",
    });

    console.log("[NETWORK] Sending request...");

    const startTime = Date.now();

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    const duration = Date.now() - startTime;

    console.log("[NETWORK] Response received in", duration, "ms");
    console.log("[RESPONSE] Status:", res.status);
    console.log("[RESPONSE] Status Text:", res.statusText);
    console.log("[RESPONSE] OK:", res.ok);

    const body = await res.text();
    console.log("[RESPONSE] Raw Body:", body);

    if (!res.ok) {
      console.error("[ERROR] Backend returned non-OK response");
      throw new Error(`Backend error: ${res.status} - ${body}`);
    }

    console.log("[PARSE] Parsing JSON...");
    const parsed = JSON.parse(body) as PostResponsePage;

    console.log("[PARSE] Parsed type:", typeof parsed);
    console.log("[PARSE] Keys:", Object.keys(parsed || {}));

    if (parsed?.content) {
      console.log("[PARSE] Content length:", parsed.content.length);
    }

    console.log("[SUCCESS] fetchPaginatedPostsApi completed successfully");
    console.log("========== fetchPaginatedPostsApi END ==========");

    return parsed;

  } catch (error) {
    console.error("========== fetchPaginatedPostsApi FAILED ==========");
    console.error("[EXCEPTION]", error);
    console.error("==================================================");
    throw error;
  }
}

import { PostCollectionResponsePage } from "@/model/PostCollectionResponse";
import { workspaceIdHeader } from "@/lib/api-headers";

export async function fetchPostCollectionsApi(
  getToken: () => Promise<string | null>,
  page: number,
  type?: "scheduled" | "published" | "draft",
  search?: string,
  providerUserIds?: string[],
  platform?: string,
  sortDir?: "asc" | "desc",
  dateRange?: "today" | "week" | "month"
): Promise<PostCollectionResponsePage> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const url = new URL(`${backendUrl}/post-collections`);
  url.searchParams.append("page", page.toString());
  if (type) url.searchParams.append("type", type);
  if (search && search.trim()) url.searchParams.append("search", search.trim());
  if (providerUserIds && providerUserIds.length > 0) {
    providerUserIds.forEach((id) => url.searchParams.append("providerUserIds", id));
  }
  if (platform) url.searchParams.append("platform", platform);
  if (sortDir) url.searchParams.append("sortDir", sortDir);
  if (dateRange) url.searchParams.append("dateRange", dateRange);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
  });

  const body = await res.text();

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  return JSON.parse(body) as PostCollectionResponsePage;
}

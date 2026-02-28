import type { CalendarPostResponse } from "@/model/CalendarPostResponse";

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api.socialraven.io";

/**
 * Fetch a mini-view of posts within a UTC date range, optionally filtered
 * to specific provider account IDs.
 *
 * @param startDate - ISO-8601 UTC string (inclusive)
 * @param endDate   - ISO-8601 UTC string (exclusive)
 * @param providerUserIds - if empty / undefined, all accounts are returned
 */
export async function fetchCalendarPostsApi(
  getToken: () => Promise<string | null>,
  startDate: string,
  endDate: string,
  providerUserIds?: string[]
): Promise<CalendarPostResponse[]> {
  const token = await getToken();
  const params = new URLSearchParams({ startDate, endDate });
  if (providerUserIds && providerUserIds.length > 0) {
    providerUserIds.forEach((id) => params.append("providerUserIds", id));
  }

  const res = await fetch(`${BASE_URL}/posts/calendar?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Calendar posts fetch failed: ${res.status}`);
  }

  return res.json();
}

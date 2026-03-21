type GetToken = () => Promise<string | null>;

/**
 * Returns { "X-Workspace-Id": id } if an active workspace is set in localStorage,
 * otherwise returns {}. Safe to call during SSR (returns {}).
 */
export function workspaceIdHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const id = localStorage.getItem("activeWorkspaceId");
  return id ? { "X-Workspace-Id": id } : {};
}

/**
 * Builds standard API request headers including Authorization and X-Workspace-Id.
 * X-Workspace-Id is read from localStorage (client-side only).
 */
export async function apiHeaders(
  getToken: GetToken,
  extra?: Record<string, string>
): Promise<HeadersInit> {
  const token = await getToken();

  const workspaceId =
    typeof window !== "undefined"
      ? (localStorage.getItem("activeWorkspaceId") ?? "")
      : "";

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(workspaceId ? { "X-Workspace-Id": workspaceId } : {}),
    ...extra,
  };
}

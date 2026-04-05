import { AgencyOpsFilters, AgencyOpsResponse } from "@/model/AgencyOps";

type GetToken = () => Promise<string | null>;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

function appendFilter(url: URL, key: string, value: string | undefined) {
  if (!value || value === "ALL") return;
  url.searchParams.append(key, value);
}

export async function fetchAgencyOpsApi(
  getToken: GetToken,
  filters?: AgencyOpsFilters
): Promise<AgencyOpsResponse> {
  const token = await getToken();
  const url = new URL(`${BACKEND}/workspaces/agency-ops`);
  appendFilter(url, "workspaceId", filters?.workspaceId);
  appendFilter(url, "approverUserId", filters?.approverUserId);
  appendFilter(url, "status", filters?.status);
  appendFilter(url, "dueWindow", filters?.dueWindow);
  appendFilter(url, "timezone", filters?.timezone);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`fetchAgencyOps failed: ${res.status} - ${body}`);
  }

  return JSON.parse(body) as AgencyOpsResponse;
}

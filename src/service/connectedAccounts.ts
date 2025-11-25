// src/service/connectedAccounts.ts
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { Platform } from "@/model/Platform";

export async function fetchConnectedAccountsApi(
  getToken: () => Promise<string | null>,
  platform: Platform | null
): Promise<ConnectedAccount[]> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  // Build URL with optional query param
  const url = new URL(`${backendUrl}/profiles/connected`);

  if (platform) {
    url.searchParams.append("platform", platform);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await res.text(); // Read only once

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  return JSON.parse(body) as ConnectedAccount[];
}

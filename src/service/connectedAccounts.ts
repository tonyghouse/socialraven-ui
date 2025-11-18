// src/service/connectedAccounts.ts
import { ConnectedAccount } from "@/model/ConnectedAccount";

export async function fetchConnectedAccountsApi(
  getToken: () => Promise<string | null>
): Promise<ConnectedAccount[]> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/accounts/connected`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Read only once
  const body = await res.text();

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  const data = JSON.parse(body) as ConnectedAccount[];

  // ⭐ LOG THE ARRAY HERE
  console.log("Connected Accounts:", data);

  return data;
}

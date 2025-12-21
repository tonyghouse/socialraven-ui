// src/service/connectedAccounts.ts

export async function deleteConnectedAccountApi(
  getToken: () => Promise<string | null>,
  providerUserId: string
): Promise<string> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  }

  const token = await getToken();
  if (!token) {
    throw new Error("Authorization token not available");
  }

  const res = await fetch(
    `${backendUrl}/account-profiles/connected/delete/${encodeURIComponent(providerUserId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const body = await res.text(); // read once

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  return JSON.parse(body) as string;
}

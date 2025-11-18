import { ConnectedAccountCount } from "@/model/ConnectedAccountCount";

export async function fetchConnectedAccountCountsApi(
  getToken: () => Promise<string | null>
): Promise<ConnectedAccountCount[]> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/accounts/connected/count`, {
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

  const data = JSON.parse(body) as ConnectedAccountCount[];

  //console.log("Connected Account Counts:", data);

  return data;
}

// src/service/connectedAccounts.ts
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { Platform } from "@/model/Platform";

export async function fetchAllConnectedAccountsApi(
  getToken: () => Promise<string | null>,
): Promise<ConnectedAccount[]> {

  console.log("========== fetchAllConnectedAccountsApi START ==========");

  try {
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

    const url = new URL(`${backendUrl}/account-profiles/connected/all`);
    console.log("[REQUEST] URL:", url.toString());
    console.log("[REQUEST] Method: GET");

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
    const parsed = JSON.parse(body) as ConnectedAccount[];

    console.log("[PARSE] Parsed object type:", typeof parsed);
    console.log("[PARSE] Array length:", Array.isArray(parsed) ? parsed.length : "Not an array");
    console.log("[SUCCESS] fetchAllConnectedAccountsApi completed successfully");

    console.log("========== fetchAllConnectedAccountsApi END ==========");

    return parsed;

  } catch (error) {
    console.error("========== fetchAllConnectedAccountsApi FAILED ==========");
    console.error("[EXCEPTION]", error);
    console.error("========================================================");
    throw error;
  }
}

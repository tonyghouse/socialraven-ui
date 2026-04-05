import { apiHeaders } from "@/lib/api-headers";
import type {
  ClientConnectionSession,
  CreateClientConnectionSessionRequest,
  PublicClientConnectionSession,
} from "@/model/ClientConnection";

type GetToken = () => Promise<string | null>;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const body = await res.text();
  if (!res.ok) {
    throw new Error(body || `Client connection request failed: ${res.status}`);
  }
  return JSON.parse(body) as T;
}

export async function getClientConnectionSessionsApi(
  getToken: GetToken
): Promise<ClientConnectionSession[]> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/client-connect/sessions`, { headers });
  return parseJsonResponse<ClientConnectionSession[]>(res);
}

export async function createClientConnectionSessionApi(
  getToken: GetToken,
  request: CreateClientConnectionSessionRequest
): Promise<ClientConnectionSession> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/client-connect/sessions`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });
  return parseJsonResponse<ClientConnectionSession>(res);
}

export async function revokeClientConnectionSessionApi(
  getToken: GetToken,
  sessionId: string
): Promise<void> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/client-connect/sessions/${sessionId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Failed to revoke client connection handoff: ${res.status}`);
  }
}

export async function getPublicClientConnectionSessionApi(
  token: string
): Promise<PublicClientConnectionSession> {
  const res = await fetch(`${BACKEND}/public/client-connect/${token}`, {
    headers: {
      Accept: "application/json",
    },
  });
  return parseJsonResponse<PublicClientConnectionSession>(res);
}

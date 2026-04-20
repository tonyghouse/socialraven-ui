import { apiHeaders } from "@/lib/api-headers";
import type {
  ClientReportLink,
  ClientReportSchedule,
  ClientReportSnapshotRequest,
  CreateClientReportLinkRequest,
  CreateClientReportScheduleRequest,
  PublicClientReport,
} from "@/model/ClientReport";

type GetToken = () => Promise<string | null>;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Client report request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getClientReportLinksApi(
  getToken: GetToken
): Promise<ClientReportLink[]> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/client-reports/links`, { headers });
  return parseJsonResponse<ClientReportLink[]>(res);
}

export async function getClientReportSnapshotApi(
  getToken: GetToken,
  request: ClientReportSnapshotRequest
): Promise<PublicClientReport> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/client-reports/snapshot`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });
  return parseJsonResponse<PublicClientReport>(res);
}

export async function createClientReportLinkApi(
  getToken: GetToken,
  request: CreateClientReportLinkRequest
): Promise<ClientReportLink> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/client-reports/links`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });
  return parseJsonResponse<ClientReportLink>(res);
}

export async function revokeClientReportLinkApi(
  getToken: GetToken,
  linkId: string
): Promise<void> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/client-reports/links/${linkId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Failed to revoke client report link: ${res.status}`);
  }
}

export async function getClientReportSchedulesApi(
  getToken: GetToken
): Promise<ClientReportSchedule[]> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/client-reports/schedules`, { headers });
  return parseJsonResponse<ClientReportSchedule[]>(res);
}

export async function createClientReportScheduleApi(
  getToken: GetToken,
  request: CreateClientReportScheduleRequest
): Promise<ClientReportSchedule> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/client-reports/schedules`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });
  return parseJsonResponse<ClientReportSchedule>(res);
}

export async function deactivateClientReportScheduleApi(
  getToken: GetToken,
  scheduleId: number
): Promise<void> {
  const headers = await apiHeaders(getToken);
  const res = await fetch(`${BACKEND}/client-reports/schedules/${scheduleId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Failed to deactivate client report schedule: ${res.status}`);
  }
}

export async function getPublicClientReportApi(
  token: string
): Promise<PublicClientReport> {
  const res = await fetch(`${BACKEND}/public/client-reports/${token}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });
  return parseJsonResponse<PublicClientReport>(res);
}

export function publicClientReportPdfUrl(token: string): string {
  return `${BACKEND}/public/client-reports/${token}/pdf`;
}

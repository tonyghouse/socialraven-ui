import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { workspaceIdHeader } from "@/lib/api-headers";

type GetToken = () => Promise<string | null>;

async function postReviewAction(
  getToken: GetToken,
  collectionId: number | string,
  action: "approve" | "request-changes" | "activate-approved-schedule",
  note?: string
): Promise<PostCollectionResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/post-collections/${collectionId}/${action}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
    body: JSON.stringify({ note }),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  return JSON.parse(body) as PostCollectionResponse;
}

export function approvePostCollectionApi(
  getToken: GetToken,
  collectionId: number | string,
  note?: string
) {
  return postReviewAction(getToken, collectionId, "approve", note);
}

export function requestChangesPostCollectionApi(
  getToken: GetToken,
  collectionId: number | string,
  note?: string
) {
  return postReviewAction(getToken, collectionId, "request-changes", note);
}

export function activateApprovedScheduleApi(
  getToken: GetToken,
  collectionId: number | string
) {
  return postReviewAction(getToken, collectionId, "activate-approved-schedule");
}

export async function downloadPostCollectionApprovalLogApi(
  getToken: GetToken,
  collectionId: number | string
) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = await getToken();

  const res = await fetch(`${backendUrl}/post-collections/${collectionId}/approval-log/export`, {
    method: "GET",
    headers: {
      Accept: "text/csv",
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }

  return res.blob();
}

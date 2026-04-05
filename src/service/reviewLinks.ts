import { workspaceIdHeader } from "@/lib/api-headers";
import type {
  CreatePostCollectionReviewLinkRequest,
  PostCollectionReviewLink,
  PublicPostCollectionReviewResponse,
  PublicReviewCommentRequest,
  PublicReviewDecisionRequest,
} from "@/model/ReviewLink";
import type { PostCollaborationThread } from "@/model/PostCollaboration";

type GetToken = () => Promise<string | null>;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const REVIEW_LINK_PASSCODE_HEADER = "X-Review-Link-Passcode";

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const body = await res.text();
  if (!res.ok) {
    const error = new Error(`Backend error: ${res.status} - ${body}`) as Error & {
      status?: number;
      body?: string;
    };
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return JSON.parse(body) as T;
}

function publicReviewHeaders(passcode?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const normalizedPasscode = passcode?.trim();
  if (normalizedPasscode) {
    headers[REVIEW_LINK_PASSCODE_HEADER] = normalizedPasscode;
  }
  return headers;
}

export async function getPostCollectionReviewLinksApi(
  getToken: GetToken,
  collectionId: number | string
): Promise<PostCollectionReviewLink[]> {
  const token = await getToken();
  const res = await fetch(`${BACKEND}/post-collections/${collectionId}/review-links`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
  });
  return parseJsonResponse<PostCollectionReviewLink[]>(res);
}

export async function createPostCollectionReviewLinkApi(
  getToken: GetToken,
  collectionId: number | string,
  request: CreatePostCollectionReviewLinkRequest
): Promise<PostCollectionReviewLink> {
  const token = await getToken();
  const res = await fetch(`${BACKEND}/post-collections/${collectionId}/review-links`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
    body: JSON.stringify(request),
  });
  return parseJsonResponse<PostCollectionReviewLink>(res);
}

export async function revokePostCollectionReviewLinkApi(
  getToken: GetToken,
  collectionId: number | string,
  reviewLinkId: string
): Promise<void> {
  const token = await getToken();
  const res = await fetch(
    `${BACKEND}/post-collections/${collectionId}/review-links/${reviewLinkId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...workspaceIdHeader(),
      },
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }
}

export async function getPublicPostCollectionReviewApi(
  token: string,
  passcode?: string
): Promise<PublicPostCollectionReviewResponse> {
  const res = await fetch(`${BACKEND}/public/review-links/${token}`, {
    headers: publicReviewHeaders(passcode),
  });
  return parseJsonResponse<PublicPostCollectionReviewResponse>(res);
}

export async function addPublicReviewCommentApi(
  token: string,
  request: PublicReviewCommentRequest,
  passcode?: string
): Promise<PostCollaborationThread> {
  const res = await fetch(`${BACKEND}/public/review-links/${token}/comments`, {
    method: "POST",
    headers: {
      ...publicReviewHeaders(passcode),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  return parseJsonResponse<PostCollaborationThread>(res);
}

async function postPublicDecision(
  token: string,
  action: "approve" | "reject",
  request: PublicReviewDecisionRequest,
  passcode?: string
): Promise<PublicPostCollectionReviewResponse> {
  const res = await fetch(`${BACKEND}/public/review-links/${token}/${action}`, {
    method: "POST",
    headers: {
      ...publicReviewHeaders(passcode),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  return parseJsonResponse<PublicPostCollectionReviewResponse>(res);
}

export function approvePublicReviewApi(
  token: string,
  request: PublicReviewDecisionRequest,
  passcode?: string
) {
  return postPublicDecision(token, "approve", request, passcode);
}

export function rejectPublicReviewApi(
  token: string,
  request: PublicReviewDecisionRequest,
  passcode?: string
) {
  return postPublicDecision(token, "reject", request, passcode);
}

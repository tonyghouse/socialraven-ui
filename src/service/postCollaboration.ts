import { workspaceIdHeader } from "@/lib/api-headers";
import type {
  CreatePostCollaborationReplyRequest,
  CreatePostCollaborationThreadRequest,
  PostCollaborationThread,
} from "@/model/PostCollaboration";

type GetToken = () => Promise<string | null>;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} - ${body}`);
  }
  return JSON.parse(body) as T;
}

export async function getPostCollaborationThreadsApi(
  getToken: GetToken,
  collectionId: number | string
): Promise<PostCollaborationThread[]> {
  const token = await getToken();
  const res = await fetch(`${BACKEND}/post-collections/${collectionId}/collaboration/threads`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
  });
  return parseJsonResponse<PostCollaborationThread[]>(res);
}

export async function createPostCollaborationThreadApi(
  getToken: GetToken,
  collectionId: number | string,
  request: CreatePostCollaborationThreadRequest
): Promise<PostCollaborationThread> {
  const token = await getToken();
  const res = await fetch(`${BACKEND}/post-collections/${collectionId}/collaboration/threads`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...workspaceIdHeader(),
    },
    body: JSON.stringify(request),
  });
  return parseJsonResponse<PostCollaborationThread>(res);
}

export async function addPostCollaborationReplyApi(
  getToken: GetToken,
  collectionId: number | string,
  threadId: number,
  request: CreatePostCollaborationReplyRequest
): Promise<PostCollaborationThread> {
  const token = await getToken();
  const res = await fetch(
    `${BACKEND}/post-collections/${collectionId}/collaboration/threads/${threadId}/replies`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...workspaceIdHeader(),
      },
      body: JSON.stringify(request),
    }
  );
  return parseJsonResponse<PostCollaborationThread>(res);
}

async function postThreadAction(
  getToken: GetToken,
  collectionId: number | string,
  threadId: number,
  action:
    | "resolve"
    | "reopen"
    | "accept-suggestion"
    | "reject-suggestion"
): Promise<PostCollaborationThread> {
  const token = await getToken();
  const res = await fetch(
    `${BACKEND}/post-collections/${collectionId}/collaboration/threads/${threadId}/${action}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...workspaceIdHeader(),
      },
    }
  );
  return parseJsonResponse<PostCollaborationThread>(res);
}

export function resolvePostCollaborationThreadApi(
  getToken: GetToken,
  collectionId: number | string,
  threadId: number
) {
  return postThreadAction(getToken, collectionId, threadId, "resolve");
}

export function reopenPostCollaborationThreadApi(
  getToken: GetToken,
  collectionId: number | string,
  threadId: number
) {
  return postThreadAction(getToken, collectionId, threadId, "reopen");
}

export function acceptPostCollaborationSuggestionApi(
  getToken: GetToken,
  collectionId: number | string,
  threadId: number
) {
  return postThreadAction(getToken, collectionId, threadId, "accept-suggestion");
}

export function rejectPostCollaborationSuggestionApi(
  getToken: GetToken,
  collectionId: number | string,
  threadId: number
) {
  return postThreadAction(getToken, collectionId, threadId, "reject-suggestion");
}

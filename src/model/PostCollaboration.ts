export type PostCollaborationThreadType = "COMMENT" | "NOTE" | "SUGGESTION";
export type PostCollaborationVisibility = "INTERNAL" | "CLIENT_VISIBLE";
export type PostCollaborationThreadStatus = "OPEN" | "RESOLVED";
export type PostCollaborationSuggestionStatus = "PENDING" | "ACCEPTED" | "REJECTED";
export type PostCollaborationAuthorType = "WORKSPACE_USER" | "CLIENT_REVIEWER";

export interface PostCollaborationMention {
  userId: string;
  displayName: string;
}

export interface PostCollaborationReply {
  id: number;
  authorUserId: string;
  authorDisplayName: string;
  body: string;
  mentions: PostCollaborationMention[];
  createdAt: string;
  updatedAt: string;
}

export interface PostCollaborationThread {
  id: number;
  threadType: PostCollaborationThreadType;
  visibility: PostCollaborationVisibility;
  status: PostCollaborationThreadStatus;
  authorType: PostCollaborationAuthorType;
  authorUserId: string | null;
  authorDisplayName: string;
  body: string | null;
  mentions: PostCollaborationMention[];
  anchorStart: number | null;
  anchorEnd: number | null;
  anchorText: string | null;
  suggestedText: string | null;
  suggestionStatus: PostCollaborationSuggestionStatus | null;
  suggestionDecidedByUserId: string | null;
  suggestionDecidedByDisplayName: string | null;
  suggestionDecidedAt: string | null;
  resolvedByUserId: string | null;
  resolvedByDisplayName: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  replies: PostCollaborationReply[];
}

export interface CreatePostCollaborationThreadRequest {
  threadType: PostCollaborationThreadType;
  visibility?: PostCollaborationVisibility;
  body?: string;
  mentionUserIds?: string[];
  anchorStart?: number;
  anchorEnd?: number;
  anchorText?: string;
  suggestedText?: string;
}

export interface CreatePostCollaborationReplyRequest {
  body: string;
  mentionUserIds?: string[];
}

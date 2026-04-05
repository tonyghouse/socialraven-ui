export type WorkspaceLibraryItemType = "MEDIA_ASSET" | "SNIPPET" | "TEMPLATE";
export type WorkspaceLibraryItemStatus = "DRAFT" | "APPROVED" | "ARCHIVED";
export type WorkspaceLibrarySnippetTarget = "CAPTION" | "FIRST_COMMENT";
export type WorkspaceLibraryPostCollectionType = "IMAGE" | "VIDEO" | "TEXT";

export interface WorkspaceLibraryMedia {
  fileName: string;
  mimeType: string;
  fileKey: string;
  size: number | null;
  fileUrl: string | null;
}

export interface WorkspaceLibraryItem {
  id: number;
  itemType: WorkspaceLibraryItemType;
  status: WorkspaceLibraryItemStatus;
  name: string;
  folderName: string | null;
  description: string | null;
  body: string | null;
  snippetTarget: WorkspaceLibrarySnippetTarget | null;
  postCollectionType: WorkspaceLibraryPostCollectionType | null;
  tags: string[];
  media: WorkspaceLibraryMedia[];
  platformConfigs: Record<string, any> | null;
  usageNotes: string | null;
  internalNotes: string | null;
  expiresAt: string | null;
  expired: boolean;
  usable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceLibraryBundle {
  id: number;
  name: string;
  description: string | null;
  campaignLabel: string | null;
  itemIds: number[];
  items: WorkspaceLibraryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceLibraryResponse {
  items: WorkspaceLibraryItem[];
  bundles: WorkspaceLibraryBundle[];
}

export interface WorkspaceLibraryMediaRequest {
  fileName: string;
  mimeType: string;
  fileKey: string;
  size: number | null;
}

export interface UpsertWorkspaceLibraryItemRequest {
  itemType: WorkspaceLibraryItemType;
  status?: WorkspaceLibraryItemStatus;
  name: string;
  folderName?: string | null;
  description?: string | null;
  body?: string | null;
  snippetTarget?: WorkspaceLibrarySnippetTarget | null;
  postCollectionType?: WorkspaceLibraryPostCollectionType | null;
  tags?: string[];
  media?: WorkspaceLibraryMediaRequest[];
  platformConfigs?: Record<string, any> | null;
  usageNotes?: string | null;
  internalNotes?: string | null;
  expiresAt?: string | null;
}

export interface UpsertWorkspaceLibraryBundleRequest {
  name: string;
  description?: string | null;
  campaignLabel?: string | null;
  itemIds: number[];
}

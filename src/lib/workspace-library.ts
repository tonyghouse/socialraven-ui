import type { PlatformConfigs } from "@/model/PostCollection";
import type { PostType } from "@/model/PostType";
import type {
  WorkspaceLibraryBundle,
  WorkspaceLibraryItem,
  WorkspaceLibraryMedia,
} from "@/model/WorkspaceLibrary";

export interface ComposerLibraryAsset extends WorkspaceLibraryMedia {
  sourceItemId: number;
  sourceItemName: string;
  postCollectionType: "IMAGE" | "VIDEO";
}

const FIRST_COMMENT_PLATFORMS = ["facebook", "instagram"] as const;

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function supportsLibraryItemForPostType(
  item: WorkspaceLibraryItem,
  postType: PostType | null
): boolean {
  if (!postType) {
    return false;
  }
  if (item.itemType === "SNIPPET") {
    return true;
  }
  return item.postCollectionType === postType;
}

export function filterRelevantBundleItems(
  bundle: WorkspaceLibraryBundle,
  postType: PostType | null
): WorkspaceLibraryItem[] {
  return bundle.items.filter((item) => item.usable && supportsLibraryItemForPostType(item, postType));
}

export function mergePlatformConfigs(
  current: PlatformConfigs,
  incoming?: Record<string, any> | null
): PlatformConfigs {
  if (!incoming) {
    return { ...current };
  }

  const merged: PlatformConfigs = { ...current };
  for (const [platform, value] of Object.entries(incoming)) {
    const key = platform.toLowerCase() as keyof PlatformConfigs;
    const previousValue = merged[key];
    if (isObject(previousValue) && isObject(value)) {
      merged[key] = {
        ...previousValue,
        ...value,
      } as PlatformConfigs[keyof PlatformConfigs];
      continue;
    }
    merged[key] = value as PlatformConfigs[keyof PlatformConfigs];
  }
  return merged;
}

export function appendTextBlock(current: string, addition?: string | null): string {
  const normalizedAddition = addition?.trim();
  if (!normalizedAddition) {
    return current;
  }
  const normalizedCurrent = current.trim();
  if (!normalizedCurrent) {
    return normalizedAddition;
  }
  return `${normalizedCurrent}\n\n${normalizedAddition}`;
}

export function applyFirstCommentSnippet(
  current: PlatformConfigs,
  selectedPlatforms: string[],
  snippetBody: string
): { platformConfigs: PlatformConfigs; appliedPlatforms: string[] } {
  const applicablePlatforms = selectedPlatforms.filter((platform) =>
    FIRST_COMMENT_PLATFORMS.includes(platform as (typeof FIRST_COMMENT_PLATFORMS)[number])
  );

  if (applicablePlatforms.length === 0) {
    return {
      platformConfigs: { ...current },
      appliedPlatforms: [],
    };
  }

  const nextConfigs = { ...current };
  for (const platform of applicablePlatforms) {
    const key = platform as keyof PlatformConfigs;
    const existing = isObject(nextConfigs[key]) ? (nextConfigs[key] as Record<string, any>) : {};
    const previousComment = typeof existing.firstComment === "string" ? existing.firstComment : "";
    nextConfigs[key] = {
      ...existing,
      firstComment: appendTextBlock(previousComment, snippetBody),
    } as PlatformConfigs[keyof PlatformConfigs];
  }

  return {
    platformConfigs: nextConfigs,
    appliedPlatforms: applicablePlatforms,
  };
}

export function buildComposerLibraryAssets(item: WorkspaceLibraryItem): ComposerLibraryAsset[] {
  if (item.itemType !== "MEDIA_ASSET" || !item.postCollectionType || item.postCollectionType === "TEXT") {
    return [];
  }

  return item.media
    .filter((media) => media.fileKey && media.mimeType)
    .map((media) => ({
      ...media,
      sourceItemId: item.id,
      sourceItemName: item.name,
      postCollectionType: item.postCollectionType as "IMAGE" | "VIDEO",
    }));
}

export function buildPseudoFilesFromLibraryAssets(assets: ComposerLibraryAsset[]): File[] {
  return assets.map((asset) => ({
    name: asset.fileName,
    size: asset.size ?? 0,
    type: asset.mimeType,
  } as File));
}

export function dedupeLibraryAssets(
  current: ComposerLibraryAsset[],
  incoming: ComposerLibraryAsset[]
): ComposerLibraryAsset[] {
  const byKey = new Map<string, ComposerLibraryAsset>();
  for (const asset of current) {
    byKey.set(asset.fileKey, asset);
  }
  for (const asset of incoming) {
    byKey.set(asset.fileKey, asset);
  }
  return Array.from(byKey.values());
}

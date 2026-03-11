import { PostType } from "@/model/PostType";
import { PlatformConfigs } from "@/model/PostCollection";

/** Per-platform character limit for the main text/caption/description field */
export const PLATFORM_CHAR_LIMITS: Record<string, number> = {
  x:         280,
  threads:   500,
  instagram: 2200,
  facebook:  63206,
  linkedin:  3000,
  tiktok:    2200,
  youtube:   5000,
};

export const PLATFORM_DISPLAY_NAMES: Record<string, string> = {
  x:         "X / Twitter",
  threads:   "Threads",
  instagram: "Instagram",
  facebook:  "Facebook",
  linkedin:  "LinkedIn",
  tiktok:    "TikTok",
  youtube:   "YouTube",
};

export interface PlatformCharError {
  platform: string;
  limit: number;
  current: number;
}

/** Returns platforms whose character limit is exceeded */
export function getCharErrors(platforms: string[], charCount: number): PlatformCharError[] {
  return platforms
    .filter((p) => PLATFORM_CHAR_LIMITS[p] !== undefined && charCount > PLATFORM_CHAR_LIMITS[p])
    .map((p) => ({ platform: p, limit: PLATFORM_CHAR_LIMITS[p], current: charCount }));
}

export interface PlatformConfigError {
  platform: string;
  field: string;
  message: string;
}

/** Validates required platform-specific config fields before scheduling */
export function validatePlatformConfigs(
  platforms: string[],
  configs: PlatformConfigs,
  postType: PostType
): PlatformConfigError[] {
  const errors: PlatformConfigError[] = [];

  if (platforms.includes("youtube") && postType === "VIDEO") {
    if (!configs.youtube?.videoTitle?.trim()) {
      errors.push({
        platform: "youtube",
        field: "videoTitle",
        message: "YouTube requires a video title — add it in Platform Settings below",
      });
    }
  }

  return errors;
}

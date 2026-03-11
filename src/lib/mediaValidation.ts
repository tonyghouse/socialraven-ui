/**
 * mediaValidation.ts
 *
 * Single source of truth for all per-platform media constraints and validation.
 * Edit this file to update any platform limit — nothing else needs to change.
 *
 * Sources (as of 2025):
 *  - Instagram Graph API docs
 *  - Twitter/X Developer Platform docs
 *  - Facebook Graph API docs
 *  - LinkedIn API docs
 *  - YouTube Data API docs
 *  - TikTok for Developers docs
 *  - Threads API docs
 */

import { PLATFORM_DISPLAY_NAMES } from "./platformLimits";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MediaPostType = "IMAGE" | "VIDEO";

export type ValidationErrorCode =
  | "TOO_MANY_FILES"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FORMAT"
  | "INVALID_DIMENSIONS"
  | "INVALID_ASPECT_RATIO"
  | "VIDEO_TOO_LONG"
  | "VIDEO_TOO_SHORT"
  | "PLATFORM_NOT_SUPPORTED";

export interface MediaValidationError {
  code: ValidationErrorCode;
  platform: string;
  /** Human-readable description of what is wrong and how to fix it */
  message: string;
  /** Which file triggered the error (if applicable) */
  fileName?: string;
}

export interface MediaValidationResult {
  valid: boolean;
  errors: MediaValidationError[];
}

/** Full set of constraints for a platform + post type combination */
export interface PlatformMediaConstraints {
  /** Maximum files per post. 0 means this post type is NOT supported. */
  maxFiles: number;
  /** Maximum size per file, in MB */
  maxFileSizeMB: number;
  /** Accepted MIME types (exact match or "video/*" / "image/*" prefix) */
  supportedFormats: string[];
  /** Minimum image/video width in pixels */
  minWidthPx?: number;
  /** Maximum image/video width in pixels */
  maxWidthPx?: number;
  /** Minimum image/video height in pixels */
  minHeightPx?: number;
  /** Maximum image/video height in pixels */
  maxHeightPx?: number;
  /**
   * Minimum aspect ratio (width ÷ height).
   * e.g. 0.8 = 4:5 portrait (Instagram minimum).
   */
  minAspectRatio?: number;
  /**
   * Maximum aspect ratio (width ÷ height).
   * e.g. 1.91 = 1.91:1 landscape (Instagram maximum).
   */
  maxAspectRatio?: number;
  /** Maximum video duration in seconds */
  maxDurationSec?: number;
  /** Minimum video duration in seconds */
  minDurationSec?: number;
  /** One-line human-readable summary shown in the requirements panel */
  summary: string;
}

// ── Image constraints per platform ───────────────────────────────────────────

export const PLATFORM_IMAGE_CONSTRAINTS: Record<string, PlatformMediaConstraints> = {
  instagram: {
    maxFiles: 10,
    maxFileSizeMB: 8,
    supportedFormats: ["image/jpeg", "image/png"],
    minWidthPx: 320,
    maxWidthPx: 1440,
    minAspectRatio: 0.8,   // 4:5  — most portrait allowed
    maxAspectRatio: 1.91,  // 1.91:1 — most landscape allowed
    summary: "Max 10 · 8 MB each · JPG/PNG · Aspect ratio 4:5 to 1.91:1 · Min 320 px wide",
  },
  facebook: {
    maxFiles: 10,
    maxFileSizeMB: 4,
    supportedFormats: ["image/jpeg", "image/png", "image/gif"],
    summary: "Max 10 · 4 MB each · JPG, PNG, or GIF",
  },
  x: {
    maxFiles: 4,
    maxFileSizeMB: 5,
    supportedFormats: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    summary: "Max 4 per tweet · 5 MB each · JPG, PNG, GIF, or WebP",
  },
  linkedin: {
    maxFiles: 9,
    maxFileSizeMB: 5,
    supportedFormats: ["image/jpeg", "image/png", "image/gif"],
    summary: "Max 9 · 5 MB each · JPG, PNG, or GIF",
  },
  threads: {
    maxFiles: 10,
    maxFileSizeMB: 8,
    supportedFormats: ["image/jpeg", "image/png"],
    minAspectRatio: 0.8,
    maxAspectRatio: 1.91,
    summary: "Max 10 · 8 MB each · JPG/PNG · Aspect ratio 4:5 to 1.91:1",
  },
  tiktok: {
    maxFiles: 35,
    maxFileSizeMB: 20,
    supportedFormats: ["image/jpeg", "image/png", "image/webp"],
    summary: "Max 35 (photo mode) · 20 MB each · JPG, PNG, or WebP",
  },
  youtube: {
    // YouTube does not support image posts via the API
    maxFiles: 0,
    maxFileSizeMB: 0,
    supportedFormats: [],
    summary: "YouTube does not support image posts",
  },
};

// ── Video constraints per platform ───────────────────────────────────────────

export const PLATFORM_VIDEO_CONSTRAINTS: Record<string, PlatformMediaConstraints> = {
  instagram: {
    maxFiles: 1,
    maxFileSizeMB: 100,
    supportedFormats: ["video/mp4", "video/quicktime"],
    maxDurationSec: 3600,  // 1 hour for feed video; 90 sec for Reels
    minDurationSec: 3,
    summary: "1 video · Max 100 MB · MP4 or MOV · At least 3 seconds",
  },
  facebook: {
    maxFiles: 1,
    maxFileSizeMB: 1024,  // 1 GB
    supportedFormats: ["video/mp4", "video/quicktime", "video/avi", "video/x-msvideo", "video/x-ms-wmv"],
    maxDurationSec: 14400, // 4 hours
    summary: "1 video · Max 1 GB · MP4 preferred · Up to 4 hours",
  },
  x: {
    maxFiles: 1,
    maxFileSizeMB: 512,
    supportedFormats: ["video/mp4", "video/quicktime"],
    maxDurationSec: 140,
    minDurationSec: 1,
    summary: "1 video per tweet · Max 512 MB · MP4 or MOV · Max 140 seconds",
  },
  linkedin: {
    maxFiles: 1,
    maxFileSizeMB: 200,
    supportedFormats: ["video/mp4"],
    maxDurationSec: 600,   // 10 minutes
    minDurationSec: 3,
    summary: "1 video · Max 200 MB · MP4 only · 3 seconds to 10 minutes",
  },
  threads: {
    maxFiles: 1,
    maxFileSizeMB: 500,
    supportedFormats: ["video/mp4", "video/quicktime"],
    maxDurationSec: 300,   // 5 minutes
    summary: "1 video · Max 500 MB · MP4 or MOV · Up to 5 minutes",
  },
  tiktok: {
    maxFiles: 1,
    maxFileSizeMB: 288,    // ~287.6 MB
    supportedFormats: ["video/mp4", "video/quicktime", "video/webm"],
    maxDurationSec: 180,   // 3 minutes standard (some accounts eligible for 10 min)
    minDurationSec: 1,
    summary: "1 video · Max 288 MB · MP4, MOV, or WebM · Max 3 minutes",
  },
  youtube: {
    maxFiles: 1,
    maxFileSizeMB: 262144, // 256 GB
    supportedFormats: [
      "video/mp4", "video/quicktime", "video/avi", "video/x-msvideo",
      "video/x-ms-wmv", "video/webm", "video/mpeg", "video/3gpp",
      "video/x-flv", "video/x-matroska",
    ],
    maxDurationSec: 43200, // 12 hours
    summary: "1 video · Max 256 GB · Most formats · Up to 12 hours",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function toMB(bytes: number): number {
  return bytes / (1024 * 1024);
}

function fmtMB(bytes: number): string {
  const mb = toMB(bytes);
  return mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
}

function fmtDuration(sec: number): string {
  if (sec < 60) return `${sec} sec`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (sec < 3600) return s > 0 ? `${m}m ${s}s` : `${m} min`;
  return `${Math.floor(sec / 3600)}h`;
}

function fmtAspectRatio(ratio: number): string {
  // Express as "W:H" with 2 sig figs
  if (Math.abs(ratio - 1) < 0.01) return "1:1";
  if (Math.abs(ratio - 0.8) < 0.01) return "4:5";
  if (Math.abs(ratio - 1.91) < 0.01) return "1.91:1";
  return `${ratio.toFixed(2)}:1`;
}

function isMimeSupported(mimeType: string, formats: string[]): boolean {
  if (formats.length === 0) return false;
  return formats.some((f) => {
    if (f.endsWith("/*")) return mimeType.startsWith(f.slice(0, -1));
    return mimeType === f;
  });
}

function friendlyFormats(formats: string[]): string {
  return formats
    .map((f) => {
      const ext = f.split("/")[1];
      if (ext === "quicktime") return "MOV";
      if (ext === "x-msvideo" || ext === "avi") return "AVI";
      if (ext === "x-ms-wmv") return "WMV";
      if (ext === "x-flv") return "FLV";
      if (ext === "x-matroska") return "MKV";
      if (ext === "3gpp") return "3GP";
      return ext.toUpperCase();
    })
    .join(", ");
}

// ── Async file-metadata readers ───────────────────────────────────────────────

export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Cannot read "${file.name}"`));
    };
    img.src = url;
  });
}

export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(el.duration);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Cannot read "${file.name}"`));
    };
    el.src = url;
  });
}

// ── Sync validation (runs instantly on file selection) ────────────────────────

/**
 * Fast synchronous checks: file count, file size, MIME type.
 * Safe to call on every render without performance concerns.
 */
export function validateMediaSync(
  files: File[],
  platforms: string[],
  postType: MediaPostType
): MediaValidationError[] {
  const errors: MediaValidationError[] = [];
  const constraintMap =
    postType === "IMAGE" ? PLATFORM_IMAGE_CONSTRAINTS : PLATFORM_VIDEO_CONSTRAINTS;

  for (const platform of platforms) {
    const c = constraintMap[platform];
    if (!c) continue;
    const name = PLATFORM_DISPLAY_NAMES[platform] ?? platform;

    // Platform doesn't support this post type at all
    if (c.maxFiles === 0) {
      errors.push({
        code: "PLATFORM_NOT_SUPPORTED",
        platform,
        message: `${name} does not support ${postType === "IMAGE" ? "image" : "video"} posts via the API.`,
      });
      continue;
    }

    // File count
    if (files.length > c.maxFiles) {
      errors.push({
        code: "TOO_MANY_FILES",
        platform,
        message: `${name} allows max ${c.maxFiles} ${postType === "IMAGE" ? "image" : "video"}${c.maxFiles === 1 ? "" : "s"} per post — you have ${files.length}. Remove ${files.length - c.maxFiles}.`,
      });
    }

    // Per-file checks
    for (const file of files) {
      // MIME type
      if (!isMimeSupported(file.type, c.supportedFormats)) {
        errors.push({
          code: "UNSUPPORTED_FORMAT",
          platform,
          fileName: file.name,
          message: `${name} does not accept "${file.type || "unknown format"}". Accepted: ${friendlyFormats(c.supportedFormats)}. (${file.name})`,
        });
      }

      // File size
      if (toMB(file.size) > c.maxFileSizeMB) {
        errors.push({
          code: "FILE_TOO_LARGE",
          platform,
          fileName: file.name,
          message: `${name} allows max ${c.maxFileSizeMB} MB per file. "${file.name}" is ${fmtMB(file.size)} — ${fmtMB(file.size - c.maxFileSizeMB * 1024 * 1024)} over the limit.`,
        });
      }
    }
  }

  return errors;
}

// ── Async validation (dimensions, duration) ───────────────────────────────────

/**
 * Async checks: image dimensions + aspect ratio, video duration.
 * Reads file metadata in the browser — runs quickly but is non-blocking.
 */
export async function validateMediaAsync(
  files: File[],
  platforms: string[],
  postType: MediaPostType
): Promise<MediaValidationError[]> {
  const errors: MediaValidationError[] = [];
  const constraintMap =
    postType === "IMAGE" ? PLATFORM_IMAGE_CONSTRAINTS : PLATFORM_VIDEO_CONSTRAINTS;

  for (const platform of platforms) {
    const c = constraintMap[platform];
    if (!c || c.maxFiles === 0) continue;
    const name = PLATFORM_DISPLAY_NAMES[platform] ?? platform;

    for (const file of files) {
      // ── Image dimension + aspect ratio ──
      if (
        postType === "IMAGE" &&
        file.type.startsWith("image/") &&
        (c.minWidthPx || c.maxWidthPx || c.minHeightPx || c.maxHeightPx ||
          c.minAspectRatio || c.maxAspectRatio)
      ) {
        try {
          const { width, height } = await getImageDimensions(file);
          const ratio = width / height;

          if (c.minWidthPx && width < c.minWidthPx) {
            errors.push({
              code: "INVALID_DIMENSIONS",
              platform,
              fileName: file.name,
              message: `${name} requires images at least ${c.minWidthPx} px wide. "${file.name}" is only ${width} px wide.`,
            });
          }
          if (c.maxWidthPx && width > c.maxWidthPx) {
            errors.push({
              code: "INVALID_DIMENSIONS",
              platform,
              fileName: file.name,
              message: `${name} requires images no wider than ${c.maxWidthPx} px. "${file.name}" is ${width} px wide.`,
            });
          }
          if (c.minHeightPx && height < c.minHeightPx) {
            errors.push({
              code: "INVALID_DIMENSIONS",
              platform,
              fileName: file.name,
              message: `${name} requires images at least ${c.minHeightPx} px tall. "${file.name}" is only ${height} px tall.`,
            });
          }
          if (c.maxHeightPx && height > c.maxHeightPx) {
            errors.push({
              code: "INVALID_DIMENSIONS",
              platform,
              fileName: file.name,
              message: `${name} requires images no taller than ${c.maxHeightPx} px. "${file.name}" is ${height} px tall.`,
            });
          }
          if (c.minAspectRatio && ratio < c.minAspectRatio) {
            errors.push({
              code: "INVALID_ASPECT_RATIO",
              platform,
              fileName: file.name,
              message: `${name} requires a minimum aspect ratio of ${fmtAspectRatio(c.minAspectRatio)} (not too tall). "${file.name}" is ${fmtAspectRatio(ratio)} — too portrait. Crop the image.`,
            });
          }
          if (c.maxAspectRatio && ratio > c.maxAspectRatio) {
            errors.push({
              code: "INVALID_ASPECT_RATIO",
              platform,
              fileName: file.name,
              message: `${name} requires a maximum aspect ratio of ${fmtAspectRatio(c.maxAspectRatio)} (not too wide). "${file.name}" is ${fmtAspectRatio(ratio)} — too landscape. Crop the image.`,
            });
          }
        } catch {
          // Skip silently if image metadata can't be read (will fail at upload)
        }
      }

      // ── Video duration ──
      if (
        postType === "VIDEO" &&
        file.type.startsWith("video/") &&
        (c.maxDurationSec || c.minDurationSec)
      ) {
        try {
          const duration = await getVideoDuration(file);

          if (c.maxDurationSec && duration > c.maxDurationSec) {
            const over = Math.ceil(duration - c.maxDurationSec);
            errors.push({
              code: "VIDEO_TOO_LONG",
              platform,
              fileName: file.name,
              message: `${name} allows videos up to ${fmtDuration(c.maxDurationSec)}. "${file.name}" is ${fmtDuration(Math.round(duration))} — ${fmtDuration(over)} too long.`,
            });
          }
          if (c.minDurationSec && duration < c.minDurationSec) {
            errors.push({
              code: "VIDEO_TOO_SHORT",
              platform,
              fileName: file.name,
              message: `${name} requires videos of at least ${fmtDuration(c.minDurationSec)}. "${file.name}" is too short (${fmtDuration(Math.round(duration))}).`,
            });
          }
        } catch {
          // Skip silently if video metadata can't be read
        }
      }
    }
  }

  return errors;
}

// ── Full validation entry point ───────────────────────────────────────────────

/**
 * Runs all sync + async validation checks.
 * Call this when files are selected (useEffect) and again on submit.
 * Returns deduplicated errors across all platforms.
 */
export async function validateMediaFiles(
  files: File[],
  platforms: string[],
  postType: MediaPostType
): Promise<MediaValidationResult> {
  if (files.length === 0 || platforms.length === 0) {
    return { valid: true, errors: [] };
  }

  const [syncErrors, asyncErrors] = await Promise.all([
    Promise.resolve(validateMediaSync(files, platforms, postType)),
    validateMediaAsync(files, platforms, postType),
  ]);

  const all = [...syncErrors, ...asyncErrors];

  // Deduplicate: same code + platform + file is never shown twice
  const seen = new Set<string>();
  const deduped = all.filter((e) => {
    const key = `${e.code}:${e.platform}:${e.fileName ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { valid: deduped.length === 0, errors: deduped };
}

// ── Utility: most restrictive file count across selected platforms ─────────────

/**
 * Returns the lowest maxFiles across selected platforms for a given post type.
 * Use this to cap the MediaUploader so users can't pick more files than allowed.
 */
export function getEffectiveMaxFiles(
  platforms: string[],
  postType: MediaPostType
): number {
  if (platforms.length === 0) return 10; // sensible default when nothing selected
  const constraintMap =
    postType === "IMAGE" ? PLATFORM_IMAGE_CONSTRAINTS : PLATFORM_VIDEO_CONSTRAINTS;
  const limits = platforms
    .map((p) => constraintMap[p]?.maxFiles ?? 10)
    .filter((n) => n > 0); // exclude unsupported (0)
  return limits.length > 0 ? Math.min(...limits) : 10;
}

/**
 * Returns the name of the most restrictive platform for file count.
 * Used for display: "Max 4 images (X / Twitter limit)".
 */
export function getMostRestrictivePlatform(
  platforms: string[],
  postType: MediaPostType
): string | null {
  if (platforms.length === 0) return null;
  const constraintMap =
    postType === "IMAGE" ? PLATFORM_IMAGE_CONSTRAINTS : PLATFORM_VIDEO_CONSTRAINTS;
  let min = Infinity;
  let minPlatform: string | null = null;
  for (const p of platforms) {
    const limit = constraintMap[p]?.maxFiles ?? Infinity;
    if (limit > 0 && limit < min) {
      min = limit;
      minPlatform = p;
    }
  }
  return minPlatform;
}

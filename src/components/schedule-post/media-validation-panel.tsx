"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  MediaValidationError,
  MediaPostType,
  PLATFORM_IMAGE_CONSTRAINTS,
  PLATFORM_VIDEO_CONSTRAINTS,
} from "@/lib/mediaValidation";
import { PLATFORM_DISPLAY_NAMES } from "@/lib/platformLimits";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  LayoutList,
} from "lucide-react";

// ── Error code → user-friendly label ─────────────────────────────────────────

const ERROR_LABELS: Record<string, string> = {
  TOO_MANY_FILES:        "Too many files",
  FILE_TOO_LARGE:        "File too large",
  UNSUPPORTED_FORMAT:    "Unsupported format",
  INVALID_DIMENSIONS:    "Invalid dimensions",
  INVALID_ASPECT_RATIO:  "Wrong aspect ratio",
  VIDEO_TOO_LONG:        "Video too long",
  VIDEO_TOO_SHORT:       "Video too short",
  PLATFORM_NOT_SUPPORTED:"Platform not supported",
};

// ── Platform requirements table ───────────────────────────────────────────────

function PlatformRequirementsTable({
  platforms,
  postType,
  appearance = "default",
}: {
  platforms: string[];
  postType: MediaPostType;
  appearance?: "default" | "geist";
}) {
  const isGeist = appearance === "geist";
  const constraintMap =
    postType === "IMAGE" ? PLATFORM_IMAGE_CONSTRAINTS : PLATFORM_VIDEO_CONSTRAINTS;

  const relevant = platforms.filter((p) => constraintMap[p] !== undefined);
  if (relevant.length === 0) return null;

  return (
    <div className="space-y-2">
      {relevant.map((platform) => {
        const c = constraintMap[platform];
        const Icon = PLATFORM_ICONS[platform];
        const name = PLATFORM_DISPLAY_NAMES[platform] ?? platform;
        const unsupported = c.maxFiles === 0;

        return (
          <div
            key={platform}
            className={cn(
              "flex items-start gap-2.5 py-2 border-b last:border-0",
              isGeist ? "border-[var(--ds-gray-400)]" : "border-border/30",
              unsupported ? "opacity-50" : ""
            )}
          >
            {Icon && (
              <Icon className={cn("w-3.5 h-3.5 flex-shrink-0 mt-0.5", isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground")} />
            )}
            <div className="flex-1 min-w-0">
              <p className={cn(isGeist ? "text-copy-12 font-semibold text-[var(--ds-gray-1000)]" : "text-xs font-semibold text-foreground")}>{name}</p>
              <p className={cn("mt-0.5 text-[11px] leading-relaxed", isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground")}>
                {c.summary}
              </p>
            </div>
            {unsupported && (
              <span className={cn("flex-shrink-0 rounded border px-1.5 py-px text-[10px] font-semibold", isGeist ? "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]" : "border-warning/30 bg-warning/10 text-warning")}>
                N/A
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Error list ────────────────────────────────────────────────────────────────

function ErrorList({
  errors,
  appearance = "default",
}: {
  errors: MediaValidationError[];
  appearance?: "default" | "geist";
}) {
  const isGeist = appearance === "geist";
  // Group by platform for cleaner display
  const byPlatform: Record<string, MediaValidationError[]> = {};
  for (const err of errors) {
    if (!byPlatform[err.platform]) byPlatform[err.platform] = [];
    byPlatform[err.platform].push(err);
  }

  return (
    <div className="space-y-3">
      {Object.entries(byPlatform).map(([platform, errs]) => {
        const Icon = PLATFORM_ICONS[platform];
        const name = PLATFORM_DISPLAY_NAMES[platform] ?? platform;
        return (
          <div key={platform}>
            <div className="flex items-center gap-1.5 mb-1.5">
              {Icon && <Icon className={cn("w-3 h-3 flex-shrink-0", isGeist ? "text-[var(--ds-red-700)]" : "text-destructive")} />}
              <span className={cn(isGeist ? "text-copy-12 font-semibold text-[var(--ds-red-700)]" : "text-xs font-bold text-destructive")}>{name}</span>
            </div>
            <ul className="space-y-1.5 ml-4">
              {errs.map((err, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={cn("mt-0.5 flex-shrink-0 whitespace-nowrap rounded border px-1.5 py-px text-[10px] font-semibold", isGeist ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]" : "border-destructive/20 bg-destructive/10 text-destructive")}>
                    {ERROR_LABELS[err.code] ?? err.code}
                  </span>
                  <span className={cn("text-xs leading-relaxed", isGeist ? "text-[var(--ds-red-700)]" : "text-destructive")}>{err.message}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

interface Props {
  /** Lowercase platform names that are currently selected */
  platforms: string[];
  postType: MediaPostType;
  /** Current validation errors (empty = all good) */
  errors: MediaValidationError[];
  /** True while async validation is still running */
  validating?: boolean;
  /** Whether any files have been added (determines if we show the "all good" state) */
  hasFiles?: boolean;
  appearance?: "default" | "geist";
}

export default function MediaValidationPanel({
  platforms,
  postType,
  errors,
  validating = false,
  hasFiles = false,
  appearance = "default",
}: Props) {
  const isGeist = appearance === "geist";
  const [requirementsOpen, setRequirementsOpen] = useState(false);

  if (platforms.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* ── Validation status ── */}
      {validating && (
        <div className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5", isGeist ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]" : "border-border-subtle bg-surface-raised")}>
          <Loader2 className={cn("w-3.5 h-3.5 animate-spin flex-shrink-0", isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground")} />
          <span className={cn(isGeist ? "text-copy-12 text-[var(--ds-gray-900)]" : "text-xs text-foreground-muted")}>Checking media against platform requirements…</span>
        </div>
      )}

      {!validating && hasFiles && errors.length > 0 && (
        <div className={cn("overflow-hidden rounded-xl border", isGeist ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)]" : "border-destructive/25 bg-destructive/10")}>
          <div className={cn("flex items-center gap-2 border-b px-3 py-2.5", isGeist ? "border-[var(--ds-red-200)]" : "border-destructive/20")}>
            <AlertCircle className={cn("h-4 w-4 flex-shrink-0", isGeist ? "text-[var(--ds-red-700)]" : "text-destructive")} />
            <p className={cn(isGeist ? "text-copy-12 font-semibold text-[var(--ds-red-700)]" : "text-xs font-bold text-destructive")}>
              {errors.length} media issue{errors.length !== 1 ? "s" : ""} — fix before scheduling
            </p>
          </div>
          <div className="px-3 py-3">
            <ErrorList errors={errors} appearance={appearance} />
          </div>
        </div>
      )}

      {!validating && hasFiles && errors.length === 0 && (
        <div className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5", isGeist ? "border-[var(--ds-green-200)] bg-[var(--ds-green-100)]" : "border-success/25 bg-success/10")}>
          <CheckCircle2 className={cn("h-3.5 w-3.5 flex-shrink-0", isGeist ? "text-[var(--ds-green-700)]" : "text-success")} />
          <span className={cn(isGeist ? "text-copy-12 font-semibold text-[var(--ds-green-700)]" : "text-xs font-semibold text-success")}>
            Media looks good for all selected platforms
          </span>
        </div>
      )}

      {/* ── Collapsible platform requirements reference ── */}
      <div className={cn("overflow-hidden rounded-xl border", isGeist ? "border-[var(--ds-gray-400)]" : "border-border-subtle")}>
        <button
          type="button"
          onClick={() => setRequirementsOpen((v) => !v)}
          className={cn(
            "flex w-full items-center justify-between px-3 py-2.5 transition-colors",
            isGeist
              ? "bg-[var(--ds-gray-100)] hover:bg-[var(--ds-gray-200)]"
              : "bg-surface-raised hover:bg-[hsl(var(--background))]"
          )}
        >
          <div className="flex items-center gap-2">
            <LayoutList className={cn("w-3.5 h-3.5", isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground")} />
            <span className={cn(isGeist ? "text-copy-12 font-semibold text-[var(--ds-gray-900)]" : "text-xs font-semibold text-muted-foreground")}>
              Platform media requirements
            </span>
          </div>
          {requirementsOpen
            ? <ChevronUp className={cn("w-3.5 h-3.5", isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground")} />
            : <ChevronDown className={cn("w-3.5 h-3.5", isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground")} />
          }
        </button>
        {requirementsOpen && (
          <div className={cn("border-t px-3 py-3", isGeist ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]" : "border-border-subtle bg-surface")}>
            <PlatformRequirementsTable platforms={platforms} postType={postType} appearance={appearance} />
          </div>
        )}
      </div>
    </div>
  );
}

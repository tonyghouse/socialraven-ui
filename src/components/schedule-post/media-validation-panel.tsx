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
}: {
  platforms: string[];
  postType: MediaPostType;
}) {
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
              "flex items-start gap-2.5 py-2 border-b border-border/30 last:border-0",
              unsupported ? "opacity-50" : ""
            )}
          >
            {Icon && (
              <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">{name}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                {c.summary}
              </p>
            </div>
            {unsupported && (
              <span className="flex-shrink-0 rounded px-1.5 py-px text-[10px] font-semibold text-warning border border-warning/30 bg-warning/10">
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

function ErrorList({ errors }: { errors: MediaValidationError[] }) {
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
              {Icon && <Icon className="w-3 h-3 text-destructive flex-shrink-0" />}
              <span className="text-xs font-bold text-destructive">{name}</span>
            </div>
            <ul className="space-y-1.5 ml-4">
              {errs.map((err, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 whitespace-nowrap rounded border border-destructive/20 bg-destructive/10 px-1.5 py-px text-[10px] font-semibold text-destructive">
                    {ERROR_LABELS[err.code] ?? err.code}
                  </span>
                  <span className="text-xs leading-relaxed text-destructive">{err.message}</span>
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
}

export default function MediaValidationPanel({
  platforms,
  postType,
  errors,
  validating = false,
  hasFiles = false,
}: Props) {
  const [requirementsOpen, setRequirementsOpen] = useState(false);

  if (platforms.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* ── Validation status ── */}
      {validating && (
        <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-raised px-3 py-2.5">
          <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin flex-shrink-0" />
          <span className="text-xs text-foreground-muted">Checking media against platform requirements…</span>
        </div>
      )}

      {!validating && hasFiles && errors.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-destructive/25 bg-destructive/10">
          <div className="flex items-center gap-2 border-b border-destructive/20 px-3 py-2.5">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
            <p className="text-xs font-bold text-destructive">
              {errors.length} media issue{errors.length !== 1 ? "s" : ""} — fix before scheduling
            </p>
          </div>
          <div className="px-3 py-3">
            <ErrorList errors={errors} />
          </div>
        </div>
      )}

      {!validating && hasFiles && errors.length === 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-success/25 bg-success/10 px-3 py-2.5">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-success" />
          <span className="text-xs font-semibold text-success">
            Media looks good for all selected platforms
          </span>
        </div>
      )}

      {/* ── Collapsible platform requirements reference ── */}
      <div className="overflow-hidden rounded-xl border border-border-subtle">
        <button
          type="button"
          onClick={() => setRequirementsOpen((v) => !v)}
          className="flex w-full items-center justify-between bg-surface-raised px-3 py-2.5 transition-colors hover:bg-[hsl(var(--background))]"
        >
          <div className="flex items-center gap-2">
            <LayoutList className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">
              Platform media requirements
            </span>
          </div>
          {requirementsOpen
            ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          }
        </button>
        {requirementsOpen && (
          <div className="border-t border-border-subtle bg-surface px-3 py-3">
            <PlatformRequirementsTable platforms={platforms} postType={postType} />
          </div>
        )}
      </div>
    </div>
  );
}

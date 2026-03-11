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
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-px flex-shrink-0">
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
              {Icon && <Icon className="w-3 h-3 text-red-500 flex-shrink-0" />}
              <span className="text-xs font-bold text-red-600">{name}</span>
            </div>
            <ul className="space-y-1.5 ml-4">
              {errs.map((err, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[10px] font-semibold text-red-500 bg-red-50 border border-red-100 rounded px-1.5 py-px flex-shrink-0 mt-0.5 whitespace-nowrap">
                    {ERROR_LABELS[err.code] ?? err.code}
                  </span>
                  <span className="text-xs text-red-700 leading-relaxed">{err.message}</span>
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
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/50">
          <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Checking media against platform requirements…</span>
        </div>
      )}

      {!validating && hasFiles && errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/60 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-red-200/60">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs font-bold text-red-700">
              {errors.length} media issue{errors.length !== 1 ? "s" : ""} — fix before scheduling
            </p>
          </div>
          <div className="px-3 py-3">
            <ErrorList errors={errors} />
          </div>
        </div>
      )}

      {!validating && hasFiles && errors.length === 0 && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-emerald-700">
            Media looks good for all selected platforms
          </span>
        </div>
      )}

      {/* ── Collapsible platform requirements reference ── */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setRequirementsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/20 hover:bg-muted/40 transition-colors"
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
          <div className="px-3 py-3 bg-card border-t border-border/40">
            <PlatformRequirementsTable platforms={platforms} postType={postType} />
          </div>
        )}
      </div>
    </div>
  );
}

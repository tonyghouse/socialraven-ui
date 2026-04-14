"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import {
  ArrowLeft,
  AlertCircle,
  Calendar,
  Clock,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  User,
  LayoutGrid,
  Trash2,
  Pencil,
  Loader2,
  Lock,
  Zap,
  Heart,
  MessageCircle,
  ThumbsUp,
  Repeat2,
  Bookmark,
  Send,
  Share2,
  MoreHorizontal,
  Play,
  CloudUpload,
  X,
  Save,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import { deletePostCollectionApi } from "@/service/deletePostCollectionApi";
import { updatePostCollectionApi } from "@/service/updatePostCollectionApi";
import { getPresignedUrl } from "@/service/presignUrl";
import { uploadToS3 } from "@/service/uploadToS3";
import { localToUTC } from "@/lib/timeUtil";
import {
  approvalUpdateSuccessMessage,
  confirmApprovalLockIfNeeded,
} from "@/lib/approval-lock";
import { getCharErrors, PLATFORM_DISPLAY_NAMES, validatePlatformConfigs } from "@/lib/platformLimits";
import {
  validateMediaFiles,
  validateMediaSync,
  getEffectiveMaxFiles,
  getMostRestrictivePlatform,
  MediaValidationError,
} from "@/lib/mediaValidation";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { PostResponse } from "@/model/PostResponse";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import { PlatformConfigs } from "@/model/PostCollection";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { ScheduledPostDetailPageSkeleton } from "@/components/posts/scheduled-post-detail-page-skeleton";
import { getImageUrl } from "@/service/getImageUrl";
import { MediaPreview } from "@/components/generic/media-preview";
import { mapMediaResponseToMedia } from "@/lib/media-mapper";
import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import { AccountSelector } from "@/components/schedule-post/account-selection-sheet";
import MediaUploader from "@/components/schedule-post/media-uploader";
import ScheduleDateTimePicker from "@/components/schedule-post/date-time-picker";
import PlatformCharLimits from "@/components/schedule-post/platform-char-limits";
import MediaValidationPanel from "@/components/schedule-post/media-validation-panel";
import PlatformConfigsPanel from "@/components/schedule-post/platform-configs-panel";
import { ApprovalSafetyPanel } from "@/components/posts/approval-safety-panel";
import { LibraryComposerPanel } from "@/components/workspace-library/library-composer-panel";
import { SelectedLibraryAssets } from "@/components/workspace-library/selected-library-assets";
import type { ComposerLibraryAsset } from "@/lib/workspace-library";
import {
  appendTextBlock,
  applyFirstCommentSnippet,
  buildComposerLibraryAssets,
  buildPseudoFilesFromLibraryAssets,
  dedupeLibraryAssets,
  filterRelevantBundleItems,
  mergePlatformConfigs,
} from "@/lib/workspace-library";
import type { WorkspaceLibraryBundle, WorkspaceLibraryItem } from "@/model/WorkspaceLibrary";

/* ─── Config maps ─────────────────────────────────────────── */

const statusConfig: Record<
  string,
  { label: string; Icon: typeof CheckCircle2; className: string }
> = {
  SCHEDULED: {
    label: "Scheduled",
    Icon: Clock,
    className: "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]",
  },
  PUBLISHED: {
    label: "Completed",
    Icon: CheckCircle2,
    className: "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
  },
  PARTIAL_SUCCESS: {
    label: "Partially Completed",
    Icon: AlertTriangle,
    className: "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]",
  },
  FAILED: {
    label: "Failed",
    Icon: XCircle,
    className: "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
  },
};

const typeConfig: Record<
  string,
  { label: string; Icon: typeof ImageIcon; className: string }
> = {
  IMAGE: {
    label: "Image",
    Icon: ImageIcon,
    className: "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]",
  },
  VIDEO: {
    label: "Video",
    Icon: Video,
    className: "border-[var(--ds-teal-200)] bg-[var(--ds-teal-100)] text-[var(--ds-teal-700)]",
  },
  TEXT: {
    label: "Text",
    Icon: FileText,
    className: "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]",
  },
};

const platformDisplayName: Record<string, string> = {
  INSTAGRAM: "Instagram",
  LINKEDIN: "LinkedIn",
  YOUTUBE: "YouTube",
  FACEBOOK: "Facebook",
  X: "X (Twitter)",
  THREADS: "Threads",
  TIKTOK: "TikTok",
};

const platformIconStyle: Record<string, string> = {
  YOUTUBE:
    "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
  INSTAGRAM:
    "border-[var(--ds-pink-200)] bg-[var(--ds-pink-100)] text-[var(--ds-pink-700)]",
  FACEBOOK:
    "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]",
  LINKEDIN:
    "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]",
  X: "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  THREADS:
    "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  TIKTOK:
    "border-[var(--ds-teal-200)] bg-[var(--ds-teal-100)] text-[var(--ds-teal-700)]",
};

/* Platform-specific accent tokens for the circle cards */
const platformAccent: Record<
  string,
  {
    bar: string;
    cardBg: string;
    cardBorder: string;
    iconClass: string;
  }
> = {
  INSTAGRAM: {
    bar: "linear-gradient(90deg,var(--ds-amber-600) 0%,var(--ds-pink-700) 50%,var(--ds-plum-700) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-pink-200)] bg-[var(--ds-pink-100)] text-[var(--ds-pink-700)]",
  },
  X: {
    bar: "linear-gradient(90deg,var(--ds-gray-900) 0%,var(--ds-gray-1000) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  },
  LINKEDIN: {
    bar: "linear-gradient(90deg,var(--ds-plum-700) 0%,hsl(var(--accent)) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]",
  },
  YOUTUBE: {
    bar: "linear-gradient(90deg,var(--ds-red-700) 0%,var(--ds-red-600) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
  },
  FACEBOOK: {
    bar: "linear-gradient(90deg,var(--ds-plum-700) 0%,var(--ds-plum-500) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]",
  },
  TIKTOK: {
    bar: "linear-gradient(90deg,var(--ds-gray-1000) 0%,var(--ds-red-600) 55%,var(--ds-teal-600) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-teal-200)] bg-[var(--ds-teal-100)] text-[var(--ds-teal-700)]",
  },
  THREADS: {
    bar: "linear-gradient(90deg,var(--ds-gray-900) 0%,var(--ds-gray-1000) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  },
};

const platformAccentFallback = {
  bar: "linear-gradient(90deg,#6b7280,#9ca3af)",
  cardBg: "bg-[var(--ds-background-100)]",
  cardBorder: "border-[var(--ds-gray-400)]",
  iconClass: "bg-[var(--ds-gray-100)] border-[var(--ds-gray-400)] text-[var(--ds-gray-900)]",
};

/* Platform badge styles for edit mode header */
const PLATFORM_BADGE_STYLES: Record<string, string> = {
  facebook: "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]",
  instagram: "border-[var(--ds-pink-200)] bg-[var(--ds-pink-100)] text-[var(--ds-pink-700)]",
  x: "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  linkedin: "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]",
  youtube: "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
  threads: "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  tiktok: "border-[var(--ds-teal-200)] bg-[var(--ds-teal-100)] text-[var(--ds-teal-700)]",
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  threads: "Threads",
  tiktok: "TikTok",
};

const pageClassName = "min-h-screen bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)]";
const surfaceClassName =
  "overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm";
const surfaceHeaderClassName =
  "flex items-center gap-2.5 border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-3.5";
const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";

const ActionButton = React.forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: "primary" | "secondary" | "danger";
    compact?: boolean;
    iconOnly?: boolean;
    fullWidth?: boolean;
  }
>(function ActionButton(
  {
    tone = "secondary",
    compact = false,
    iconOnly = false,
    fullWidth = false,
    className,
    children,
    type = "button",
    ...props
  },
  ref
) {
  const toneClassName =
    tone === "primary"
      ? "border-transparent bg-[hsl(var(--accent))] !text-white hover:bg-[hsl(var(--accent-hover))]"
      : tone === "danger"
        ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)] hover:border-[var(--ds-red-300)] hover:bg-[var(--ds-red-200)]"
        : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";

  const sizeClassName = iconOnly
    ? compact
      ? "h-8 w-8 px-0"
      : "h-9 w-9 px-0"
    : compact
      ? "h-8 px-3 text-copy-12"
      : "h-9 px-3.5 text-label-14";

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border transition-colors disabled:pointer-events-none disabled:opacity-50",
        toneClassName,
        sizeClassName,
        focusRingClassName,
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

function ToneBadge({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span className={cn("inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-1 text-label-12", className)}>
      {children}
    </span>
  );
}

function InlinePill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-2 text-copy-12 text-[var(--ds-gray-900)]",
        className
      )}
    >
      {children}
    </span>
  );
}

function Notice({
  title,
  variant = "info",
  children,
}: {
  title: ReactNode;
  variant?: "info" | "warning" | "error";
  children: ReactNode;
}) {
  const variantClassName =
    variant === "warning"
      ? "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]"
      : variant === "error"
        ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]"
        : "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]";

  return (
    <div className={cn("rounded-xl border p-4 shadow-sm", variantClassName)}>
      <div className="space-y-1">
        <p className="text-label-14">{title}</p>
        <div className="text-label-14 leading-6">{children}</div>
      </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────── */

function getCountdown(target: Date): string | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/* ─── Helper functions ────────────────────────────────────── */

function toLocalDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function toLocalTimeString(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

/* ─── StepCard (accordion) ────────────────────────────────── */

function StepCard({
  step,
  title,
  description,
  children,
  complete = false,
  locked = false,
  isOpen,
  onToggle,
  summary,
}: {
  step: number;
  title: string;
  description: string;
  children: ReactNode;
  complete?: boolean;
  locked?: boolean;
  isOpen: boolean;
  onToggle?: () => void;
  summary?: ReactNode;
}) {
  const canToggle = !!onToggle && !locked;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-[var(--ds-background-100)] shadow-sm transition-colors",
        locked
          ? "border-[var(--ds-gray-400)] opacity-60"
          : complete && isOpen
            ? "border-[var(--ds-plum-300)]"
            : complete
              ? "border-[var(--ds-plum-200)]"
              : "border-[var(--ds-gray-400)]",
      )}
    >
      <button
        type="button"
        disabled={!canToggle}
        onClick={canToggle ? onToggle : undefined}
        className={cn(
          "flex w-full items-center gap-4 border-b px-6 py-4 text-left transition-colors",
          "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]",
          canToggle
            ? cn("cursor-pointer hover:bg-[var(--ds-gray-200)]", focusRingClassName)
            : "cursor-default",
        )}
      >
        <div
          className={cn(
            "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border text-copy-12 transition-colors",
            complete
              ? "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
              : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)]",
          )}
        >
          {complete
            ? <CheckCircle2 className="h-4 w-4" />
            : <span>{step}</span>
          }
        </div>

        <div className="flex-1 min-w-0">
          {!isOpen && complete && summary ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-copy-12 text-[var(--ds-gray-900)]">{title}</span>
              <span className="text-[var(--ds-gray-700)]">·</span>
              {summary}
            </div>
          ) : (
            <>
              <h2 className="text-label-14 text-[var(--ds-gray-1000)]">{title}</h2>
              <p className="mt-0.5 text-copy-12 leading-5 text-[var(--ds-gray-900)]">{description}</p>
            </>
          )}
        </div>

        {canToggle && (
          <div className="flex shrink-0 items-center gap-1.5 text-[var(--ds-gray-900)]">
            {!isOpen && (
              <span className="hidden items-center gap-1 rounded-full border border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] px-2 py-0.5 text-copy-12 text-[var(--ds-plum-700)] sm:flex">
                <Pencil className="h-2.5 w-2.5" />
                Edit
              </span>
            )}
            {isOpen
              ? <ChevronUp className="h-4 w-4" />
              : <ChevronDown className="h-4 w-4" />
            }
          </div>
        )}
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[624.9375rem] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ─── ContinueBtn ─────────────────────────────────────────── */

function ContinueBtn({ onClick, disabled = false, label = "Continue" }: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <div className="mt-4 flex justify-end">
      <ActionButton
        onClick={onClick}
        disabled={disabled}
        tone="primary"
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5" />
      </ActionButton>
    </div>
  );
}

/* ─── Delete Confirmation Modal ───────────────────────────── */

interface DeleteModalProps {
  collection: PostCollectionResponse;
  groupedPosts: Record<string, PostResponse[]>;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteModal({
  collection,
  groupedPosts,
  onCancel,
  onConfirm,
  isDeleting,
}: DeleteModalProps) {
  const scheduledDate = new Date(collection.scheduledTime ?? "");
  const [typed, setTyped] = useState("");
  const confirmWord = "DELETE";
  const canDelete = typed === confirmWord;

  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-[0_0.5rem_1.5rem_rgb(0_0_0_/_0.16)] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--ds-red-200)] bg-[var(--ds-red-100)]">
              <Trash2 className="h-5 w-5 text-[var(--ds-red-700)]" />
            </div>
            <div>
              <h2
                id="delete-modal-title"
                className="text-title-16 text-[var(--ds-gray-1000)]"
              >
                Delete this collection?
              </h2>
            </div>
          </div>

          <div className="mb-5">
            <Notice title="This action cannot be undone." variant="error">
              This will permanently remove the scheduled collection and its posts.
            </Notice>
          </div>

          <div className="mb-5 space-y-3 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4">
            <div>
              <p className="mb-1 text-copy-12 text-[var(--ds-gray-900)]">
                Collection
              </p>
              <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">
                {collection.description}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-[var(--ds-gray-900)]" />
              <p className="text-copy-12 text-[var(--ds-gray-900)]">
                {scheduledDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                ·{" "}
                {scheduledDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>

            {/* Platform + account breakdown */}
            <div className="space-y-1.5">
              {Object.entries(groupedPosts).map(([platform, posts]) => {
                const Icon = PLATFORM_ICONS[platform];
                return (
                  <div key={platform} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border",
                        platformIconStyle[platform] ??
                          "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)]"
                      )}
                    >
                      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                    </span>
                    <span className="text-copy-12 text-[var(--ds-gray-1000)]">
                      {platformDisplayName[platform] ?? platform}
                    </span>
                    <span className="ml-auto text-copy-12 text-[var(--ds-gray-900)]">
                      {posts.length} account{posts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 border-t border-[var(--ds-gray-400)] pt-1">
              <span className="text-copy-12 text-[var(--ds-gray-900)]">
                <span className="font-medium tabular-nums text-[var(--ds-gray-1000)]">
                  {collection.posts.length}
                </span>{" "}
                post{collection.posts.length !== 1 ? "s" : ""} across{" "}
                <span className="font-medium tabular-nums text-[var(--ds-gray-1000)]">
                  {Object.keys(groupedPosts).length}
                </span>{" "}
                platform{Object.keys(groupedPosts).length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Type to confirm */}
          <div className="mb-5">
            <label
              htmlFor="delete-confirm-input"
              className="mb-2 block text-copy-12 text-[var(--ds-gray-900)]"
            >
              Type{" "}
              <span className="font-mono font-bold text-[var(--ds-red-700)]">
                {confirmWord}
              </span>{" "}
              to confirm
            </label>
            <input
              id="delete-confirm-input"
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value.toUpperCase())}
              placeholder={confirmWord}
              className="w-full rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3.5 py-2.5 text-label-14 font-mono text-[var(--ds-gray-1000)] placeholder:text-[var(--ds-gray-900)] focus:border-[var(--ds-red-300)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-red-300)]"
            />
          </div>

          <div className="flex gap-2.5">
            <ActionButton
              ref={cancelRef}
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </ActionButton>
            <ActionButton
              onClick={onConfirm}
              disabled={!canDelete || isDeleting}
              tone="danger"
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete forever
                </>
              )}
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */

export default function ScheduledCollectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getToken, isLoaded } = useAuth();
  const { isAgency } = usePlan();
  const collectionId = params.id as string;

  const [collection, setCollection] =
    useState<PostCollectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Edit mode ── */
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  /* ── Modal states ── */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ── Toast state (for delete errors) ── */
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  /* ── Load collection ── */
  useEffect(() => {
    if (!collectionId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPostCollectionByIdApi(getToken, collectionId);
        if (
          data.overallStatus === "DRAFT" ||
          data.overallStatus === "IN_REVIEW" ||
          data.overallStatus === "CHANGES_REQUESTED" ||
          data.overallStatus === "APPROVED"
        ) {
          router.replace(`/drafts/${collectionId}`);
          return;
        }
        setCollection(data);
        // Pre-populate selected account IDs from existing posts
        const ids = [
          ...new Set(
            data.posts
              .map((p) => p.connectedAccount?.providerUserId)
              .filter((id): id is string => Boolean(id))
          ),
        ];
        setSelectedAccountIds(ids);
      } catch {
        setError("Unable to load this collection.");
      } finally {
        setLoading(false);
      }
    })();
  }, [collectionId, getToken, router]);

  /* ── Load accounts (needed for edit mode) ── */
  useEffect(() => {
    if (!isLoaded) return;
    (async () => {
      try {
        setAccountsLoading(true);
        const accounts = await fetchAllConnectedAccountsApi(getToken);
        setConnectedAccounts(accounts);
      } catch {
        /* Non-critical — only needed for edit mode */
      } finally {
        setAccountsLoading(false);
      }
    })();
  }, [getToken, isLoaded]);

  /* ── Auto-dismiss toast ── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePostCollectionApi(getToken, collectionId);
      router.push("/scheduled-posts");
    } catch {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setToast({
        type: "error",
        message: "Failed to delete. Please try again.",
      });
    }
  };

  function enterEditMode() {
    setMode("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function exitEditMode() {
    setMode("view");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEditSuccess(updated: PostCollectionResponse) {
    if (
      updated.overallStatus === "DRAFT" ||
      updated.overallStatus === "IN_REVIEW" ||
      updated.overallStatus === "CHANGES_REQUESTED" ||
      updated.overallStatus === "APPROVED"
    ) {
      router.push(`/drafts/${updated.id}`);
      return;
    }
    setCollection(updated);
    // Re-sync selected IDs from the updated collection's posts
    const ids = [
      ...new Set(
        updated.posts
          .map((p) => p.connectedAccount?.providerUserId)
          .filter((id): id is string => Boolean(id))
      ),
    ];
    setSelectedAccountIds(ids);
    exitEditMode();
  }

  /* ── Loading / error states ── */
  if (loading) {
    return <ScheduledPostDetailPageSkeleton />;
  }

  if (error || !collection) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ds-background-200)] p-6">
        <div className="w-full max-w-md rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-6 shadow-sm">
          <Notice title="Collection not found" variant="error">
            <div className="mt-3">
              <ActionButton tone="primary" onClick={() => router.push("/scheduled-posts")}>
                Back to Scheduled Posts
              </ActionButton>
            </div>
          </Notice>
        </div>
      </div>
    );
  }

  /* ── Derived values ── */
  const scheduledDate = new Date(collection.scheduledTime ?? "");
  const status = statusConfig[collection.overallStatus] ?? statusConfig.SCHEDULED;
  const type = typeConfig[collection.postCollectionType] ?? typeConfig.TEXT;
  const StatusIcon = status.Icon;
  const TypeIcon = type.Icon;
  const isScheduled = collection.overallStatus === "SCHEDULED";
  const recoveryBadge = collection.failureState === "RECOVERED"
    ? {
        label: "Recovered",
        className:
          "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
      }
    : null;
  const canOpenChannelRecovery = collection.overallStatus === "PARTIAL_SUCCESS"
    && (collection.failedChannelCount ?? 0) > 0
    && collection.failureState === "RECOVERY_REQUIRED"
    && !collection.recoveryCollectionId;

  // Group posts by platform
  const groupedPosts = collection.posts.reduce<Record<string, PostResponse[]>>(
    (acc, post) => {
      const key = post.provider;
      if (!acc[key]) acc[key] = [];
      acc[key].push(post);
      return acc;
    },
    {}
  );

  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const platformCount = Object.keys(groupedPosts).length;

  const captionText =
    collection.posts[0]?.description?.trim() ||
    collection.description?.trim() ||
    "";

  const allMedia = collection.media.map((m) => ({
    url: m.fileUrl,
    mimeType: m.mimeType,
  }));

  return (
    <main className={pageClassName}>
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2.5 rounded-xl border px-4 py-3 text-label-14 shadow-lg animate-in slide-in-from-bottom-3 duration-300",
            toast.type === "success"
              ? "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]"
              : "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {showDeleteModal && (
        <DeleteModal
          collection={collection}
          groupedPosts={groupedPosts}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}

      {/* ══════════════════════════════════════════════
          EDIT MODE
      ══════════════════════════════════════════════ */}
      {mode === "edit" && (
        <EditModePanel
          collection={collection}
          connectedAccounts={connectedAccounts}
          accountsLoading={accountsLoading}
          selectedAccountIds={selectedAccountIds}
          setSelectedAccountIds={setSelectedAccountIds}
          onSuccess={handleEditSuccess}
          onCancel={exitEditMode}
        />
      )}

      {/* ══════════════════════════════════════════════
          VIEW MODE
      ══════════════════════════════════════════════ */}
      {mode === "view" && (
        <>
          <ProtectedPageHeader
            title={collection.description}
            description="Scheduled post details."
            icon={<Layers className="h-4 w-4" />}
            className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95"
            actions={
              <>
                {isScheduled && (
                  <div className="hidden sm:block">
                    <ActionButton onClick={enterEditMode}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </ActionButton>
                  </div>
                )}

                <div className="hidden sm:block">
                  <ActionButton tone="danger" onClick={() => setShowDeleteModal(true)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </ActionButton>
                </div>

                <div className="hidden sm:block">
                  <ActionButton tone="primary" onClick={() => router.push("/schedule-post")}>
                    <Plus className="h-3.5 w-3.5" />
                    New Post
                  </ActionButton>
                </div>
              </>
            }
          />

          <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-3 sm:px-5">
            <nav className="flex min-w-0 items-center gap-1.5 text-label-14">
              <button
                onClick={() => router.push("/scheduled-posts")}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]",
                  focusRingClassName
                )}
              >
                <Layers className="h-3.5 w-3.5" />
                <span className="hidden font-medium sm:inline">Scheduled Posts</span>
              </button>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--ds-gray-700)]" />
              <span className="truncate text-label-14 text-[var(--ds-gray-1000)]">
                {collection.description}
              </span>
            </nav>
          </div>

          <div className="space-y-4 px-4 py-5 pb-24 sm:px-5 sm:pb-8">
            <div className={surfaceClassName}>
              <div className="h-[0.1875rem] w-full bg-[hsl(var(--accent))]" />
              <div className="px-5 pt-5 pb-4">
                <div className="mb-4 flex flex-wrap items-start gap-x-4 gap-y-3">
                  <h1 className="min-w-0 flex-1 text-title-20 text-[var(--ds-gray-1000)]">
                    {collection.description}
                  </h1>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <ToneBadge className={type.className}>
                      <TypeIcon className="h-3.5 w-3.5" />
                      {type.label}
                    </ToneBadge>
                    <ToneBadge className={status.className}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </ToneBadge>
                    {recoveryBadge && (
                      <ToneBadge className={recoveryBadge.className}>
                        {recoveryBadge.label}
                      </ToneBadge>
                    )}
                    <div className="flex items-center gap-1.5 sm:hidden">
                      {isScheduled && (
                        <ActionButton compact iconOnly onClick={enterEditMode} aria-label="Edit collection">
                          <Pencil className="h-3.5 w-3.5" />
                        </ActionButton>
                      )}
                      <ActionButton compact iconOnly tone="danger" onClick={() => setShowDeleteModal(true)} aria-label="Delete collection">
                        <Trash2 className="h-3.5 w-3.5" />
                      </ActionButton>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <InlinePill>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formattedDate} · {formattedTime}</span>
                  </InlinePill>
                  <InlinePill>{collection.posts.length} post{collection.posts.length !== 1 ? "s" : ""}</InlinePill>
                  <InlinePill>{platformCount} platform{platformCount !== 1 ? "s" : ""}</InlinePill>
                  {canOpenChannelRecovery && (
                    <ActionButton compact tone="primary" onClick={() => router.push(`/recovery-drafts/${collection.id}`)}>
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Recover Failed Channels
                    </ActionButton>
                  )}
                  <div className="flex items-center gap-1.5">
                    {Object.keys(groupedPosts).map((plat) => {
                      const platUpper = plat.toUpperCase();
                      const PlatIcon = PLATFORM_ICONS[plat] ?? PLATFORM_ICONS[plat.toLowerCase()];
                      return (
                        <div
                          key={plat}
                          title={platformDisplayName[platUpper] ?? plat}
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                            platformIconStyle[platUpper] ?? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                          )}
                        >
                          {PlatIcon ? <PlatIcon className="h-3.5 w-3.5" /> : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {captionText && (
                  <div className="mt-4 border-t border-[var(--ds-gray-400)] pt-4">
                    <p className="whitespace-pre-wrap text-label-14 leading-6 text-[var(--ds-gray-900)]">
                      {captionText}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {canOpenChannelRecovery && (
              <Notice title="Failed channels still need attention" variant="warning">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p>
                    {collection.failedChannelCount} channel{collection.failedChannelCount === 1 ? "" : "s"} did not publish successfully. Create a recovery draft to correct and reschedule only those failed channels.
                  </p>
                  <ActionButton compact tone="primary" onClick={() => router.push(`/recovery-drafts/${collection.id}`)}>
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Open Channel Recovery
                  </ActionButton>
                </div>
              </Notice>
            )}

            {isAgency ? (
              <ApprovalSafetyPanel collection={collection} appearance="geist" />
            ) : null}

            <div className="grid items-start gap-4 lg:grid-cols-[17.5rem_minmax(0,1fr)]">
              <div className="space-y-4">
                <div className={surfaceClassName}>
                  <div className={surfaceHeaderClassName}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)]">
                      <Calendar className="h-4 w-4 text-[var(--ds-plum-700)]" />
                    </div>
                    <p className="flex-1 text-label-14 text-[var(--ds-gray-1000)]">Schedule</p>
                    {isScheduled && (
                      <ActionButton compact iconOnly onClick={enterEditMode} aria-label="Edit schedule">
                        <Pencil className="h-3.5 w-3.5" />
                      </ActionButton>
                    )}
                  </div>
                  <div className="space-y-4 p-5">
                    {isScheduled && getCountdown(scheduledDate) && (
                      <div className="rounded-xl border border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] px-4 py-4">
                        <p className="text-copy-12 text-[var(--ds-plum-700)]">Publishing in</p>
                        <p className="mt-1 text-[1.625rem] font-bold leading-8 tabular-nums text-[var(--ds-plum-700)]">{getCountdown(scheduledDate)}</p>
                      </div>
                    )}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 text-label-14">
                        <Calendar className="h-4 w-4 shrink-0 text-[var(--ds-gray-900)]" />
                        <span className="text-[var(--ds-gray-1000)]">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-label-14">
                        <Clock className="h-4 w-4 shrink-0 text-[var(--ds-gray-900)]" />
                        <span className="text-[var(--ds-gray-1000)]">{formattedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={surfaceClassName}>
                  <div className={surfaceHeaderClassName}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                      <FileText className="h-4 w-4 text-[var(--ds-gray-900)]" />
                    </div>
                    <p className="flex-1 text-label-14 text-[var(--ds-gray-1000)]">Caption</p>
                    {isScheduled && (
                      <ActionButton compact iconOnly onClick={enterEditMode} aria-label="Edit caption">
                        <Pencil className="h-3.5 w-3.5" />
                      </ActionButton>
                    )}
                  </div>
                  <div className="p-5">
                    {captionText ? (
                      <p className="line-clamp-10 whitespace-pre-wrap text-label-14 leading-6 text-[var(--ds-gray-1000)]">{captionText}</p>
                    ) : (
                      <p className="text-copy-12 italic text-[var(--ds-gray-900)]">No caption</p>
                    )}
                    {captionText && (
                      <p className="mt-3 text-copy-12 tabular-nums text-[var(--ds-gray-900)]">{captionText.length} characters</p>
                    )}
                  </div>
                </div>

                {/* Media carousel */}
                {collection.media.length > 0 && (
                  <div className={surfaceClassName}>
                    <div className={surfaceHeaderClassName}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                        <ImageIcon className="h-4 w-4 text-[var(--ds-gray-900)]" />
                      </div>
                      <p className="flex-1 text-label-14 text-[var(--ds-gray-1000)]">
                        Media <span className="font-normal text-[var(--ds-gray-900)]">· {collection.media.length}</span>
                      </p>
                      {isScheduled && collection.postCollectionType !== "TEXT" && (
                        <ActionButton compact iconOnly onClick={enterEditMode} aria-label="Edit media">
                          <Pencil className="h-3.5 w-3.5" />
                        </ActionButton>
                      )}
                    </div>
                    <div className="p-4">
                      <MediaCarousel media={collection.media} />
                    </div>
                  </div>
                )}

                <div className={surfaceClassName}>
                  <div className="flex items-center divide-x divide-[var(--ds-gray-400)] px-5 py-4">
                    <div className="flex-1 pr-4 text-center">
                      <p className="text-[1.5rem] font-semibold leading-none tabular-nums text-[var(--ds-gray-1000)]">{collection.posts.length}</p>
                      <p className="mt-1.5 text-copy-12 text-[var(--ds-gray-900)]">Posts</p>
                    </div>
                    <div className="flex-1 pl-4 text-center">
                      <p className="text-[1.5rem] font-semibold leading-none tabular-nums text-[var(--ds-gray-1000)]">{platformCount}</p>
                      <p className="mt-1.5 text-copy-12 text-[var(--ds-gray-900)]">Platforms</p>
                    </div>
                  </div>
                  <div className="space-y-3 border-t border-[var(--ds-gray-400)] px-5 pt-4 pb-4">
                    {Object.entries(groupedPosts).map(([plat, platPosts]) => {
                      const platUpper = plat.toUpperCase();
                      const PlatIcon = PLATFORM_ICONS[plat] ?? PLATFORM_ICONS[plat.toLowerCase()];
                      return (
                        <div key={plat} className="flex items-center gap-2.5">
                          <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border", platformIconStyle[platUpper] ?? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]")}>
                            {PlatIcon ? <PlatIcon className="h-3.5 w-3.5" /> : null}
                          </div>
                          <span className="flex-1 truncate text-label-14 text-[var(--ds-gray-1000)]">{platformDisplayName[platUpper] ?? plat}</span>
                          <span className="text-copy-12 tabular-nums text-[var(--ds-gray-900)]">{platPosts.length} acct{platPosts.length !== 1 ? "s" : ""}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-4">
                {collection.posts.length === 0 ? (
                  <Notice title="No posts in this collection">
                    Add posts to this collection to preview them here by platform.
                  </Notice>
                ) : (
                  Object.entries(groupedPosts).map(([platform, posts]) => (
                    <PlatformSection
                      key={platform}
                      platform={platform}
                      posts={posts}
                      caption={captionText}
                      media={allMedia}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:hidden">
              {isScheduled && (
                <ActionButton fullWidth onClick={enterEditMode}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </ActionButton>
              )}
              <ActionButton fullWidth tone="danger" onClick={() => setShowDeleteModal(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </ActionButton>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

/* ─── EditModePanel ───────────────────────────────────────── */

function EditModePanel({
  collection,
  connectedAccounts,
  accountsLoading,
  selectedAccountIds,
  setSelectedAccountIds,
  onSuccess,
  onCancel,
}: {
  collection: PostCollectionResponse;
  connectedAccounts: ConnectedAccount[];
  accountsLoading: boolean;
  selectedAccountIds: string[];
  setSelectedAccountIds: React.Dispatch<React.SetStateAction<string[]>>;
  onSuccess: (updated: PostCollectionResponse) => void;
  onCancel: () => void;
}) {
  const { getToken } = useAuth();
  const { isAgency } = usePlan();

  /* ── Form state ── */
  const [description, setDescription]         = useState("");
  const [keepMediaKeys, setKeepMediaKeys]     = useState<string[]>([]);
  const [newFiles, setNewFiles]               = useState<File[]>([]);
  const [selectedLibraryAssets, setSelectedLibraryAssets] = useState<ComposerLibraryAsset[]>([]);
  const [date, setDate]                       = useState("");
  const [time, setTime]                       = useState("");
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfigs>({});

  /* ── Submission state ── */
  const [saving, setSaving]                   = useState(false);
  const [showErrors, setShowErrors]           = useState(false);
  const [mediaErrors, setMediaErrors]         = useState<MediaValidationError[]>([]);
  const [validatingMedia, setValidatingMedia] = useState(false);

  /* ── Accordion state ── */
  const [activeStep, setActiveStep]   = useState(2);
  const [reachedStep, setReachedStep] = useState(2);

  function goToStep(n: number) {
    setActiveStep(n);
    setReachedStep((prev) => Math.max(prev, n));
  }

  function toggleStep(n: number) {
    setActiveStep((prev) => (prev === n ? -1 : n));
  }

  /* ── Initialize from collection ── */
  useEffect(() => {
    const scheduledDate = collection.scheduledTime ? new Date(collection.scheduledTime) : null;
    setDescription(collection.description ?? "");
    setDate(scheduledDate ? toLocalDateString(scheduledDate) : "");
    setTime(scheduledDate ? toLocalTimeString(scheduledDate) : "");
    setPlatformConfigs((collection.platformConfigs ?? {}) as PlatformConfigs);
    setKeepMediaKeys(collection.media.map((m) => m.fileKey));
    setNewFiles([]);
    setSelectedLibraryAssets([]);
    setShowErrors(false);
    setMediaErrors([]);
    setActiveStep(2);
    setReachedStep(2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection.id]);

  /* ── Derived values ── */
  const selectedAccounts = useMemo(
    () => connectedAccounts.filter((a) => selectedAccountIds.includes(a.providerUserId)),
    [connectedAccounts, selectedAccountIds],
  );

  const selectedPlatforms = useMemo(
    () => [...new Set(selectedAccounts.map((a) => a.platform.toLowerCase()))],
    [selectedAccounts],
  );

  const postType = collection.postCollectionType;
  const isScheduled = collection.overallStatus === "SCHEDULED";

  const MAX_CHARS = postType === "VIDEO" ? 5000 : 2200;
  const charCount = description.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;
  const overLimit = charCount > MAX_CHARS;
  const platformCharErrors = getCharErrors(selectedPlatforms, charCount);
  const hasAnyCharError = overLimit || platformCharErrors.length > 0;

  const effectiveMaxFiles = useMemo(
    () => postType !== "TEXT" ? getEffectiveMaxFiles(selectedPlatforms, postType as "IMAGE" | "VIDEO") : 0,
    [selectedPlatforms, postType],
  );
  const restrictivePlatform = useMemo(
    () => postType !== "TEXT" ? getMostRestrictivePlatform(selectedPlatforms, postType as "IMAGE" | "VIDEO") : null,
    [selectedPlatforms, postType],
  );
  const restrictivePlatformLabel = restrictivePlatform
    ? (PLATFORM_DISPLAY_NAMES[restrictivePlatform] ?? restrictivePlatform)
    : undefined;

  const keptMedia = collection.media.filter((m) => keepMediaKeys.includes(m.fileKey));
  const keptCount = keptMedia.length;
  const slotsForNew = Math.max(0, effectiveMaxFiles - keptCount - selectedLibraryAssets.length);
  const pseudoLibraryFiles = useMemo(
    () => buildPseudoFilesFromLibraryAssets(selectedLibraryAssets),
    [selectedLibraryAssets],
  );
  const hasMedia = keptCount + newFiles.length + selectedLibraryAssets.length > 0;

  const syncMediaErrors = useMemo(
    () =>
      postType !== "TEXT"
        ? validateMediaSync(
            [...newFiles, ...pseudoLibraryFiles],
            selectedPlatforms,
            postType as "IMAGE" | "VIDEO"
          )
        : [],
    [newFiles, pseudoLibraryFiles, selectedPlatforms, postType],
  );

  useEffect(() => {
    if (postType === "TEXT" || newFiles.length === 0 || selectedPlatforms.length === 0) {
      setMediaErrors([]); setValidatingMedia(false); return;
    }
    setValidatingMedia(true);
    validateMediaFiles(newFiles, selectedPlatforms, postType as "IMAGE" | "VIDEO")
      .then(({ errors }) => setMediaErrors(errors))
      .catch(() => setMediaErrors([]))
      .finally(() => setValidatingMedia(false));
  }, [newFiles, postType, selectedPlatforms]);

  const allMediaErrors = mediaErrors.length > 0 ? mediaErrors : syncMediaErrors;

  const step3Complete = description.trim().length > 0 && (postType === "TEXT" || hasMedia);

  /* ── Summaries ── */
  const selectedPlatformKeys = [...new Set(
    connectedAccounts
      .filter((a) => selectedAccountIds.includes(a.providerUserId))
      .map((a) => a.platform.toLowerCase()),
  )];

  const editType = typeConfig[postType] ?? typeConfig.TEXT;
  const EditTypeIcon = editType.Icon;

  const step1Summary = (
    <span className="flex items-center gap-1.5 text-label-14 text-[var(--ds-gray-1000)]">
      <EditTypeIcon className="h-3.5 w-3.5 text-[var(--ds-plum-700)]" />
      {editType.label}
    </span>
  );

  const step2Summary = (
    <span className="flex items-center gap-2 flex-wrap">
      <span className="text-label-14 text-[var(--ds-plum-700)]">{selectedAccountIds.length}</span>
      <span className="text-copy-12 leading-5 text-[var(--ds-gray-900)]">{selectedAccountIds.length === 1 ? "account" : "accounts"}</span>
      {selectedPlatformKeys.slice(0, 3).map((p) => (
        <span key={p} className={cn("rounded-full border px-1.5 py-0.5 text-copy-12", PLATFORM_BADGE_STYLES[p] ?? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]")}>
          {PLATFORM_LABELS[p] ?? p}
        </span>
      ))}
      {selectedPlatformKeys.length > 3 && (
        <span className="text-copy-12 leading-5 text-[var(--ds-gray-900)]">+{selectedPlatformKeys.length - 3}</span>
      )}
    </span>
  );

  const step3Summary = (
    <span className="flex items-center gap-2 text-label-14 text-[var(--ds-gray-1000)]">
      <span className="font-medium truncate max-w-[10rem] sm:max-w-[16.25rem]">
        {description.trim().slice(0, 60)}{description.trim().length > 60 ? "…" : ""}
      </span>
      {postType !== "TEXT" && (keptCount + newFiles.length + selectedLibraryAssets.length) > 0 && (
        <span className="shrink-0 text-copy-12 text-[var(--ds-gray-900)]">
          · {keptCount + newFiles.length + selectedLibraryAssets.length} {postType === "IMAGE" ? "image" : "video"}{(keptCount + newFiles.length + selectedLibraryAssets.length) !== 1 ? "s" : ""}
        </span>
      )}
    </span>
  );

  const step4Summary = date && time ? (
    <span className="text-label-14 text-[var(--ds-gray-1000)]">
      {new Date(`${date}T${time}`).toLocaleString(undefined, {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })}
    </span>
  ) : null;

  function applyLibrarySnippet(item: WorkspaceLibraryItem) {
    if (!item.body?.trim()) {
      toast.error("This snippet does not contain any content.");
      return;
    }

    if (item.snippetTarget === "FIRST_COMMENT") {
      const result = applyFirstCommentSnippet(platformConfigs, selectedPlatforms, item.body);
      if (result.appliedPlatforms.length === 0) {
        toast.error("Select Facebook or Instagram accounts before applying a first-comment snippet.");
        return;
      }
      setPlatformConfigs(result.platformConfigs);
      toast.success(`Applied "${item.name}" to first comments.`);
      return;
    }

    setDescription((current) => appendTextBlock(current, item.body));
    toast.success(`Applied snippet "${item.name}".`);
  }

  function applyLibraryTemplate(item: WorkspaceLibraryItem) {
    if (item.postCollectionType !== postType) {
      toast.error(`"${item.name}" does not match this collection's content type.`);
      return false;
    }

    if (
      item.body?.trim() &&
      description.trim() &&
      description.trim() !== item.body.trim() &&
      !window.confirm("Replace the current caption with this template's body content?")
    ) {
      return false;
    }

    if (item.body?.trim()) {
      setDescription(item.body.trim());
    }
    setPlatformConfigs((current) => mergePlatformConfigs(current, item.platformConfigs));
    toast.success(`Applied template "${item.name}".`);
    return true;
  }

  function applyLibraryAssets(item: WorkspaceLibraryItem) {
    const assets = buildComposerLibraryAssets(item);
    if (assets.length === 0) {
      toast.error("This asset does not contain reusable media.");
      return;
    }
    setSelectedLibraryAssets((current) => dedupeLibraryAssets(current, assets));
    toast.success(`Added ${assets.length} reusable asset${assets.length === 1 ? "" : "s"} from "${item.name}".`);
  }

  async function handleApplyLibraryItem(item: WorkspaceLibraryItem) {
    if (item.itemType === "SNIPPET") {
      applyLibrarySnippet(item);
      return;
    }
    if (item.itemType === "TEMPLATE") {
      applyLibraryTemplate(item);
      return;
    }
    applyLibraryAssets(item);
  }

  async function handleApplyLibraryBundle(bundle: WorkspaceLibraryBundle) {
    const relevantItems = filterRelevantBundleItems(bundle, postType as "IMAGE" | "VIDEO" | "TEXT");
    if (relevantItems.length === 0) {
      toast.error("This bundle does not contain usable items for this collection.");
      return;
    }

    let appliedCount = 0;
    let templateApplied = false;
    for (const item of relevantItems) {
      if (item.itemType === "TEMPLATE") {
        if (templateApplied) {
          continue;
        }
        if (applyLibraryTemplate(item)) {
          templateApplied = true;
          appliedCount += 1;
        }
        continue;
      }
      if (item.itemType === "SNIPPET") {
        applyLibrarySnippet(item);
        appliedCount += 1;
        continue;
      }
      applyLibraryAssets(item);
      appliedCount += 1;
    }

    if (appliedCount > 0) {
      toast.success(`Applied ${appliedCount} bundle item${appliedCount === 1 ? "" : "s"} from "${bundle.name}".`);
    }
  }

  /* ── Save ── */
  async function save() {
    setShowErrors(true);
    if (!description.trim()) { toast.error("Please write a caption"); return; }
    if (postType !== "TEXT" && !hasMedia) { toast.error("Please keep, upload, or attach at least one file"); return; }
    if (selectedAccountIds.length === 0) { toast.error("Please select at least one account"); return; }
    if (isScheduled && (!date || !time)) { toast.error("Please select a date and time"); return; }
    if (platformCharErrors.length > 0) {
      const { platform, current, limit } = platformCharErrors[0];
      const over = current - limit;
      toast.error(`${PLATFORM_DISPLAY_NAMES[platform] ?? platform} limit exceeded — remove ${over.toLocaleString()} char${over === 1 ? "" : "s"}`);
      return;
    }
    if (overLimit) { toast.error(`Caption exceeds ${MAX_CHARS.toLocaleString()} characters`); return; }
    if (postType === "VIDEO") {
      const cfgErrors = validatePlatformConfigs(selectedPlatforms, platformConfigs, "VIDEO");
      if (cfgErrors.length > 0) { toast.error(cfgErrors[0].message); return; }
    }
    if (postType !== "TEXT" && newFiles.length > 0) {
      const { errors: finalErrors } = await validateMediaFiles(newFiles, selectedPlatforms, postType as "IMAGE" | "VIDEO");
      if (finalErrors.length > 0) {
        setMediaErrors(finalErrors);
        toast.error(`Fix ${finalErrors.length} media issue${finalErrors.length !== 1 ? "s" : ""} before saving`);
        return;
      }
    }
    const acknowledgeApprovalLock = collection.approvalLocked;
    if (!confirmApprovalLockIfNeeded(acknowledgeApprovalLock)) {
      return;
    }

    setSaving(true);
    try {

      const uploadedMedia = selectedLibraryAssets.map((asset) => ({
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        fileUrl: asset.fileUrl ?? "",
        fileKey: asset.fileKey,
        size: asset.size ?? 0,
      }));
      for (const file of newFiles) {
        if (postType === "VIDEO" && !file.type.startsWith("video/")) continue;
        const { uploadUrl, fileUrl, fileKey } = await getPresignedUrl(file, getToken);
        await uploadToS3(uploadUrl, file);
        uploadedMedia.push({ fileName: file.name, mimeType: file.type, fileUrl, fileKey, size: file.size });
      }
      const payload: Parameters<typeof updatePostCollectionApi>[2] = {
        description,
        platformConfigs,
        keepMediaKeys,
        newMedia: uploadedMedia,
        connectedAccounts: selectedAccounts,
        scheduledTime: localToUTC(date, time),
        acknowledgeApprovalLock: acknowledgeApprovalLock || undefined,
      };
      const updated = await updatePostCollectionApi(getToken, collection.id, payload);
      toast.success(approvalUpdateSuccessMessage(updated, "Post updated successfully!"));
      onSuccess(updated);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={pageClassName}>
      <ProtectedPageHeader
        title="Edit Collection"
        description={collection.description}
        icon={<Pencil className="h-4 w-4" />}
        className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95"
        leading={
          <button
            onClick={onCancel}
            className={cn(
              "flex shrink-0 items-center gap-1.5 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]",
              focusRingClassName
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden text-label-14 sm:inline">Back</span>
          </button>
        }
        actions={
          selectedAccountIds.length > 0 ? (
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] px-3 py-1.5 text-copy-12 text-[var(--ds-plum-700)]">
              <Zap className="h-3 w-3" />
              {selectedAccountIds.length}{" "}
              {selectedAccountIds.length === 1 ? "account" : "accounts"}
            </div>
          ) : undefined
        }
      />

      {selectedPlatformKeys.length > 0 && (
        <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-2.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-copy-12 text-[var(--ds-gray-900)]">Posting to:</span>
            {selectedPlatformKeys.map((p) => (
              <span
                key={p}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-copy-12",
                  PLATFORM_BADGE_STYLES[p] ?? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                )}
              >
                {PLATFORM_LABELS[p] ?? p}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 px-4 py-6 sm:px-6">
        {isAgency && collection.approvalLocked && (
          <Notice title="Approval lock acknowledged" variant="warning">
            <p>
              Saving material edits will remove this collection from the publishing queue and send it back into
              the approval workflow.
            </p>
          </Notice>
        )}

        {/* ── Step 1: Content Type (toggleable, starts collapsed) ── */}
        <StepCard
          step={1}
          title="Content Type"
          description="Post type is locked and cannot be changed after creation."
          complete={true}
          isOpen={activeStep === 1}
          onToggle={() => toggleStep(1)}
          summary={step1Summary}
        >
          <div className="flex items-center gap-3 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                editType.className
              )}
            >
              <EditTypeIcon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-label-14 text-[var(--ds-gray-1000)]">{editType.label} Post</p>
              <p className="text-copy-12 leading-5 text-[var(--ds-gray-900)]">Format is fixed for this collection</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-2.5 py-1 text-copy-12 text-[var(--ds-gray-900)]">
              <Lock className="h-3 w-3" />
              Locked
            </div>
          </div>
        </StepCard>

        {/* ── Step 2: Select Accounts ── */}
        <StepCard
          step={2}
          title="Select Accounts"
          description="Choose which social profiles this post will be published to. You can add or remove accounts."
          complete={selectedAccountIds.length > 0}
          locked={reachedStep < 2}
          isOpen={activeStep === 2}
          onToggle={reachedStep >= 2 ? () => toggleStep(2) : undefined}
          summary={step2Summary}
        >
          <AccountSelector
            postType={collection.postCollectionType}
            accounts={connectedAccounts}
            selectedAccountIds={selectedAccountIds}
            onChange={setSelectedAccountIds}
            loading={accountsLoading}
            appearance="geist"
          />
          {selectedAccountIds.length > 0 && (
            <ContinueBtn onClick={() => goToStep(3)} />
          )}
        </StepCard>

        {/* ── Step 3: Compose ── */}
        <StepCard
          step={3}
          title="Compose"
          description={
            postType === "TEXT"
              ? "Write your post content and configure platform settings."
              : postType === "IMAGE"
              ? "Write a caption, manage images, and configure platform settings."
              : "Write a description, manage your video, and configure platform settings."
          }
          complete={step3Complete}
          locked={reachedStep < 3}
          isOpen={activeStep === 3}
          onToggle={reachedStep >= 3 ? () => toggleStep(3) : undefined}
          summary={step3Summary}
        >
          {isAgency ? (
            <div className="mb-6">
              <LibraryComposerPanel
                postType={postType as "IMAGE" | "VIDEO" | "TEXT"}
                onApplyItem={handleApplyLibraryItem}
                onApplyBundle={handleApplyLibraryBundle}
                appearance="geist"
              />
            </div>
          ) : null}

          {/* Caption */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-label-14 text-[var(--ds-gray-1000)]">
                {postType === "TEXT" ? "Content" : "Caption"}
              </label>
              <span className={cn(
                "text-copy-12 font-mono tabular-nums transition-colors",
                overLimit ? "font-medium text-[var(--ds-red-700)]" : nearLimit ? "text-[var(--ds-amber-700)]" : "text-[var(--ds-gray-900)]",
              )}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>
            <textarea
              placeholder={
                postType === "TEXT"
                  ? "Write your post content here. You can use emoji, hashtags, and mentions."
                  : postType === "VIDEO"
                  ? "Write a description for your video. Include relevant keywords, hashtags, and a call to action."
                  : "Write your post caption here. You can use emoji, hashtags, and mentions."
              }
              className={cn(
                "min-h-[8.75rem] w-full resize-none rounded-xl border bg-[var(--ds-background-100)] p-4 text-label-14 leading-relaxed text-[var(--ds-gray-1000)] transition-all duration-200",
                "placeholder:text-[var(--ds-gray-900)]",
                "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]",
                overLimit || platformCharErrors.length > 0
                  ? "border-[var(--ds-red-300)]"
                  : "border-[var(--ds-gray-400)] focus:border-[hsl(var(--accent))]",
              )}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {selectedPlatforms.length > 0 && (
              <PlatformCharLimits platforms={selectedPlatforms} charCount={charCount} appearance="geist" />
            )}
          </div>

          {/* Media section — IMAGE / VIDEO only */}
          {postType !== "TEXT" && (
            <div className="space-y-2 mt-6">
              <div className="flex items-center justify-between">
                <label className="text-label-14 text-[var(--ds-gray-1000)]">
                  {postType === "IMAGE" ? "Images" : "Video"}
                </label>
                {selectedPlatforms.length > 0 && (
                  <span className="text-copy-12 text-[var(--ds-gray-900)]">
                    Max {effectiveMaxFiles} {postType === "IMAGE" ? "image" : "video"}{effectiveMaxFiles !== 1 ? "s" : ""}
                    {restrictivePlatformLabel ? ` (${restrictivePlatformLabel} limit)` : ""}
                  </span>
                )}
              </div>

              {/* Existing kept media thumbnails */}
              {keptMedia.length > 0 && (
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-copy-12 text-[var(--ds-gray-900)]">
                    <CloudUpload className="w-3.5 h-3.5" />
                    Existing media — click × to remove
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {keptMedia.map((m) => (
                      <div
                        key={m.fileKey}
                        className="group relative h-28 w-28 overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm"
                      >
                        {m.mimeType.startsWith("video/") ? (
                          <video
                            src={m.fileUrl}
                            className="w-full h-full object-contain"
                            muted
                          />
                        ) : (
                          <Image
                            src={m.fileUrl}
                            alt={m.fileName}
                            fill
                            className="object-contain"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setKeepMediaKeys((prev) => prev.filter((k) => k !== m.fileKey))}
                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-md transition-colors hover:border-[var(--ds-red-200)] hover:bg-[var(--ds-red-100)]"
                          >
                            <X className="h-3 w-3 text-[var(--ds-gray-900)]" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New file uploader */}
              {slotsForNew > 0 && (
                <MediaUploader
                  files={newFiles}
                  setFiles={setNewFiles}
                  accept={postType === "IMAGE" ? "image/*" : "video/*"}
                  label={newFiles.length === 0
                    ? `Add New ${postType === "IMAGE" ? "Images" : "Video"}`
                    : postType === "IMAGE" ? "Add More Images" : "Add Another Video"}
                  maxFiles={slotsForNew}
                  maxFilesLabel={restrictivePlatformLabel}
                  appearance="geist"
                />
              )}
              {isAgency ? (
                <SelectedLibraryAssets
                  assets={selectedLibraryAssets}
                  onRemove={(fileKey) =>
                    setSelectedLibraryAssets((current) =>
                      current.filter((asset) => asset.fileKey !== fileKey)
                    )
                  }
                  appearance="geist"
                />
              ) : null}
              {slotsForNew === 0 && newFiles.length === 0 && (
                <p className="text-copy-12 text-[var(--ds-gray-900)]">
                  Maximum {effectiveMaxFiles} {postType === "IMAGE" ? "image" : "video"}{effectiveMaxFiles !== 1 ? "s" : ""} reached. Remove an existing file to add new ones.
                </p>
              )}

              {selectedPlatforms.length > 0 && (
                <MediaValidationPanel
                  platforms={selectedPlatforms}
                  postType={postType as "IMAGE" | "VIDEO"}
                  errors={allMediaErrors}
                  validating={validatingMedia}
                  hasFiles={hasMedia}
                  appearance="geist"
                />
              )}
            </div>
          )}

          {/* Platform configs */}
          {selectedAccounts.length > 0 && (
            <div className="mt-6 border-t border-[var(--ds-gray-400)] pt-6">
              <PlatformConfigsPanel
                selectedAccounts={selectedAccounts}
                configs={platformConfigs}
                onChange={setPlatformConfigs}
                showErrors={showErrors}
                postType={postType as "IMAGE" | "VIDEO" | "TEXT"}
                appearance="geist"
              />
            </div>
          )}

          <ContinueBtn
            onClick={() => goToStep(4)}
            disabled={!step3Complete || hasAnyCharError}
            label="Continue to Schedule"
          />
        </StepCard>

        {/* ── Step 4: Schedule & Save ── */}
        <StepCard
          step={4}
          title="Schedule & Save"
          description={isScheduled ? "Update the schedule time and save changes." : "Optionally set a schedule time, then save changes."}
          complete={false}
          locked={reachedStep < 4}
          isOpen={activeStep === 4}
          onToggle={reachedStep >= 4 ? () => toggleStep(4) : undefined}
          summary={step4Summary ?? undefined}
        >
          <ScheduleDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} appearance="geist" />

          <div className="mt-6">
            <ActionButton
              onClick={save}
              disabled={saving || selectedAccountIds.length === 0 || hasAnyCharError || validatingMedia}
              tone="primary"
              className="h-11 w-full"
              fullWidth
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </ActionButton>
          </div>
        </StepCard>

      </div>
    </div>
  );
}

/* --- Platform Post Previews -------------------------------------------- */

/* Shared small account avatar */
function AccountAvatar({ src, name, size = 8 }: { src: string | null; name: string; size?: number }) {
  const dim = `h-${size} w-${size}`;
  return (
    <div className={cn("overflow-hidden rounded-full border border-white/20 bg-[var(--ds-gray-100)] flex-shrink-0", dim)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--ds-gray-100)]">
          <User className="h-3 w-3 text-[var(--ds-gray-900)]" />
        </div>
      )}
    </div>
  );
}

/* Carousel media component for use inside platform previews */
function PreviewMediaCarousel({
  media,
  aspectRatio = "video",
  noMargin = false,
}: {
  media: { url: string; mimeType: string }[];
  aspectRatio?: "square" | "video" | "portrait";
  noMargin?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  if (!media.length) return null;
  const current = media[idx];
  const isVideo = current.mimeType.startsWith("video/");
  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square max-h-48"
      : aspectRatio === "portrait"
      ? "aspect-[9/16] max-h-56"
      : "aspect-video max-h-36";
  return (
    <div className={cn("relative w-full", !noMargin && "mt-2")}>
      <div className={cn("relative w-full overflow-hidden rounded-lg bg-neutral-950", aspectClass)}>
        {isVideo ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={current.url} className="w-full h-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt="Post media" className="w-full h-full object-contain" />
        )}
        {media.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + media.length) % media.length)}
              aria-label="Previous media"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/55 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/75 transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % media.length)}
              aria-label="Next media"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/55 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/75 transition-all"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-2 right-2 bg-black/65 text-white text-[0.5625rem] font-semibold px-1.5 py-0.5 rounded-full backdrop-blur-sm tabular-nums">
              {idx + 1}/{media.length}
            </div>
          </>
        )}
      </div>
      {media.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to media ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-200",
                i === idx
                  ? "w-3.5 h-1 bg-neutral-700 dark:bg-neutral-300"
                  : "w-1 h-1 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── X (Twitter) preview ── */
function XPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  const handle = "@" + (accountName.replace(/\s+/g, "").toLowerCase() || "account");
  return (
    <div className="bg-white dark:bg-black rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 font-sans">
      <div className="flex gap-2.5">
        <AccountAvatar src={avatarSrc} name={accountName} size={8} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[7.5rem]">{accountName || "Your Account"}</span>
            <span className="text-xs text-neutral-500 truncate">{handle}</span>
            <span className="text-neutral-400 text-xs">· now</span>
          </div>
          {caption && (
            <p className="text-xs text-neutral-900 dark:text-neutral-100 mt-1 leading-relaxed whitespace-pre-wrap line-clamp-3">{caption}</p>
          )}
          {media.length > 0 && <PreviewMediaCarousel media={media} aspectRatio="video" />}
          <div className="flex gap-4 mt-2 text-neutral-400">
            <button className="flex items-center gap-1 text-[0.6875rem] hover:text-[var(--ds-plum-400)] transition-colors">
              <MessageCircle className="h-3 w-3" /><span>Reply</span>
            </button>
            <button className="flex items-center gap-1 text-[0.6875rem] hover:text-green-400 transition-colors">
              <Repeat2 className="h-3 w-3" /><span>Repost</span>
            </button>
            <button className="flex items-center gap-1 text-[0.6875rem] hover:text-pink-400 transition-colors">
              <Heart className="h-3 w-3" /><span>Like</span>
            </button>
            <button className="flex items-center gap-1 text-[0.6875rem] hover:text-[var(--ds-plum-400)] transition-colors ml-auto">
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Instagram preview ── */
function InstagramPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 px-2.5 py-2">
        <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 flex-shrink-0">
          <AccountAvatar src={avatarSrc} name={accountName} size={7} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.6875rem] font-semibold text-neutral-900 dark:text-white truncate">{accountName || "your_account"}</p>
        </div>
        <MoreHorizontal className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
      </div>
      {/* Media — Instagram uses square format, bleeds edge-to-edge */}
      {media.length > 0 ? (
        <PreviewMediaCarousel media={media} aspectRatio="square" noMargin />
      ) : (
        <div className="w-full aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
        </div>
      )}
      {/* Actions + caption */}
      <div className="px-2.5 pt-2 pb-2.5">
        <div className="flex items-center gap-2.5 mb-1.5 text-neutral-800 dark:text-neutral-200">
          <button aria-label="Like" className="hover:text-red-500 transition-colors">
            <Heart className="h-4 w-4" />
          </button>
          <button aria-label="Comment" className="hover:text-neutral-500 transition-colors">
            <MessageCircle className="h-4 w-4" />
          </button>
          <button aria-label="Share" className="hover:text-neutral-500 transition-colors">
            <Send className="h-4 w-4" />
          </button>
          <button aria-label="Save" className="ml-auto hover:text-neutral-500 transition-colors">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
        {caption && (
          <p className="text-[0.6875rem] text-neutral-900 dark:text-neutral-100 leading-relaxed line-clamp-2">
            <span className="font-semibold">{accountName || "your_account"}</span>{" "}{caption}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── LinkedIn preview ── */
function LinkedInPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 font-sans overflow-hidden">
      <div className="p-3">
        <div className="flex gap-2 mb-2">
          <AccountAvatar src={avatarSrc} name={accountName} size={8} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{accountName || "Your Name"}</p>
            <p className="text-[0.625rem] text-neutral-500 truncate">Your Title · 1st</p>
            <p className="text-[0.625rem] text-neutral-400">Just now · 🌐</p>
          </div>
          <span className="text-[hsl(var(--accent))] font-semibold text-[0.625rem] self-start flex-shrink-0 cursor-default">+ Follow</span>
        </div>
        {caption && (
          <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed line-clamp-3 whitespace-pre-wrap">{caption}</p>
        )}
        {media.length > 0 && <PreviewMediaCarousel media={media} aspectRatio="video" />}
      </div>
      <div className="px-2 py-1.5 border-t border-neutral-100 dark:border-neutral-700 flex">
        {[
          { icon: ThumbsUp, label: "Like" },
          { icon: MessageCircle, label: "Comment" },
          { icon: Repeat2, label: "Repost" },
          { icon: Send, label: "Send" },
        ].map(({ icon: Icon, label }) => (
          <button key={label} className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-[0.625rem] text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <Icon className="h-3 w-3" /><span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Facebook preview ── */
function FacebookPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 font-sans overflow-hidden">
      <div className="p-3">
        <div className="flex gap-2 mb-2">
          <AccountAvatar src={avatarSrc} name={accountName} size={8} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{accountName || "Your Page"}</p>
            <p className="text-[0.625rem] text-neutral-500">Just now · 🌐</p>
          </div>
          <MoreHorizontal className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
        </div>
        {caption && (
          <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed line-clamp-3 whitespace-pre-wrap">{caption}</p>
        )}
        {media.length > 0 && <PreviewMediaCarousel media={media} aspectRatio="video" />}
      </div>
      <div className="px-2 py-1.5 border-t border-neutral-100 dark:border-neutral-700 flex">
        {[
          { icon: ThumbsUp, label: "Like" },
          { icon: MessageCircle, label: "Comment" },
          { icon: Share2, label: "Share" },
        ].map(({ icon: Icon, label }) => (
          <button key={label} className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-[0.625rem] text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <Icon className="h-3 w-3" /><span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── YouTube preview ── */
function YouTubePreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  const title = caption?.split("\n")[0]?.slice(0, 100) || "Your Video Title";
  const first = media[0] ?? null;
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden font-sans border border-neutral-200 dark:border-neutral-700">
      {/* Thumbnail — 16:9, object-contain, capped height */}
      <div className="relative w-full aspect-video max-h-36 bg-neutral-950 overflow-hidden">
        {first ? (
          first.mimeType.startsWith("video/") ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={first.url} className="w-full h-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={first.url} alt="" className="w-full h-full object-contain" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="h-7 w-7 text-white/20" />
          </div>
        )}
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[0.5625rem] font-semibold px-1 py-0.5 rounded tabular-nums">0:00</div>
      </div>
      <div className="p-2.5 flex gap-2">
        <AccountAvatar src={avatarSrc} name={accountName} size={7} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-900 dark:text-white line-clamp-2 leading-snug">{title}</p>
          <p className="text-[0.625rem] text-neutral-500 mt-0.5 truncate">{accountName || "Your Channel"}</p>
          <p className="text-[0.625rem] text-neutral-400">0 views · Just now</p>
        </div>
      </div>
    </div>
  );
}

/* ── TikTok preview ── */
function TikTokPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  const first = media[0] ?? null;
  return (
    <div className="bg-black rounded-xl overflow-hidden font-sans relative border border-neutral-800">
      <div className="relative w-full aspect-[9/16] max-h-56 overflow-hidden">
        {first ? (
          first.mimeType.startsWith("video/") ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={first.url} className="w-full h-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={first.url} alt="" className="w-full h-full object-contain" />
          )
        ) : (
          <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
            <Play className="h-8 w-8 text-white/20" />
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-3 right-12">
          <p className="text-white text-xs font-semibold mb-1">@{accountName?.replace(/\s+/g, "").toLowerCase() || "account"}</p>
          {caption && <p className="text-white/90 text-xs leading-snug line-clamp-2">{caption}</p>}
        </div>
        {/* Right actions */}
        <div className="absolute right-2 bottom-3 flex flex-col items-center gap-3 text-white">
          <div className="flex flex-col items-center">
            <AccountAvatar src={avatarSrc} name={accountName} size={8} />
            <div className="-mt-1.5 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[0.5rem] text-white font-bold">+</div>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Heart className="h-5 w-5" />
            <span className="text-[0.625rem]">0</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <MessageCircle className="h-5 w-5" />
            <span className="text-[0.625rem]">0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Threads preview ── */
function ThreadsPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  return (
    <div className="bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 font-sans">
      <div className="flex gap-2.5">
        <div className="flex flex-col items-center">
          <AccountAvatar src={avatarSrc} name={accountName} size={8} />
          <div className="w-0.5 flex-1 bg-neutral-200 dark:bg-neutral-700 mt-1.5 min-h-3" />
        </div>
        <div className="flex-1 min-w-0 pb-1.5">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate max-w-[8.125rem]">{accountName || "your_account"}</span>
            <span className="text-[0.625rem] text-neutral-400 flex-shrink-0">· now</span>
          </div>
          {caption && <p className="text-xs text-neutral-800 dark:text-neutral-200 mt-1 leading-relaxed whitespace-pre-wrap line-clamp-3">{caption}</p>}
          {media.length > 0 && <PreviewMediaCarousel media={media} aspectRatio="video" />}
          <div className="flex gap-3 mt-2 text-neutral-400">
            <button aria-label="Like" className="hover:text-red-400 transition-colors"><Heart className="h-3.5 w-3.5" /></button>
            <button aria-label="Comment" className="hover:text-neutral-600 transition-colors"><MessageCircle className="h-3.5 w-3.5" /></button>
            <button aria-label="Repost" className="hover:text-green-500 transition-colors"><Repeat2 className="h-3.5 w-3.5" /></button>
            <button aria-label="Share" className="hover:text-neutral-600 transition-colors"><Send className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Media Carousel ──────────────────────────────────────── */

function MediaCarousel({
  media,
}: {
  media: PostCollectionResponse["media"];
}) {
  const [idx, setIdx] = useState(0);
  if (media.length === 0) return null;

  const current = media[idx];
  const isVideo = current.mimeType?.startsWith("video/");

  return (
    <div>
      <div className="relative aspect-video w-full max-h-40 overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-neutral-950">
        {isVideo ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={current.fileUrl} className="w-full h-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.fileUrl} alt="Media" className="w-full h-full object-contain" />
        )}
        {media.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + media.length) % media.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % media.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[0.625rem] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
              {idx + 1} / {media.length}
            </div>
          </>
        )}
      </div>
      {media.length > 1 && (
        <div className="flex justify-center gap-1 mt-2.5">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cn(
                "rounded-full transition-all",
                i === idx
                  ? "h-1.5 w-4 bg-[var(--ds-gray-1000)]"
                  : "h-1.5 w-1.5 bg-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-700)]"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main PlatformSection ── */
function PlatformSection({
  platform,
  posts,
  caption,
  media,
}: {
  platform: string;
  posts: PostResponse[];
  caption: string;
  media: { url: string; mimeType: string }[];
}) {
  const p = platform.toUpperCase();
  const Icon = PLATFORM_ICONS[platform] ?? PLATFORM_ICONS[platform.toLowerCase()];
  const accent = platformAccent[p] ?? platformAccent[platform] ?? platformAccentFallback;

  // Use first post's account for the preview
  const previewAccount = posts[0]?.connectedAccount;
  const previewName = previewAccount?.username ?? "";
  const previewAvatar = previewAccount?.profilePicLink
    ? getImageUrl(previewAccount.profilePicLink)
    : null;

  const previewProps = { caption, media, accountName: previewName, avatarSrc: previewAvatar };

  return (
    <div className={cn("rounded-2xl border shadow-sm overflow-hidden", accent.cardBg, accent.cardBorder)}>
      <div className="h-[0.1875rem] w-full" style={{ background: accent.bar }} />

      {/* Platform header row */}
      <div className="flex items-center gap-3 border-b border-[var(--ds-gray-400)] px-5 py-4">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", accent.iconClass)}>
          {Icon ? <Icon className="h-4.5 w-4.5" /> : null}
        </div>
        <p className="flex-1 text-label-14 text-[var(--ds-gray-1000)]">
          {platformDisplayName[p] ?? platformDisplayName[platform] ?? platform}
        </p>
        <span className="text-copy-12 text-[var(--ds-gray-900)]">
          {posts.length} account{posts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Platform-specific post preview */}
      <div className="border-b border-[var(--ds-gray-400)] px-4 py-3">
        <div className="mx-auto max-w-xs sm:max-w-sm">
          {p === "X" && <XPreview {...previewProps} />}
          {p === "INSTAGRAM" && <InstagramPreview {...previewProps} />}
          {p === "LINKEDIN" && <LinkedInPreview {...previewProps} />}
          {p === "FACEBOOK" && <FacebookPreview {...previewProps} />}
          {p === "YOUTUBE" && <YouTubePreview {...previewProps} />}
          {p === "TIKTOK" && <TikTokPreview {...previewProps} />}
          {p === "THREADS" && <ThreadsPreview {...previewProps} />}
          {!["X","INSTAGRAM","LINKEDIN","FACEBOOK","YOUTUBE","TIKTOK","THREADS"].includes(p) && (
            <div className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-3">
              {caption && <p className="line-clamp-4 whitespace-pre-wrap text-copy-12 leading-relaxed text-[var(--ds-gray-1000)]">{caption}</p>}
              {media.length > 0 && <PreviewMediaCarousel media={media} aspectRatio="video" />}
            </div>
          )}
        </div>
      </div>

      {/* Account list */}
      <div className="flex flex-wrap gap-2 p-4">
        {posts.map((post) => {
          const src = getImageUrl(post.connectedAccount?.profilePicLink);
          return (
            <div
              key={post.id}
              className="flex items-center gap-2 rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] py-1.5 pl-1.5 pr-3 shadow-sm"
            >
              <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                {src ? (
                  <Image src={src} alt={post.connectedAccount?.username ?? ""} fill sizes="1.25rem" className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-2.5 w-2.5 text-[var(--ds-gray-900)]" />
                  </div>
                )}
              </div>
              <span className="max-w-[8.75rem] truncate text-copy-12 leading-none text-[var(--ds-gray-1000)]">
                {post.connectedAccount?.username ?? "Account"}
              </span>
              <div className={cn(
                "h-2 w-2 rounded-full flex-shrink-0",
                post.postStatus === "PUBLISHED" ? "bg-emerald-500"
                  : post.postStatus === "FAILED" ? "bg-red-500"
                  : "bg-[var(--ds-plum-400)]"
              )} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

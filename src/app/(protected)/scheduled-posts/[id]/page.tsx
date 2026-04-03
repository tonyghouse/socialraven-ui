"use client";

import AtlassianButton from "@atlaskit/button/new";
import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
import Tag from "@atlaskit/tag";
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
import { Button } from "@/components/ui/button";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { toast } from "sonner";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import { deletePostCollectionApi } from "@/service/deletePostCollectionApi";
import { updatePostCollectionApi } from "@/service/updatePostCollectionApi";
import { getPresignedUrl } from "@/service/presignUrl";
import { uploadToS3 } from "@/service/uploadToS3";
import { localToUTC } from "@/lib/timeUtil";
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
import { CollectionDetailPageSkeleton } from "@/components/posts/collection-page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
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

/* ─── Config maps ─────────────────────────────────────────── */

const statusConfig: Record<
  string,
  { label: string; Icon: typeof CheckCircle2; className: string }
> = {
  SCHEDULED: {
    label: "Scheduled",
    Icon: Clock,
    className:
      "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  },
  PUBLISHED: {
    label: "Completed",
    Icon: CheckCircle2,
    className:
      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  },
  PARTIAL_SUCCESS: {
    label: "Partially Completed",
    Icon: AlertTriangle,
    className:
      "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
  },
  FAILED: {
    label: "Failed",
    Icon: XCircle,
    className:
      "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20",
  },
};

const typeConfig: Record<
  string,
  { label: string; Icon: typeof ImageIcon; className: string }
> = {
  IMAGE: {
    label: "Image",
    Icon: ImageIcon,
    className:
      "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/20",
  },
  VIDEO: {
    label: "Video",
    Icon: Video,
    className:
      "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
  },
  TEXT: {
    label: "Text",
    Icon: FileText,
    className:
      "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-500/10 dark:border-slate-500/20",
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
    "text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
  INSTAGRAM:
    "text-pink-600 bg-pink-50 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800/30",
  FACEBOOK:
    "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
  LINKEDIN:
    "text-sky-600 bg-sky-50 border-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/30",
  X: "text-neutral-800 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-300 dark:border-neutral-700/30",
  THREADS:
    "text-neutral-700 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-300 dark:border-neutral-700/30",
  TIKTOK:
    "text-neutral-900 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-200 dark:border-neutral-700/30",
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
    bar: "linear-gradient(90deg,#f9ce34 0%,#ee2a7b 45%,#6228d7 100%)",
    cardBg:
      "bg-gradient-to-br from-pink-50/70 to-purple-50/40 dark:from-pink-950/30 dark:to-purple-950/20",
    cardBorder: "border-pink-200/70 dark:border-pink-800/30",
    iconClass:
      "bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 border-transparent text-white shadow-md shadow-pink-500/25",
  },
  X: {
    bar: "linear-gradient(90deg,#000 0%,#3a3a3a 50%,#000 100%)",
    cardBg: "bg-neutral-50/90 dark:bg-neutral-900/50",
    cardBorder: "border-neutral-200/80 dark:border-neutral-700/50",
    iconClass:
      "bg-neutral-900 dark:bg-neutral-100 border-transparent text-white dark:text-neutral-900 shadow-md shadow-neutral-900/20",
  },
  LINKEDIN: {
    bar: "linear-gradient(90deg,#0077b5 0%,#00a0dc 100%)",
    cardBg:
      "bg-gradient-to-br from-sky-50/70 to-blue-50/40 dark:from-sky-950/30 dark:to-blue-950/20",
    cardBorder: "border-sky-200/70 dark:border-sky-800/30",
    iconClass:
      "bg-gradient-to-br from-sky-400 to-blue-700 border-transparent text-white shadow-md shadow-sky-500/25",
  },
  YOUTUBE: {
    bar: "linear-gradient(90deg,#ff0000 0%,#ff5252 50%,#cc0000 100%)",
    cardBg:
      "bg-gradient-to-br from-red-50/70 to-rose-50/40 dark:from-red-950/30 dark:to-rose-950/20",
    cardBorder: "border-red-200/70 dark:border-red-800/30",
    iconClass:
      "bg-gradient-to-br from-red-500 to-red-700 border-transparent text-white shadow-md shadow-red-500/25",
  },
  FACEBOOK: {
    bar: "linear-gradient(90deg,#1877f2 0%,#42a5f5 100%)",
    cardBg:
      "bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/20",
    cardBorder: "border-blue-200/70 dark:border-blue-800/30",
    iconClass:
      "bg-gradient-to-br from-blue-500 to-blue-700 border-transparent text-white shadow-md shadow-blue-500/25",
  },
  TIKTOK: {
    bar: "linear-gradient(90deg,#010101 0%,#ff0050 50%,#00f2ea 100%)",
    cardBg: "bg-neutral-50/90 dark:bg-neutral-900/50",
    cardBorder: "border-neutral-200/80 dark:border-neutral-700/50",
    iconClass:
      "bg-neutral-900 border-transparent text-white shadow-md shadow-neutral-900/20",
  },
  THREADS: {
    bar: "linear-gradient(90deg,#101010 0%,#606060 50%,#101010 100%)",
    cardBg: "bg-neutral-50/90 dark:bg-neutral-900/50",
    cardBorder: "border-neutral-200/80 dark:border-neutral-700/50",
    iconClass:
      "bg-neutral-900 dark:bg-neutral-700 border-transparent text-white shadow-md shadow-neutral-900/20",
  },
};

const platformAccentFallback = {
  bar: "linear-gradient(90deg,#6b7280,#9ca3af)",
  cardBg: "bg-muted/30",
  cardBorder: "border-border/60",
  iconClass: "bg-muted border-border/60 text-muted-foreground",
};

/* Platform badge styles for edit mode header */
const PLATFORM_BADGE_STYLES: Record<string, string> = {
  facebook: "bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20",
  instagram: "bg-pink-50 text-pink-600 border-pink-200",
  x: "bg-foreground/8 text-foreground border-border",
  linkedin: "bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20",
  youtube: "bg-red-50 text-red-600 border-red-200",
  threads: "bg-foreground/8 text-foreground border-border",
  tiktok: "bg-foreground/8 text-foreground border-border",
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

function getStatusLozengeAppearance(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "success";
    case "PARTIAL_SUCCESS":
      return "moved";
    case "FAILED":
      return "removed";
    case "SCHEDULED":
    default:
      return "inprogress";
  }
}

function getTypeLozengeAppearance(type: string) {
  switch (type) {
    case "VIDEO":
      return "new";
    case "TEXT":
      return "default";
    case "IMAGE":
    default:
      return "information";
  }
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
  children: React.ReactNode;
  complete?: boolean;
  locked?: boolean;
  isOpen: boolean;
  onToggle?: () => void;
  summary?: React.ReactNode;
}) {
  const canToggle = !!onToggle && !locked;

  return (
    <div
      className={cn(
        "bg-card border rounded-2xl shadow-sm overflow-hidden transition-all duration-300",
        locked      ? "border-border opacity-50"
        : complete && isOpen ? "border-primary/40"
        : complete  ? "border-primary/20"
        :             "border-border",
      )}
    >
      {/* ── Header ── */}
      <button
        type="button"
        disabled={!canToggle}
        onClick={canToggle ? onToggle : undefined}
        className={cn(
          "w-full flex items-center gap-4 px-6 py-4 text-left transition-colors duration-200",
          "border-b border-border/60 bg-muted/20",
          canToggle
            ? "cursor-pointer hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset"
            : "cursor-default",
        )}
      >
        {/* Step indicator */}
        <div
          className={cn(
            "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 transition-all duration-300",
            complete ? "bg-primary/15" : "bg-muted border border-border/60",
          )}
        >
          {complete
            ? <CheckCircle2 className="w-4 h-4 text-primary" />
            : <span className="text-xs font-medium leading-4 text-muted-foreground">{step}</span>
          }
        </div>

        {/* Title / summary */}
        <div className="flex-1 min-w-0">
          {!isOpen && complete && summary ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium leading-4 text-muted-foreground">{title}</span>
              <span className="text-muted-foreground/40">·</span>
              {summary}
            </div>
          ) : (
            <>
              <h2 className="text-sm font-semibold leading-5 text-foreground">{title}</h2>
              <p className="mt-0.5 text-xs leading-4 text-muted-foreground">{description}</p>
            </>
          )}
        </div>

        {/* Edit hint + chevron */}
        {canToggle && (
          <div className="flex-shrink-0 flex items-center gap-1.5 text-muted-foreground">
            {!isOpen && (
              <span className="hidden sm:flex items-center gap-1 text-xs font-medium leading-4 text-primary/70 bg-primary/8 px-2 py-0.5 rounded-full border border-primary/15">
                <Pencil className="w-2.5 h-2.5" />
                Edit
              </span>
            )}
            {isOpen
              ? <ChevronUp  className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />
            }
          </div>
        )}
      </button>

      {/* ── Body ── */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
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
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium leading-5 transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          disabled
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        )}
      >
        {label}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
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

      {/* Panel */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_8px_24px_rgba(9,30,66,0.24)] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          {/* Icon + heading */}
          <div className="flex items-start gap-4 mb-5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
              <Trash2 className="h-5 w-5 text-[hsl(var(--destructive))]" />
            </div>
            <div>
              <h2
                id="delete-modal-title"
                className="text-sm font-semibold leading-5 text-foreground"
              >
                Delete this collection?
              </h2>
            </div>
          </div>

          <div className="mb-5">
            <SectionMessage appearance="error" title="This action cannot be undone.">
              This will permanently remove the scheduled collection and its posts.
            </SectionMessage>
          </div>

          {/* Collection preview card */}
          <div className="mb-5 space-y-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] p-4">
            <div>
              <p className="mb-1 text-xs font-medium leading-4 text-muted-foreground">
                Collection
              </p>
              <p className="text-sm font-medium leading-5 text-foreground truncate">
                {collection.description}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
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
                        "h-6 w-6 rounded-lg border flex items-center justify-center flex-shrink-0",
                        platformIconStyle[platform] ??
                          "text-muted-foreground bg-muted/50 border-border/60"
                      )}
                    >
                      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {platformDisplayName[platform] ?? platform}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {posts.length} account{posts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-1 border-t border-border/30 flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground tabular-nums">
                  {collection.posts.length}
                </span>{" "}
                post{collection.posts.length !== 1 ? "s" : ""} across{" "}
                <span className="font-medium text-foreground tabular-nums">
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
              className="block text-xs font-medium text-muted-foreground mb-2"
            >
              Type{" "}
              <span className="font-mono font-bold text-red-600 dark:text-red-400">
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-background text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              ref={cancelRef}
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border/60 text-sm font-medium leading-5 text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!canDelete || isDeleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium leading-5 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
            </button>
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
          data.overallStatus === "CHANGES_REQUESTED"
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
  }, [isLoaded]);

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
      updated.overallStatus === "CHANGES_REQUESTED"
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
    return <CollectionDetailPageSkeleton />;
  }

  if (error || !collection) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] p-6">
        <div className="w-full max-w-md rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
          <SectionMessage appearance="error" title="Collection not found">
            <div className="mt-3">
              <AtlassianButton appearance="primary" onClick={() => router.push("/scheduled-posts")}>
                Back to Scheduled Posts
              </AtlassianButton>
            </div>
          </SectionMessage>
        </div>
      </div>
    );
  }

  /* ── Derived values ── */
  const scheduledDate = new Date(collection.scheduledTime ?? "");
  const status = statusConfig[collection.overallStatus] ?? statusConfig.SCHEDULED;
  const type = typeConfig[collection.postCollectionType] ?? typeConfig.TEXT;
  const isScheduled = collection.overallStatus === "SCHEDULED";
  const recoveryBadge = collection.failureState === "RECOVERED"
    ? { appearance: "success", label: "Recovered" }
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
    <main className="min-h-screen bg-[hsl(var(--background))]">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in slide-in-from-bottom-3 duration-300",
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-300"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Delete Modal */}
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
            actions={
              <>
                {isScheduled && (
                  <div className="hidden sm:inline-flex">
                    <AtlassianButton appearance="subtle" onClick={enterEditMode}>
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </AtlassianButton>
                  </div>
                )}

                <div className="hidden sm:inline-flex">
                  <AtlassianButton
                    appearance="danger"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </AtlassianButton>
                </div>

                <div className="hidden sm:inline-flex">
                  <AtlassianButton
                    appearance="primary"
                    onClick={() => router.push("/schedule-post")}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    New Post
                  </AtlassianButton>
                </div>
              </>
            }
          />

          <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-2.5 sm:px-6">
            <nav className="flex min-w-0 items-center gap-1.5 text-sm">
              <AtlassianButton
                appearance="subtle"
                onClick={() => router.push("/scheduled-posts")}
                spacing="compact"
              >
                <Layers className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Scheduled Posts</span>
              </AtlassianButton>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
              <span className="font-medium text-foreground truncate">
                {collection.description}
              </span>
            </nav>
          </div>

          <div className="px-4 py-6 space-y-5 sm:px-6">
            <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
              <div className="border-b border-[hsl(var(--border-subtle))] px-6 py-5">
                <div className="mb-3 flex flex-wrap items-start gap-3">
                  <h1 className="min-w-0 flex-1 text-xl font-semibold leading-7 text-[hsl(var(--foreground))]">
                    {collection.description}
                  </h1>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <Lozenge appearance={getTypeLozengeAppearance(collection.postCollectionType)}>
                      {type.label}
                    </Lozenge>
                    <Lozenge appearance={getStatusLozengeAppearance(collection.overallStatus)} isBold>
                      {status.label}
                    </Lozenge>
                    {recoveryBadge && (
                      <Lozenge appearance={recoveryBadge.appearance as "success"}>
                        {recoveryBadge.label}
                      </Lozenge>
                    )}
                    <div className="flex items-center gap-1.5 sm:hidden">
                      {isScheduled && (
                        <AtlassianButton appearance="subtle" onClick={enterEditMode} spacing="compact">
                          <Pencil className="h-3.5 w-3.5" />
                        </AtlassianButton>
                      )}
                      <AtlassianButton appearance="danger" onClick={() => setShowDeleteModal(true)} spacing="compact">
                        <Trash2 className="h-3.5 w-3.5" />
                      </AtlassianButton>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Tag text={`${formattedDate} · ${formattedTime}`} />
                  <Tag text={`${collection.posts.length} post${collection.posts.length !== 1 ? "s" : ""}`} />
                  <Tag text={`${platformCount} platform${platformCount !== 1 ? "s" : ""}`} />
                  {canOpenChannelRecovery && (
                    <button
                      type="button"
                      onClick={() => router.push(`/recovery-drafts/${collection.id}`)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium leading-4 text-amber-800 transition-colors hover:bg-amber-100"
                    >
                      <RefreshCcw className="h-3 w-3" />
                      Recover Failed Channels
                    </button>
                  )}
                  {Object.keys(groupedPosts).map((plat) => (
                    <Tag
                      key={plat}
                      text={platformDisplayName[plat.toUpperCase()] ?? plat}
                    />
                  ))}
                </div>
              </div>
              {captionText && (
                <div className="px-6 py-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                    {captionText}
                  </p>
                </div>
              )}
            </div>

            {canOpenChannelRecovery && (
              <div className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-3 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-5 text-amber-900">Failed channels still need attention</p>
                    <p className="mt-1 text-sm leading-5 text-amber-800">
                      {collection.failedChannelCount} channel{collection.failedChannelCount === 1 ? "" : "s"} did not publish successfully. Create a recovery draft to correct and reschedule only those failed channels.
                    </p>
                  </div>
                  <AtlassianButton appearance="primary" spacing="compact" onClick={() => router.push(`/recovery-drafts/${collection.id}`)}>
                    <span className="inline-flex items-center gap-1.5">
                      <RefreshCcw className="h-3.5 w-3.5" />
                      <span>Open Channel Recovery</span>
                    </span>
                  </AtlassianButton>
                </div>
              </div>
            )}

            <ApprovalSafetyPanel collection={collection} />

            <div className="flex flex-col lg:flex-row gap-5 items-start">
              <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
                <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                  <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm font-semibold leading-5 text-foreground flex-1">Schedule</p>
                    {isScheduled && (
                      <AtlassianButton appearance="subtle" onClick={enterEditMode} spacing="compact">
                        <Pencil className="h-3.5 w-3.5" />
                      </AtlassianButton>
                    )}
                  </div>
                  <div className="p-5 space-y-4">
                    {isScheduled && getCountdown(scheduledDate) && (
                      <div className="rounded-lg border border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/8 px-4 py-4">
                        <p className="text-xs font-medium leading-4 text-muted-foreground">Publishing in</p>
                        <p className="mt-1 text-[26px] font-bold leading-8 text-[hsl(var(--accent))] tabular-nums">{getCountdown(scheduledDate)}</p>
                      </div>
                    )}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground font-medium">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground font-medium">{formattedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                  <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm font-semibold leading-5 text-foreground flex-1">Caption</p>
                    {isScheduled && (
                      <AtlassianButton appearance="subtle" onClick={enterEditMode} spacing="compact">
                        <Pencil className="h-3.5 w-3.5" />
                      </AtlassianButton>
                    )}
                  </div>
                  <div className="p-5">
                    {captionText ? (
                      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-10 whitespace-pre-wrap">{captionText}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic">No caption</p>
                    )}
                    {captionText && (
                      <p className="text-xs text-muted-foreground/40 tabular-nums mt-3">{captionText.length} characters</p>
                    )}
                  </div>
                </div>

                {/* Media carousel */}
                {collection.media.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]">
                      <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm font-semibold leading-5 text-foreground flex-1">
                        Media <span className="font-normal text-muted-foreground">· {collection.media.length}</span>
                      </p>
                      {isScheduled && collection.postCollectionType !== "TEXT" && (
                        <AtlassianButton appearance="subtle" onClick={enterEditMode} spacing="compact">
                          <Pencil className="h-3.5 w-3.5" />
                        </AtlassianButton>
                      )}
                    </div>
                    <div className="p-4">
                      <MediaCarousel media={collection.media} />
                    </div>
                  </div>
                )}

                <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                  <div className="px-5 py-4 flex items-center divide-x divide-border/40">
                    <div className="flex-1 text-center pr-4">
                      <p className="text-2xl font-semibold text-foreground tabular-nums leading-none">{collection.posts.length}</p>
                      <p className="mt-1.5 text-xs font-medium leading-4 text-muted-foreground">Posts</p>
                    </div>
                    <div className="flex-1 text-center pl-4">
                      <p className="text-2xl font-semibold text-foreground tabular-nums leading-none">{platformCount}</p>
                      <p className="mt-1.5 text-xs font-medium leading-4 text-muted-foreground">Platforms</p>
                    </div>
                  </div>
                  <div className="px-5 pb-4 border-t border-border/30 pt-4 space-y-3">
                    {Object.entries(groupedPosts).map(([plat, platPosts]) => {
                      const platUpper = plat.toUpperCase();
                      const PlatIcon = PLATFORM_ICONS[plat] ?? PLATFORM_ICONS[plat.toLowerCase()];
                      return (
                        <div key={plat} className="flex items-center gap-2.5">
                          <div className={cn("h-6 w-6 rounded-lg border flex items-center justify-center flex-shrink-0", platformIconStyle[platUpper] ?? "text-muted-foreground bg-muted/50 border-border/60")}>
                            {PlatIcon ? <PlatIcon className="h-3.5 w-3.5" /> : null}
                          </div>
                          <span className="text-sm font-medium text-foreground flex-1 truncate">{platformDisplayName[platUpper] ?? plat}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">{platPosts.length} acct{platPosts.length !== 1 ? "s" : ""}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-4">
                {collection.posts.length === 0 ? (
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                    <SectionMessage appearance="information" title="No posts in this collection">
                      Add posts to this collection to preview them here by platform.
                    </SectionMessage>
                  </div>
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

            <div className="sm:hidden flex gap-3 pt-1 pb-6">
              {isScheduled && (
                <AtlassianButton appearance="subtle" onClick={enterEditMode} shouldFitContainer>
                  <Pencil className="mr-1 h-4 w-4" />
                  Edit
                </AtlassianButton>
              )}
              <AtlassianButton appearance="danger" onClick={() => setShowDeleteModal(true)} shouldFitContainer>
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </AtlassianButton>
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

  /* ── Form state ── */
  const [description, setDescription]         = useState("");
  const [keepMediaKeys, setKeepMediaKeys]     = useState<string[]>([]);
  const [newFiles, setNewFiles]               = useState<File[]>([]);
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
  const slotsForNew = Math.max(0, effectiveMaxFiles - keptCount);
  const hasMedia = keptCount + newFiles.length > 0;

  const syncMediaErrors = useMemo(
    () => postType !== "TEXT" ? validateMediaSync(newFiles, selectedPlatforms, postType as "IMAGE" | "VIDEO") : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newFiles.map((f) => f.name + f.size).join(","), selectedPlatforms.join(","), postType],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newFiles.map((f) => f.name + f.size).join(","), selectedPlatforms.join(","), postType]);

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
    <span className="flex items-center gap-1.5 text-sm font-medium leading-5 text-foreground">
      <EditTypeIcon className="w-3.5 h-3.5 text-primary" />
      {editType.label}
    </span>
  );

  const step2Summary = (
    <span className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium leading-5 text-primary">{selectedAccountIds.length}</span>
      <span className="text-xs leading-4 text-muted-foreground">{selectedAccountIds.length === 1 ? "account" : "accounts"}</span>
      {selectedPlatformKeys.slice(0, 3).map((p) => (
        <span key={p} className={cn("text-xs font-medium leading-4 px-1.5 py-0.5 rounded-full border", PLATFORM_BADGE_STYLES[p] ?? "bg-muted text-foreground border-border")}>
          {PLATFORM_LABELS[p] ?? p}
        </span>
      ))}
      {selectedPlatformKeys.length > 3 && (
        <span className="text-xs leading-4 text-muted-foreground">+{selectedPlatformKeys.length - 3}</span>
      )}
    </span>
  );

  const step3Summary = (
    <span className="flex items-center gap-2 text-sm text-foreground">
      <span className="font-medium truncate max-w-[160px] sm:max-w-[260px]">
        {description.trim().slice(0, 60)}{description.trim().length > 60 ? "…" : ""}
      </span>
      {postType !== "TEXT" && (keptCount + newFiles.length) > 0 && (
        <span className="text-xs text-muted-foreground flex-shrink-0">
          · {keptCount + newFiles.length} {postType === "IMAGE" ? "image" : "video"}{(keptCount + newFiles.length) !== 1 ? "s" : ""}
        </span>
      )}
    </span>
  );

  const step4Summary = date && time ? (
    <span className="text-sm font-medium text-foreground">
      {new Date(`${date}T${time}`).toLocaleString(undefined, {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })}
    </span>
  ) : null;

  /* ── Save ── */
  async function save() {
    setShowErrors(true);
    if (!description.trim()) { toast.error("Please write a caption"); return; }
    if (postType !== "TEXT" && !hasMedia) { toast.error("Please keep or upload at least one file"); return; }
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
    const acknowledgeApprovalLock = collection.approvalLocked
      ? window.confirm(
          "Saving material edits will remove this collection from the publishing queue and send it back into review. Continue?"
        )
      : false;
    if (collection.approvalLocked && !acknowledgeApprovalLock) {
      return;
    }

    setSaving(true);
    try {

      const uploadedMedia = [];
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
        acknowledgeApprovalLock,
      };
      const updated = await updatePostCollectionApi(getToken, collection.id, payload);
      toast.success(
        updated.overallStatus === "IN_REVIEW"
          ? "Material changes saved. The collection is back in review."
          : "Post updated successfully!"
      );
      onSuccess(updated);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* ── Sticky header ── */}
      <ProtectedPageHeader
        title="Edit Collection"
        description={collection.description}
        icon={<Pencil className="h-4 w-4" />}
        leading={
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium leading-5 hidden sm:inline">Back</span>
          </button>
        }
        actions={
          selectedAccountIds.length > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-medium leading-4 text-primary flex-shrink-0 border border-primary/20">
              <Zap className="w-3 h-3" />
              {selectedAccountIds.length}{" "}
              {selectedAccountIds.length === 1 ? "account" : "accounts"}
            </div>
          ) : undefined
        }
      />

      {selectedPlatformKeys.length > 0 && (
        <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">Posting to:</span>
            {selectedPlatformKeys.map((p) => (
              <span
                key={p}
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full border",
                  PLATFORM_BADGE_STYLES[p] ?? "bg-muted text-foreground border-border"
                )}
              >
                {PLATFORM_LABELS[p] ?? p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Steps ── */}
      <div className="px-4 sm:px-6 py-6 space-y-4">
        {collection.approvalLocked && (
          <SectionMessage appearance="warning" title="Approval lock acknowledged">
            <p className="text-sm">
              Saving material edits will remove this collection from the publishing queue and send it back into
              the approval workflow.
            </p>
          </SectionMessage>
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
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/40">
            <div
              className={cn(
                "h-9 w-9 rounded-xl border flex items-center justify-center flex-shrink-0",
                editType.className
              )}
            >
              <EditTypeIcon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold leading-5 text-foreground">{editType.label} Post</p>
              <p className="text-xs leading-4 text-muted-foreground">Format is fixed for this collection</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium leading-4 text-muted-foreground bg-muted border border-border/50 px-2.5 py-1 rounded-lg">
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
          {/* Caption */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-5 text-foreground">
                {postType === "TEXT" ? "Content" : "Caption"}
              </label>
              <span className={cn(
                "text-xs font-mono tabular-nums transition-colors",
                overLimit ? "text-red-500 font-medium" : nearLimit ? "text-amber-500" : "text-muted-foreground",
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
                "w-full p-4 rounded-xl border text-sm bg-background text-foreground leading-relaxed",
                "resize-none min-h-[140px] transition-all duration-200",
                "placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                overLimit || platformCharErrors.length > 0
                  ? "border-red-400 focus:border-red-400"
                  : "border-border focus:border-primary",
              )}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {selectedPlatforms.length > 0 && (
              <PlatformCharLimits platforms={selectedPlatforms} charCount={charCount} />
            )}
          </div>

          {/* Media section — IMAGE / VIDEO only */}
          {postType !== "TEXT" && (
            <div className="space-y-2 mt-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-5 text-foreground">
                  {postType === "IMAGE" ? "Images" : "Video"}
                </label>
                {selectedPlatforms.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Max {effectiveMaxFiles} {postType === "IMAGE" ? "image" : "video"}{effectiveMaxFiles !== 1 ? "s" : ""}
                    {restrictivePlatformLabel ? ` (${restrictivePlatformLabel} limit)` : ""}
                  </span>
                )}
              </div>

              {/* Existing kept media thumbnails */}
              {keptMedia.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium leading-4 text-muted-foreground flex items-center gap-1.5">
                    <CloudUpload className="w-3.5 h-3.5" />
                    Existing media — click × to remove
                  </p>
                  <div className="flex gap-2.5 flex-wrap">
                    {keptMedia.map((m) => (
                      <div
                        key={m.fileKey}
                        className="relative group w-28 h-28 rounded-xl border border-border bg-card overflow-hidden shadow-sm"
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
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/95 shadow-md flex items-center justify-center border border-black/10 hover:bg-red-50"
                          >
                            <X className="w-3 h-3 text-gray-700" strokeWidth={2.5} />
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
                />
              )}
              {slotsForNew === 0 && newFiles.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Maximum {effectiveMaxFiles} {postType === "IMAGE" ? "image" : "video"}{effectiveMaxFiles !== 1 ? "s" : ""} reached. Remove an existing file to add new ones.
                </p>
              )}

              {selectedPlatforms.length > 0 && (
                <MediaValidationPanel
                  platforms={selectedPlatforms}
                  postType={postType as "IMAGE" | "VIDEO"}
                  errors={allMediaErrors}
                  validating={validatingMedia}
                  hasFiles={newFiles.length > 0}
                />
              )}
            </div>
          )}

          {/* Platform configs */}
          {selectedAccounts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border/60">
              <PlatformConfigsPanel
                selectedAccounts={selectedAccounts}
                configs={platformConfigs}
                onChange={setPlatformConfigs}
                showErrors={showErrors}
                postType={postType as "IMAGE" | "VIDEO" | "TEXT"}
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
          <ScheduleDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} />

          <div className="mt-6">
            <Button
              onClick={save}
              disabled={saving || selectedAccountIds.length === 0 || hasAnyCharError || validatingMedia}
              className="w-full h-11 font-medium gap-2 text-sm"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
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
    <div className={cn("rounded-full overflow-hidden bg-muted flex-shrink-0 border border-white/20", dim)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <User className="h-3 w-3 text-muted-foreground" />
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
            <div className="absolute bottom-2 right-2 bg-black/65 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full backdrop-blur-sm tabular-nums">
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
            <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[120px]">{accountName || "Your Account"}</span>
            <span className="text-xs text-neutral-500 truncate">{handle}</span>
            <span className="text-neutral-400 text-xs">· now</span>
          </div>
          {caption && (
            <p className="text-xs text-neutral-900 dark:text-neutral-100 mt-1 leading-relaxed whitespace-pre-wrap line-clamp-3">{caption}</p>
          )}
          {media.length > 0 && <PreviewMediaCarousel media={media} aspectRatio="video" />}
          <div className="flex gap-4 mt-2 text-neutral-400">
            <button className="flex items-center gap-1 text-[11px] hover:text-blue-400 transition-colors">
              <MessageCircle className="h-3 w-3" /><span>Reply</span>
            </button>
            <button className="flex items-center gap-1 text-[11px] hover:text-green-400 transition-colors">
              <Repeat2 className="h-3 w-3" /><span>Repost</span>
            </button>
            <button className="flex items-center gap-1 text-[11px] hover:text-pink-400 transition-colors">
              <Heart className="h-3 w-3" /><span>Like</span>
            </button>
            <button className="flex items-center gap-1 text-[11px] hover:text-blue-400 transition-colors ml-auto">
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
          <p className="text-[11px] font-semibold text-neutral-900 dark:text-white truncate">{accountName || "your_account"}</p>
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
          <p className="text-[11px] text-neutral-900 dark:text-neutral-100 leading-relaxed line-clamp-2">
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
            <p className="text-[10px] text-neutral-500 truncate">Your Title · 1st</p>
            <p className="text-[10px] text-neutral-400">Just now · 🌐</p>
          </div>
          <span className="text-blue-600 font-semibold text-[10px] self-start flex-shrink-0 cursor-default">+ Follow</span>
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
          <button key={label} className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
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
            <p className="text-[10px] text-neutral-500">Just now · 🌐</p>
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
          <button key={label} className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
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
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] font-semibold px-1 py-0.5 rounded tabular-nums">0:00</div>
      </div>
      <div className="p-2.5 flex gap-2">
        <AccountAvatar src={avatarSrc} name={accountName} size={7} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-900 dark:text-white line-clamp-2 leading-snug">{title}</p>
          <p className="text-[10px] text-neutral-500 mt-0.5 truncate">{accountName || "Your Channel"}</p>
          <p className="text-[10px] text-neutral-400">0 views · Just now</p>
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
            <div className="-mt-1.5 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white font-bold">+</div>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Heart className="h-5 w-5" />
            <span className="text-[10px]">0</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <MessageCircle className="h-5 w-5" />
            <span className="text-[10px]">0</span>
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
            <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate max-w-[130px]">{accountName || "your_account"}</span>
            <span className="text-[10px] text-neutral-400 flex-shrink-0">· now</span>
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
      <div className="relative aspect-video w-full max-h-40 rounded-xl overflow-hidden bg-neutral-950 border border-border/40">
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
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
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
                  ? "w-4 h-1.5 bg-foreground"
                  : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
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
      <div className="h-[3px] w-full" style={{ background: accent.bar }} />

      {/* Platform header row */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30">
        <div className={cn("h-9 w-9 rounded-xl border flex items-center justify-center flex-shrink-0", accent.iconClass)}>
          {Icon ? <Icon className="h-4.5 w-4.5" /> : null}
        </div>
        <p className="text-sm font-semibold leading-5 text-foreground flex-1">
          {platformDisplayName[p] ?? platformDisplayName[platform] ?? platform}
        </p>
        <span className="text-xs font-medium leading-4 text-muted-foreground">
          {posts.length} account{posts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Platform-specific post preview */}
      <div className="px-4 py-3 border-b border-border/30">
        <div className="max-w-xs mx-auto sm:max-w-sm">
          {p === "X" && <XPreview {...previewProps} />}
          {p === "INSTAGRAM" && <InstagramPreview {...previewProps} />}
          {p === "LINKEDIN" && <LinkedInPreview {...previewProps} />}
          {p === "FACEBOOK" && <FacebookPreview {...previewProps} />}
          {p === "YOUTUBE" && <YouTubePreview {...previewProps} />}
          {p === "TIKTOK" && <TikTokPreview {...previewProps} />}
          {p === "THREADS" && <ThreadsPreview {...previewProps} />}
          {!["X","INSTAGRAM","LINKEDIN","FACEBOOK","YOUTUBE","TIKTOK","THREADS"].includes(p) && (
            <div className="rounded-lg bg-muted/40 border border-border/40 p-3">
              {caption && <p className="text-xs text-foreground/80 leading-relaxed line-clamp-4 whitespace-pre-wrap">{caption}</p>}
              {media.length > 0 && <PreviewMediaCarousel media={media} aspectRatio="video" />}
            </div>
          )}
        </div>
      </div>

      {/* Account list */}
      <div className="p-4 flex flex-wrap gap-2">
        {posts.map((post) => {
          const src = getImageUrl(post.connectedAccount?.profilePicLink);
          return (
            <div
              key={post.id}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-background/70 border border-border/50 shadow-sm"
            >
              <div className="relative h-6 w-6 rounded-full overflow-hidden flex-shrink-0 bg-muted border border-border/30">
                {src ? (
                  <Image src={src} alt={post.connectedAccount?.username ?? ""} fill sizes="20px" className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-2.5 w-2.5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-foreground/75 max-w-[140px] truncate leading-none">
                {post.connectedAccount?.username ?? "Account"}
              </span>
              <div className={cn(
                "h-2 w-2 rounded-full flex-shrink-0",
                post.postStatus === "PUBLISHED" ? "bg-emerald-500"
                  : post.postStatus === "FAILED" ? "bg-red-500"
                  : "bg-blue-400"
              )} />
            </div>
          );
        })}
      </div>
    </div>
  );
}



/* ─── Skeleton ────────────────────────────────────────────── */

function SkeletonDetailPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))]/95 backdrop-blur-sm">
        <div className="px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32 rounded hidden sm:block" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-44 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-lg hidden sm:block" />
            <Skeleton className="h-8 w-20 rounded-lg hidden sm:block" />
            <Skeleton className="h-8 w-24 rounded-lg hidden sm:block" />
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-4 space-y-3">
        {/* Hero strip skeleton */}
        <div className="rounded-xl bg-card border border-border/60 shadow-sm overflow-hidden">
          <Skeleton className="h-1 w-full rounded-none" />
          <div className="px-5 py-3 flex items-center gap-4">
            <Skeleton className="h-6 rounded-lg flex-1" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-40 rounded-lg hidden sm:block" />
            </div>
          </div>
        </div>

        {/* Main layout skeleton */}
        <div className="flex flex-col lg:flex-row gap-3 items-start">
          {/* Sidebar skeleton */}
          <div className="w-full lg:w-64 xl:w-72 flex-shrink-0 space-y-3">
            <div className="rounded-xl bg-card border border-border/60 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-muted/20">
                <Skeleton className="h-3.5 w-3.5 rounded flex-shrink-0" />
                <Skeleton className="h-4 w-20 rounded flex-1" />
              </div>
              <div className="p-4 space-y-2">
                {[100, 91, 83, 97, 76, 88].map((w, i) => (
                  <Skeleton key={i} className="h-2.5 rounded" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-card border border-border/60 shadow-sm px-4 py-3 flex items-center divide-x divide-border/40">
              <div className="flex-1 text-center pr-3 space-y-1">
                <Skeleton className="h-6 w-8 rounded mx-auto" />
                <Skeleton className="h-2.5 w-10 rounded mx-auto" />
              </div>
              <div className="flex-1 text-center pl-3 space-y-1">
                <Skeleton className="h-6 w-8 rounded mx-auto" />
                <Skeleton className="h-2.5 w-14 rounded mx-auto" />
              </div>
            </div>
          </div>

          {/* Platform sections skeleton */}
          <div className="flex-1 min-w-0 space-y-2.5">
            {[0, 1, 2].map((i) => (
              <SkeletonPlatformSection key={i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function SkeletonPlatformSection() {
  return (
    <div className="rounded-xl bg-card border border-border/60 shadow-sm overflow-hidden">
      <Skeleton className="h-[3px] w-full rounded-none" />
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
          <Skeleton className="h-4 w-24 rounded flex-1" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[80, 100, 90, 110, 85, 95].map((w, i) => (
            <Skeleton key={i} className="h-7 rounded-full" style={{ width: `${w}px` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

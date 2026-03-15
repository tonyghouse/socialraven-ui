"use client";

import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import { deletePostCollectionApi } from "@/service/deletePostCollectionApi";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { PostResponse } from "@/model/PostResponse";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import type { AccountGroup } from "@/model/AccountGroup";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/service/getImageUrl";
import { MediaPreview } from "@/components/generic/media-preview";
import { mapMediaResponseToMedia } from "@/lib/media-mapper";
import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import { fetchAccountGroupsApi } from "@/service/accountGroups";
import { AccountSelector } from "@/components/schedule-post/account-selection-sheet";
import EditImageForm from "@/components/schedule-post/edit-image-form";
import EditVideoForm from "@/components/schedule-post/edit-video-form";
import EditTextForm from "@/components/schedule-post/edit-text-form";

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

const POST_TYPE_EDIT_DESCRIPTIONS: Record<string, string> = {
  IMAGE:
    "Edit your caption, add or remove images, configure platform-specific settings, and update the schedule time.",
  VIDEO:
    "Edit your description, replace or add videos, configure platform-specific settings, and update the schedule time.",
  TEXT: "Edit your content, configure platform-specific settings, and update the schedule time.",
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

/* ─── StepCard ────────────────────────────────────────────── */

function StepCard({
  step,
  title,
  description,
  children,
  complete,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
  complete?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card border rounded-2xl shadow-sm overflow-hidden transition-all duration-300",
        complete ? "border-primary/30" : "border-border"
      )}
    >
      <div className="flex items-start gap-4 px-6 py-4 border-b border-border/60 bg-muted/20">
        <div
          className={cn(
            "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 transition-all duration-300",
            complete
              ? "bg-primary/15"
              : "bg-muted border border-border/60"
          )}
        >
          {complete ? (
            <CheckCircle2 className="w-4 h-4 text-primary" />
          ) : (
            <span className="text-xs font-bold text-muted-foreground">
              {step}
            </span>
          )}
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
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
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Red accent top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-400 to-red-600" />

        <div className="p-6">
          {/* Icon + heading */}
          <div className="flex items-start gap-4 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center flex-shrink-0">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2
                id="delete-modal-title"
                className="text-base font-semibold text-foreground leading-snug"
              >
                Delete this collection?
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          {/* Collection preview card */}
          <div className="rounded-xl border border-border/50 bg-muted/30 p-4 mb-5 space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Collection
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                {collection.title}
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
                <span className="font-semibold text-foreground tabular-nums">
                  {collection.posts.length}
                </span>{" "}
                post{collection.posts.length !== 1 ? "s" : ""} across{" "}
                <span className="font-semibold text-foreground tabular-nums">
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
              className="flex-1 px-4 py-2.5 rounded-xl border border-border/60 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!canDelete || isDeleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>([]);
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
  }, [collectionId, getToken]);

  /* ── Load accounts (needed for edit mode) ── */
  useEffect(() => {
    if (!isLoaded) return;
    (async () => {
      try {
        setAccountsLoading(true);
        const [accounts, groups] = await Promise.all([
          fetchAllConnectedAccountsApi(getToken),
          fetchAccountGroupsApi(getToken),
        ]);
        setConnectedAccounts(accounts);
        setAccountGroups(groups);
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
    return <SkeletonDetailPage />;
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-sm w-full rounded-2xl bg-card border border-border/60 p-8 shadow-sm text-center">
          <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            Collection not found
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            This collection couldn&apos;t be loaded. It may have been deleted.
          </p>
          <button
            onClick={() => router.push("/scheduled-posts")}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scheduled Posts
          </button>
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

  const firstMedia = collection.media[0]
    ? { url: collection.media[0].fileUrl, mimeType: collection.media[0].mimeType }
    : null;

  // For the edit mode header platform badges
  const editSelectedPlatforms = [
    ...new Set(
      connectedAccounts
        .filter((a) => selectedAccountIds.includes(a.providerUserId))
        .map((a) => a.platform.toLowerCase())
    ),
  ];
  const editSelectedCount = selectedAccountIds.length;

  return (
    <main className="min-h-screen bg-background">
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
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
          {/* Sticky edit header */}
          <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
            <div className="px-4 sm:px-6">
              <div className="flex items-center gap-3 h-16">
                <button
                  onClick={exitEditMode}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    Back
                  </span>
                </button>
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Pencil className="w-[18px] h-[18px] text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-foreground tracking-tight leading-tight">
                    Edit Collection
                  </h1>
                  <p className="text-xs text-muted-foreground leading-tight truncate">
                    {collection.title}
                  </p>
                </div>
                {editSelectedCount > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-semibold text-primary flex-shrink-0 border border-primary/20">
                    <Zap className="w-3 h-3" />
                    {editSelectedCount}{" "}
                    {editSelectedCount === 1 ? "account" : "accounts"}
                  </div>
                )}
              </div>

              {/* Platform badges row */}
              {editSelectedPlatforms.length > 0 && (
                <div className="flex items-center gap-1.5 pb-2.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    Posting to:
                  </span>
                  {editSelectedPlatforms.map((p) => (
                    <span
                      key={p}
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full border",
                        PLATFORM_BADGE_STYLES[p] ??
                          "bg-muted text-foreground border-border"
                      )}
                    >
                      {PLATFORM_LABELS[p] ?? p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Edit step cards */}
          <div className="px-4 sm:px-6 py-6 space-y-4">
            {/* Step 1 — Content Type (locked) */}
            <StepCard
              step={1}
              title="Content Type"
              description="Post type is locked and cannot be changed after creation."
              complete={true}
            >
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/40">
                <div
                  className={cn(
                    "h-9 w-9 rounded-xl border flex items-center justify-center flex-shrink-0",
                    type.className
                  )}
                >
                  <TypeIcon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {type.label} Post
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Format is fixed for this collection
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted border border-border/50 px-2.5 py-1 rounded-lg">
                  <Lock className="h-3 w-3" />
                  Locked
                </div>
              </div>
            </StepCard>

            {/* Step 2 — Select Accounts */}
            <StepCard
              step={2}
              title="Select Accounts"
              description="Choose which social profiles this post will be published to. You can add or remove accounts."
              complete={selectedAccountIds.length > 0}
            >
              <AccountSelector
                postType={collection.postCollectionType}
                accounts={connectedAccounts}
                groups={accountGroups}
                selectedAccountIds={selectedAccountIds}
                onChange={setSelectedAccountIds}
                loading={accountsLoading}
              />
            </StepCard>

            {/* Step 3 — Compose & Schedule */}
            <StepCard
              step={3}
              title="Edit Content & Schedule"
              description={
                POST_TYPE_EDIT_DESCRIPTIONS[collection.postCollectionType] ??
                "Edit your post content, platform settings, and schedule."
              }
            >
              {collection.postCollectionType === "IMAGE" && (
                <EditImageForm
                  collection={collection}
                  connectedAccounts={connectedAccounts}
                  selectedIds={selectedAccountIds}
                  collectionId={collectionId}
                  onSuccess={handleEditSuccess}
                />
              )}
              {collection.postCollectionType === "VIDEO" && (
                <EditVideoForm
                  collection={collection}
                  connectedAccounts={connectedAccounts}
                  selectedIds={selectedAccountIds}
                  collectionId={collectionId}
                  onSuccess={handleEditSuccess}
                />
              )}
              {collection.postCollectionType === "TEXT" && (
                <EditTextForm
                  collection={collection}
                  connectedAccounts={connectedAccounts}
                  selectedIds={selectedAccountIds}
                  collectionId={collectionId}
                  onSuccess={handleEditSuccess}
                />
              )}
            </StepCard>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          VIEW MODE
      ══════════════════════════════════════════════ */}
      {mode === "view" && (
        <>
          {/* Sticky Breadcrumb Header */}
          <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/60">
            <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              <nav className="flex items-center gap-1.5 text-sm min-w-0">
                <button
                  onClick={() => router.push("/scheduled-posts")}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline font-medium">
                    Scheduled Posts
                  </span>
                </button>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                <span className="font-medium text-foreground truncate">
                  {collection.title}
                </span>
              </nav>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Edit button */}
                {isScheduled && (
                  <button
                    onClick={enterEditMode}
                    className="hidden sm:flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-border/60 text-foreground hover:bg-muted/50 transition-all text-xs font-semibold"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                )}

                {/* Delete button */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="hidden sm:flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-xs font-semibold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>

                <button
                  onClick={() => router.push("/schedule-post")}
                  className="hidden sm:flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-all text-xs font-semibold shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Post
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 sm:px-6 py-6 space-y-5">
            {/* Hero card */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-primary to-indigo-500" />
              <div className="px-6 pt-6 pb-5">
                <div className="flex flex-wrap items-start gap-x-4 gap-y-3 mb-4">
                  <h1 className="text-2xl font-bold text-foreground tracking-tight flex-1 min-w-0">
                    {collection.title}
                  </h1>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border", type.className)}>
                      <TypeIcon className="h-3.5 w-3.5" />
                      {type.label}
                    </span>
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", status.className)}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>
                    <div className="flex items-center gap-1.5 sm:hidden">
                      {isScheduled && (
                        <button onClick={enterEditMode} className="h-7 w-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => setShowDeleteModal(true)} className="h-7 w-7 rounded-lg border border-red-200 dark:border-red-800/40 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                {collection.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {collection.description}
                  </p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground bg-muted/40 border border-border/40">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formattedDate} · {formattedTime}</span>
                    {isScheduled && (
                      <button onClick={enterEditMode} className="ml-0.5 hover:text-foreground transition-colors" title="Edit schedule">
                        <Pencil className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {Object.keys(groupedPosts).map((plat) => {
                      const platUpper = plat.toUpperCase();
                      const PlatIcon = PLATFORM_ICONS[plat] ?? PLATFORM_ICONS[plat.toLowerCase()];
                      return (
                        <div
                          key={plat}
                          title={platformDisplayName[platUpper] ?? plat}
                          className={cn(
                            "h-7 w-7 rounded-lg border flex items-center justify-center flex-shrink-0",
                            platformIconStyle[platUpper] ?? "text-muted-foreground bg-muted/50 border-border/60"
                          )}
                        >
                          {PlatIcon ? <PlatIcon className="h-3.5 w-3.5" /> : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Main layout: sidebar + platform sections */}
            <div className="flex flex-col lg:flex-row gap-5 items-start">
              {/* Left sidebar */}
              <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
                {/* Schedule card */}
                <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/40 bg-muted/20">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm font-semibold text-foreground flex-1">Schedule</p>
                    {isScheduled && (
                      <button onClick={enterEditMode} className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all" title="Edit schedule">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="p-5 space-y-4">
                    {isScheduled && getCountdown(scheduledDate) && (
                      <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-5 text-center">
                        <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5">Publishing in</p>
                        <p className="text-3xl font-bold text-primary tabular-nums tracking-tight">{getCountdown(scheduledDate)}</p>
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

                {/* Caption card */}
                <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/40 bg-muted/20">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm font-semibold text-foreground flex-1">Caption</p>
                    {isScheduled && (
                      <button onClick={enterEditMode} className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="p-5">
                    {captionText ? (
                      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-10 whitespace-pre-wrap">{captionText}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic">No caption specified</p>
                    )}
                    {captionText && (
                      <p className="text-xs text-muted-foreground/40 tabular-nums mt-3">{captionText.length} characters</p>
                    )}
                  </div>
                </div>

                {/* Media carousel */}
                {collection.media.length > 0 && (
                  <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/40 bg-muted/20">
                      <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm font-semibold text-foreground flex-1">
                        Media <span className="font-normal text-muted-foreground">· {collection.media.length}</span>
                      </p>
                      {isScheduled && collection.postCollectionType !== "TEXT" && (
                        <button onClick={enterEditMode} className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="p-4">
                      <MediaCarousel media={collection.media} />
                    </div>
                  </div>
                )}

                {/* Stats card with platform breakdown */}
                <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 flex items-center divide-x divide-border/40">
                    <div className="flex-1 text-center pr-4">
                      <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{collection.posts.length}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-1.5">Posts</p>
                    </div>
                    <div className="flex-1 text-center pl-4">
                      <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{platformCount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-1.5">Platforms</p>
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

              {/* Platform sections */}
              <div className="flex-1 min-w-0 space-y-4">
                {collection.posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border/40 bg-muted/20">
                    <LayoutGrid className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No posts in this collection</p>
                  </div>
                ) : (
                  Object.entries(groupedPosts).map(([platform, posts]) => (
                    <PlatformSection
                      key={platform}
                      platform={platform}
                      posts={posts}
                      caption={captionText}
                      firstMedia={firstMedia}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Mobile bottom actions */}
            <div className="sm:hidden flex gap-3 pt-1 pb-6">
              {isScheduled && (
                <button
                  onClick={enterEditMode}
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-border/60 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              )}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-red-200 dark:border-red-800/40 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </main>
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

/* Generic media thumbnail used inside previews */
function PreviewMedia({ media }: { media: { url: string; mimeType: string } | null }) {
  if (!media) return null;
  const isVideo = media.mimeType.startsWith("video/");
  return (
    <div className="w-full overflow-hidden rounded-lg border border-black/10 dark:border-white/10 mt-2">
      {isVideo ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={media.url} className="w-full max-h-56 object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.url} alt="Post media" className="w-full max-h-56 object-cover" />
      )}
    </div>
  );
}

/* ── X (Twitter) preview ── */
function XPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string } | null;
  accountName: string; avatarSrc: string | null;
}) {
  const handle = "@" + (accountName.replace(/\s+/g, "").toLowerCase() || "account");
  return (
    <div className="bg-white dark:bg-black rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 font-sans">
      <div className="flex gap-3">
        <AccountAvatar src={avatarSrc} name={accountName} size={10} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-neutral-900 dark:text-white">{accountName || "Your Account"}</span>
            <span className="text-sm text-neutral-500">{handle}</span>
            <span className="text-neutral-400 text-sm">·</span>
            <span className="text-sm text-neutral-500">now</span>
          </div>
          {caption && (
            <p className="text-sm text-neutral-900 dark:text-neutral-100 mt-1 leading-relaxed whitespace-pre-wrap line-clamp-5">{caption}</p>
          )}
          <PreviewMedia media={media} />
          <div className="flex gap-6 mt-3 text-neutral-400 text-xs">
            <span>Reply</span>
            <span>Repost</span>
            <span>Like</span>
            <span>Views</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Instagram preview ── */
function InstagramPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string } | null;
  accountName: string; avatarSrc: string | null;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600">
          <AccountAvatar src={avatarSrc} name={accountName} size={8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{accountName || "your_account"}</p>
          <p className="text-[10px] text-neutral-500">Sponsored</p>
        </div>
        <span className="text-neutral-400 text-lg leading-none">···</span>
      </div>
      {/* Square media */}
      {media ? (
        <div className="w-full aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          {media.mimeType.startsWith("video/") ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={media.url} className="w-full h-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.url} alt="" className="w-full h-full object-cover" />
          )}
        </div>
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
          <span className="text-neutral-400 text-xs">No media</span>
        </div>
      )}
      {/* Actions + caption */}
      <div className="px-3 py-2.5">
        <div className="flex gap-3 mb-2 text-neutral-800 dark:text-neutral-200">
          <span className="text-lg">♡</span>
          <span className="text-lg">🗨</span>
          <span className="text-lg rotate-12">↗</span>
          <span className="ml-auto text-lg">⊡</span>
        </div>
        {caption && (
          <p className="text-xs text-neutral-900 dark:text-neutral-100 leading-relaxed line-clamp-3">
            <span className="font-semibold">{accountName || "your_account"}</span>{" "}{caption}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── LinkedIn preview ── */
function LinkedInPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string } | null;
  accountName: string; avatarSrc: string | null;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 font-sans overflow-hidden">
      <div className="p-4">
        <div className="flex gap-2.5 mb-3">
          <AccountAvatar src={avatarSrc} name={accountName} size={10} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{accountName || "Your Name"}</p>
            <p className="text-xs text-neutral-500 truncate">Your Title • 1st</p>
            <p className="text-xs text-neutral-400">Just now · 🌐</p>
          </div>
          <span className="text-blue-600 font-semibold text-xs self-start cursor-default">+ Follow</span>
        </div>
        {caption && (
          <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed line-clamp-5 whitespace-pre-wrap">{caption}</p>
        )}
      </div>
      {media && (
        <div className="border-t border-neutral-100 dark:border-neutral-700 overflow-hidden">
          <PreviewMedia media={media} />
        </div>
      )}
      <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-700 flex gap-4 text-xs text-neutral-500">
        <span>👍 Like</span>
        <span>💬 Comment</span>
        <span>🔁 Repost</span>
        <span>↗ Send</span>
      </div>
    </div>
  );
}

/* ── Facebook preview ── */
function FacebookPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string } | null;
  accountName: string; avatarSrc: string | null;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 font-sans overflow-hidden">
      <div className="p-4">
        <div className="flex gap-2.5 mb-3">
          <AccountAvatar src={avatarSrc} name={accountName} size={10} />
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{accountName || "Your Page"}</p>
            <p className="text-xs text-neutral-500">Just now · 🌐</p>
          </div>
        </div>
        {caption && (
          <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed line-clamp-5 whitespace-pre-wrap">{caption}</p>
        )}
      </div>
      {media && (
        <div className="overflow-hidden border-t border-neutral-100 dark:border-neutral-700">
          <PreviewMedia media={media} />
        </div>
      )}
      <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-700 flex gap-4 text-xs text-neutral-500">
        <span>👍 Like</span>
        <span>💬 Comment</span>
        <span>↗ Share</span>
      </div>
    </div>
  );
}

/* ── YouTube preview ── */
function YouTubePreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string } | null;
  accountName: string; avatarSrc: string | null;
}) {
  const title = caption?.split("\n")[0]?.slice(0, 100) || "Your Video Title";
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden font-sans border border-neutral-200 dark:border-neutral-700">
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-neutral-900 overflow-hidden">
        {media ? (
          media.mimeType.startsWith("video/") ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={media.url} className="w-full h-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.url} alt="" className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/30 text-xs">Thumbnail</span>
          </div>
        )}
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">0:00</div>
      </div>
      <div className="p-3 flex gap-3">
        <AccountAvatar src={avatarSrc} name={accountName} size={9} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-2 leading-snug">{title}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{accountName || "Your Channel"}</p>
          <p className="text-xs text-neutral-400">0 views · Just now</p>
        </div>
      </div>
    </div>
  );
}

/* ── TikTok preview ── */
function TikTokPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string } | null;
  accountName: string; avatarSrc: string | null;
}) {
  return (
    <div className="bg-black rounded-xl overflow-hidden font-sans relative border border-neutral-800">
      <div className="relative w-full aspect-[9/16] max-h-72 overflow-hidden">
        {media ? (
          media.mimeType.startsWith("video/") ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={media.url} className="w-full h-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.url} alt="" className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
            <span className="text-white/30 text-xs">Video</span>
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
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
          <div className="flex flex-col items-center gap-0.5"><span className="text-lg">♡</span><span className="text-[10px]">0</span></div>
          <div className="flex flex-col items-center gap-0.5"><span className="text-lg">🗨</span><span className="text-[10px]">0</span></div>
        </div>
      </div>
    </div>
  );
}

/* ── Threads preview ── */
function ThreadsPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string } | null;
  accountName: string; avatarSrc: string | null;
}) {
  return (
    <div className="bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 font-sans">
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <AccountAvatar src={avatarSrc} name={accountName} size={10} />
          <div className="w-0.5 flex-1 bg-neutral-200 dark:bg-neutral-700 mt-2 min-h-4" />
        </div>
        <div className="flex-1 min-w-0 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">{accountName || "your_account"}</span>
            <span className="text-xs text-neutral-400">now</span>
          </div>
          {caption && <p className="text-sm text-neutral-800 dark:text-neutral-200 mt-1 leading-relaxed whitespace-pre-wrap line-clamp-5">{caption}</p>}
          <PreviewMedia media={media} />
          <div className="flex gap-4 mt-3 text-neutral-400">
            <span className="text-base">♡</span>
            <span className="text-base">🗨</span>
            <span className="text-base rotate-12">↗</span>
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
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-border/40">
        {isVideo ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={current.fileUrl} className="w-full h-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.fileUrl} alt="Media" className="w-full h-full object-cover" />
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
  firstMedia,
}: {
  platform: string;
  posts: PostResponse[];
  caption: string;
  firstMedia: { url: string; mimeType: string } | null;
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

  const previewProps = { caption, media: firstMedia, accountName: previewName, avatarSrc: previewAvatar };

  return (
    <div className={cn("rounded-2xl border shadow-sm overflow-hidden", accent.cardBg, accent.cardBorder)}>
      <div className="h-[3px] w-full" style={{ background: accent.bar }} />

      {/* Platform header row */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30">
        <div className={cn("h-9 w-9 rounded-xl border flex items-center justify-center flex-shrink-0", accent.iconClass)}>
          {Icon ? <Icon className="h-4.5 w-4.5" /> : null}
        </div>
        <p className="text-sm font-semibold text-foreground flex-1">
          {platformDisplayName[p] ?? platformDisplayName[platform] ?? platform}
        </p>
        <span className="text-xs text-muted-foreground font-medium">
          {posts.length} account{posts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Platform-specific post preview */}
      <div className="p-5 border-b border-border/30">
        {p === "X" && <XPreview {...previewProps} />}
        {p === "INSTAGRAM" && <InstagramPreview {...previewProps} />}
        {p === "LINKEDIN" && <LinkedInPreview {...previewProps} />}
        {p === "FACEBOOK" && <FacebookPreview {...previewProps} />}
        {p === "YOUTUBE" && <YouTubePreview {...previewProps} />}
        {p === "TIKTOK" && <TikTokPreview {...previewProps} />}
        {p === "THREADS" && <ThreadsPreview {...previewProps} />}
        {!["X","INSTAGRAM","LINKEDIN","FACEBOOK","YOUTUBE","TIKTOK","THREADS"].includes(p) && (
          <div className="rounded-lg bg-muted/40 border border-border/40 p-4">
            {caption && <p className="text-sm text-foreground/80 leading-relaxed line-clamp-5 whitespace-pre-wrap">{caption}</p>}
            {firstMedia && <PreviewMedia media={firstMedia} />}
          </div>
        )}
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
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/60">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
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

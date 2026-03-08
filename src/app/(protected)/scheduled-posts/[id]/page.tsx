"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { ArrowLeft, Warning, Calendar, Clock, Stack, CheckCircle, XCircle, CaretRight, Plus, Image as ImageIcon, Video, FileText, User, SquaresFour, Trash, PencilSimple, CircleNotch, CalendarDots, AlignLeft, TextT } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import { deletePostCollectionApi } from "@/service/deletePostCollectionApi";
import { updatePostCollectionApi } from "@/service/updatePostCollectionApi";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { PostResponse } from "@/model/PostResponse";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/service/getImageUrl";
import { MediaPreview } from "@/components/generic/media-preview";
import { mapMediaResponseToMedia } from "@/lib/media-mapper";

/* ─── Config maps ─────────────────────────────────────────── */

const statusConfig: Record<
  string,
  { label: string; Icon: typeof CheckCircle; className: string }
> = {
  SCHEDULED: {
    label: "Scheduled",
    Icon: Clock,
    className:
      "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  },
  PUBLISHED: {
    label: "Completed",
    Icon: CheckCircle,
    className:
      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  },
  PARTIAL_SUCCESS: {
    label: "Partially Completed",
    Icon: Warning,
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
  INSTAGRAM: "InstagramLogo",
  LINKEDIN: "LinkedIn",
  YOUTUBE: "YouTube",
  FACEBOOK: "FacebookLogo",
  X: "X (TwitterLogo)",
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
    bar: string;          // CSS gradient for the 3 px top accent bar
    cardBg: string;       // subtle tinted card background
    cardBorder: string;   // colored border
    iconClass: string;    // icon container: gradient bg + text + shadow
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
    cardBg:
      "bg-neutral-50/90 dark:bg-neutral-900/50",
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
    cardBg:
      "bg-neutral-50/90 dark:bg-neutral-900/50",
    cardBorder: "border-neutral-200/80 dark:border-neutral-700/50",
    iconClass:
      "bg-neutral-900 border-transparent text-white shadow-md shadow-neutral-900/20",
  },
  THREADS: {
    bar: "linear-gradient(90deg,#101010 0%,#606060 50%,#101010 100%)",
    cardBg:
      "bg-neutral-50/90 dark:bg-neutral-900/50",
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

/* ─── Helpers ─────────────────────────────────────────────── */

/** Format a JS Date → "YYYY-MM-DD" in local time */
function toLocalDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Format a JS Date → "HH:MM" in local time */
function toLocalTimeString(d: Date) {
  return d.toTimeString().slice(0, 5);
}

/** Build UTC ISO string from a local date string + time string */
function buildUtcIso(localDate: string, localTime: string): string {
  return new Date(`${localDate}T${localTime}:00`).toISOString();
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
  const scheduledDate = new Date(collection.scheduledTime);
  const [typed, setTyped] = useState("");
  const confirmWord = "DELETE";
  const canDelete = typed === confirmWord;

  // Trap focus inside modal
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
              <Trash className="h-5 w-5 text-red-600 dark:text-red-400" />
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
                  <CircleNotch className="h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4" />
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

/* ─── Edit Modal ──────────────────────────────────────────── */

interface EditModalProps {
  collection: PostCollectionResponse;
  onCancel: () => void;
  onSave: (title: string, description: string, localDate: string, localTime: string) => void;
  isSaving: boolean;
}

function EditModal({ collection, onCancel, onSave, isSaving }: EditModalProps) {
  const scheduledDate = new Date(collection.scheduledTime);
  const isScheduled = collection.overallStatus === "SCHEDULED";

  const [title, setTitle] = useState(collection.title ?? "");
  const [description, setDescription] = useState(
    collection.posts[0]?.description?.trim() ||
      collection.description?.trim() ||
      ""
  );
  const [localDate, setLocalDate] = useState(toLocalDateString(scheduledDate));
  const [localTime, setLocalTime] = useState(toLocalTimeString(scheduledDate));

  const canSave = title.trim().length > 0;

  // Compute minimum selectable date (today)
  const today = toLocalDateString(new Date());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary/70 to-primary flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent/10 border border-border/40 flex items-center justify-center">
              <PencilSimple className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2
                id="edit-modal-title"
                className="text-sm font-semibold text-foreground"
              >
                Edit Collection
              </h2>
              <p className="text-xs text-muted-foreground">
                Changes apply to all posts in this collection
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              <TextT className="h-3.5 w-3.5" />
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Give this collection a name…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Caption / Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              <AlignLeft className="h-3.5 w-3.5" />
              Caption
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Write your post caption here…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Schedule date/time — only editable if still SCHEDULED */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              <CalendarDots className="h-3.5 w-3.5" />
              Scheduled time
              {!isScheduled && (
                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground normal-case">
                  locked
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={localDate}
                min={today}
                onChange={(e) => setLocalDate(e.target.value)}
                disabled={!isScheduled}
                className="px-3.5 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                type="time"
                value={localTime}
                onChange={(e) => setLocalTime(e.target.value)}
                disabled={!isScheduled}
                className="px-3.5 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {!isScheduled && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <Warning className="h-3 w-3 text-amber-500 flex-shrink-0" />
                Schedule time cannot be changed after publishing has started.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 flex gap-2.5 flex-shrink-0 bg-card">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border/60 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(title, description, localDate, localTime)}
            disabled={!canSave || isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <CircleNotch className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Save changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */

export default function ScheduledCollectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getToken } = useAuth();
  const collectionId = params.id as string;

  const [collection, setCollection] =
    useState<PostCollectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!collectionId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPostCollectionByIdApi(getToken, collectionId);
        setCollection(data);
      } catch {
        setError("Unable to load this collection.");
      } finally {
        setLoading(false);
      }
    })();
  }, [collectionId, getToken]);

  // Auto-dismiss toast
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
      setToast({ type: "error", message: "Failed to delete. Please try again." });
    }
  };

  const handleSave = async (
    title: string,
    description: string,
    localDate: string,
    localTime: string
  ) => {
    setIsSaving(true);
    try {
      const payload: Record<string, string> = { title, description };
      if (collection?.overallStatus === "SCHEDULED") {
        payload.scheduledTime = buildUtcIso(localDate, localTime);
      }
      const updated = await updatePostCollectionApi(getToken, collectionId, payload);
      setCollection(updated);
      setShowEditModal(false);
      setToast({ type: "success", message: "Collection updated successfully." });
    } catch {
      setToast({ type: "error", message: "Failed to save. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <SkeletonDetailPage />;
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-sm w-full rounded-2xl bg-card border border-border/60 p-8 shadow-sm text-center">
          <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <Warning className="h-7 w-7 text-red-500" />
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
  const scheduledDate = new Date(collection.scheduledTime);
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

  const accentGradient =
    collection.overallStatus === "PUBLISHED"
      ? "from-emerald-400 to-emerald-500"
      : collection.overallStatus === "FAILED"
      ? "from-red-400 to-red-500"
      : collection.overallStatus === "PARTIAL_SUCCESS"
      ? "from-amber-400 to-amber-500"
      : "from-blue-400 to-blue-500";

  const platformCount = Object.keys(groupedPosts).length;

  // Caption: use first post's description as the actual content being posted
  const captionText =
    collection.posts[0]?.description?.trim() ||
    collection.description?.trim() ||
    "";

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
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
          ) : (
            <Warning className="h-4 w-4 flex-shrink-0" />
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

      {/* Edit Modal */}
      {showEditModal && (
        <EditModal
          collection={collection}
          onCancel={() => setShowEditModal(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Sticky Breadcrumb Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            <button
              onClick={() => router.push("/scheduled-posts")}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <Stack className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">
                Scheduled Posts
              </span>
            </button>
            <CaretRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
            <span className="font-medium text-foreground truncate">
              {collection.title}
            </span>
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Edit button */}
            <button
              onClick={() => setShowEditModal(true)}
              className="hidden sm:flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-border/60 text-foreground hover:bg-muted/50 transition-all text-xs font-semibold"
            >
              <PencilSimple className="h-3.5 w-3.5" />
              Edit
            </button>

            {/* Delete button */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="hidden sm:flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-xs font-semibold"
            >
              <Trash className="h-3.5 w-3.5" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Collection Hero ── */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
          {/* Status accent bar */}
          <div
            className={cn("h-1 w-full bg-gradient-to-r", accentGradient)}
          />

          <div className="p-6 sm:p-8">
            {/* Badges */}
            <div className="flex items-center gap-2.5 mb-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border",
                  type.className
                )}
              >
                <TypeIcon className="h-3 w-3" />
                {type.label}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                  status.className
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
            </div>

            {/* Title + Description + mobile actions */}
            <div className="mb-5">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight mb-2">
                  {collection.title}
                </h1>

                {/* Mobile action buttons */}
                <div className="flex items-center gap-2 sm:hidden flex-shrink-0 mt-1">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="h-8 w-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <PencilSimple className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="h-8 w-8 rounded-lg border border-red-200 dark:border-red-800/40 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {collection.description && (
                <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                  {collection.description}
                </p>
              )}
            </div>

            {/* Date chip */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/40 w-fit mb-6">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                  {isScheduled ? "Scheduled for" : "Was scheduled for"}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formattedDate} · {formattedTime}
                </p>
              </div>
              {isScheduled && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="ml-2 h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  title="Edit schedule"
                >
                  <PencilSimple className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Platform summary row */}
            <div className="flex items-center gap-2 flex-wrap">
              {Object.keys(groupedPosts).map((platform) => {
                const Icon = PLATFORM_ICONS[platform];
                return Icon ? (
                  <span
                    key={platform}
                    className={cn(
                      "h-7 w-7 rounded-lg border flex items-center justify-center shadow-sm",
                      platformIconStyle[platform] ??
                        "text-muted-foreground bg-muted/50 border-border/60"
                    )}
                    title={platformDisplayName[platform] ?? platform}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                ) : null;
              })}
              <span className="text-xs text-muted-foreground">
                {platformCount} platform{platformCount !== 1 ? "s" : ""} · {collection.posts.length} account{collection.posts.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ── Content & Media row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Post Caption */}
          <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-muted/20 flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Post Caption
                </p>
                <p className="text-xs text-muted-foreground">
                  Content scheduled for publishing
                </p>
              </div>
              {isScheduled && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all flex-shrink-0"
                  title="Edit caption"
                >
                  <PencilSimple className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="p-5 flex-1">
              {captionText ? (
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {captionText}
                </p>
              ) : (
                <div>
                  <div className="space-y-2.5">
                    {[100, 91, 83, 97, 76, 88, 94, 71].map((w, i) => (
                      <div
                        key={i}
                        className="h-3 rounded-md bg-muted/70"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/50 mt-4 pt-3 border-t border-border/30 italic">
                    No caption specified for this collection
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Media Attachments */}
          <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-muted/20 flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Attachments
                </p>
                <p className="text-xs text-muted-foreground">
                  {collection.media.length > 0
                    ? `${collection.media.length} file${collection.media.length !== 1 ? "s" : ""} attached`
                    : "No media files"}
                </p>
              </div>
            </div>
            <div className="p-5 flex-1">
              {collection.media.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {collection.media.map((m, i) => (
                    <div
                      key={m.id ?? i}
                      className="rounded-xl overflow-hidden border border-border/40 shadow-sm"
                    >
                      <MediaPreview
                        media={mapMediaResponseToMedia(m)}
                        className="h-20 w-20"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-xl bg-muted/60 border border-border/30"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/50 mt-4 pt-3 border-t border-border/30 italic">
                    {collection.postCollectionType === "TEXT"
                      ? "Text post — no media attachments"
                      : "No media files attached"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Platform Cards ── */}
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <SquaresFour className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Platforms
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-muted border border-border/40 text-xs font-semibold text-muted-foreground tabular-nums">
              {platformCount}
            </span>
          </div>

          {collection.posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-border/40 bg-muted/20">
              <SquaresFour className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No posts in this collection
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(groupedPosts).map(([platform, posts]) => (
                <PlatformCircleCard
                  key={platform}
                  platform={platform}
                  posts={posts}
                  onPostClick={(id) => router.push(`/posts/${id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom action bar (mobile) ── */}
        <div className="sm:hidden flex gap-3 pt-2 pb-8">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-border/60 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            <PencilSimple className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-red-200 dark:border-red-800/40 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </main>
  );
}

/* ─── Platform Circle Card ────────────────────────────────── */

function PlatformCircleCard({
  platform,
  posts,
  onPostClick,
}: {
  platform: string;
  posts: PostResponse[];
  onPostClick: (id: number) => void;
}) {
  const Icon = PLATFORM_ICONS[platform];
  const accent = platformAccent[platform] ?? platformAccentFallback;

  const displayedPosts = posts.slice(0, 10);
  const extraCount = posts.length - 10;

  return (
    <div
      className={cn(
        "rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md",
        accent.cardBg,
        accent.cardBorder
      )}
    >
      {/* Gradient accent bar */}
      <div
        className="h-[3px] w-full flex-shrink-0"
        style={{ background: accent.bar }}
      />

      <div className="p-5 flex flex-col gap-4 flex-1 relative overflow-hidden">
        {/* Faint watermark icon */}
        {Icon && (
          <div className="absolute -right-2 -top-1 pointer-events-none select-none">
            <Icon className="h-20 w-20 opacity-[0.045] text-foreground" />
          </div>
        )}

        {/* Platform header */}
        <div className="flex items-center gap-3 relative">
          <div
            className={cn(
              "h-11 w-11 rounded-xl border flex items-center justify-center flex-shrink-0",
              accent.iconClass
            )}
          >
            {Icon ? <Icon className="h-5 w-5" /> : null}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {platformDisplayName[platform] ?? platform}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {posts.length} account{posts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Stacked avatar circles — each individually clickable */}
        <div className="flex items-center">
          {displayedPosts.map((post, i) => {
            const src = getImageUrl(post.connectedAccount?.profilePicLink);
            return (
              <button
                key={post.id}
                onClick={() => onPostClick(post.id)}
                title={post.connectedAccount?.username ?? "View post"}
                style={{
                  marginLeft: i === 0 ? 0 : "-10px",
                  zIndex: displayedPosts.length - i,
                }}
                className="relative h-9 w-9 rounded-full border-2 border-card overflow-hidden bg-muted flex-shrink-0 shadow-sm hover:scale-110 hover:z-50 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {src ? (
                  <Image
                    src={src}
                    alt={post.connectedAccount?.username ?? ""}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </button>
            );
          })}
          {extraCount > 0 && (
            <div
              style={{ marginLeft: "-10px", zIndex: 0 }}
              className="relative h-9 w-9 rounded-full border-2 border-card bg-muted flex items-center justify-center flex-shrink-0 shadow-sm"
            >
              <span className="text-[10px] font-semibold text-muted-foreground">
                +{extraCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────── */

function SkeletonDetailPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header skeleton */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero card skeleton */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
          <Skeleton className="h-1 w-full rounded-none" />
          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-9 w-3/4 rounded-xl" />
              <Skeleton className="h-5 w-full rounded-lg" />
              <Skeleton className="h-5 w-2/3 rounded-lg" />
            </div>
            <Skeleton className="h-14 w-72 rounded-xl" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded ml-1" />
            </div>
          </div>
        </div>

        {/* Content & Media skeleton row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-muted/20">
              <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-36 rounded" />
              </div>
            </div>
            <div className="p-5 space-y-2.5">
              {[100, 91, 83, 97, 76, 88, 94, 71].map((w, i) => (
                <Skeleton key={i} className="h-3 rounded-md" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-muted/20">
              <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-4 gap-2.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section header skeleton */}
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-24 rounded-lg" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCircleCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function SkeletonCircleCard() {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-3 w-14 rounded" />
        </div>
      </div>
      <div className="flex">
        {[0, 1, 2].map((i) => (
          <Skeleton
            key={i}
            className="h-9 w-9 rounded-full flex-shrink-0 border-2 border-card"
            style={{ marginLeft: i === 0 ? 0 : "-10px" }}
          />
        ))}
      </div>
    </div>
  );
}

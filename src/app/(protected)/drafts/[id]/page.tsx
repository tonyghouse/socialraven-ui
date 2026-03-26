"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  AlertCircle,
  CalendarClock,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Loader2,
  Send,
  BookOpen,
  Image as ImageIcon,
  Video,
  FileText,
  LayoutGrid,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import { deletePostCollectionApi } from "@/service/deletePostCollectionApi";
import { scheduleDraftCollectionApi } from "@/service/scheduleDraftCollectionApi";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaPreview } from "@/components/generic/media-preview";
import { mapMediaResponseToMedia } from "@/lib/media-mapper";
import ScheduleDateTimePicker from "@/components/schedule-post/date-time-picker";
import { localToUTC } from "@/lib/timeUtil";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const TYPE_CONFIG = {
  IMAGE: { label: "Image", Icon: ImageIcon },
  VIDEO: { label: "Video", Icon: Video },
  TEXT:  { label: "Text",  Icon: FileText },
} as const;

export default function DraftDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();

  const [collection, setCollection] = useState<PostCollectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [scheduleDate, setScheduleDate]             = useState("");
  const [scheduleTime, setScheduleTime]             = useState("");
  const [scheduling, setScheduling]                 = useState(false);
  const [deleting, setDeleting]                     = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen]   = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const coll = await fetchPostCollectionByIdApi(getToken, id);
        if (coll.overallStatus !== "DRAFT") {
          router.replace(`/scheduled-posts/${id}`);
          return;
        }
        setCollection(coll);
      } catch {
        setError("Failed to load draft.");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSchedule() {
    if (!scheduleDate || !scheduleTime) { toast.error("Please select a date and time"); return; }
    if (!collection) return;
    if (collection.posts.length === 0) { toast.error("Add at least one account before scheduling"); return; }
    setScheduling(true);
    try {
      const scheduledTime = localToUTC(scheduleDate, scheduleTime);
      await scheduleDraftCollectionApi(getToken, collection.id, scheduledTime);
      toast.success("Draft scheduled! It will be published on time.");
      router.push(`/scheduled-posts/${collection.id}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to schedule. Please try again.");
    } finally {
      setScheduling(false);
    }
  }

  function handleDelete() {
    if (!collection) return;
    setConfirmDeleteOpen(true);
  }

  async function doDelete() {
    if (!collection) return;
    setConfirmDeleteOpen(false);
    setDeleting(true);
    try {
      await deletePostCollectionApi(getToken, collection.id);
      toast.success("Draft deleted.");
      router.push("/drafts");
    } catch {
      toast.error("Failed to delete draft.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingSkeleton />;
  if (error || !collection) return <ErrorState error={error} onBack={() => router.push("/drafts")} />;

  const typeCfg       = TYPE_CONFIG[collection.postCollectionType] ?? TYPE_CONFIG.TEXT;
  const TypeIcon      = typeCfg.Icon;
  const uniquePlatforms = [...new Set(collection.posts.map((p) => p.provider))];
  const hasAccounts   = collection.posts.length > 0;
  const captionText   = collection.description?.trim() ?? "";

  return (
    <>
    <ConfirmDialog
      open={confirmDeleteOpen}
      title="Delete draft?"
      description="This cannot be undone."
      confirmLabel="Delete"
      destructive
      onConfirm={doDelete}
      onCancel={() => setConfirmDeleteOpen(false)}
    />
    <main className="min-h-screen bg-background">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/60">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            <button
              onClick={() => router.push("/drafts")}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Drafts</span>
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
            <span className="font-medium text-foreground truncate">
              {collection.title || "Untitled Draft"}
            </span>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => router.push(`/drafts/${id}/edit`)}
              className="hidden sm:flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-border/60 text-foreground hover:bg-muted/50 transition-all text-xs font-semibold"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="hidden sm:flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-xs font-semibold"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete
            </button>
            <button
              onClick={() => setShowSchedulePanel((v) => !v)}
              className="hidden sm:flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-all text-xs font-semibold shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              Schedule
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 space-y-5">
        {/* ── Hero Card ── */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400" />
          <div className="px-6 pt-6 pb-5">
            <div className="flex flex-wrap items-start gap-x-4 gap-y-3 mb-4">
              <h1 className="text-2xl font-bold text-foreground tracking-tight flex-1 min-w-0">
                {collection.title || "Untitled Draft"}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                  <BookOpen className="h-3.5 w-3.5" />
                  Draft
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground border border-border/50">
                  <TypeIcon className="h-3.5 w-3.5" />
                  {typeCfg.label}
                </span>
                {/* Mobile icon actions */}
                <div className="flex items-center gap-1.5 sm:hidden">
                  <button
                    onClick={() => router.push(`/drafts/${id}/edit`)}
                    className="h-7 w-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="h-7 w-7 rounded-lg border border-red-200 dark:border-red-800/40 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  >
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Platform chips or warning */}
            {hasAccounts ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {uniquePlatforms.map((plat) => {
                  const PlatIcon = PLATFORM_ICONS[plat] ?? PLATFORM_ICONS[plat.toLowerCase()];
                  return (
                    <div
                      key={plat}
                      title={plat}
                      className="h-7 w-7 rounded-lg border border-border/60 bg-muted/60 flex items-center justify-center text-muted-foreground"
                    >
                      {PlatIcon && <PlatIcon className="h-3.5 w-3.5" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" />
                No accounts selected —{" "}
                <button
                  onClick={() => router.push(`/drafts/${id}/edit`)}
                  className="underline underline-offset-2 hover:no-underline"
                >
                  edit to add accounts
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Main layout: sidebar + content ── */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Left Sidebar ── */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">

            {/* Caption card */}
            {captionText && (
              <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/40 bg-muted/20">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm font-semibold text-foreground flex-1">Caption</p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap line-clamp-10">
                    {captionText}
                  </p>
                  <p className="text-xs text-muted-foreground/40 tabular-nums mt-3">
                    {captionText.length} characters
                  </p>
                </div>
              </div>
            )}

            {/* Media card */}
            {collection.media.length > 0 && (
              <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/40 bg-muted/20">
                  <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm font-semibold text-foreground flex-1">
                    Media{" "}
                    <span className="font-normal text-muted-foreground">
                      · {collection.media.length}
                    </span>
                  </p>
                </div>
                <div className="p-4">
                  <MediaCarousel media={collection.media} />
                </div>
              </div>
            )}

            {/* Platforms breakdown */}
            {hasAccounts && (
              <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/40 bg-muted/20">
                  <LayoutGrid className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm font-semibold text-foreground flex-1">Platforms</p>
                  <span className="text-xs text-muted-foreground">
                    {collection.posts.length} acct{collection.posts.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  {uniquePlatforms.map((platform) => {
                    const Icon = PLATFORM_ICONS[platform] ?? PLATFORM_ICONS[platform.toLowerCase()];
                    const count = collection.posts.filter((p) => p.provider === platform).length;
                    const label = platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
                    return (
                      <div key={platform} className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-lg border border-border/60 bg-muted/60 flex items-center justify-center text-muted-foreground flex-shrink-0">
                          {Icon && <Icon className="h-3.5 w-3.5" />}
                        </div>
                        <span className="text-sm font-medium text-foreground flex-1">{label}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {count} acct{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Schedule Now card */}
            <div className={cn(
              "rounded-2xl border overflow-hidden shadow-sm transition-all",
              showSchedulePanel
                ? "border-primary/30 bg-primary/[0.02]"
                : "border-border bg-card"
            )}>
              <div className="px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <CalendarClock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">Ready to publish?</p>
                      <p className="text-sm text-muted-foreground">
                        Pick a date and time to schedule this draft
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowSchedulePanel((v) => !v)}
                    size="sm"
                    className="gap-1.5 text-xs font-semibold flex-shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {showSchedulePanel ? "Cancel" : "Schedule Now"}
                  </Button>
                </div>

                {showSchedulePanel && (
                  <div className="mt-5 pt-5 border-t border-border/60 space-y-4">
                    {!hasAccounts && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">
                          No accounts selected.{" "}
                          <button
                            onClick={() => router.push(`/drafts/${id}/edit`)}
                            className="underline underline-offset-2 hover:no-underline"
                          >
                            Edit this draft
                          </button>{" "}
                          to add connected accounts before scheduling.
                        </p>
                      </div>
                    )}
                    <ScheduleDateTimePicker
                      date={scheduleDate}
                      setDate={setScheduleDate}
                      time={scheduleTime}
                      setTime={setScheduleTime}
                    />
                    <Button
                      onClick={handleSchedule}
                      disabled={scheduling || !scheduleDate || !scheduleTime || !hasAccounts}
                      className="w-full h-11 font-semibold gap-2"
                    >
                      {scheduling ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Scheduling…
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Confirm Schedule
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Empty state when no accounts */}
            {!hasAccounts && (
              <div className="flex flex-col items-center justify-center py-14 text-center rounded-2xl border border-border/40 bg-muted/20">
                <BookOpen className="h-9 w-9 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">No accounts connected yet</p>
                <p className="text-sm text-muted-foreground mb-5">
                  Add connected accounts to this draft before scheduling
                </p>
                <button
                  onClick={() => router.push(`/drafts/${id}/edit`)}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-all text-xs font-semibold shadow-sm"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Draft
                </button>
              </div>
            )}

            {/* Mobile bottom actions */}
            <div className="sm:hidden flex gap-3 pt-1 pb-6">
              <button
                onClick={() => router.push(`/drafts/${id}/edit`)}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-border/60 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => setShowSchedulePanel(true)}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-colors"
              >
                <Send className="h-4 w-4" />
                Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}

/* ── Media Carousel ── */
function MediaCarousel({ media }: { media: PostCollectionResponse["media"] }) {
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
                i === idx ? "w-4 h-1.5 bg-foreground" : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Loading Skeleton ── */
function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/60">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24 rounded hidden sm:block" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-lg hidden sm:block" />
            <Skeleton className="h-8 w-20 rounded-lg hidden sm:block" />
            <Skeleton className="h-8 w-24 rounded-lg hidden sm:block" />
          </div>
        </div>
      </header>
      <div className="px-4 sm:px-6 py-6 space-y-5">
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <Skeleton className="h-1 w-full rounded-none" />
          <div className="px-6 pt-6 pb-5 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-14 rounded-md" />
            </div>
            <Skeleton className="h-8 w-2/3 rounded-lg" />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="w-full lg:w-72 xl:w-80 space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/40 bg-muted/20">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="p-5 space-y-2.5">
                {[100, 88, 94, 76].map((w, i) => (
                  <Skeleton key={i} className="h-3.5 rounded" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm p-6">
              <div className="flex items-center gap-3.5 mb-4">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40 rounded" />
                  <Skeleton className="h-4 w-60 rounded" />
                </div>
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Error State ── */
function ErrorState({ error, onBack }: { error: string | null; onBack: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-sm w-full rounded-2xl bg-card border border-border/60 p-8 shadow-sm text-center">
        <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">Draft not found</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {error ?? "This draft couldn't be loaded. It may have been deleted."}
        </p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity mx-auto"
        >
          Back to Drafts
        </button>
      </div>
    </div>
  );
}

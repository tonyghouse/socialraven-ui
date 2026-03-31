"use client";

import AtlassianButton from "@atlaskit/button/new";
import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
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
  Zap,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import { deletePostCollectionApi } from "@/service/deletePostCollectionApi";
import { scheduleDraftCollectionApi } from "@/service/scheduleDraftCollectionApi";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { Skeleton } from "@/components/ui/skeleton";
import ScheduleDateTimePicker from "@/components/schedule-post/date-time-picker";
import { CollectionDetailPageSkeleton } from "@/components/posts/collection-page-skeletons";
import { localToUTC } from "@/lib/timeUtil";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";

const TYPE_CONFIG = {
  IMAGE: { label: "Image", Icon: ImageIcon },
  VIDEO: { label: "Video", Icon: Video },
  TEXT: { label: "Text", Icon: FileText },
} as const;

export default function DraftDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();

  const [collection, setCollection] = useState<PostCollectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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
    if (!scheduleDate || !scheduleTime) {
      toast.error("Please select a date and time");
      return;
    }
    if (!collection) return;
    if (collection.posts.length === 0) {
      toast.error("Add at least one account before scheduling");
      return;
    }
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

  if (loading) return <CollectionDetailPageSkeleton />;
  if (error || !collection) return <ErrorState error={error} onBack={() => router.push("/drafts")} />;

  const typeCfg = TYPE_CONFIG[collection.postCollectionType] ?? TYPE_CONFIG.TEXT;
  const uniquePlatforms = [...new Set(collection.posts.map((p) => p.provider))];
  const hasAccounts = collection.posts.length > 0;
  const captionText = collection.description?.trim() ?? "";
  const scheduledLabel = collection.scheduledTime
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(collection.scheduledTime))
    : null;

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
      <main className="min-h-screen bg-[hsl(var(--background))]">
        <ProtectedPageHeader
          title={collection.description || "Untitled Draft"}
          description="Draft details and scheduling controls."
          icon={<BookOpen className="h-4 w-4" />}
          actions={
            <>
              <AtlassianButton appearance="subtle" onClick={() => router.push(`/drafts/${id}/edit`)}>
                <span className="inline-flex items-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </span>
              </AtlassianButton>
              <AtlassianButton appearance="subtle" isDisabled={deleting} onClick={handleDelete}>
                <span className="inline-flex items-center gap-1.5">
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  <span>Delete</span>
                </span>
              </AtlassianButton>
              <AtlassianButton appearance="primary" onClick={() => setShowSchedulePanel((v) => !v)}>
                <span className="inline-flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  <span>{showSchedulePanel ? "Cancel" : "Schedule"}</span>
                </span>
              </AtlassianButton>
            </>
          }
        />

        <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-2.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => router.push("/drafts")}
              className="inline-flex items-center gap-1.5 text-sm font-medium leading-5 text-[hsl(var(--foreground-muted))] transition-colors hover:text-[hsl(var(--foreground))]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Drafts</span>
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-[hsl(var(--foreground-subtle))]" />
            <Lozenge appearance="default">Draft</Lozenge>
            <Lozenge appearance="new">{typeCfg.label}</Lozenge>
            {scheduledLabel && <Lozenge appearance="inprogress">{scheduledLabel}</Lozenge>}
          </div>
        </div>

        <div className="px-4 py-6 pb-24 sm:px-6 sm:pb-8">
          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="space-y-5">
              <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-3.5">
                  <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Platforms</p>
                </div>
                <div className="space-y-3 px-5 py-4">
                  {hasAccounts ? (
                    uniquePlatforms.map((platform) => {
                      const Icon = PLATFORM_ICONS[platform] ?? PLATFORM_ICONS[platform.toLowerCase()];
                      const count = collection.posts.filter((p) => p.provider === platform).length;
                      const label = platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();

                      return (
                        <div key={platform} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]">
                            {Icon && <Icon className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</p>
                            <p className="text-xs text-[hsl(var(--foreground-muted))]">
                              {count} acct{count !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <SectionMessage appearance="warning" title="No accounts selected">
                      <p className="text-sm">
                        Edit this draft to add connected accounts before scheduling.
                      </p>
                    </SectionMessage>
                  )}
                </div>
              </section>

              {captionText && (
                <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                  <div className="flex items-center gap-2 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-3.5">
                    <FileText className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
                    <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Caption</p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                      {captionText}
                    </p>
                    <p className="mt-3 text-xs text-[hsl(var(--foreground-subtle))]">
                      {captionText.length} characters
                    </p>
                  </div>
                </section>
              )}

              {collection.media.length > 0 && (
                <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                  <div className="flex items-center gap-2 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-3.5">
                    <ImageIcon className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                      Media
                      <span className="ml-1 font-normal text-[hsl(var(--foreground-muted))]">
                        · {collection.media.length}
                      </span>
                    </p>
                  </div>
                  <div className="p-4">
                    <MediaCarousel media={collection.media} />
                  </div>
                </section>
              )}
            </aside>

            <div className="space-y-5">
              <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--accent))]">
                        <CalendarClock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Ready to publish?</p>
                        <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                          Pick a date and time to schedule this draft
                        </p>
                      </div>
                    </div>
                    <AtlassianButton appearance={showSchedulePanel ? "subtle" : "primary"} onClick={() => setShowSchedulePanel((v) => !v)}>
                      <span className="inline-flex items-center gap-1.5">
                        <Send className="h-3.5 w-3.5" />
                        <span>{showSchedulePanel ? "Cancel" : "Schedule Now"}</span>
                      </span>
                    </AtlassianButton>
                  </div>
                </div>

                <div className="px-5 py-5">
                  {hasAccounts ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {uniquePlatforms.map((platform) => {
                        const Icon = PLATFORM_ICONS[platform] ?? PLATFORM_ICONS[platform.toLowerCase()];
                        return (
                          <div
                            key={platform}
                            title={platform}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]"
                          >
                            {Icon && <Icon className="h-4 w-4" />}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <SectionMessage appearance="warning" title="No accounts selected">
                      <p className="text-sm">
                        Edit this draft to add connected accounts before scheduling.
                      </p>
                    </SectionMessage>
                  )}

                  {showSchedulePanel && (
                    <div className="mt-5 space-y-4 border-t border-[hsl(var(--border-subtle))] pt-5">
                      {!hasAccounts && (
                        <SectionMessage appearance="warning" title="No accounts selected">
                          <p className="text-sm">
                            Edit this draft to add connected accounts before scheduling.
                          </p>
                        </SectionMessage>
                      )}
                      <ScheduleDateTimePicker
                        date={scheduleDate}
                        setDate={setScheduleDate}
                        time={scheduleTime}
                        setTime={setScheduleTime}
                      />
                      <AtlassianButton
                        appearance="primary"
                        onClick={handleSchedule}
                        isDisabled={scheduling || !scheduleDate || !scheduleTime || !hasAccounts}
                        shouldFitContainer
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          {scheduling ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Scheduling…</span>
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4" />
                              <span>Confirm Schedule</span>
                            </>
                          )}
                        </span>
                      </AtlassianButton>
                    </div>
                  )}
                </div>
              </section>

              {!hasAccounts && (
                <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-6 py-10 text-center shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
                    <BookOpen className="h-5 w-5 text-[hsl(var(--foreground-muted))]" />
                  </div>
                  <p className="mt-4 text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">No accounts connected yet</p>
                  <p className="mt-1 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                    Add connected accounts to this draft before scheduling
                  </p>
                  <div className="mt-5 flex justify-center">
                    <AtlassianButton appearance="primary" onClick={() => router.push(`/drafts/${id}/edit`)}>
                      <span className="inline-flex items-center gap-1.5">
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit Draft</span>
                      </span>
                    </AtlassianButton>
                  </div>
                </section>
              )}

              <div className="grid gap-3 sm:hidden">
                <AtlassianButton appearance="subtle" onClick={() => router.push(`/drafts/${id}/edit`)}>
                  <span className="inline-flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    <span>Edit</span>
                  </span>
                </AtlassianButton>
                <AtlassianButton appearance="primary" onClick={() => setShowSchedulePanel(true)}>
                  <span className="inline-flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    <span>Schedule</span>
                  </span>
                </AtlassianButton>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function MediaCarousel({ media }: { media: PostCollectionResponse["media"] }) {
  const [idx, setIdx] = useState(0);
  if (media.length === 0) return null;
  const current = media[idx];
  const isVideo = current.mimeType?.startsWith("video/");

  return (
    <div>
      <div className="relative aspect-video max-h-48 w-full overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
        {isVideo ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={current.fileUrl} className="h-full w-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.fileUrl} alt="Media" className="h-full w-full object-contain" />
        )}
        {media.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + media.length) % media.length)}
              className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % media.length)}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium leading-4 text-white backdrop-blur-sm">
              {idx + 1} / {media.length}
            </div>
          </>
        )}
      </div>
      {media.length > 1 && (
        <div className="mt-2.5 flex justify-center gap-1">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cn(
                "rounded-full transition-all",
                i === idx
                  ? "h-1.5 w-4 bg-[hsl(var(--accent))]"
                  : "h-1.5 w-1.5 bg-[hsl(var(--foreground-subtle))] hover:bg-[hsl(var(--foreground-muted))]"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-10 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))]/95 backdrop-blur-sm">
        <div className="px-4 sm:px-6">
          <div className="flex h-[60px] items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            </div>
            <div className="hidden gap-2 sm:flex">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      </header>
      <div className="px-4 py-6 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-3.5">
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <div className="space-y-3 px-5 py-4">
                  {[100, 88, 92].map((w, idx) => (
                    <Skeleton key={idx} className="h-4 rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
            <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40 rounded" />
                  <Skeleton className="h-4 w-56 rounded" />
                </div>
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            </div>
            <div className="px-5 py-5">
              <Skeleton className="h-8 w-48 rounded" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ErrorState({ error, onBack }: { error: string | null; onBack: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] p-6">
      <div className="w-full max-w-sm rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 text-center shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
          <AlertCircle className="h-7 w-7 text-[hsl(var(--destructive))]" />
        </div>
        <h3 className="mb-1 text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Draft not found</h3>
        <p className="mb-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
          {error ?? "This draft couldn't be loaded. It may have been deleted."}
        </p>
        <AtlassianButton appearance="primary" onClick={onBack}>
          <span className="inline-flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Drafts</span>
          </span>
        </AtlassianButton>
      </div>
    </div>
  );
}

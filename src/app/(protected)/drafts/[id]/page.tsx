"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  AlertCircle,
  CalendarClock,
  Pencil,
  Trash2,
  Loader2,
  Send,
  BookOpen,
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import { deletePostCollectionApi } from "@/service/deletePostCollectionApi";
import { scheduleDraftCollectionApi } from "@/service/scheduleDraftCollectionApi";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import type { AccountGroup } from "@/model/AccountGroup";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaPreview } from "@/components/generic/media-preview";
import { mapMediaResponseToMedia } from "@/lib/media-mapper";
import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import { fetchAccountGroupsApi } from "@/service/accountGroups";
import { AccountSelector } from "@/components/schedule-post/account-selection-sheet";
import EditImageForm from "@/components/schedule-post/edit-image-form";
import EditVideoForm from "@/components/schedule-post/edit-video-form";
import EditTextForm from "@/components/schedule-post/edit-text-form";
import ScheduleDateTimePicker from "@/components/schedule-post/date-time-picker";
import { localToUTC } from "@/lib/timeUtil";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const [allAccounts, setAllAccounts] = useState<ConnectedAccount[]>([]);
  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI modes
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [coll, accounts, groups] = await Promise.all([
          fetchPostCollectionByIdApi(getToken, id),
          fetchAllConnectedAccountsApi(getToken),
          fetchAccountGroupsApi(getToken),
        ]);

        if (coll.overallStatus !== "DRAFT") {
          // Redirect non-drafts to the scheduled-posts detail page
          router.replace(`/scheduled-posts/${id}`);
          return;
        }

        setCollection(coll);
        setAllAccounts(accounts);
        setAccountGroups(groups);

        // Pre-select accounts already in the draft
        const existingIds = coll.posts.map((p) => p.connectedAccount?.providerUserId).filter(Boolean) as string[];
        setSelectedIds(existingIds);
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
      toast.error("Add at least one connected account before scheduling");
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

  async function handleDelete() {
    if (!collection) return;
    if (!confirm("Delete this draft? This cannot be undone.")) return;

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

  const typeCfg = TYPE_CONFIG[collection.postCollectionType] ?? TYPE_CONFIG.TEXT;
  const TypeIcon = typeCfg.Icon;
  const uniquePlatforms = [...new Set(collection.posts.map((p) => p.provider))];
  const hasAccounts = collection.posts.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="px-4 sm:px-6">
          <div className="flex items-center gap-3 h-16">
            <button
              onClick={() => router.push("/drafts")}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <BookOpen className="h-3 w-3" />
                  Draft
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-muted-foreground border border-border/50">
                  <TypeIcon className="h-3 w-3" />
                  {typeCfg.label}
                </span>
              </div>
              <h1 className="text-sm font-semibold text-foreground truncate leading-tight mt-0.5">
                {collection.title || collection.description?.slice(0, 60) || "Untitled Draft"}
              </h1>
            </div>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0"
              title="Delete draft"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 space-y-4 max-w-2xl mx-auto">

        {/* ── Schedule Now Card ── */}
        <div className={cn(
          "rounded-2xl border overflow-hidden transition-all",
          showSchedulePanel
            ? "border-primary/30 bg-primary/[0.02]"
            : "border-border bg-card"
        )}>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <CalendarClock className="h-[18px] w-[18px] text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Ready to publish?</p>
                  <p className="text-xs text-muted-foreground">Pick a date and time to schedule this draft</p>
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
              <div className="mt-4 pt-4 border-t border-border/60 space-y-4">
                {!hasAccounts && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium">
                      No accounts selected. Edit this draft to add connected accounts before scheduling.
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

        {/* ── Connected Accounts ── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
            <p className="text-sm font-semibold text-foreground">Platforms</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasAccounts
                ? `Targeting ${collection.posts.length} account${collection.posts.length !== 1 ? "s" : ""} across ${uniquePlatforms.length} platform${uniquePlatforms.length !== 1 ? "s" : ""}`
                : "No accounts selected yet"}
            </p>
          </div>
          <div className="px-5 py-4">
            {hasAccounts ? (
              <div className="flex flex-wrap gap-2">
                {uniquePlatforms.map((platform) => {
                  const Icon = PLATFORM_ICONS[platform];
                  const accounts = collection.posts.filter((p) => p.provider === platform);
                  return (
                    <div key={platform} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/60 border border-border/50">
                      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span className="text-xs font-medium text-foreground capitalize">{platform.toLowerCase()}</span>
                      <span className="text-[10px] text-muted-foreground">({accounts.length})</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Edit this draft to select connected accounts.
              </p>
            )}
          </div>
        </div>

        {/* ── Content Preview ── */}
        {collection.description && !showEditForm && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
              <p className="text-sm font-semibold text-foreground">Content</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {collection.description}
              </p>
            </div>
          </div>
        )}

        {/* ── Media Preview ── */}
        {collection.media.length > 0 && !showEditForm && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
              <p className="text-sm font-semibold text-foreground">
                Media · {collection.media.length} file{collection.media.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-3">
                {collection.media.map((m, i) => (
                  <MediaPreview key={m.id ?? i} media={mapMediaResponseToMedia(m)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Section ── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setShowEditForm((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Edit Draft</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {showEditForm ? "Collapse" : "Expand"}
            </span>
          </button>

          {showEditForm && (
            <div className="px-5 py-5 space-y-5">
              {/* Account selector */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Connected Accounts
                </p>
                <AccountSelector
                  postType={collection.postCollectionType}
                  accounts={allAccounts}
                  groups={accountGroups}
                  selectedAccountIds={selectedIds}
                  onChange={setSelectedIds}
                  loading={false}
                />
              </div>

              <div className="border-t border-border/60" />

              {/* Edit form by type */}
              {collection.postCollectionType === "TEXT" && (
                <EditTextForm
                  collection={collection}
                  connectedAccounts={allAccounts}
                  selectedIds={selectedIds}
                  collectionId={id}
                  onSuccess={(updated) => {
                    setCollection(updated);
                    setShowEditForm(false);
                    toast.success("Draft updated.");
                  }}
                />
              )}
              {collection.postCollectionType === "IMAGE" && (
                <EditImageForm
                  collection={collection}
                  connectedAccounts={allAccounts}
                  selectedIds={selectedIds}
                  collectionId={id}
                  onSuccess={(updated) => {
                    setCollection(updated);
                    setShowEditForm(false);
                    toast.success("Draft updated.");
                  }}
                />
              )}
              {collection.postCollectionType === "VIDEO" && (
                <EditVideoForm
                  collection={collection}
                  connectedAccounts={allAccounts}
                  selectedIds={selectedIds}
                  collectionId={id}
                  onSuccess={(updated) => {
                    setCollection(updated);
                    setShowEditForm(false);
                    toast.success("Draft updated.");
                  }}
                />
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 h-16" />
      <div className="px-4 sm:px-6 py-6 space-y-4 max-w-2xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card p-5">
            <Skeleton className="h-5 w-1/3 mb-3 rounded-md" />
            <Skeleton className="h-4 w-full mb-2 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ error, onBack }: { error: string | null; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
      <AlertCircle className="h-10 w-10 text-destructive/60" />
      <p className="text-sm text-muted-foreground text-center">{error ?? "Draft not found."}</p>
      <button
        onClick={onBack}
        className="text-sm font-medium text-primary hover:underline"
      >
        Back to Drafts
      </button>
    </div>
  );
}

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
  Zap,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import { deletePostCollectionApi } from "@/service/deletePostCollectionApi";
import {
  activateApprovedScheduleApi,
  approvePostCollectionApi,
  requestChangesPostCollectionApi,
} from "@/service/reviewPostCollectionApi";
import { scheduleDraftCollectionApi } from "@/service/scheduleDraftCollectionApi";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { localToUTC } from "@/lib/timeUtil";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { usePlan } from "@/hooks/usePlan";
import { useRole } from "@/hooks/useRole";
import { useWorkspace } from "@/context/WorkspaceContext";
import { InternalCollaborationPanel } from "@/components/posts/internal-collaboration-panel";
import { ClientReviewPanel } from "@/components/posts/client-review-panel";
import { ApprovalSafetyPanel } from "@/components/posts/approval-safety-panel";
import { WorkspaceApprovalMode } from "@/model/Workspace";
import {
  approvalModeDescription,
  approvalModeLabel,
  canDirectScheduleForMode,
  resolveWorkspaceApprovalMode,
} from "@/lib/approval-workflow";
import { DraftDateTimePicker } from "@/components/drafts/draft-date-time-picker";
import { DraftDetailPageSkeleton } from "@/components/drafts/draft-detail-page-skeleton";
import {
  DraftDetailActionButton,
  DraftDetailBadge,
  DraftDetailNotice,
  draftDetailBodyTextClassName,
  draftDetailMetaTextClassName,
  draftDetailPanelClassName,
  draftDetailPanelHeaderClassName,
  draftDetailSubtlePanelClassName,
} from "@/components/drafts/draft-detail-primitives";

const TYPE_CONFIG = {
  IMAGE: { label: "Image", Icon: ImageIcon },
  VIDEO: { label: "Video", Icon: Video },
  TEXT: { label: "Text", Icon: FileText },
} as const;
const DEFAULT_APPROVAL_OVERRIDE = "DEFAULT";

const PLATFORM_ACCENT: Record<string, string> = {
  instagram: "var(--chart-categorical-4)",
  x: "var(--chart-neutral)",
  linkedin: "var(--chart-categorical-2)",
  facebook: "var(--chart-categorical-5)",
  youtube: "var(--ds-red-600)",
  threads: "var(--ds-gray-1000)",
  tiktok: "var(--ds-gray-1000)",
};

function isDraftWorkflowStatus(status: PostCollectionResponse["overallStatus"]) {
  return (
    status === "DRAFT" ||
    status === "IN_REVIEW" ||
    status === "CHANGES_REQUESTED" ||
    status === "APPROVED"
  );
}

function getStatusVariant(status: PostCollectionResponse["overallStatus"]) {
  switch (status) {
    case "IN_REVIEW":
      return "warning";
    case "CHANGES_REQUESTED":
      return "danger";
    case "APPROVED":
      return "success";
    default:
      return "neutral";
  }
}

function getStatusLabel(status: PostCollectionResponse["overallStatus"]) {
  switch (status) {
    case "IN_REVIEW":
      return "In Review";
    case "CHANGES_REQUESTED":
      return "Changes Requested";
    case "APPROVED":
      return "Approved";
    default:
      return "Draft";
  }
}

function platformAccent(platform: string | undefined) {
  if (!platform) return "var(--ds-gray-1000)";
  return PLATFORM_ACCENT[platform] ?? "var(--ds-gray-1000)";
}

function platformSurfaceStyle(platform: string | undefined, backgroundPercent = 10, borderPercent = 24) {
  const accent = platformAccent(platform);

  return {
    backgroundColor: `color-mix(in srgb, ${accent} ${backgroundPercent}%, var(--ds-background-100))`,
    borderColor: `color-mix(in srgb, ${accent} ${borderPercent}%, var(--ds-gray-400))`,
  };
}

export default function DraftDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const { isAgency } = usePlan();
  const {
    canApprovePosts,
    canManageApprovalRules,
    canPublishPosts,
    canRequestChanges,
    isOwner,
  } = useRole();

  const [collection, setCollection] = useState<PostCollectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [approvalModeOverrideInput, setApprovalModeOverrideInput] = useState<
    WorkspaceApprovalMode | typeof DEFAULT_APPROVAL_OVERRIDE
  >(DEFAULT_APPROVAL_OVERRIDE);
  const [scheduling, setScheduling] = useState(false);
  const [approving, setApproving] = useState(false);
  const [activatingSchedule, setActivatingSchedule] = useState(false);
  const [requestingChanges, setRequestingChanges] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  async function refreshCollection() {
    const coll = await fetchPostCollectionByIdApi(getToken, id);
    if (!isDraftWorkflowStatus(coll.overallStatus)) {
      router.replace(`/scheduled-posts/${id}`);
      return null;
    }
    setCollection(coll);
    setApprovalModeOverrideInput(coll.approvalModeOverride ?? DEFAULT_APPROVAL_OVERRIDE);
    if (coll.scheduledTime) {
      const scheduled = new Date(coll.scheduledTime);
      const year = scheduled.getFullYear();
      const month = String(scheduled.getMonth() + 1).padStart(2, "0");
      const day = String(scheduled.getDate()).padStart(2, "0");
      const hour = String(scheduled.getHours()).padStart(2, "0");
      const minute = String(scheduled.getMinutes()).padStart(2, "0");
      setScheduleDate(`${year}-${month}-${day}`);
      setScheduleTime(`${hour}:${minute}`);
    }
    return coll;
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        await refreshCollection();
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
      const next = await scheduleDraftCollectionApi(getToken, collection.id, scheduledTime, {
        approvalModeOverride:
          approvalModeOverrideInput === DEFAULT_APPROVAL_OVERRIDE
            ? undefined
            : approvalModeOverrideInput,
        clearApprovalModeOverride:
          approvalModeOverrideInput === DEFAULT_APPROVAL_OVERRIDE &&
          collection.approvalModeOverride !== null,
      });
      if (next.overallStatus === "IN_REVIEW") {
        setCollection(next);
        setShowSchedulePanel(false);
        toast.success("Draft submitted for review.");
      } else {
        toast.success("Draft scheduled! It will be published on time.");
        router.push(`/scheduled-posts/${collection.id}`);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to schedule. Please try again.");
    } finally {
      setScheduling(false);
    }
  }

  async function handleApprove() {
    if (!collection) return;
    setApproving(true);
    try {
      const next = await approvePostCollectionApi(getToken, collection.id);
      if (next.overallStatus === "IN_REVIEW") {
        setCollection(next);
        toast.success("Approval recorded. Awaiting final owner sign-off.");
      } else if (next.overallStatus === "APPROVED") {
        setCollection(next);
        toast.success("Content approved. A publisher must activate the schedule.");
      } else {
        toast.success("Content approved and scheduled.");
        router.push(`/scheduled-posts/${collection.id}`);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to approve content.");
    } finally {
      setApproving(false);
    }
  }

  async function handleActivateApprovedSchedule() {
    if (!collection) return;
    setActivatingSchedule(true);
    try {
      const next = await activateApprovedScheduleApi(getToken, collection.id);
      toast.success("Approved content added to the publishing queue.");
      router.push(`/scheduled-posts/${next.id}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to activate the schedule.");
    } finally {
      setActivatingSchedule(false);
    }
  }

  async function handleRequestChanges() {
    if (!collection) return;
    setRequestingChanges(true);
    try {
      const next = await requestChangesPostCollectionApi(getToken, collection.id);
      setCollection(next);
      toast.success("Changes requested.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to request changes.");
    } finally {
      setRequestingChanges(false);
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

  if (loading) return <DraftDetailPageSkeleton />;
  if (error || !collection) return <ErrorState error={error} onBack={() => router.push("/drafts")} />;

  const typeCfg = TYPE_CONFIG[collection.postCollectionType] ?? TYPE_CONFIG.TEXT;
  const uniquePlatforms = [...new Set(collection.posts.map((p) => p.provider))];
  const hasAccounts = collection.posts.length > 0;
  const captionText = collection.description?.trim() ?? "";
  const isInReview = collection.overallStatus === "IN_REVIEW";
  const isChangesRequested = collection.overallStatus === "CHANGES_REQUESTED";
  const isApprovedAwaitingSchedule = collection.overallStatus === "APPROVED";
  const isAwaitingOwnerFinal = isInReview && collection.nextApprovalStage === "OWNER_FINAL";
  const canEdit =
    collection.overallStatus === "DRAFT" ||
    isChangesRequested ||
    isApprovedAwaitingSchedule;
  const effectiveApprovalMode = resolveWorkspaceApprovalMode(activeWorkspace, {
    approvalModeOverride:
      approvalModeOverrideInput === DEFAULT_APPROVAL_OVERRIDE
        ? null
        : approvalModeOverrideInput,
    providerUserIds: collection.posts
      .map((post) => post.connectedAccount?.providerUserId)
      .filter((providerUserId): providerUserId is string => !!providerUserId),
    postType: collection.postCollectionType,
  });
  const canDirectSchedule = canDirectScheduleForMode(
    effectiveApprovalMode,
    canPublishPosts
  );
  const canApproveCurrentStage =
    canApprovePosts && (!isAwaitingOwnerFinal || isOwner);
  const autoScheduleAfterApproval = activeWorkspace?.autoScheduleAfterApproval ?? true;
  const primaryActionLabel = !isAgency || canDirectSchedule
    ? "Schedule"
    : isChangesRequested
    ? "Resubmit for Review"
    : "Submit for Review";
  const scheduleSectionTitle = isApprovedAwaitingSchedule
    ? "Approved and awaiting scheduling"
    : !isAgency || canDirectSchedule
    ? "Ready to schedule?"
    : "Ready for review?";
  const scheduleSectionDescription = isApprovedAwaitingSchedule
    ? "Final approval is complete. Activate the existing scheduled time when you are ready to publish."
    : !isAgency || canDirectSchedule
    ? "Pick a date and time to add this content to the publishing queue."
    : "Pick a date and time and send this content through the approval workflow.";
  const scheduledLabel = collection.scheduledTime
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(collection.scheduledTime))
    : null;
  const approveActionLabel = isAwaitingOwnerFinal
    ? autoScheduleAfterApproval
      ? "Final Approve & Schedule"
      : "Final Approve"
    : collection.requiredApprovalSteps > 1
    ? "Approve Step 1"
    : autoScheduleAfterApproval
    ? "Approve & Schedule"
    : "Approve";
  const selectClassName =
    "flex h-10 w-full rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-label-14 text-[var(--ds-gray-1000)] outline-none transition-colors focus:border-[var(--ds-blue-600)] focus:ring-2 focus:ring-[var(--ds-blue-600)] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]";

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
      <main className="min-h-screen bg-[var(--ds-background-200)]">
        <ProtectedPageHeader
          title={collection.description || "Untitled Draft"}
          description={
            isInReview
              ? "Submitted for workspace review."
              : isApprovedAwaitingSchedule
              ? "Approved and waiting for a publisher to activate the schedule."
              : isChangesRequested
              ? "Changes were requested before scheduling."
              : "Draft details and scheduling controls."
          }
          icon={<BookOpen className="h-4 w-4" />}
          className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95"
          actions={
            <>
              {canEdit && (
                <DraftDetailActionButton onClick={() => router.push(`/drafts/${id}/edit`)}>
                  <span className="inline-flex items-center gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </span>
                </DraftDetailActionButton>
              )}
              <DraftDetailActionButton tone="danger" disabled={deleting} onClick={handleDelete}>
                <span className="inline-flex items-center gap-1.5">
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  <span>Delete</span>
                </span>
              </DraftDetailActionButton>
              {isInReview ? (
                canRequestChanges || canApproveCurrentStage ? (
                  <>
                    {canRequestChanges && (
                      <DraftDetailActionButton disabled={requestingChanges} onClick={handleRequestChanges}>
                        <span className="inline-flex items-center gap-1.5">
                          {requestingChanges ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertCircle className="h-3.5 w-3.5" />}
                          <span>Request Changes</span>
                        </span>
                      </DraftDetailActionButton>
                    )}
                    {canApproveCurrentStage && (
                      <DraftDetailActionButton tone="primary" disabled={approving} onClick={handleApprove}>
                        <span className="inline-flex items-center gap-1.5">
                          {approving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          <span>{approveActionLabel}</span>
                        </span>
                      </DraftDetailActionButton>
                    )}
                  </>
                ) : null
              ) : isApprovedAwaitingSchedule ? (
                canPublishPosts ? (
                  <DraftDetailActionButton tone="primary" disabled={activatingSchedule} onClick={handleActivateApprovedSchedule}>
                    <span className="inline-flex items-center gap-1.5">
                      {activatingSchedule ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      <span>Activate Schedule</span>
                    </span>
                  </DraftDetailActionButton>
                ) : null
              ) : (
                <DraftDetailActionButton tone="primary" onClick={() => setShowSchedulePanel((v) => !v)}>
                  <span className="inline-flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5" />
                    <span>{showSchedulePanel ? "Cancel" : primaryActionLabel}</span>
                  </span>
                </DraftDetailActionButton>
              )}
            </>
          }
        />

        <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-2.5 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => router.push("/drafts")}
              className="inline-flex items-center gap-1.5 text-label-14 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Drafts</span>
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--ds-gray-800)]" />
            <DraftDetailBadge variant={getStatusVariant(collection.overallStatus)}>
              {getStatusLabel(collection.overallStatus)}
            </DraftDetailBadge>
            <DraftDetailBadge variant="subtle">{typeCfg.label}</DraftDetailBadge>
            {scheduledLabel ? <DraftDetailBadge variant="accent">{scheduledLabel}</DraftDetailBadge> : null}
          </div>
        </div>

        <div className="px-4 py-5 pb-24 sm:px-5 sm:pb-8">
          <div className="grid gap-4 lg:grid-cols-[17.5rem_minmax(0,1fr)]">
            <aside className="space-y-4">
              <section className={draftDetailPanelClassName}>
                <div className={draftDetailPanelHeaderClassName}>
                  <p className="text-title-16 text-[var(--ds-gray-1000)]">Platforms</p>
                </div>
                <div className="space-y-3 px-4 py-3.5">
                  {hasAccounts ? (
                    uniquePlatforms.map((platform) => {
                      const Icon = PLATFORM_ICONS[platform] ?? PLATFORM_ICONS[platform.toLowerCase()];
                      const count = collection.posts.filter((p) => p.provider === platform).length;
                      const label = platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();

                      return (
                        <div key={platform} className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-md border"
                            style={platformSurfaceStyle(platform)}
                          >
                            {Icon ? <Icon className="h-4 w-4" style={{ color: platformAccent(platform) }} /> : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-label-14 text-[var(--ds-gray-1000)]">{label}</p>
                            <p className={draftDetailMetaTextClassName}>
                              {count} acct{count !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <DraftDetailNotice title="No accounts selected" variant="warning">
                      <p>
                        Edit this draft to add connected accounts before scheduling.
                      </p>
                    </DraftDetailNotice>
                  )}
                </div>
              </section>

              {captionText && (
                <section className={draftDetailPanelClassName}>
                  <div className={cn(draftDetailPanelHeaderClassName, "flex items-center gap-2")}>
                    <FileText className="h-4 w-4 text-[var(--ds-gray-900)]" />
                    <p className="text-title-16 text-[var(--ds-gray-1000)]">Caption</p>
                  </div>
                  <div className="px-4 py-3.5">
                    <p className="whitespace-pre-wrap text-label-14 leading-6 text-[var(--ds-gray-900)]">
                      {captionText}
                    </p>
                    <p className={cn("mt-3", draftDetailMetaTextClassName)}>
                      {captionText.length} characters
                    </p>
                  </div>
                </section>
              )}

              {collection.media.length > 0 && (
                <section className={draftDetailPanelClassName}>
                  <div className={cn(draftDetailPanelHeaderClassName, "flex items-center gap-2")}>
                    <ImageIcon className="h-4 w-4 text-[var(--ds-gray-900)]" />
                    <p className="text-title-16 text-[var(--ds-gray-1000)]">
                      Media
                      <span className="ml-1 font-normal text-[var(--ds-gray-900)]">
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
              <section className={draftDetailPanelClassName}>
                <div className={draftDetailPanelHeaderClassName}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]">
                        <CalendarClock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-title-16 text-[var(--ds-gray-1000)]">{scheduleSectionTitle}</p>
                        <p className={draftDetailBodyTextClassName}>
                          {scheduleSectionDescription}
                        </p>
                      </div>
                    </div>
                    {!isInReview && !isApprovedAwaitingSchedule && (
                      <DraftDetailActionButton tone={showSchedulePanel ? "secondary" : "primary"} onClick={() => setShowSchedulePanel((v) => !v)}>
                        <span className="inline-flex items-center gap-1.5">
                          <Send className="h-3.5 w-3.5" />
                          <span>{showSchedulePanel ? "Cancel" : primaryActionLabel}</span>
                        </span>
                      </DraftDetailActionButton>
                    )}
                  </div>
                </div>

                <div className="px-5 py-5">
                  {isInReview && (
                    <DraftDetailNotice
                      title={
                        isAwaitingOwnerFinal
                          ? isOwner
                            ? "Your final sign-off is required"
                            : "Awaiting owner final sign-off"
                          : canApproveCurrentStage || canRequestChanges
                          ? "Awaiting approval decision"
                          : "Waiting for approver review"
                      }
                    >
                      <p>
                        {isAwaitingOwnerFinal
                          ? isOwner
                            ? "An internal approver completed the first review step. Final owner approval will schedule this content."
                            : "The first approval step is complete. This content is now waiting for final owner sign-off before it can be scheduled."
                          : canApproveCurrentStage || canRequestChanges
                          ? "Review the content, then approve it to move it forward or request changes to send it back to the creator."
                          : "This content is locked while it is in review. An approver can approve it or send it back with requested changes."}
                      </p>
                    </DraftDetailNotice>
                  )}

                  {isApprovedAwaitingSchedule && (
                    <DraftDetailNotice
                      title={
                        canPublishPosts
                          ? "Approved and ready to queue"
                          : "Approved and awaiting publisher activation"
                      }
                    >
                      <p>
                        {canPublishPosts
                          ? "Final approval is complete. Activate the schedule to move this content into the publishing queue without reopening review."
                          : "Final approval is complete. A publisher must activate the schedule before this content enters the publishing queue."}
                      </p>
                    </DraftDetailNotice>
                  )}

                  {collection.requiredApprovalSteps > 0 && (
                    <div className={cn("mt-4 px-4 py-3", draftDetailSubtlePanelClassName)}>
                      <p className="text-label-14 text-[var(--ds-gray-1000)]">
                        Approval progress
                      </p>
                      <p className={cn("mt-1", draftDetailBodyTextClassName)}>
                        {collection.completedApprovalSteps} of {collection.requiredApprovalSteps} required approval step
                        {collection.requiredApprovalSteps === 1 ? "" : "s"} completed.
                      </p>
                      {collection.nextApprovalStage && (
                        <p className={cn("mt-1", draftDetailMetaTextClassName)}>
                          Next step: {collection.nextApprovalStage === "OWNER_FINAL" ? "Owner final sign-off" : "Approver review"}
                        </p>
                      )}
                    </div>
                  )}

                  {hasAccounts ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {uniquePlatforms.map((platform) => {
                        const Icon = PLATFORM_ICONS[platform] ?? PLATFORM_ICONS[platform.toLowerCase()];
                        return (
                          <div
                            key={platform}
                            title={platform}
                            className="flex h-8 w-8 items-center justify-center rounded-md border"
                            style={platformSurfaceStyle(platform)}
                          >
                            {Icon ? <Icon className="h-4 w-4" style={{ color: platformAccent(platform) }} /> : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <DraftDetailNotice title="No accounts selected" variant="warning">
                      <p>
                        Edit this draft to add connected accounts before scheduling.
                      </p>
                    </DraftDetailNotice>
                  )}

                  {showSchedulePanel && !isInReview && !isApprovedAwaitingSchedule && (
                    <div className="mt-5 space-y-4 border-t border-[var(--ds-gray-400)] pt-5">
                      {!hasAccounts && (
                        <DraftDetailNotice title="No accounts selected" variant="warning">
                          <p>
                            Edit this draft to add connected accounts before scheduling.
                          </p>
                        </DraftDetailNotice>
                      )}
                      <DraftDateTimePicker
                        date={scheduleDate}
                        setDate={setScheduleDate}
                        time={scheduleTime}
                        setTime={setScheduleTime}
                      />
                      {isAgency ? (
                        <div className={cn(draftDetailSubtlePanelClassName, "p-4")}>
                          <p className="text-label-14 text-[var(--ds-gray-1000)]">
                            Effective approval mode
                          </p>
                          <p className={cn("mt-1", draftDetailMetaTextClassName)}>
                            {approvalModeLabel(effectiveApprovalMode)}. {approvalModeDescription(effectiveApprovalMode)}
                          </p>
                          {canManageApprovalRules ? (
                            <div className="mt-4 space-y-2">
                              <label className="text-copy-12 uppercase tracking-wide text-[var(--ds-gray-900)]">
                                Campaign override
                              </label>
                              <select
                                value={approvalModeOverrideInput}
                                onChange={(event) =>
                                  setApprovalModeOverrideInput(
                                    event.target.value as WorkspaceApprovalMode | typeof DEFAULT_APPROVAL_OVERRIDE
                                  )
                                }
                                className={selectClassName}
                              >
                                <option value={DEFAULT_APPROVAL_OVERRIDE}>Use workspace rules</option>
                                <option value="NONE">No approval required</option>
                                <option value="OPTIONAL">Optional approval</option>
                                <option value="REQUIRED">Required approval</option>
                                <option value="MULTI_STEP">Multi-step approval</option>
                              </select>
                              <p className={draftDetailMetaTextClassName}>
                                Campaign overrides beat account and content-type rules for this collection only.
                              </p>
                            </div>
                          ) : (
                            <p className={cn("mt-4", draftDetailMetaTextClassName)}>
                              Approval is resolved automatically from workspace policy, account rules, and content type.
                            </p>
                          )}
                        </div>
                      ) : null}
                      <DraftDetailActionButton
                        tone="primary"
                        onClick={handleSchedule}
                        disabled={scheduling || !scheduleDate || !scheduleTime || !hasAccounts}
                        fullWidth
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
                              <span>{canDirectSchedule ? "Confirm Schedule" : primaryActionLabel}</span>
                            </>
                          )}
                        </span>
                      </DraftDetailActionButton>
                    </div>
                  )}
                </div>
              </section>

              {isAgency ? (
                <>
                  <InternalCollaborationPanel
                    collection={collection}
                    onCollectionRefresh={refreshCollection}
                  />

                  <ClientReviewPanel collection={collection} />

                  <ApprovalSafetyPanel collection={collection} appearance="geist" />
                </>
              ) : null}

              {!hasAccounts && (
                <section className={cn(draftDetailPanelClassName, "px-6 py-10 text-center")}>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                    <BookOpen className="h-5 w-5 text-[var(--ds-gray-900)]" />
                  </div>
                  <p className="mt-4 text-title-16 text-[var(--ds-gray-1000)]">No accounts connected yet</p>
                  <p className={cn("mt-1", draftDetailBodyTextClassName)}>
                    Add connected accounts to this draft before scheduling
                  </p>
                  <div className="mt-5 flex justify-center">
                    <DraftDetailActionButton tone="primary" disabled={!canEdit} onClick={() => router.push(`/drafts/${id}/edit`)}>
                      <span className="inline-flex items-center gap-1.5">
                        <Pencil className="h-3.5 w-3.5" />
                        <span>{canEdit ? "Edit Draft" : "Locked During Review"}</span>
                      </span>
                    </DraftDetailActionButton>
                  </div>
                </section>
              )}

              <div className="grid gap-3 sm:hidden">
                <DraftDetailActionButton disabled={!canEdit} onClick={() => router.push(`/drafts/${id}/edit`)}>
                  <span className="inline-flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    <span>Edit</span>
                  </span>
                </DraftDetailActionButton>
                {!isInReview && !isApprovedAwaitingSchedule && (
                  <DraftDetailActionButton tone="primary" onClick={() => setShowSchedulePanel(true)}>
                    <span className="inline-flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      <span>{primaryActionLabel}</span>
                    </span>
                  </DraftDetailActionButton>
                )}
                {isApprovedAwaitingSchedule && canPublishPosts && (
                  <DraftDetailActionButton tone="primary" disabled={activatingSchedule} onClick={handleActivateApprovedSchedule}>
                    <span className="inline-flex items-center gap-2">
                      {activatingSchedule ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span>Activate Schedule</span>
                    </span>
                  </DraftDetailActionButton>
                )}
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
      <div className="relative aspect-video max-h-48 w-full overflow-hidden rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
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
                  ? "h-1.5 w-4 bg-[var(--ds-blue-600)]"
                  : "h-1.5 w-1.5 bg-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-700)]"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ErrorState({ error, onBack }: { error: string | null; onBack: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ds-background-200)] p-6">
      <div className="w-full max-w-sm rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--ds-red-200)] bg-[var(--ds-red-100)]">
          <AlertCircle className="h-7 w-7 text-[var(--ds-red-700)]" />
        </div>
        <h3 className="mb-1 text-title-16 text-[var(--ds-gray-1000)]">Draft not found</h3>
        <p className="mb-6 text-label-14 leading-6 text-[var(--ds-gray-900)]">
          {error ?? "This draft couldn't be loaded. It may have been deleted."}
        </p>
        <DraftDetailActionButton tone="primary" onClick={onBack}>
          <span className="inline-flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Drafts</span>
          </span>
        </DraftDetailActionButton>
      </div>
    </div>
  );
}

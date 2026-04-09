"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  AtSign,
  Check,
  Globe2,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type {
  PostCollaborationAnnotationMode,
  PostCollaborationThread,
  PostCollaborationThreadType,
  PostCollaborationVisibility,
} from "@/model/PostCollaboration";
import type { WorkspaceMember } from "@/model/Workspace";
import { getMembersApi } from "@/service/member";
import {
  acceptPostCollaborationSuggestionApi,
  addPostCollaborationReplyApi,
  createPostCollaborationThreadApi,
  getPostCollaborationThreadsApi,
  rejectPostCollaborationSuggestionApi,
  reopenPostCollaborationThreadApi,
  resolvePostCollaborationThreadApi,
} from "@/service/postCollaboration";
import { useWorkspace } from "@/context/WorkspaceContext";
import { usePlan } from "@/hooks/usePlan";
import { useRole } from "@/hooks/useRole";
import {
  buildFullCaptionSelection,
  PostCollaborationAnnotationEditor,
  type CollaborationCaptionSelection,
  type CollaborationMediaAnnotation,
} from "@/components/posts/post-collaboration-annotation-editor";
import { PostCollaborationAnnotationView } from "@/components/posts/post-collaboration-annotation-view";
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

type Props = {
  collection: PostCollectionResponse;
  onCollectionRefresh: () => Promise<unknown>;
};

const THREAD_LABELS: Record<PostCollaborationThreadType, string> = {
  COMMENT: "Comment",
  NOTE: "Internal Note",
  SUGGESTION: "Suggestion",
};

function getThreadVariant(type: PostCollaborationThreadType) {
  switch (type) {
    case "NOTE":
      return "warning";
    case "SUGGESTION":
      return "accent";
    case "COMMENT":
    default:
      return "neutral";
  }
}

function formatTimestamp(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function MentionPicker({
  members,
  selectedIds,
  onToggle,
  disabled,
}: {
  members: WorkspaceMember[];
  selectedIds: string[];
  onToggle: (userId: string) => void;
  disabled?: boolean;
}) {
  if (members.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-copy-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
        <AtSign className="h-3.5 w-3.5" />
        <span>Mentions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {members.map((member) => {
          const isSelected = selectedIds.includes(member.userId);
          const displayName =
            [member.firstName, member.lastName].filter(Boolean).join(" ").trim() ||
            member.email ||
            member.userId;

          return (
            <button
              key={member.userId}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(member.userId)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-copy-12 transition-colors",
                isSelected
                  ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
                  : "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] hover:border-[var(--ds-gray-500)] hover:text-[var(--ds-gray-1000)]",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <span>@</span>
              <span>{displayName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MentionBadges({
  mentions,
}: {
  mentions: Array<{ userId: string; displayName: string }>;
}) {
  if (mentions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {mentions.map((mention) => (
        <span
          key={`${mention.userId}-${mention.displayName}`}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] px-2.5 py-1 text-copy-12 text-[var(--ds-blue-700)]"
        >
          <span>@</span>
          <span>{mention.displayName}</span>
        </span>
      ))}
    </div>
  );
}

export function InternalCollaborationPanel({
  collection,
  onCollectionRefresh,
}: Props) {
  const { getToken } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const { isAgency } = usePlan();
  const { canWrite } = useRole();
  const defaultMediaId = collection.media[0]?.id ?? null;

  const [threads, setThreads] = useState<PostCollaborationThread[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);

  const [composerType, setComposerType] = useState<PostCollaborationThreadType>("COMMENT");
  const [composerVisibility, setComposerVisibility] =
    useState<PostCollaborationVisibility>("INTERNAL");
  const [composerBody, setComposerBody] = useState("");
  const [composerSuggestedText, setComposerSuggestedText] = useState("");
  const [composerMentionIds, setComposerMentionIds] = useState<string[]>([]);
  const [composerAnnotationMode, setComposerAnnotationMode] =
    useState<PostCollaborationAnnotationMode>("NONE");
  const [selection, setSelection] = useState<CollaborationCaptionSelection>(
    buildFullCaptionSelection(collection.description ?? "")
  );
  const [composerMediaAnnotation, setComposerMediaAnnotation] =
    useState<CollaborationMediaAnnotation>({
      mediaId: defaultMediaId,
      mediaMarkerX: null,
      mediaMarkerY: null,
    });
  const [creatingThread, setCreatingThread] = useState(false);

  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [replyMentionIds, setReplyMentionIds] = useState<Record<number, string[]>>({});
  const [submittingReplyThreadId, setSubmittingReplyThreadId] = useState<number | null>(null);
  const [actingThreadId, setActingThreadId] = useState<number | null>(null);

  useEffect(() => {
    setSelection(buildFullCaptionSelection(collection.description ?? ""));
    setComposerMediaAnnotation({
      mediaId: defaultMediaId,
      mediaMarkerX: null,
      mediaMarkerY: null,
    });
  }, [collection.description, collection.id, defaultMediaId]);

  useEffect(() => {
    if (!isAgency) {
      setThreads([]);
      setThreadError(null);
      setLoadingThreads(false);
      return;
    }

    let ignore = false;

    async function loadThreads() {
      try {
        setLoadingThreads(true);
        setThreadError(null);
        const next = await getPostCollaborationThreadsApi(getToken, collection.id);
        if (!ignore) {
          setThreads(next);
        }
      } catch (err: any) {
        if (!ignore) {
          setThreadError(err?.message ?? "Failed to load collaboration.");
        }
      } finally {
        if (!ignore) {
          setLoadingThreads(false);
        }
      }
    }

    void loadThreads();
    return () => {
      ignore = true;
    };
  }, [collection.id, getToken, isAgency]);

  useEffect(() => {
    if (!isAgency) {
      setMembers([]);
      setLoadingMembers(false);
      return;
    }

    const resolvedWorkspaceId: string = activeWorkspace?.id ?? "";
    if (!resolvedWorkspaceId) return;

    let ignore = false;
    async function loadMembers() {
      try {
        setLoadingMembers(true);
        const next = await getMembersApi(getToken, resolvedWorkspaceId);
        if (!ignore) {
          setMembers(next);
        }
      } catch {
        if (!ignore) {
          setMembers([]);
        }
      } finally {
        if (!ignore) {
          setLoadingMembers(false);
        }
      }
    }

    void loadMembers();
    return () => {
      ignore = true;
    };
  }, [activeWorkspace?.id, getToken, isAgency]);

  if (!isAgency) {
    return null;
  }

  async function refreshThreads() {
    try {
      setThreadError(null);
      const next = await getPostCollaborationThreadsApi(getToken, collection.id);
      setThreads(next);
    } catch (err: any) {
      setThreadError(err?.message ?? "Failed to refresh collaboration.");
    }
  }

  function toggleComposerMention(userId: string) {
    setComposerMentionIds((current) =>
      current.includes(userId)
        ? current.filter((item) => item !== userId)
        : [...current, userId]
    );
  }

  function toggleReplyMention(threadId: number, userId: string) {
    setReplyMentionIds((current) => {
      const existing = current[threadId] ?? [];
      return {
        ...current,
        [threadId]: existing.includes(userId)
          ? existing.filter((item) => item !== userId)
          : [...existing, userId],
      };
    });
  }

  function resetComposer() {
    setComposerVisibility("INTERNAL");
    setComposerBody("");
    setComposerSuggestedText("");
    setComposerMentionIds([]);
    setComposerAnnotationMode("NONE");
    setSelection(buildFullCaptionSelection(collection.description ?? ""));
    setComposerMediaAnnotation({
      mediaId: defaultMediaId,
      mediaMarkerX: null,
      mediaMarkerY: null,
    });
  }

  async function handleCreateThread() {
    if (!canWrite) return;

    setCreatingThread(true);
    try {
      await createPostCollaborationThreadApi(getToken, collection.id, {
        threadType: composerType,
        visibility: composerType === "COMMENT" ? composerVisibility : undefined,
        body: composerBody,
        mentionUserIds:
          composerType === "COMMENT" && composerVisibility === "INTERNAL"
            ? composerMentionIds
            : [],
        anchorStart:
          composerType === "SUGGESTION" || composerAnnotationMode === "CAPTION"
            ? selection.start
            : undefined,
        anchorEnd:
          composerType === "SUGGESTION" || composerAnnotationMode === "CAPTION"
            ? selection.end
            : undefined,
        anchorText:
          composerType === "SUGGESTION" || composerAnnotationMode === "CAPTION"
            ? selection.text
            : undefined,
        mediaId:
          composerType !== "SUGGESTION" && composerAnnotationMode === "MEDIA"
            ? composerMediaAnnotation.mediaId ?? undefined
            : undefined,
        mediaMarkerX:
          composerType !== "SUGGESTION" && composerAnnotationMode === "MEDIA"
            ? composerMediaAnnotation.mediaMarkerX ?? undefined
            : undefined,
        mediaMarkerY:
          composerType !== "SUGGESTION" && composerAnnotationMode === "MEDIA"
            ? composerMediaAnnotation.mediaMarkerY ?? undefined
            : undefined,
        suggestedText:
          composerType === "SUGGESTION" ? composerSuggestedText : undefined,
      });
      resetComposer();
      await refreshThreads();
      toast.success(
        composerType === "SUGGESTION"
          ? "Suggestion added."
          : composerType === "NOTE"
          ? "Internal note added."
          : composerVisibility === "CLIENT_VISIBLE"
          ? "Client-visible comment added."
          : "Comment added."
      );
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to add collaboration thread.");
    } finally {
      setCreatingThread(false);
    }
  }

  async function handleReply(threadId: number) {
    const body = replyDrafts[threadId]?.trim();
    const thread = threads.find((item) => item.id === threadId);
    if (!body) {
      toast.error("Write a reply first.");
      return;
    }
    if (!thread) {
      toast.error("Thread not found.");
      return;
    }

    setSubmittingReplyThreadId(threadId);
    try {
      await addPostCollaborationReplyApi(getToken, collection.id, threadId, {
        body,
        mentionUserIds:
          thread.visibility === "CLIENT_VISIBLE"
            ? []
            : replyMentionIds[threadId] ?? [],
      });
      setReplyDrafts((current) => ({ ...current, [threadId]: "" }));
      setReplyMentionIds((current) => ({ ...current, [threadId]: [] }));
      await refreshThreads();
      toast.success("Reply added.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to add reply.");
    } finally {
      setSubmittingReplyThreadId(null);
    }
  }

  async function handleResolve(threadId: number) {
    setActingThreadId(threadId);
    try {
      await resolvePostCollaborationThreadApi(getToken, collection.id, threadId);
      await refreshThreads();
      toast.success("Thread resolved.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to resolve thread.");
    } finally {
      setActingThreadId(null);
    }
  }

  async function handleReopen(threadId: number) {
    setActingThreadId(threadId);
    try {
      await reopenPostCollaborationThreadApi(getToken, collection.id, threadId);
      await refreshThreads();
      toast.success("Thread reopened.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to reopen thread.");
    } finally {
      setActingThreadId(null);
    }
  }

  async function handleAcceptSuggestion(threadId: number) {
    setActingThreadId(threadId);
    try {
      await acceptPostCollaborationSuggestionApi(getToken, collection.id, threadId);
      await Promise.all([refreshThreads(), onCollectionRefresh()]);
      toast.success("Suggestion accepted and applied to the caption.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to accept suggestion.");
    } finally {
      setActingThreadId(null);
    }
  }

  async function handleRejectSuggestion(threadId: number) {
    setActingThreadId(threadId);
    try {
      await rejectPostCollaborationSuggestionApi(getToken, collection.id, threadId);
      await refreshThreads();
      toast.success("Suggestion rejected.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to reject suggestion.");
    } finally {
      setActingThreadId(null);
    }
  }

  const openThreads = threads.filter((thread) => thread.status === "OPEN").length;
  const suggestionThreads = threads.filter(
    (thread) => thread.threadType === "SUGGESTION"
  ).length;
  const noteThreads = threads.filter((thread) => thread.threadType === "NOTE").length;
  const canApplySuggestions =
    canWrite &&
    (collection.overallStatus === "DRAFT" ||
      collection.overallStatus === "CHANGES_REQUESTED");
  const composerMentionsEnabled =
    composerType === "COMMENT" && composerVisibility === "INTERNAL";
  const selectionSummary =
    selection.text.length > 0
      ? selection.text
      : collection.description
      ? `Insertion point at character ${selection.start + 1}`
      : "No caption yet. Suggestions will insert new text at the start.";

  return (
    <section className={draftDetailPanelClassName}>
      <div className={draftDetailPanelHeaderClassName}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[var(--ds-gray-900)]" />
              <p className="text-title-16 text-[var(--ds-gray-1000)]">Collaboration</p>
            </div>
            <p className={draftDetailBodyTextClassName}>
              Keep review discussion inside the workspace with comments, internal notes,
              replies, annotations, and caption suggestions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <DraftDetailBadge variant="accent">{openThreads} open</DraftDetailBadge>
            <DraftDetailBadge>{threads.length} total</DraftDetailBadge>
            <DraftDetailBadge variant="warning">{noteThreads} notes</DraftDetailBadge>
            <DraftDetailBadge variant="accent">{suggestionThreads} suggestions</DraftDetailBadge>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        {!canWrite && (
          <DraftDetailNotice title="View-only collaboration access">
            <p>
              You can review collaboration threads here, but only editors, admins, and
              owners can add comments or act on suggestions.
            </p>
          </DraftDetailNotice>
        )}

        <div className={cn(draftDetailSubtlePanelClassName, "p-4")}>
          <div className="flex flex-wrap gap-2">
            {(["COMMENT", "NOTE", "SUGGESTION"] as const).map((type) => (
              <button
                key={type}
                type="button"
                disabled={!canWrite || creatingThread}
                onClick={() => {
                  setComposerType(type);
                  if (type !== "COMMENT") {
                    setComposerVisibility("INTERNAL");
                  }
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-copy-12 transition-colors",
                  composerType === type
                    ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
                    : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)]",
                  (!canWrite || creatingThread) && "cursor-not-allowed opacity-60"
                )}
              >
                {type === "NOTE" ? (
                  <Shield className="h-4 w-4" />
                ) : type === "SUGGESTION" ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
                <span>{THREAD_LABELS[type]}</span>
              </button>
            ))}
          </div>

          {composerType === "COMMENT" && (
            <div className="mt-4 flex flex-wrap gap-2">
              {([
                { value: "INTERNAL", label: "Internal Only", Icon: Shield },
                { value: "CLIENT_VISIBLE", label: "Client Visible", Icon: Globe2 },
              ] as const).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  disabled={!canWrite || creatingThread}
                  onClick={() => setComposerVisibility(value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-copy-12 transition-colors",
                    composerVisibility === value
                      ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
                      : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)]",
                    (!canWrite || creatingThread) && "cursor-not-allowed opacity-60"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-4">
            <Textarea
              value={composerBody}
              onChange={(event) => setComposerBody(event.target.value)}
              disabled={!canWrite || creatingThread}
              placeholder={
                composerType === "NOTE"
                  ? "Add an internal note for the team..."
                  : composerType === "SUGGESTION"
                  ? "Explain why this caption edit is needed..."
                  : composerVisibility === "CLIENT_VISIBLE"
                  ? "Write a client-visible comment for the review link..."
                  : "Add a comment for the team..."
              }
              className="min-h-[112px] border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]"
            />

            {composerType === "COMMENT" && composerVisibility === "CLIENT_VISIBLE" && (
              <DraftDetailNotice title="Visible on shared review links">
                <p>
                  This comment will be shown to external reviewers. Internal notes,
                  suggestions, and mentions remain hidden from client review links.
                </p>
              </DraftDetailNotice>
            )}

            {composerType === "SUGGESTION" ? (
              <div className="space-y-4 rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4">
                <div className="space-y-2">
                  <p className="text-label-14 text-[var(--ds-gray-1000)]">
                    Select the caption text to change
                  </p>
                  <Textarea
                    value={collection.description ?? ""}
                    readOnly
                    disabled={creatingThread}
                    onSelect={(event) => {
                      const node = event.currentTarget;
                      const start = node.selectionStart ?? 0;
                      const end = node.selectionEnd ?? start;
                      const text = (collection.description ?? "").slice(start, end);
                      setSelection({ start, end, text });
                    }}
                    className="min-h-[140px] border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                  />
                  <div className="rounded-lg border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-2.5">
                    <p className="text-copy-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
                      Current selection
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-label-14 text-[var(--ds-gray-900)]">
                      {selectionSummary}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-label-14 text-[var(--ds-gray-1000)]">
                    Suggested replacement
                  </p>
                  <Textarea
                    value={composerSuggestedText}
                    onChange={(event) => setComposerSuggestedText(event.target.value)}
                    disabled={!canWrite || creatingThread}
                    placeholder="Write the replacement copy here..."
                    className="min-h-[112px] border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]"
                  />
                </div>

                {!canApplySuggestions && (
                  <DraftDetailNotice title="Suggestions cannot be applied yet" variant="warning">
                    <p>
                      Team members can propose suggestions while content is in review, but the
                      caption can only be updated once the draft is editable again.
                    </p>
                  </DraftDetailNotice>
                )}
              </div>
            ) : (
              <PostCollaborationAnnotationEditor
                description={collection.description ?? ""}
                media={collection.media}
                mode={composerAnnotationMode}
                onModeChange={setComposerAnnotationMode}
                captionSelection={selection}
                onCaptionSelectionChange={setSelection}
                mediaAnnotation={composerMediaAnnotation}
                onMediaAnnotationChange={setComposerMediaAnnotation}
                disabled={!canWrite || creatingThread}
                appearance="geist"
              />
            )}

            {composerMentionsEnabled && (
              <MentionPicker
                members={members}
                selectedIds={composerMentionIds}
                onToggle={toggleComposerMention}
                disabled={!canWrite || creatingThread || loadingMembers}
              />
            )}

            <div className="flex justify-end">
              <DraftDetailActionButton
                tone="primary"
                disabled={!canWrite || creatingThread}
                onClick={handleCreateThread}
              >
                <span className="inline-flex items-center gap-2">
                  {creatingThread ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>
                        {composerType === "SUGGESTION"
                          ? "Add Suggestion"
                          : composerType === "NOTE"
                          ? "Add Internal Note"
                          : "Add Comment"}
                      </span>
                    </>
                  )}
                </span>
              </DraftDetailActionButton>
            </div>
          </div>
        </div>

        {threadError && (
          <DraftDetailNotice title="Collaboration failed to load" variant="error">
            <p>{threadError}</p>
          </DraftDetailNotice>
        )}

        {loadingThreads ? (
          <div className={cn(draftDetailSubtlePanelClassName, "flex items-center justify-center px-4 py-8")}>
            <Loader2 className="h-5 w-5 animate-spin text-[var(--ds-gray-900)]" />
          </div>
        ) : threads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-8 text-center">
            <p className="text-label-14 text-[var(--ds-gray-1000)]">
              No collaboration threads yet
            </p>
            <p className={cn("mt-1", draftDetailBodyTextClassName)}>
              Start the conversation here instead of moving review feedback to Slack or email.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => {
              const isSuggestion = thread.threadType === "SUGGESTION";
              const suggestionPending =
                isSuggestion && thread.suggestionStatus === "PENDING";
              const threadBusy = actingThreadId === thread.id;

              return (
                <div
                  key={thread.id}
                  className={cn(draftDetailSubtlePanelClassName, "p-4")}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <DraftDetailBadge variant={getThreadVariant(thread.threadType)}>
                          {THREAD_LABELS[thread.threadType]}
                        </DraftDetailBadge>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-copy-12",
                            thread.status === "OPEN"
                              ? "border border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]"
                              : "border border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]"
                          )}
                        >
                          {thread.status === "OPEN" ? "Open" : "Resolved"}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-2.5 py-1 text-copy-12 text-[var(--ds-gray-900)]">
                          {thread.visibility === "CLIENT_VISIBLE"
                            ? "Client visible"
                            : "Internal only"}
                        </span>
                        {thread.authorType === "CLIENT_REVIEWER" && (
                          <span className="inline-flex items-center rounded-full border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] px-2.5 py-1 text-copy-12 text-[var(--ds-blue-700)]">
                            Client reviewer
                          </span>
                        )}
                        {thread.suggestionStatus && (
                          <span className="inline-flex items-center rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-2.5 py-1 text-copy-12 text-[var(--ds-gray-900)]">
                            Suggestion {thread.suggestionStatus.toLowerCase()}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-label-14 text-[var(--ds-gray-1000)]">
                          {thread.authorDisplayName}
                        </p>
                        <p className={draftDetailMetaTextClassName}>
                          {formatTimestamp(thread.createdAt)}
                          {thread.status === "RESOLVED" && thread.resolvedAt
                            ? ` · resolved ${formatTimestamp(thread.resolvedAt)}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    {canWrite && (
                      <div className="flex flex-wrap gap-2">
                        {!isSuggestion &&
                          (thread.status === "OPEN" ? (
                            <DraftDetailActionButton
                              compact
                              disabled={threadBusy}
                              onClick={() => handleResolve(thread.id)}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                {threadBusy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                <span>Resolve</span>
                              </span>
                            </DraftDetailActionButton>
                          ) : (
                            <DraftDetailActionButton
                              compact
                              disabled={threadBusy}
                              onClick={() => handleReopen(thread.id)}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                {threadBusy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-3.5 w-3.5" />
                                )}
                                <span>Reopen</span>
                              </span>
                            </DraftDetailActionButton>
                          ))}

                        {suggestionPending && (
                          <>
                            <DraftDetailActionButton
                              compact
                              disabled={!canApplySuggestions || threadBusy}
                              onClick={() => handleRejectSuggestion(thread.id)}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                {threadBusy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-3.5 w-3.5" />
                                )}
                                <span>Reject</span>
                              </span>
                            </DraftDetailActionButton>
                            <DraftDetailActionButton
                              compact
                              tone="primary"
                              disabled={!canApplySuggestions || threadBusy}
                              onClick={() => handleAcceptSuggestion(thread.id)}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                {threadBusy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                <span>Accept</span>
                              </span>
                            </DraftDetailActionButton>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {thread.body && (
                    <p className="mt-4 whitespace-pre-wrap text-label-14 leading-6 text-[var(--ds-gray-900)]">
                      {thread.body}
                    </p>
                  )}

                  {!isSuggestion && (
                    <PostCollaborationAnnotationView
                      thread={thread}
                      media={collection.media}
                      appearance="geist"
                    />
                  )}

                  {isSuggestion && (
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <div className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-3">
                        <p className="text-copy-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
                          Current text
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-label-14 text-[var(--ds-gray-900)]">
                          {thread.anchorText && thread.anchorText.length > 0
                            ? thread.anchorText
                            : "Insertion point"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] p-3">
                        <p className="text-copy-12 uppercase tracking-[0.16em] text-[var(--ds-blue-700)]">
                          Suggested text
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-label-14 text-[var(--ds-gray-1000)]">
                          {thread.suggestedText}
                        </p>
                      </div>
                    </div>
                  )}

                  <MentionBadges mentions={thread.mentions} />

                  {thread.replies.length > 0 && (
                    <div className="mt-4 space-y-3 border-t border-[var(--ds-gray-400)] pt-4">
                      {thread.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 py-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-label-14 text-[var(--ds-gray-1000)]">
                              {reply.authorDisplayName}
                            </p>
                            <p className={draftDetailMetaTextClassName}>
                              {formatTimestamp(reply.createdAt)}
                            </p>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-label-14 leading-6 text-[var(--ds-gray-900)]">
                            {reply.body}
                          </p>
                          <MentionBadges mentions={reply.mentions} />
                        </div>
                      ))}
                    </div>
                  )}

                  {canWrite && thread.status === "OPEN" && (
                    <div className="mt-4 space-y-3 border-t border-[var(--ds-gray-400)] pt-4">
                      <Textarea
                        value={replyDrafts[thread.id] ?? ""}
                        onChange={(event) =>
                          setReplyDrafts((current) => ({
                            ...current,
                            [thread.id]: event.target.value,
                          }))
                        }
                        disabled={submittingReplyThreadId === thread.id}
                        placeholder="Reply in thread..."
                        className="min-h-[92px] border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]"
                      />
                      {thread.visibility === "INTERNAL" && (
                        <MentionPicker
                          members={members}
                          selectedIds={replyMentionIds[thread.id] ?? []}
                          onToggle={(userId) => toggleReplyMention(thread.id, userId)}
                          disabled={
                            submittingReplyThreadId === thread.id || loadingMembers
                          }
                        />
                      )}
                      <div className="flex justify-end">
                        <DraftDetailActionButton
                          tone="primary"
                          disabled={submittingReplyThreadId === thread.id}
                          onClick={() => handleReply(thread.id)}
                        >
                          <span className="inline-flex items-center gap-2">
                            {submittingReplyThreadId === thread.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Replying…</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                <span>Add Reply</span>
                              </>
                            )}
                          </span>
                        </DraftDetailActionButton>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

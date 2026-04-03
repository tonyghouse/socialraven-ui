"use client";

import AtlassianButton from "@atlaskit/button/new";
import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
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
import { useRole } from "@/hooks/useRole";

type Props = {
  collection: PostCollectionResponse;
  onCollectionRefresh: () => Promise<unknown>;
};

type SelectionState = {
  start: number;
  end: number;
  text: string;
};

const THREAD_LABELS: Record<PostCollaborationThreadType, string> = {
  COMMENT: "Comment",
  NOTE: "Internal Note",
  SUGGESTION: "Suggestion",
};

function buildDefaultSelection(description: string): SelectionState {
  return {
    start: 0,
    end: description.length,
    text: description,
  };
}

function getThreadAppearance(type: PostCollaborationThreadType) {
  switch (type) {
    case "NOTE":
      return "moved";
    case "SUGGESTION":
      return "new";
    case "COMMENT":
    default:
      return "default";
  }
}

function formatTimestamp(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString("en-US", {
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
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
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
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                isSelected
                  ? "border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                  : "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--accent))]/25 hover:text-[hsl(var(--foreground))]",
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
          className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--accent))]/25 bg-[hsl(var(--accent))]/10 px-2.5 py-1 text-xs font-medium text-[hsl(var(--accent))]"
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
  const { canWrite } = useRole();

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
  const [selection, setSelection] = useState<SelectionState>(
    buildDefaultSelection(collection.description ?? "")
  );
  const [creatingThread, setCreatingThread] = useState(false);

  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [replyMentionIds, setReplyMentionIds] = useState<Record<number, string[]>>({});
  const [submittingReplyThreadId, setSubmittingReplyThreadId] = useState<number | null>(null);
  const [actingThreadId, setActingThreadId] = useState<number | null>(null);

  const captionSelectionRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setSelection(buildDefaultSelection(collection.description ?? ""));
  }, [collection.description, collection.id]);

  useEffect(() => {
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
  }, [collection.id, getToken]);

  useEffect(() => {
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
  }, [activeWorkspace?.id, getToken]);

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
    setSelection(buildDefaultSelection(collection.description ?? ""));
    if (captionSelectionRef.current) {
      captionSelectionRef.current.selectionStart = 0;
      captionSelectionRef.current.selectionEnd = collection.description?.length ?? 0;
    }
  }

  function handleCaptionSelection() {
    const node = captionSelectionRef.current;
    if (!node) return;

    const start = node.selectionStart ?? 0;
    const end = node.selectionEnd ?? start;
    const text = (collection.description ?? "").slice(start, end);
    setSelection({ start, end, text });
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
        anchorStart: composerType === "SUGGESTION" ? selection.start : undefined,
        anchorEnd: composerType === "SUGGESTION" ? selection.end : undefined,
        anchorText: composerType === "SUGGESTION" ? selection.text : undefined,
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
    <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
              <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">
                Collaboration
              </p>
            </div>
            <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
              Keep review discussion inside the workspace with comments, internal notes,
              replies, and caption suggestions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Lozenge appearance="new">{openThreads} open</Lozenge>
            <Lozenge appearance="default">{threads.length} total</Lozenge>
            <Lozenge appearance="moved">{noteThreads} notes</Lozenge>
            <Lozenge appearance="inprogress">{suggestionThreads} suggestions</Lozenge>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        {!canWrite && (
          <SectionMessage appearance="information" title="View-only collaboration access">
            <p className="text-sm">
              You can review collaboration threads here, but only editors, admins, and
              owners can add comments or act on suggestions.
            </p>
          </SectionMessage>
        )}

        <div className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-4">
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
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  composerType === type
                    ? "border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))]",
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
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    composerVisibility === value
                      ? "border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))]",
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
              className="min-h-[112px] bg-[hsl(var(--surface))]"
            />

            {composerType === "COMMENT" && composerVisibility === "CLIENT_VISIBLE" && (
              <SectionMessage appearance="information" title="Visible on shared review links">
                <p className="text-sm">
                  This comment will be shown to external reviewers. Internal notes,
                  suggestions, and mentions remain hidden from client review links.
                </p>
              </SectionMessage>
            )}

            {composerType === "SUGGESTION" && (
              <div className="space-y-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    Select the caption text to change
                  </p>
                  <Textarea
                    ref={captionSelectionRef}
                    value={collection.description ?? ""}
                    readOnly
                    disabled={creatingThread}
                    onSelect={handleCaptionSelection}
                    className="min-h-[140px] bg-[hsl(var(--surface-raised))]"
                  />
                  <div className="rounded-lg border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-3 py-2.5">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
                      Current selection
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-[hsl(var(--foreground-muted))]">
                      {selectionSummary}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    Suggested replacement
                  </p>
                  <Textarea
                    value={composerSuggestedText}
                    onChange={(event) => setComposerSuggestedText(event.target.value)}
                    disabled={!canWrite || creatingThread}
                    placeholder="Write the replacement copy here..."
                    className="min-h-[112px] bg-[hsl(var(--surface))]"
                  />
                </div>

                {!canApplySuggestions && (
                  <SectionMessage appearance="warning" title="Suggestions cannot be applied yet">
                    <p className="text-sm">
                      Team members can propose suggestions while content is in review, but the
                      caption can only be updated once the draft is editable again.
                    </p>
                  </SectionMessage>
                )}
              </div>
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
              <AtlassianButton
                appearance="primary"
                isDisabled={!canWrite || creatingThread}
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
              </AtlassianButton>
            </div>
          </div>
        </div>

        {threadError && (
          <SectionMessage appearance="error" title="Collaboration failed to load">
            <p className="text-sm">{threadError}</p>
          </SectionMessage>
        )}

        {loadingThreads ? (
          <div className="flex items-center justify-center rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--foreground-muted))]" />
          </div>
        ) : threads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-8 text-center">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              No collaboration threads yet
            </p>
            <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
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
                  className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Lozenge appearance={getThreadAppearance(thread.threadType)}>
                          {THREAD_LABELS[thread.threadType]}
                        </Lozenge>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                            thread.status === "OPEN"
                              ? "bg-amber-500/10 text-amber-700"
                              : "bg-emerald-500/10 text-emerald-700"
                          )}
                        >
                          {thread.status === "OPEN" ? "Open" : "Resolved"}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--foreground-muted))]">
                          {thread.visibility === "CLIENT_VISIBLE"
                            ? "Client visible"
                            : "Internal only"}
                        </span>
                        {thread.authorType === "CLIENT_REVIEWER" && (
                          <span className="inline-flex items-center rounded-full border border-[hsl(var(--accent))]/25 bg-[hsl(var(--accent))]/10 px-2.5 py-1 text-xs font-medium text-[hsl(var(--accent))]">
                            Client reviewer
                          </span>
                        )}
                        {thread.suggestionStatus && (
                          <span className="inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--foreground-muted))]">
                            Suggestion {thread.suggestionStatus.toLowerCase()}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                          {thread.authorDisplayName}
                        </p>
                        <p className="text-xs text-[hsl(var(--foreground-muted))]">
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
                            <AtlassianButton
                              appearance="subtle"
                              isDisabled={threadBusy}
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
                            </AtlassianButton>
                          ) : (
                            <AtlassianButton
                              appearance="subtle"
                              isDisabled={threadBusy}
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
                            </AtlassianButton>
                          ))}

                        {suggestionPending && (
                          <>
                            <AtlassianButton
                              appearance="subtle"
                              isDisabled={!canApplySuggestions || threadBusy}
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
                            </AtlassianButton>
                            <AtlassianButton
                              appearance="primary"
                              isDisabled={!canApplySuggestions || threadBusy}
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
                            </AtlassianButton>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {thread.body && (
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                      {thread.body}
                    </p>
                  )}

                  {isSuggestion && (
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
                          Current text
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-[hsl(var(--foreground-muted))]">
                          {thread.anchorText && thread.anchorText.length > 0
                            ? thread.anchorText
                            : "Insertion point"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-[hsl(var(--accent))]/25 bg-[hsl(var(--accent))]/8 p-3">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--accent))]">
                          Suggested text
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-[hsl(var(--foreground))]">
                          {thread.suggestedText}
                        </p>
                      </div>
                    </div>
                  )}

                  <MentionBadges mentions={thread.mentions} />

                  {thread.replies.length > 0 && (
                    <div className="mt-4 space-y-3 border-t border-[hsl(var(--border-subtle))] pt-4">
                      {thread.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-3 py-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                              {reply.authorDisplayName}
                            </p>
                            <p className="text-xs text-[hsl(var(--foreground-muted))]">
                              {formatTimestamp(reply.createdAt)}
                            </p>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                            {reply.body}
                          </p>
                          <MentionBadges mentions={reply.mentions} />
                        </div>
                      ))}
                    </div>
                  )}

                  {canWrite && thread.status === "OPEN" && (
                    <div className="mt-4 space-y-3 border-t border-[hsl(var(--border-subtle))] pt-4">
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
                        className="min-h-[92px] bg-[hsl(var(--surface))]"
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
                        <AtlassianButton
                          appearance="primary"
                          isDisabled={submittingReplyThreadId === thread.id}
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
                        </AtlassianButton>
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

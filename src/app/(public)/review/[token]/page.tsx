"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Globe2,
  LockKeyhole,
  Loader2,
  MessageSquare,
  XCircle,
} from "lucide-react";
import {
  PublicCard,
  PublicHero,
  PublicInsetCard,
  PublicPageShell,
  PublicSection,
} from "@/components/public/public-layout";
import {
  PublicLozenge,
  PublicPrimaryButton,
  PublicSectionMessage,
  PublicSubtleButton,
} from "@/components/public/public-site-primitives";
import {
  buildFullCaptionSelection,
  PostCollaborationAnnotationEditor,
  type CollaborationCaptionSelection,
  type CollaborationMediaAnnotation,
} from "@/components/posts/post-collaboration-annotation-editor";
import { PostCollaborationAnnotationView } from "@/components/posts/post-collaboration-annotation-view";
import { Textarea } from "@/components/ui/textarea";
import type {
  PublicPostCollectionReviewResponse,
  PublicReviewDecisionRequest,
} from "@/model/ReviewLink";
import type { PostCollaborationAnnotationMode } from "@/model/PostCollaboration";
import {
  addPublicReviewCommentApi,
  approvePublicReviewApi,
  getPublicPostCollectionReviewApi,
  rejectPublicReviewApi,
} from "@/service/reviewLinks";

type ReviewLinkFetchError = Error & {
  status?: number;
  body?: string;
};

function formatTimestamp(value: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusAppearance(status: PublicPostCollectionReviewResponse["overallStatus"]) {
  switch (status) {
    case "IN_REVIEW":
      return "inprogress";
    case "CHANGES_REQUESTED":
      return "moved";
    case "APPROVED":
      return "success";
    case "SCHEDULED":
      return "new";
    case "PUBLISHED":
      return "success";
    case "FAILED":
      return "removed";
    default:
      return "default";
  }
}

function passcodeStorageKey(token: string) {
  return `publicReviewPasscode:${token}`;
}

function isPasscodeError(error: ReviewLinkFetchError) {
  return (
    error?.status === 403 &&
    (error?.body?.toLowerCase().includes("passcode") ||
      error?.message?.toLowerCase().includes("passcode"))
  );
}

export default function PublicReviewPage() {
  const { token } = useParams<{ token: string }>();
  const [review, setReview] = useState<PublicPostCollectionReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [reviewPasscode, setReviewPasscode] = useState("");
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [commentAnnotationMode, setCommentAnnotationMode] =
    useState<PostCollaborationAnnotationMode>("NONE");
  const [commentSelection, setCommentSelection] = useState<CollaborationCaptionSelection>(
    buildFullCaptionSelection("")
  );
  const [commentMediaAnnotation, setCommentMediaAnnotation] =
    useState<CollaborationMediaAnnotation>({
      mediaId: null,
      mediaMarkerX: null,
      mediaMarkerY: null,
    });
  const [decisionNote, setDecisionNote] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [acting, setActing] = useState<"approve" | "reject" | null>(null);
  const reviewCollectionId = review?.collectionId ?? null;
  const reviewDescription = review?.description ?? "";
  const reviewDefaultMediaId = review?.media[0]?.id ?? null;

  useEffect(() => {
    const savedName = localStorage.getItem("publicReviewerName");
    const savedEmail = localStorage.getItem("publicReviewerEmail");
    if (savedName) setReviewerName(savedName);
    if (savedEmail) setReviewerEmail(savedEmail);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load(nextPasscode?: string) {
      try {
        setLoading(true);
        setError(null);
        const storedPasscode =
          nextPasscode !== undefined
            ? nextPasscode
            : sessionStorage.getItem(passcodeStorageKey(token)) ?? "";
        if (nextPasscode === undefined && storedPasscode) {
          setReviewPasscode(storedPasscode);
        }
        const next = await getPublicPostCollectionReviewApi(token, storedPasscode || undefined);
        if (!ignore) {
          setReview(next);
          setLockedMessage(null);
          if (storedPasscode) {
            sessionStorage.setItem(passcodeStorageKey(token), storedPasscode);
          } else {
            sessionStorage.removeItem(passcodeStorageKey(token));
          }
        }
      } catch (err: any) {
        if (!ignore) {
          const reviewError = err as ReviewLinkFetchError;
          if (isPasscodeError(reviewError)) {
            setReview(null);
            setLockedMessage(reviewError.body ?? "This review link requires a passcode.");
            setError(null);
            sessionStorage.removeItem(passcodeStorageKey(token));
          } else {
            setError(reviewError?.message ?? "Failed to load review link.");
            setLockedMessage(null);
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [token]);

  useEffect(() => {
    if (reviewCollectionId === null) {
      return;
    }
    setCommentSelection(buildFullCaptionSelection(reviewDescription));
    setCommentMediaAnnotation({
      mediaId: reviewDefaultMediaId,
      mediaMarkerX: null,
      mediaMarkerY: null,
    });
  }, [reviewCollectionId, reviewDefaultMediaId, reviewDescription]);

  function persistIdentity() {
    localStorage.setItem("publicReviewerName", reviewerName.trim());
    localStorage.setItem("publicReviewerEmail", reviewerEmail.trim().toLowerCase());
  }

  function getIdentityPayload(): PublicReviewDecisionRequest | null {
    const name = reviewerName.trim();
    const email = reviewerEmail.trim().toLowerCase();
    if (!name || !email) {
      setError("Enter your name and email before leaving feedback.");
      return null;
    }
    persistIdentity();
    return {
      reviewerName: name,
      reviewerEmail: email,
      note: decisionNote.trim() || undefined,
    };
  }

  async function refreshReview() {
    const next = await getPublicPostCollectionReviewApi(token, reviewPasscode || undefined);
    setReview(next);
  }

  function resetCommentDraft() {
    setCommentBody("");
    setCommentAnnotationMode("NONE");
    setCommentSelection(buildFullCaptionSelection(reviewDescription));
    setCommentMediaAnnotation({
      mediaId: reviewDefaultMediaId,
      mediaMarkerX: null,
      mediaMarkerY: null,
    });
  }

  async function handleAddComment() {
    const identity = getIdentityPayload();
    if (!identity) return;
    if (!commentBody.trim()) {
      setError("Write a comment before sending it.");
      return;
    }

    setCommenting(true);
    setError(null);
    try {
      await addPublicReviewCommentApi(token, {
        reviewerName: identity.reviewerName,
        reviewerEmail: identity.reviewerEmail,
        body: commentBody.trim(),
        anchorStart:
          commentAnnotationMode === "CAPTION" ? commentSelection.start : undefined,
        anchorEnd: commentAnnotationMode === "CAPTION" ? commentSelection.end : undefined,
        anchorText: commentAnnotationMode === "CAPTION" ? commentSelection.text : undefined,
        mediaId:
          commentAnnotationMode === "MEDIA"
            ? commentMediaAnnotation.mediaId ?? undefined
            : undefined,
        mediaMarkerX:
          commentAnnotationMode === "MEDIA"
            ? commentMediaAnnotation.mediaMarkerX ?? undefined
            : undefined,
        mediaMarkerY:
          commentAnnotationMode === "MEDIA"
            ? commentMediaAnnotation.mediaMarkerY ?? undefined
            : undefined,
      }, reviewPasscode || undefined);
      resetCommentDraft();
      await refreshReview();
    } catch (err: any) {
      setError(err?.message ?? "Failed to add comment.");
    } finally {
      setCommenting(false);
    }
  }

  async function handleDecision(action: "approve" | "reject") {
    const identity = getIdentityPayload();
    if (!identity) return;

    setActing(action);
    setError(null);
    try {
      const next =
        action === "approve"
          ? await approvePublicReviewApi(token, identity, reviewPasscode || undefined)
          : await rejectPublicReviewApi(token, identity, reviewPasscode || undefined);
      setReview(next);
      setDecisionNote("");
    } catch (err: any) {
      setError(err?.message ?? `Failed to ${action} content.`);
    } finally {
      setActing(null);
    }
  }

  async function handleUnlockReview() {
    if (!reviewPasscode.trim()) {
      setLockedMessage("Enter the review passcode to continue.");
      return;
    }

    setUnlocking(true);
    setError(null);
    try {
      const next = await getPublicPostCollectionReviewApi(token, reviewPasscode.trim());
      setReview(next);
      setLockedMessage(null);
      setError(null);
      sessionStorage.setItem(passcodeStorageKey(token), reviewPasscode.trim());
    } catch (err: any) {
      const reviewError = err as ReviewLinkFetchError;
      if (isPasscodeError(reviewError)) {
        setLockedMessage(reviewError.body ?? "Incorrect review link passcode.");
        sessionStorage.removeItem(passcodeStorageKey(token));
      } else {
        setError(reviewError?.message ?? "Failed to unlock review link.");
      }
    } finally {
      setUnlocking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ds-background-100)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--ds-gray-900)]" />
      </div>
    );
  }

  if (error && !review && !lockedMessage) {
    return (
      <PublicPageShell>
        <div className="mx-auto max-w-xl px-6 py-24">
          <PublicCard className="p-8">
            <div className="mb-4 flex justify-center">
              <AlertCircle className="h-12 w-12 text-[var(--ds-red-600)]" />
            </div>
            <h1 className="text-center text-heading-24 text-[var(--ds-gray-1000)]">
              Review link unavailable
            </h1>
            <p className="mt-3 text-center text-copy-14 text-[var(--ds-gray-900)]">
              {error}
            </p>
          </PublicCard>
        </div>
      </PublicPageShell>
    );
  }

  if (lockedMessage && !review) {
    return (
      <PublicPageShell>
        <div className="mx-auto max-w-xl px-6 py-24">
          <PublicCard className="p-8">
            <div className="mb-4 flex justify-center">
              <LockKeyhole className="h-12 w-12 text-[var(--ds-blue-600)]" />
            </div>
            <h1 className="text-center text-heading-24 text-[var(--ds-gray-1000)]">
              Passcode Required
            </h1>
            <p className="mt-3 text-center text-copy-14 text-[var(--ds-gray-900)]">
              This review link is protected. Enter the passcode shared by the workspace team to
              view the campaign.
            </p>
            <div className="mt-6 space-y-3">
              <input
                value={reviewPasscode}
                onChange={(event) => setReviewPasscode(event.target.value)}
                className="w-full rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-2 text-copy-14 text-[var(--ds-gray-1000)] outline-none transition-colors focus:border-[var(--ds-blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2"
                placeholder="Enter passcode"
                type="password"
              />
              <PublicPrimaryButton onClick={handleUnlockReview} disabled={unlocking}>
                <span className="inline-flex items-center gap-2">
                  {unlocking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LockKeyhole className="h-4 w-4" />
                  )}
                  <span>{unlocking ? "Unlocking…" : "Unlock Review"}</span>
                </span>
              </PublicPrimaryButton>
            </div>
            <p className="mt-4 text-center text-copy-13 text-[var(--ds-gray-900)]">
              {lockedMessage}
            </p>
            {error && <p className="mt-2 text-center text-copy-13 text-[var(--ds-red-600)]">{error}</p>}
          </PublicCard>
        </div>
      </PublicPageShell>
    );
  }

  if (!review) {
    return null;
  }

  const reviewMessage = review.linkRevoked
    ? "This review link has been revoked by the workspace team."
    : review.linkExpired
    ? "This review link has expired."
    : review.overallStatus === "APPROVED"
    ? "Final approval has been recorded. The internal team can now activate scheduling based on their workspace policy."
    : review.shareScope === "SELECTED_POSTS"
    ? "This link covers selected post variants. Leave comments here, then use the full campaign review link for final approval."
    : review.canApprove || review.canReject
    ? "Review the content below, leave comments if needed, and approve or reject it."
    : "This content is visible for reference, but review actions are no longer available.";

  return (
    <PublicPageShell>
      <PublicHero
        eyebrow="External Client Review"
        title={review.description || "Untitled content"}
        description={reviewMessage}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <PublicLozenge appearance={statusAppearance(review.overallStatus)} isBold>
              {review.overallStatus.replaceAll("_", " ")}
            </PublicLozenge>
            {review.postCollectionType && (
              <PublicLozenge appearance="default">{review.postCollectionType}</PublicLozenge>
            )}
            <PublicLozenge appearance="default">
              {review.shareScope === "SELECTED_POSTS" ? "Selected posts" : "Full campaign"}
            </PublicLozenge>
            <PublicLozenge appearance="new">
              Expires {formatTimestamp(review.linkExpiresAt)}
            </PublicLozenge>
          </div>
        }
        aside={
          <PublicCard className="p-5">
            <div className="space-y-4">
              <div>
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Scheduled time
                </p>
                <div className="mt-2 flex items-center gap-2 text-copy-14 text-[var(--ds-gray-1000)]">
                  <CalendarClock className="h-4 w-4 text-[var(--ds-gray-900)]" />
                  <span>{formatTimestamp(review.scheduledTime)}</span>
                </div>
              </div>

              <div>
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Platforms
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {review.channels.map((channel, index) => (
                    <PublicLozenge key={`${channel.platform}-${index}`} appearance="default">
                      {channel.platform}
                      {channel.username ? ` · ${channel.username}` : ""}
                    </PublicLozenge>
                  ))}
                </div>
              </div>
            </div>
          </PublicCard>
        }
      />

      <PublicSection
        eyebrow="Review Actions"
        title="Leave feedback or sign off"
        description="Your name and email are captured with any comment, approval, or rejection."
        surface="surface"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
          <PublicCard className="p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-label-14 text-[var(--ds-gray-1000)]">Your name</span>
                <input
                  value={reviewerName}
                  onChange={(event) => setReviewerName(event.target.value)}
                  className="w-full rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-2 text-copy-14 text-[var(--ds-gray-1000)] outline-none transition-colors focus:border-[var(--ds-blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2"
                  placeholder="Jane Client"
                />
              </label>
              <label className="space-y-2">
                <span className="text-label-14 text-[var(--ds-gray-1000)]">Email</span>
                <input
                  value={reviewerEmail}
                  onChange={(event) => setReviewerEmail(event.target.value)}
                  className="w-full rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-2 text-copy-14 text-[var(--ds-gray-1000)] outline-none transition-colors focus:border-[var(--ds-blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2"
                  placeholder="jane@client.com"
                  type="email"
                />
              </label>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-label-14 text-[var(--ds-gray-1000)]">Comment</p>
                <Textarea
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder="Share any feedback for the team..."
                  disabled={!review.canComment || commenting || acting !== null}
                  className="min-h-[8.75rem] bg-[var(--ds-gray-100)]"
                />
                <PostCollaborationAnnotationEditor
                  description={review.description ?? ""}
                  media={review.media}
                  mode={commentAnnotationMode}
                  onModeChange={setCommentAnnotationMode}
                  captionSelection={commentSelection}
                  onCaptionSelectionChange={setCommentSelection}
                  mediaAnnotation={commentMediaAnnotation}
                  onMediaAnnotationChange={setCommentMediaAnnotation}
                  disabled={!review.canComment || commenting || acting !== null}
                />
                <PublicPrimaryButton
                  onClick={handleAddComment}
                  disabled={!review.canComment || commenting || acting !== null}
                >
                  <span className="inline-flex items-center gap-2">
                    {commenting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                    <span>{commenting ? "Sending…" : "Add Comment"}</span>
                  </span>
                </PublicPrimaryButton>
              </div>

              <div className="space-y-2">
                {review.shareScope === "SELECTED_POSTS" ? (
                  <PublicSectionMessage appearance="information" title="Comment-only review link">
                    <p>
                      This link covers selected post variants for feedback. Final approve or reject
                      decisions stay on the full campaign review link.
                    </p>
                  </PublicSectionMessage>
                ) : (
                  <>
                    <p className="text-label-14 text-[var(--ds-gray-1000)]">Decision note</p>
                    <Textarea
                      value={decisionNote}
                      onChange={(event) => setDecisionNote(event.target.value)}
                      placeholder="Optional context for your decision..."
                      className="min-h-[8.75rem] bg-[var(--ds-gray-100)]"
                    />
                    <div className="flex flex-wrap gap-3">
                      <PublicPrimaryButton
                        onClick={() => handleDecision("approve")}
                        disabled={!review.canApprove || acting !== null || commenting}
                      >
                        <span className="inline-flex items-center gap-2">
                          {acting === "approve" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          <span>Approve</span>
                        </span>
                      </PublicPrimaryButton>
                      <PublicSubtleButton
                        onClick={() => handleDecision("reject")}
                        disabled={!review.canReject || acting !== null || commenting}
                      >
                        <span className="inline-flex items-center gap-2">
                          {acting === "reject" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span>Reject</span>
                        </span>
                      </PublicSubtleButton>
                    </div>
                  </>
                )}
              </div>
            </div>
          </PublicCard>

          <PublicInsetCard className="p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-[var(--ds-gray-900)]" />
                <p className="text-label-14 text-[var(--ds-gray-1000)]">
                  Review access
                </p>
              </div>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                This page only exposes the content preview, schedule, platform targets, and
                client-visible discussion. Internal workspace settings and notes are hidden.
              </p>
              <PublicSectionMessage
                appearance={
                  review.linkRevoked || review.linkExpired ? "warning" : "information"
                }
                title={
                  review.linkRevoked
                    ? "Link revoked"
                    : review.linkExpired
                    ? "Link expired"
                    : review.shareScope === "SELECTED_POSTS" && review.canComment
                    ? "Comment-only link"
                    : review.canApprove || review.canReject
                    ? "Actions available"
                    : "View-only state"
                }
              >
                <p>{reviewMessage}</p>
              </PublicSectionMessage>
              {error && (
                <PublicSectionMessage appearance="error" title="Action failed">
                  <p>{error}</p>
                </PublicSectionMessage>
              )}
            </div>
          </PublicInsetCard>
        </div>
      </PublicSection>

      <PublicSection
        eyebrow="Preview"
        title="Content details"
        description="Review the scheduled content and any client-visible conversation."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
          <div className="space-y-6">
            {review.media.length > 0 && (
              <PublicCard className="p-5">
                <p className="text-label-14 text-[var(--ds-gray-1000)]">Media</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {review.media.map((media) => {
                    const isVideo = media.mimeType?.startsWith("video/");
                    return (
                      <div
                        key={media.id}
                        className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]"
                      >
                        <div className="aspect-video bg-black/5">
                          {isVideo ? (
                            // eslint-disable-next-line jsx-a11y/media-has-caption
                            <video src={media.fileUrl} controls className="h-full w-full object-contain" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={media.fileUrl} alt={media.fileName} className="h-full w-full object-contain" />
                          )}
                        </div>
                        <div className="border-t border-[var(--ds-gray-400)] px-3 py-2">
                          <p className="truncate text-copy-13 text-[var(--ds-gray-900)]">
                            {media.fileName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PublicCard>
            )}

            <PublicCard className="p-5">
              <p className="text-label-14 text-[var(--ds-gray-1000)]">Caption</p>
              <p className="mt-4 whitespace-pre-wrap text-copy-14 text-[var(--ds-gray-900)]">
                {review.description || "No caption provided."}
              </p>
            </PublicCard>

            <PublicCard className="p-5">
              <p className="text-label-14 text-[var(--ds-gray-1000)]">Comments</p>
              {review.collaborationThreads.length === 0 ? (
                <p className="mt-4 text-copy-13 text-[var(--ds-gray-900)]">
                  No client-visible comments yet.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {review.collaborationThreads.map((thread) => (
                    <PublicInsetCard key={thread.id} className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-label-14 text-[var(--ds-gray-1000)]">
                          {thread.authorDisplayName}
                        </p>
                        <PublicLozenge
                          appearance={
                            thread.authorType === "CLIENT_REVIEWER" ? "new" : "default"
                          }
                        >
                          {thread.authorType === "CLIENT_REVIEWER"
                            ? "Client reviewer"
                            : "Workspace team"}
                        </PublicLozenge>
                        <span className="text-label-12 text-[var(--ds-gray-900)]">
                          {formatTimestamp(thread.createdAt)}
                        </span>
                      </div>
                      {thread.body && (
                        <p className="mt-3 whitespace-pre-wrap text-copy-14 text-[var(--ds-gray-900)]">
                          {thread.body}
                        </p>
                      )}
                      <PostCollaborationAnnotationView thread={thread} media={review.media} />
                      {thread.replies.length > 0 && (
                        <div className="mt-4 space-y-3 border-t border-[var(--ds-gray-400)] pt-4">
                          {thread.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 py-3"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-label-14 text-[var(--ds-gray-1000)]">
                                  {reply.authorDisplayName}
                                </p>
                                <PublicLozenge appearance="default">Workspace team</PublicLozenge>
                                <span className="text-label-12 text-[var(--ds-gray-900)]">
                                  {formatTimestamp(reply.createdAt)}
                                </span>
                              </div>
                              <p className="mt-2 whitespace-pre-wrap text-copy-14 text-[var(--ds-gray-900)]">
                                {reply.body}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </PublicInsetCard>
                  ))}
                </div>
              )}
            </PublicCard>
          </div>

          <div className="space-y-6">
            <PublicCard className="p-5">
              <p className="text-label-14 text-[var(--ds-gray-1000)]">Platform targets</p>
              <div className="mt-4 space-y-3">
                {review.channels.map((channel, index) => (
                  <PublicInsetCard key={`${channel.platform}-${index}`} className="p-3">
                    <p className="text-label-14 text-[var(--ds-gray-1000)]">
                      {channel.platform ?? "Unknown platform"}
                    </p>
                    <p className="mt-1 text-copy-13 text-[var(--ds-gray-900)]">
                      {channel.username ?? "Connected profile"}
                    </p>
                  </PublicInsetCard>
                ))}
              </div>
            </PublicCard>

            {review.platformConfigs && Object.keys(review.platformConfigs).length > 0 && (
              <PublicCard className="p-5">
                <p className="text-label-14 text-[var(--ds-gray-1000)]">Platform-specific details</p>
                <div className="mt-4 space-y-3">
                  {Object.entries(review.platformConfigs).map(([key, value]) => (
                    <PublicInsetCard key={key} className="p-3">
                      <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                        {key}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-copy-13 text-[var(--ds-gray-900)]">
                        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
                      </p>
                    </PublicInsetCard>
                  ))}
                </div>
              </PublicCard>
            )}
          </div>
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

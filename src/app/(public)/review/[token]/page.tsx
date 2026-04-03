"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Globe2,
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
} from "@/components/public/public-atlassian";
import { Textarea } from "@/components/ui/textarea";
import type {
  PublicPostCollectionReviewResponse,
  PublicReviewDecisionRequest,
} from "@/model/ReviewLink";
import {
  addPublicReviewCommentApi,
  approvePublicReviewApi,
  getPublicPostCollectionReviewApi,
  rejectPublicReviewApi,
} from "@/service/reviewLinks";

function formatTimestamp(value: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleString("en-US", {
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

export default function PublicReviewPage() {
  const { token } = useParams<{ token: string }>();
  const [review, setReview] = useState<PublicPostCollectionReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [decisionNote, setDecisionNote] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [acting, setActing] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("publicReviewerName");
    const savedEmail = localStorage.getItem("publicReviewerEmail");
    if (savedName) setReviewerName(savedName);
    if (savedEmail) setReviewerEmail(savedEmail);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const next = await getPublicPostCollectionReviewApi(token);
        if (!ignore) {
          setReview(next);
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.message ?? "Failed to load review link.");
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
    const next = await getPublicPostCollectionReviewApi(token);
    setReview(next);
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
      });
      setCommentBody("");
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
          ? await approvePublicReviewApi(token, identity)
          : await rejectPublicReviewApi(token, identity);
      setReview(next);
      setDecisionNote("");
    } catch (err: any) {
      setError(err?.message ?? `Failed to ${action} content.`);
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--surface-sunken))_100%)]">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--foreground-muted))]" />
      </div>
    );
  }

  if (error && !review) {
    return (
      <PublicPageShell>
        <div className="mx-auto max-w-xl px-6 py-24">
          <PublicCard className="p-8">
            <div className="mb-4 flex justify-center">
              <AlertCircle className="h-12 w-12 text-[hsl(var(--destructive))]" />
            </div>
            <h1 className="text-center text-[1.5rem] font-bold text-[hsl(var(--foreground))]">
              Review link unavailable
            </h1>
            <p className="mt-3 text-center text-sm leading-6 text-[hsl(var(--foreground-muted))]">
              {error}
            </p>
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
            <PublicLozenge appearance="new">
              Expires {formatTimestamp(review.linkExpiresAt)}
            </PublicLozenge>
          </div>
        }
        aside={
          <PublicCard className="p-5">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
                  Scheduled time
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm text-[hsl(var(--foreground))]">
                  <CalendarClock className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
                  <span>{formatTimestamp(review.scheduledTime)}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <PublicCard className="p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Your name</span>
                <input
                  value={reviewerName}
                  onChange={(event) => setReviewerName(event.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none transition-colors focus:border-[hsl(var(--accent))]"
                  placeholder="Jane Client"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Email</span>
                <input
                  value={reviewerEmail}
                  onChange={(event) => setReviewerEmail(event.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none transition-colors focus:border-[hsl(var(--accent))]"
                  placeholder="jane@client.com"
                  type="email"
                />
              </label>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">Comment</p>
                <Textarea
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder="Share any feedback for the team..."
                  className="min-h-[140px] bg-[hsl(var(--surface-raised))]"
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
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">Decision note</p>
                <Textarea
                  value={decisionNote}
                  onChange={(event) => setDecisionNote(event.target.value)}
                  placeholder="Optional context for your decision..."
                  className="min-h-[140px] bg-[hsl(var(--surface-raised))]"
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
              </div>
            </div>
          </PublicCard>

          <PublicInsetCard className="p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Review access
                </p>
              </div>
              <p className="text-sm leading-6 text-[hsl(var(--foreground-muted))]">
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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {review.media.length > 0 && (
              <PublicCard className="p-5">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Media</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {review.media.map((media) => {
                    const isVideo = media.mimeType?.startsWith("video/");
                    return (
                      <div
                        key={media.id}
                        className="overflow-hidden rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]"
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
                        <div className="border-t border-[hsl(var(--border-subtle))] px-3 py-2">
                          <p className="truncate text-sm text-[hsl(var(--foreground-muted))]">
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
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Caption</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                {review.description || "No caption provided."}
              </p>
            </PublicCard>

            <PublicCard className="p-5">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Comments</p>
              {review.collaborationThreads.length === 0 ? (
                <p className="mt-4 text-sm text-[hsl(var(--foreground-muted))]">
                  No client-visible comments yet.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {review.collaborationThreads.map((thread) => (
                    <PublicInsetCard key={thread.id} className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">
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
                        <span className="text-xs text-[hsl(var(--foreground-muted))]">
                          {formatTimestamp(thread.createdAt)}
                        </span>
                      </div>
                      {thread.body && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                          {thread.body}
                        </p>
                      )}
                      {thread.replies.length > 0 && (
                        <div className="mt-4 space-y-3 border-t border-[hsl(var(--border-subtle))] pt-4">
                          {thread.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-3 py-3"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                                  {reply.authorDisplayName}
                                </p>
                                <PublicLozenge appearance="default">Workspace team</PublicLozenge>
                                <span className="text-xs text-[hsl(var(--foreground-muted))]">
                                  {formatTimestamp(reply.createdAt)}
                                </span>
                              </div>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--foreground-muted))]">
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
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Platform targets</p>
              <div className="mt-4 space-y-3">
                {review.channels.map((channel, index) => (
                  <PublicInsetCard key={`${channel.platform}-${index}`} className="p-3">
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {channel.platform ?? "Unknown platform"}
                    </p>
                    <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
                      {channel.username ?? "Connected profile"}
                    </p>
                  </PublicInsetCard>
                ))}
              </div>
            </PublicCard>

            {review.platformConfigs && Object.keys(review.platformConfigs).length > 0 && (
              <PublicCard className="p-5">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Platform-specific details</p>
                <div className="mt-4 space-y-3">
                  {Object.entries(review.platformConfigs).map(([key, value]) => (
                    <PublicInsetCard key={key} className="p-3">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
                        {key}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-[hsl(var(--foreground-muted))]">
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

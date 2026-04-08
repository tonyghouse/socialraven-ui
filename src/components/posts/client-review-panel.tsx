"use client";

import AtlassianButton from "@atlaskit/button/new";
import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
import { useAuth } from "@clerk/nextjs";
import {
  Copy,
  Globe2,
  Layers3,
  Link2,
  Loader2,
  LockKeyhole,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type {
  PostCollectionReviewLink,
  ReviewLinkShareScope,
} from "@/model/ReviewLink";
import {
  createPostCollectionReviewLinkApi,
  getPostCollectionReviewLinksApi,
  revokePostCollectionReviewLinkApi,
} from "@/service/reviewLinks";
import { useRole } from "@/hooks/useRole";

const LINK_EXPIRY_OPTIONS = [
  { label: "24 hours", hours: 24 },
  { label: "72 hours", hours: 72 },
  { label: "7 days", hours: 24 * 7 },
] as const;

function formatTimestamp(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isDraftWorkflowStatus(status: PostCollectionResponse["overallStatus"]) {
  return status === "DRAFT" || status === "IN_REVIEW" || status === "CHANGES_REQUESTED";
}

function getCollectionPostLabel(collection: PostCollectionResponse, postId: number) {
  const post = collection.posts.find((item) => item.id === postId);
  if (!post) {
    return `Post #${postId}`;
  }
  const username = post.connectedAccount?.username
    ? ` · ${post.connectedAccount.username}`
    : "";
  return `${post.provider}${username}`;
}

export function ClientReviewPanel({
  collection,
}: {
  collection: PostCollectionResponse;
}) {
  const { getToken } = useAuth();
  const { canShareReviewLinks } = useRole();
  const [links, setLinks] = useState<PostCollectionReviewLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [actingLinkId, setActingLinkId] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState<number>(LINK_EXPIRY_OPTIONS[2].hours);
  const [shareScope, setShareScope] = useState<ReviewLinkShareScope>("CAMPAIGN");
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [passcode, setPasscode] = useState("");

  useEffect(() => {
    if (!canShareReviewLinks) return;
    let ignore = false;

    async function loadLinks() {
      try {
        setLoading(true);
        setError(null);
        const next = await getPostCollectionReviewLinksApi(getToken, collection.id);
        if (!ignore) {
          setLinks(next);
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.message ?? "Failed to load review links.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadLinks();
    return () => {
      ignore = true;
    };
  }, [canShareReviewLinks, collection.id, getToken]);

  useEffect(() => {
    setShareScope("CAMPAIGN");
    setSelectedPostIds(collection.posts.length === 1 ? [collection.posts[0].id] : []);
    setPasscode("");
  }, [collection.id, collection.posts]);

  if (!canShareReviewLinks) {
    return null;
  }

  async function refreshLinks() {
    const next = await getPostCollectionReviewLinksApi(getToken, collection.id);
    setLinks(next);
  }

  function toggleSelectedPost(postId: number) {
    setSelectedPostIds((current) =>
      current.includes(postId)
        ? current.filter((item) => item !== postId)
        : [...current, postId]
    );
  }

  async function handleCreateLink() {
    const normalizedPasscode = passcode.trim();
    if (normalizedPasscode && (normalizedPasscode.length < 6 || normalizedPasscode.length > 64)) {
      toast.error("Passcodes must be between 6 and 64 characters.");
      return;
    }
    if (shareScope === "SELECTED_POSTS" && selectedPostIds.length === 0) {
      toast.error("Select at least one post variant to share.");
      return;
    }

    setCreating(true);
    try {
      const expiresAt = new Date(Date.now() + selectedHours * 60 * 60 * 1000).toISOString();
      const created = await createPostCollectionReviewLinkApi(getToken, collection.id, {
        expiresAt,
        passcode: normalizedPasscode || undefined,
        shareScope,
        sharedPostIds: shareScope === "SELECTED_POSTS" ? selectedPostIds : undefined,
      });
      setLinks((current) => [created, ...current]);
      await copyLink(created.token);
      toast.success(
        created.passcodeProtected
          ? "Review link created and copied. Send the passcode separately."
          : "Review link created and copied."
      );
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create review link.");
    } finally {
      setCreating(false);
    }
  }

  async function copyLink(token: string) {
    const url = `${window.location.origin}/review/${token}`;
    await navigator.clipboard.writeText(url);
  }

  async function handleCopy(link: PostCollectionReviewLink) {
    try {
      await copyLink(link.token);
      toast.success(
        link.passcodeProtected
          ? "Review link copied. Send the passcode separately."
          : "Review link copied."
      );
    } catch {
      toast.error("Failed to copy review link.");
    }
  }

  async function handleRevoke(linkId: string) {
    setActingLinkId(linkId);
    try {
      await revokePostCollectionReviewLinkApi(getToken, collection.id, linkId);
      await refreshLinks();
      toast.success("Review link revoked.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to revoke review link.");
    } finally {
      setActingLinkId(null);
    }
  }

  function describeLinkScope(link: PostCollectionReviewLink) {
    if (link.shareScope !== "SELECTED_POSTS") {
      return "Full campaign review";
    }
    if (link.sharedPostIds.length === 0) {
      return "Selected post review";
    }
    return link.sharedPostIds.map((postId) => getCollectionPostLabel(collection, postId)).join(", ");
  }

  const canCreateLink = isDraftWorkflowStatus(collection.overallStatus);

  return (
    <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgb(0 0 0 / 0.08)]">
      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
              <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">
                Client Review Links
              </p>
            </div>
            <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
              Share a review-only link with clients. Only client-visible comments are exposed
              outside the workspace.
            </p>
          </div>
          <Lozenge appearance="default">{links.length} links</Lozenge>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        {!canCreateLink && (
          <SectionMessage appearance="information" title="Review links are read-only here">
            <p className="text-sm">
              New review links can only be created while the content is still in the draft or
              approval workflow.
            </p>
          </SectionMessage>
        )}

        <div className="space-y-4 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
                  Share scope
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {([
                    {
                      value: "CAMPAIGN",
                      label: "Full campaign",
                    },
                    {
                      value: "SELECTED_POSTS",
                      label: "Selected posts",
                    },
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={creating || !canCreateLink}
                      onClick={() => setShareScope(option.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        shareScope === option.value
                          ? "border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))]"
                      } ${creating || !canCreateLink ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {shareScope === "SELECTED_POSTS" && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
                    Included post variants
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {collection.posts.map((post) => {
                      const selected = selectedPostIds.includes(post.id);
                      return (
                        <button
                          key={post.id}
                          type="button"
                          disabled={creating || !canCreateLink}
                          onClick={() => toggleSelectedPost(post.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            selected
                              ? "border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                              : "border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))]"
                          } ${creating || !canCreateLink ? "cursor-not-allowed opacity-60" : ""}`}
                        >
                          {getCollectionPostLabel(collection, post.id)}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-[hsl(var(--foreground-muted))]">
                    Selected-post links are feedback-only. Final approve/reject stays on the full
                    campaign review link.
                  </p>
                </div>
              )}

              <label className="block">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
                  Optional passcode
                </span>
                <input
                  value={passcode}
                  onChange={(event) => setPasscode(event.target.value)}
                  disabled={creating || !canCreateLink}
                  placeholder="Add a separate passcode"
                  type="password"
                  className="mt-2 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none transition-colors focus:border-[hsl(var(--accent))]"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
                  Link expiry
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LINK_EXPIRY_OPTIONS.map((option) => (
                    <button
                      key={option.hours}
                      type="button"
                      disabled={creating || !canCreateLink}
                      onClick={() => setSelectedHours(option.hours)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedHours === option.hours
                          ? "border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))]"
                      } ${creating || !canCreateLink ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <AtlassianButton
                appearance="primary"
                isDisabled={creating || !canCreateLink}
                onClick={handleCreateLink}
              >
                <span className="inline-flex items-center gap-2">
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating…</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4" />
                      <span>Create Review Link</span>
                    </>
                  )}
                </span>
              </AtlassianButton>
            </div>
          </div>

          {passcode.trim().length > 0 && (
            <SectionMessage appearance="information" title="Passcodes are never embedded in the URL">
              <p className="text-sm">
                Send the copied link and the passcode separately. This keeps review access tighter
                for client contacts in the US and EU.
              </p>
            </SectionMessage>
          )}
        </div>

        {error && (
          <SectionMessage appearance="error" title="Review links failed to load">
            <p className="text-sm">{error}</p>
          </SectionMessage>
        )}

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--foreground-muted))]" />
          </div>
        ) : links.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-8 text-center">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              No review links yet
            </p>
            <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
              Create a link when this draft is ready for client eyes.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => {
              const busy = actingLinkId === link.id;
              return (
                <div
                  key={link.id}
                  className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Lozenge appearance={link.active ? "success" : "moved"}>
                          {link.active ? "Active" : link.revokedAt ? "Revoked" : "Expired"}
                        </Lozenge>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--foreground-muted))]">
                          <Layers3 className="h-3.5 w-3.5" />
                          <span>
                            {link.shareScope === "SELECTED_POSTS"
                              ? "Selected posts"
                              : "Full campaign"}
                          </span>
                        </span>
                        {link.passcodeProtected && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--accent))]/25 bg-[hsl(var(--accent))]/10 px-2.5 py-1 text-xs font-medium text-[hsl(var(--accent))]">
                            <LockKeyhole className="h-3.5 w-3.5" />
                            <span>Passcode protected</span>
                          </span>
                        )}
                        <span className="text-xs text-[hsl(var(--foreground-muted))]">
                          Expires {formatTimestamp(link.expiresAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[hsl(var(--foreground-muted))]">
                        Created by {link.createdByDisplayName}
                        {link.createdAt ? ` · ${formatTimestamp(link.createdAt)}` : ""}
                      </p>
                      <p className="text-sm text-[hsl(var(--foreground-muted))]">
                        {describeLinkScope(link)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <AtlassianButton appearance="subtle" onClick={() => handleCopy(link)}>
                        <span className="inline-flex items-center gap-1.5">
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </span>
                      </AtlassianButton>
                      {!link.revokedAt && (
                        <AtlassianButton
                          appearance="subtle"
                          isDisabled={busy}
                          onClick={() => handleRevoke(link.id)}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {busy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            <span>Revoke</span>
                          </span>
                        </AtlassianButton>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

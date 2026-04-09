"use client";

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
import { cn } from "@/lib/utils";
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
import { usePlan } from "@/hooks/usePlan";
import { useRole } from "@/hooks/useRole";
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
  const username = post.connectedAccount?.username ? ` · ${post.connectedAccount.username}` : "";
  return `${post.provider}${username}`;
}

function SelectChip({
  selected,
  disabled,
  children,
  onClick,
}: {
  selected: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-copy-12 transition-colors",
        selected
          ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
          : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)]",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      {children}
    </button>
  );
}

export function ClientReviewPanel({
  collection,
}: {
  collection: PostCollectionResponse;
}) {
  const { getToken } = useAuth();
  const { isAgency } = usePlan();
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
    if (!isAgency || !canShareReviewLinks) return;
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
  }, [canShareReviewLinks, collection.id, getToken, isAgency]);

  useEffect(() => {
    setShareScope("CAMPAIGN");
    setSelectedPostIds(collection.posts.length === 1 ? [collection.posts[0].id] : []);
    setPasscode("");
  }, [collection.id, collection.posts]);

  if (!isAgency || !canShareReviewLinks) {
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
    <section className={draftDetailPanelClassName}>
      <div className={draftDetailPanelHeaderClassName}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-[var(--ds-gray-900)]" />
              <p className="text-title-16 text-[var(--ds-gray-1000)]">Client Review Links</p>
            </div>
            <p className={draftDetailBodyTextClassName}>
              Share a review-only link with clients. Only client-visible comments are exposed
              outside the workspace.
            </p>
          </div>
          <DraftDetailBadge>{links.length} links</DraftDetailBadge>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        {!canCreateLink ? (
          <DraftDetailNotice title="Review links are read-only here">
            <p>
              New review links can only be created while the content is still in the draft or
              approval workflow.
            </p>
          </DraftDetailNotice>
        ) : null}

        <div className={cn(draftDetailSubtlePanelClassName, "space-y-4 p-4")}>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-4">
              <div>
                <p className="text-copy-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
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
                    <SelectChip
                      key={option.value}
                      selected={shareScope === option.value}
                      disabled={creating || !canCreateLink}
                      onClick={() => setShareScope(option.value)}
                    >
                      {option.label}
                    </SelectChip>
                  ))}
                </div>
              </div>

              {shareScope === "SELECTED_POSTS" ? (
                <div>
                  <p className="text-copy-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
                    Included post variants
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {collection.posts.map((post) => (
                      <SelectChip
                        key={post.id}
                        selected={selectedPostIds.includes(post.id)}
                        disabled={creating || !canCreateLink}
                        onClick={() => toggleSelectedPost(post.id)}
                      >
                        {getCollectionPostLabel(collection, post.id)}
                      </SelectChip>
                    ))}
                  </div>
                  <p className={cn("mt-2", draftDetailMetaTextClassName)}>
                    Selected-post links are feedback-only. Final approve/reject stays on the full
                    campaign review link.
                  </p>
                </div>
              ) : null}

              <label className="block">
                <span className="text-copy-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
                  Optional passcode
                </span>
                <input
                  value={passcode}
                  onChange={(event) => setPasscode(event.target.value)}
                  disabled={creating || !canCreateLink}
                  placeholder="Add a separate passcode"
                  type="password"
                  className="mt-2 flex h-10 w-full rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-label-14 text-[var(--ds-gray-1000)] outline-none transition-colors focus:border-[var(--ds-blue-600)] focus:ring-2 focus:ring-[var(--ds-blue-600)] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-copy-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
                  Link expiry
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LINK_EXPIRY_OPTIONS.map((option) => (
                    <SelectChip
                      key={option.hours}
                      selected={selectedHours === option.hours}
                      disabled={creating || !canCreateLink}
                      onClick={() => setSelectedHours(option.hours)}
                    >
                      {option.label}
                    </SelectChip>
                  ))}
                </div>
              </div>

              <DraftDetailActionButton
                tone="primary"
                disabled={creating || !canCreateLink}
                onClick={handleCreateLink}
              >
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
              </DraftDetailActionButton>
            </div>
          </div>

          {passcode.trim().length > 0 ? (
            <DraftDetailNotice title="Passcodes are never embedded in the URL">
              <p>
                Send the copied link and the passcode separately. This keeps review access tighter
                for client contacts in the US and EU.
              </p>
            </DraftDetailNotice>
          ) : null}
        </div>

        {error ? (
          <DraftDetailNotice title="Review links failed to load" variant="error">
            <p>{error}</p>
          </DraftDetailNotice>
        ) : null}

        {loading ? (
          <div className={cn(draftDetailSubtlePanelClassName, "flex items-center justify-center px-4 py-8")}>
            <Loader2 className="h-5 w-5 animate-spin text-[var(--ds-gray-900)]" />
          </div>
        ) : links.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-8 text-center">
            <p className="text-label-14 text-[var(--ds-gray-1000)]">No review links yet</p>
            <p className={cn("mt-1", draftDetailBodyTextClassName)}>
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
                  className={cn(draftDetailSubtlePanelClassName, "p-4")}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <DraftDetailBadge variant={link.active ? "success" : "warning"}>
                          {link.active ? "Active" : link.revokedAt ? "Revoked" : "Expired"}
                        </DraftDetailBadge>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-2.5 py-1 text-copy-12 text-[var(--ds-gray-900)]">
                          <Layers3 className="h-3.5 w-3.5" />
                          <span>
                            {link.shareScope === "SELECTED_POSTS" ? "Selected posts" : "Full campaign"}
                          </span>
                        </span>
                        {link.passcodeProtected ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] px-2.5 py-1 text-copy-12 text-[var(--ds-blue-700)]">
                            <LockKeyhole className="h-3.5 w-3.5" />
                            <span>Passcode protected</span>
                          </span>
                        ) : null}
                        <span className={draftDetailMetaTextClassName}>
                          Expires {formatTimestamp(link.expiresAt)}
                        </span>
                      </div>
                      <p className={draftDetailBodyTextClassName}>
                        Created by {link.createdByDisplayName}
                        {link.createdAt ? ` · ${formatTimestamp(link.createdAt)}` : ""}
                      </p>
                      <p className={draftDetailBodyTextClassName}>{describeLinkScope(link)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <DraftDetailActionButton compact onClick={() => handleCopy(link)}>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </DraftDetailActionButton>
                      {!link.revokedAt ? (
                        <DraftDetailActionButton
                          compact
                          disabled={busy}
                          onClick={() => handleRevoke(link.id)}
                        >
                          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          <span>Revoke</span>
                        </DraftDetailActionButton>
                      ) : null}
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

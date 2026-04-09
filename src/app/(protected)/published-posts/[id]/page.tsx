"use client";

import { type ButtonHTMLAttributes, type ReactNode, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import {
  ArrowLeft,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  User,
  Heart,
  MessageCircle,
  ThumbsUp,
  Repeat2,
  Bookmark,
  Send,
  Share2,
  MoreHorizontal,
  Play,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { PostResponse } from "@/model/PostResponse";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { getImageUrl } from "@/service/getImageUrl";
import { PublishedPostDetailPageSkeleton } from "@/components/posts/published-post-detail-page-skeleton";

/* ─── Config maps ─────────────────────────────────────────── */

const statusConfig: Record<
  string,
  { label: string; Icon: typeof CheckCircle2; className: string }
> = {
  SCHEDULED: {
    label: "Scheduled",
    Icon: Clock,
    className: "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
  },
  PUBLISHED: {
    label: "Published",
    Icon: CheckCircle2,
    className: "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
  },
  PARTIAL_SUCCESS: {
    label: "Partially Completed",
    Icon: AlertTriangle,
    className: "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]",
  },
  FAILED: {
    label: "Failed",
    Icon: XCircle,
    className: "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
  },
};

const typeConfig: Record<
  string,
  { label: string; Icon: typeof ImageIcon; className: string }
> = {
  IMAGE: {
    label: "Image",
    Icon: ImageIcon,
    className: "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
  },
  VIDEO: {
    label: "Video",
    Icon: Video,
    className: "border-[var(--ds-teal-200)] bg-[var(--ds-teal-100)] text-[var(--ds-teal-700)]",
  },
  TEXT: {
    label: "Text",
    Icon: FileText,
    className: "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]",
  },
};

const platformDisplayName: Record<string, string> = {
  INSTAGRAM: "Instagram",
  LINKEDIN: "LinkedIn",
  YOUTUBE: "YouTube",
  FACEBOOK: "Facebook",
  X: "X (Twitter)",
  THREADS: "Threads",
  TIKTOK: "TikTok",
};

const platformIconStyle: Record<string, string> = {
  YOUTUBE:
    "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
  INSTAGRAM:
    "border-[var(--ds-pink-200)] bg-[var(--ds-pink-100)] text-[var(--ds-pink-700)]",
  FACEBOOK:
    "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
  LINKEDIN:
    "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
  X: "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  THREADS:
    "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  TIKTOK:
    "border-[var(--ds-teal-200)] bg-[var(--ds-teal-100)] text-[var(--ds-teal-700)]",
};

/* Platform-specific accent tokens for the circle cards */
const platformAccent: Record<
  string,
  {
    bar: string;
    cardBg: string;
    cardBorder: string;
    iconClass: string;
  }
> = {
  INSTAGRAM: {
    bar: "linear-gradient(90deg,var(--ds-amber-600) 0%,var(--ds-pink-700) 50%,var(--ds-purple-700) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-pink-200)] bg-[var(--ds-pink-100)] text-[var(--ds-pink-700)]",
  },
  X: {
    bar: "linear-gradient(90deg,var(--ds-gray-900) 0%,var(--ds-gray-1000) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  },
  LINKEDIN: {
    bar: "linear-gradient(90deg,var(--ds-blue-700) 0%,var(--ds-blue-600) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
  },
  YOUTUBE: {
    bar: "linear-gradient(90deg,var(--ds-red-700) 0%,var(--ds-red-600) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
  },
  FACEBOOK: {
    bar: "linear-gradient(90deg,var(--ds-blue-700) 0%,var(--ds-blue-500) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
  },
  TIKTOK: {
    bar: "linear-gradient(90deg,var(--ds-gray-1000) 0%,var(--ds-red-600) 55%,var(--ds-teal-600) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-teal-200)] bg-[var(--ds-teal-100)] text-[var(--ds-teal-700)]",
  },
  THREADS: {
    bar: "linear-gradient(90deg,var(--ds-gray-900) 0%,var(--ds-gray-1000) 100%)",
    cardBg: "bg-[var(--ds-background-100)]",
    cardBorder: "border-[var(--ds-gray-400)]",
    iconClass:
      "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  },
};

const platformAccentFallback = {
  bar: "linear-gradient(90deg,#6b7280,#9ca3af)",
  cardBg: "bg-[var(--ds-gray-100)]",
  cardBorder: "border-[var(--ds-gray-400)]",
  iconClass: "bg-[var(--ds-gray-100)] border-[var(--ds-gray-400)] text-[var(--ds-gray-900)]",
};

const pageClassName =
  "min-h-screen bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)]";
const surfaceClassName =
  "overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm";
const surfaceHeaderClassName =
  "flex items-center gap-2.5 border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-3.5";
const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";

function ActionButton({
  tone = "secondary",
  compact = false,
  fullWidth = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary";
  compact?: boolean;
  fullWidth?: boolean;
}) {
  const toneClassName =
    tone === "primary"
      ? "border-transparent bg-[var(--ds-blue-600)] text-white hover:bg-[var(--ds-blue-700)]"
      : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border transition-colors disabled:pointer-events-none disabled:opacity-50",
        toneClassName,
        compact ? "h-8 px-3 text-copy-12" : "h-9 px-3.5 text-label-14",
        focusRingClassName,
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function ToneBadge({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label-12", className)}>
      {children}
    </span>
  );
}

/* ─── Page ────────────────────────────────────────────────── */

export default function PublishedCollectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getToken } = useAuth();
  const collectionId = params.id as string;

  const [collection, setCollection] =
    useState<PostCollectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPostCollectionByIdApi(getToken, collectionId);
        setCollection(data);
      } catch {
        setError("Unable to load this collection.");
      } finally {
        setLoading(false);
      }
    })();
  }, [collectionId, getToken]);

  if (loading) {
    return <PublishedPostDetailPageSkeleton />;
  }

  if (error || !collection) {
    return (
      <main className={cn(pageClassName, "flex items-center justify-center p-6")}>
        <div className="w-full max-w-sm rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--ds-red-200)] bg-[var(--ds-red-100)]">
            <AlertCircle className="h-7 w-7 text-[var(--ds-red-700)]" />
          </div>
          <h3 className="mb-1 text-title-18 text-[var(--ds-gray-1000)]">
            Collection not found
          </h3>
          <p className="mb-6 text-label-14 leading-6 text-[var(--ds-gray-900)]">
            This collection couldn&apos;t be loaded. It may have been deleted.
          </p>
          <ActionButton
            tone="primary"
            onClick={() => router.push("/published-posts")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Published Posts
          </ActionButton>
        </div>
      </main>
    );
  }

  /* ── Derived values ── */
  const scheduledDate = new Date(collection.scheduledTime ?? "");
  const status = statusConfig[collection.overallStatus] ?? statusConfig.PUBLISHED;
  const type = typeConfig[collection.postCollectionType] ?? typeConfig.TEXT;
  const StatusIcon = status.Icon;
  const TypeIcon = type.Icon;
  const recoveryBadge = collection.failureState === "RECOVERED"
    ? {
        label: "Recovered",
        className:
          "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
      }
    : null;
  const canOpenChannelRecovery = collection.overallStatus === "PARTIAL_SUCCESS"
    && (collection.failedChannelCount ?? 0) > 0
    && collection.failureState === "RECOVERY_REQUIRED"
    && !collection.recoveryCollectionId;

  // Group posts by platform
  const groupedPosts = collection.posts.reduce<Record<string, PostResponse[]>>(
    (acc, post) => {
      const key = post.provider;
      if (!acc[key]) acc[key] = [];
      acc[key].push(post);
      return acc;
    },
    {}
  );

  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const platformCount = Object.keys(groupedPosts).length;

  const captionText =
    collection.posts[0]?.description?.trim() ||
    collection.description?.trim() ||
    "";

  const allMedia = collection.media.map((m) => ({
    url: m.fileUrl,
    mimeType: m.mimeType,
  }));

  return (
    <main className={pageClassName}>
      <ProtectedPageHeader
        title={collection.description}
        description="Published post details."
        icon={<CheckCircle2 className="h-4 w-4" />}
        className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95"
        actions={
          <div className="hidden sm:block">
            <ActionButton tone="primary" onClick={() => router.push("/schedule-post")}>
              <Plus className="h-3.5 w-3.5" />
              New Post
            </ActionButton>
          </div>
        }
      />

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-3 sm:px-6">
        <nav className="flex min-w-0 items-center gap-1.5 text-label-14">
          <button
            onClick={() => router.push("/published-posts")}
            className={cn(
              "flex shrink-0 items-center gap-1.5 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]",
              focusRingClassName
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden font-medium sm:inline">
              Published Posts
            </span>
          </button>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--ds-gray-700)]" />
          <span className="truncate text-label-14 text-[var(--ds-gray-1000)]">
            {collection.description}
          </span>
        </nav>
      </div>

      <div className="space-y-4 px-4 py-5 pb-24 sm:px-5 sm:pb-8">
        <div className={surfaceClassName}>
          <div className="h-[3px] w-full bg-[var(--ds-green-600)]" />
          <div className="px-5 pt-5 pb-4">
            <div className="mb-4 flex flex-wrap items-start gap-x-4 gap-y-3">
              <h1 className="min-w-0 flex-1 text-title-20 text-[var(--ds-gray-1000)]">
                {collection.description}
              </h1>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <ToneBadge className={type.className}>
                  <TypeIcon className="h-3.5 w-3.5" />
                  {type.label}
                </ToneBadge>
                <ToneBadge className={status.className}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </ToneBadge>
                {recoveryBadge && (
                  <ToneBadge className={recoveryBadge.className}>
                    {recoveryBadge.label}
                  </ToneBadge>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-2 text-copy-12 text-[var(--ds-gray-900)]">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate} · {formattedTime}</span>
              </div>
              {canOpenChannelRecovery && (
                <ActionButton
                  tone="primary"
                  compact
                  onClick={() => router.push(`/recovery-drafts/${collection.id}`)}
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Recover Failed Channels
                </ActionButton>
              )}
              <div className="flex items-center gap-1.5">
                {Object.keys(groupedPosts).map((plat) => {
                  const platUpper = plat.toUpperCase();
                  const PlatIcon = PLATFORM_ICONS[plat] ?? PLATFORM_ICONS[plat.toLowerCase()];
                  return (
                    <div
                      key={plat}
                      title={platformDisplayName[platUpper] ?? plat}
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                        platformIconStyle[platUpper]
                        ?? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                      )}
                    >
                      {PlatIcon ? <PlatIcon className="h-3.5 w-3.5" /> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main layout: sidebar + platform sections */}
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] items-start">
          <div className="space-y-4">
            {canOpenChannelRecovery && (
              <div className="overflow-hidden rounded-2xl border border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] shadow-sm">
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ds-amber-700)]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-label-14 text-[var(--ds-amber-800)]">
                      Failed channels still need attention
                    </p>
                    <p className="mt-1 text-copy-14 leading-6 text-[var(--ds-amber-800)]">
                      {collection.failedChannelCount} channel{collection.failedChannelCount === 1 ? "" : "s"} did not publish successfully. Create a recovery draft to correct and reschedule only those failed channels.
                    </p>
                    <div className="mt-3">
                      <ActionButton
                        tone="primary"
                        compact
                        onClick={() => router.push(`/recovery-drafts/${collection.id}`)}
                      >
                        <RefreshCcw className="h-3.5 w-3.5" />
                        Open Channel Recovery
                      </ActionButton>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className={surfaceClassName}>
              <div className={surfaceHeaderClassName}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-green-200)] bg-[var(--ds-green-100)]">
                  <Calendar className="h-4 w-4 text-[var(--ds-green-700)]" />
                </div>
                <p className="flex-1 text-label-14 text-[var(--ds-gray-1000)]">Published</p>
              </div>
              <div className="space-y-2.5 p-5">
                <div className="flex items-center gap-2.5 text-label-14">
                  <Calendar className="h-4 w-4 shrink-0 text-[var(--ds-gray-900)]" />
                  <span className="text-[var(--ds-gray-1000)]">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2.5 text-label-14">
                  <Clock className="h-4 w-4 shrink-0 text-[var(--ds-gray-900)]" />
                  <span className="text-[var(--ds-gray-1000)]">{formattedTime}</span>
                </div>
              </div>
            </div>

            {/* Caption card */}
            <div className={surfaceClassName}>
              <div className={surfaceHeaderClassName}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                  <FileText className="h-4 w-4 text-[var(--ds-gray-900)]" />
                </div>
                <p className="flex-1 text-label-14 text-[var(--ds-gray-1000)]">Caption</p>
              </div>
              <div className="p-5">
                {captionText ? (
                  <p className="line-clamp-10 whitespace-pre-wrap text-label-14 leading-6 text-[var(--ds-gray-1000)]">
                    {captionText}
                  </p>
                ) : (
                  <p className="text-copy-12 italic text-[var(--ds-gray-900)]">No caption specified</p>
                )}
                {captionText && (
                  <p className="mt-3 text-copy-12 tabular-nums text-[var(--ds-gray-900)]">
                    {captionText.length} characters
                  </p>
                )}
              </div>
            </div>

            {/* Media carousel */}
            {collection.media.length > 0 && (
              <div className={surfaceClassName}>
                <div className={surfaceHeaderClassName}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                    <ImageIcon className="h-4 w-4 text-[var(--ds-gray-900)]" />
                  </div>
                  <p className="flex-1 text-label-14 text-[var(--ds-gray-1000)]">
                    Media <span className="font-normal text-[var(--ds-gray-900)]">· {collection.media.length}</span>
                  </p>
                </div>
                <div className="p-4">
                  <MediaCarousel media={collection.media} />
                </div>
              </div>
            )}

            {/* Stats card with platform breakdown */}
            <div className={surfaceClassName}>
              <div className="flex items-center divide-x divide-[var(--ds-gray-400)] px-5 py-4">
                <div className="flex-1 pr-4 text-center">
                  <p className="text-[24px] font-semibold leading-none tabular-nums text-[var(--ds-gray-1000)]">
                    {collection.posts.length}
                  </p>
                  <p className="mt-1.5 text-copy-12 text-[var(--ds-gray-900)]">Posts</p>
                </div>
                <div className="flex-1 pl-4 text-center">
                  <p className="text-[24px] font-semibold leading-none tabular-nums text-[var(--ds-gray-1000)]">
                    {platformCount}
                  </p>
                  <p className="mt-1.5 text-copy-12 text-[var(--ds-gray-900)]">Platforms</p>
                </div>
              </div>
              <div className="space-y-3 border-t border-[var(--ds-gray-400)] px-5 pt-4 pb-4">
                {Object.entries(groupedPosts).map(([plat, platPosts]) => {
                  const platUpper = plat.toUpperCase();
                  const PlatIcon = PLATFORM_ICONS[plat] ?? PLATFORM_ICONS[plat.toLowerCase()];
                  return (
                    <div key={plat} className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border",
                          platformIconStyle[platUpper]
                          ?? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                        )}
                      >
                        {PlatIcon ? <PlatIcon className="h-3.5 w-3.5" /> : null}
                      </div>
                      <span className="flex-1 truncate text-label-14 text-[var(--ds-gray-1000)]">
                        {platformDisplayName[platUpper] ?? plat}
                      </span>
                      <span className="text-copy-12 tabular-nums text-[var(--ds-gray-900)]">
                        {platPosts.length} acct{platPosts.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Platform sections */}
          <div className="min-w-0 space-y-4">
            {collection.posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] py-12 text-center shadow-sm">
                <CheckCircle2 className="mb-2 h-8 w-8 text-[var(--ds-gray-700)]" />
                <p className="text-label-14 text-[var(--ds-gray-900)]">No posts in this collection</p>
              </div>
            ) : (
              Object.entries(groupedPosts).map(([platform, posts]) => (
                <PlatformSection
                  key={platform}
                  platform={platform}
                  posts={posts}
                  caption={captionText}
                  media={allMedia}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* --- Platform Post Previews -------------------------------------------- */

/* Shared small account avatar */
function AccountAvatar({ src, name, size = 8 }: { src: string | null; name: string; size?: 6 | 7 | 8 }) {
  const sizeClassName =
    size === 6 ? "h-6 w-6" : size === 7 ? "h-7 w-7" : "h-8 w-8";
  const iconSizeClassName = size === 6 ? "h-2.5 w-2.5" : "h-3 w-3";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] shrink-0",
        sizeClassName
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--ds-gray-100)]">
          <User className={cn(iconSizeClassName, "text-[var(--ds-gray-900)]")} />
        </div>
      )}
    </div>
  );
}

/* Carousel media component for use inside platform previews */
function PreviewMediaCarousel({
  media,
  aspectRatio = "video",
  noMargin = false,
}: {
  media: { url: string; mimeType: string }[];
  aspectRatio?: "square" | "video" | "portrait";
  noMargin?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  if (!media.length) return null;
  const current = media[idx];
  const isVideo = current.mimeType.startsWith("video/");
  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square max-h-48"
      : aspectRatio === "portrait"
      ? "aspect-[9/16] max-h-56"
      : "aspect-video max-h-36";
  return (
    <div className={cn("relative w-full", !noMargin && "mt-2")}>
      <div className={cn("relative w-full overflow-hidden rounded-lg bg-neutral-950", aspectClass)}>
        {isVideo ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={current.url} className="w-full h-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt="Post media" className="w-full h-full object-contain" />
        )}
        {media.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + media.length) % media.length)}
              aria-label="Previous media"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/55 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/75 transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % media.length)}
              aria-label="Next media"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/55 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/75 transition-all"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-2 right-2 bg-black/65 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full backdrop-blur-sm tabular-nums">
              {idx + 1}/{media.length}
            </div>
          </>
        )}
      </div>
      {media.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to media ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-200",
                i === idx
                  ? "w-3.5 h-1 bg-neutral-700 dark:bg-neutral-300"
                  : "w-1 h-1 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── X (Twitter) preview ── */
function XPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  const handle = "@" + (accountName.replace(/\s+/g, "").toLowerCase() || "account");
  return (
    <div className="bg-white dark:bg-black rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 font-sans">
      <div className="flex gap-2.5">
        <AccountAvatar src={avatarSrc} name={accountName} size={8} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[120px]">{accountName || "Your Account"}</span>
            <span className="text-xs text-neutral-500 truncate">{handle}</span>
            <span className="text-neutral-400 text-xs">· now</span>
          </div>
          {caption && (
            <p className="text-xs text-neutral-900 dark:text-neutral-100 mt-1 leading-relaxed whitespace-pre-wrap line-clamp-3">{caption}</p>
          )}
          {media.length > 0 && <PreviewMediaCarousel media={media} aspectRatio="video" />}
          <div className="flex gap-4 mt-2 text-neutral-400">
            <button className="flex items-center gap-1 text-[11px] hover:text-blue-400 transition-colors">
              <MessageCircle className="h-3 w-3" /><span>Reply</span>
            </button>
            <button className="flex items-center gap-1 text-[11px] hover:text-green-400 transition-colors">
              <Repeat2 className="h-3 w-3" /><span>Repost</span>
            </button>
            <button className="flex items-center gap-1 text-[11px] hover:text-pink-400 transition-colors">
              <Heart className="h-3 w-3" /><span>Like</span>
            </button>
            <button className="flex items-center gap-1 text-[11px] hover:text-blue-400 transition-colors ml-auto">
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Instagram preview ── */
function InstagramPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 px-2.5 py-2">
        <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 flex-shrink-0">
          <AccountAvatar src={avatarSrc} name={accountName} size={7} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-neutral-900 dark:text-white truncate">{accountName || "your_account"}</p>
        </div>
        <MoreHorizontal className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
      </div>
      {/* Media — Instagram uses square format, bleeds edge-to-edge */}
      {media.length > 0 ? (
        <PreviewMediaCarousel media={media} aspectRatio="square" noMargin />
      ) : (
        <div className="w-full aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
        </div>
      )}
      {/* Actions + caption */}
      <div className="px-2.5 pt-2 pb-2.5">
        <div className="flex items-center gap-2.5 mb-1.5 text-neutral-800 dark:text-neutral-200">
          <button aria-label="Like" className="hover:text-red-500 transition-colors">
            <Heart className="h-4 w-4" />
          </button>
          <button aria-label="Comment" className="hover:text-neutral-500 transition-colors">
            <MessageCircle className="h-4 w-4" />
          </button>
          <button aria-label="Share" className="hover:text-neutral-500 transition-colors">
            <Send className="h-4 w-4" />
          </button>
          <button aria-label="Save" className="ml-auto hover:text-neutral-500 transition-colors">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
        {caption && (
          <p className="text-[11px] text-neutral-900 dark:text-neutral-100 leading-relaxed line-clamp-2">
            <span className="font-semibold">{accountName || "your_account"}</span>{" "}{caption}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── LinkedIn preview ── */
function LinkedInPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 font-sans overflow-hidden">
      <div className="p-3">
        <div className="flex gap-2 mb-2">
          <AccountAvatar src={avatarSrc} name={accountName} size={8} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{accountName || "Your Name"}</p>
            <p className="text-[10px] text-neutral-500 truncate">Your Title · 1st</p>
            <p className="text-[10px] text-neutral-400">Just now · 🌐</p>
          </div>
          <span className="text-blue-600 font-semibold text-[10px] self-start flex-shrink-0 cursor-default">+ Follow</span>
        </div>
        {caption && (
          <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed line-clamp-3 whitespace-pre-wrap">{caption}</p>
        )}
        {media.length > 0 && <PreviewMediaCarousel media={media} aspectRatio="video" />}
      </div>
      <div className="px-2 py-1.5 border-t border-neutral-100 dark:border-neutral-700 flex">
        {[
          { icon: ThumbsUp, label: "Like" },
          { icon: MessageCircle, label: "Comment" },
          { icon: Repeat2, label: "Repost" },
          { icon: Send, label: "Send" },
        ].map(({ icon: Icon, label }) => (
          <button key={label} className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <Icon className="h-3 w-3" /><span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Facebook preview ── */
function FacebookPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 font-sans overflow-hidden">
      <div className="p-3">
        <div className="flex gap-2 mb-2">
          <AccountAvatar src={avatarSrc} name={accountName} size={8} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{accountName || "Your Page"}</p>
            <p className="text-[10px] text-neutral-500">Just now · 🌐</p>
          </div>
          <MoreHorizontal className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
        </div>
        {caption && (
          <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed line-clamp-3 whitespace-pre-wrap">{caption}</p>
        )}
        {media.length > 0 && <PreviewMediaCarousel media={media} aspectRatio="video" />}
      </div>
      <div className="px-2 py-1.5 border-t border-neutral-100 dark:border-neutral-700 flex">
        {[
          { icon: ThumbsUp, label: "Like" },
          { icon: MessageCircle, label: "Comment" },
          { icon: Share2, label: "Share" },
        ].map(({ icon: Icon, label }) => (
          <button key={label} className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <Icon className="h-3 w-3" /><span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── YouTube preview ── */
function YouTubePreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  const title = caption?.split("\n")[0]?.slice(0, 100) || "Your Video Title";
  const first = media[0] ?? null;
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden font-sans border border-neutral-200 dark:border-neutral-700">
      {/* Thumbnail — 16:9, object-contain, capped height */}
      <div className="relative w-full aspect-video max-h-36 bg-neutral-950 overflow-hidden">
        {first ? (
          first.mimeType.startsWith("video/") ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={first.url} className="w-full h-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={first.url} alt="" className="w-full h-full object-contain" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="h-7 w-7 text-white/20" />
          </div>
        )}
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] font-semibold px-1 py-0.5 rounded tabular-nums">0:00</div>
      </div>
      <div className="p-2.5 flex gap-2">
        <AccountAvatar src={avatarSrc} name={accountName} size={7} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-900 dark:text-white line-clamp-2 leading-snug">{title}</p>
          <p className="text-[10px] text-neutral-500 mt-0.5 truncate">{accountName || "Your Channel"}</p>
          <p className="text-[10px] text-neutral-400">0 views · Just now</p>
        </div>
      </div>
    </div>
  );
}

/* ── TikTok preview ── */
function TikTokPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  const first = media[0] ?? null;
  return (
    <div className="bg-black rounded-xl overflow-hidden font-sans relative border border-neutral-800">
      <div className="relative w-full aspect-[9/16] max-h-56 overflow-hidden">
        {first ? (
          first.mimeType.startsWith("video/") ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={first.url} className="w-full h-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={first.url} alt="" className="w-full h-full object-contain" />
          )
        ) : (
          <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
            <Play className="h-8 w-8 text-white/20" />
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-3 right-12">
          <p className="text-white text-xs font-semibold mb-1">@{accountName?.replace(/\s+/g, "").toLowerCase() || "account"}</p>
          {caption && <p className="text-white/90 text-xs leading-snug line-clamp-2">{caption}</p>}
        </div>
        {/* Right actions */}
        <div className="absolute right-2 bottom-3 flex flex-col items-center gap-3 text-white">
          <div className="flex flex-col items-center">
            <AccountAvatar src={avatarSrc} name={accountName} size={8} />
            <div className="-mt-1.5 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white font-bold">+</div>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Heart className="h-5 w-5" />
            <span className="text-[10px]">0</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <MessageCircle className="h-5 w-5" />
            <span className="text-[10px]">0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Threads preview ── */
function ThreadsPreview({ caption, media, accountName, avatarSrc }: {
  caption: string; media: { url: string; mimeType: string }[];
  accountName: string; avatarSrc: string | null;
}) {
  return (
    <div className="bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 font-sans">
      <div className="flex gap-2.5">
        <div className="flex flex-col items-center">
          <AccountAvatar src={avatarSrc} name={accountName} size={8} />
          <div className="w-0.5 flex-1 bg-neutral-200 dark:bg-neutral-700 mt-1.5 min-h-3" />
        </div>
        <div className="flex-1 min-w-0 pb-1.5">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate max-w-[130px]">{accountName || "your_account"}</span>
            <span className="text-[10px] text-neutral-400 flex-shrink-0">· now</span>
          </div>
          {caption && <p className="text-xs text-neutral-800 dark:text-neutral-200 mt-1 leading-relaxed whitespace-pre-wrap line-clamp-3">{caption}</p>}
          {media.length > 0 && <PreviewMediaCarousel media={media} aspectRatio="video" />}
          <div className="flex gap-3 mt-2 text-neutral-400">
            <button aria-label="Like" className="hover:text-red-400 transition-colors"><Heart className="h-3.5 w-3.5" /></button>
            <button aria-label="Comment" className="hover:text-neutral-600 transition-colors"><MessageCircle className="h-3.5 w-3.5" /></button>
            <button aria-label="Repost" className="hover:text-green-500 transition-colors"><Repeat2 className="h-3.5 w-3.5" /></button>
            <button aria-label="Share" className="hover:text-neutral-600 transition-colors"><Send className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Media Carousel ──────────────────────────────────────── */

function MediaCarousel({
  media,
}: {
  media: PostCollectionResponse["media"];
}) {
  const [idx, setIdx] = useState(0);
  if (media.length === 0) return null;

  const current = media[idx];
  const isVideo = current.mimeType?.startsWith("video/");

  return (
    <div>
      <div className="relative aspect-video w-full max-h-40 overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-neutral-950">
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
                i === idx
                  ? "h-1.5 w-4 bg-[var(--ds-gray-1000)]"
                  : "h-1.5 w-1.5 bg-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-700)]"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main PlatformSection ── */
function PlatformSection({
  platform,
  posts,
  caption,
  media,
}: {
  platform: string;
  posts: PostResponse[];
  caption: string;
  media: { url: string; mimeType: string }[];
}) {
  const p = platform.toUpperCase();
  const Icon = PLATFORM_ICONS[platform] ?? PLATFORM_ICONS[platform.toLowerCase()];
  const accent = platformAccent[p] ?? platformAccent[platform] ?? platformAccentFallback;

  // Use first post's account for the preview
  const previewAccount = posts[0]?.connectedAccount;
  const previewName = previewAccount?.username ?? "";
  const previewAvatar = previewAccount?.profilePicLink
    ? getImageUrl(previewAccount.profilePicLink)
    : null;

  const previewProps = { caption, media, accountName: previewName, avatarSrc: previewAvatar };

  return (
    <div className={cn("rounded-2xl border shadow-sm overflow-hidden", accent.cardBg, accent.cardBorder)}>
      <div className="h-[3px] w-full" style={{ background: accent.bar }} />

      {/* Platform header row */}
      <div className="flex items-center gap-3 border-b border-[var(--ds-gray-400)] px-5 py-4">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", accent.iconClass)}>
          {Icon ? <Icon className="h-4 w-4" /> : null}
        </div>
        <p className="flex-1 text-label-14 text-[var(--ds-gray-1000)]">
          {platformDisplayName[p] ?? platformDisplayName[platform] ?? platform}
        </p>
        <span className="text-copy-12 text-[var(--ds-gray-900)]">
          {posts.length} account{posts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Platform-specific post preview */}
      <div className="border-b border-[var(--ds-gray-400)] px-4 py-3">
        <div className="mx-auto max-w-xs sm:max-w-sm">
          {p === "X" && <XPreview {...previewProps} />}
          {p === "INSTAGRAM" && <InstagramPreview {...previewProps} />}
          {p === "LINKEDIN" && <LinkedInPreview {...previewProps} />}
          {p === "FACEBOOK" && <FacebookPreview {...previewProps} />}
          {p === "YOUTUBE" && <YouTubePreview {...previewProps} />}
          {p === "TIKTOK" && <TikTokPreview {...previewProps} />}
          {p === "THREADS" && <ThreadsPreview {...previewProps} />}
          {!["X","INSTAGRAM","LINKEDIN","FACEBOOK","YOUTUBE","TIKTOK","THREADS"].includes(p) && (
            <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-3">
              {caption && (
                <p className="line-clamp-4 whitespace-pre-wrap text-copy-12 leading-5 text-[var(--ds-gray-1000)]">
                  {caption}
                </p>
              )}
              {media.length > 0 && <PreviewMediaCarousel media={media} aspectRatio="video" />}
            </div>
          )}
        </div>
      </div>

      {/* Account list */}
      <div className="p-4 flex flex-wrap gap-2">
        {posts.map((post) => {
          const src = getImageUrl(post.connectedAccount?.profilePicLink);
          return (
            <div
              key={post.id}
              className="flex items-center gap-2 rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] py-1.5 pl-1.5 pr-3 shadow-sm"
            >
              <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                {src ? (
                  <Image src={src} alt={post.connectedAccount?.username ?? ""} fill sizes="20px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-2.5 w-2.5 text-[var(--ds-gray-900)]" />
                  </div>
                )}
              </div>
              <span className="max-w-[140px] truncate text-copy-12 text-[var(--ds-gray-1000)]">
                {post.connectedAccount?.username ?? "Account"}
              </span>
              <div className={cn(
                "h-2 w-2 rounded-full flex-shrink-0",
                post.postStatus === "PUBLISHED" ? "bg-emerald-500"
                  : post.postStatus === "FAILED" ? "bg-red-500"
                  : "bg-blue-400"
              )} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

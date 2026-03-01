"use client";

import { useEffect, useState } from "react";
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
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  User,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { PostResponse } from "@/model/PostResponse";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/service/getImageUrl";
import { MediaPreview } from "@/components/generic/media-preview";
import { mapMediaResponseToMedia } from "@/lib/media-mapper";

/* ─── Config maps ─────────────────────────────────────────── */

const statusConfig: Record<
  string,
  { label: string; Icon: typeof CheckCircle2; className: string }
> = {
  SCHEDULED: {
    label: "Scheduled",
    Icon: Clock,
    className:
      "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  },
  PUBLISHED: {
    label: "Published",
    Icon: CheckCircle2,
    className:
      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  },
  PARTIAL_SUCCESS: {
    label: "Partial Success",
    Icon: AlertTriangle,
    className:
      "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
  },
  FAILED: {
    label: "Failed",
    Icon: XCircle,
    className:
      "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20",
  },
};

const typeConfig: Record<
  string,
  { label: string; Icon: typeof ImageIcon; className: string }
> = {
  IMAGE: {
    label: "Image",
    Icon: ImageIcon,
    className:
      "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/20",
  },
  VIDEO: {
    label: "Video",
    Icon: Video,
    className:
      "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
  },
  TEXT: {
    label: "Text",
    Icon: FileText,
    className:
      "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-500/10 dark:border-slate-500/20",
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
    "text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
  INSTAGRAM:
    "text-pink-600 bg-pink-50 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800/30",
  FACEBOOK:
    "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
  LINKEDIN:
    "text-sky-600 bg-sky-50 border-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/30",
  X: "text-neutral-800 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-300 dark:border-neutral-700/30",
  THREADS:
    "text-neutral-700 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-300 dark:border-neutral-700/30",
  TIKTOK:
    "text-neutral-900 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/30 dark:text-neutral-200 dark:border-neutral-700/30",
};

const postStatusBadge: Record<string, string> = {
  PUBLISHED:
    "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  SCHEDULED:
    "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  FAILED:
    "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20",
};

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
    return <SkeletonDetailPage />;
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-sm w-full rounded-2xl bg-card border border-border/60 p-8 shadow-sm text-center">
          <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            Collection not found
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            This collection couldn&apos;t be loaded. It may have been deleted.
          </p>
          <button
            onClick={() => router.push("/published-posts")}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Published Posts
          </button>
        </div>
      </div>
    );
  }

  /* ── Derived values ── */
  const scheduledDate = new Date(collection.scheduledTime);
  const status = statusConfig[collection.overallStatus] ?? statusConfig.PUBLISHED;
  const type = typeConfig[collection.postCollectionType] ?? typeConfig.TEXT;
  const StatusIcon = status.Icon;
  const TypeIcon = type.Icon;

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

  const publishedCount = collection.posts.filter((p) =>
    ["PUBLISHED", "POSTED"].includes(p.postStatus)
  ).length;
  const scheduledCount = collection.posts.filter(
    (p) => p.postStatus === "SCHEDULED"
  ).length;
  const failedCount = collection.posts.filter(
    (p) => p.postStatus === "FAILED"
  ).length;

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

  const accentGradient =
    collection.overallStatus === "PUBLISHED"
      ? "from-emerald-400 to-emerald-500"
      : collection.overallStatus === "FAILED"
      ? "from-red-400 to-red-500"
      : collection.overallStatus === "PARTIAL_SUCCESS"
      ? "from-amber-400 to-amber-500"
      : "from-blue-400 to-blue-500";

  const platformCount = Object.keys(groupedPosts).length;

  // Caption: use first post's description as the published content
  const captionText =
    collection.posts[0]?.description?.trim() ||
    collection.description?.trim() ||
    "";

  return (
    <main className="min-h-screen bg-background">
      {/* Sticky Breadcrumb Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            <button
              onClick={() => router.push("/published-posts")}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">
                Published Posts
              </span>
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
            <span className="font-medium text-foreground truncate">
              {collection.title}
            </span>
          </nav>

          <button
            onClick={() => router.push("/schedule-post")}
            className="hidden sm:flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-xs font-semibold shadow-sm flex-shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            New Post
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Collection Hero ── */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
          {/* Status accent bar */}
          <div
            className={cn("h-1 w-full bg-gradient-to-r", accentGradient)}
          />

          <div className="p-6 sm:p-8">
            {/* Badges */}
            <div className="flex items-center gap-2.5 mb-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border",
                  type.className
                )}
              >
                <TypeIcon className="h-3 w-3" />
                {type.label}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                  status.className
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
            </div>

            {/* Title + Description */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight mb-2">
                {collection.title}
              </h1>
              {collection.description && (
                <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                  {collection.description}
                </p>
              )}
            </div>

            {/* Date chip */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/40 w-fit mb-6">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                  Published
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formattedDate} · {formattedTime}
                </p>
              </div>
            </div>

            {/* Stats tiles */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 dark:bg-emerald-500/5 dark:border-emerald-500/20 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums leading-none mb-1">
                  {publishedCount}
                </div>
                <div className="text-[11px] font-semibold text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-wide">
                  Published
                </div>
              </div>
              <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 dark:bg-blue-500/5 dark:border-blue-500/20 p-4 text-center">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 tabular-nums leading-none mb-1">
                  {scheduledCount}
                </div>
                <div className="text-[11px] font-semibold text-blue-600/70 dark:text-blue-500/70 uppercase tracking-wide">
                  Scheduled
                </div>
              </div>
              <div className="rounded-xl border border-red-200/70 bg-red-50/60 dark:bg-red-500/5 dark:border-red-500/20 p-4 text-center">
                <div className="text-2xl font-bold text-red-700 dark:text-red-400 tabular-nums leading-none mb-1">
                  {failedCount}
                </div>
                <div className="text-[11px] font-semibold text-red-600/70 dark:text-red-500/70 uppercase tracking-wide">
                  Failed
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-5" />

            {/* Platform icons row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground">
                Platforms:
              </span>
              {Object.keys(groupedPosts).map((platform) => {
                const Icon = PLATFORM_ICONS[platform];
                return Icon ? (
                  <span
                    key={platform}
                    className={cn(
                      "h-8 w-8 rounded-xl border flex items-center justify-center shadow-sm",
                      platformIconStyle[platform] ??
                        "text-muted-foreground bg-muted/50 border-border/60"
                    )}
                    title={platformDisplayName[platform] ?? platform}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                ) : null;
              })}
              <span className="ml-1 text-xs text-muted-foreground">
                {platformCount} platform{platformCount !== 1 ? "s" : ""} ·{" "}
                {collection.posts.length} account
                {collection.posts.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ── Content & Media row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Post Caption */}
          <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-muted/20 flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Post Caption
                </p>
                <p className="text-xs text-muted-foreground">
                  Content published across platforms
                </p>
              </div>
            </div>
            <div className="p-5 flex-1">
              {captionText ? (
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {captionText}
                </p>
              ) : (
                <div>
                  <div className="space-y-2.5">
                    {[100, 91, 83, 97, 76, 88, 94, 71].map((w, i) => (
                      <div
                        key={i}
                        className="h-3 rounded-md bg-muted/70"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/50 mt-4 pt-3 border-t border-border/30 italic">
                    No caption specified for this collection
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Media Attachments */}
          <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-muted/20 flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Attachments
                </p>
                <p className="text-xs text-muted-foreground">
                  {collection.media.length > 0
                    ? `${collection.media.length} file${collection.media.length !== 1 ? "s" : ""} attached`
                    : "No media files"}
                </p>
              </div>
            </div>
            <div className="p-5 flex-1">
              {collection.media.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {collection.media.map((m, i) => (
                    <div
                      key={m.id ?? i}
                      className="rounded-xl overflow-hidden border border-border/40 shadow-sm"
                    >
                      <MediaPreview
                        media={mapMediaResponseToMedia(m)}
                        className="h-20 w-20"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-xl bg-muted/60 border border-border/30"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/50 mt-4 pt-3 border-t border-border/30 italic">
                    {collection.postCollectionType === "TEXT"
                      ? "Text post — no media attachments"
                      : "No media files attached"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Account Groups ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground tracking-tight">
                  Account Groups
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-muted border border-border/40 text-xs font-semibold text-muted-foreground tabular-nums">
                  {platformCount}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-7">
                Posts organised by connected platform
              </p>
            </div>
          </div>

          {collection.posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-border/40 bg-muted/20">
              <LayoutGrid className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No posts in this collection
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-5",
                platformCount === 1
                  ? "grid-cols-1 max-w-2xl"
                  : "grid-cols-1 lg:grid-cols-2"
              )}
            >
              {Object.entries(groupedPosts).map(([platform, posts]) => (
                <PlatformGroupCard
                  key={platform}
                  platform={platform}
                  posts={posts}
                  onPostClick={(id) => router.push(`/posts/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* ─── Platform Group Card ─────────────────────────────────── */

function PlatformGroupCard({
  platform,
  posts,
  onPostClick,
}: {
  platform: string;
  posts: PostResponse[];
  onPostClick: (id: number) => void;
}) {
  const Icon = PLATFORM_ICONS[platform];
  const iconStyle =
    platformIconStyle[platform] ??
    "text-muted-foreground bg-muted/50 border-border/60";

  const publishedCount = posts.filter((p) =>
    ["PUBLISHED", "POSTED"].includes(p.postStatus)
  ).length;
  const scheduledCount = posts.filter(
    (p) => p.postStatus === "SCHEDULED"
  ).length;
  const failedCount = posts.filter((p) => p.postStatus === "FAILED").length;

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
      {/* Platform header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-10 w-10 rounded-xl border flex items-center justify-center shadow-sm flex-shrink-0",
              iconStyle
            )}
          >
            {Icon ? <Icon className="h-5 w-5" /> : null}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {platformDisplayName[platform] ?? platform}
            </p>
            <p className="text-xs text-muted-foreground">
              {posts.length} account{posts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Mini status dots */}
        <div className="flex items-center gap-1.5">
          {publishedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              {publishedCount}
            </span>
          )}
          {scheduledCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              {scheduledCount}
            </span>
          )}
          {failedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200/60 text-[10px] font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {failedCount}
            </span>
          )}
        </div>
      </div>

      {/* Account rows */}
      <div className="divide-y divide-border/30">
        {posts.map((post) => (
          <AccountRow
            key={post.id}
            post={post}
            onClick={() => onPostClick(post.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Account Row ─────────────────────────────────────────── */

function AccountRow({
  post,
  onClick,
}: {
  post: PostResponse;
  onClick: () => void;
}) {
  const statusClass =
    postStatusBadge[post.postStatus] ?? postStatusBadge.SCHEDULED;
  const statusLabel =
    post.postStatus === "PUBLISHED"
      ? "Published"
      : post.postStatus === "FAILED"
      ? "Failed"
      : "Scheduled";
  const profileImageSrc = getImageUrl(post.connectedAccount?.profilePicLink);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-muted/30 active:bg-muted/50 transition-colors text-left group"
    >
      {/* Avatar */}
      <div className="relative h-9 w-9 rounded-full overflow-hidden border border-border/60 flex-shrink-0 bg-muted">
        {profileImageSrc ? (
          <Image
            src={profileImageSrc}
            alt={post.connectedAccount?.username ?? ""}
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Username + Post title */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate leading-tight">
          {post.connectedAccount?.username ?? "Unknown Account"}
        </p>
        {post.title && (
          <p className="text-xs text-muted-foreground truncate mt-0.5 leading-tight">
            {post.title}
          </p>
        )}
      </div>

      {/* Status badge */}
      <span
        className={cn(
          "px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0",
          statusClass
        )}
      >
        {statusLabel}
      </span>

      {/* Arrow */}
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </button>
  );
}

/* ─── Skeleton ────────────────────────────────────────────── */

function SkeletonDetailPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header skeleton */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32 rounded hidden sm:block" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-44 rounded" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg hidden sm:block" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero card skeleton */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
          <Skeleton className="h-1 w-full rounded-none" />
          <div className="p-6 sm:p-8 space-y-5">
            {/* Badges */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-9 w-3/4 rounded-xl" />
              <Skeleton className="h-5 w-full rounded-lg" />
              <Skeleton className="h-5 w-2/3 rounded-lg" />
            </div>
            {/* Date chip */}
            <Skeleton className="h-14 w-72 rounded-xl" />
            {/* Stats tiles */}
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-[72px] rounded-xl" />
              <Skeleton className="h-[72px] rounded-xl" />
              <Skeleton className="h-[72px] rounded-xl" />
            </div>
            {/* Divider */}
            <div className="h-px bg-border/30" />
            {/* Platform row */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-4 w-32 rounded ml-1" />
            </div>
          </div>
        </div>

        {/* Content & Media skeleton row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Caption skeleton */}
          <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-muted/20">
              <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-36 rounded" />
              </div>
            </div>
            <div className="p-5 space-y-2.5">
              {[100, 91, 83, 97, 76, 88, 94, 71].map((w, i) => (
                <Skeleton key={i} className="h-3 rounded-md" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          {/* Media skeleton */}
          <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-muted/20">
              <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-4 gap-2.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section header skeleton */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-36 rounded-lg" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <Skeleton className="h-4 w-52 rounded ml-7 mb-6" />

          {/* Group card skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[3, 2, 2, 3].map((rows, i) => (
              <SkeletonGroupCard key={i} rows={rows} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function SkeletonGroupCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-3 w-14 rounded" />
          </div>
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      {/* Account rows */}
      {Array.from({ length: rows }).map((_, j) => (
        <div
          key={j}
          className="flex items-center gap-3.5 px-5 py-3.5 border-b border-border/30 last:border-b-0"
        >
          <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

"use client";

import AtlassianButton from "@atlaskit/button/new";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { PostResponse } from "@/model/PostResponse";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/service/getImageUrl";

/* ─── Config maps ─────────────────────────────────────────── */

const statusConfig: Record<
  string,
  { label: string; Icon: typeof CheckCircle2; className: string }
> = {
  SCHEDULED: {
    label: "Scheduled",
    Icon: Clock,
    className:
      "border-[hsl(var(--info))]/18 bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
  },
  PUBLISHED: {
    label: "Published",
    Icon: CheckCircle2,
    className:
      "border-[hsl(var(--success))]/18 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  },
  PARTIAL_SUCCESS: {
    label: "Partially Completed",
    Icon: AlertTriangle,
    className:
      "border-[hsl(var(--warning))]/18 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  },
  FAILED: {
    label: "Failed",
    Icon: XCircle,
    className:
      "border-[hsl(var(--destructive))]/18 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
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
      "border-[hsl(var(--accent))]/18 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]",
  },
  VIDEO: {
    label: "Video",
    Icon: Video,
    className:
      "border-[hsl(var(--accent))]/18 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]",
  },
  TEXT: {
    label: "Text",
    Icon: FileText,
    className:
      "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]",
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
    bar: "linear-gradient(90deg,#f9ce34 0%,#ee2a7b 45%,#6228d7 100%)",
    cardBg:
      "bg-gradient-to-br from-pink-50/70 to-purple-50/40 dark:from-pink-950/30 dark:to-purple-950/20",
    cardBorder: "border-pink-200/70 dark:border-pink-800/30",
    iconClass:
      "bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 border-transparent text-white shadow-md shadow-pink-500/25",
  },
  X: {
    bar: "linear-gradient(90deg,#000 0%,#3a3a3a 50%,#000 100%)",
    cardBg: "bg-neutral-50/90 dark:bg-neutral-900/50",
    cardBorder: "border-neutral-200/80 dark:border-neutral-700/50",
    iconClass:
      "bg-neutral-900 dark:bg-neutral-100 border-transparent text-white dark:text-neutral-900 shadow-md shadow-neutral-900/20",
  },
  LINKEDIN: {
    bar: "linear-gradient(90deg,#0077b5 0%,#00a0dc 100%)",
    cardBg:
      "bg-gradient-to-br from-sky-50/70 to-blue-50/40 dark:from-sky-950/30 dark:to-blue-950/20",
    cardBorder: "border-sky-200/70 dark:border-sky-800/30",
    iconClass:
      "bg-gradient-to-br from-sky-400 to-blue-700 border-transparent text-white shadow-md shadow-sky-500/25",
  },
  YOUTUBE: {
    bar: "linear-gradient(90deg,#ff0000 0%,#ff5252 50%,#cc0000 100%)",
    cardBg:
      "bg-gradient-to-br from-red-50/70 to-rose-50/40 dark:from-red-950/30 dark:to-rose-950/20",
    cardBorder: "border-red-200/70 dark:border-red-800/30",
    iconClass:
      "bg-gradient-to-br from-red-500 to-red-700 border-transparent text-white shadow-md shadow-red-500/25",
  },
  FACEBOOK: {
    bar: "linear-gradient(90deg,#1877f2 0%,#42a5f5 100%)",
    cardBg:
      "bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/20",
    cardBorder: "border-blue-200/70 dark:border-blue-800/30",
    iconClass:
      "bg-gradient-to-br from-blue-500 to-blue-700 border-transparent text-white shadow-md shadow-blue-500/25",
  },
  TIKTOK: {
    bar: "linear-gradient(90deg,#010101 0%,#ff0050 50%,#00f2ea 100%)",
    cardBg: "bg-neutral-50/90 dark:bg-neutral-900/50",
    cardBorder: "border-neutral-200/80 dark:border-neutral-700/50",
    iconClass:
      "bg-neutral-900 border-transparent text-white shadow-md shadow-neutral-900/20",
  },
  THREADS: {
    bar: "linear-gradient(90deg,#101010 0%,#606060 50%,#101010 100%)",
    cardBg: "bg-neutral-50/90 dark:bg-neutral-900/50",
    cardBorder: "border-neutral-200/80 dark:border-neutral-700/50",
    iconClass:
      "bg-neutral-900 dark:bg-neutral-700 border-transparent text-white shadow-md shadow-neutral-900/20",
  },
};

const platformAccentFallback = {
  bar: "linear-gradient(90deg,#6b7280,#9ca3af)",
  cardBg: "bg-muted/30",
  cardBorder: "border-border/60",
  iconClass: "bg-muted border-border/60 text-muted-foreground",
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
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] p-6">
        <div className="max-w-sm w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 text-center shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
            <AlertCircle className="h-7 w-7 text-[hsl(var(--destructive))]" />
          </div>
          <h3 className="mb-1 text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">
            Collection not found
          </h3>
          <p className="mb-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
            This collection couldn&apos;t be loaded. It may have been deleted.
          </p>
          <AtlassianButton appearance="primary" onClick={() => router.push("/published-posts")}>
            <span className="inline-flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Published Posts</span>
            </span>
          </AtlassianButton>
        </div>
      </div>
    );
  }

  /* ── Derived values ── */
  const scheduledDate = new Date(collection.scheduledTime ?? "");
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
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <ProtectedPageHeader
        title={collection.description}
        description="Published post details."
        icon={<CheckCircle2 className="h-4 w-4" />}
        actions={
          <div className="hidden sm:block">
            <AtlassianButton appearance="primary" onClick={() => router.push("/schedule-post")}>
              <span className="inline-flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span>New Post</span>
              </span>
            </AtlassianButton>
          </div>
        }
      />

      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-2.5 sm:px-6">
        <nav className="flex min-w-0 items-center gap-1.5 text-sm">
          <button
            onClick={() => router.push("/published-posts")}
            className="flex items-center gap-1.5 text-sm font-medium leading-5 text-[hsl(var(--foreground-muted))] transition-colors hover:text-[hsl(var(--foreground))] flex-shrink-0"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-medium">
              Published Posts
            </span>
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-[hsl(var(--foreground-subtle))] flex-shrink-0" />
          <span className="font-medium text-[hsl(var(--foreground))] truncate">
            {collection.description}
          </span>
        </nav>
      </div>

      <div className="px-4 py-6 pb-24 sm:px-6 sm:pb-8 space-y-5">
        <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
          <div className="h-[3px] w-full bg-[hsl(var(--success))]" />
          <div className="px-6 pt-6 pb-5">
            <div className="flex flex-wrap items-start gap-x-4 gap-y-3 mb-4">
              <h1 className="min-w-0 flex-1 text-xl font-semibold leading-7 text-[hsl(var(--foreground))]">
                {collection.description}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium leading-4", type.className)}>
                  <TypeIcon className="h-3.5 w-3.5" />
                  {type.label}
                </span>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-4", status.className)}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-xs font-medium leading-4 text-[hsl(var(--foreground-muted))]">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate} · {formattedTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {Object.keys(groupedPosts).map((plat) => {
                  const platUpper = plat.toUpperCase();
                  const PlatIcon = PLATFORM_ICONS[plat] ?? PLATFORM_ICONS[plat.toLowerCase()];
                  return (
                    <div
                      key={plat}
                      title={platformDisplayName[platUpper] ?? plat}
                      className={cn(
                        "h-7 w-7 rounded-lg border flex items-center justify-center flex-shrink-0",
                        platformIconStyle[platUpper] ?? "text-muted-foreground bg-muted/50 border-border/60"
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
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] items-start">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
              <div className="flex items-center gap-2.5 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-3.5">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))] flex-1">Published</p>
              </div>
              <div className="p-5 space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground font-medium">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground font-medium">{formattedTime}</span>
                </div>
              </div>
            </div>

            {/* Caption card */}
            <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
              <div className="flex items-center gap-2.5 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-3.5">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))] flex-1">Caption</p>
              </div>
              <div className="p-5">
                {captionText ? (
                  <p className="text-sm text-foreground/80 leading-relaxed line-clamp-10 whitespace-pre-wrap">{captionText}</p>
                ) : (
                  <p className="text-sm text-muted-foreground/50 italic">No caption specified</p>
                )}
                {captionText && (
                  <p className="text-xs text-muted-foreground/40 tabular-nums mt-3">{captionText.length} characters</p>
                )}
              </div>
            </div>

            {/* Media carousel */}
            {collection.media.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                <div className="flex items-center gap-2.5 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-3.5">
                  <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))] flex-1">
                    Media <span className="font-normal text-muted-foreground">· {collection.media.length}</span>
                  </p>
                </div>
                <div className="p-4">
                  <MediaCarousel media={collection.media} />
                </div>
              </div>
            )}

            {/* Stats card with platform breakdown */}
            <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
              <div className="px-5 py-4 flex items-center divide-x divide-border/40">
                <div className="flex-1 text-center pr-4">
                  <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{collection.posts.length}</p>
                  <p className="mt-1.5 text-xs font-medium leading-4 text-muted-foreground">Posts</p>
                </div>
                <div className="flex-1 text-center pl-4">
                  <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{platformCount}</p>
                  <p className="mt-1.5 text-xs font-medium leading-4 text-muted-foreground">Platforms</p>
                </div>
              </div>
              <div className="px-5 pb-4 border-t border-border/30 pt-4 space-y-3">
                {Object.entries(groupedPosts).map(([plat, platPosts]) => {
                  const platUpper = plat.toUpperCase();
                  const PlatIcon = PLATFORM_ICONS[plat] ?? PLATFORM_ICONS[plat.toLowerCase()];
                  return (
                    <div key={plat} className="flex items-center gap-2.5">
                      <div className={cn("h-6 w-6 rounded-lg border flex items-center justify-center flex-shrink-0", platformIconStyle[platUpper] ?? "text-muted-foreground bg-muted/50 border-border/60")}>
                        {PlatIcon ? <PlatIcon className="h-3.5 w-3.5" /> : null}
                      </div>
                      <span className="text-sm font-medium text-foreground flex-1 truncate">{platformDisplayName[platUpper] ?? plat}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{platPosts.length} acct{platPosts.length !== 1 ? "s" : ""}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Platform sections */}
          <div className="min-w-0 space-y-4">
            {collection.posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-12 text-center shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No posts in this collection</p>
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
function AccountAvatar({ src, name, size = 8 }: { src: string | null; name: string; size?: number }) {
  const dim = `h-${size} w-${size}`;
  return (
    <div className={cn("rounded-full overflow-hidden bg-muted flex-shrink-0 border border-white/20", dim)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <User className="h-3 w-3 text-muted-foreground" />
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
      <div className="relative aspect-video w-full max-h-40 rounded-xl overflow-hidden bg-neutral-950 border border-border/40">
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
                  ? "w-4 h-1.5 bg-foreground"
                  : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
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
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30">
        <div className={cn("h-9 w-9 rounded-xl border flex items-center justify-center flex-shrink-0", accent.iconClass)}>
          {Icon ? <Icon className="h-4.5 w-4.5" /> : null}
        </div>
        <p className="text-sm font-semibold leading-5 text-foreground flex-1">
          {platformDisplayName[p] ?? platformDisplayName[platform] ?? platform}
        </p>
        <span className="text-xs font-medium leading-4 text-muted-foreground">
          {posts.length} account{posts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Platform-specific post preview */}
      <div className="px-4 py-3 border-b border-border/30">
        <div className="max-w-xs mx-auto sm:max-w-sm">
          {p === "X" && <XPreview {...previewProps} />}
          {p === "INSTAGRAM" && <InstagramPreview {...previewProps} />}
          {p === "LINKEDIN" && <LinkedInPreview {...previewProps} />}
          {p === "FACEBOOK" && <FacebookPreview {...previewProps} />}
          {p === "YOUTUBE" && <YouTubePreview {...previewProps} />}
          {p === "TIKTOK" && <TikTokPreview {...previewProps} />}
          {p === "THREADS" && <ThreadsPreview {...previewProps} />}
          {!["X","INSTAGRAM","LINKEDIN","FACEBOOK","YOUTUBE","TIKTOK","THREADS"].includes(p) && (
            <div className="rounded-lg bg-muted/40 border border-border/40 p-3">
              {caption && <p className="text-xs text-foreground/80 leading-relaxed line-clamp-4 whitespace-pre-wrap">{caption}</p>}
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
              className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-background/70 border border-border/50 shadow-sm"
            >
              <div className="relative h-6 w-6 rounded-full overflow-hidden flex-shrink-0 bg-muted border border-border/30">
                {src ? (
                  <Image src={src} alt={post.connectedAccount?.username ?? ""} fill sizes="20px" className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-2.5 w-2.5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium leading-4 text-foreground/75 max-w-[140px] truncate">
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

/* ─── Skeleton ────────────────────────────────────────────── */

function SkeletonDetailPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-10 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))]/95 backdrop-blur-sm">
        <div className="px-4 sm:px-6">
          <div className="flex h-[60px] items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="hidden h-4 w-32 rounded sm:block" />
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-44 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="hidden h-8 w-24 rounded-lg sm:block" />
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
          <div className="px-5 py-4 flex items-center gap-4">
            <Skeleton className="h-6 rounded-lg flex-1" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="hidden h-5 w-40 rounded-lg sm:block" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 items-start lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
              <div className="flex items-center gap-2 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-2.5">
                <Skeleton className="h-3.5 w-3.5 rounded flex-shrink-0" />
                <Skeleton className="h-4 w-20 rounded flex-1" />
              </div>
              <div className="p-4 space-y-2">
                {[100, 91, 83, 97, 76, 88].map((w, i) => (
                  <Skeleton key={i} className="h-2.5 rounded" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
            <div className="flex items-center divide-x divide-border/40 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
              <div className="flex-1 text-center pr-3 space-y-1">
                <Skeleton className="h-6 w-8 rounded mx-auto" />
                <Skeleton className="h-2.5 w-10 rounded mx-auto" />
              </div>
              <div className="flex-1 text-center pl-3 space-y-1">
                <Skeleton className="h-6 w-8 rounded mx-auto" />
                <Skeleton className="h-2.5 w-14 rounded mx-auto" />
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-2.5">
            {[0, 1, 2].map((i) => (
              <SkeletonPlatformSection key={i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function SkeletonPlatformSection() {
  return (
    <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
      <Skeleton className="h-[3px] w-full rounded-none" />
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
          <Skeleton className="h-4 w-24 rounded flex-1" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[80, 100, 90, 110, 85, 95].map((w, i) => (
            <Skeleton key={i} className="h-7 rounded-full" style={{ width: `${w}px` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

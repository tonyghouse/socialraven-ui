"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  Loader2,
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
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { PostCard } from "@/components/posts/post-card";
import { Pagination } from "@/components/generic/pagination";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";

const POSTS_PER_PAGE = 6;

const statusConfig: Record<
  string,
  { label: string; Icon: typeof CheckCircle2; className: string; dot: string }
> = {
  SCHEDULED: {
    label: "Scheduled",
    Icon: Clock,
    className: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
    dot: "bg-blue-500",
  },
  PUBLISHED: {
    label: "Published",
    Icon: CheckCircle2,
    className: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  PARTIAL_SUCCESS: {
    label: "Partial Success",
    Icon: AlertTriangle,
    className: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
    dot: "bg-amber-500",
  },
  FAILED: {
    label: "Failed",
    Icon: XCircle,
    className: "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20",
    dot: "bg-red-500",
  },
};

const typeConfig: Record<
  string,
  { label: string; Icon: typeof ImageIcon; className: string }
> = {
  IMAGE: {
    label: "Image",
    Icon: ImageIcon,
    className: "text-violet-600 bg-violet-50 border-violet-200",
  },
  VIDEO: {
    label: "Video",
    Icon: Video,
    className: "text-rose-600 bg-rose-50 border-rose-200",
  },
  TEXT: {
    label: "Text",
    Icon: FileText,
    className: "text-slate-600 bg-slate-50 border-slate-200",
  },
};

const platformIconColor: Record<string, string> = {
  YOUTUBE: "text-red-600 bg-red-50 border-red-100",
  INSTAGRAM: "text-pink-600 bg-pink-50 border-pink-100",
  FACEBOOK: "text-blue-600 bg-blue-50 border-blue-100",
  LINKEDIN: "text-sky-600 bg-sky-50 border-sky-100",
  X: "text-neutral-800 bg-neutral-50 border-neutral-200",
};

export default function PublishedCollectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getToken } = useAuth();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<PostCollectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postsPage, setPostsPage] = useState(1);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading collection…</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-sm w-full rounded-2xl bg-white border border-border/60 p-8 shadow-sm text-center">
          <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Collection not found</h3>
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

  const scheduledDate = new Date(collection.scheduledTime);
  const status = statusConfig[collection.overallStatus] ?? statusConfig.PUBLISHED;
  const type = typeConfig[collection.postCollectionType] ?? typeConfig.TEXT;
  const StatusIcon = status.Icon;
  const TypeIcon = type.Icon;

  // Client-side pagination
  const totalPostPages = Math.ceil(collection.posts.length / POSTS_PER_PAGE);
  const paginatedPosts = collection.posts.slice(
    (postsPage - 1) * POSTS_PER_PAGE,
    postsPage * POSTS_PER_PAGE
  );

  // Unique platforms
  const uniquePlatforms = Array.from(new Set(collection.posts.map((p) => p.provider)));

  // Status breakdown
  const publishedCount = collection.posts.filter((p) =>
    ["PUBLISHED", "POSTED"].includes(p.postStatus)
  ).length;
  const scheduledCount = collection.posts.filter((p) => p.postStatus === "SCHEDULED").length;
  const failedCount = collection.posts.filter((p) => p.postStatus === "FAILED").length;

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

  return (
    <main className="min-h-screen bg-background">
      {/* Sticky Header with Breadcrumb */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            <button
              onClick={() => router.push("/published-posts")}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Published Posts</span>
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
            <span className="font-medium text-foreground truncate">{collection.title}</span>
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
        {/* Collection Hero */}
        <div className="rounded-2xl bg-white border border-border/60 shadow-sm overflow-hidden">
          {/* Top accent bar */}
          <div
            className={cn(
              "h-1 w-full",
              collection.overallStatus === "PUBLISHED"
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                : collection.overallStatus === "FAILED"
                ? "bg-gradient-to-r from-red-400 to-red-500"
                : collection.overallStatus === "PARTIAL_SUCCESS"
                ? "bg-gradient-to-r from-amber-400 to-amber-500"
                : "bg-gradient-to-r from-blue-400 to-blue-500"
            )}
          />

          <div className="p-6 sm:p-8">
            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-3">
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

                <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground tracking-tight leading-tight mb-2">
                  {collection.title}
                </h1>

                {collection.description && (
                  <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-3">
              {/* Schedule */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/40">
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

              {/* Platform count */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/40">
                <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                    Platforms
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {collection.posts.length} account{collection.posts.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-6" />

            {/* Platform pills + status breakdown */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Platform icons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground mr-1">Platforms:</span>
                {uniquePlatforms.map((platform) => {
                  const Icon = PLATFORM_ICONS[platform];
                  return Icon ? (
                    <span
                      key={platform}
                      className={cn(
                        "h-8 w-8 rounded-xl border flex items-center justify-center shadow-sm",
                        platformIconColor[platform] ?? "text-muted-foreground bg-muted/50 border-border/60"
                      )}
                      title={platform}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  ) : null;
                })}
              </div>

              {/* Status breakdown */}
              <div className="flex items-center gap-3 sm:ml-auto">
                {publishedCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">
                      {publishedCount} published
                    </span>
                  </div>
                )}
                {scheduledCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-xs text-muted-foreground">
                      {scheduledCount} scheduled
                    </span>
                  </div>
                )}
                {failedCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-xs text-muted-foreground">{failedCount} failed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">
                Platform Posts
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {collection.posts.length} post{collection.posts.length !== 1 ? "s" : ""} — click
                any post to view details
              </p>
            </div>
          </div>

          {collection.posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-border/40 bg-muted/20">
              <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No posts in this collection</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {totalPostPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={postsPage}
                    totalPages={totalPostPages}
                    onPageChange={(p) => {
                      setPostsPage(p);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

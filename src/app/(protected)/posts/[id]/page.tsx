"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Loader2,
  AlertCircle,
  FileText,
  FileImage,
  Trash2,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  User,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";

import type { PostResponse } from "@/model/PostResponse";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { MediaPreview } from "@/components/generic/media-preview";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { fetchPostByIdApi } from "@/service/getPost";
import { deletePostByIdApi } from "@/service/deletePostByIdApi";
import { mapMediaResponseToMedia } from "@/lib/media-mapper";

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  const needsProxy = ["linkedin.com", "licdn.com"];
  return needsProxy.some((d) => url.includes(d))
    ? `/api/proxy-image?url=${encodeURIComponent(url)}`
    : url;
};

const getInitials = (username: string) => {
  if (!username) return "?";
  return username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/* ─── Profile Avatar ──────────────────────────────────────── */

function ProfileAvatar({
  src,
  username,
  size = "md",
  fallbackClass = "bg-neutral-800",
}: {
  src: string | null;
  username: string;
  size?: "sm" | "md" | "lg";
  fallbackClass?: string;
}) {
  const sizeClass = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-12 w-12 text-sm",
  }[size];
  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center text-white font-semibold flex-shrink-0",
        sizeClass,
        fallbackClass
      )}
    >
      {src ? (
        <Image src={src} alt={username} fill className="object-cover" />
      ) : (
        <span>{getInitials(username)}</span>
      )}
    </div>
  );
}

/* ─── Platform Previews ───────────────────────────────────── */

function InstagramPreview({ post }: { post: PostResponse }) {
  const src = getImageUrl(post.connectedAccount?.profilePicLink);
  const username = post.connectedAccount?.username || "username";
  return (
    <div className="bg-white rounded-xl border border-border/60 overflow-hidden text-sm">
      <div className="flex items-center gap-2.5 p-3 border-b border-border/30">
        <ProfileAvatar
          src={src}
          username={username}
          fallbackClass="bg-gradient-to-br from-pink-500 to-purple-600"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[13px]">{username}</p>
          <p className="text-[11px] text-muted-foreground">Original Audio</p>
        </div>
        <button className="text-[11px] font-bold text-blue-500 flex-shrink-0">
          Follow
        </button>
      </div>
      {post.media?.[0] && (
        <div className="aspect-square bg-muted">
          <MediaPreview
            media={mapMediaResponseToMedia(post.media[0])}
            className="w-full h-full"
            showLightbox={false}
          />
        </div>
      )}
      <div className="p-3 space-y-1">
        {post.description && (
          <p className="text-[13px] leading-snug">
            <span className="font-semibold">{username}</span>{" "}
            <span className="text-card-foreground">{post.description}</span>
          </p>
        )}
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
          Just now
        </p>
      </div>
    </div>
  );
}

function YouTubePreview({ post }: { post: PostResponse }) {
  const src = getImageUrl(post.connectedAccount?.profilePicLink);
  const username = post.connectedAccount?.username || "Channel";
  return (
    <div className="bg-white rounded-xl border border-border/60 overflow-hidden text-sm">
      {post.media?.[0] && (
        <div className="aspect-video bg-black">
          <MediaPreview
            media={mapMediaResponseToMedia(post.media[0])}
            className="w-full h-full"
            showLightbox={false}
          />
        </div>
      )}
      <div className="p-3 flex gap-2.5">
        <ProfileAvatar src={src} username={username} fallbackClass="bg-red-600" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[13px] line-clamp-2 leading-snug">
            {post.title}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {username} · Just now
          </p>
        </div>
      </div>
    </div>
  );
}

function FacebookPreview({ post }: { post: PostResponse }) {
  const src = getImageUrl(post.connectedAccount?.profilePicLink);
  const username = post.connectedAccount?.username || "Page";
  return (
    <div className="bg-white rounded-xl border border-border/60 overflow-hidden text-sm">
      <div className="flex items-center gap-2.5 p-3">
        <ProfileAvatar
          src={src}
          username={username}
          fallbackClass="bg-blue-600"
        />
        <div>
          <p className="font-semibold text-[13px]">{username}</p>
          <p className="text-[11px] text-muted-foreground">Just now · 🌐</p>
        </div>
      </div>
      {post.description && (
        <p className="px-3 pb-2 text-[13px] text-card-foreground leading-snug">
          {post.description}
        </p>
      )}
      {post.media?.[0] && (
        <div className="aspect-video bg-muted">
          <MediaPreview
            media={mapMediaResponseToMedia(post.media[0])}
            className="w-full h-full"
            showLightbox={false}
          />
        </div>
      )}
    </div>
  );
}

function LinkedInPreview({ post }: { post: PostResponse }) {
  const src = getImageUrl(post.connectedAccount?.profilePicLink);
  const username = post.connectedAccount?.username || "Professional";
  return (
    <div className="bg-white rounded-xl border border-border/60 overflow-hidden text-sm">
      <div className="flex items-start gap-2.5 p-3">
        <ProfileAvatar
          src={src}
          username={username}
          size="lg"
          fallbackClass="bg-sky-600"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[13px]">{username}</p>
          <p className="text-[11px] text-muted-foreground">
            1st · Just now · 🌐
          </p>
        </div>
        <button className="text-sky-600 border border-sky-600 rounded-full px-3 py-0.5 text-[11px] font-semibold flex-shrink-0">
          + Follow
        </button>
      </div>
      {post.description && (
        <p className="px-3 pb-2 text-[13px] text-card-foreground leading-relaxed line-clamp-4">
          {post.description}
        </p>
      )}
      {post.media?.[0] && (
        <div className="aspect-video bg-muted">
          <MediaPreview
            media={mapMediaResponseToMedia(post.media[0])}
            className="w-full h-full"
            showLightbox={false}
          />
        </div>
      )}
    </div>
  );
}

function XPreview({ post }: { post: PostResponse }) {
  const src = getImageUrl(post.connectedAccount?.profilePicLink);
  const username = post.connectedAccount?.username || "User";
  return (
    <div className="bg-white rounded-xl border border-border/60 overflow-hidden text-sm">
      <div className="p-3 flex gap-2.5">
        <ProfileAvatar
          src={src}
          username={username}
          size="lg"
          fallbackClass="bg-neutral-800"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="font-bold text-[13px]">{username}</p>
            <p className="text-[12px] text-muted-foreground">· Just now</p>
          </div>
          {post.description && (
            <p className="text-[13px] text-card-foreground mb-2 whitespace-pre-wrap leading-snug">
              {post.description}
            </p>
          )}
          {post.media?.[0] && (
            <div className="rounded-xl border border-border/40 overflow-hidden aspect-video">
              <MediaPreview
                media={mapMediaResponseToMedia(post.media[0])}
                className="w-full h-full"
                showLightbox={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Config ──────────────────────────────────────────────── */

const statusConfig: Record<
  string,
  {
    label: string;
    Icon: typeof CheckCircle2;
    className: string;
    barClass: string;
  }
> = {
  SCHEDULED: {
    label: "Scheduled",
    Icon: Clock,
    className: "text-blue-700 bg-blue-50 border-blue-200",
    barClass: "from-blue-400 to-blue-500",
  },
  PUBLISHED: {
    label: "Published",
    Icon: CheckCircle2,
    className: "text-emerald-700 bg-emerald-50 border-emerald-200",
    barClass: "from-emerald-400 to-emerald-500",
  },
  FAILED: {
    label: "Failed",
    Icon: XCircle,
    className: "text-red-700 bg-red-50 border-red-200",
    barClass: "from-red-400 to-red-500",
  },
};

const platformMeta: Record<
  string,
  { name: string; iconColor: string; headerBg: string }
> = {
  YOUTUBE: {
    name: "YouTube",
    iconColor: "text-red-600 bg-red-50 border-red-100",
    headerBg: "from-red-50/60 to-transparent",
  },
  INSTAGRAM: {
    name: "Instagram",
    iconColor: "text-pink-600 bg-pink-50 border-pink-100",
    headerBg: "from-pink-50/60 to-transparent",
  },
  FACEBOOK: {
    name: "Facebook",
    iconColor: "text-blue-600 bg-blue-50 border-blue-100",
    headerBg: "from-blue-50/60 to-transparent",
  },
  LINKEDIN: {
    name: "LinkedIn",
    iconColor: "text-sky-600 bg-sky-50 border-sky-100",
    headerBg: "from-sky-50/60 to-transparent",
  },
  X: {
    name: "X (Twitter)",
    iconColor: "text-neutral-800 bg-neutral-50 border-neutral-200",
    headerBg: "from-neutral-50/60 to-transparent",
  },
};

/* ─── Main Page ───────────────────────────────────────────── */

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getToken } = useAuth();
  const postId = params.id as string;

  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        setLoading(true);
        setPost(await fetchPostByIdApi(getToken, postId));
      } catch {
        setError("Unable to load post details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [postId, getToken]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePostByIdApi(getToken, postId);
      router.back();
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <SkeletonPostPage />;
  }

  if (!post || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-sm w-full rounded-2xl bg-card border border-border/60 p-8 shadow-sm text-center">
          <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Post not found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            This post couldn&apos;t be loaded or no longer exists.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </div>
    );
  }

  const Icon = PLATFORM_ICONS[post.provider];
  const meta = platformMeta[post.provider];
  const status = statusConfig[post.postStatus] ?? statusConfig.SCHEDULED;
  const StatusIcon = status.Icon;
  const scheduled = new Date(post.scheduledTime);
  const profileImageSrc = getImageUrl(post.connectedAccount?.profilePicLink);

  const formattedDate = scheduled.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = scheduled.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const now = Date.now();
  const diff = scheduled.getTime() - now;
  const absDiff = Math.abs(diff);
  const isPast = diff < 0;
  const relDays = Math.floor(absDiff / 86400000);
  const relHours = Math.floor((absDiff % 86400000) / 3600000);
  const relativeLabel =
    relDays > 0
      ? `${isPast ? "" : "in "}${relDays}d ${relHours}h${isPast ? " ago" : ""}`
      : relHours > 0
      ? `${isPast ? "" : "in "}${relHours}h${isPast ? " ago" : ""}`
      : isPast
      ? "just now"
      : "< 1h";

  const renderPreview = () => {
    switch (post.provider) {
      case "INSTAGRAM":
        return <InstagramPreview post={post} />;
      case "YOUTUBE":
        return <YouTubePreview post={post} />;
      case "FACEBOOK":
        return <FacebookPreview post={post} />;
      case "LINKEDIN":
        return <LinkedInPreview post={post} />;
      case "X":
        return <XPreview post={post} />;
      default:
        return null;
    }
  };

  const preview = renderPreview();
  const hasMedia = post.media && post.media.length > 0;

  return (
    <main className="min-h-screen bg-background">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            <button
              onClick={() => router.push("/scheduled-posts")}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">
                Scheduled Posts
              </span>
            </button>

            {post.postCollectionId && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                <button
                  onClick={() =>
                    router.push(`/scheduled-posts/${post.postCollectionId}`)
                  }
                  className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors font-medium flex-shrink-0"
                >
                  Collection
                </button>
              </>
            )}

            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
            <span className="font-medium text-foreground truncate">
              {post.title}
            </span>
          </nav>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0",
              status.className
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        </div>
      </header>

      {/* Page Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* ── Left: Content ── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Post header card */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
              <div
                className={cn(
                  "h-0.5 w-full bg-gradient-to-r",
                  status.barClass
                )}
              />
              <div
                className={cn(
                  "px-6 pt-6 pb-5 bg-gradient-to-b",
                  meta?.headerBg ?? "from-muted/20 to-transparent"
                )}
              >
                <div className="flex items-center gap-3 mb-5">
                  {Icon && (
                    <div
                      className={cn(
                        "h-12 w-12 rounded-2xl border shadow-sm flex items-center justify-center flex-shrink-0",
                        meta?.iconColor ??
                          "bg-muted/50 border-border/60 text-muted-foreground"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                      {meta?.name ?? post.provider}
                    </p>
                    {post.connectedAccount && (
                      <p className="text-sm font-medium text-foreground">
                        {post.connectedAccount.username}
                      </p>
                    )}
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
                  {post.title}
                </h1>
              </div>

              {/* Description — always show section, placeholder when empty */}
              <div className="px-6 pb-6">
                <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-5" />
                {post.description ? (
                  <p className="text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {post.description}
                  </p>
                ) : (
                  <div>
                    <div className="space-y-2.5">
                      {[100, 93, 86, 97, 79, 88, 100, 72].map((w, i) => (
                        <div
                          key={i}
                          className="h-3.5 rounded-md bg-muted/70"
                          style={{ width: `${w}%` }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground/50 mt-4 pt-3 border-t border-border/30 italic">
                      No caption added for this post
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Media gallery — always rendered */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <FileImage className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">
                  Media
                </h2>
                <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/30">
                  {hasMedia
                    ? `${post.media.length} ${post.media.length === 1 ? "file" : "files"}`
                    : "No files"}
                </span>
              </div>

              {hasMedia ? (
                <div
                  className={cn(
                    "grid gap-3",
                    post.media.length === 1
                      ? "grid-cols-1"
                      : post.media.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2 sm:grid-cols-3"
                  )}
                >
                  {post.media.map((m, i) => (
                    <div
                      key={m.id ?? i}
                      className="rounded-xl overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <MediaPreview
                        media={mapMediaResponseToMedia(m)}
                        className={cn(
                          "w-full",
                          post.media.length === 1
                            ? "aspect-video"
                            : "aspect-square"
                        )}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-xl bg-muted/60 border border-border/30"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/50 mt-4 pt-3 border-t border-border/30 italic">
                    No media files attached to this post
                  </p>
                </div>
              )}
            </div>

            {/* Platform preview — always rendered, placeholder when unsupported */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-5">
                {Icon && (
                  <div
                    className={cn(
                      "h-6 w-6 rounded-lg border flex items-center justify-center",
                      meta?.iconColor
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                )}
                <h2 className="text-base font-semibold text-foreground">
                  {meta?.name ?? post.provider} Preview
                </h2>
                <span className="ml-auto text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/30 font-medium">
                  Approximate
                </span>
              </div>

              {preview ? (
                <div className="bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl p-4 border border-border/30">
                  {preview}
                </div>
              ) : (
                <div className="rounded-xl bg-muted/30 border border-border/30 p-6">
                  {/* Skeleton-like preview placeholder */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-muted/80 border border-border/40 flex-shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-muted/80 rounded w-32" />
                      <div className="h-3 bg-muted/60 rounded w-20" />
                    </div>
                  </div>
                  <div className="space-y-2.5 mb-4">
                    {[100, 88, 72].map((w, i) => (
                      <div
                        key={i}
                        className="h-3 bg-muted/70 rounded"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                  <div className="aspect-video rounded-lg bg-muted/60 border border-border/30" />
                  <p className="text-xs text-muted-foreground/50 mt-4 text-center italic">
                    Preview not available for this platform
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Schedule card */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Schedule
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Date &amp; Time
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formattedDate}
                  </p>
                  <p className="text-sm text-muted-foreground">{formattedTime}</p>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border/30">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {isPast ? "Published" : "Publishes"} {relativeLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Account card */}
            {post.connectedAccount && (
              <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Account
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-border/40 shadow-sm flex-shrink-0">
                    {profileImageSrc ? (
                      <Image
                        src={profileImageSrc}
                        alt={post.connectedAccount.username}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {post.connectedAccount.username}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {Icon && (
                        <div
                          className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center",
                            meta?.iconColor
                          )}
                        >
                          <Icon className="h-2.5 w-2.5" />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground font-medium">
                        {meta?.name ?? post.provider}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Post stats card */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Post Details
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-xs text-muted-foreground font-medium">
                    Type
                  </span>
                  <span className="text-xs font-semibold text-foreground capitalize">
                    {post.provider?.charAt(0) +
                      (post.provider?.slice(1).toLowerCase() ?? "")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-xs text-muted-foreground font-medium">
                    Media files
                  </span>
                  <span className="text-xs font-semibold text-foreground tabular-nums">
                    {post.media?.length ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Status
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                      status.className
                    )}
                  >
                    <StatusIcon className="h-2.5 w-2.5" />
                    {status.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Collection link */}
            {post.postCollectionId && (
              <button
                onClick={() =>
                  router.push(`/scheduled-posts/${post.postCollectionId}`)
                }
                className="w-full rounded-2xl bg-card border border-border/60 shadow-sm p-5 text-left hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-primary/10 transition-colors flex-shrink-0">
                    <Layers className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      View Collection
                    </p>
                    <p className="text-xs text-muted-foreground">
                      See all posts in this campaign
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground/0 group-hover:text-primary/70 transition-all flex-shrink-0" />
                </div>
              </button>
            )}

            {/* Delete zone */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Danger Zone
              </p>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Post
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center mb-3 leading-relaxed">
                    This action cannot be undone. The post will be permanently
                    deleted.
                  </p>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {isDeleting ? "Deleting…" : "Yes, delete permanently"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="w-full px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─── Skeleton ────────────────────────────────────────────── */

function SkeletonPostPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-28 rounded hidden sm:block" />
            <Skeleton className="h-4 w-4 rounded hidden sm:block" />
            <Skeleton className="h-4 w-20 rounded hidden sm:block" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left column skeleton */}
          <div className="lg:col-span-3 space-y-5">
            {/* Post header */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
              <Skeleton className="h-0.5 w-full rounded-none" />
              <div className="px-6 pt-6 pb-5 space-y-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-2xl flex-shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                </div>
                <Skeleton className="h-9 w-4/5 rounded-xl" />
              </div>
              <div className="px-6 pb-6">
                <div className="h-px bg-border/40 mb-5" />
                <div className="space-y-2.5">
                  {[100, 93, 86, 97, 79, 88, 100, 72].map((w, i) => (
                    <Skeleton
                      key={i}
                      className="h-3.5 rounded-md"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-5 w-14 rounded" />
                <Skeleton className="h-5 w-14 rounded-full ml-auto" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            </div>

            {/* Platform preview */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <Skeleton className="h-6 w-6 rounded-lg" />
                <Skeleton className="h-5 w-36 rounded" />
                <Skeleton className="h-5 w-20 rounded-full ml-auto" />
              </div>
              <div className="rounded-xl bg-muted/30 border border-border/30 p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                </div>
                <Skeleton className="aspect-video w-full rounded-lg" />
                <div className="space-y-2">
                  {[100, 82, 60].map((w, i) => (
                    <Skeleton
                      key={i}
                      className="h-3 rounded"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {/* Schedule */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-4 w-44 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            </div>

            {/* Account */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
            </div>

            {/* Post details */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-border/30 last:border-b-0"
                  >
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Collection link */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-5">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-40 rounded" />
                </div>
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </div>

            {/* Danger zone */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-5">
              <Skeleton className="h-3 w-20 rounded mb-3" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

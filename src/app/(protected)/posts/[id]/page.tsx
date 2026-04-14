"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  AlertCircle,
  FileText,
  FileImage,
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
import { cn } from "@/lib/utils";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { PostDetailPageSkeleton } from "@/components/posts/post-detail-page-skeleton";
import { fetchPostByIdApi } from "@/service/getPost";
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

const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";

const surfaceClassName =
  "rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm";

const previewCardClassName =
  "overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-sm";

const actionButtonClassName =
  "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-label-14 transition-colors disabled:pointer-events-none disabled:opacity-50";

/* ─── Profile Avatar ──────────────────────────────────────── */

function ProfileAvatar({
  src,
  username,
  size = "md",
  fallbackClass = "bg-[var(--ds-gray-700)]",
}: {
  src: string | null;
  username: string;
  size?: "sm" | "md" | "lg";
  fallbackClass?: string;
}) {
  const sizeClass = {
    sm: "h-8 w-8 text-[0.625rem]",
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

function ToneBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label-12",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ─── Platform Previews ───────────────────────────────────── */

function InstagramPreview({ post }: { post: PostResponse }) {
  const src = getImageUrl(post.connectedAccount?.profilePicLink);
  const username = post.connectedAccount?.username || "username";
  return (
    <div className={previewCardClassName}>
      <div className="flex items-center gap-2.5 border-b border-[var(--ds-gray-400)] p-3">
        <ProfileAvatar
          src={src}
          username={username}
          fallbackClass="bg-gradient-to-br from-pink-500 to-purple-600"
        />
        <div className="flex-1 min-w-0">
          <p className="text-label-14 text-[var(--ds-gray-1000)]">{username}</p>
          <p className="text-copy-12 text-[var(--ds-gray-900)]">Original Audio</p>
        </div>
        <button
          type="button"
          className={cn(
            "shrink-0 rounded-full border border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] px-3 py-1 text-copy-12 text-[var(--ds-plum-700)]",
            focusRingClassName
          )}
        >
          Follow
        </button>
      </div>
      {post.media?.[0] && (
        <div className="aspect-square bg-[var(--ds-gray-100)]">
          <MediaPreview
            media={mapMediaResponseToMedia(post.media[0])}
            className="w-full h-full"
            showLightbox={false}
          />
        </div>
      )}
      <div className="p-3 space-y-1">
        {post.description && (
          <p className="text-label-14 leading-6 text-[var(--ds-gray-1000)]">
            <span className="font-semibold">{username}</span>{" "}
            <span>{post.description}</span>
          </p>
        )}
        <p className="text-copy-12 uppercase tracking-wide text-[var(--ds-gray-900)]">
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
    <div className={previewCardClassName}>
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
          <p className="line-clamp-2 text-label-14 leading-6 text-[var(--ds-gray-1000)]">
            {post.description}
          </p>
          <p className="mt-0.5 text-copy-12 text-[var(--ds-gray-900)]">
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
    <div className={previewCardClassName}>
      <div className="flex items-center gap-2.5 p-3">
        <ProfileAvatar
          src={src}
          username={username}
          fallbackClass="bg-[hsl(var(--accent))]"
        />
        <div>
          <p className="text-label-14 text-[var(--ds-gray-1000)]">{username}</p>
          <p className="text-copy-12 text-[var(--ds-gray-900)]">Just now · 🌐</p>
        </div>
      </div>
      {post.description && (
        <p className="px-3 pb-2 text-label-14 leading-6 text-[var(--ds-gray-1000)]">
          {post.description}
        </p>
      )}
      {post.media?.[0] && (
        <div className="aspect-video bg-[var(--ds-gray-100)]">
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
    <div className={previewCardClassName}>
      <div className="flex items-start gap-2.5 p-3">
        <ProfileAvatar
          src={src}
          username={username}
          size="lg"
          fallbackClass="bg-[hsl(var(--accent))]"
        />
        <div className="flex-1 min-w-0">
          <p className="text-label-14 text-[var(--ds-gray-1000)]">{username}</p>
          <p className="text-copy-12 text-[var(--ds-gray-900)]">
            1st · Just now · 🌐
          </p>
        </div>
        <button
          type="button"
          className={cn(
            "shrink-0 rounded-full border border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] px-3 py-1 text-copy-12 text-[var(--ds-plum-700)]",
            focusRingClassName
          )}
        >
          + Follow
        </button>
      </div>
      {post.description && (
        <p className="line-clamp-4 px-3 pb-2 text-label-14 leading-6 text-[var(--ds-gray-1000)]">
          {post.description}
        </p>
      )}
      {post.media?.[0] && (
        <div className="aspect-video bg-[var(--ds-gray-100)]">
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
    <div className={previewCardClassName}>
      <div className="p-3 flex gap-2.5">
        <ProfileAvatar
          src={src}
          username={username}
          size="lg"
          fallbackClass="bg-neutral-800"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-label-14 text-[var(--ds-gray-1000)]">{username}</p>
            <p className="text-copy-12 text-[var(--ds-gray-900)]">· Just now</p>
          </div>
          {post.description && (
            <p className="mb-2 whitespace-pre-wrap text-label-14 leading-6 text-[var(--ds-gray-1000)]">
              {post.description}
            </p>
          )}
          {post.media?.[0] && (
            <div className="aspect-video overflow-hidden rounded-xl border border-[var(--ds-gray-400)]">
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
    className: "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]",
    barClass: "from-[var(--ds-plum-400)] to-[hsl(var(--accent))]",
  },
  PUBLISHED: {
    label: "Published",
    Icon: CheckCircle2,
    className: "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
    barClass: "from-[var(--ds-green-400)] to-[var(--ds-green-600)]",
  },
  FAILED: {
    label: "Failed",
    Icon: XCircle,
    className: "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
    barClass: "from-[var(--ds-red-400)] to-[var(--ds-red-600)]",
  },
};

const platformMeta: Record<
  string,
  { name: string; iconColor: string; headerBg: string }
> = {
  YOUTUBE: {
    name: "YouTube",
    iconColor: "border-[#FF0000]/20 bg-[#FF0000]/10 text-[#FF0000]",
    headerBg: "from-[#FF0000]/8 via-[var(--ds-background-100)] to-[var(--ds-background-100)]",
  },
  INSTAGRAM: {
    name: "Instagram",
    iconColor: "border-[#C13584]/20 bg-[#C13584]/10 text-[#A62E69]",
    headerBg: "from-[#C13584]/8 via-[var(--ds-background-100)] to-[var(--ds-background-100)]",
  },
  FACEBOOK: {
    name: "Facebook",
    iconColor: "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]",
    headerBg: "from-[var(--ds-plum-100)] via-[var(--ds-background-100)] to-[var(--ds-background-100)]",
  },
  LINKEDIN: {
    name: "LinkedIn",
    iconColor: "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]",
    headerBg: "from-[var(--ds-plum-100)] via-[var(--ds-background-100)] to-[var(--ds-background-100)]",
  },
  X: {
    name: "X (Twitter)",
    iconColor: "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
    headerBg: "from-[var(--ds-gray-100)] via-[var(--ds-background-100)] to-[var(--ds-background-100)]",
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

  if (loading) {
    return <PostDetailPageSkeleton />;
  }

  if (!post || error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--ds-background-200)] p-6">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--ds-red-200)] bg-[var(--ds-red-100)]">
            <AlertCircle className="h-7 w-7 text-[var(--ds-red-700)]" />
          </div>
          <h3 className="mb-1 text-title-18 text-[var(--ds-gray-1000)]">Post not found</h3>
          <p className="mb-6 text-label-14 leading-6 text-[var(--ds-gray-900)]">
            This post couldn&apos;t be loaded or no longer exists.
          </p>
          <button
            onClick={() => router.back()}
            className={cn(
              actionButtonClassName,
              "border-transparent bg-[hsl(var(--accent))] !text-white hover:bg-[hsl(var(--accent-hover))]",
              focusRingClassName
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </main>
    );
  }

  const Icon = PLATFORM_ICONS[post.provider];
  const meta = platformMeta[post.provider];
  const status = statusConfig[post.postStatus] ?? statusConfig.SCHEDULED;
  const StatusIcon = status.Icon;
  const scheduled = new Date(post.scheduledTime ?? "");
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
  const extraMedia = hasMedia && post.media.length > 1 ? post.media.slice(1) : [];

  return (
    <main className="min-h-screen bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)]">
      <ProtectedPageHeader
        title={post.description}
        description="Post preview and platform-specific details."
        icon={<Layers className="h-4 w-4" />}
        actions={
          <ToneBadge className={cn("shrink-0", status.className)}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </ToneBadge>
        }
      />

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-3 sm:px-6">
        <nav className="flex min-w-0 items-center gap-1.5 text-label-14">
          <button
            onClick={() => router.push("/scheduled-posts")}
            className={cn(
              "flex shrink-0 items-center gap-1.5 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]",
              focusRingClassName
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-medium">
              Scheduled Posts
            </span>
          </button>

          {post.postCollectionId && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--ds-gray-700)]" />
              <button
                onClick={() =>
                  router.push(`/scheduled-posts/${post.postCollectionId}`)
                }
                className={cn(
                  "hidden shrink-0 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)] sm:block",
                  focusRingClassName
                )}
              >
                Collection
              </button>
            </>
          )}

          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--ds-gray-700)]" />
          <span className="truncate text-label-14 text-[var(--ds-gray-1000)]">
            {post.description}
          </span>
        </nav>
      </div>

      {/* Page Body */}
      <div className="px-4 py-6 sm:px-5">
        <div className="grid gap-5 lg:grid-cols-5">

          {/* ── Left: Preview ── */}
          <div className="space-y-4 lg:col-span-3">

            {/* Platform preview — hero */}
            <div className={cn(surfaceClassName, "overflow-hidden")}>
              <div className={cn("h-0.5 w-full bg-gradient-to-r", status.barClass)} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {Icon && (
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-lg border",
                          meta?.iconColor
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <h2 className="text-label-14 text-[var(--ds-gray-1000)]">
                      {meta?.name ?? post.provider} Preview
                    </h2>
                  </div>
                  <ToneBadge className="border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
                    Approximate
                  </ToneBadge>
                </div>

                {preview ? (
                  <div
                    className={cn(
                      "rounded-xl border border-[var(--ds-gray-400)] bg-gradient-to-br p-4",
                      meta?.headerBg ?? "from-[var(--ds-gray-100)] to-[var(--ds-background-100)]"
                    )}
                  >
                    {preview}
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 shrink-0 rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-200)]" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 w-32 rounded bg-[var(--ds-gray-300)]" />
                        <div className="h-3 w-20 rounded bg-[var(--ds-gray-300)]" />
                      </div>
                    </div>
                    <div className="space-y-2.5 mb-4">
                      {[100, 88, 72].map((w, i) => (
                        <div key={i} className="h-3 rounded bg-[var(--ds-gray-300)]" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                    <div className="aspect-video rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-200)]" />
                    <p className="mt-4 text-center text-copy-12 italic text-[var(--ds-gray-900)]">
                      Preview not available for this platform
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Caption — compact, below preview */}
            {post.description && (
              <div className={cn(surfaceClassName, "p-4")}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                    <FileText className="h-4 w-4 text-[var(--ds-gray-900)]" />
                  </div>
                  <h2 className="text-label-14 text-[var(--ds-gray-1000)]">Caption</h2>
                </div>
                <p className="whitespace-pre-wrap text-label-14 leading-6 text-[var(--ds-gray-1000)]">
                  {post.description}
                </p>
              </div>
            )}

            {/* Extra media files (beyond the first, which is shown in preview) */}
            {extraMedia.length > 0 && (
              <div className={cn(surfaceClassName, "p-4")}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                    <FileImage className="h-4 w-4 text-[var(--ds-gray-900)]" />
                  </div>
                  <h2 className="text-label-14 text-[var(--ds-gray-1000)]">
                    Additional Media
                  </h2>
                  <ToneBadge className="ml-auto border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
                    {extraMedia.length} {extraMedia.length === 1 ? "file" : "files"}
                  </ToneBadge>
                </div>
                <div
                  className={cn(
                    "grid gap-3",
                    extraMedia.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
                  )}
                >
                  {extraMedia.map((m, i) => (
                    <div
                      key={m.id ?? i}
                      className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] shadow-sm transition-shadow hover:shadow-md"
                    >
                      <MediaPreview
                        media={mapMediaResponseToMedia(m)}
                        className="w-full aspect-square"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Account card — top of sidebar */}
            {post.connectedAccount && (
              <div className={cn(surfaceClassName, "p-5")}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                    <User className="h-4 w-4 text-[var(--ds-gray-900)]" />
                  </div>
                  <h3 className="text-label-14 text-[var(--ds-gray-1000)]">
                    Scheduled For
                  </h3>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[var(--ds-gray-400)] shadow-sm">
                    {profileImageSrc ? (
                      <Image
                        src={profileImageSrc}
                        alt={post.connectedAccount.username}
                        fill
                        sizes="3rem"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--ds-gray-200)] to-[var(--ds-gray-100)]">
                        <User className="h-5 w-5 text-[var(--ds-gray-900)]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">
                      {post.connectedAccount.username}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {Icon && (
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded border",
                            meta?.iconColor
                          )}
                        >
                          <Icon className="h-2.5 w-2.5" />
                        </div>
                      )}
                      <p className="text-copy-12 text-[var(--ds-gray-900)]">
                        {meta?.name ?? post.provider}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule card */}
            <div className={cn(surfaceClassName, "p-5")}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)]">
                  <Calendar className="h-4 w-4 text-[var(--ds-plum-700)]" />
                </div>
                <h3 className="text-label-14 text-[var(--ds-gray-1000)]">
                  Schedule
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-copy-12 font-semibold uppercase tracking-[0.08em] text-[var(--ds-gray-900)]">
                    Date &amp; Time
                  </p>
                  <p className="text-label-14 text-[var(--ds-gray-1000)]">
                    {formattedDate}
                  </p>
                  <p className="text-label-14 text-[var(--ds-gray-900)]">{formattedTime}</p>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-2">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--ds-gray-900)]" />
                  <span className="text-copy-12 text-[var(--ds-gray-900)]">
                    {isPast ? "Published" : "Publishes"} {relativeLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Post stats card */}
            <div className={cn(surfaceClassName, "p-5")}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                  <FileText className="h-4 w-4 text-[var(--ds-gray-900)]" />
                </div>
                <h3 className="text-label-14 text-[var(--ds-gray-1000)]">
                  Post Details
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--ds-gray-400)] py-2">
                  <span className="text-copy-12 text-[var(--ds-gray-900)]">
                    Platform
                  </span>
                  <span className="text-copy-12 font-semibold text-[var(--ds-gray-1000)]">
                    {meta?.name ?? post.provider}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--ds-gray-400)] py-2">
                  <span className="text-copy-12 text-[var(--ds-gray-900)]">
                    Media files
                  </span>
                  <span className="text-copy-12 font-semibold tabular-nums text-[var(--ds-gray-1000)]">
                    {post.media?.length ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-copy-12 text-[var(--ds-gray-900)]">
                    Status
                  </span>
                  <ToneBadge className={status.className}>
                    <StatusIcon className="h-2.5 w-2.5" />
                    {status.label}
                  </ToneBadge>
                </div>
              </div>
            </div>

            {/* Collection link */}
            {post.postCollectionId && (
              <button
                onClick={() =>
                  router.push(`/scheduled-posts/${post.postCollectionId}`)
                }
                className={cn(
                  "group w-full p-5 text-left transition-all hover:border-[var(--ds-plum-300)] hover:shadow-md",
                  surfaceClassName,
                  focusRingClassName
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] transition-colors group-hover:border-[var(--ds-plum-200)] group-hover:bg-[var(--ds-plum-100)]">
                    <Layers className="h-4 w-4 text-[var(--ds-gray-900)] transition-colors group-hover:text-[var(--ds-plum-700)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-14 text-[var(--ds-gray-1000)] transition-colors group-hover:text-[var(--ds-plum-700)]">
                      View Collection
                    </p>
                    <p className="text-copy-12 text-[var(--ds-gray-900)]">
                      See all posts in this campaign
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-[var(--ds-gray-700)] transition-colors group-hover:text-[var(--ds-plum-700)]" />
                </div>
              </button>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

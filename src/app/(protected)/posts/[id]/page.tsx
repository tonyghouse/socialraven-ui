"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Trash2,
  Clock,
  Calendar,
} from "lucide-react";
import Image from "next/image";

import type { PostResponse } from "@/model/PostResponse";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { MediaPreview } from "@/components/generic/media-preview";
import { cn } from "@/lib/utils";
import { fetchPostByIdApi } from "@/service/getPost";
import { deletePostByIdApi } from "@/service/deletePostByIdApi";
import { mapMediaResponseToMedia } from "@/lib/media-mapper";

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  const needsProxy = ["linkedin.com", "licdn.com"];
  const requiresProxy = needsProxy.some((d) => url.includes(d));
  return requiresProxy ? `/api/proxy-image?url=${encodeURIComponent(url)}` : url;
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

// Platform-specific preview components
function InstagramPreview({ post }: { post: PostResponse }) {
  const profileImageSrc = getImageUrl(post.connectedAccount?.profilePicLink);
  
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden max-w-md mx-auto">
      <div className="p-3 border-b border-border/40 flex items-center gap-3">
        <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 overflow-hidden flex items-center justify-center text-white text-xs font-semibold">
          {profileImageSrc && (
            <Image src={profileImageSrc} alt="Profile" fill className="object-cover" />
          )}
          {!profileImageSrc && getInitials(post.connectedAccount?.username || "User")}
        </div>
        <p className="text-sm font-semibold text-card-foreground">
          {post.connectedAccount?.username || "username"}
        </p>
      </div>
      
      {post.media?.[0] && (
        <div className="aspect-square bg-muted relative">
          <MediaPreview
            media={mapMediaResponseToMedia(post.media[0])}
            className="w-full h-full"
            showLightbox={false}
          />
        </div>
      )}
      
      <div className="p-3">
        <p className="text-sm text-card-foreground leading-relaxed">
          <span className="font-semibold">{post.connectedAccount?.username || "username"}</span>{" "}
          {post.description}
        </p>
      </div>
    </div>
  );
}

function YouTubePreview({ post }: { post: PostResponse }) {
  const profileImageSrc = getImageUrl(post.connectedAccount?.profilePicLink);
  
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden max-w-2xl mx-auto">
      {post.media?.[0] && (
        <div className="aspect-video bg-black relative rounded-t-2xl overflow-hidden">
          <MediaPreview
            media={mapMediaResponseToMedia(post.media[0])}
            className="w-full h-full"
            showLightbox={false}
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-base font-semibold text-card-foreground mb-3 line-clamp-2 leading-snug">
          {post.title}
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full bg-red-600 overflow-hidden flex items-center justify-center text-white text-xs font-semibold">
            {profileImageSrc && (
              <Image src={profileImageSrc} alt="Profile" fill className="object-cover" />
            )}
            {!profileImageSrc && getInitials(post.connectedAccount?.username || "Channel")}
          </div>
          <div>
            <p className="text-sm font-medium text-card-foreground">
              {post.connectedAccount?.username || "Channel Name"}
            </p>
            <p className="text-xs text-muted-foreground">Just now</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FacebookPreview({ post }: { post: PostResponse }) {
  const profileImageSrc = getImageUrl(post.connectedAccount?.profilePicLink);
  
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden max-w-xl mx-auto">
      <div className="p-4 flex items-center gap-3">
        <div className="relative h-10 w-10 rounded-full bg-blue-600 overflow-hidden flex items-center justify-center text-white text-xs font-semibold">
          {profileImageSrc && (
            <Image src={profileImageSrc} alt="Profile" fill className="object-cover" />
          )}
          {!profileImageSrc && getInitials(post.connectedAccount?.username || "Page")}
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground">
            {post.connectedAccount?.username || "Page Name"}
          </p>
          <p className="text-xs text-muted-foreground">Just now · 🌐</p>
        </div>
      </div>
      
      {post.description && (
        <div className="px-4 pb-3">
          <p className="text-sm text-card-foreground leading-relaxed">{post.description}</p>
        </div>
      )}
      
      {post.media?.[0] && (
        <div className="bg-muted relative">
          <MediaPreview
            media={mapMediaResponseToMedia(post.media[0])}
            className="w-full aspect-video"
            showLightbox={false}
          />
        </div>
      )}
    </div>
  );
}

function LinkedInPreview({ post }: { post: PostResponse }) {
  const profileImageSrc = getImageUrl(post.connectedAccount?.profilePicLink);
  
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden max-w-xl mx-auto">
      <div className="p-4 flex items-center gap-3">
        <div className="relative h-12 w-12 rounded-full bg-sky-600 overflow-hidden flex items-center justify-center text-white text-xs font-semibold">
          {profileImageSrc && (
            <Image src={profileImageSrc} alt="Profile" fill className="object-cover" />
          )}
          {!profileImageSrc && getInitials(post.connectedAccount?.username || "Professional")}
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground">
            {post.connectedAccount?.username || "Professional Name"}
          </p>
          <p className="text-xs text-muted-foreground">1h • 🌐</p>
        </div>
      </div>
      
      {post.description && (
        <div className="px-4 pb-3">
          <p className="text-sm text-card-foreground leading-relaxed">{post.description}</p>
        </div>
      )}
      
      {post.media?.[0] && (
        <div className="bg-muted relative">
          <MediaPreview
            media={mapMediaResponseToMedia(post.media[0])}
            className="w-full aspect-video"
            showLightbox={false}
          />
        </div>
      )}
    </div>
  );
}

function XPreview({ post }: { post: PostResponse }) {
  const profileImageSrc = getImageUrl(post.connectedAccount?.profilePicLink);
  
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden max-w-xl mx-auto">
      <div className="p-4">
        <div className="flex gap-3">
          <div className="relative h-12 w-12 rounded-full bg-neutral-800 overflow-hidden flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold">
            {profileImageSrc && (
              <Image src={profileImageSrc} alt="Profile" fill className="object-cover" />
            )}
            {!profileImageSrc && getInitials(post.connectedAccount?.username || "User")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-bold text-card-foreground">
                {post.connectedAccount?.username || "Username"}
              </p>
              <p className="text-sm text-muted-foreground">@handle · 1h</p>
            </div>
            
            {post.description && (
              <p className="text-sm text-card-foreground mb-3 whitespace-pre-wrap leading-relaxed">
                {post.description}
              </p>
            )}
            
            {post.media?.[0] && (
              <div className="rounded-xl border border-border/40 overflow-hidden">
                <MediaPreview
                  media={mapMediaResponseToMedia(post.media[0])}
                  className="w-full aspect-video"
                  showLightbox={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getToken } = useAuth();
  const postId = params.id as string;

  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (!confirm("Delete this post? This action cannot be undone.")) return;
    setIsDeleting(true);

    try {
      await deletePostByIdApi(getToken, postId);
      router.back();
    } finally {
      setIsDeleting(false);
    }
  };

  const platformIconColor: Record<string, string> = {
    YOUTUBE: "text-red-600 bg-red-50 border-red-100",
    INSTAGRAM: "text-pink-600 bg-pink-50 border-pink-100",
    FACEBOOK: "text-blue-600 bg-blue-50 border-blue-100",
    LINKEDIN: "text-sky-600 bg-sky-50 border-sky-100",
    X: "text-neutral-800 bg-neutral-50 border-neutral-100",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full rounded-2xl bg-white shadow-sm border border-border/60 p-6">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-card-foreground mb-1">Failed to load post</p>
              <p className="text-sm text-muted-foreground mb-4">
                The post you&apos;re looking for couldn&apos;t be found.
              </p>
              <button
                onClick={() => router.back()}
                className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Icon = PLATFORM_ICONS[post.provider];
  const scheduled = new Date(post.scheduledTime);
  const profileImageSrc = getImageUrl(post.connectedAccount?.profilePicLink);

  const renderPlatformPreview = () => {
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

  return (
    <main className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 transition-all disabled:opacity-50 active:scale-95"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-border/60 overflow-hidden p-8">
              <div className="flex items-start gap-6 mb-6">
                {Icon && (
                  <div 
                    className={cn(
                      "h-16 w-16 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-sm",
                      platformIconColor[post.provider] || "bg-muted/50 border-border/60"
                    )}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-semibold text-card-foreground mb-2 tracking-tight leading-tight">
                    {post.title}
                  </h1>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-muted-foreground capitalize">
                      {post.provider}
                    </p>
                    {post.connectedAccount && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {post.connectedAccount.username}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {post.description && (
                <>
                  <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-6" />
                  <div>
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Description
                    </h2>
                    <p className="text-base text-card-foreground leading-relaxed whitespace-pre-wrap">
                      {post.description}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Media Section */}
            {post.media && post.media.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-border/60 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-card-foreground">
                    Media Files
                  </h2>
                  <span className="ml-auto text-sm font-medium text-muted-foreground">
                    {post.media.length} {post.media.length === 1 ? "file" : "files"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {post.media.map((m, i) => (
                    <div key={m.id ?? i} className="rounded-2xl overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow">
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

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Schedule Info */}
            <div className="bg-white rounded-3xl shadow-sm border border-border/60 p-6 lg:sticky lg:top-24">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Scheduled For
                  </p>
                  <p className="text-lg font-semibold text-card-foreground leading-snug">
                    {scheduled.toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {scheduled.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-6" />

              {/* Platform Preview Section */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">
                  Platform Preview
                </p>
                <div className="bg-gradient-to-br from-muted/30 to-muted/50 rounded-2xl p-4 border border-border/40">
                  {renderPlatformPreview()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
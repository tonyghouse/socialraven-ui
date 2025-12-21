"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Calendar,
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  FileText,
  Edit,
  Trash2,
  Clock,
} from "lucide-react";
import type { PostResponse } from "@/model/PostResponse";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { MediaPreview } from "@/components/generic/media-preview";
import { cn } from "@/lib/utils";
import { fetchPostByIdApi } from "@/service/getPost";
import { deletePostByIdApi } from "@/service/deletePostByIdApi";
import { mapMediaResponseToMedia } from "@/lib/media-mapper";

// You'll need to create this API function
// import { fetchPostByIdApi, deletePostApi } from "@/service/posts";

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
    const loadPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchPostByIdApi(getToken, postId);
        setPost(data);
      } catch (e) {
        console.error("Error fetching post", e);
        setError("Unable to load post details.");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId, getToken]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this scheduled post?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePostByIdApi(getToken, postId);
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/scheduled-posts"); // fallback default
      }
    } catch (e) {
      console.error("Error deleting post", e);
      alert("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading post details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <div className="flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-1">Error</h3>
                <p className="text-sm text-destructive/90">{error}</p>
                <button
                  onClick={() => router.push("/scheduled-posts")}
                  className="mt-4 text-sm underline hover:no-underline"
                >
                  Return to scheduled posts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Icon = PLATFORM_ICONS[post.provider] || null;
  const localDate = new Date(post.scheduledTime);

  const statusColors: Record<string, string> = {
    SCHEDULED:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
    DRAFT: "bg-muted text-muted-foreground border-border",
    PUBLISHED:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900",
    FAILED: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <main className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-muted-foreground 
                hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/posts/${postId}/edit`)}
                className="h-9 px-4 rounded-lg bg-secondary hover:bg-secondary/80 
                  text-sm font-medium transition-all flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-9 px-4 rounded-lg bg-destructive/10 hover:bg-destructive/20 
                  text-destructive text-sm font-medium transition-all flex items-center gap-2
                  disabled:opacity-50"
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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Post Header */}
          <div className="p-6 sm:p-8 border-b border-border">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {Icon && (
                  <div
                    className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 
                    flex items-center justify-center flex-shrink-0"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                )}

                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    {post.title}
                  </h1>
                  <p className="text-sm text-muted-foreground capitalize">
                    {post.provider}
                  </p>
                </div>
              </div>

              <span
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold border",
                  statusColors[post.postStatus] || statusColors.DRAFT
                )}
              >
                {post.postStatus}
              </span>
            </div>

            {/* Scheduled Time */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <Clock className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Scheduled for
                </p>
                <time
                  dateTime={localDate.toISOString()}
                  className="text-sm font-semibold text-foreground"
                >
                  {localDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {localDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </time>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6 sm:p-8">
            {post.description && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-foreground mb-3">
                  Description
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>
            )}

            {/* Connected Accounts */}
            {post.connectedAccounts && post.connectedAccounts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Connected Accounts ({post.connectedAccounts.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {post.connectedAccounts.map((acc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border 
                        bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <img
                        src={acc.profilePicLink || "/default-avatar.png"}
                        alt={acc.username}
                        className="h-10 w-10 rounded-full object-cover border-2 border-background shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {acc.username}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {acc.platform}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Media ({post.media.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {post.media.map((m, i) => (
                    <MediaPreview
                      className="h-32"
                      key={m.id ?? i}
                      media={mapMediaResponseToMedia(m)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

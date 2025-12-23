"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  FileText,
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
import AccountDetail from "@/components/posts/AccountDetail";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!post || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <div className="w-full rounded-2xl bg-white shadow-sm border border-zinc-200 p-6">
          <div className="flex gap-4">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-zinc-900 mb-1">Failed to load post</p>
              <p className="text-sm text-zinc-600 mb-4">The post you&apos;re looking for couldn&apos;t be found.</p>
              <button
                onClick={() => router.back()}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
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

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
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
      </header>

      {/* Content */}
      <div className="w-full mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
          
          {/* Header Section */}
          <div className="px-8 pt-8 pb-6 border-b border-zinc-100">
            <div className="flex items-start gap-4">
              {Icon && (
                <div className="h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-7 w-7 text-zinc-700" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-semibold text-zinc-900 mb-1 tracking-tight">
                  {post.title}
                </h1>
                <p className="text-sm font-medium text-zinc-500 capitalize">
                  {post.provider}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {post.description && (
            <div className="px-8 py-6 border-b border-zinc-100">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Description
              </h2>
              <p className="text-base text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {post.description}
              </p>
            </div>
          )}

          {/* Media */}
          {post.media?.length > 0 && (
            <div className="px-8 py-6 border-b border-zinc-100">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Media ({post.media.length})
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {post.media.map((m, i) => (
                  <MediaPreview
                    key={m.id ?? i}
                    media={mapMediaResponseToMedia(m)}
                    className="h-32 rounded-xl overflow-hidden"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Accounts */}
          {post.connectedAccounts?.length > 0 && (
            <div className="px-8 py-6 border-b border-zinc-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Connected Accounts
                </h2>
                <span className="text-xs font-medium text-zinc-400">
                  {post.connectedAccounts.length}
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                {post.connectedAccounts.map((acc) => (
                  <AccountDetail key={acc.providerUserId} acc={acc} />
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Time */}
          <div className="px-8 py-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Scheduled For
                </p>
                <p className="text-base font-medium text-zinc-900">
                  {scheduled.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-zinc-600 mt-0.5">
                  {scheduled.toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
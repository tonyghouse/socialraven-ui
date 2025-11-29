"use client";

import { useEffect, useState } from "react";
import { fetchScheduledPostsApi } from "@/service/posts";
import type { PostResponse } from "@/model/PostResponse";

import { useAuth } from "@clerk/nextjs";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { PublishedPostCard } from "@/components/published-posts/published-post-card";

export default function PublishedPostsPage() {
  const { getToken } = useAuth();

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetchScheduledPostsApi(getToken, page, "POSTED");

      setPosts(prev => [...prev, ...res.content]);

      if (res.last) setHasMore(false);
      else setPage(prev => prev + 1);
    } catch (e) {
      console.error("Error fetching published posts", e);
      setError("Failed to load published posts. Please try again.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <main className="min-h-screen bg-background">

      {/* HEADER — Apple minimal bar */}
      <div className="
        sticky top-0 z-40
        bg-white/60 backdrop-blur-xl 
        border-b border-border/40
      ">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-200/50">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>

          <div>
            <h1 className="text-[1.55rem] font-semibold text-foreground tracking-tight">
              Published Posts
            </h1>
            <p className="text-xs text-muted-foreground">
              {posts.length} published
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-5 py-6">

        {/* Error Box */}
        {error && (
          <div className="
            mb-5 px-4 py-3 rounded-xl
            bg-red-50 border border-red-200/70 
            flex items-center gap-3
          ">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* POSTS */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {posts.map(post => (
                <PublishedPostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={loadPosts}
                  disabled={loading}
                  className="
                    px-5 py-2.5 rounded-full
                    bg-foreground/90 text-white 
                    hover:bg-foreground 
                    disabled:bg-muted disabled:text-muted-foreground
                    transition-all
                    flex items-center gap-2 text-sm font-medium
                  "
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-3 rounded-full bg-muted/40 border border-border/50 mb-3">
              <CheckCircle2 className="w-7 h-7 text-muted-foreground" />
            </div>

            <h3 className="text-base font-medium text-foreground mb-1">
              No published posts yet
            </h3>

            <p className="text-sm text-muted-foreground text-center max-w-xs">
              When you publish posts, they will appear here with details and media previews.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

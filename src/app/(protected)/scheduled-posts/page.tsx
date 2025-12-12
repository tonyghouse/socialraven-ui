"use client";

import { useEffect, useState } from "react";
import { fetchScheduledPostsApi } from "@/service/posts";
import type { PostResponse } from "@/model/PostResponse";

import { useAuth } from "@clerk/nextjs";
import { Calendar, Loader2, AlertCircle } from "lucide-react";
import { ScheduledPostCard } from "@/components/scheduled-posts/scheduled-post-card";

export default function ScheduledPostsPage() {
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
      const res = await fetchScheduledPostsApi(getToken, page, "SCHEDULED");

      setPosts((prev) => [...prev, ...res.content]);

      if (res.last) setHasMore(false);
      else setPage((prev) => prev + 1);
    } catch (e) {
      console.error("Error fetching scheduled posts", e);
      setError("Unable to load scheduled posts.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Scheduled Posts
              </h1>

              <p className="text-sm text-muted-foreground">
                {posts.length} post{posts.length !== 1 ? "s" : ""} scheduled
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <ScheduledPostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadPosts}
                  disabled={loading}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground 
                    hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground
                    transition-all shadow-sm flex items-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
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
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-1">No scheduled posts yet</h3>

            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Your scheduled posts will appear here. Start planning your content!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
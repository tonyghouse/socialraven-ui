"use client";

import { useEffect, useState } from "react";
import { fetchScheduledPostsApi } from "@/service/posts";
import { PostResponse } from "@/model/PostResponse";
import { ScheduledPostCard } from "@/components/scheduled-posts/scheduled-post-card";
import { useAuth } from "@clerk/nextjs";

export default function ScheduledPostsPage() {
  const { getToken } = useAuth();

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await fetchScheduledPostsApi(getToken, page, "SCHEDULED");

      setPosts(prev => [...prev, ...res.content]);

      if (res.last) setHasMore(false);
      else setPage(prev => prev + 1);

    } catch (e) {
      console.error("Error fetching posts", e);
    }

    setLoading(false);
  };

  // initial load
  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Scheduled Posts</h1>

      {/* Posts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {posts.map(post => (
          <ScheduledPostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadPosts}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No scheduled posts found.
        </p>
      )}
    </div>
  );
}

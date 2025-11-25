"use client"

import { useEffect, useState } from "react"
import { fetchScheduledPostsApi } from "@/service/posts"
import type { PostResponse } from "@/model/PostResponse"

import { useAuth } from "@clerk/nextjs"
import { Calendar, Loader2, AlertCircle } from "lucide-react"
import { ScheduledPostCard } from "@/components/scheduled-posts/scheduled-post-card"

export default function ScheduledPostsPage() {
  const { getToken } = useAuth()

  const [posts, setPosts] = useState<PostResponse[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPosts = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetchScheduledPostsApi(getToken, page, "SCHEDULED")

      setPosts((prev) => [...prev, ...res.content])

      if (res.last) setHasMore(false)
      else setPage((prev) => prev + 1)
    } catch (e) {
      console.error("Error fetching posts", e)
      setError("Failed to load posts. Please try again.")
    }

    setLoading(false)
  }

  // initial load
  useEffect(() => {
    loadPosts()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Scheduled Posts</h1>
              <p className="text-sm text-muted-foreground">
                {posts.length} post{posts.length !== 1 ? "s" : ""} planned
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
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

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={loadPosts}
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Posts"
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-3 rounded-full bg-muted/50 mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No scheduled posts yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Your scheduled posts will appear here. Start by creating your first scheduled post!
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

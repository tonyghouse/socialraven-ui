"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Twitter, Linkedin, Facebook, Instagram, Trash2, Clock, CheckCircle } from "lucide-react"
import Image from "next/image";
interface ScheduledPost {
  id: string
  content: string
  scheduledTime: string
  platforms: string[]
  media?: string
  mediaName?: string
  status: "scheduled" | "published"
}

interface ScheduledPostsListProps {
  posts: ScheduledPost[]
  onDelete: (id: string) => void
}

const platformIcons: Record<string, React.ComponentType<any>> = {
  Twitter,
  LinkedIn: Linkedin,
  Facebook,
  Instagram,
}

export default function ScheduledPostsList({ posts, onDelete }: ScheduledPostsListProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isPublished = (scheduledTime: string) => {
    return new Date(scheduledTime) < new Date()
  }

  if (posts.length === 0) {
    return (
      <Card className="p-12 text-center border border-border bg-card">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-muted rounded-full">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">No scheduled posts yet</h3>
        <p className="text-muted-foreground">Schedule your first post to get started</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Upcoming Posts</h2>
      {posts.map((post) => {
        const published = isPublished(post.scheduledTime)

        return (
          <Card key={post.id} className="p-6 border border-border bg-card hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Header with platforms and status */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {post.platforms.map((platform) => {
                      const PlatformIcon = platformIcons[platform] || Twitter
                      return (
                        <div key={platform} className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg">
                          <PlatformIcon className="w-4 h-4 text-primary" />
                          <span className="text-xs font-semibold text-primary">{platform}</span>
                        </div>
                      )
                    })}
                    {published && (
                      <div className="flex items-center gap-1 ml-auto">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-green-600">Published</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <Button
                  onClick={() => onDelete(post.id)}
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>

              {post.media && (
                <div className="mb-3">
                  {post.mediaName?.startsWith("blob:") || !post.mediaName ? null : (
                    <>
                      {post.mediaName?.includes("image") || post.media.includes("data:image") ? (
                        <Image
                          src={post.media || "/placeholder.svg"}
                          alt="Post media"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      ) : (
                        <video src={post.media} className="w-full h-40 object-cover rounded-lg" controls />
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Content */}
              <p className="text-foreground leading-relaxed">{post.content}</p>

              {/* Scheduled Time */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatDate(post.scheduledTime)}</span>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

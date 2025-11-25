import { format } from "date-fns"
import { Calendar, User, FileText } from "lucide-react"


import type { PostResponse } from "@/model/PostResponse"
import { cn } from "@/lib/utils"
import { MediaPreview } from "./media-preview"
import { PLATFORM_ICONS } from "../platform-icons"

interface ScheduledPostCardProps {
  post: PostResponse
}

export function ScheduledPostCard({ post }: ScheduledPostCardProps) {
  const Icon = PLATFORM_ICONS[post.provider] || null

  const statusColors = {
    SCHEDULED: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    DRAFT: "bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800",
    PUBLISHED:
      "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    FAILED: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  }

  const scheduledDate = new Date(post.scheduledTime)
  const formattedDate = format(scheduledDate, "MMM dd, yyyy")
  const formattedTime = format(scheduledDate, "HH:mm")

  return (
    <div className="group bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-card">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">{post.provider}</p>
              <p className="text-xs text-muted-foreground">{post.userNames.join(", ")}</p>
            </div>
          </div>
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium border",
              statusColors[post.postStatus as keyof typeof statusColors] || statusColors.DRAFT,
            )}
          >
            {post.postStatus}
          </span>
        </div>

        {/* Scheduling Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {formattedDate} at {formattedTime}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-sm text-foreground/70 line-clamp-3 mb-4">{post.description}</p>

        {/* Media Gallery */}
        {post.media && post.media.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Media ({post.media.length})</span>
            </div>
            <div className="flex flex-wrap gap-2 overflow-y-auto max-h-48">
              {post.media.map((m, idx) => (
                <MediaPreview key={`${m.fileKey}-${idx}`} media={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/50 bg-card/50 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          <span>
            {post.userNames.length} account{post.userNames.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
      </div>
    </div>
  )
}

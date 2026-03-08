"use client";

import { useRouter } from "next/navigation";
import { Calendar, User, FileText, ArrowRight } from "lucide-react";
import { PLATFORM_ICONS } from "../generic/platform-icons";
import { MediaPreview } from "../generic/media-preview";
import { cn } from "@/lib/utils";
import type { PostResponse } from "@/model/PostResponse";
import { mapMediaResponseToMedia } from "@/lib/media-mapper";
import Image from "next/image";

export function ScheduledPostCard({ post }: { post: PostResponse }) {
  const router = useRouter();
  const Icon = PLATFORM_ICONS[post.provider] || null;

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
    DRAFT: "bg-muted text-muted-foreground border-border",
    PUBLISHED: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900",
    FAILED: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const localDate = new Date(post.scheduledTime);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(localDate);

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(localDate);

  const finalDateTime = `${formattedDate} · ${formattedTime}`;

  const handleCardClick = () => {
    router.push(`/posts/${post.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${post.title}`}
      className="group rounded-xl bg-card border border-border shadow-sm 
        hover:shadow-lg hover:border-primary/30 hover:-translate-y-1
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Header */}
      <div className="p-5 border-b border-border flex flex-col gap-4 bg-card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {Icon && (
              <span className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-card-foreground capitalize mb-1.5">
                {post.provider}
              </p>

            </div>
          </div>

          {/* Status Badge */}
          <span 
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap flex-shrink-0",
              statusColors[post.postStatus] || statusColors.DRAFT
            )}
          >
            {post.postStatus}
          </span>
        </div>

        {/* Scheduled Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <time dateTime={localDate.toISOString()}>{finalDateTime}</time>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-card-foreground mb-2 line-clamp-2 
          group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        {post.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {post.description}
          </p>
        )}

        {/* Media Preview */}
        {post.media && post.media.length > 0 && (
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {post.media.length} media file{post.media.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-32 overflow-hidden">
              {post.media.slice(0, 3).map((m, i) => (
                 <MediaPreview
    key={m.id ?? i}
    media={mapMediaResponseToMedia(m)}
  />
              ))}
              {post.media.length > 3 && (
                <div className="relative h-16 w-16 rounded-lg bg-muted flex items-center justify-center border border-border">
                  <span className="text-xs font-semibold text-muted-foreground">
                    +{post.media.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-border bg-muted/30 
        flex items-center justify-between group-hover:bg-primary/5 transition-colors">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5" />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-primary 
          opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View details</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </article>
  );
}
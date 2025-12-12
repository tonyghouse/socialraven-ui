"use client";

import { Calendar, User, FileText } from "lucide-react";
import { PLATFORM_ICONS } from "../generic/platform-icons";
import { MediaPreview } from "./media-preview";
import { cn } from "@/lib/utils";
import type { PostResponse } from "@/model/PostResponse";

export function ScheduledPostCard({ post }: { post: PostResponse }) {
  const Icon = PLATFORM_ICONS[post.provider] || null;

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-accent/10 text-accent border-accent/20",
    DRAFT: "bg-muted text-muted-foreground border-border",
    PUBLISHED: "bg-green-100 text-green-600 border-green-300",
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

  return (
    <div className="group rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-border flex flex-col gap-4 bg-card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </span>
            )}

            <div>
              <p className="text-sm font-semibold text-card-foreground capitalize">
                {post.provider}
              </p>

              {/* Connected Accounts */}
              <div className="flex gap-1.5 mt-1 overflow-x-auto max-w-[180px]">
                {post.connectedAccounts?.map((acc, idx) => (
                  <div key={idx} className="relative group/avatar">
                    <img
                      src={acc.profilePicLink || "/default-avatar.png"}
                      alt={acc.username}
                      className="h-6 w-6 rounded-full object-cover border border-border shadow-sm shrink-0"
                    />

                    {/* Hover Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-8 opacity-0 group-hover/avatar:opacity-100 transition bg-popover border border-border shadow-md rounded-md px-2 py-1 text-[10px] text-popover-foreground whitespace-nowrap pointer-events-none z-10">
                      {acc.username} • {acc.platform}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <span className={cn("px-3 py-1 rounded-full text-[11px] font-medium border", statusColors[post.postStatus] || statusColors.DRAFT)}>
            {post.postStatus}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{finalDateTime}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-card-foreground mb-2 line-clamp-2">
          {post.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {post.description}
        </p>

        {/* Media */}
        {post.media?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Media ({post.media.length})
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {post.media.map((m, i) => (
                <MediaPreview key={i} media={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <span>
            {post.connectedAccounts?.length} account{post.connectedAccounts?.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="w-2 h-2 rounded-full bg-muted-foreground/30 group-hover:bg-accent transition" />
      </div>
    </div>
  );
}
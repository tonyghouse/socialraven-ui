"use client";

import { Calendar, FileText, CalendarX2 } from "lucide-react";
import { MediaPreview } from "../scheduled-posts/media-preview";
import type { PostResponse } from "@/model/PostResponse";
import { PLATFORM_ICONS } from "../generic/platform-icons";

interface FailedPostCardProps {
  post: PostResponse;
}

export function FailedPostCard({ post }: FailedPostCardProps) {
  const Icon = PLATFORM_ICONS[post.provider] || null;

  // Apple-style formatting
  const dateObj = new Date(post.scheduledTime);
  const dateStr = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(dateObj);

  const timeStr = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);

  return (
    <div
      className="
        group 
        rounded-2xl 
        bg-white/60 backdrop-blur-xl 
        border border-border/40 
        shadow-[0_8px_24px_-10px_rgba(0,0,0,0.12)] 
        transition-all duration-300 
        hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.18)]
        flex flex-col h-full
      "
    >
      {/* HEADER */}
      <div className="p-4 border-b border-border/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-foreground capitalize">
                {post.provider}
              </p>
            </div>
          </div>

          {/* Status */}
          <span
            className="
              px-2.5 py-1 rounded-full text-xs font-medium 
              bg-red-50 border border-red-200 text-red-700 
              flex items-center gap-1
            "
          >
            <CalendarX2 className="h-3.5 w-3.5" /> Failed
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-foreground/60 mt-3">
          <Calendar className="w-4 h-4" />
          <span>{dateStr} · {timeStr}</span>
        </div>

        {/* CONNECTED ACCOUNTS — circles */}
        {post.connectedAccounts && post.connectedAccounts.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-thin">
            {post.connectedAccounts.map((acc) => (
              <div
                key={acc.providerUserId}
                className="
                  relative group/account
                  w-8 h-8 rounded-full flex-shrink-0 
                  bg-muted overflow-hidden border border-border/40
                "
              >
                <img
                  src={acc.profilePicLink || "/default-avatar.png"}
                  className="w-full h-full object-cover"
                />

                {/* Hover bubble tooltip */}
                <div
                  className="
                    absolute left-1/2 -translate-x-1/2 -top-8 
                    px-2 py-1 rounded-md text-[10px]
                    bg-black/80 text-white opacity-0 
                    group-hover/account:opacity-100 transition-all
                    pointer-events-none whitespace-nowrap
                  "
                >
                  {acc.username} · {acc.platform}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 flex-1">
        <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2">
          {post.title}
        </h3>

        <p className="text-sm text-foreground/70 line-clamp-3 mb-4">
          {post.description}
        </p>

        {/* Media Gallery */}
        {post.media && post.media.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-foreground/50" />
              <span className="text-xs font-medium text-foreground/60">
                Media ({post.media.length})
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">
              {post.media.map((m, idx) => (
                <MediaPreview key={`${m.fileKey}-${idx}`} media={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-4 py-3 border-t border-border/40 bg-white/50 flex items-center justify-end">
        <div className="w-2 h-2 rounded-full bg-red-500/60 group-hover:bg-red-500 transition" />
      </div>
    </div>
  );
}

"use client";

import { format } from "date-fns";
import { Calendar, User, FileText } from "lucide-react";
import { PLATFORM_ICONS } from "../generic/platform-icons";
import { MediaPreview } from "./media-preview";
import { cn } from "@/lib/utils";
import type { PostResponse } from "@/model/PostResponse";

export function ScheduledPostCard({ post }: { post: PostResponse }) {
  const Icon = PLATFORM_ICONS[post.provider] || null;

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-accent/10 text-accent border-accent/20",
    DRAFT: "bg-foreground/5 text-foreground/60 border-foreground/10",
    PUBLISHED: "bg-green-100 text-green-600 border-green-300",
    FAILED: "bg-red-100 text-red-500 border-red-300",
  };


  const localDate = new Date(post.scheduledTime);

// Apple-style date
const formattedDate = new Intl.DateTimeFormat("en-US", {
  month: "short",   // Feb
  day: "numeric",   // 28
  year: "numeric",  // 2025
}).format(localDate);

// Apple-style time with AM/PM
const formattedTime = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,  // AM/PM
}).format(localDate);

// Combined Apple UI format
const finalDateTime = `${formattedDate} · ${formattedTime}`;

  return (
    <div
      className="
        group
        rounded-2xl
        bg-white/60 backdrop-blur-xl 
        border border-foreground/10
        shadow-[0_6px_22px_-12px_rgba(0,0,0,0.15)]
        hover:shadow-[0_10px_26px_-12px_rgba(0,0,0,0.22)]
        transition-all duration-300
        overflow-hidden flex flex-col
      "
    >
      {/* HEADER */}
      <div className="p-5 border-b border-foreground/10 flex flex-col gap-4 bg-white/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="h-8 w-8 rounded-xl bg-foreground/5 flex items-center justify-center">
                <Icon className="h-4 w-4 text-foreground/70" />
              </span>
            )}

            <div>
              <p className="text-sm font-semibold text-foreground/80 capitalize">
                {post.provider}
              </p>

              {/* CONNECTED ACCOUNTS — circle avatars scrollable */}
              <div className="flex gap-1.5 mt-1 overflow-x-auto max-w-[180px] pr-1 scrollbar-none">
                {post.connectedAccounts?.map((acc, idx) => (
                  <div
                    key={idx}
                    className="relative group/avatar"
                  >
                    <img
                      src={acc.profilePicLink || "/default-avatar.png"}
                      className="
                        h-6 w-6 rounded-full object-cover
                        border border-foreground/10
                        shadow-sm shrink-0
                      "
                    />

                    {/* HOVER TOOLTIP */}
                    <div
                      className="
                        absolute left-1/2 -translate-x-1/2 top-8
                        opacity-0 group-hover/avatar:opacity-100
                        transition
                        bg-white/90 backdrop-blur-xl
                        border border-foreground/10
                        shadow-md rounded-xl px-2 py-1
                        text-[10px] text-foreground/70 whitespace-nowrap
                        pointer-events-none
                      "
                    >
                      {acc.username} • {acc.platform}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STATUS */}
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-medium border",
              statusColors[post.postStatus] || statusColors.DRAFT
            )}
          >
            {post.postStatus}
          </span>
        </div>

        {/* DATE */}
        <div className="flex items-center gap-2 text-xs text-foreground/60">
          <Calendar className="h-4 w-4" />
          <span>
            {finalDateTime}
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-foreground/85 mb-2 line-clamp-2">
          {post.title}
        </h3>

        <p className="text-sm text-foreground/60 line-clamp-3 mb-4">
          {post.description}
        </p>

        {/* MEDIA */}
        {post.media?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-foreground/50" />
              <span className="text-xs font-medium text-foreground/50">
                Media ({post.media.length})
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {post.media.map((m, i) => (
                <MediaPreview key={i} media={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-5 py-3 border-t border-foreground/10 bg-white/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-foreground/50">
          <User className="h-3.5 w-3.5" />
          <span>
            {post.connectedAccounts?.length} account
            {post.connectedAccounts?.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div
          className="
            w-2 h-2 rounded-full
            bg-foreground/20 group-hover:bg-accent
            transition
          "
        />
      </div>
    </div>
  );
}

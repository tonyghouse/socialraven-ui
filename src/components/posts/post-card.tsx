"use client";

import { useRouter } from "next/navigation";
import { Calendar, User, FileText, ArrowRight } from "lucide-react";
import { PLATFORM_ICONS } from "../generic/platform-icons";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { PostResponse } from "@/model/PostResponse";
import { MediaPreview } from "../generic/media-preview";
import { mapMediaResponseToMedia } from "@/lib/media-mapper";
import { getImageUrl } from "@/service/getImageUrl";

export function PostCard({ post }: { post: PostResponse }) {
  const router = useRouter();
  const Icon = PLATFORM_ICONS[post.provider] || null;

  /** Platform icon colors */
  const platformIconColor: Record<string, string> = {
    YOUTUBE: "text-red-600 bg-red-50 border-red-100",
    INSTAGRAM: "text-pink-600 bg-pink-50 border-pink-100",
    FACEBOOK: "text-blue-600 bg-blue-50 border-blue-100",
    LINKEDIN: "text-sky-600 bg-sky-50 border-sky-100",
    X: "text-neutral-800 bg-neutral-50 border-neutral-100",
  };

  const statusColors: Record<string, string> = {
    SCHEDULED:
      "bg-blue-500/10 text-blue-700 backdrop-blur-xl border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30",
    PUBLISHED:
      "bg-green-500/10 text-green-700 backdrop-blur-xl border-green-500/20 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30",
    FAILED: "bg-destructive/10 text-destructive backdrop-blur-xl border-destructive/20",
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

  const profileImageSrc = getImageUrl(
    post.connectedAccount?.profilePicLink
  );

  return (
    <article
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      className={cn(
        "group relative rounded-2xl bg-white border border-border/60 shadow-sm cursor-pointer overflow-hidden",
        "hover:shadow-xl hover:border-border/80 hover:-translate-y-0.5",
        "active:scale-[0.99]",
        "transition-all duration-300 ease-out",
        "dark:bg-card dark:border-border/50"
      )}
      style={{
        boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
      }}
    >

      {/* Platform Icon – TOP LEFT */}
      {Icon && (
        <div className="absolute top-4 left-4 z-10">
          <span 
            className={cn(
              "h-10 w-10 rounded-xl border shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-200",
              platformIconColor[post.provider] || "text-muted-foreground bg-muted/50 border-border/60"
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </span>
        </div>
      )}

      {/* Status Badge – TOP RIGHT */}
      <div className="absolute top-4 right-4 z-10">
        <span
          className={cn(
            "px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border shadow-sm",
            statusColors[post.postStatus]
          )}
        >
          {post.postStatus}
        </span>
      </div>

      {/* Header */}
      <div className="relative p-6 pt-16 flex flex-col gap-4">
        {/* User Info */}
        {post.connectedAccount && (
          <div className="flex items-center gap-3.5">
            <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-white/80 shadow-sm dark:border-neutral-700/80">
              {profileImageSrc ? (
                <Image
                  src={profileImageSrc}
                  alt={post.connectedAccount.username}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-card-foreground truncate tracking-tight">
                {post.connectedAccount.username}
              </p>
              <p className="text-xs text-muted-foreground capitalize font-medium">
                {post.provider}
              </p>
            </div>
          </div>
        )}

        {/* Scheduled Time */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/40 backdrop-blur-sm border border-border/30 w-fit">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <time dateTime={localDate.toISOString()} className="text-xs text-muted-foreground font-medium">
            {finalDateTime}
          </time>
        </div>
      </div>

      {/* Divider */}
      <div className="relative px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative p-6 pt-5 flex flex-col flex-1">
        <h3 className="text-[17px] font-semibold text-card-foreground mb-2.5 line-clamp-2 group-hover:text-accent transition-colors tracking-tight leading-snug">
          {post.title}
        </h3>

        {post.description && (
          <p className="text-[15px] text-muted-foreground/90 line-clamp-3 mb-5 leading-relaxed">
            {post.description}
          </p>
        )}

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted-foreground/70" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {post.media.length} media file
                {post.media.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-32 overflow-hidden">
              {post.media.slice(0, 3).map((m, i) => (
                <div key={m.id ?? i} className="rounded-xl overflow-hidden border border-border/40 shadow-sm">
                  <MediaPreview
                    media={mapMediaResponseToMedia(m)}
                  />
                </div>
              ))}

              {post.media.length > 3 && (
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-muted/80 to-muted border border-border/40 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground">
                    +{post.media.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative px-6 py-4 bg-gradient-to-b from-muted/30 to-muted/50 backdrop-blur-sm border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center">
            <User className="h-3 w-3 text-accent" />
          </div>
          <span>1 account</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-all duration-200">
          <span className="tracking-wide">View details</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </article>
  );
}
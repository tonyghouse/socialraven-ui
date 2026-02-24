"use client";

import { Calendar, Image as ImageIcon, Video, FileText, Users, CheckCircle2, Clock, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { PLATFORM_ICONS } from "../generic/platform-icons";
import NextImage from "next/image";
import { cn } from "@/lib/utils";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { PostResponse } from "@/model/PostResponse";
import { MediaPreview } from "../generic/media-preview";
import { mapMediaResponseToMedia } from "@/lib/media-mapper";
import { getImageUrl } from "@/service/getImageUrl";

interface CollectionCardProps {
  collection: PostCollectionResponse;
}

const overallStatusConfig: Record<
  string,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  SCHEDULED: {
    label: "Scheduled",
    className:
      "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30",
    Icon: Clock,
  },
  PUBLISHED: {
    label: "Published",
    className:
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
    Icon: CheckCircle2,
  },
  PARTIAL_SUCCESS: {
    label: "Partial",
    className:
      "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",
    Icon: AlertTriangle,
  },
  FAILED: {
    label: "Failed",
    className:
      "bg-red-500/10 text-red-700 border-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30",
    Icon: XCircle,
  },
};

const postStatusDotClass: Record<string, string> = {
  SCHEDULED: "bg-blue-500",
  POSTED: "bg-emerald-500",
  PUBLISHED: "bg-emerald-500",
  FAILED: "bg-red-500",
};

const typeConfig: Record<
  string,
  { label: string; Icon: typeof ImageIcon; className: string }
> = {
  IMAGE: {
    label: "Image",
    Icon: ImageIcon,
    className: "text-violet-600 bg-violet-50 border-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800/30",
  },
  VIDEO: {
    label: "Video",
    Icon: Video,
    className: "text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30",
  },
  TEXT: {
    label: "Text",
    Icon: FileText,
    className: "text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/30",
  },
};

const platformIconColor: Record<string, string> = {
  YOUTUBE: "text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
  INSTAGRAM: "text-pink-600 bg-pink-50 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800/30",
  FACEBOOK: "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
  LINKEDIN: "text-sky-600 bg-sky-50 border-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/30",
  X: "text-neutral-800 bg-neutral-50 border-neutral-100 dark:bg-neutral-800/30 dark:text-neutral-300 dark:border-neutral-700/30",
};

function PlatformRow({ post }: { post: PostResponse }) {
  const Icon = PLATFORM_ICONS[post.provider] || null;
  const profileSrc = getImageUrl(post.connectedAccount?.profilePicLink);
  const dotClass = postStatusDotClass[post.postStatus] ?? "bg-muted-foreground";

  return (
    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Avatar */}
        <div className="relative h-7 w-7 rounded-full overflow-hidden border border-border/40 flex-shrink-0">
          {profileSrc ? (
            <NextImage
              src={profileSrc}
              alt={post.connectedAccount?.username ?? ""}
              fill
              sizes="28px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Username */}
        <span className="text-[13px] font-medium text-foreground truncate">
          {post.connectedAccount?.username ?? post.provider}
        </span>

        {/* Platform Icon */}
        {Icon && (
          <span
            className={cn(
              "h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0",
              platformIconColor[post.provider] ??
                "text-muted-foreground bg-muted/50 border-border/60"
            )}
          >
            <Icon className="h-3 w-3" />
          </span>
        )}
      </div>

      {/* Status dot */}
      <span className="flex items-center gap-1.5 flex-shrink-0">
        <span className={cn("h-2 w-2 rounded-full", dotClass)} />
        <span className="text-[11px] text-muted-foreground capitalize">
          {["POSTED", "PUBLISHED"].includes(post.postStatus) ? "Published" : post.postStatus.charAt(0) + post.postStatus.slice(1).toLowerCase()}
        </span>
      </span>
    </div>
  );
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const statusCfg = overallStatusConfig[collection.overallStatus] ?? overallStatusConfig.SCHEDULED;
  const typeCfg = typeConfig[collection.postCollectionType] ?? typeConfig.TEXT;
  const StatusIcon = statusCfg.Icon;
  const TypeIcon = typeCfg.Icon;

  const localDate = new Date(collection.scheduledTime);
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

  const visiblePosts = collection.posts.slice(0, 4);
  const remainingPosts = collection.posts.length - visiblePosts.length;

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl bg-white border border-border/60 shadow-sm overflow-hidden",
        "hover:shadow-xl hover:border-border/80 hover:-translate-y-0.5",
        "transition-all duration-300 ease-out",
        "dark:bg-card dark:border-border/50"
      )}
      style={{
        boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
      }}
    >
      {/* Top badges row */}
      <div className="flex items-center justify-between px-5 pt-5">
        {/* Type badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border",
            typeCfg.className
          )}
        >
          <TypeIcon className="h-3 w-3" />
          {typeCfg.label}
        </span>

        {/* Status badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
            statusCfg.className
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {statusCfg.label}
        </span>
      </div>

      {/* Content */}
      <div className="px-5 pt-3 pb-4">
        <h3 className="text-[17px] font-semibold text-card-foreground mb-1.5 line-clamp-2 tracking-tight leading-snug">
          {collection.title}
        </h3>

        {collection.description && (
          <p className="text-[13px] text-muted-foreground/90 line-clamp-2 leading-relaxed mb-3">
            {collection.description}
          </p>
        )}

        {/* Scheduled time */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/30 w-fit">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <time
            dateTime={localDate.toISOString()}
            className="text-xs text-muted-foreground font-medium"
          >
            {formattedDate} · {formattedTime}
          </time>
        </div>
      </div>

      {/* Media thumbnails */}
      {collection.media.length > 0 && (
        <div className="px-5 pb-4">
          <div className="flex flex-wrap gap-2">
            {collection.media.slice(0, 4).map((m, i) => (
              <div
                key={m.id ?? i}
                className="rounded-xl overflow-hidden border border-border/40 shadow-sm"
              >
                <MediaPreview media={mapMediaResponseToMedia(m)} />
              </div>
            ))}
            {collection.media.length > 4 && (
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-muted/80 to-muted border border-border/40 flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-muted-foreground">
                  +{collection.media.length - 4}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="px-5">
        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </div>

      {/* Platforms section */}
      <div className="flex-1 px-2 py-3">
        <div className="flex items-center gap-2 px-3 mb-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {collection.posts.length} Platform{collection.posts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-0.5">
          {visiblePosts.map((post) => (
            <PlatformRow key={post.id} post={post} />
          ))}
          {remainingPosts > 0 && (
            <div className="px-3 py-1">
              <span className="text-[11px] text-muted-foreground font-medium">
                +{remainingPosts} more platform{remainingPosts !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 bg-gradient-to-b from-muted/20 to-muted/40 border-t border-border/40 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          {collection.posts.length} post{collection.posts.length !== 1 ? "s" : ""} across platforms
        </span>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-all duration-200">
          <span>View details</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </article>
  );
}

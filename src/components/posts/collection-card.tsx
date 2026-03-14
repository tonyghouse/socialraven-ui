"use client";

import {
  Calendar,
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Play,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PLATFORM_ICONS } from "../generic/platform-icons";
import { cn } from "@/lib/utils";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { MediaResponse } from "@/model/MediaResponse";

interface CollectionCardProps {
  collection: PostCollectionResponse;
  href?: string;
}

const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    dotColor: "bg-slate-400",
    pulse: false,
    className:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/30",
    Icon: FileText,
  },
  SCHEDULED: {
    label: "Scheduled",
    dotColor: "bg-blue-500",
    pulse: true,
    className:
      "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30",
    Icon: Clock,
  },
  PUBLISHED: {
    label: "Published",
    dotColor: "bg-emerald-500",
    pulse: false,
    className:
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
    Icon: CheckCircle2,
  },
  PARTIAL_SUCCESS: {
    label: "Partial",
    dotColor: "bg-amber-500",
    pulse: false,
    className:
      "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",
    Icon: AlertTriangle,
  },
  FAILED: {
    label: "Failed",
    dotColor: "bg-red-500",
    pulse: false,
    className:
      "bg-red-500/10 text-red-700 border-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30",
    Icon: XCircle,
  },
} as const;

const TYPE_CONFIG = {
  IMAGE: {
    label: "Image",
    Icon: ImageIcon,
    badge: "text-violet-600 bg-violet-50 border-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800/30",
  },
  VIDEO: {
    label: "Video",
    Icon: Video,
    badge: "text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30",
  },
  TEXT: {
    label: "Text",
    Icon: FileText,
    badge: "text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/30",
  },
} as const;

// Platform-specific colors for icons and accent
const PLATFORM_STYLE: Record<
  string,
  { bg: string; icon: string; accent: string }
> = {
  instagram: {
    bg: "bg-gradient-to-br from-pink-500/15 to-purple-500/15 border-pink-400/20",
    icon: "text-pink-500",
    accent: "#e1306c",
  },
  x: {
    bg: "bg-neutral-900/8 border-neutral-400/20 dark:bg-neutral-100/8 dark:border-neutral-600/20",
    icon: "text-neutral-800 dark:text-neutral-200",
    accent: "#000000",
  },
  linkedin: {
    bg: "bg-sky-500/10 border-sky-400/20",
    icon: "text-sky-600",
    accent: "#0077b5",
  },
  facebook: {
    bg: "bg-blue-500/10 border-blue-400/20",
    icon: "text-blue-600",
    accent: "#1877f2",
  },
  youtube: {
    bg: "bg-red-500/10 border-red-400/20",
    icon: "text-red-600",
    accent: "#ff0000",
  },
  tiktok: {
    bg: "bg-neutral-900/8 border-neutral-400/20 dark:bg-neutral-100/8",
    icon: "text-neutral-800 dark:text-neutral-200",
    accent: "#010101",
  },
  threads: {
    bg: "bg-neutral-900/8 border-neutral-400/20 dark:bg-neutral-100/8",
    icon: "text-neutral-800 dark:text-neutral-200",
    accent: "#000000",
  },
};

// Accent bar gradient based on primary platform
const ACCENT_GRADIENT: Record<string, string> = {
  instagram: "from-pink-500 via-purple-500 to-orange-400",
  x: "from-neutral-700 via-neutral-500 to-neutral-400",
  linkedin: "from-sky-600 via-sky-500 to-blue-400",
  facebook: "from-blue-600 via-blue-500 to-sky-400",
  youtube: "from-red-600 via-red-500 to-orange-400",
  tiktok: "from-neutral-800 via-neutral-600 to-neutral-400",
  threads: "from-neutral-800 via-neutral-600 to-neutral-400",
  default: "from-violet-500 via-blue-500 to-emerald-400",
};

const TAB_H = 10;

function getTimeLabel(scheduledTime: string): { text: string; urgent: boolean } {
  const now = new Date();
  const scheduled = new Date(scheduledTime);
  const diffMs = scheduled.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return { text: "Past due", urgent: true };
  if (diffHours < 1) return { text: "< 1 hour", urgent: true };
  if (diffHours < 6) return { text: `In ${diffHours}h`, urgent: true };
  if (diffHours < 24) return { text: `In ${diffHours}h`, urgent: false };
  if (diffDays === 1) return { text: "Tomorrow", urgent: false };
  return { text: `In ${diffDays}d`, urgent: false };
}

function MediaThumb({ media }: { media: MediaResponse }) {
  const src = media.fileUrl;

  if (!src) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
      </div>
    );
  }

  const isVideo =
    media.mimeType?.startsWith("video/") || /\.(mp4|webm|ogg|mov)$/i.test(src);

  if (isVideo) {
    return (
      <div className="relative w-full h-full bg-slate-900">
        <video
          src={src}
          muted
          preload="metadata"
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="h-7 w-7 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
            <Play className="h-3 w-3 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={media.fileName ?? "media"}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
}

export function CollectionCard({ collection, href }: CollectionCardProps) {
  const router = useRouter();

  const statusCfg =
    STATUS_CONFIG[collection.overallStatus as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.SCHEDULED;
  const typeCfg =
    TYPE_CONFIG[collection.postCollectionType as keyof typeof TYPE_CONFIG] ??
    TYPE_CONFIG.TEXT;
  const TypeIcon = typeCfg.Icon;

  const isDraft = collection.overallStatus === "DRAFT";
  const localDate = collection.scheduledTime
    ? new Date(collection.scheduledTime)
    : null;
  const formattedDate = localDate
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(localDate)
    : null;
  const formattedTime = localDate
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(localDate)
    : null;

  const timeLabel = collection.scheduledTime
    ? getTimeLabel(collection.scheduledTime)
    : null;

  const uniquePlatforms = Array.from(
    new Set(collection.posts.map((p) => p.provider))
  );
  const visiblePlatforms = uniquePlatforms.slice(0, 6);
  const hiddenPlatformCount = uniquePlatforms.length - visiblePlatforms.length;

  const primaryPlatform = uniquePlatforms[0]?.toLowerCase();
  const accentGradient =
    ACCENT_GRADIENT[primaryPlatform] ?? ACCENT_GRADIENT.default;

  const uniqueAccounts = Array.from(
    new Map(
      collection.posts
        .filter((p) => p.connectedAccount)
        .map((p) => [p.connectedAccount.providerUserId, p.connectedAccount])
    ).values()
  );

  const media = collection.media ?? [];
  const mediaCount = media.length;
  const hasVideo = media.some(
    (m) =>
      m.mimeType?.startsWith("video/") ||
      /\.(mp4|webm|ogg|mov)$/i.test(m.fileUrl ?? "")
  );

  const handleNavigate = () =>
    router.push(href ?? `/scheduled-posts/${collection.id}`);

  const FAN_PARAMS: [number, number, number][] = [
    [0, 0, 4],
    [-3.5, 22, 3],
    [4.5, 44, 2],
    [-5, 66, 1],
  ];

  return (
    <div className="relative">
      {/* Folder tab */}
      <div
        className="absolute left-0 w-20 rounded-t-lg border border-b-0 border-border/50 bg-white dark:bg-card dark:border-border/40"
        style={{ top: -TAB_H, height: TAB_H, zIndex: 20 }}
        aria-hidden="true"
      />

      {/* Main card */}
      <article
        onClick={handleNavigate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNavigate();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`View collection: ${collection.title}`}
        className={cn(
          "group relative flex flex-col rounded-2xl rounded-tl-none bg-white border border-border/60 overflow-hidden cursor-pointer",
          "shadow-sm hover:shadow-2xl hover:-translate-y-1 active:scale-[0.99]",
          "transition-all duration-300 ease-out",
          "dark:bg-card dark:border-border/50",
          "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1"
        )}
        style={{
          position: "relative",
          zIndex: 10,
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        }}
      >
        {/* Gradient accent bar */}
        <div
          className={cn(
            "h-[3px] w-full bg-gradient-to-r opacity-80 group-hover:opacity-100 transition-opacity duration-300",
            accentGradient
          )}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold border",
                typeCfg.badge
              )}
            >
              <TypeIcon className="h-3 w-3" />
              {typeCfg.label}
            </span>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
              statusCfg.className
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                statusCfg.dotColor,
                statusCfg.pulse && "animate-pulse"
              )}
            />
            {statusCfg.label}
          </span>
        </div>

        {/* Title + description */}
        <div className="px-5 pt-3 pb-3">
          <h3 className="text-[16px] font-semibold text-card-foreground mb-1 line-clamp-2 tracking-tight leading-snug group-hover:text-primary transition-colors duration-200">
            {collection.title}
          </h3>
          {collection.description && (
            <p className="text-[13px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>

        {/* Scheduled time pill — prominent */}
        {localDate && formattedDate && formattedTime && (
          <div className="px-5 pb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/40">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-[12px] font-semibold text-foreground">
                {formattedDate}
              </span>
              <span className="h-3 w-px bg-border/70" />
              <span className="text-[12px] text-muted-foreground">
                {formattedTime}
              </span>
              {timeLabel && (
                <>
                  <span className="h-3 w-px bg-border/70" />
                  <span
                    className={cn(
                      "text-[11px] font-bold",
                      timeLabel.urgent ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"
                    )}
                  >
                    {timeLabel.urgent && (
                      <Zap className="h-3 w-3 inline mr-0.5 -mt-0.5" />
                    )}
                    {timeLabel.text}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
        {!localDate && isDraft && (
          <div className="px-5 pb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/30">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
              <span className="text-[12px] text-muted-foreground/70">
                Not scheduled
              </span>
            </div>
          </div>
        )}

        {/* Media: hero (1) or fanned stack (2+) */}
        {mediaCount > 0 && (
          <div className="px-5 pb-4">
            {mediaCount === 1 ? (
              <div
                className="rounded-xl overflow-hidden border border-border/40 shadow-sm bg-muted"
                style={{ height: 100 }}
              >
                <MediaThumb media={media[0]} />
              </div>
            ) : (
              <div className="relative" style={{ height: 88 }}>
                {media.slice(0, Math.min(4, mediaCount)).map((m, i) => {
                  const [rot, xOff, zIdx] = FAN_PARAMS[i] ?? [0, i * 22, 4 - i];
                  return (
                    <div
                      key={m.id ?? i}
                      className="absolute rounded-xl overflow-hidden border border-border/30 bg-muted"
                      style={{
                        width: 72,
                        height: 72,
                        left: xOff,
                        top: Math.abs(rot) * 0.65,
                        transform: `rotate(${rot}deg)`,
                        zIndex: zIdx,
                        boxShadow:
                          i === 0
                            ? "0 4px 14px rgba(0,0,0,0.14)"
                            : "0 2px 8px rgba(0,0,0,0.09)",
                      }}
                    >
                      <MediaThumb media={m} />
                    </div>
                  );
                })}
                {mediaCount > 4 && (
                  <div
                    className="absolute rounded-xl bg-black/65 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center gap-0.5"
                    style={{ width: 72, height: 72, left: 66, top: 4, zIndex: 0 }}
                  >
                    <span className="text-white text-xs font-bold leading-none">
                      +{mediaCount - 4}
                    </span>
                    <span className="text-white/60 text-[9px]">more</span>
                  </div>
                )}
                <div className="absolute right-0 bottom-0 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                  {hasVideo ? (
                    <Play className="h-2.5 w-2.5 text-white fill-white" />
                  ) : (
                    <ImageIcon className="h-2.5 w-2.5 text-white" />
                  )}
                  <span className="text-white text-[10px] font-semibold">
                    {mediaCount}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="px-5">
          <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        </div>

        {/* Platform icons with colored backgrounds */}
        <div className="px-5 pt-3.5 pb-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
            Platforms
          </p>
          <div className="flex items-center flex-wrap gap-2">
            {visiblePlatforms.map((platform) => {
              const Icon = PLATFORM_ICONS[platform];
              const pStyle = PLATFORM_STYLE[platform.toLowerCase()] ?? {
                bg: "bg-muted/50 border-border/50",
                icon: "text-muted-foreground",
                accent: "#888",
              };
              if (!Icon) return null;
              return (
                <span
                  key={platform}
                  title={
                    platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()
                  }
                  className={cn(
                    "h-8 w-8 rounded-xl border flex items-center justify-center shadow-sm",
                    "transition-transform duration-150 hover:scale-110 hover:shadow-md",
                    pStyle.bg
                  )}
                >
                  <Icon className={cn("h-4 w-4", pStyle.icon)} />
                </span>
              );
            })}
            {hiddenPlatformCount > 0 && (
              <span className="h-8 px-2.5 rounded-xl bg-muted/60 border border-border/40 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                +{hiddenPlatformCount}
              </span>
            )}
          </div>
        </div>

        {/* Account avatar stack */}
        {uniqueAccounts.length > 0 && (
          <div className="px-5 pb-4 flex items-center gap-2">
            <div className="flex items-center flex-shrink-0">
              {uniqueAccounts.slice(0, 5).map((account, i) => (
                <div
                  key={account.providerUserId}
                  title={`@${account.username}`}
                  className="relative h-6 w-6 rounded-full border-2 border-white dark:border-card overflow-hidden shadow-sm flex-shrink-0 bg-gradient-to-br from-violet-400 to-pink-400"
                  style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 10 - i }}
                >
                  {account.profilePicLink ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={account.profilePicLink}
                      alt={account.username ?? ""}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (
                          e.currentTarget as HTMLImageElement
                        ).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">
                        {(account.username ?? "?")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {uniqueAccounts.length > 5 && (
                <div
                  className="h-6 w-6 rounded-full border-2 border-white dark:border-card bg-muted flex items-center justify-center shadow-sm flex-shrink-0 relative"
                  style={{ marginLeft: -6, zIndex: 5 }}
                >
                  <span className="text-[8px] font-bold text-muted-foreground">
                    +{uniqueAccounts.length - 5}
                  </span>
                </div>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium truncate">
              {uniqueAccounts.length} account
              {uniqueAccounts.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto px-5 py-3 bg-gradient-to-b from-muted/10 to-muted/30 border-t border-border/40 flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium">
            {collection.posts.length} post
            {collection.posts.length !== 1 ? "s" : ""} ·{" "}
            {uniquePlatforms.length} platform
            {uniquePlatforms.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200">
            <span>Open</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </article>
    </div>
  );
}

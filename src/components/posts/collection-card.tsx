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
    dotColor: "bg-[hsl(var(--foreground-subtle))]",
    pulse: false,
    className:
      "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]",
  },
  IN_REVIEW: {
    label: "In Review",
    dotColor: "bg-amber-500",
    pulse: true,
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
  },
  CHANGES_REQUESTED: {
    label: "Changes Requested",
    dotColor: "bg-orange-500",
    pulse: false,
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400",
  },
  SCHEDULED: {
    label: "Scheduled",
    dotColor: "bg-[hsl(var(--accent))]",
    pulse: true,
    className:
      "border-[hsl(var(--accent))]/15 bg-[hsl(var(--accent))]/8 text-[hsl(var(--accent))]",
  },
  PUBLISHED: {
    label: "Published",
    dotColor: "bg-[hsl(var(--success))]",
    pulse: false,
    className:
      "border-[hsl(var(--success))]/18 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  },
  PARTIAL_SUCCESS: {
    label: "Partial",
    dotColor: "bg-[hsl(var(--warning))]",
    pulse: false,
    className:
      "border-[hsl(var(--warning))]/18 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  },
  FAILED: {
    label: "Failed",
    dotColor: "bg-[hsl(var(--destructive))]",
    pulse: false,
    className:
      "border-[hsl(var(--destructive))]/18 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
  },
} as const;

const TYPE_CONFIG = {
  IMAGE: { label: "Image", Icon: ImageIcon },
  VIDEO: { label: "Video", Icon: Video },
  TEXT: { label: "Text", Icon: FileText },
} as const;

const RECOVERY_BADGE_CONFIG = {
  RECOVERED: {
    label: "Recovered",
    className:
      "border-[hsl(var(--success))]/18 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  },
} as const;

const PLATFORM_STYLE: Record<string, string> = {
  instagram: "text-pink-500",
  x: "text-[hsl(var(--foreground))]",
  linkedin: "text-sky-600",
  facebook: "text-blue-600",
  youtube: "text-red-600",
  tiktok: "text-[hsl(var(--foreground))]",
  threads: "text-[hsl(var(--foreground))]",
};

interface PreviewProps {
  type: "IMAGE" | "VIDEO" | "TEXT";
  media: MediaResponse[];
  previewText?: string;
  hasVideo: boolean;
}

function SquarePreview({ type, media, previewText, hasVideo }: PreviewProps) {
  const mediaCount = media.length;
  const previewSizeClass = "w-[104px] h-[156px]";

  if (type === "TEXT") {
    return (
      <div className={cn("flex flex-col rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] p-2.5", previewSizeClass)}>
        <p className="flex-1 overflow-hidden text-[11px] leading-4 text-[hsl(var(--foreground-muted))] line-clamp-[8]">
          {previewText || "No preview"}
        </p>
        <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-[hsl(var(--foreground-subtle))]">
          <FileText className="h-3 w-3" />
          Text
        </div>
      </div>
    );
  }

  if (mediaCount === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center rounded-md border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]", previewSizeClass)}>
        <ImageIcon className="h-4 w-4 text-[hsl(var(--foreground-subtle))]" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]", previewSizeClass)}>
      {mediaCount === 1 && <MediaThumb media={media[0]} />}

      {mediaCount === 2 && (
        <div className="flex h-full gap-px">
          <div className="h-full flex-1 overflow-hidden">
            <MediaThumb media={media[0]} />
          </div>
          <div className="h-full flex-1 overflow-hidden">
            <MediaThumb media={media[1]} />
          </div>
        </div>
      )}

      {mediaCount === 3 && (
        <div className="flex h-full gap-px">
          <div className="h-full flex-1 overflow-hidden">
            <MediaThumb media={media[0]} />
          </div>
          <div className="flex h-full flex-1 flex-col gap-px">
            <div className="flex-1 overflow-hidden">
              <MediaThumb media={media[1]} />
            </div>
            <div className="flex-1 overflow-hidden">
              <MediaThumb media={media[2]} />
            </div>
          </div>
        </div>
      )}

      {mediaCount >= 4 && (
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-px">
          {media.slice(0, 4).map((m, i) => (
            <div key={m.id ?? i} className="relative overflow-hidden">
              <MediaThumb media={m} />
              {i === 3 && mediaCount > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-[11px] font-semibold text-white">
                  +{mediaCount - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
        {hasVideo ? (
          <Play className="h-2.5 w-2.5 fill-white text-white" />
        ) : (
          <ImageIcon className="h-2.5 w-2.5 text-white" />
        )}
        <span>{mediaCount}</span>
      </div>
    </div>
  );
}

function getTimeLabel(scheduledTime: string): { text: string; urgent: boolean } {
  const now = new Date();
  const scheduled = new Date(scheduledTime);
  const diffMs = scheduled.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return { text: "Past due", urgent: true };
  if (diffHours < 1) return { text: "<1h", urgent: true };
  if (diffHours < 24) return { text: `${diffHours}h`, urgent: diffHours < 6 };
  if (diffDays === 1) return { text: "Tomorrow", urgent: false };
  return { text: `${diffDays}d`, urgent: false };
}

function MediaThumb({ media }: { media: MediaResponse }) {
  const src = media.fileUrl;

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[hsl(var(--surface-raised))]">
        <ImageIcon className="h-4 w-4 text-[hsl(var(--foreground-subtle))]" />
      </div>
    );
  }

  const isVideo =
    media.mimeType?.startsWith("video/") || /\.(mp4|webm|ogg|mov)$/i.test(src);

  if (isVideo) {
    return (
      <div className="relative h-full w-full bg-slate-900">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={src}
          muted
          preload="metadata"
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Play className="ml-0.5 h-3 w-3 fill-white text-white" />
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
      className="block h-full w-full object-cover"
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
  const recoveryBadge =
    collection.failureState === "RECOVERED"
      ? RECOVERY_BADGE_CONFIG[collection.failureState as keyof typeof RECOVERY_BADGE_CONFIG]
      : null;

  const localDate = collection.scheduledTime
    ? new Date(collection.scheduledTime)
    : null;
  const formattedDate = localDate
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(localDate)
    : "Not scheduled";
  const formattedTime = localDate
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(localDate)
    : "";

  const timeLabel = collection.scheduledTime
    ? getTimeLabel(collection.scheduledTime)
    : null;

  const uniquePlatforms = Array.from(
    new Set(collection.posts.map((p) => p.provider))
  );
  const approvalEscalated = Boolean(collection.approvalEscalatedAt);
  const approvalOverdue =
    collection.overallStatus === "IN_REVIEW" &&
    !approvalEscalated &&
    Boolean(
      collection.nextApprovalReminderAt &&
        new Date(collection.nextApprovalReminderAt).getTime() <= Date.now()
    );
  const visiblePlatforms = uniquePlatforms.slice(0, 5);
  const hiddenPlatformCount = uniquePlatforms.length - visiblePlatforms.length;

  const uniqueAccounts = Array.from(
    new Map(
      collection.posts
        .filter((p) => p.connectedAccount)
        .map((p) => [p.connectedAccount.providerUserId, p.connectedAccount])
    ).values()
  );

  const media = collection.media ?? [];
  const hasVideo = media.some(
    (m) =>
      m.mimeType?.startsWith("video/") ||
      /\.(mp4|webm|ogg|mov)$/i.test(m.fileUrl ?? "")
  );

  const handleNavigate = () =>
    router.push(href ?? `/scheduled-posts/${collection.id}`);

  return (
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
      aria-label="View collection"
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))]",
        "shadow-[0_1px_2px_rgba(9,30,66,0.08)] transition-[box-shadow,border-color] duration-150",
        "hover:border-[hsl(var(--accent))]/30 hover:shadow-[0_6px_12px_rgba(9,30,66,0.12)]",
        "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30 focus:ring-offset-2"
      )}
    >
      <div className="flex items-center justify-between border-b border-[hsl(var(--border-subtle))] px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-2 py-1 text-[10px] font-semibold text-[hsl(var(--foreground))]">
            <TypeIcon className="h-3 w-3" />
            {typeCfg.label}
          </span>
          {recoveryBadge && (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold",
                recoveryBadge.className
              )}
            >
              {recoveryBadge.label}
            </span>
          )}
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold",
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
        {approvalEscalated && (
          <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-700">
            Escalated
          </span>
        )}
        {approvalOverdue && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
            Reminder due
          </span>
        )}
      </div>

      <div className="flex gap-3 px-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[14px] font-semibold leading-5 text-[hsl(var(--foreground))] transition-colors group-hover:text-[hsl(var(--accent))]">
            {collection.description || "No content"}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[hsl(var(--foreground-muted))]">
            <Calendar className="h-3.5 w-3.5 text-[hsl(var(--foreground-subtle))]" />
            <span className="truncate">{formattedDate}</span>
            {formattedTime && <span>{formattedTime}</span>}
            {timeLabel && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-semibold",
                  timeLabel.urgent
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-[hsl(var(--foreground-muted))]"
                )}
              >
                {timeLabel.urgent && <Zap className="h-3 w-3" />}
                {timeLabel.text}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {visiblePlatforms.map((platform) => {
                const Icon = PLATFORM_ICONS[platform];
                if (!Icon) return null;

                return (
                  <span
                    key={platform}
                    title={platform}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]"
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5",
                        PLATFORM_STYLE[platform.toLowerCase()] ??
                          "text-[hsl(var(--foreground-muted))]"
                      )}
                    />
                  </span>
                );
              })}
              {hiddenPlatformCount > 0 && (
                <span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-1.5 text-[10px] font-semibold text-[hsl(var(--foreground-muted))]">
                  +{hiddenPlatformCount}
                </span>
              )}
            </div>

            {uniqueAccounts.length > 0 && (
              <div className="flex flex-shrink-0 items-center">
                {uniqueAccounts.slice(0, 3).map((account, i) => (
                  <div
                    key={account.providerUserId}
                    className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-[hsl(var(--surface))] bg-[hsl(var(--surface-sunken))]"
                    style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 10 - i }}
                    title={`@${account.username}`}
                  >
                    {account.profilePicLink ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={account.profilePicLink}
                        alt={account.username ?? ""}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-[hsl(var(--foreground-muted))]">
                        {(account.username ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <SquarePreview
            type={collection.postCollectionType}
            media={media}
            previewText={collection.posts[0]?.description || collection.description}
            hasVideo={hasVideo}
          />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-3 py-2.5">
        <span className="text-[11px] text-[hsl(var(--foreground-muted))]">
          {collection.posts.length} post{collection.posts.length !== 1 ? "s" : ""} · {uniquePlatforms.length} platform{uniquePlatforms.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--accent))]">
          <span>Open</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </article>
  );
}

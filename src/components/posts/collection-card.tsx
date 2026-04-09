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
  appearance?: "default" | "geist";
}

const DEFAULT_STATUS_CONFIG = {
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
  APPROVED: {
    label: "Approved",
    dotColor: "bg-[hsl(var(--success))]",
    pulse: false,
    className:
      "border-[hsl(var(--success))]/18 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
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

const GEIST_STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    dotColor: "bg-[var(--ds-gray-700)]",
    pulse: false,
    className:
      "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]",
  },
  IN_REVIEW: {
    label: "In Review",
    dotColor: "bg-[var(--ds-amber-600)]",
    pulse: true,
    className:
      "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]",
  },
  CHANGES_REQUESTED: {
    label: "Changes Requested",
    dotColor: "bg-[var(--ds-amber-600)]",
    pulse: false,
    className:
      "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]",
  },
  APPROVED: {
    label: "Approved",
    dotColor: "bg-[var(--ds-green-600)]",
    pulse: false,
    className:
      "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
  },
  SCHEDULED: {
    label: "Scheduled",
    dotColor: "bg-[var(--ds-blue-600)]",
    pulse: true,
    className:
      "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
  },
  PUBLISHED: {
    label: "Published",
    dotColor: "bg-[var(--ds-green-600)]",
    pulse: false,
    className:
      "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
  },
  PARTIAL_SUCCESS: {
    label: "Partial",
    dotColor: "bg-[var(--ds-amber-600)]",
    pulse: false,
    className:
      "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]",
  },
  FAILED: {
    label: "Failed",
    dotColor: "bg-[var(--ds-red-600)]",
    pulse: false,
    className:
      "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
  },
} as const;

const TYPE_CONFIG = {
  IMAGE: { label: "Image", Icon: ImageIcon },
  VIDEO: { label: "Video", Icon: Video },
  TEXT: { label: "Text", Icon: FileText },
} as const;

const DEFAULT_RECOVERY_BADGE_CONFIG = {
  RECOVERED: {
    label: "Recovered",
    className:
      "border-[hsl(var(--success))]/18 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  },
} as const;

const GEIST_RECOVERY_BADGE_CONFIG = {
  RECOVERED: {
    label: "Recovered",
    className:
      "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
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

const GEIST_PLATFORM_STYLE: Record<string, string> = {
  instagram: "text-pink-600",
  x: "text-[var(--ds-gray-1000)]",
  linkedin: "text-sky-600",
  facebook: "text-blue-600",
  youtube: "text-red-600",
  tiktok: "text-[var(--ds-gray-1000)]",
  threads: "text-[var(--ds-gray-1000)]",
};

interface PreviewProps {
  type: "IMAGE" | "VIDEO" | "TEXT";
  media: MediaResponse[];
  previewText?: string;
  hasVideo: boolean;
  appearance?: "default" | "geist";
}

function SquarePreview({
  type,
  media,
  previewText,
  hasVideo,
  appearance = "default",
}: PreviewProps) {
  const isGeist = appearance === "geist";
  const mediaCount = media.length;
  const previewSizeClass = "w-[6.5rem] h-[9.75rem]";

  if (type === "TEXT") {
    return (
      <div
        className={cn(
          "flex flex-col rounded-md border p-2.5",
          isGeist
            ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]"
            : "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]",
          previewSizeClass
        )}
      >
        <p
          className={cn(
            "flex-1 overflow-hidden text-[0.6875rem] leading-4 line-clamp-[8]",
            isGeist
              ? "text-[var(--ds-gray-900)]"
              : "text-[hsl(var(--foreground-muted))]"
          )}
        >
          {previewText || "No preview"}
        </p>
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-[0.625rem] font-medium",
            isGeist
              ? "text-[var(--ds-gray-900)]"
              : "text-[hsl(var(--foreground-subtle))]"
          )}
        >
          <FileText className="h-3 w-3" />
          Text
        </div>
      </div>
    );
  }

  if (mediaCount === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-md border border-dashed",
          isGeist
            ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]"
            : "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]",
          previewSizeClass
        )}
      >
        <ImageIcon
          className={cn(
            "h-4 w-4",
            isGeist
              ? "text-[var(--ds-gray-900)]"
              : "text-[hsl(var(--foreground-subtle))]"
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border",
        isGeist
          ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]",
        previewSizeClass
      )}
    >
      {mediaCount === 1 && <MediaThumb media={media[0]} appearance={appearance} />}

      {mediaCount === 2 && (
        <div className="flex h-full gap-px">
          <div className="h-full flex-1 overflow-hidden">
            <MediaThumb media={media[0]} appearance={appearance} />
          </div>
          <div className="h-full flex-1 overflow-hidden">
            <MediaThumb media={media[1]} appearance={appearance} />
          </div>
        </div>
      )}

      {mediaCount === 3 && (
        <div className="flex h-full gap-px">
          <div className="h-full flex-1 overflow-hidden">
            <MediaThumb media={media[0]} appearance={appearance} />
          </div>
          <div className="flex h-full flex-1 flex-col gap-px">
            <div className="flex-1 overflow-hidden">
              <MediaThumb media={media[1]} appearance={appearance} />
            </div>
            <div className="flex-1 overflow-hidden">
              <MediaThumb media={media[2]} appearance={appearance} />
            </div>
          </div>
        </div>
      )}

      {mediaCount >= 4 && (
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-px">
          {media.slice(0, 4).map((m, i) => (
            <div key={m.id ?? i} className="relative overflow-hidden">
              <MediaThumb media={m} appearance={appearance} />
              {i === 3 && mediaCount > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-[0.6875rem] font-semibold text-white">
                  +{mediaCount - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[0.5625rem] font-semibold text-white backdrop-blur-sm">
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

function MediaThumb({
  media,
  appearance = "default",
}: {
  media: MediaResponse;
  appearance?: "default" | "geist";
}) {
  const isGeist = appearance === "geist";
  const src = media.fileUrl;

  if (!src) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center",
          isGeist ? "bg-[var(--ds-gray-100)]" : "bg-[hsl(var(--surface-raised))]"
        )}
      >
        <ImageIcon
          className={cn(
            "h-4 w-4",
            isGeist
              ? "text-[var(--ds-gray-900)]"
              : "text-[hsl(var(--foreground-subtle))]"
          )}
        />
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

export function CollectionCard({
  collection,
  href,
  appearance = "default",
}: CollectionCardProps) {
  const router = useRouter();
  const isGeist = appearance === "geist";

  const statusCfg =
    (isGeist ? GEIST_STATUS_CONFIG : DEFAULT_STATUS_CONFIG)[
      collection.overallStatus as keyof typeof DEFAULT_STATUS_CONFIG
    ] ??
    (isGeist ? GEIST_STATUS_CONFIG.SCHEDULED : DEFAULT_STATUS_CONFIG.SCHEDULED);
  const typeCfg =
    TYPE_CONFIG[collection.postCollectionType as keyof typeof TYPE_CONFIG] ??
    TYPE_CONFIG.TEXT;
  const TypeIcon = typeCfg.Icon;
  const recoveryBadge =
    collection.failureState === "RECOVERED"
      ? (isGeist ? GEIST_RECOVERY_BADGE_CONFIG : DEFAULT_RECOVERY_BADGE_CONFIG)[
          collection.failureState as keyof typeof DEFAULT_RECOVERY_BADGE_CONFIG
        ]
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
        "group flex h-full flex-col overflow-hidden rounded-lg border transition-[box-shadow,border-color,background-color] duration-150",
        isGeist
          ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-none hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-blue-600)] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_0.0625rem_0.125rem_rgb(0 0 0 / 0.08)] hover:border-[hsl(var(--accent))]/30 hover:shadow-[0_0.375rem_0.75rem_rgb(0 0 0 / 0.12)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30 focus:ring-offset-2"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2.5",
          isGeist
            ? "border-b border-[var(--ds-gray-400)]"
            : "border-b border-[hsl(var(--border-subtle))]"
        )}
      >
        <div className="flex min-w-0 items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[0.625rem] font-semibold",
              isGeist
                ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground))]"
            )}
          >
            <TypeIcon className="h-3 w-3" />
            {typeCfg.label}
          </span>
          {recoveryBadge && (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-1 text-[0.625rem] font-semibold",
                recoveryBadge.className
              )}
            >
              {recoveryBadge.label}
            </span>
          )}
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[0.625rem] font-semibold",
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
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[0.625rem] font-semibold",
              isGeist
                ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]"
                : "border-orange-200 bg-orange-50 text-orange-700"
            )}
          >
            Escalated
          </span>
        )}
        {approvalOverdue && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[0.625rem] font-semibold",
              isGeist
                ? "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]"
                : "border-amber-200 bg-amber-50 text-amber-700"
            )}
          >
            Reminder due
          </span>
        )}
      </div>

      <div className="flex gap-3 px-3 py-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "line-clamp-2 text-[0.875rem] font-semibold leading-5 transition-colors",
              isGeist
                ? "text-[var(--ds-gray-1000)] group-hover:text-[var(--ds-blue-700)]"
                : "text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--accent))]"
            )}
          >
            {collection.description || "No content"}
          </p>

          <div
            className={cn(
              "mt-3 flex items-center gap-1.5 text-[0.6875rem]",
              isGeist
                ? "text-[var(--ds-gray-900)]"
                : "text-[hsl(var(--foreground-muted))]"
            )}
          >
            <Calendar
              className={cn(
                "h-3.5 w-3.5",
                isGeist
                  ? "text-[var(--ds-gray-900)]"
                  : "text-[hsl(var(--foreground-subtle))]"
              )}
            />
            <span className="truncate">{formattedDate}</span>
            {formattedTime && <span>{formattedTime}</span>}
            {timeLabel && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-semibold",
                  timeLabel.urgent
                    ? isGeist
                      ? "text-[var(--ds-amber-700)]"
                      : "text-orange-600 dark:text-orange-400"
                    : isGeist
                      ? "text-[var(--ds-gray-900)]"
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
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md border",
                      isGeist
                        ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5",
                        (isGeist ? GEIST_PLATFORM_STYLE : PLATFORM_STYLE)[platform.toLowerCase()] ??
                          (isGeist
                            ? "text-[var(--ds-gray-900)]"
                            : "text-[hsl(var(--foreground-muted))]")
                      )}
                    />
                  </span>
                );
              })}
              {hiddenPlatformCount > 0 && (
                <span
                  className={cn(
                    "flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-[0.625rem] font-semibold",
                    isGeist
                      ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]"
                  )}
                >
                  +{hiddenPlatformCount}
                </span>
              )}
            </div>

            {uniqueAccounts.length > 0 && (
              <div className="flex flex-shrink-0 items-center">
                {uniqueAccounts.slice(0, 3).map((account, i) => (
                  <div
                    key={account.providerUserId}
                    className={cn(
                      "relative h-7 w-7 overflow-hidden rounded-full border-2",
                      isGeist
                        ? "border-[var(--ds-background-100)] bg-[var(--ds-gray-200)]"
                        : "border-[hsl(var(--surface))] bg-[hsl(var(--surface-sunken))]"
                    )}
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
                      <div
                        className={cn(
                          "flex h-full w-full items-center justify-center text-[0.5625rem] font-bold",
                          isGeist
                            ? "text-[var(--ds-gray-900)]"
                            : "text-[hsl(var(--foreground-muted))]"
                        )}
                      >
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
            appearance={appearance}
          />
        </div>
      </div>

      <div
        className={cn(
          "mt-auto flex items-center justify-between px-3 py-2.5",
          isGeist
            ? "border-t border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]"
            : "border-t border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]"
        )}
      >
        <span
          className={cn(
            "text-[0.6875rem]",
            isGeist
              ? "text-[var(--ds-gray-900)]"
              : "text-[hsl(var(--foreground-muted))]"
          )}
        >
          {collection.posts.length} post{collection.posts.length !== 1 ? "s" : ""} · {uniquePlatforms.length} platform{uniquePlatforms.length !== 1 ? "s" : ""}
        </span>
        <span
          className={cn(
            "flex items-center gap-1 text-[0.6875rem] font-semibold",
            isGeist
              ? "text-[var(--ds-blue-700)]"
              : "text-[hsl(var(--accent))]"
          )}
        >
          <span>Open</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </article>
  );
}

"use client";

import { ImageIcon, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaResponse } from "@/model/MediaResponse";
import {
  getPostCollaborationAnnotationMode,
  type PostCollaborationThread,
} from "@/model/PostCollaboration";

function isVideoMedia(media: MediaResponse | null | undefined) {
  return !!media?.mimeType?.startsWith("video/");
}

export function PostCollaborationAnnotationView({
  thread,
  media,
  className,
  appearance = "default",
}: {
  thread: Pick<
    PostCollaborationThread,
    | "anchorStart"
    | "anchorEnd"
    | "anchorText"
    | "mediaId"
    | "mediaMarkerX"
    | "mediaMarkerY"
  >;
  media: MediaResponse[];
  className?: string;
  appearance?: "default" | "geist";
}) {
  const isGeist = appearance === "geist";
  const annotationMode = getPostCollaborationAnnotationMode(thread as PostCollaborationThread);
  if (annotationMode === "NONE") {
    return null;
  }

  if (annotationMode === "CAPTION") {
    return (
      <div
        className={cn(
          "mt-4 rounded-lg border p-3",
          isGeist
            ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]"
            : "border-[hsl(var(--border))] bg-[hsl(var(--surface))]",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Type className={cn("h-4 w-4", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-muted))]")} />
          <p className={cn("text-xs font-medium uppercase tracking-[0.16em]", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")}>
            Caption annotation
          </p>
        </div>
        <p className={cn("mt-2 whitespace-pre-wrap text-sm", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-muted))]")}>
          {thread.anchorText && thread.anchorText.length > 0
            ? thread.anchorText
            : "Insertion point"}
        </p>
      </div>
    );
  }

  const targetMedia = media.find((item) => item.id === thread.mediaId) ?? null;
  return (
    <div
      className={cn(
        "mt-4 rounded-lg border p-3",
        isGeist
          ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--surface))]",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <ImageIcon className={cn("h-4 w-4", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-muted))]")} />
        <p className={cn("text-xs font-medium uppercase tracking-[0.16em]", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")}>
          Media annotation
        </p>
      </div>

      {targetMedia ? (
        <div className="mt-3">
          <div
            className={cn(
              "relative inline-block overflow-hidden rounded-lg border bg-black/5",
              isGeist ? "border-[var(--ds-gray-400)]" : "border-[hsl(var(--border-subtle))]"
            )}
          >
            {isVideoMedia(targetMedia) ? (
              <video
                src={targetMedia.fileUrl}
                className="block max-h-[17.5rem] max-w-full"
                muted
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={targetMedia.fileUrl}
                alt={targetMedia.fileName}
                className="block max-h-[17.5rem] max-w-full"
              />
            )}

            {thread.mediaMarkerX !== null && thread.mediaMarkerY !== null && (
              <div
                className={cn(
                  "pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_0.1875rem_rgb(0_0_0_/_0.18)]",
                  isGeist ? "bg-[hsl(var(--accent))]" : "bg-[hsl(var(--accent))]"
                )}
                style={{
                  left: `${thread.mediaMarkerX * 100}%`,
                  top: `${thread.mediaMarkerY * 100}%`,
                }}
              />
            )}
          </div>
          <p className={cn("mt-2 text-sm", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-muted))]")}>
            {targetMedia.fileName}
          </p>
        </div>
      ) : (
        <p className={cn("mt-2 text-sm", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-muted))]")}>
          The referenced media is no longer available on this collection.
        </p>
      )}
    </div>
  );
}

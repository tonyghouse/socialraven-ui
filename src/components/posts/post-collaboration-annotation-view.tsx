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
}) {
  const annotationMode = getPostCollaborationAnnotationMode(thread as PostCollaborationThread);
  if (annotationMode === "NONE") {
    return null;
  }

  if (annotationMode === "CAPTION") {
    return (
      <div
        className={cn(
          "mt-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
            Caption annotation
          </p>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm text-[hsl(var(--foreground-muted))]">
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
        "mt-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
          Media annotation
        </p>
      </div>

      {targetMedia ? (
        <div className="mt-3">
          <div className="relative inline-block overflow-hidden rounded-lg border border-[hsl(var(--border-subtle))] bg-black/5">
            {isVideoMedia(targetMedia) ? (
              <video
                src={targetMedia.fileUrl}
                className="block max-h-[280px] max-w-full"
                muted
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={targetMedia.fileUrl}
                alt={targetMedia.fileName}
                className="block max-h-[280px] max-w-full"
              />
            )}

            {thread.mediaMarkerX !== null && thread.mediaMarkerY !== null && (
              <div
                className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[hsl(var(--accent))] shadow-[0_0_0_3px_rgba(9,30,66,0.18)]"
                style={{
                  left: `${thread.mediaMarkerX * 100}%`,
                  top: `${thread.mediaMarkerY * 100}%`,
                }}
              />
            )}
          </div>
          <p className="mt-2 text-sm text-[hsl(var(--foreground-muted))]">
            {targetMedia.fileName}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-[hsl(var(--foreground-muted))]">
          The referenced media is no longer available on this collection.
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import { ImageIcon, MousePointer2, Type } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { MediaResponse } from "@/model/MediaResponse";
import type { PostCollaborationAnnotationMode } from "@/model/PostCollaboration";

export type CollaborationCaptionSelection = {
  start: number;
  end: number;
  text: string;
};

export type CollaborationMediaAnnotation = {
  mediaId: number | null;
  mediaMarkerX: number | null;
  mediaMarkerY: number | null;
};

export function buildFullCaptionSelection(
  description: string
): CollaborationCaptionSelection {
  return {
    start: 0,
    end: description.length,
    text: description,
  };
}

function isVideoMedia(media: MediaResponse | null | undefined) {
  return !!media?.mimeType?.startsWith("video/");
}

export function PostCollaborationAnnotationEditor({
  description,
  media,
  mode,
  onModeChange,
  captionSelection,
  onCaptionSelectionChange,
  mediaAnnotation,
  onMediaAnnotationChange,
  disabled = false,
  appearance = "default",
}: {
  description: string;
  media: MediaResponse[];
  mode: PostCollaborationAnnotationMode;
  onModeChange: (mode: PostCollaborationAnnotationMode) => void;
  captionSelection: CollaborationCaptionSelection;
  onCaptionSelectionChange: (selection: CollaborationCaptionSelection) => void;
  mediaAnnotation: CollaborationMediaAnnotation;
  onMediaAnnotationChange: (annotation: CollaborationMediaAnnotation) => void;
  disabled?: boolean;
  appearance?: "default" | "geist";
}) {
  const isGeist = appearance === "geist";
  const captionSelectionRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedMedia = useMemo(() => {
    if (media.length === 0) {
      return null;
    }
    return (
      media.find((item) => item.id === mediaAnnotation.mediaId) ??
      media[0] ??
      null
    );
  }, [media, mediaAnnotation.mediaId]);

  useEffect(() => {
    if (mode !== "MEDIA" || media.length === 0 || selectedMedia !== null) {
      return;
    }
    onMediaAnnotationChange({
      mediaId: media[0].id,
      mediaMarkerX: null,
      mediaMarkerY: null,
    });
  }, [media, mode, onMediaAnnotationChange, selectedMedia]);

  function handleCaptionSelection() {
    const node = captionSelectionRef.current;
    if (!node) return;

    const start = node.selectionStart ?? 0;
    const end = node.selectionEnd ?? start;
    const text = description.slice(start, end);
    onCaptionSelectionChange({ start, end, text });
  }

  function handleMediaPlacement(event: React.MouseEvent<HTMLDivElement>) {
    if (!selectedMedia || disabled) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const mediaMarkerX = Math.min(
      1,
      Math.max(0, (event.clientX - bounds.left) / bounds.width)
    );
    const mediaMarkerY = Math.min(
      1,
      Math.max(0, (event.clientY - bounds.top) / bounds.height)
    );
    onMediaAnnotationChange({
      mediaId: selectedMedia.id,
      mediaMarkerX,
      mediaMarkerY,
    });
  }

  const selectionSummary =
    captionSelection.text.length > 0
      ? captionSelection.text
      : description.length > 0
      ? `Insertion point at character ${captionSelection.start + 1}`
      : "No caption available to annotate.";

  return (
    <div
      className={cn(
        "space-y-4 rounded-lg border p-4",
        isGeist
          ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--surface))]"
      )}
    >
      <div className="space-y-2">
        <p className={cn("text-sm font-medium", isGeist ? "text-[var(--ds-gray-1000)]" : "text-[hsl(var(--foreground))]")}>
          Annotation target
        </p>
        <div className="flex flex-wrap gap-2">
          {([
            {
              value: "NONE",
              label: "General comment",
              Icon: MousePointer2,
            },
            {
              value: "CAPTION",
              label: "Caption annotation",
              Icon: Type,
            },
            {
              value: "MEDIA",
              label: "Media annotation",
              Icon: ImageIcon,
            },
          ] as const).map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              disabled={disabled || (value === "MEDIA" && media.length === 0)}
              onClick={() => onModeChange(value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                mode === value
                  ? isGeist
                    ? "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
                    : "border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                  : isGeist
                    ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))]",
                (disabled || (value === "MEDIA" && media.length === 0)) &&
                  "cursor-not-allowed opacity-60"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {mode === "CAPTION" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <p className={cn("text-sm font-medium", isGeist ? "text-[var(--ds-gray-1000)]" : "text-[hsl(var(--foreground))]")}>
              Select the caption text to anchor
            </p>
            <Textarea
              ref={captionSelectionRef}
              value={description}
              readOnly
              disabled={disabled}
              onSelect={handleCaptionSelection}
              className={cn(
                "min-h-[8.75rem]",
                isGeist
                  ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                  : "bg-[hsl(var(--surface-raised))]"
              )}
            />
          </div>
          <div
            className={cn(
              "rounded-lg border border-dashed px-3 py-2.5",
              isGeist
                ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]"
                : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]"
            )}
          >
            <p className={cn("text-xs font-medium uppercase tracking-[0.16em]", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")}>
              Current selection
            </p>
            <p className={cn("mt-1 whitespace-pre-wrap text-sm", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-muted))]")}>
              {selectionSummary}
            </p>
          </div>
        </div>
      )}

      {mode === "MEDIA" && (
        <div className="space-y-3">
          {media.length === 0 ? (
            <p className={cn("text-sm", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-muted))]")}>
              No media is attached to this post yet.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {media.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onMediaAnnotationChange({
                        mediaId: item.id,
                        mediaMarkerX:
                          item.id === mediaAnnotation.mediaId
                            ? mediaAnnotation.mediaMarkerX
                            : null,
                        mediaMarkerY:
                          item.id === mediaAnnotation.mediaId
                            ? mediaAnnotation.mediaMarkerY
                            : null,
                      })
                    }
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      item.id === selectedMedia?.id
                        ? isGeist
                          ? "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
                          : "border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                        : isGeist
                          ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)]"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))]",
                      disabled && "cursor-not-allowed opacity-60"
                    )}
                  >
                    {item.fileName}
                  </button>
                ))}
              </div>

              {selectedMedia && (
                <div className="space-y-2">
                  <p className={cn("text-sm font-medium", isGeist ? "text-[var(--ds-gray-1000)]" : "text-[hsl(var(--foreground))]")}>
                    Click the media to place the annotation marker
                  </p>
                  <div
                    className={cn(
                      "rounded-lg border p-3",
                      isGeist
                        ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]"
                    )}
                  >
                    <div
                      onClick={handleMediaPlacement}
                      className={cn(
                        "relative inline-block overflow-hidden rounded-lg border bg-black/5",
                        isGeist ? "border-[var(--ds-gray-400)]" : "border-[hsl(var(--border-subtle))]",
                        disabled ? "cursor-not-allowed" : "cursor-crosshair"
                      )}
                    >
                      {isVideoMedia(selectedMedia) ? (
                        <video
                          src={selectedMedia.fileUrl}
                          className="block max-h-[22.5rem] max-w-full"
                          muted
                          playsInline
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedMedia.fileUrl}
                          alt={selectedMedia.fileName}
                          className="block max-h-[22.5rem] max-w-full"
                        />
                      )}

                      {mediaAnnotation.mediaId === selectedMedia.id &&
                        mediaAnnotation.mediaMarkerX !== null &&
                        mediaAnnotation.mediaMarkerY !== null && (
                          <div
                            className={cn(
                              "pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_0.1875rem_rgb(0_0_0_/_0.18)]",
                              isGeist ? "bg-[hsl(var(--accent))]" : "bg-[hsl(var(--accent))]"
                            )}
                            style={{
                              left: `${mediaAnnotation.mediaMarkerX * 100}%`,
                              top: `${mediaAnnotation.mediaMarkerY * 100}%`,
                            }}
                          />
                        )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

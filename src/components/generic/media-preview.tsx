"use client";

import { useState } from "react";
import { FileImage, FileVideo, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Media {
  url: string;
  type?: "IMAGE" | "VIDEO" | "DOCUMENT";
  name?: string;
}

interface MediaPreviewProps {
  media: Media;
  className?: string;
  showLightbox?: boolean;
}

export function MediaPreview({
  media,
  className,
  showLightbox = true,
}: MediaPreviewProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isImage = media.type === "IMAGE" || 
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(media.url);
  const isVideo = media.type === "VIDEO" || 
    /\.(mp4|webm|ogg|mov)$/i.test(media.url);

  const handleClick = () => {
    if (showLightbox && (isImage || isVideo)) {
      setIsLightboxOpen(true);
    }
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          "relative rounded-lg overflow-hidden bg-muted border border-border",
          "group transition-all hover:shadow-md",
          showLightbox && (isImage || isVideo) && "cursor-pointer",
          className || "h-20 w-20"
        )}
      >
        {!hasError && isImage ? (
          <>
            <Image
              src={media.url}
              alt={media.name || "Media preview"}
              onError={handleError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {showLightbox && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                transition-opacity flex items-center justify-center">
                <FileImage className="h-6 w-6 text-white" />
              </div>
            )}
          </>
        ) : !hasError && isVideo ? (
          <>
            <video
              src={media.url}
              onError={handleError}
              className="w-full h-full object-cover"
              muted
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center 
              group-hover:bg-black/50 transition-colors">
              <FileVideo className="h-6 w-6 text-white" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <File className="h-6 w-6 text-muted-foreground mb-1" />
            {media.name && (
              <p className="text-[10px] text-muted-foreground text-center line-clamp-2">
                {media.name}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 
            animate-in fade-in duration-200"
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 
              hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close preview"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {isImage ? (
              <Image
                src={media.url}
                alt={media.name || "Media preview"}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : isVideo ? (
              <video
                src={media.url}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
          </div>

          {media.name && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 
              text-white px-4 py-2 rounded-full text-sm">
              {media.name}
            </div>
          )}
        </div>
      )}
    </>
  );
}
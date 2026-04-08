"use client";

import Image from "next/image";
import { Film, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComposerLibraryAsset } from "@/lib/workspace-library";

export function SelectedLibraryAssets({
  assets,
  onRemove,
  appearance = "default",
}: {
  assets: ComposerLibraryAsset[];
  onRemove: (fileKey: string) => void;
  appearance?: "default" | "geist";
}) {
  const isGeist = appearance === "geist";
  if (assets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className={cn(isGeist ? "text-copy-12 text-[var(--ds-gray-900)]" : "text-xs font-medium text-[hsl(var(--foreground-muted))]")}>
        Library assets attached to this post
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <div
            key={asset.fileKey}
            className={cn("overflow-hidden rounded-xl border", isGeist ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]" : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]")}
          >
            <div className={cn("relative h-36", isGeist ? "bg-[var(--ds-background-100)]" : "bg-[hsl(var(--surface))]")}>
              {asset.mimeType.startsWith("video/") ? (
                <video src={asset.fileUrl ?? undefined} className="h-full w-full object-contain" muted />
              ) : asset.fileUrl ? (
                <Image src={asset.fileUrl} alt={asset.fileName} fill className="object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className={cn("h-6 w-6", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")} />
                </div>
              )}
            </div>
            <div className="space-y-2 px-3 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={cn("truncate", isGeist ? "text-label-14 text-[var(--ds-gray-1000)]" : "text-sm font-medium text-[hsl(var(--foreground))]")}>{asset.fileName}</p>
                  <p className={cn("truncate", isGeist ? "text-copy-12 text-[var(--ds-gray-900)]" : "text-xs text-[hsl(var(--foreground-muted))]")}>{asset.sourceItemName}</p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(asset.fileKey)} className={cn(isGeist && "text-[var(--ds-gray-900)] hover:bg-[var(--ds-background-100)] hover:text-[var(--ds-gray-1000)]")}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className={cn("flex items-center gap-2", isGeist ? "text-copy-12 text-[var(--ds-gray-900)]" : "text-xs text-[hsl(var(--foreground-subtle))]")}>
                {asset.mimeType.startsWith("video/") ? (
                  <Film className="h-3.5 w-3.5" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5" />
                )}
                <span>{asset.postCollectionType === "VIDEO" ? "Video asset" : "Image asset"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

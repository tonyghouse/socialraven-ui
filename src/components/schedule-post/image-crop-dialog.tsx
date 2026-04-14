"use client";

import { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Crop, X } from "lucide-react";

// ── Ratio presets ─────────────────────────────────────────────────────────────

const PRESETS = [
  { label: "Original", ratio: null  as number | null },
  { label: "1:1",      ratio: 1     as number | null },
  { label: "4:5",      ratio: 4 / 5 as number | null },
  { label: "16:9",     ratio: 16/ 9 as number | null },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCropRegion(
  w: number,
  h: number,
  ratio: number | null,
): { x: number; y: number; w: number; h: number } {
  if (ratio === null) return { x: 0, y: 0, w, h };
  const natural = w / h;
  if (natural > ratio) {
    // too wide — crop sides, keep full height
    const cw = Math.round(h * ratio);
    return { x: Math.round((w - cw) / 2), y: 0, w: cw, h };
  } else {
    // too tall — crop top/bottom, keep full width
    const ch = Math.round(w / ratio);
    return { x: 0, y: Math.round((h - ch) / 2), w, h: ch };
  }
}

async function cropToFile(
  imgUrl: string,
  region: { x: number; y: number; w: number; h: number },
  original: File,
): Promise<File> {
  const img = new window.Image();
  await new Promise<void>((res) => { img.onload = () => res(); img.src = imgUrl; });
  const canvas = document.createElement("canvas");
  canvas.width  = region.w;
  canvas.height = region.h;
  canvas.getContext("2d")!.drawImage(
    img, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h,
  );
  return new Promise<File>((res, rej) =>
    canvas.toBlob((blob) => {
      if (!blob) { rej(new Error("canvas toBlob failed")); return; }
      res(new File([blob], original.name, { type: original.type }));
    }, original.type),
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  file: File | null;
  open: boolean;
  onClose: () => void;
  onCrop: (croppedFile: File) => void;
}

export default function ImageCropDialog({ file, open, onClose, onCrop }: Props) {
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [dim, setDim]     = useState<{ w: number; h: number } | null>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [applying, setApplying] = useState(false);

  // Reset + load image whenever file changes
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    setSelectedRatio(null);
    const img = new window.Image();
    img.onload = () => setDim({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const region = dim ? getCropRegion(dim.w, dim.h, selectedRatio) : null;

  async function apply() {
    if (!file || !imgUrl || !region || applying) return;
    setApplying(true);
    try {
      const cropped = await cropToFile(imgUrl, region, file);
      onCrop(cropped);
      onClose();
    } finally {
      setApplying(false);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-sm rounded-2xl border bg-background p-5 shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2",
            "data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crop className="w-4 h-4 text-muted-foreground" />
              <DialogPrimitive.Title className="text-sm font-semibold">
                Crop Image
              </DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <div className="space-y-4">
            {/* Ratio preset buttons */}
            <div className="flex gap-2">
              {PRESETS.map(({ label, ratio }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedRatio(ratio)}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors",
                    selectedRatio === ratio
                      ? "bg-primary !text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Live crop preview */}
            {imgUrl && region && dim && (
              <div
                className="relative overflow-hidden rounded-xl bg-muted/30 mx-auto w-full"
                style={{ aspectRatio: `${region.w} / ${region.h}` }}
              >
                {/*
                  Math: container is CW × CH where CH = CW × (region.h / region.w).
                  We want to show only the crop region of the full image.
                  - img displayed width  = (dim.w / region.w) × CW  → (dim.w/region.w)*100% of CW
                  - img left             = -(region.x / region.w) × CW → -(region.x/region.w)*100% of CW
                  - img top              = -(region.y / region.h) × CH → -(region.y/region.h)*100% of CH
                    (CSS `top` % is relative to containing block height for abs elements)
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt="crop preview"
                  className="absolute h-auto"
                  style={{
                    width: `${(dim.w / region.w) * 100}%`,
                    left:  `-${(region.x / region.w) * 100}%`,
                    top:   `-${(region.y / region.h) * 100}%`,
                  }}
                />
              </div>
            )}

            {region && (
              <p className="text-[0.6875rem] text-muted-foreground text-center">
                {region.w} × {region.h} px
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                size="sm"
                onClick={apply}
                disabled={applying}
              >
                {applying ? "Applying…" : "Apply Crop"}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

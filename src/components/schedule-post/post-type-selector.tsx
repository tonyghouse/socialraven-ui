"use client";

import { PostType } from "@/model/PostType";
import { cn } from "@/lib/utils";
import { ImageIcon, Video, Type } from "lucide-react";

const TYPES = [
  {
    value: "IMAGE" as PostType,
    label: "Image",
    Icon: ImageIcon,
    description: "Photos & graphics",
  },
  {
    value: "VIDEO" as PostType,
    label: "Video",
    Icon: Video,
    description: "Reels & clips",
  },
  {
    value: "TEXT" as PostType,
    label: "Text",
    Icon: Type,
    description: "Updates & threads",
  },
];

interface Props {
  postType: PostType | null;
  setPostType: (v: PostType) => void;
}

export default function PostTypeSelector({ postType, setPostType }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TYPES.map(({ value, label, Icon, description }) => {
        const selected = postType === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setPostType(value)}
            className={cn(
              "group relative flex flex-col items-center gap-2.5 rounded-xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/35",
              selected
                ? "border-[hsl(var(--accent))]/30 bg-surface shadow-sm"
                : "border-border-subtle bg-surface hover:border-[hsl(var(--accent))]/20 hover:bg-surface-raised"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-150",
                selected
                  ? "border-[hsl(var(--accent))]/18 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                  : "border-border-subtle bg-surface-raised text-foreground-muted group-hover:text-[hsl(var(--accent))]"
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className={cn("text-sm font-semibold leading-tight", selected ? "text-[hsl(var(--accent))]" : "text-foreground")}>
                {label}
              </div>
              <div className="mt-0.5 text-xs leading-tight text-foreground-muted">{description}</div>
            </div>
            {selected && (
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

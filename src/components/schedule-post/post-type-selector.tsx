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
              "group relative flex flex-col items-center gap-2.5 rounded-xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]",
              selected
                ? "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] shadow-sm"
                : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] hover:border-[var(--ds-plum-200)] hover:bg-[var(--ds-gray-100)]"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-150",
                selected
                  ? "border-[var(--ds-plum-200)] bg-[var(--ds-background-100)] text-[var(--ds-plum-700)]"
                  : "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] group-hover:text-[var(--ds-plum-700)]"
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div
                className={cn(
                  "text-label-14 leading-tight",
                  selected ? "text-[var(--ds-plum-700)]" : "text-[var(--ds-gray-1000)]"
                )}
              >
                {label}
              </div>
              <div className="mt-0.5 text-copy-12 leading-tight text-[var(--ds-gray-900)]">{description}</div>
            </div>
            {selected && (
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[var(--ds-plum-700)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

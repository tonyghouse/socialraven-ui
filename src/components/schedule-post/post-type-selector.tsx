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
  postType: PostType;
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
              "relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              selected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/40 hover:bg-accent/30"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                selected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className={cn("text-sm font-semibold leading-tight", selected ? "text-primary" : "text-foreground")}>
                {label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{description}</div>
            </div>
            {selected && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

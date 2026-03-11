"use client";

import { cn } from "@/lib/utils";
import { PLATFORM_CHAR_LIMITS, PLATFORM_DISPLAY_NAMES } from "@/lib/platformLimits";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";

interface Props {
  /** Lowercase platform names that are currently selected */
  platforms: string[];
  charCount: number;
}

export default function PlatformCharLimits({ platforms, charCount }: Props) {
  const relevant = platforms.filter((p) => PLATFORM_CHAR_LIMITS[p] !== undefined);
  if (relevant.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
      <div className="px-3 py-2 border-b border-border/40 bg-muted/30">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          Character limits by platform
        </p>
      </div>
      <div className="px-3 py-2.5 space-y-2.5">
        {relevant.map((platform) => {
          const limit = PLATFORM_CHAR_LIMITS[platform];
          const pct = Math.min((charCount / limit) * 100, 100);
          const over = charCount > limit;
          const near = !over && pct > 80;
          const Icon = PLATFORM_ICONS[platform];
          const remaining = limit - charCount;

          return (
            <div key={platform} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {Icon && (
                    <Icon
                      className={cn(
                        "w-3 h-3 flex-shrink-0",
                        over ? "text-red-500" : near ? "text-amber-500" : "text-muted-foreground"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "text-xs font-medium truncate",
                      over ? "text-red-600" : "text-foreground"
                    )}
                  >
                    {PLATFORM_DISPLAY_NAMES[platform] ?? platform}
                  </span>
                  {over && (
                    <span className="flex-shrink-0 text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1 py-px leading-none uppercase tracking-wide">
                      Over limit
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] tabular-nums font-mono flex-shrink-0",
                    over ? "text-red-600 font-semibold" : near ? "text-amber-500" : "text-muted-foreground"
                  )}
                >
                  {over
                    ? `+${(charCount - limit).toLocaleString()} over`
                    : `${remaining.toLocaleString()} left`}
                </span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-200",
                    over ? "bg-red-500" : near ? "bg-amber-400" : "bg-primary/60"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

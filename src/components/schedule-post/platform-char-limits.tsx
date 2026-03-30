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
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
      <div className="border-b border-border-subtle bg-surface-raised px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground-muted">
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
                        over ? "text-destructive" : near ? "text-warning" : "text-foreground-muted"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "text-xs font-medium truncate",
                      over ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {PLATFORM_DISPLAY_NAMES[platform] ?? platform}
                  </span>
                  {over && (
                    <span className="flex-shrink-0 rounded border border-destructive/20 bg-destructive/10 px-1 py-px text-[9px] font-bold uppercase leading-none tracking-wide text-destructive">
                      Over limit
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] tabular-nums font-mono flex-shrink-0",
                    over ? "font-semibold text-destructive" : near ? "text-warning" : "text-foreground-muted"
                  )}
                >
                  {over
                    ? `+${(charCount - limit).toLocaleString()} over`
                    : `${remaining.toLocaleString()} left`}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-surface-raised">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-200",
                    over ? "bg-destructive" : near ? "bg-warning" : "bg-[hsl(var(--accent))]"
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

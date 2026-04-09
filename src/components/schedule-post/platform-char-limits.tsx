"use client";

import { cn } from "@/lib/utils";
import { PLATFORM_CHAR_LIMITS, PLATFORM_DISPLAY_NAMES } from "@/lib/platformLimits";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";

interface Props {
  /** Lowercase platform names that are currently selected */
  platforms: string[];
  charCount: number;
  appearance?: "default" | "geist";
}

export default function PlatformCharLimits({
  platforms,
  charCount,
  appearance = "default",
}: Props) {
  const isGeist = appearance === "geist";
  const relevant = platforms.filter((p) => PLATFORM_CHAR_LIMITS[p] !== undefined);
  if (relevant.length === 0) return null;

  return (
    <div className={cn("overflow-hidden rounded-xl border", isGeist ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]" : "border-border-subtle bg-surface")}>
      <div className={cn("border-b px-3 py-2", isGeist ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]" : "border-border-subtle bg-surface-raised")}>
        <p className={cn("text-[0.625rem] font-semibold uppercase tracking-[0.08em]", isGeist ? "text-[var(--ds-gray-900)]" : "text-foreground-muted")}>
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
                        over
                          ? isGeist ? "text-[var(--ds-red-700)]" : "text-destructive"
                          : near
                            ? isGeist ? "text-[var(--ds-amber-700)]" : "text-warning"
                            : isGeist ? "text-[var(--ds-gray-900)]" : "text-foreground-muted"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "text-xs font-medium truncate",
                      over
                        ? isGeist ? "text-[var(--ds-red-700)]" : "text-destructive"
                        : isGeist ? "text-[var(--ds-gray-1000)]" : "text-foreground"
                    )}
                  >
                    {PLATFORM_DISPLAY_NAMES[platform] ?? platform}
                  </span>
                  {over && (
                    <span className={cn("flex-shrink-0 rounded border px-1 py-px text-[0.5625rem] font-bold uppercase leading-none tracking-wide", isGeist ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]" : "border-destructive/20 bg-destructive/10 text-destructive")}>
                      Over limit
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[0.6875rem] tabular-nums font-mono flex-shrink-0",
                    over
                      ? isGeist ? "font-semibold text-[var(--ds-red-700)]" : "font-semibold text-destructive"
                      : near
                        ? isGeist ? "text-[var(--ds-amber-700)]" : "text-warning"
                        : isGeist ? "text-[var(--ds-gray-900)]" : "text-foreground-muted"
                  )}
                >
                  {over
                    ? `+${(charCount - limit).toLocaleString()} over`
                    : `${remaining.toLocaleString()} left`}
                </span>
              </div>
              <div className={cn("h-1 overflow-hidden rounded-full", isGeist ? "bg-[var(--ds-gray-200)]" : "bg-surface-raised")}>
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-200",
                    over
                      ? isGeist ? "bg-[var(--ds-red-600)]" : "bg-destructive"
                      : near
                        ? isGeist ? "bg-[var(--ds-amber-600)]" : "bg-warning"
                        : isGeist ? "bg-[var(--ds-blue-600)]" : "bg-[hsl(var(--accent))]"
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

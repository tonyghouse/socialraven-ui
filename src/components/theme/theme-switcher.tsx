"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ThemeSwitcherProps = {
  compact?: boolean;
  align?: "start" | "center" | "end";
  className?: string;
};

export function ThemeSwitcher({
  compact = false,
  align = "end",
  className,
}: ThemeSwitcherProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className={cn(
        "group inline-flex items-center border transition-[background-color,border-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]",
        compact
          ? "h-9 w-9 justify-center rounded-md border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
          : "h-9 w-full justify-between rounded-lg border-border/70 bg-background/70 px-3 text-foreground hover:bg-muted",
        className
      )}
      data-align={align}
    >
      {!compact && (
        <span className="text-[13px] font-medium text-foreground/80">
          {isDark ? "Dark mode" : "Light mode"}
        </span>
      )}

      {compact ? (
        <span className="relative h-4 w-4">
          <Sun
            className={cn(
              "absolute inset-0 h-4 w-4 transition-all duration-200",
              isDark ? "scale-75 rotate-45 opacity-0" : "scale-100 rotate-0 opacity-100"
            )}
          />
          <Moon
            className={cn(
              "absolute inset-0 h-4 w-4 transition-all duration-200",
              isDark ? "scale-100 rotate-0 opacity-100" : "scale-75 -rotate-45 opacity-0"
            )}
          />
        </span>
      ) : (
        <span
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors",
            isDark
              ? "border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/85"
              : "border-border bg-[hsl(var(--surface-raised))]"
          )}
        >
          <span
            className={cn(
              "absolute left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[hsl(var(--accent))] shadow-sm transition-transform",
              isDark && "translate-x-4"
            )}
          >
            {isDark ? <Moon size={10} /> : <Sun size={10} />}
          </span>
        </span>
      )}
    </button>
  );
}

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
        "group inline-flex items-center rounded-lg border border-border/70 bg-background/70 text-foreground transition-[background-color,border-color,color] hover:bg-muted",
        compact
          ? "h-8 w-14 justify-center px-1"
          : "h-9 w-full justify-between px-3",
        className
      )}
      data-align={align}
    >
      {!compact && (
        <span className="text-[13px] font-medium text-foreground/80">
          {isDark ? "Dark mode" : "Light mode"}
        </span>
      )}

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
    </button>
  );
}

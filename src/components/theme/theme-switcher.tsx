"use client";

import { Button } from "@vibe/core";
import { Moon, Sun } from "@vibe/icons";
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
  const ThemeIcon = isDark ? Moon : Sun;

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      kind="secondary"
      size={compact ? "small" : "medium"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      onClick={toggleTheme}
      className={cn(
        "justify-center !border-[var(--ui-border-color)] !bg-[var(--primary-background-color)] !text-[var(--primary-text-color)] hover:!border-[var(--primary-text-color)] hover:!bg-[var(--primary-background-hover-color)]",
        compact
          ? "!h-9 !w-9 !rounded-[0.875rem] !px-0"
          : "min-w-[10rem] !rounded-[0.875rem]",
        align === "start" && "justify-start",
        align === "center" && "justify-center",
        align === "end" && !compact && "justify-between",
        className
      )}
    >
      {compact ? (
        <ThemeIcon className="h-4 w-4" />
      ) : (
        <span className="flex w-full items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2">
            <ThemeIcon className="h-4 w-4" />
            <span>{isDark ? "Dark mode" : "Light mode"}</span>
          </span>
          <span
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors",
              isDark
                ? "border-[var(--primary-color)] bg-[var(--primary-color)]"
                : "border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)]"
            )}
          >
            <span
              className={cn(
                "absolute left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[var(--primary-color)] shadow-sm transition-transform",
                isDark && "translate-x-4"
              )}
            >
              <ThemeIcon className="h-3 w-3" />
            </span>
          </span>
        </span>
      )}
    </Button>
  );
}

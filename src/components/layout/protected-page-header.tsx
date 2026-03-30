"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ProtectedPageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function ProtectedPageHeader({
  title,
  description,
  icon,
  leading,
  actions,
  className,
}: ProtectedPageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))]/95 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex h-[60px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {leading}
          {icon ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--accent))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-semibold tracking-[-0.01em] text-[hsl(var(--foreground))]">
              {title}
            </h1>
            {description ? (
              <p className="truncate text-[13px] leading-5 text-[hsl(var(--foreground-muted))]">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}

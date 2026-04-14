"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";

const badgeVariants = {
  neutral: "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]",
  subtle: "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]",
  accent: "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]",
  success: "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
  warning: "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]",
  danger: "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
} as const;

const noticeVariants = {
  info: {
    container: "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)]",
    title: "text-[var(--ds-plum-700)]",
    body: "text-[var(--ds-plum-700)]",
  },
  warning: {
    container: "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)]",
    title: "text-[var(--ds-amber-700)]",
    body: "text-[var(--ds-amber-700)]",
  },
  error: {
    container: "border-[var(--ds-red-200)] bg-[var(--ds-red-100)]",
    title: "text-[var(--ds-red-700)]",
    body: "text-[var(--ds-red-700)]",
  },
  success: {
    container: "border-[var(--ds-green-200)] bg-[var(--ds-green-100)]",
    title: "text-[var(--ds-green-700)]",
    body: "text-[var(--ds-green-700)]",
  },
} as const;

export const draftDetailPanelClassName =
  "overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm";
export const draftDetailPanelHeaderClassName =
  "border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-4";
export const draftDetailSubtlePanelClassName =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]";
export const draftDetailBodyTextClassName = "text-label-14 leading-6 text-[var(--ds-gray-900)]";
export const draftDetailMetaTextClassName = "text-copy-12 leading-5 text-[var(--ds-gray-900)]";

export function DraftDetailActionButton({
  tone = "secondary",
  compact = false,
  iconOnly = false,
  fullWidth = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "danger";
  compact?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
}) {
  const toneClassName =
    tone === "primary"
      ? "border-transparent bg-[hsl(var(--accent))] !text-white hover:bg-[hsl(var(--accent-hover))]"
      : tone === "danger"
        ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)] hover:border-[var(--ds-red-300)] hover:bg-[var(--ds-red-200)]"
        : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";

  const sizeClassName = iconOnly
    ? compact
      ? "h-8 w-8 px-0"
      : "h-9 w-9 px-0"
    : compact
      ? "h-8 px-2.5 text-label-13"
      : "h-9 px-3.5 text-label-14";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border transition-colors disabled:pointer-events-none disabled:opacity-50",
        toneClassName,
        sizeClassName,
        focusRingClassName,
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DraftDetailBadge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof badgeVariants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-label-12",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function DraftDetailNotice({
  title,
  variant = "info",
  className,
  children,
}: {
  title: ReactNode;
  variant?: keyof typeof noticeVariants;
  className?: string;
  children: ReactNode;
}) {
  const variantClasses = noticeVariants[variant];

  return (
    <div className={cn("rounded-xl border p-4 shadow-sm", variantClasses.container, className)}>
      <div className="space-y-1">
        <p className={cn("text-label-14", variantClasses.title)}>{title}</p>
        <div className={cn("text-label-14 leading-6", variantClasses.body)}>{children}</div>
      </div>
    </div>
  );
}

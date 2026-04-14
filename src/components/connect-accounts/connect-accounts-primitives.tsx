import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const connectPageClassName = "min-h-screen w-full bg-[var(--ds-background-200)]";
export const connectSurfaceClassName =
  "overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm";
export const connectSectionHeaderClassName =
  "border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3 sm:px-5";
export const connectInsetCardClassName =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]";
export const connectSoftCardClassName =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]";
export const connectEmptyStateClassName =
  "rounded-xl border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-5 text-center";
export const connectTitleClassName = "text-label-14 text-[var(--ds-gray-1000)]";
export const connectBodyClassName = "text-label-14 leading-6 text-[var(--ds-gray-900)]";
export const connectMetaClassName = "text-copy-12 text-[var(--ds-gray-900)]";
export const connectEyebrowClassName =
  "text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[var(--ds-gray-800)]";
export const connectInputClassName =
  "h-10 w-full rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-label-14 text-[var(--ds-gray-1000)] outline-none transition-colors placeholder:text-[var(--ds-gray-700)] focus:border-[hsl(var(--accent))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";
export const connectTextareaClassName = cn(connectInputClassName, "min-h-[7rem] py-2");

type ConnectButtonTone = "primary" | "secondary" | "ghost" | "danger";

export function ConnectButton({
  tone = "secondary",
  compact = false,
  iconOnly = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ConnectButtonTone;
  compact?: boolean;
  iconOnly?: boolean;
}) {
  const toneClassName =
    tone === "primary"
      ? "border-transparent bg-[hsl(var(--accent))] !text-white hover:bg-[hsl(var(--accent-hover))]"
      : tone === "danger"
        ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)] hover:border-[var(--ds-red-300)] hover:bg-[var(--ds-red-200)]"
        : tone === "ghost"
          ? "border-transparent bg-transparent text-[var(--ds-gray-900)] hover:border-[var(--ds-gray-400)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
          : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";

  const sizeClassName = iconOnly
    ? compact
      ? "h-7 w-7 px-0 text-label-13"
      : "h-9 w-9 px-0 text-label-14"
    : compact
      ? "h-8 px-2.5 text-label-13"
      : "h-9 px-3.5 text-label-14";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)] disabled:pointer-events-none disabled:opacity-50",
        toneClassName,
        sizeClassName,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type ConnectBadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export function ConnectBadge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: ConnectBadgeTone;
  className?: string;
  children: ReactNode;
}) {
  const toneClassName =
    tone === "info"
      ? "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
      : tone === "success"
        ? "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]"
        : tone === "warning"
          ? "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]"
          : tone === "danger"
            ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]"
            : "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label-12",
        toneClassName,
        className
      )}
    >
      {children}
    </span>
  );
}

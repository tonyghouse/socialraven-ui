"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const publicButtonClassName =
  "h-10 rounded-md px-4 text-label-14 shadow-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2";

const publicPrimaryButtonClassName = cn(
  publicButtonClassName,
  "border border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-white hover:border-[hsl(var(--accent-active))] hover:bg-[hsl(var(--accent-active))]"
);

const publicSubtleButtonClassName = cn(
  publicButtonClassName,
  "border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
);

function isExternalHref(href: string) {
  return href.startsWith("mailto:") || href.startsWith("http://") || href.startsWith("https://");
}

function lozengeToneClassName(
  appearance:
    | "default"
    | "inprogress"
    | "moved"
    | "new"
    | "removed"
    | "success"
    | "information"
    | "warning"
) {
  switch (appearance) {
    case "success":
      return "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]";
    case "removed":
      return "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]";
    case "warning":
    case "inprogress":
      return "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]";
    case "information":
    case "new":
    case "moved":
      return "border-[hsl(var(--accent)/0.18)] bg-[hsl(var(--accent)/0.10)] text-[hsl(var(--accent))]";
    case "default":
    default:
      return "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]";
  }
}

function sectionToneClassName(
  appearance: "information" | "warning" | "error" | "success" | "discovery"
) {
  switch (appearance) {
    case "success":
      return "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-1000)]";
    case "error":
      return "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-1000)]";
    case "warning":
      return "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-1000)]";
    case "discovery":
      return "border-[hsl(var(--accent)/0.18)] bg-[hsl(var(--accent)/0.10)] text-[hsl(var(--foreground))]";
    case "information":
    default:
      return "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]";
  }
}

export function PublicPrimaryLinkButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  if (isExternalHref(href)) {
    return (
      <Button asChild size="sm" className={publicPrimaryButtonClassName}>
        <a href={href}>{children}</a>
      </Button>
    );
  }

  return (
    <Button asChild size="sm" className={publicPrimaryButtonClassName}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export function PublicSubtleLinkButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  if (isExternalHref(href)) {
    return (
      <Button asChild variant="ghost" size="sm" className={publicSubtleButtonClassName}>
        <a href={href}>{children}</a>
      </Button>
    );
  }

  return (
    <Button asChild variant="ghost" size="sm" className={publicSubtleButtonClassName}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export function PublicPrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Button type="button" size="sm" className={publicPrimaryButtonClassName} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}

export function PublicSubtleButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={publicSubtleButtonClassName}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function PublicLozenge({
  appearance = "default",
  children,
  isBold,
}: {
  appearance?: "default" | "inprogress" | "moved" | "new" | "removed" | "success" | "information" | "warning";
  children: ReactNode;
  isBold?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-label-12",
        isBold && "font-semibold",
        lozengeToneClassName(appearance)
      )}
    >
      {children}
    </span>
  );
}

export function PublicTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-900)]">
      {text}
    </span>
  );
}

export function PublicSectionMessage({
  appearance = "information",
  title,
  children,
}: {
  appearance?: "information" | "warning" | "error" | "success" | "discovery";
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border px-4 py-4",
        "[&_a]:text-[hsl(var(--accent))] [&_a]:underline [&_a]:underline-offset-2",
        "[&_li]:text-copy-14 [&_li]:text-current [&_p]:text-copy-14 [&_p]:text-current [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
        sectionToneClassName(appearance)
      )}
    >
      {title ? <p className="text-label-14 text-current">{title}</p> : null}
      <div>{children}</div>
    </div>
  );
}

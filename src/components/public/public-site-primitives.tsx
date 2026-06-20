"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AttentionBox, Button } from "@vibe/core";
import { NavigationChevronLeft } from "@vibe/icons";

import { cn } from "@/lib/utils";

const publicButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-[0.875rem] px-4 text-label-14 shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2";

const publicPrimaryButtonClassName = cn(
  publicButtonClassName,
  "border border-[var(--primary-color)] bg-[var(--primary-color)] text-white hover:border-[var(--primary-hover-color)] hover:bg-[var(--primary-hover-color)]"
);

const publicSubtleButtonClassName = cn(
  publicButtonClassName,
  "border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] text-[var(--primary-text-color)] hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)]"
);

const publicBackLinkClassName = cn(
  "inline-flex h-9 items-center gap-1.5 rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-3 text-label-14 text-[var(--primary-text-color)] shadow-none transition-colors",
  "hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary-background-color)]"
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
      return "border-[var(--positive-color-selected)] bg-[var(--positive-color-selected)] text-[var(--positive-color-hover)]";
    case "removed":
      return "border-[var(--negative-color-selected)] bg-[var(--negative-color-selected)] text-[var(--negative-color-hover)]";
    case "warning":
    case "inprogress":
      return "border-[var(--warning-color-selected)] bg-[var(--warning-color-selected)] text-[var(--fixed-dark-color)]";
    case "information":
    case "new":
    case "moved":
      return "border-[var(--primary-selected-color)] bg-[var(--primary-selected-color)] text-[var(--primary-color)]";
    case "default":
    default:
      return "border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] text-[var(--secondary-text-color)]";
  }
}

function sectionToneClassName(
  appearance: "information" | "warning" | "error" | "success" | "discovery"
) {
  switch (appearance) {
    case "success":
      return "text-[var(--positive-color-hover)]";
    case "error":
      return "text-[var(--negative-color-hover)]";
    case "warning":
      return "text-[var(--fixed-dark-color)]";
    case "discovery":
      return "text-[var(--primary-text-color)]";
    case "information":
    default:
      return "text-[var(--primary-text-color)]";
  }
}

export function PublicPrimaryLinkButton({
  href,
  children,
  download,
}: {
  href: string;
  children: ReactNode;
  download?: boolean;
}) {
  if (download || isExternalHref(href)) {
    return (
      <a className={publicPrimaryButtonClassName} href={href} download={download}>
        {children}
      </a>
    );
  }

  return (
    <Link className={publicPrimaryButtonClassName} href={href}>
      {children}
    </Link>
  );
}

export function PublicSubtleLinkButton({
  href,
  children,
  download,
}: {
  href: string;
  children: ReactNode;
  download?: boolean;
}) {
  if (download || isExternalHref(href)) {
    return (
      <a className={publicSubtleButtonClassName} href={href} download={download}>
        {children}
      </a>
    );
  }

  return (
    <Link className={publicSubtleButtonClassName} href={href}>
      {children}
    </Link>
  );
}

export function PublicBackLink({
  href,
  children = "Back",
}: {
  href: string;
  children?: ReactNode;
}) {
  return (
    <Link href={href} className={publicBackLinkClassName}>
      <NavigationChevronLeft className="h-4 w-4 text-[var(--secondary-text-color)]" />
      <span>{children}</span>
    </Link>
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
    <Button
      type="button"
      size="medium"
      disabled={disabled}
      onClick={onClick}
      className="!rounded-[0.875rem]"
    >
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
      kind="secondary"
      size="medium"
      className="!rounded-[0.875rem] !border-[var(--ui-border-color)] !bg-[var(--primary-background-color)] !text-[var(--primary-text-color)] hover:!border-[var(--primary-text-color)] hover:!bg-[var(--primary-background-hover-color)]"
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
        "inline-flex min-w-0 max-w-full items-start rounded-full border px-2.5 py-1 text-left text-label-12 leading-[1.1] whitespace-normal [overflow-wrap:anywhere]",
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
    <span className="inline-flex min-w-0 max-w-full items-start rounded-full border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-2.5 py-1 text-left text-label-12 leading-[1.1] text-[var(--secondary-text-color)] whitespace-normal [overflow-wrap:anywhere]">
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
  const type =
    appearance === "error"
      ? "negative"
      : appearance === "success"
        ? "positive"
        : appearance === "warning"
          ? "warning"
          : "primary";

  const content = <div className={cn("space-y-2", sectionToneClassName(appearance))}>{children}</div>;
  const className = cn(
    "[&_a]:text-[var(--primary-color)] [&_a]:underline [&_a]:underline-offset-2",
    "[&_li]:text-copy-14 [&_li]:text-current [&_p]:text-copy-14 [&_p]:text-current [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
    appearance === "discovery" && "border border-[var(--ui-border-color)] bg-[var(--primary-highlighted-color)]"
  );

  if (title) {
    return (
      <AttentionBox animate={false} type={type} title={title} className={className}>
        {content}
      </AttentionBox>
    );
  }

  return (
    <AttentionBox animate={false} compact type={type} className={className}>
      {content}
    </AttentionBox>
  );
}

import type { HTMLAttributes, ReactNode } from "react";

import Navbar, { LANDING_NAVBAR_CONTENT_CLASS } from "@/components/navbar/navbar";
import {
  LANDING_FOOTER_CONTENT_CLASS,
  PublicSiteFooter,
} from "@/components/public/public-site-footer";
import { cn } from "@/lib/utils";

const PUBLIC_PAGE_TOP_SPACING_CLASS =
  "[&>section:first-child>div]:pt-8 lg:[&>section:first-child>div]:pt-10";

export function PublicPageShell({
  children,
  hideChromeOnPrint = false,
  mainClassName,
}: {
  children: ReactNode;
  hideChromeOnPrint?: boolean;
  mainClassName?: string;
}) {
  return (
    <>
      <div className={cn(hideChromeOnPrint && "print:hidden")}>
        <Navbar contentClassName={LANDING_NAVBAR_CONTENT_CLASS} size="landing" />
      </div>
      <main
        className={cn(
          "min-h-screen bg-[var(--allgrey-background-color)] pt-[4.75rem] text-[var(--primary-text-color)]",
          PUBLIC_PAGE_TOP_SPACING_CLASS,
          mainClassName,
        )}
      >
        {children}
      </main>
      <div className={cn(hideChromeOnPrint && "print:hidden")}>
        <PublicSiteFooter contentClassName={LANDING_FOOTER_CONTENT_CLASS} />
      </div>
    </>
  );
}

export function PublicHero({
  topSlot,
  title,
  description,
  meta,
  actions,
  aside,
}: {
  topSlot?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--layout-border-color)] bg-[linear-gradient(180deg,var(--primary-background-color)_0%,var(--allgrey-background-color)_100%)] print:border-b-0 print:bg-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 78% 0%, rgb(0 115 234 / 0.10) 0%, transparent 72%)",
        }}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative mx-auto grid w-full max-w-[88rem] gap-10 px-5 pt-16 pb-12 md:px-8 lg:pt-20 lg:pb-16 print:gap-6 print:px-0 print:py-8",
          aside && "lg:grid-cols-[minmax(0,1.2fr)_minmax(17.5rem,0.8fr)] lg:items-start",
        )}
      >
        <div className="space-y-5">
          {topSlot ? <div>{topSlot}</div> : null}
          <div className="space-y-3.5">
            <h1
              className={cn(
                "max-w-5xl font-[var(--font-vibe-title)] text-[clamp(2.25rem,1.85rem+2vw,3.75rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[var(--primary-text-color)]",
                !aside && "max-w-none"
              )}
            >
              {title}
            </h1>
            {meta ? (
              <div className="text-copy-14 font-medium text-[var(--secondary-text-color)]">
                {meta}
              </div>
            ) : null}
            {description ? (
              <p
                className={cn(
                  "max-w-3xl text-copy-16 text-[var(--secondary-text-color)]",
                  aside ? "max-w-3xl" : "max-w-none",
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
    </section>
  );
}

export function PublicSection({
  eyebrow,
  title,
  description,
  children,
  surface = "canvas",
}: {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  surface?: "canvas" | "surface";
}) {
  return (
    <section
      className={cn(
        "border-b border-[var(--layout-border-color)]",
        surface === "surface" ? "bg-[var(--allgrey-background-color)]" : "bg-[var(--primary-background-color)]",
        "print:border-b-0 print:bg-white",
      )}
    >
      <div className="mx-auto w-full max-w-[88rem] px-5 py-14 md:px-8 lg:py-16 print:px-0 print:py-8">
        {eyebrow || title || description ? (
          <div className="mb-8 space-y-2.5">
            {eyebrow ? (
              <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="font-[var(--font-vibe-title)] text-[clamp(1.75rem,1.55rem+1vw,2.5rem)] font-bold leading-[1.02] tracking-[-0.04em] text-[var(--primary-text-color)]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="max-w-3xl text-copy-16 text-[var(--secondary-text-color)]">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function PublicCard({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.375rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] shadow-[0_1.125rem_2.75rem_rgba(41,47,76,0.08)] print:break-inside-avoid print:shadow-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PublicInsetCard({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border border-[var(--ui-border-color)] bg-[linear-gradient(180deg,var(--allgrey-background-color)_0%,rgb(255_255_255_/_0.62)_100%)] print:break-inside-avoid print:bg-white",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PublicToc({
  items,
}: {
  items: Array<{ id: string; label: string }>;
}) {
  return (
    <aside className="hidden lg:block">
      <PublicCard className="sticky top-24 overflow-hidden p-0">
        <div className="border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-5 py-4">
          <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
            On this page
          </p>
        </div>
        <nav className="space-y-1 p-3">
          {items.map(({ id, label }, index) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex items-center gap-2 rounded-[0.9rem] px-3 py-2 text-label-14 text-[var(--secondary-text-color)] transition-colors hover:bg-[var(--primary-background-hover-color)] hover:text-[var(--primary-text-color)]"
            >
              <span className="w-5 shrink-0 text-label-12 text-[var(--placeholder-color)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </PublicCard>
    </aside>
  );
}

export function PublicTable({
  headers,
  rows,
}: {
  headers: ReactNode[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-[1.25rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] print:break-inside-avoid">
      <table className="w-full border-collapse text-copy-14">
        <thead>
          <tr className="border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)]">
            {headers.map((header, index) => (
              <th
                key={index}
                className="p-4 text-left text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-[var(--primary-background-color)] text-[var(--secondary-text-color)]">
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                "border-b border-[var(--layout-border-color)] last:border-b-0",
                rowIndex % 2 === 1 && "bg-[rgb(247_248_250_/_0.6)] dark:bg-[rgb(255_255_255_/_0.04)]"
              )}
            >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-4 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

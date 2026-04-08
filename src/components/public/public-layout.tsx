import type { HTMLAttributes, ReactNode } from "react";

import Navbar from "@/components/navbar/navbar";
import { PublicSiteFooter } from "@/components/public/public-site-footer";
import { cn } from "@/lib/utils";

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
        <Navbar />
      </div>
      <main
        className={cn(
          "min-h-screen bg-[var(--ds-background-100)] pt-20 text-[var(--ds-gray-1000)]",
          mainClassName,
        )}
      >
        {children}
      </main>
      <div className={cn(hideChromeOnPrint && "print:hidden")}>
        <PublicSiteFooter />
      </div>
    </>
  );
}

export function PublicHero({
  topSlot,
  eyebrow,
  title,
  description,
  meta,
  actions,
  aside,
}: {
  topSlot?: ReactNode;
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] print:border-b-0 print:bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 md:px-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start lg:py-20 print:gap-6 print:px-0 print:py-8">
        <div className="space-y-5">
          {topSlot ? <div>{topSlot}</div> : null}
          <p className="text-label-12 text-[var(--ds-gray-900)]">
            {eyebrow}
          </p>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl leading-tight font-bold tracking-[-0.04em] text-[var(--ds-gray-1000)] md:text-5xl md:leading-[1.02] lg:text-[3.25rem]">
              {title}
            </h1>
            {meta ? (
              <div className="text-label-14 text-[var(--ds-gray-900)]">{meta}</div>
            ) : null}
            {description ? (
              <p className="max-w-3xl text-copy-16 text-[var(--ds-gray-900)]">
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
        "border-b border-[var(--ds-gray-400)]",
        surface === "surface" ? "bg-[var(--ds-background-200)]" : "bg-[var(--ds-background-100)]",
        "print:border-b-0 print:bg-white",
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-14 md:px-10 print:px-0 print:py-8">
        {eyebrow || title || description ? (
          <div className="mb-8 space-y-2">
            {eyebrow ? (
              <p className="text-label-12 text-[var(--ds-gray-900)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="text-heading-32 text-[var(--ds-gray-1000)]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="max-w-3xl text-copy-14 text-[var(--ds-gray-900)]">
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
        "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] print:break-inside-avoid print:shadow-none",
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
        "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] print:break-inside-avoid print:bg-white",
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
      <PublicCard className="sticky top-24 p-5">
        <p className="mb-3 text-label-12 text-[var(--ds-gray-900)]">
          Contents
        </p>
        <nav className="space-y-1">
          {items.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="block rounded-md px-2 py-1.5 text-label-14 text-[var(--ds-gray-900)] transition-colors hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
            >
              {label}
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
    <div className="overflow-x-auto rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] print:break-inside-avoid">
      <table className="w-full border-collapse text-copy-14">
        <thead>
          <tr className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
            {headers.map((header, index) => (
              <th key={index} className="p-3 text-left text-label-14 text-[var(--ds-gray-1000)]">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)]">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-3 align-top">
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

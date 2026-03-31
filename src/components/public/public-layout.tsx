import type { HTMLAttributes, ReactNode } from "react";

import Navbar from "@/components/navbar/navbar";
import { cn } from "@/lib/utils";

export function PublicPageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--surface-sunken))_100%)] pt-20 text-[hsl(var(--foreground))]">
        {children}
      </main>
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
    <section className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 md:px-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start lg:py-20">
        <div className="space-y-5">
          {topSlot ? <div>{topSlot}</div> : null}
          <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
            {eyebrow}
          </p>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-[2rem] leading-9 font-bold tracking-[-0.02em] text-[hsl(var(--foreground))] md:text-[2.5rem] md:leading-[2.75rem] lg:text-[2.75rem] lg:leading-[3rem]">
              {title}
            </h1>
            {meta ? (
              <div className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">{meta}</div>
            ) : null}
            {description ? (
              <p className="max-w-3xl text-sm leading-5 text-[hsl(var(--foreground-muted))] md:text-[1rem] md:leading-6">
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
        "border-b border-[hsl(var(--border-subtle))]",
        surface === "surface" ? "bg-[hsl(var(--surface))]" : "bg-transparent",
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-14 md:px-10">
        {eyebrow || title || description ? (
          <div className="mb-8 space-y-2">
            {eyebrow ? (
              <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="text-[1.5rem] leading-7 font-bold tracking-[-0.02em] text-[hsl(var(--foreground))]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="max-w-3xl text-sm leading-5 text-[hsl(var(--foreground-muted))] md:text-[1rem] md:leading-6">
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
        "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-xs)]",
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
        "rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]",
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
        <p className="mb-3 text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
          Contents
        </p>
        <nav className="space-y-1">
          {items.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="block rounded-md px-2 py-1 text-sm leading-5 text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--surface-raised))] hover:text-[hsl(var(--foreground))]"
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
    <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
      <table className="w-full border-collapse text-sm leading-5">
        <thead>
          <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
            {headers.map((header, index) => (
              <th key={index} className="p-3 text-left font-bold text-[hsl(var(--foreground))]">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))]">
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

import Link from "next/link";
import type { ReactNode } from "react";

import { AuthPatternBackground } from "@/components/generic/auth-pattern-background";

type AuthPageShellProps = {
  badge: string;
  title: string;
  description: string;
  helperTitle: string;
  helperDescription: string;
  alternatePrompt: string;
  alternateLabel: string;
  alternateHref: string;
  children: ReactNode;
};

const LEGAL_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "Privacy policy", href: "/privacy-policy" },
  { label: "Terms of service", href: "/terms-of-service" },
  { label: "Refund policy", href: "/refund-policy" },
];

export function AuthPageShell({
  badge,
  title,
  description,
  helperTitle,
  helperDescription,
  alternatePrompt,
  alternateLabel,
  alternateHref,
  children,
}: AuthPageShellProps) {
  return (
    <div className="relative min-h-screen">
      <AuthPatternBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <section className="rounded-[28px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]/88 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            <span className="inline-flex items-center rounded-full border border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/10 px-3 py-1 text-xs font-medium leading-4 text-[hsl(var(--accent))]">
              {badge}
            </span>

            <div className="mt-5 max-w-2xl space-y-4">
              <h1 className="text-[2rem] leading-9 font-bold tracking-[-0.03em] text-[hsl(var(--foreground))] sm:text-[2.5rem] sm:leading-[2.8rem]">
                {title}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-[hsl(var(--foreground-muted))] sm:text-base">
                {description}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] p-5">
                <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                  Account access
                </p>
                <p className="mt-2 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                  Self-serve account access is available on this page through our secure authentication provider.
                </p>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] p-5">
                <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                  Before you continue
                </p>
                <p className="mt-2 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                  Review public pricing, policies, and account terms before creating a workspace.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] p-5">
              <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                {helperTitle}
              </p>
              <p className="mt-2 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                {helperDescription}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {LEGAL_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground-muted))] transition-colors hover:text-[hsl(var(--foreground))]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="mb-5 text-center lg:text-left">
              <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                {badge}
              </p>
              <h2 className="mt-2 text-xl leading-7 font-bold tracking-[-0.02em] text-[hsl(var(--foreground))]">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                {description}
              </p>
            </div>

            <div className="flex w-full justify-center">
              <div className="mx-auto flex w-full max-w-md justify-center">
                {children}
              </div>
            </div>

            <noscript>
              <p className="mt-4 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-4 py-3 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                This account form requires JavaScript to render fully. If it does not load, contact
                team+support@socialraven.io.
              </p>
            </noscript>

            <p className="mt-4 text-center text-sm leading-5 text-[hsl(var(--foreground-muted))]">
              {alternatePrompt}{" "}
              <Link
                href={alternateHref}
                className="font-medium text-[hsl(var(--accent))] underline underline-offset-2 hover:no-underline"
              >
                {alternateLabel}
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

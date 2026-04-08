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
    <div className="relative min-h-screen bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]">
      <AuthPatternBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <section className="rounded-[28px] border border-[var(--ds-gray-400)] bg-[color:color-mix(in_srgb,var(--ds-background-100)_88%,transparent)] p-6 shadow-none backdrop-blur-xl sm:p-8">
            <span className="inline-flex items-center rounded-full border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] px-3 py-1 text-label-12 text-[var(--ds-blue-700)]">
              {badge}
            </span>

            <div className="mt-5 max-w-2xl space-y-4">
              <h1 className="text-heading-32 text-[var(--ds-gray-1000)] sm:text-[2.5rem] sm:leading-[2.8rem]">
                {title}
              </h1>
              <p className="max-w-xl text-copy-16 text-[var(--ds-gray-900)]">
                {description}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-5">
                <p className="text-label-12 text-[var(--ds-gray-900)]">
                  Account access
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
                  Self-serve account access is available on this page through our secure authentication provider.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-5">
                <p className="text-label-12 text-[var(--ds-gray-900)]">
                  Before you continue
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
                  Review public pricing, policies, and account terms before creating a workspace.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-5">
              <p className="text-label-12 text-[var(--ds-gray-900)]">
                {helperTitle}
              </p>
              <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
                {helperDescription}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {LEGAL_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-2 text-label-14 text-[var(--ds-gray-1000)] transition-colors hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="mb-5 text-center lg:text-left">
              <p className="text-label-12 text-[var(--ds-gray-900)]">
                {badge}
              </p>
              <h2 className="mt-2 text-heading-24 text-[var(--ds-gray-1000)]">
                {title}
              </h2>
              <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
                {description}
              </p>
            </div>

            <div className="flex w-full justify-center">
              <div className="mx-auto flex w-full max-w-md justify-center">
                {children}
              </div>
            </div>

            <noscript>
              <p className="mt-4 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3 text-copy-14 text-[var(--ds-gray-900)]">
                This account form requires JavaScript to render fully. If it does not load, contact
                team+support@socialraven.io.
              </p>
            </noscript>

            <p className="mt-4 text-center text-copy-14 text-[var(--ds-gray-900)]">
              {alternatePrompt}{" "}
              <Link
                href={alternateHref}
                className="text-label-14 text-[var(--ds-blue-700)] underline underline-offset-2 hover:no-underline"
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

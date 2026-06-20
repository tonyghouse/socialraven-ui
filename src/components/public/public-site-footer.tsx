import type { CSSProperties } from "react";
import { Locked } from "@vibe/icons";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms of service", href: "/terms-of-service" },
      { label: "Refund policy", href: "/refund-policy" },
    ],
  },
];

type FooterAccentStyle = CSSProperties & {
  "--footer-accent": string;
  "--footer-accent-soft": string;
};

const createFooterAccentStyle = (colorToken: string): FooterAccentStyle => ({
  "--footer-accent": colorToken,
  "--footer-accent-soft": `color-mix(in srgb, ${colorToken} 8%, var(--primary-background-color))`,
});

const FOOTER_ACCENTS = [
  createFooterAccentStyle("var(--primary-color)"),
  createFooterAccentStyle("var(--color-aquamarine)"),
  createFooterAccentStyle("var(--color-working_orange)"),
];

export const LANDING_FOOTER_CONTENT_CLASS = "max-w-[88rem] px-4 py-10 sm:px-6 md:px-10 lg:py-12";

export function PublicSiteFooter({
  contentClassName = "max-w-7xl px-4 py-10 sm:px-6 lg:py-12",
}: {
  contentClassName?: string;
}) {
  return (
    <footer className="border-t border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)]">
      <div className={cn("mx-auto w-full", contentClassName)}>
        <div className="overflow-hidden rounded-[1.25rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] shadow-[0_1rem_2.5rem_rgba(41,47,76,0.07)]">
          <div className="grid gap-px bg-[var(--ui-border-color)] lg:grid-cols-[minmax(0,1.25fr)_repeat(3,minmax(0,0.75fr))]">
            <div className="bg-[var(--primary-background-color)] p-6 md:p-7 lg:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.45)]">
                  <Image
                    src="/SocialRavenLogo.svg"
                    alt="SocialRaven logo"
                    width={22}
                    height={22}
                    className="h-[1.375rem] w-[1.375rem]"
                  />
                </div>
                <span className="text-heading-16 text-[var(--primary-text-color)]">
                  SocialRaven
                </span>
              </div>

              <p className="mt-5 max-w-sm text-copy-14 text-[var(--secondary-text-color)]">
                Structured social media scheduling and publishing for creators, agencies, and operations-focused teams.
              </p>

              <div className="mt-6 inline-flex min-w-0 max-w-full items-center gap-2 rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-3 py-2 text-label-12 leading-[1.1] text-[var(--secondary-text-color)]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[0.625rem] border border-[var(--primary-selected-hover-color)] bg-[var(--primary-selected-color)] text-[var(--primary-color)]">
                  <Locked className="h-3.5 w-3.5" />
                </span>
                <span>GDPR-conscious · OAuth-secured</span>
              </div>

              <div className="mt-7 grid max-w-[13rem] grid-cols-4 gap-1.5" aria-hidden="true">
                <span className="h-1 rounded-full bg-[var(--primary-color)] opacity-70" />
                <span className="h-1 rounded-full bg-[var(--color-aquamarine)] opacity-60" />
                <span className="h-1 rounded-full bg-[var(--color-orange)] opacity-55" />
                <span className="h-1 rounded-full bg-[var(--color-done-green)] opacity-55" />
              </div>
            </div>

            {FOOTER_GROUPS.map((group, index) => (
              <nav
                key={group.title}
                className="bg-[var(--primary-background-color)] p-5 md:p-6 lg:p-7"
                style={FOOTER_ACCENTS[index]}
                aria-label={group.title}
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-0.5 rounded-full bg-[var(--footer-accent)] opacity-65" />
                  <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
                    {group.title}
                  </p>
                </div>

                <ul className="mt-5 space-y-1">
                  {group.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="group flex min-h-10 items-center justify-between gap-3 rounded-[0.875rem] px-3 text-label-14 text-[var(--secondary-text-color)] transition-colors hover:bg-[var(--footer-accent-soft)] hover:text-[var(--primary-text-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary-background-color)]"
                      >
                        <span>{item.label}</span>
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--footer-accent)] opacity-0 transition-opacity group-hover:opacity-70" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="border-t border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] px-5 py-4 md:px-7">
            <div className="flex flex-col gap-3 text-label-12 text-[var(--secondary-text-color)] md:flex-row md:items-center md:justify-between">
              <p>© 2026 SocialRaven. All rights reserved.</p>
              <p className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)] opacity-65" aria-hidden="true" />
                <span>Built for calm execution across global publishing teams.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

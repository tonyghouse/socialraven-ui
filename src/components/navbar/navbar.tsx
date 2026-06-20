"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Close, DropdownChevronDown, NavigationChevronRight } from "@vibe/icons";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { cn } from "@/lib/utils";

type DropdownKey = "product" | "solutions";
type NavItem =
  | { type: "dropdown"; label: string; key: DropdownKey }
  | { type: "link"; label: string; href: string };

const LANDING_NAV: NavItem[] = [
  { type: "dropdown", label: "Solutions", key: "solutions" },
  { type: "dropdown", label: "Product", key: "product" },
  { type: "link", label: "Pricing", href: "/pricing" },
];

export const LANDING_NAVBAR_CONTENT_CLASS = "max-w-[89rem] px-4 sm:px-6 lg:px-8";

function HamburgerIcon() {
  return (
    <span className="flex h-4 w-5 flex-col justify-center gap-[0.25rem]" aria-hidden="true">
      <span className="h-[0.125rem] w-full rounded-full bg-current" />
      <span className="h-[0.125rem] w-full rounded-full bg-current" />
      <span className="h-[0.125rem] w-3.5 rounded-full bg-current" />
    </span>
  );
}

function EmptyDropdownPanel({ label }: { label: string }) {
  return (
    <div className="w-[21rem] overflow-hidden rounded-[0.875rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] shadow-[0_1.25rem_3rem_rgba(41,47,76,0.14)] dark:shadow-[0_1.25rem_3rem_rgba(0,0,0,0.34)]">
      <div className="flex items-center gap-3 border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] px-4 py-3.5">
        <span className="h-8 w-1 shrink-0 rounded-full bg-[var(--primary-color)]" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-label-14 font-semibold text-[var(--primary-text-color)]">{label}</p>
          <p className="mt-0.5 text-label-12 text-[var(--secondary-text-color)]">No menu items yet.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-px bg-[var(--layout-border-color)]">
        <span className="h-1.5 bg-[var(--primary-color)]" aria-hidden="true" />
        <span className="h-1.5 bg-[var(--color-done-green)]" aria-hidden="true" />
        <span className="h-1.5 bg-[var(--color-working_orange)]" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function Navbar({
  contentClassName = "max-w-7xl px-4 sm:px-5",
  size = "default",
}: {
  contentClassName?: string;
  size?: "default" | "landing";
}) {
  const { isSignedIn } = useUser();
  const isLanding = size === "landing";
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMenuOpen]);

  const navHeight = isLanding ? "h-[4.375rem]" : "h-14";
  const brandGap = isLanding ? "gap-2.5" : "gap-2";
  const brandBox = isLanding ? "h-[2.1875rem] w-[2.1875rem] rounded-[0.6875rem]" : "h-7 w-7 rounded-[0.625rem]";
  const brandIcon = isLanding ? "h-[2.1875rem] w-[2.1875rem]" : "h-7 w-7";
  const brandText = isLanding
    ? "font-[var(--font-vibe-title)] text-[1.03125rem] font-semibold leading-none tracking-normal text-[var(--primary-text-color)]"
    : "text-label-14 font-semibold text-[var(--primary-text-color)]";
  const avatarBox = isLanding ? "h-[2.375rem] w-[2.375rem] rounded-[0.6875rem]" : "h-9 w-9 rounded-[0.75rem]";
  const themeClass = isLanding ? "!h-[2.375rem] !w-[2.375rem] !rounded-[0.6875rem] shrink-0" : "shrink-0";

  const navBtnBase = isLanding
    ? "inline-flex h-[2.375rem] items-center justify-center rounded-[0.6875rem] px-3.5 text-label-14 font-semibold shadow-none transition-colors"
    : "inline-flex h-9 items-center justify-center rounded-[0.75rem] px-3 text-label-13 shadow-none transition-colors";

  const desktopNavItemClassName =
    "group inline-flex h-8 items-center gap-1.5 rounded-[0.625rem] px-3 text-label-14 font-medium text-[var(--secondary-text-color)] transition-colors duration-100 hover:bg-[var(--primary-background-color)] hover:text-[var(--primary-text-color)] aria-expanded:bg-[var(--primary-background-color)] aria-expanded:text-[var(--primary-text-color)]";

  const secondaryBtn = cn(
    navBtnBase,
    "text-[var(--secondary-text-color)] hover:bg-[var(--primary-background-hover-color)] hover:text-[var(--primary-text-color)]"
  );
  const authSecondaryBtn = cn(
    navBtnBase,
    "border border-transparent bg-transparent text-[var(--primary-text-color)] hover:border-[var(--ui-border-color)] hover:bg-[var(--primary-background-hover-color)] focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-[var(--primary-background-color)]"
  );
  const authPrimaryBtn = cn(
    navBtnBase,
    isLanding && "px-[1.125rem]",
    "border border-[var(--primary-color)] bg-[var(--primary-color)] text-white shadow-[0_0.375rem_0.875rem_rgba(0,115,234,0.18)] hover:border-[var(--primary-hover-color)] hover:bg-[var(--primary-hover-color)] focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-[var(--primary-background-color)]"
  );

  const mobileActionClassName =
    "inline-flex h-11 items-center justify-center rounded-[0.75rem] px-4 text-label-14 font-semibold transition-colors";
  const mobileSecondaryActionClassName = cn(
    mobileActionClassName,
    "border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] text-[var(--primary-text-color)] hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)]"
  );
  const mobilePrimaryActionClassName = cn(
    mobileActionClassName,
    "border border-[var(--primary-color)] bg-[var(--primary-color)] text-white hover:border-[var(--primary-hover-color)] hover:bg-[var(--primary-hover-color)]"
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center border-b border-[var(--layout-border-color)] bg-[color-mix(in_srgb,var(--primary-background-color)_94%,transparent)] shadow-[0_0.125rem_0.75rem_rgba(41,47,76,0.05)] backdrop-blur-xl dark:shadow-[0_0.125rem_0.75rem_rgba(0,0,0,0.2)]">
      <div className={cn("w-full", contentClassName)}>
        <nav className={cn("flex items-center gap-5", navHeight)} aria-label="Primary">
          <Link
            href="/"
            className={cn(
              "group flex min-w-0 shrink-0 items-center rounded-[0.875rem] pr-2 transition-colors hover:bg-[var(--primary-background-hover-color)]",
              brandGap
            )}
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center overflow-hidden ring-1 ring-[var(--layout-border-color)]",
                brandBox
              )}
            >
              <Image
                src="/SocialRavenLogo.svg"
                alt="SocialRaven logo"
                width={36}
                height={36}
                className={brandIcon}
                priority={isLanding}
              />
            </span>
            <span className={cn("truncate", brandText)}>SocialRaven</span>
          </Link>

          {isLanding && (
            <div className="hidden items-center gap-1 lg:flex">
              {LANDING_NAV.map((item) => {
                if (item.type === "link") {
                  return (
                    <Link key={item.label} href={item.href} className={desktopNavItemClassName}>
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.key}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.key)}
                    onMouseLeave={() => setOpenDropdown((current) => (current === item.key ? null : current))}
                    onFocus={() => setOpenDropdown(item.key)}
                    onBlur={(event) => {
                      if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
                        return;
                      }
                      setOpenDropdown((current) => (current === item.key ? null : current));
                    }}
                  >
                    <button
                      type="button"
                      className={desktopNavItemClassName}
                      aria-expanded={openDropdown === item.key}
                      aria-controls={`${item.key}-desktop-menu`}
                      onClick={() => setOpenDropdown(item.key)}
                    >
                      <span>{item.label}</span>
                      <DropdownChevronDown className="h-4 w-4 text-[var(--secondary-text-color)] transition-transform duration-150 group-aria-expanded:rotate-180" />
                    </button>
                    {openDropdown === item.key && (
                      <div id={`${item.key}-desktop-menu`} className="absolute left-0 top-full pt-3">
                        <EmptyDropdownPanel label={item.label} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className={secondaryBtn}>
                  Dashboard
                </Link>
                <div
                  className={cn(
                    "flex items-center justify-center overflow-hidden border border-[var(--ui-border-color)] bg-[var(--primary-background-color)]",
                    avatarBox
                  )}
                >
                  <UserButton appearance={{ elements: { avatarBox } }} />
                </div>
              </>
            ) : (
              <>
                <Link href="/sign-in" className={authSecondaryBtn}>
                  Sign in
                </Link>
                <Link href="/sign-up" className={authPrimaryBtn}>
                  Sign up
                </Link>
              </>
            )}
            <ThemeSwitcher compact className={themeClass} />
          </div>

          <button
            type="button"
            className="ml-auto inline-flex h-[2.375rem] w-[2.375rem] items-center justify-center rounded-[0.6875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] text-[var(--primary-text-color)] transition-colors hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)] lg:hidden"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <HamburgerIcon />
          </button>
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-surface)_34%,transparent)]"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            id="mobile-navigation-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute right-0 top-0 flex h-dvh w-full max-w-[25.5rem] flex-col border-l border-[var(--layout-border-color)] bg-[var(--primary-background-color)] shadow-[0_1.5rem_4rem_rgba(41,47,76,0.2)] dark:shadow-[0_1.5rem_4rem_rgba(0,0,0,0.4)]"
          >
            <div className="flex h-[4.375rem] shrink-0 items-center justify-between border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] px-4">
              <Link
                href="/"
                className="flex min-w-0 items-center gap-2.5 rounded-[0.875rem] pr-2 transition-colors hover:bg-[var(--primary-background-hover-color)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex h-[2.1875rem] w-[2.1875rem] shrink-0 items-center justify-center overflow-hidden rounded-[0.6875rem] ring-1 ring-[var(--layout-border-color)]">
                  <Image
                    src="/SocialRavenLogo.svg"
                    alt="SocialRaven logo"
                    width={36}
                    height={36}
                    className="h-[2.1875rem] w-[2.1875rem]"
                  />
                </span>
                <span className="truncate font-[var(--font-vibe-title)] text-[1.03125rem] font-semibold leading-none tracking-normal text-[var(--primary-text-color)]">
                  SocialRaven
                </span>
              </Link>
              <button
                type="button"
                className="inline-flex h-[2.375rem] w-[2.375rem] items-center justify-center rounded-[0.6875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] text-[var(--primary-text-color)] transition-colors hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)]"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Close className="h-[1.125rem] w-[1.125rem]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[var(--allgrey-background-color)] px-4 py-4">
              <div className="overflow-hidden rounded-[0.875rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)]">
                {LANDING_NAV.map((item) => {
                  if (item.type === "link") {
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex min-h-[3.5rem] items-center justify-between border-b border-[var(--layout-border-color)] px-4 text-label-16 font-semibold text-[var(--primary-text-color)] transition-colors last:border-b-0 hover:bg-[var(--primary-background-hover-color)]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>{item.label}</span>
                        <NavigationChevronRight className="h-4 w-4 text-[var(--icon-color)]" />
                      </Link>
                    );
                  }

                  return (
                    <details key={item.key} className="group border-b border-[var(--layout-border-color)] last:border-b-0">
                      <summary className="flex min-h-[3.5rem] cursor-pointer list-none items-center justify-between px-4 text-label-16 font-semibold text-[var(--primary-text-color)] transition-colors marker:hidden hover:bg-[var(--primary-background-hover-color)] [&::-webkit-details-marker]:hidden">
                        <span>{item.label}</span>
                        <DropdownChevronDown className="h-4 w-4 text-[var(--icon-color)] transition-transform duration-150 group-open:rotate-180" />
                      </summary>
                      <div className="flex items-center gap-3 border-t border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] px-4 py-4">
                        <span className="h-8 w-1 shrink-0 rounded-full bg-[var(--primary-color)]" aria-hidden="true" />
                        <p className="text-label-13 text-[var(--secondary-text-color)]">No menu items yet.</p>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 space-y-3 border-t border-[var(--layout-border-color)] bg-[var(--primary-background-color)] px-4 py-4">
              {isSignedIn ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className={cn(mobileSecondaryActionClassName, "flex-1")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[0.75rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)]">
                    <UserButton appearance={{ elements: { avatarBox: "h-11 w-11 rounded-[0.75rem]" } }} />
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Link
                    href="/sign-up"
                    className={mobilePrimaryActionClassName}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/sign-in"
                    className={mobileSecondaryActionClassName}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                </div>
              )}
              <ThemeSwitcher compact={false} align="center" className="!w-full" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

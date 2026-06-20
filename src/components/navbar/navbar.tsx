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

export const LANDING_NAVBAR_CONTENT_CLASS = "max-w-[88rem] px-4 sm:px-6";

function HamburgerIcon() {
  return (
    <span className="flex h-4 w-5 flex-col justify-center gap-[0.3125rem]" aria-hidden="true">
      <span className="h-[0.125rem] w-full rounded-full bg-current" />
      <span className="h-[0.125rem] w-full rounded-full bg-current" />
      <span className="h-[0.125rem] w-full rounded-full bg-current" />
    </span>
  );
}

function EmptyDropdownPanel({ label }: { label: string }) {
  return (
    <div className="w-[26rem] overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] shadow-[0_1.5rem_3.5rem_rgba(41,47,76,0.16)]">
      <div className="border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-5 py-4">
        <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
          {label}
        </p>
      </div>
      <div className="flex min-h-[10rem] items-center justify-center px-5 py-6 text-center">
        <p className="max-w-[13rem] text-label-13 text-[var(--secondary-text-color)]">
          No menu items yet.
        </p>
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

  const navBtnBase = isLanding
    ? "inline-flex h-10 items-center justify-center rounded-[0.75rem] px-4 text-[0.9375rem] font-medium leading-none shadow-none transition-colors"
    : "inline-flex h-9 items-center justify-center rounded-[0.75rem] px-3 text-label-13 shadow-none transition-colors";

  const secondaryBtn = cn(
    navBtnBase,
    "text-[var(--secondary-text-color)] hover:bg-[var(--primary-background-hover-color)] hover:text-[var(--primary-text-color)]"
  );
  const authSecondaryBtn = cn(
    navBtnBase,
    "border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] text-[var(--primary-text-color)] hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)] focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-[var(--primary-background-color)]"
  );
  const authPrimaryBtn = cn(
    navBtnBase,
    isLanding && "px-[1.125rem]",
    "border border-[var(--primary-color)] bg-[var(--primary-color)] text-white hover:border-[var(--primary-hover-color)] hover:bg-[var(--primary-hover-color)] focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-[var(--primary-background-color)]"
  );

  const navHeight = isLanding ? "h-[4.75rem]" : "h-14";
  const brandGap  = isLanding ? "gap-3" : "gap-2";
  const brandBox  = isLanding ? "h-9 w-9 rounded-[0.625rem]" : "h-7 w-7 rounded-[0.55rem]";
  const brandIcon = isLanding ? "h-9 w-9" : "h-7 w-7";
  const brandText = isLanding
    ? "font-[var(--font-vibe-title)] text-[1.125rem] font-semibold leading-none tracking-normal text-[var(--primary-text-color)]"
    : "text-label-14 font-semibold text-[var(--primary-text-color)]";
  const avatarBox  = isLanding ? "h-10 w-10 rounded-[0.75rem]" : "h-9 w-9 rounded-lg";
  const themeClass = isLanding ? "!h-10 !w-10 !rounded-[0.75rem] shrink-0" : "shrink-0";
  const dropdownButtonClassName =
    "group inline-flex h-10 items-center gap-1.5 rounded-[0.75rem] px-3 text-[0.9375rem] font-medium leading-none text-[var(--primary-text-color)] transition-colors duration-100 hover:bg-[var(--primary-background-hover-color)] aria-expanded:bg-[var(--primary-background-hover-color)]";

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center border-b border-[var(--layout-border-color)] bg-[rgb(255_255_255_/_0.96)] backdrop-blur-xl dark:bg-[rgb(18_18_18_/_0.96)]">
      <div className={cn("w-full", contentClassName)}>
        <nav className={cn("relative flex items-center gap-8", navHeight)}>
          <Link href="/" className={cn("flex items-center shrink-0", brandGap)}>
            <div
              className={cn(
                "flex items-center justify-center overflow-hidden",
                brandBox,
              )}
            >
              <Image
                src="/SocialRavenLogo.svg"
                alt="SocialRaven logo"
                width={22}
                height={22}
                className={brandIcon}
              />
            </div>
            <p className={brandText}>SocialRaven</p>
          </Link>

          {isLanding && (
            <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Primary">
              {LANDING_NAV.map((item) => {
                if (item.type === "link") {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="inline-flex h-10 items-center rounded-[0.75rem] px-3 text-[0.9375rem] font-medium leading-none text-[var(--primary-text-color)] transition-colors duration-100 hover:bg-[var(--primary-background-hover-color)]"
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.key}
                    className="group/nav relative"
                    onMouseEnter={() => setOpenDropdown(item.key)}
                    onMouseLeave={() => setOpenDropdown((current) => (current === item.key ? null : current))}
                  >
                    <button
                      type="button"
                      className={dropdownButtonClassName}
                      aria-expanded={openDropdown === item.key}
                      aria-controls={`${item.key}-desktop-menu`}
                      onClick={() => {
                        setOpenDropdown((current) => (current === item.key ? null : item.key));
                      }}
                    >
                      <span>{item.label}</span>
                      <DropdownChevronDown className="h-4 w-4 text-[var(--secondary-text-color)] transition-transform duration-150 group-aria-expanded:rotate-180" />
                    </button>
                    <div
                      id={`${item.key}-desktop-menu`}
                      className={cn(
                        "absolute left-0 top-full hidden pt-3 group-hover/nav:block group-focus-within/nav:block",
                        openDropdown === item.key && "block"
                      )}
                    >
                      <EmptyDropdownPanel label={item.label} />
                    </div>
                  </div>
                );
              })}
            </nav>
          )}

          <div className={cn("ml-auto hidden items-center gap-2.5 lg:flex")}>
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className={secondaryBtn}>
                  Dashboard
                </Link>
                <div
                  className={cn(
                    "flex items-center justify-center overflow-hidden border border-[var(--ui-border-color)] bg-[var(--primary-background-color)]",
                    avatarBox,
                  )}
                >
                  <UserButton appearance={{ elements: { avatarBox: avatarBox } }} />
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
            className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] text-[var(--primary-text-color)] transition-colors hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)] lg:hidden"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <HamburgerIcon />
          </button>
        </nav>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden",
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-[rgb(0_0_0_/_0.36)] transition-opacity",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          id="mobile-navigation-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            "absolute right-0 top-0 flex h-dvh w-full max-w-[27rem] flex-col border-l border-[var(--layout-border-color)] bg-[var(--primary-background-color)] shadow-[0_1.5rem_4rem_rgba(41,47,76,0.2)] transition-transform duration-200",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex h-[4.75rem] items-center justify-between border-b border-[var(--layout-border-color)] px-4">
            <Link
              href="/"
              className="flex items-center gap-2.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[0.625rem]">
                <Image
                  src="/SocialRavenLogo.svg"
                  alt="SocialRaven logo"
                  width={36}
                  height={36}
                  className="h-9 w-9"
                />
              </span>
              <span className="font-[var(--font-vibe-title)] text-[1.125rem] font-semibold leading-none tracking-normal text-[var(--primary-text-color)]">
                SocialRaven
              </span>
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] text-[var(--primary-text-color)] transition-colors hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)]"
              aria-label="Close navigation menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Close className="h-[1.125rem] w-[1.125rem]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <div className="space-y-2">
              {LANDING_NAV.map((item) => {
                if (item.type === "link") {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex min-h-12 items-center justify-between rounded-[1rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-3.5 text-label-16 text-[var(--primary-text-color)] transition-colors hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{item.label}</span>
                      <NavigationChevronRight className="h-4 w-4 text-[var(--icon-color)]" />
                    </Link>
                  );
                }

                return (
                  <details
                    key={item.key}
                    className="group overflow-hidden rounded-[1rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)]"
                  >
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-3.5 text-label-16 text-[var(--primary-text-color)] marker:hidden [&::-webkit-details-marker]:hidden">
                      <span>{item.label}</span>
                      <DropdownChevronDown className="h-4 w-4 text-[var(--icon-color)] transition-transform duration-150 group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-6 text-center text-label-13 text-[var(--secondary-text-color)]">
                      No menu items yet.
                    </div>
                  </details>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 border-t border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] px-4 py-4">
            {isSignedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-4 text-label-14 text-[var(--primary-text-color)] transition-colors hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)]">
                  <UserButton appearance={{ elements: { avatarBox: "h-11 w-11 rounded-[0.875rem]" } }} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/sign-in"
                  className="inline-flex h-11 items-center justify-center rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-4 text-label-14 text-[var(--primary-text-color)] transition-colors hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-11 items-center justify-center rounded-[0.875rem] border border-[var(--primary-color)] bg-[var(--primary-color)] px-4 text-label-14 text-white transition-colors hover:border-[var(--primary-hover-color)] hover:bg-[var(--primary-hover-color)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
            <ThemeSwitcher compact={false} align="center" className="!w-full" />
          </div>
        </div>
      </div>
    </header>
  );
}

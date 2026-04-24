"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LANDING_NAV = [
  { label: "Features",  href: "/#features"  },
  { label: "Solutions", href: "/#solutions" },
  { label: "Pricing",   href: "/pricing"    },
];

export default function Navbar({
  contentClassName = "max-w-7xl px-4 sm:px-5",
  size = "default",
}: {
  contentClassName?: string;
  size?: "default" | "landing";
}) {
  const { isSignedIn } = useUser();
  const isLanding = size === "landing";

  const navBtnBase = isLanding
    ? "h-10 rounded-lg px-4 text-[0.9125rem] font-medium shadow-none"
    : "h-9 rounded-md px-3 text-[0.8125rem] font-medium shadow-none";

  const secondaryBtn = cn(
    navBtnBase,
    "text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
  );
  const authSecondaryBtn = cn(
    navBtnBase,
    "border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-[var(--ds-background-100)]"
  );
  const authPrimaryBtn = cn(
    navBtnBase,
    isLanding && "px-[1.125rem]",
    "border border-[var(--ds-blue-600)] bg-[var(--ds-blue-600)] text-white hover:border-[var(--ds-blue-700)] hover:bg-[var(--ds-blue-700)] focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-[var(--ds-background-100)]"
  );

  const navHeight = isLanding ? "h-16" : "h-14";
  const brandGap  = isLanding ? "gap-3.5" : "gap-2.5";
  const brandBox  = isLanding ? "h-11 w-11 rounded-xl" : "h-8 w-8 rounded-lg";
  const brandIcon = isLanding ? "h-6 w-6" : "h-5 w-5";
  const brandText = isLanding
    ? "text-[1.0625rem] font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))]"
    : "text-[0.8125rem] font-semibold tracking-[-0.01em] text-[hsl(var(--foreground))]";
  const avatarBox  = isLanding ? "h-11 w-11 rounded-xl" : "h-9 w-9 rounded-lg";
  const themeClass = isLanding ? "h-10 w-10 rounded-lg shrink-0" : "shrink-0";

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.92)] backdrop-blur-xl">
      <div className={cn("w-full", contentClassName)}>
        <nav className={cn("relative flex items-center gap-4", navHeight)}>

          {/* ── Left: Logo ─────────────────────────────────────────── */}
          <Link href="/" className={cn("flex items-center shrink-0", brandGap)}>
            <div className={cn(
              "flex items-center justify-center border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-sm",
              brandBox,
            )}>
              <Image
                src="/SocialRavenLogo.svg"
                alt="SocialRaven logo"
                width={22}
                height={22}
                className={brandIcon}
              />
            </div>
            <p className={cn("hidden sm:block", brandText)}>SocialRaven</p>
          </Link>

          {/* ── Right: Nav links + CTA area ─────────────────────────── */}
          <div className={cn("ml-auto flex items-center gap-2", isLanding && "gap-2.5")}>
            {isLanding && (
              <nav className="hidden items-center gap-0.5 lg:flex mr-1" aria-label="Primary">
                {LANDING_NAV.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="inline-flex h-9 items-center rounded-lg px-3.5 text-[0.875rem] font-medium text-[var(--ds-gray-900)] transition-colors duration-100 hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            )}
            {isSignedIn ? (
              <>
                <Button asChild variant="ghost" size="sm" className={secondaryBtn}>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <div className={cn(
                  "flex items-center justify-center overflow-hidden border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]",
                  avatarBox,
                )}>
                  <UserButton appearance={{ elements: { avatarBox: avatarBox } }} />
                </div>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className={authSecondaryBtn}>
                  <Link href="/sign-in">Login</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className={authPrimaryBtn}>
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </>
            )}
            <ThemeSwitcher compact className={themeClass} />
          </div>

        </nav>
      </div>
    </header>
  );
}

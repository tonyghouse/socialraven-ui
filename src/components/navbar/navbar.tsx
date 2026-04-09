"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navButtonClassName = "h-9 rounded-md px-3 text-[0.8125rem] font-medium shadow-none";

export default function Navbar({
  contentClassName = "max-w-7xl px-4 sm:px-5",
  size = "default",
}: {
  contentClassName?: string;
  size?: "default" | "landing";
}) {
  const { isSignedIn } = useUser();
  const isLanding = size === "landing";
  const currentNavButtonClassName = isLanding
    ? "h-10 rounded-lg px-4 text-[0.925rem] font-medium shadow-none"
    : navButtonClassName;
  const navSecondaryButtonClassName = cn(
    currentNavButtonClassName,
    "text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
  );
  const navPrimaryButtonClassName = cn(
    currentNavButtonClassName,
    isLanding && "px-[1.125rem]"
  );
  const navHeightClassName = isLanding ? "h-16" : "h-14";
  const brandGapClassName = isLanding ? "gap-3.5" : "gap-2.5";
  const brandBoxClassName = isLanding
    ? "h-11 w-11 rounded-xl"
    : "h-8 w-8 rounded-lg";
  const brandIconClassName = isLanding ? "h-6 w-6" : "h-5 w-5";
  const brandTextClassName = isLanding
    ? "text-[1.0625rem] font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))]"
    : "text-[0.8125rem] font-semibold tracking-[-0.01em] text-[hsl(var(--foreground))]";
  const avatarClassName = isLanding ? "h-11 w-11 rounded-xl" : "h-9 w-9 rounded-lg";
  const themeSwitcherClassName = isLanding
    ? "h-10 w-10 rounded-lg shrink-0"
    : "shrink-0";

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.92)] backdrop-blur-xl">
      <div className={cn("w-full", contentClassName)}>
        <nav className={cn("flex items-center justify-between gap-4", navHeightClassName)}>
          <Link href="/" className={cn("flex items-center", brandGapClassName)}>
            <div className={cn("flex items-center justify-center border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-sm", brandBoxClassName)}>
              <Image
                src="/SocialRavenLogo.svg"
                alt="SocialRaven logo"
                width={22}
                height={22}
                className={brandIconClassName}
              />
            </div>
            <div className="hidden sm:block">
              <p className={brandTextClassName}>SocialRaven</p>
            </div>
          </Link>

          <div className={cn("flex items-center gap-2", isLanding && "gap-2.5")}>
            {isSignedIn ? (
              <>
                <Button asChild variant="ghost" size="sm" className={navSecondaryButtonClassName}>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <div className={cn("flex items-center justify-center overflow-hidden border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]", avatarClassName)}>
                  <UserButton appearance={{ elements: { avatarBox: avatarClassName } }} />
                </div>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className={navSecondaryButtonClassName}>
                  <Link href="/pricing">Pricing</Link>
                </Button>
                <Button asChild size="sm" className={navPrimaryButtonClassName}>
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </>
            )}

            <ThemeSwitcher compact className={themeSwitcherClassName} />
          </div>
        </nav>
      </div>
    </header>
  );
}

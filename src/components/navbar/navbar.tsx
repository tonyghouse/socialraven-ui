"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navButtonClassName = "h-9 rounded-md px-3 text-[13px] font-medium shadow-none";
const navSecondaryButtonClassName = cn(
  navButtonClassName,
  "text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
);

export default function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.92)] backdrop-blur-xl">
      <div className="w-full max-w-7xl px-4 sm:px-6">
        <nav className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-sm">
              <Image
                src="/SocialRavenLogo.svg"
                alt="SocialRaven logo"
                width={22}
                height={22}
                className="h-[22px] w-[22px]"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold tracking-[-0.01em] text-[hsl(var(--foreground))]">SocialRaven</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <>
                <Button asChild variant="ghost" size="sm" className={navSecondaryButtonClassName}>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
                  <UserButton appearance={{ elements: { avatarBox: "h-9 w-9 rounded-lg" } }} />
                </div>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className={navSecondaryButtonClassName}>
                  <Link href="/pricing">Pricing</Link>
                </Button>
                <Button asChild size="sm" className={`${navButtonClassName} px-3.5`}>
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </>
            )}

            <ThemeSwitcher compact className="shrink-0" />
          </div>
        </nav>
      </div>
    </header>
  );
}

"use client";

import AtlassianButton, { LinkButton } from "@atlaskit/button/new";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";

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
            <ThemeSwitcher compact className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]" />

            {isSignedIn ? (
              <>
                <LinkButton appearance="subtle" href="/dashboard">
                  Dashboard
                </LinkButton>
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
                  <UserButton appearance={{ elements: { avatarBox: "h-9 w-9 rounded-lg" } }} />
                </div>
              </>
            ) : (
              <>
                <LinkButton appearance="subtle" href="/sign-in">
                  Sign in
                </LinkButton>
                <div className="hidden sm:block">
                  <LinkButton appearance="primary" href="/sign-up">
                   Signup
                  </LinkButton>
                </div>
                <div className="sm:hidden">
                  <AtlassianButton
                    appearance="primary"
                    onClick={() => {
                      window.location.href = "/sign-up";
                    }}
                  >
                    Signup
                  </AtlassianButton>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

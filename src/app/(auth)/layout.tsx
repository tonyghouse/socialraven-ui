import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--allgrey-background-color)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[88rem] flex-col px-6 py-8 md:px-10 lg:px-14">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)]">
              <Image src="/SocialRavenLogo.svg" alt="SocialRaven logo" width={22} height={22} className="h-5.5 w-5.5" />
            </span>
            <span className="text-heading-16 text-[var(--primary-text-color)]">SocialRaven</span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-4 text-label-14 text-[var(--primary-text-color)] transition-colors hover:border-[var(--primary-text-color)] hover:bg-[var(--primary-background-hover-color)]"
          >
            Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center py-10">
          <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-center">
            <div className="hidden lg:block">
              <div className="rounded-[1.5rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] p-8 shadow-[0_1.5rem_3rem_rgba(41,47,76,0.12)]">
                <div className="space-y-5">
                  <span className="inline-flex items-center rounded-full bg-[var(--primary-highlighted-color)] px-3 py-1 text-label-12 text-[var(--primary-color)]">
                    Structured auth flow
                  </span>
                  <div className="space-y-3">
                    <h1 className="max-w-lg text-heading-32 text-[var(--primary-text-color)]">
                      Sign in to a calmer publishing workspace.
                    </h1>
                    <p className="max-w-xl text-copy-14 text-[var(--secondary-text-color)]">
                      The UI has been reshaped around clearer hierarchy: fewer visual detours,
                      clearer actions, and blue-primary workflow cues from login through dashboard.
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-[1rem] border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] p-4">
                      <p className="text-heading-16 text-[var(--primary-text-color)]">Official OAuth</p>
                      <p className="mt-1 text-copy-13 text-[var(--secondary-text-color)]">
                        Platform connections stay scoped and operationally clear.
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] p-4">
                      <p className="text-heading-16 text-[var(--primary-text-color)]">One blue path</p>
                      <p className="mt-1 text-copy-13 text-[var(--secondary-text-color)]">
                        Primary actions are now visually consistent across the app.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

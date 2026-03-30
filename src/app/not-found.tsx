import Image from "next/image";
import Link from "next/link";
import { Compass, Home, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-app-canvas text-[hsl(var(--foreground))]">
      <header className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-md text-sm font-semibold text-[hsl(var(--foreground))] transition-colors hover:text-[hsl(var(--accent))]"
          >
            <Image
              src="/SocialRavenLogo.svg"
              alt="SocialRaven"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span>SocialRaven</span>
          </Link>

          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <Compass />
              Open dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-7xl items-center px-6 py-12 md:px-8 md:py-16">
        <section className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
            <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]">
                  <SearchX className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[hsl(var(--foreground-subtle))]">
                    Error 404
                  </p>
                  <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))] sm:text-[32px]">
                    This page can&apos;t be found
                  </h1>
                </div>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6">
              <p className="max-w-2xl text-sm leading-6 text-[hsl(var(--foreground-muted))] sm:text-base">
                The address may be outdated, the page may have moved, or you may not
                have a valid route for this workspace. Use one of the standard
                recovery actions below to continue.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[hsl(var(--foreground-subtle))]">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-medium text-[hsl(var(--foreground))]">
                    Resource unavailable
                  </p>
                </div>
                <div className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[hsl(var(--foreground-subtle))]">
                    Suggested action
                  </p>
                  <p className="mt-2 text-sm font-medium text-[hsl(var(--foreground))]">
                    Return to a known entry point
                  </p>
                </div>
                <div className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[hsl(var(--foreground-subtle))]">
                    Scope
                  </p>
                  <p className="mt-2 text-sm font-medium text-[hsl(var(--foreground))]">
                    Public or protected route
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 border-t border-[hsl(var(--border-subtle))] pt-6 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="sm:w-auto">
                  <Link href="/">
                    <Home />
                    Go to homepage
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="sm:w-auto">
                  <Link href="/dashboard">
                    <Compass />
                    Go to dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-[var(--shadow-xs)]">
            <div className="border-b border-[hsl(var(--border-subtle))] px-5 py-4">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Troubleshooting
              </p>
            </div>
            <div className="space-y-4 px-5 py-5 text-sm leading-6 text-[hsl(var(--foreground-muted))]">
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">Check the URL</p>
                <p>Confirm the route path and workspace-specific segments are correct.</p>
              </div>
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">Use navigation</p>
                <p>Open the homepage or dashboard to continue from a valid page.</p>
              </div>
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">Retry the flow</p>
                <p>If you followed an old bookmark, re-enter from the app navigation.</p>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

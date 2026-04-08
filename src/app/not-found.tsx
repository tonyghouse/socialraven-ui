import Image from "next/image";
import Link from "next/link";
import { Compass, Home, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]">
      <header className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-md text-label-14 text-[var(--ds-gray-1000)] transition-colors hover:text-[var(--ds-blue-700)]"
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

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-9 rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-label-14 text-[var(--ds-gray-1000)] shadow-none transition-colors hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]"
          >
            <Link href="/dashboard">
              <Compass />
              Open dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-7xl items-center px-6 py-12 md:px-8 md:py-16">
        <section className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-none">
            <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]">
                  <SearchX className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-label-12 text-[var(--ds-gray-900)]">
                    Error 404
                  </p>
                  <h1 className="text-heading-24 text-[var(--ds-gray-1000)] sm:text-[1.75rem] sm:leading-8">
                    This page can&apos;t be found
                  </h1>
                </div>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6">
              <p className="max-w-2xl text-copy-16 text-[var(--ds-gray-900)]">
                The address may be outdated, the page may have moved, or you may not
                have a valid route for this workspace. Use one of the standard
                recovery actions below to continue.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3">
                  <p className="text-label-12 text-[var(--ds-gray-900)]">
                    Status
                  </p>
                  <p className="mt-2 text-label-14 text-[var(--ds-gray-1000)]">
                    Resource unavailable
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3">
                  <p className="text-label-12 text-[var(--ds-gray-900)]">
                    Suggested action
                  </p>
                  <p className="mt-2 text-label-14 text-[var(--ds-gray-1000)]">
                    Return to a known entry point
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3">
                  <p className="text-label-12 text-[var(--ds-gray-900)]">
                    Scope
                  </p>
                  <p className="mt-2 text-label-14 text-[var(--ds-gray-1000)]">
                    Public or protected route
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 border-t border-[var(--ds-gray-400)] pt-6 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-10 rounded-md bg-[var(--ds-blue-600)] px-4 text-label-14 text-white shadow-none transition-colors hover:bg-[var(--ds-blue-700)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)] sm:w-auto"
                >
                  <Link href="/">
                    <Home />
                    Go to homepage
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-10 rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 text-label-14 text-[var(--ds-gray-1000)] shadow-none transition-colors hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)] sm:w-auto"
                >
                  <Link href="/dashboard">
                    <Compass />
                    Go to dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-none">
            <div className="border-b border-[var(--ds-gray-400)] px-5 py-4">
              <p className="text-heading-16 text-[var(--ds-gray-1000)]">
                Troubleshooting
              </p>
            </div>
            <div className="space-y-4 px-5 py-5 text-copy-14 text-[var(--ds-gray-900)]">
              <div>
                <p className="text-label-14 text-[var(--ds-gray-1000)]">Check the URL</p>
                <p>Confirm the route path and workspace-specific segments are correct.</p>
              </div>
              <div>
                <p className="text-label-14 text-[var(--ds-gray-1000)]">Use navigation</p>
                <p>Open the homepage or dashboard to continue from a valid page.</p>
              </div>
              <div>
                <p className="text-label-14 text-[var(--ds-gray-1000)]">Retry the flow</p>
                <p>If you followed an old bookmark, re-enter from the app navigation.</p>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

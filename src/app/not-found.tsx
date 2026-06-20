import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex justify-center border-b border-[var(--layout-border-color)] bg-[color-mix(in_srgb,var(--primary-background-color)_94%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-[4.375rem] w-full max-w-[89rem] items-center px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-[0.875rem] pr-2 transition-colors hover:bg-[var(--primary-background-hover-color)]"
            aria-label="SocialRaven home"
          >
            <span className="flex h-[2.1875rem] w-[2.1875rem] shrink-0 items-center justify-center overflow-hidden rounded-[0.6875rem] ring-1 ring-[var(--layout-border-color)]">
              <Image
                src="/SocialRavenLogo.svg"
                alt=""
                width={36}
                height={36}
                className="h-[2.1875rem] w-[2.1875rem]"
                priority
              />
            </span>
            <span className="truncate font-[var(--font-vibe-title)] text-[1.03125rem] font-semibold leading-none tracking-normal text-[var(--primary-text-color)]">
              SocialRaven
            </span>
          </Link>
        </div>
      </header>

      <main className="min-h-screen bg-[var(--allgrey-background-color)] pt-[4.375rem] text-[var(--primary-text-color)]">
        <section className="flex min-h-[calc(100svh-4.375rem)] items-center justify-center px-5 py-12">
          <div className="mx-auto flex w-full max-w-[34rem] flex-col items-center text-center">
            <p className="text-label-12 font-semibold uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              404
            </p>
            <h1 className="mt-3 font-[var(--font-vibe-title)] text-[2.5rem] font-bold leading-none tracking-normal text-[var(--primary-text-color)] sm:text-[3.5rem]">
              Page not found
            </h1>
            <p className="mt-4 max-w-[26rem] text-copy-16 text-[var(--secondary-text-color)]">
              This page does not exist or may have been moved.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex min-h-10 items-center justify-center rounded-[0.875rem] border border-[var(--primary-color)] bg-[var(--primary-color)] px-4 text-label-14 font-semibold text-white shadow-none transition-colors hover:border-[var(--primary-hover-color)] hover:bg-[var(--primary-hover-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--allgrey-background-color)]"
            >
              Back to homepage
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

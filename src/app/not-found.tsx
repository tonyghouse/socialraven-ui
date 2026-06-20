import Image from "next/image";
import Link from "next/link";

function NotFoundIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="h-auto w-full max-w-[19rem] text-[var(--primary-text-color)]"
      viewBox="0 0 304 190"
      fill="none"
    >
      <path
        d="M68 153.5c20.8-30.7 40.8-53.7 61.8-69.8 8.9-6.9 22.1-3.4 26.7 6.9l28 62.9H68Z"
        fill="var(--color-egg_yolk-selected)"
        opacity="0.78"
      />
      <path
        d="M91.5 154.5h117"
        stroke="var(--ui-border-color)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M130 86.2c-3.8 13.6-5.7 27.1-5.7 40.6 0 8.8 5.5 15.1 14 15.1h42.1"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M142.6 82.1c6.9 1.4 11.9 6.1 14.9 14.1"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M135.8 78.8c7.1-8.3 14-9.2 20.8-2.7"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M125.2 113.3c-17.1 9.6-29.5 21.1-37.1 34.4"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M152.8 126.5c9.9 4 21.6 6.2 35.2 6.8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M184.2 67.5c7.1 8.6 11.2 17 12.3 25.1"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M199.8 72.9 185.9 84"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="175.7" cy="60.4" r="6.2" fill="currentColor" />
      <path
        d="M206.5 60.8c3.1-6.4 7.9-9.2 14.4-8.4 6.1.7 9.3 4.8 9.6 12.2-7.6 7.4-15.6 6.1-24-3.8Z"
        fill="var(--color-done-green-selected)"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M221.1 44.5v-8.2M236.5 54.9l7-4.2M234.2 72.5l8.1 2.2"
        stroke="var(--primary-color)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M66.5 61.5c12.4-11.8 29.3-17.2 50.6-16.2"
        stroke="var(--ui-border-color)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M47.5 78.5c8.7-6 18.7-8.7 30-8"
        stroke="var(--ui-border-color)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function NotFound() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--layout-border-color)] bg-[var(--primary-background-color)]">
        <div className="mx-auto flex h-16 w-full max-w-[88rem] items-center px-6 md:px-10 lg:px-14">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="SocialRaven home">
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.875rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)]">
              <Image
                src="/SocialRavenLogo.svg"
                alt=""
                width={22}
                height={22}
                className="h-[1.375rem] w-[1.375rem]"
              />
            </span>
            <span className="text-heading-16 text-[var(--primary-text-color)]">SocialRaven</span>
          </Link>
        </div>
      </header>
      <main className="min-h-screen bg-[var(--primary-background-color)] pt-16 text-[var(--primary-text-color)]">
        <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
          <div className="mx-auto flex w-full max-w-[38rem] flex-col items-center text-center">
            <NotFoundIllustration />
            <p className="mt-10 text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              404
            </p>
            <h1 className="mt-3 font-[var(--font-vibe-title)] text-[clamp(2rem,1.7rem+1.5vw,3rem)] font-semibold leading-[1.05] text-[var(--primary-text-color)]">
              We couldn&apos;t find this page.
            </h1>
            <p className="mt-4 max-w-[30rem] text-copy-16 text-[var(--secondary-text-color)]">
              The link may be broken, or the page may have moved.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex min-h-10 items-center justify-center rounded-[0.875rem] border border-[var(--primary-color)] bg-[var(--primary-color)] px-4 text-label-14 text-white shadow-none transition-colors hover:border-[var(--primary-hover-color)] hover:bg-[var(--primary-hover-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary-background-color)]"
            >
              Back to homepage
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[hsl(40_6%_96%)] dark:bg-[var(--ds-background-100)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] dark:hidden"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, hsl(212 86% 82% / 0.20) 0%, transparent 56%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[44rem] dark:block"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -5%, hsl(212 86% 54% / 0.22) 0%, transparent 61%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28] dark:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(214 18% 46% / 0.68) 1.75px, transparent 1.75px)",
          backgroundSize: "1.75rem 1.75rem",
          maskImage: "linear-gradient(to bottom, black 0%, black 56%, transparent 81%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 56%, transparent 81%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] opacity-[0.34] dark:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(212 82% 66% / 0.44) 1.75px, transparent 1.75px)",
          backgroundSize: "1.75rem 1.75rem",
          maskImage:
            "radial-gradient(ellipse 76% 54% at 50% 8%, black 0%, transparent 69%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 76% 54% at 50% 8%, black 0%, transparent 69%)",
          filter: "blur(0.55px) drop-shadow(0 0 8px hsl(212 86% 66% / 0.16))",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(212 86% 72% / 0.55) 1.75px, transparent 1.75px)",
          backgroundSize: "1.75rem 1.75rem",
          maskImage: "linear-gradient(to bottom, black 0%, black 46%, transparent 68%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 46%, transparent 68%)",
          filter: "blur(0.4px) drop-shadow(0 0 3px hsl(212 86% 65% / 0.6))",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[5.5rem] dark:hidden"
          style={{
            background:
              "radial-gradient(circle, rgb(255 255 255 / 0.96) 0%, rgb(255 255 255 / 0.84) 34%, transparent 72%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[5.5rem] dark:block"
          style={{
            background:
              "radial-gradient(circle, rgb(0 0 0 / 0.86) 0%, rgb(0 0 0 / 0.68) 36%, transparent 74%)",
          }}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

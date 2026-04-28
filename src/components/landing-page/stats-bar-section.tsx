import { LANDING_PAGE_CONTAINER_CLASS, LIVE_PLATFORM_COUNT } from "@/components/landing-page/landing-page-constants";

export function LandingPageStatsBarSection() {
  return (
    <section className="border-y border-[var(--ds-gray-200)] bg-white py-8 dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-200)]">
      <div className={LANDING_PAGE_CONTAINER_CLASS}>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {[
            { v: String(LIVE_PLATFORM_COUNT), l: "Live platforms" },
            { v: "14-day", l: "Free trial" },
            { v: "OAuth", l: "Secure connections" },
          ].map(({ v, l }) => (
            <div key={l} className="text-center">
              <p className="text-[2rem] font-black tracking-[-0.04em] text-[var(--ds-gray-1000)]">{v}</p>
              <p className="mt-0.5 text-[0.75rem] text-[var(--ds-gray-600)]">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

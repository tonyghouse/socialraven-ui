export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[var(--allgrey-background-color)] px-5 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--secondary-text-color)]">
              Dashboard
            </p>
            <h1 className="text-heading-32 text-[var(--primary-text-color)]">
              Product shell migration in progress
            </h1>
            <p className="max-w-3xl text-copy-14 text-[var(--secondary-text-color)]">
              The protected workspace has been moved toward calmer surfaces and clearer hierarchy.
              Core publishing features are still being rebuilt feature-by-feature.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-[var(--primary-selected-color)] bg-[var(--primary-selected-color)] px-3 py-1 text-label-12 text-[var(--primary-color)]">
            feature/vibe-ui-check
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.25rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] p-5 shadow-[0_1rem_2rem_rgba(41,47,76,0.08)]">
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Queue health
            </p>
            <p className="mt-3 text-heading-24 text-[var(--primary-text-color)]">Stable</p>
            <p className="mt-2 text-copy-13 text-[var(--secondary-text-color)]">
              Layout and navigation migrated. Publishing flows still pending.
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] p-5 shadow-[0_1rem_2rem_rgba(41,47,76,0.08)]">
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Primary accent
            </p>
            <p className="mt-3 text-heading-24 text-[var(--primary-text-color)]">Blue only</p>
            <p className="mt-2 text-copy-13 text-[var(--secondary-text-color)]">
              Primary actions now align to one consistent blue accent instead of mixed colors.
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] p-5 shadow-[0_1rem_2rem_rgba(41,47,76,0.08)]">
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Next up
            </p>
            <p className="mt-3 text-heading-24 text-[var(--primary-text-color)]">Real features</p>
            <p className="mt-2 text-copy-13 text-[var(--secondary-text-color)]">
              Scheduling, connected accounts, analytics, and billing still need functional rebuilds.
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)] p-6 shadow-[0_1.5rem_3rem_rgba(41,47,76,0.12)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-heading-20 text-[var(--primary-text-color)]">Under maintenance</p>
                <p className="mt-1 text-copy-14 text-[var(--secondary-text-color)]">
                  This dashboard is intentionally acting as a design-system staging surface until the next protected features land.
                </p>
              </div>
              <span className="hidden rounded-full border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-3 py-1 text-label-12 text-[var(--secondary-text-color)] md:inline-flex">
                Placeholder state
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                "Replace placeholder widgets with real publishing metrics.",
                "Rebuild scheduler and calendar flows using the same component language.",
                "Carry the same visual system into analytics, billing, and account setup.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1rem] border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-4 text-copy-13 text-[var(--primary-text-color)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

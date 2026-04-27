import type { ReactNode } from "react";

export function LandingPageLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--ds-gray-400)] bg-white px-3.5 py-1 text-[0.75rem] font-medium text-[var(--ds-gray-900)] dark:bg-[var(--ds-background-200)]">
      {children}
    </span>
  );
}

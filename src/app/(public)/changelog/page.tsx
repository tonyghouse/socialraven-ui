import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";

export const metadata: Metadata = {
  title: "Changelog | Social Raven",
  description: "What's new in Social Raven — feature releases, improvements, and fixes.",
};

const ENTRIES = [
  {
    version: "v0.1 — Beta",
    date: "February 2026",
    badge: "New",
    items: [
      "Instagram, Twitter/X, LinkedIn, YouTube, and Facebook integrations",
      "Smart scheduling with AI-powered timing recommendations",
      "Multi-platform post creation (image, video, text)",
      "Analytics dashboard with reach, engagement, and post performance",
      "Multi-account management for agencies",
      "GDPR-compliant data handling with EU data storage",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <Navbar />
      <div className="bg-[#f9fafb] px-6 md:px-10 pt-5">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>
      <main className="min-h-screen bg-[#f9fafb]">

        {/* Hero */}
        <div className="bg-white border-b border-[hsl(var(--border))] px-6 md:px-10 py-16">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-3">Changelog</p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-4">
              What&apos;s new
            </h1>
            <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl">
              Every improvement, fix, and new feature — documented.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 md:px-10 py-14">
          <div className="mx-auto max-w-7xl">

            <div className="space-y-8">
              {ENTRIES.map(({ version, date, badge, items }) => (
                <div key={version} className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">{version}</h2>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] text-xs font-semibold">
                      {badge}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-6">{date}</p>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-[hsl(var(--muted-foreground))]">
                        <span className="text-[hsl(var(--accent))] mt-0.5 flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>
        </div>

      </main>
    </>
  );
}

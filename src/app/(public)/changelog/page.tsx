import type { Metadata } from "next";
import Link from "next/link";

import { PublicLozenge } from "@/components/public/public-site-primitives";
import {
  PublicCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
} from "@/components/public/public-layout";

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
      "Shared scheduling workflows for planned publishing",
      "Multi-platform post creation (image, video, text)",
      "Analytics dashboard with reach, engagement, and post performance",
      "Multi-account management for agencies",
      "GDPR and CCPA-compliant data handling",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <PublicPageShell>
      <PublicHero
        topSlot={
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-label-14 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]"
          >
            ← Back
          </Link>
        }
        eyebrow="Changelog"
        title="What&apos;s new"
        description="Every improvement, fix, and new feature — documented."
      />

      <PublicSection>
        <div className="space-y-8">
          {ENTRIES.map(({ version, date, badge, items }) => (
            <PublicCard key={version} className="p-8">
              <div className="mb-1 flex flex-wrap items-center gap-3">
                <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">{version}</h2>
                <PublicLozenge appearance="new" isBold>
                  {badge}
                </PublicLozenge>
              </div>
              <p className="mb-6 text-label-12 text-[var(--ds-gray-900)]">{date}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-copy-14 text-[var(--ds-gray-900)]"
                  >
                    <span className="mt-0.5 text-[var(--ds-blue-600)]">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </PublicCard>
          ))}
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

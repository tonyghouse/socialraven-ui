import type { Metadata } from "next";
import Link from "next/link";

import { PublicLozenge } from "@/components/public/public-atlassian";
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
            className="inline-flex items-center gap-1 text-sm text-[hsl(var(--foreground-muted))] transition-colors hover:text-[hsl(var(--foreground))]"
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
                <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">{version}</h2>
                <PublicLozenge appearance="new" isBold>
                  {badge}
                </PublicLozenge>
              </div>
              <p className="mb-6 text-xs leading-4 text-[hsl(var(--foreground-muted))]">{date}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-5 text-[hsl(var(--foreground-muted))]"
                  >
                    <span className="mt-0.5 text-[hsl(var(--accent))]">✓</span>
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

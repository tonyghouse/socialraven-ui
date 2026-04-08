import type { Metadata } from "next";
import Link from "next/link";
import {
  Target,
  Shield,
  Globe,
  Users,
  Zap,
  CheckCircle2,
  BarChart,
  Lock,
  Calendar,
} from "lucide-react";

import {
  PublicPrimaryLinkButton,
  PublicSubtleLinkButton,
} from "@/components/public/public-site-primitives";
import {
  PublicCard,
  PublicHero,
  PublicInsetCard,
  PublicPageShell,
  PublicSection,
} from "@/components/public/public-layout";

export const metadata: Metadata = {
  title: "About | Social Raven",
  description:
    "Learn about Social Raven — who we are, why we built it, and our mission to simplify professional social media management for teams worldwide.",
};

const STATS = [
  { value: "5", label: "Supported platforms" },
  { value: "3", label: "Post types" },
  { value: "OAuth", label: "Secure connections" },
  { value: "Review", label: "Approval workflows" },
];

const VALUES = [
  {
    icon: Target,
    title: "Simplicity first",
    description:
      "We cut through the noise. Every feature earns its place — if it doesn't make your workflow faster, it doesn't ship.",
  },
  {
    icon: Shield,
    title: "Privacy by design",
    description:
      "We publish clear policy pages, limit data use to operating the service, and keep connected accounts scoped to official OAuth permissions.",
  },
  {
    icon: Zap,
    title: "Reliability you can count on",
    description:
      "Scheduling tools should be predictable. We focus on clear workflows, visible status, and fewer operational surprises.",
  },
  {
    icon: Globe,
    title: "Built for global teams",
    description:
      "Whether you're a solo operator or a multi-brand team, Social Raven is designed for distributed publishing work across regions and time zones.",
  },
];

const PERSONAS = [
  {
    title: "Creators & Influencers",
    description:
      "Stop spending hours manually posting across platforms. Batch-create your content for the week, schedule it in minutes, and focus on what actually matters — making great content.",
    bullets: [
      "Multi-platform publishing in one step",
      "Shared calendar planning",
      "Post performance analytics",
    ],
  },
  {
    title: "Agencies & Freelancers",
    description:
      "Manage every client account from one clean dashboard. No more tab-switching, no more missed posts. Professional workflows built for teams handling multiple brands simultaneously.",
    bullets: [
      "Multi-workspace account management",
      "Client account management",
      "Team collaboration tools",
    ],
  },
  {
    title: "Brands & Businesses",
    description:
      "Maintain a consistent publishing process across channels without a dedicated operations team. Keep reviews, scheduling, and reporting in one place.",
    bullets: [
      "Brand consistency tools",
      "Advanced cross-platform analytics",
      "Enterprise security & compliance",
    ],
  },
];

export default function AboutPage() {
  return (
    <PublicPageShell>
      <div className="mx-auto w-full max-w-7xl px-6 pt-4 md:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-label-14 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]"
        >
          ← Back
        </Link>
      </div>
      <PublicHero
        eyebrow="Our story"
        title="Built for teams who take social media seriously."
        description="Social Raven is a professional social media management platform operated by Kammullu Ghouse, a sole proprietor trading as Social Raven. It was built to make serious publishing workflows simpler and more affordable."
        aside={
          <PublicCard className="grid gap-5 p-6 sm:grid-cols-2">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-heading-32 text-[var(--ds-gray-1000)]">
                  {value}
                </p>
                <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">{label}</p>
              </div>
            ))}
          </PublicCard>
        }
      />

      <PublicSection>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="text-label-12 text-[var(--ds-gray-900)]">
              Our mission
            </p>
            <h2 className="text-heading-32 text-[var(--ds-gray-1000)]">
              Give every team the tools that used to cost a fortune.
            </h2>
            <p className="text-copy-14 text-[var(--ds-gray-900)] md:text-[1rem] md:leading-6">
              Enterprise social media tools charge thousands per month and take weeks to set up. Meanwhile, creators and small businesses are duct-taping together spreadsheets, free trials, and manual posting.
            </p>
            <p className="text-copy-14 text-[var(--ds-gray-900)] md:text-[1rem] md:leading-6">
              Social Raven exists to close that gap. We believe powerful, professional-grade scheduling and analytics should be accessible to every creator, agency, and business — not just the ones with six-figure software budgets.
            </p>
            <p className="text-copy-14 text-[var(--ds-gray-900)] md:text-[1rem] md:leading-6">
              The service is operated from India by Kammullu Ghouse under the Social Raven brand.
            </p>
            <div>
              <PublicPrimaryLinkButton href="/sign-up">Start for free</PublicPrimaryLinkButton>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Calendar, label: "Smart scheduling", value: "Plan campaigns and publishing windows clearly" },
              { icon: BarChart, label: "Unified analytics", value: "All platforms in one view" },
              { icon: Users, label: "Multi-account", value: "Workspace-based account management" },
              { icon: Lock, label: "Secure & compliant", value: "GDPR · CCPA · TLS 1.2+" },
            ].map(({ icon: Icon, label, value }) => (
              <PublicInsetCard key={label} className="space-y-3 p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-blue-600)]">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-label-14 text-[var(--ds-gray-1000)]">{label}</p>
                <p className="text-label-12 text-[var(--ds-gray-900)]">{value}</p>
              </PublicInsetCard>
            ))}
          </div>
        </div>
      </PublicSection>

      <PublicSection eyebrow="What we stand for" title="The principles we build by" surface="surface">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <PublicInsetCard key={title} className="space-y-4 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-blue-600)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">{title}</h3>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">{description}</p>
            </PublicInsetCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection eyebrow="Who we build for" title="One platform. Every team.">
        <div className="grid gap-5 md:grid-cols-3">
          {PERSONAS.map(({ title, description, bullets }) => (
            <PublicCard key={title} className="space-y-4 p-7">
              <div className="space-y-3">
                <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">{title}</h3>
                <p className="text-copy-14 text-[var(--ds-gray-900)]">{description}</p>
              </div>
              <ul className="space-y-2.5 pt-1">
                {bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-2.5 text-copy-13 text-[var(--ds-gray-900)]"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--ds-blue-600)]" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection>
        <PublicCard className="px-8 py-10 text-center md:px-14 md:py-16">
          <div className="mx-auto max-w-3xl space-y-5">
            <p className="text-label-12 text-[var(--ds-gray-900)]">
              Get started
            </p>
            <h2 className="text-heading-32 text-[var(--ds-gray-1000)]">
              Ready to take back your time?
            </h2>
            <p className="mx-auto max-w-md text-copy-14 text-[var(--ds-gray-900)] md:text-[1rem] md:leading-6">
              Start with a trial workspace and see whether Social Raven fits the way your team plans and publishes content.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <PublicPrimaryLinkButton href="/sign-up">Start free trial</PublicPrimaryLinkButton>
              <PublicSubtleLinkButton href="/contact">Talk to us</PublicSubtleLinkButton>
            </div>
          </div>
        </PublicCard>
      </PublicSection>
    </PublicPageShell>
  );
}

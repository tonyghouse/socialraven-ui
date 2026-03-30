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
  PublicTag,
} from "@/components/public/public-atlassian";
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
  { value: "10K+", label: "Active users" },
  { value: "2M+", label: "Posts scheduled" },
  { value: "98%", label: "Delivery rate" },
  { value: "40+", label: "Countries served" },
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
      "GDPR and CCPA-compliant from the ground up. Your data is never sold, never shared for advertising, and never used to train AI without your explicit consent.",
  },
  {
    icon: Zap,
    title: "Reliability you can count on",
    description:
      "Missed post times cost engagement. We obsess over uptime, delivery rates, and resilience so your content goes live exactly when it should.",
  },
  {
    icon: Globe,
    title: "Built for global teams",
    description:
      "Whether you're a solo creator in London or an agency in New York, Social Raven works seamlessly across regions and time zones.",
  },
];

const PERSONAS = [
  {
    title: "Creators & Influencers",
    description:
      "Stop spending hours manually posting across platforms. Batch-create your content for the week, schedule it in minutes, and focus on what actually matters — making great content.",
    bullets: [
      "Multi-platform publishing in one step",
      "AI-powered best-time scheduling",
      "Post performance analytics",
    ],
  },
  {
    title: "Agencies & Freelancers",
    description:
      "Manage every client account from one clean dashboard. No more tab-switching, no more missed posts. Professional workflows built for teams handling multiple brands simultaneously.",
    bullets: [
      "Unlimited social profiles",
      "Client account management",
      "Team collaboration tools",
    ],
  },
  {
    title: "Brands & Businesses",
    description:
      "Maintain a consistent brand voice across all channels without a dedicated operations team. Scale your social presence intelligently with AI-powered insights and automation.",
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
          className="inline-flex items-center gap-1 text-sm text-[hsl(var(--foreground-muted))] transition-colors hover:text-[hsl(var(--foreground))]"
        >
          ← Back
        </Link>
      </div>
      <PublicHero
        eyebrow="Our story"
        title="Built for teams who take social media seriously."
        description="Social Raven is a professional social media management platform — built by a small, focused team who believed the category was overcomplicated and overpriced. We set out to fix that."
        aside={
          <PublicCard className="grid gap-5 p-6 sm:grid-cols-2">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))]">
                  {value}
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">{label}</p>
              </div>
            ))}
          </PublicCard>
        }
      />

      <PublicSection>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[hsl(var(--foreground-subtle))]">
              Our mission
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))] md:text-4xl">
              Give every team the tools that used to cost a fortune.
            </h2>
            <p className="leading-7 text-[hsl(var(--foreground-muted))]">
              Enterprise social media tools charge thousands per month and take weeks to set up. Meanwhile, creators and small businesses are duct-taping together spreadsheets, free trials, and manual posting.
            </p>
            <p className="leading-7 text-[hsl(var(--foreground-muted))]">
              Social Raven exists to close that gap. We believe powerful, professional-grade scheduling and analytics should be accessible to every creator, agency, and business — not just the ones with six-figure software budgets.
            </p>
            <div>
              <PublicPrimaryLinkButton href="/sign-up">Start for free</PublicPrimaryLinkButton>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Calendar, label: "Smart scheduling", value: "Post at peak times, automatically" },
              { icon: BarChart, label: "Unified analytics", value: "All platforms in one view" },
              { icon: Users, label: "Multi-account", value: "Unlimited social profiles" },
              { icon: Lock, label: "Secure & compliant", value: "GDPR · CCPA · TLS 1.2+" },
            ].map(({ icon: Icon, label, value }) => (
              <PublicInsetCard key={label} className="space-y-3 p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--accent))]">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{label}</p>
                <p className="text-xs leading-6 text-[hsl(var(--foreground-muted))]">{value}</p>
              </PublicInsetCard>
            ))}
          </div>
        </div>
      </PublicSection>

      <PublicSection eyebrow="What we stand for" title="The principles we build by" surface="surface">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <PublicInsetCard key={title} className="space-y-4 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--accent))]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-[hsl(var(--foreground))]">{title}</h3>
              <p className="text-sm leading-6 text-[hsl(var(--foreground-muted))]">{description}</p>
            </PublicInsetCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection eyebrow="Who we build for" title="One platform. Every team.">
        <div className="grid gap-5 md:grid-cols-3">
          {PERSONAS.map(({ title, description, bullets }) => (
            <PublicCard key={title} className="space-y-4 p-7">
              <div className="space-y-3">
                <PublicTag text={title} />
                <p className="text-sm leading-6 text-[hsl(var(--foreground-muted))]">{description}</p>
              </div>
              <ul className="space-y-2.5 pt-1">
                {bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-2.5 text-sm text-[hsl(var(--foreground-muted))]"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[hsl(var(--accent))]" />
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
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[hsl(var(--foreground-subtle))]">
              Get started
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))] md:text-4xl">
              Ready to take back your time?
            </h2>
            <p className="mx-auto max-w-md text-base leading-7 text-[hsl(var(--foreground-muted))]">
              Join thousands of creators and agencies managing their social media with Social Raven. Start free — no credit card required.
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

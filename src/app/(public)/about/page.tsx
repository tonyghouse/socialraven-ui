import type { Metadata } from "next";
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
  PublicBackLink,
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
    "Learn about Social Raven, the team behind it, and the mission to simplify professional social media management.",
};

const VALUES = [
  {
    icon: Target,
    title: "Simplicity first",
    description: "Every feature earns its place — if it doesn't make your workflow faster, it doesn't ship.",
  },
  {
    icon: Shield,
    title: "Privacy by design",
    description: "Data use is limited to operating the service. Connected accounts stay scoped to official OAuth permissions.",
  },
  {
    icon: Zap,
    title: "Reliable by default",
    description: "Clear workflows, visible status, and fewer operational surprises.",
  },
  {
    icon: Globe,
    title: "Built for global teams",
    description: "Designed for distributed publishing across regions, time zones, and team sizes.",
  },
];

const PERSONAS = [
  {
    title: "Creators & Influencers",
    bullets: [
      "Multi-platform publishing in one step",
      "Clear calendar visibility",
      "Readable performance tracking",
    ],
  },
  {
    title: "Agencies & Freelancers",
    bullets: [
      "Workspace-based client separation",
      "Review flows for internal sign-off",
      "Scheduling built for repeatable delivery",
    ],
  },
  {
    title: "Brands & Businesses",
    bullets: [
      "Consistent publishing process",
      "Cross-platform reporting in one view",
      "Controls that support growing teams",
    ],
  },
];

const CAPABILITIES = [
  { icon: Calendar, label: "Smart scheduling", value: "Plan campaigns and publishing windows clearly" },
  { icon: BarChart, label: "Unified analytics", value: "All platforms in one view" },
  { icon: Users, label: "Multi-account", value: "Workspace-based account management" },
  { icon: Lock, label: "Secure & compliant", value: "GDPR · CCPA · TLS 1.2+" },
];

export default function AboutPage() {
  return (
    <PublicPageShell>
      <PublicHero
        topSlot={<PublicBackLink href="/" />}
        title="Built for teams who take social media seriously."
      />

      <PublicSection>
        <div>
          <PublicCard className="overflow-hidden">
            <div className="divide-y divide-[var(--ds-gray-400)]">

              {/* Mission */}
              <section id="mission" className="px-7 py-8 md:px-8">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-start">
                  <div className="space-y-5">
                    <h2 className="text-heading-24 text-[var(--ds-gray-1000)]">
                      Give serious teams a simpler way to run social.
                    </h2>
                    <p className="text-copy-14 text-[var(--ds-gray-900)] md:text-[1rem] md:leading-6">
                      Social Raven makes scheduling, collaboration, and reporting clear enough for small
                      teams and strong enough for growing ones — without the bloat.
                    </p>
                    <div>
                      <PublicPrimaryLinkButton href="/sign-up">Start for free</PublicPrimaryLinkButton>
                    </div>
                  </div>

                  <PublicInsetCard className="overflow-hidden p-0">
                    {CAPABILITIES.map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="flex items-start gap-3 border-b border-[var(--ds-gray-400)] px-4 py-4 last:border-b-0"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-blue-600)]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-label-14 text-[var(--ds-gray-1000)]">{label}</p>
                          <p className="text-label-12 text-[var(--ds-gray-900)]">{value}</p>
                        </div>
                      </div>
                    ))}
                  </PublicInsetCard>
                </div>
              </section>

              {/* Principles */}
              <section id="principles" className="space-y-5 px-7 py-8 md:px-8">
                <h2 className="text-heading-20 text-[var(--ds-gray-1000)]">The principles we build by</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {VALUES.map(({ icon: Icon, title, description }) => (
                    <PublicInsetCard key={title} className="h-full space-y-4 p-5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-blue-600)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">{title}</h3>
                        <p className="text-copy-13 text-[var(--ds-gray-900)]">{description}</p>
                      </div>
                    </PublicInsetCard>
                  ))}
                </div>
              </section>

              {/* Teams */}
              <section id="teams" className="space-y-5 px-7 py-8 md:px-8">
                <h2 className="text-heading-20 text-[var(--ds-gray-1000)]">One platform. Every team.</h2>
                <div className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] md:grid md:grid-cols-3 md:divide-x md:divide-[var(--ds-gray-400)]">
                  {PERSONAS.map(({ title, bullets }) => (
                    <div
                      key={title}
                      className="space-y-4 border-b border-[var(--ds-gray-400)] p-5 last:border-b-0 md:border-b-0"
                    >
                      <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">{title}</h3>
                      <ul className="space-y-2.5">
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
                    </div>
                  ))}
                </div>
              </section>

              {/* CTA row */}
              <section
                id="get-started"
                className="flex flex-wrap items-center justify-between gap-4 px-7 py-6 md:px-8"
              >
                <p className="text-heading-16 text-[var(--ds-gray-1000)]">Ready to get started?</p>
                <div className="flex flex-wrap gap-3">
                  <PublicPrimaryLinkButton href="/sign-up">Start free trial</PublicPrimaryLinkButton>
                  <PublicSubtleLinkButton href="/contact">Talk to us</PublicSubtleLinkButton>
                </div>
              </section>

            </div>
          </PublicCard>
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

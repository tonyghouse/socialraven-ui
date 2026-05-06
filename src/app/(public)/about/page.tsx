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
      "Plan a week of content faster, publish across channels in one workflow, and stay focused on making the work itself.",
    bullets: [
      "Multi-platform publishing in one step",
      "Clear calendar visibility",
      "Performance tracking that stays readable",
    ],
  },
  {
    title: "Agencies & Freelancers",
    description:
      "Run multiple client brands from one place without juggling tabs, login handoffs, or scattered review steps.",
    bullets: [
      "Workspace-based client separation",
      "Review flows for internal and client sign-off",
      "Scheduling built for repeatable delivery",
    ],
  },
  {
    title: "Brands & Businesses",
    description:
      "Keep planning, approvals, publishing, and reporting aligned even when a small team is handling a growing social presence.",
    bullets: [
      "A more consistent publishing process",
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
        topSlot={
          <PublicBackLink href="/" />
        }
        title="Built for teams who take social media seriously."
        description="Social Raven is built by a team of developers focused on making planning, publishing, approvals, and reporting simpler for modern social teams."
      />

      <PublicSection>
        <div>
          <PublicCard className="overflow-hidden">
            <div className="divide-y divide-[var(--ds-gray-400)]">
              <section id="mission" className="space-y-6 px-7 py-8 md:px-8">
                <div className="space-y-1.5">
                  <p className="text-label-12 text-[var(--ds-gray-900)]">Our mission</p>
                  <h2 className="text-heading-24 text-[var(--ds-gray-1000)]">
                    Give serious teams a simpler way to run social.
                  </h2>
                </div>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-start">
                  <div className="space-y-5">
                    <p className="text-copy-14 text-[var(--ds-gray-900)] md:text-[1rem] md:leading-6">
                      Social teams should not need bloated software or messy workarounds just to stay
                      consistent across platforms.
                    </p>
                    <p className="text-copy-14 text-[var(--ds-gray-900)] md:text-[1rem] md:leading-6">
                      We are building Social Raven to make scheduling, collaboration, and reporting clear
                      enough for small teams and strong enough for growing ones.
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
                        <div className="space-y-1">
                          <p className="text-label-14 text-[var(--ds-gray-1000)]">{label}</p>
                          <p className="text-label-12 text-[var(--ds-gray-900)]">{value}</p>
                        </div>
                      </div>
                    ))}
                  </PublicInsetCard>
                </div>
              </section>

              <section id="principles" className="space-y-6 px-7 py-8 md:px-8">
                <div className="space-y-1.5">
                  <p className="text-label-12 text-[var(--ds-gray-900)]">What we stand for</p>
                  <h2 className="text-heading-24 text-[var(--ds-gray-1000)]">The principles we build by</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {VALUES.map(({ icon: Icon, title, description }) => (
                    <PublicInsetCard key={title} className="h-full space-y-4 p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-blue-600)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-2.5">
                        <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">{title}</h3>
                        <p className="text-copy-14 text-[var(--ds-gray-900)]">{description}</p>
                      </div>
                    </PublicInsetCard>
                  ))}
                </div>
              </section>

              <section id="teams" className="space-y-6 px-7 py-8 md:px-8">
                <div className="space-y-1.5">
                  <p className="text-label-12 text-[var(--ds-gray-900)]">Who we build for</p>
                  <h2 className="text-heading-24 text-[var(--ds-gray-1000)]">One platform. Every team.</h2>
                  <p className="text-copy-14 text-[var(--ds-gray-900)]">
                    Different teams run social in different ways. The platform is designed to stay clear
                    for solo operators, structured for client work, and dependable for in-house teams.
                  </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] md:grid md:grid-cols-3 md:divide-x md:divide-[var(--ds-gray-400)]">
                  {PERSONAS.map(({ title, description, bullets }) => (
                    <div
                      key={title}
                      className="space-y-4 border-b border-[var(--ds-gray-400)] p-5 last:border-b-0 md:border-b-0"
                    >
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
                    </div>
                  ))}
                </div>
              </section>

              <section id="get-started" className="px-7 py-8 text-center md:px-8">
                <div className="space-y-5">
                  <p className="text-label-12 text-[var(--ds-gray-900)]">Get started</p>
                  <h2 className="text-heading-24 text-[var(--ds-gray-1000)]">Ready to take back your time?</h2>
                  <p className="text-copy-14 text-[var(--ds-gray-900)] md:text-[1rem] md:leading-6">
                    Start with a trial workspace and see whether Social Raven fits the way your team plans
                    and publishes content.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <PublicPrimaryLinkButton href="/sign-up">Start free trial</PublicPrimaryLinkButton>
                    <PublicSubtleLinkButton href="/contact">Talk to us</PublicSubtleLinkButton>
                  </div>
                </div>
              </section>
            </div>
          </PublicCard>
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  Zap,
  Users,
  Shield,
  PenTool,
  BarChart,
  Clock,
} from "lucide-react";

import {
  PublicLozenge,
  PublicPrimaryLinkButton,
} from "@/components/public/public-atlassian";
import {
  PublicCard,
  PublicHero,
  PublicInsetCard,
  PublicPageShell,
  PublicSection,
} from "@/components/public/public-layout";

export const metadata: Metadata = {
  title: "Blog | Social Raven",
  description:
    "Insights on social media strategy, scheduling, and growth from the Social Raven team.",
};

const CATEGORIES = [
  {
    icon: TrendingUp,
    title: "Publishing Workflows",
    description:
      "Practical ways to plan campaigns, manage calendars, and keep recurring publishing work organized.",
  },
  {
    icon: Zap,
    title: "Automation & Scheduling",
    description:
      "Batch content, prepare approvals, and keep scheduled publishing running smoothly.",
  },
  {
    icon: BarChart,
    title: "Analytics & Reporting",
    description:
      "Understand your numbers. Learn which posts work, when to post, and why.",
  },
  {
    icon: Users,
    title: "Agency Playbooks",
    description:
      "Tools, templates, and frameworks for agencies managing multiple client accounts.",
  },
  {
    icon: PenTool,
    title: "Content Operations",
    description:
      "Caption review, asset handoff, and repeatable campaign processes for content teams.",
    },
  {
    icon: Shield,
    title: "Compliance & Privacy",
    description:
      "Staying GDPR and CCPA-compliant as regulations and platform policies continue to evolve.",
  },
];

const COMING_SOON = [
  {
    category: "Publishing Workflows",
    title: "How to Plan a Month of Content Without Losing Track of Reviews",
    excerpt:
      "A practical operating rhythm for planning, reviewing, and scheduling recurring content without spreadsheet chaos.",
    readTime: "7 min read",
  },
  {
    category: "Automation & Scheduling",
    title: "How to Batch-Create a Month of Content in One Afternoon",
    excerpt:
      "A step-by-step workflow for planning, creating, and scheduling 30 days of cross-platform content in a single focused session.",
    readTime: "5 min read",
  },
  {
    category: "Agency Playbooks",
    title: "Managing Multiple Brand Workspaces Without Losing Context",
    excerpt:
      "The naming, review, and handoff patterns that help agencies stay organized across client workspaces.",
    readTime: "8 min read",
  },
];

export default function BlogPage() {
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
        eyebrow="Blog"
        title="Insights for modern social media teams."
        description="Strategy, tools, and tactics for creators, agencies, and brands who take social seriously. First articles dropping soon — get notified when we publish."
        actions={
          <PublicPrimaryLinkButton href="mailto:team+blog@socialraven.io?subject=Blog%20Notifications">
            Notify me when we publish
          </PublicPrimaryLinkButton>
        }
      />

      <PublicSection eyebrow="Coming soon" title="First articles in the works">
        <div className="grid gap-5 md:grid-cols-3">
          {COMING_SOON.map(({ category, title, excerpt, readTime }) => (
            <PublicCard key={title} className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <PublicLozenge appearance="inprogress">{category}</PublicLozenge>
                <div className="flex items-center gap-1 text-xs leading-4 text-[hsl(var(--foreground-muted))]">
                  <Clock className="h-3 w-3" />
                  {readTime}
                </div>
              </div>
              <h3 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">{title}</h3>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">{excerpt}</p>
              <PublicLozenge appearance="default">Publishing soon</PublicLozenge>
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection eyebrow="Topics" title="What we&apos;ll cover" surface="surface">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ icon: Icon, title, description }) => (
            <PublicInsetCard key={title} className="space-y-3 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--accent))]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">{title}</h3>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">{description}</p>
            </PublicInsetCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection>
        <PublicCard className="px-8 py-10 text-center md:px-14 md:py-14">
          <div className="mx-auto max-w-2xl space-y-5">
            <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
              Stay in the loop
            </p>
            <h2 className="text-[1.5rem] leading-7 font-bold tracking-[-0.02em] text-[hsl(var(--foreground))]">
              Be the first to read our articles.
            </h2>
            <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
              Drop us an email and we&apos;ll notify you as soon as the first posts go live. No spam, unsubscribe any time.
            </p>
            <div className="flex justify-center">
              <PublicPrimaryLinkButton href="mailto:team+blog@socialraven.io?subject=Blog%20Notifications">
                Get notified
              </PublicPrimaryLinkButton>
            </div>
          </div>
        </PublicCard>
      </PublicSection>
    </PublicPageShell>
  );
}

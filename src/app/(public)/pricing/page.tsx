import type { Metadata } from "next";
import Link from "next/link";

import {
  PublicPrimaryLinkButton,
  PublicSubtleLinkButton,
} from "@/components/public/public-atlassian";
import { PricingGrid } from "@/components/public/pricing-grid";
import {
  PublicCard,
  PublicHero,
  PublicInsetCard,
  PublicPageShell,
  PublicSection,
} from "@/components/public/public-layout";

export const metadata: Metadata = {
  title: "Pricing | Social Raven",
  description:
    "Simple Social Raven pricing for creators, brands, and agencies. Compare plans, trial details, and current billing status.",
};

const INCLUDED_WITH_EVERY_PLAN = [
  "14-day free trial on standard self-serve plans",
  "Multi-platform publishing for image, video, and text posts",
  "Secure account connections and workspace-based access",
  "Centralized analytics and post history",
];

const BILLING_NOTES = [
  {
    title: "Currency and taxes",
    description:
      "All listed prices are in USD. If paid self-serve checkout is enabled, applicable taxes, VAT, or sales tax will be shown in the billing flow where required.",
  },
  {
    title: "Current billing status",
    description:
      "Public plan pricing is live on this page. Trial signup is available now, while paid self-serve billing is still being finalized.",
  },
  {
    title: "Payments and invoices",
    description:
      "Once paid billing is enabled, payments will be processed by Paddle and invoice or subscription records will be handled through that billing flow.",
  },
  {
    title: "Refunds",
    description:
      "Our refund policy describes how paid subscription charges will be handled once paid billing is enabled, alongside any mandatory consumer rights that apply in your jurisdiction.",
  },
];

export default function PricingPage() {
  return (
    <PublicPageShell>
      <PublicHero
        topSlot={
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium leading-5 text-[hsl(var(--foreground-muted))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            ← Back
          </Link>
        }
        eyebrow="Pricing"
        title="Clear pricing for creators, teams, and agencies."
        meta={
          <>
            Last updated: <span className="font-medium text-[hsl(var(--foreground))]">April 5, 2026</span>
          </>
        }
        description="Choose a plan based on how many brands, accounts, and campaigns you need to manage. Trial signup is available now; paid self-serve billing is still being finalized."
        actions={
          <>
            <PublicPrimaryLinkButton href="/sign-up">Create trial workspace</PublicPrimaryLinkButton>
            <PublicSubtleLinkButton href="/refund-policy">View refund policy</PublicSubtleLinkButton>
          </>
        }
        aside={
          <PublicCard className="space-y-4 p-6">
            <div>
              <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                Pricing summary
              </p>
              <h2 className="mt-2 text-[1.5rem] leading-7 font-bold tracking-[-0.02em] text-[hsl(var(--foreground))]">
                Public pricing is live. Paid self-serve billing is not yet enabled.
              </h2>
            </div>
            <div className="grid gap-3">
              {[
                "USD pricing",
                "Trial signup available now",
                "Paid self-serve billing in progress",
                "Agency custom plans by email enquiry",
              ].map((item) => (
                <PublicInsetCard key={item} className="px-4 py-3 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                  {item}
                </PublicInsetCard>
              ))}
            </div>
          </PublicCard>
        }
      />

      <PublicSection
        eyebrow="Included"
        title="What every paid workspace gets"
        description="Core publishing and collaboration workflows are available across the standard plan lineup."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {INCLUDED_WITH_EVERY_PLAN.map((item) => (
            <PublicInsetCard key={item} className="px-5 py-4 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
              {item}
            </PublicInsetCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        eyebrow="Plans"
        title="Current public plan pricing"
        description="These are the self-serve and agency plan prices currently offered by SocialRaven."
      >
        <div className="rounded-xl border border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/8 px-5 py-4 text-[hsl(var(--foreground))]">
          <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">
            14-day free trial available on standard plans
          </p>
          <p className="mt-1 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
            Trial signup is available now. Paid self-serve checkout will be enabled after billing setup is complete. Custom agency plans start with a direct enquiry.
          </p>
        </div>

        <div className="mt-6">
          <PricingGrid />
        </div>
      </PublicSection>

      <PublicSection
        eyebrow="Billing notes"
        title="Billing status and launch notes"
        description="Important pricing, billing, and refund details based on the current public setup."
        surface="surface"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {BILLING_NOTES.map((note) => (
            <PublicCard key={note.title} className="space-y-3 p-6">
              <h3 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">{note.title}</h3>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">{note.description}</p>
            </PublicCard>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <PublicSubtleLinkButton href="/terms-of-service">Terms of service</PublicSubtleLinkButton>
          <PublicSubtleLinkButton href="/refund-policy">Refund policy</PublicSubtleLinkButton>
          <PublicSubtleLinkButton href="/contact">Talk to sales</PublicSubtleLinkButton>
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

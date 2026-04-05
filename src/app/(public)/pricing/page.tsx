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
    "Simple Social Raven pricing for creators, brands, and agencies. Compare plans, trial details, billing notes, and checkout information.",
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
      "All listed prices are in USD. Taxes, VAT, or sales tax are calculated at checkout where required.",
  },
  {
    title: "Billing cadence",
    description:
      "Paid subscriptions renew automatically until cancelled. You retain access through the end of the current billing period after cancellation.",
  },
  {
    title: "Payments and invoices",
    description:
      "Payments are processed securely by Paddle. VAT-compliant invoices and subscription billing records are delivered through the billing flow once live.",
  },
  {
    title: "Refunds",
    description:
      "Refund requests are handled according to our refund policy and any mandatory consumer rights that apply in your jurisdiction.",
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
        description="Choose a plan based on how many brands, accounts, and campaigns you need to manage. Start with a trial, then move to a paid plan when you are ready."
        actions={
          <>
            <PublicPrimaryLinkButton href="/sign-up">Start free trial</PublicPrimaryLinkButton>
            <PublicSubtleLinkButton href="/refund-policy">View refund policy</PublicSubtleLinkButton>
          </>
        }
        aside={
          <PublicCard className="space-y-4 p-6">
            <div>
              <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                Billing summary
              </p>
              <h2 className="mt-2 text-[1.5rem] leading-7 font-bold tracking-[-0.02em] text-[hsl(var(--foreground))]">
                Simple checkout, no hidden tiers.
              </h2>
            </div>
            <div className="grid gap-3">
              {[
                "USD pricing",
                "Secure checkout by Paddle",
                "Cancel future renewals anytime",
                "Agency custom plans by quote",
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
            Start free and upgrade when you are ready. Custom agency plans are quoted separately.
          </p>
        </div>

        <div className="mt-6">
          <PricingGrid />
        </div>
      </PublicSection>

      <PublicSection
        eyebrow="Billing notes"
        title="What to expect at checkout"
        description="Important pricing, billing, and refund details for paid subscriptions."
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

import type { Metadata } from "next";

import {
  PublicBackLink,
  PublicPrimaryLinkButton,
} from "@/components/public/public-site-primitives";
import { PricingGrid } from "@/components/public/pricing-grid";
import { PricingFaq } from "@/components/public/pricing-faq";
import { PublicHero, PublicPageShell } from "@/components/public/public-layout";

export const metadata: Metadata = {
  title: "Pricing | Social Raven",
  description: "Simple, transparent pricing for creators and agencies. 14-day free trial, no credit card required.",
};

export default function PricingPage() {
  return (
    <PublicPageShell>
      <PublicHero
        topSlot={<PublicBackLink href="/" />}
        title="Pricing"
        description="14-day trial · Cancel anytime · USD"
        actions={
          <PublicPrimaryLinkButton href="/sign-up">Start free trial</PublicPrimaryLinkButton>
        }
      />

      <section className="border-b border-[var(--ds-gray-400)]">
        <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8">
          <PricingGrid />
        </div>
      </section>

      <section className="border-b border-[var(--ds-gray-400)]">
        <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8">
          <PricingFaq />
        </div>
      </section>
    </PublicPageShell>
  );
}

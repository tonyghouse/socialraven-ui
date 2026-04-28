import type { Metadata } from "next";

import { PublicPrimaryLinkButton } from "@/components/public/public-site-primitives";
import { PricingGrid } from "@/components/public/pricing-grid";
import { PricingFaq } from "@/components/public/pricing-faq";
import { PublicPageShell } from "@/components/public/public-layout";

export const metadata: Metadata = {
  title: "Pricing | Social Raven",
  description: "Simple, transparent pricing for creators and agencies. 14-day free trial, no credit card required.",
};

export default function PricingPage() {
  return (
    <PublicPageShell>
      <section className="border-b border-[var(--ds-gray-400)]">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-heading-24 text-[var(--ds-gray-1000)]">Pricing</h1>
              <p className="mt-1 text-label-14 text-[var(--ds-gray-900)]">
                14-day trial · Cancel anytime · USD
              </p>
            </div>
            <PublicPrimaryLinkButton href="/sign-up">Start free trial</PublicPrimaryLinkButton>
          </div>
        </div>
      </section>

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

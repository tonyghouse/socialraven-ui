import type { Metadata } from "next";
import Link from "next/link";

import {
  PublicCard,
  PublicHero,
  PublicInsetCard,
  PublicPageShell,
  PublicSection,
  PublicToc,
} from "@/components/public/public-layout";

export const metadata: Metadata = {
  title: "Refund Policy | Social Raven",
  description:
    "Refund Policy for Social Raven subscriptions, including the 14-day cancellation and refund window, renewal terms, and support contact details.",
};

const TOC = [
  { id: "overview", label: "1. Overview" },
  { id: "trials", label: "2. Free Trials" },
  { id: "renewals", label: "3. Renewals & Cancellations" },
  { id: "eligible", label: "4. Refund Eligibility" },
  { id: "non-refundable", label: "5. Non-Refundable Cases" },
  { id: "consumer-rights", label: "6. Consumer Rights" },
  { id: "requests", label: "7. How To Request a Refund" },
  { id: "timing", label: "8. Timing and Processing" },
];

export default function RefundPolicyPage() {
  return (
    <PublicPageShell>
      <PublicHero
        topSlot={
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-label-14 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]"
          >
            ← Back
          </Link>
        }
        eyebrow="Legal"
        title="Refund Policy"
        meta={
          <>
            Last updated: <span className="font-medium text-[var(--ds-gray-1000)]">April 7, 2026</span>
          </>
        }
        description="This Refund Policy explains how SocialRaven will handle subscription cancellations, renewal charges, and the minimum 14-day refund window once paid billing is enabled."
      />

      <PublicSection>
        <div className="items-start lg:grid lg:grid-cols-[13.75rem_1fr] lg:gap-14">
          <PublicToc items={TOC} />

          <div className="min-w-0 space-y-10">
            <PublicCard id="overview" className="space-y-4 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">1. Overview</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                This policy applies to paid SocialRaven subscriptions once public paid billing is enabled
                and purchases are processed through our checkout flow. SocialRaven is operated by Kammullu
                Ghouse, a sole proprietor trading as Social Raven.
              </p>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                SocialRaven will offer a minimum 14-day cancellation and refund window for paid
                subscription charges processed through Paddle. If you request a refund within 14 calendar
                days of a paid charge, you do not need to give a reason.
              </p>
            </PublicCard>

            <PublicCard id="trials" className="space-y-4 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">2. Free Trials</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Eligible plans may include a free trial. Trial signup is currently offered without payment
                details in the public self-serve flow.
              </p>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                If paid billing is enabled later, any trial-to-paid transition terms will be shown clearly
                before a charge is taken. If a charge is taken contrary to the published trial terms,
                contact us and we will investigate it as a priority refund case.
              </p>
            </PublicCard>

            <PublicCard id="renewals" className="space-y-4 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">
                3. Renewals &amp; Cancellations
              </h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Once paid subscriptions are enabled, they renew automatically on the billing cycle selected
                at checkout unless you cancel before the renewal date.
              </p>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                You may cancel a paid subscription at any time to stop future renewals. If you cancel
                without requesting a refund, access remains active until the end of the current paid
                period unless we state otherwise in writing.
              </p>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                If you request a refund within 14 calendar days of an initial paid subscription charge or
                a renewal charge, we will treat that request as a cancellation of the relevant paid period
                and issue a refund to the original payment method.
              </p>
            </PublicCard>

            <PublicCard id="eligible" className="space-y-5 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">4. Refund Eligibility</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Refunds are generally considered in the following situations:
              </p>
              <div className="grid gap-3">
                {[
                  "You request cancellation and a refund within 14 calendar days of an initial paid subscription charge or renewal charge, without needing to give a reason.",
                  "You were charged more than once for the same billing period.",
                  "You were charged after a valid cancellation or during an active trial.",
                  "A technical billing error or platform fault prevented initial access to the paid service.",
                  "A refund is required under applicable consumer protection law.",
                ].map((item) => (
                  <PublicInsetCard key={item} className="px-4 py-3 text-copy-14 text-[var(--ds-gray-900)]">
                    {item}
                  </PublicInsetCard>
                ))}
              </div>
            </PublicCard>

            <PublicCard id="non-refundable" className="space-y-5 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">5. Non-Refundable Cases</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                After the 14-day refund window has passed, refunds are generally not provided for the
                following paid billing cases unless required by law:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-copy-14 text-[var(--ds-gray-900)]">
                <li>Unused time remaining in a monthly or annual billing period after the 14-day refund window;</li>
                <li>Failure to cancel before the next renewal date;</li>
                <li>Account suspension or termination due to Terms of Service violations.</li>
              </ul>
            </PublicCard>

            <PublicCard id="consumer-rights" className="space-y-4 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">6. Consumer Rights</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Nothing in this policy limits any non-waivable rights you may have under local consumer
                law, including statutory withdrawal or cooling-off rights where they apply.
              </p>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                If local law or Paddle&apos;s buyer-facing refund rules give you a stronger refund
                entitlement than this policy, we will honor the higher standard.
              </p>
            </PublicCard>

            <PublicCard id="requests" className="space-y-4 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">
                7. How To Request a Refund
              </h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                To request a refund, email{" "}
                <a
                  href="mailto:team+support@socialraven.io"
                  className="text-[var(--ds-blue-600)] underline underline-offset-2"
                >
                  team+support@socialraven.io
                </a>{" "}
                with your account email, billing date, amount charged, and a short explanation of the
                issue.
              </p>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Once Paddle billing is live, you may also use the Paddle receipt or subscription management
                link to request cancellation or a refund. To use the standard 14-day refund window, submit
                the request within 14 calendar days of the charge.
              </p>
            </PublicCard>

            <PublicCard id="timing" className="space-y-4 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">
                8. Timing and Processing
              </h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                We aim to review refund requests within 5 business days. Once paid billing is enabled, any
                approved refunds will be issued back to the original payment method through Paddle.
              </p>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Once approved, refunds are generally processed within 14 days. The time it takes for funds
                to appear depends on your bank, card issuer, or payment method provider.
              </p>
            </PublicCard>
          </div>
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

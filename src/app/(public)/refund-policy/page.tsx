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
    "Refund Policy for Social Raven subscriptions, including trial cancellations, renewal charges, refund eligibility, and support contact details.",
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
            className="inline-flex items-center gap-1 text-sm font-medium leading-5 text-[hsl(var(--foreground-muted))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            ← Back
          </Link>
        }
        eyebrow="Legal"
        title="Refund Policy"
        meta={
          <>
            Last updated: <span className="font-medium text-[hsl(var(--foreground))]">April 5, 2026</span>
          </>
        }
        description="This Refund Policy explains how SocialRaven handles subscription cancellations, renewal charges, and refund requests for purchases processed through Paddle."
      />

      <PublicSection>
        <div className="items-start lg:grid lg:grid-cols-[220px_1fr] lg:gap-14">
          <PublicToc items={TOC} />

          <div className="min-w-0 space-y-10">
            <PublicCard id="overview" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">1. Overview</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                This policy applies to paid SocialRaven subscriptions purchased through our checkout flow.
                Payments are processed securely by Paddle.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                We aim to be clear and fair: if we charged you incorrectly or a billing issue prevented
                you from using the service as purchased, we will review the case promptly.
              </p>
            </PublicCard>

            <PublicCard id="trials" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">2. Free Trials</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Eligible plans may include a free trial. If you cancel before the trial ends, you will not
                be charged for the next billing period.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                If a charge is taken during an active trial because of a billing error, contact us and we
                will investigate it as a priority refund case.
              </p>
            </PublicCard>

            <PublicCard id="renewals" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">
                3. Renewals &amp; Cancellations
              </h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Paid subscriptions renew automatically on the billing cycle you selected at checkout unless
                you cancel before the renewal date.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Cancelling a subscription stops future renewals. Your access remains active until the end
                of the current paid period unless we state otherwise in writing.
              </p>
            </PublicCard>

            <PublicCard id="eligible" className="space-y-5 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">4. Refund Eligibility</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Refunds are generally considered in the following situations:
              </p>
              <div className="grid gap-3">
                {[
                  "You were charged more than once for the same billing period.",
                  "You were charged after a valid cancellation or during an active trial.",
                  "A technical billing error or platform fault prevented initial access to the paid service.",
                  "A refund is required under applicable consumer protection law.",
                ].map((item) => (
                  <PublicInsetCard key={item} className="px-4 py-3 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                    {item}
                  </PublicInsetCard>
                ))}
              </div>
            </PublicCard>

            <PublicCard id="non-refundable" className="space-y-5 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">5. Non-Refundable Cases</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Unless required by law, refunds are generally not provided for:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <li>Change-of-mind cancellations after a renewal charge has already been processed;</li>
                <li>Unused time remaining in a monthly or annual billing period;</li>
                <li>Failure to cancel before the next renewal date;</li>
                <li>Account suspension or termination due to Terms of Service violations.</li>
              </ul>
            </PublicCard>

            <PublicCard id="consumer-rights" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">6. Consumer Rights</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Nothing in this policy limits any non-waivable rights you may have under local consumer
                law, including statutory withdrawal or cooling-off rights where they apply.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                If local law gives you a stronger refund entitlement than this policy, we will honor the
                legal requirement.
              </p>
            </PublicCard>

            <PublicCard id="requests" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">
                7. How To Request a Refund
              </h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                To request a refund, email{" "}
                <a
                  href="mailto:team+support@socialraven.io"
                  className="text-[hsl(var(--accent))] underline underline-offset-2"
                >
                  team+support@socialraven.io
                </a>{" "}
                with your account email, billing date, amount charged, and a short explanation of the
                issue.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Sending the request within 14 days of the charge helps us resolve it faster, but we will
                still review requests submitted later where appropriate.
              </p>
            </PublicCard>

            <PublicCard id="timing" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">
                8. Timing and Processing
              </h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                We aim to review refund requests within 5 business days. If approved, refunds are issued
                back to the original payment method through Paddle.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Once processed, the time it takes for funds to appear depends on your bank, card issuer,
                or payment method provider.
              </p>
            </PublicCard>
          </div>
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

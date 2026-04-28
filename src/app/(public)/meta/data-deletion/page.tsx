import Link from "next/link";

import { PublicCard, PublicHero, PublicPageShell, PublicSection } from "@/components/public/public-layout";

export default function MetaDataDeletionPage() {
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
        eyebrow="Meta Compliance"
        title="Meta Data Deletion"
        description="This page confirms how Social Raven handles Meta-originated data deletion requests."
        meta="Requests are reviewed and processed under our privacy policy and account deletion rules."
      />

      <PublicSection>
        <div className="mx-auto max-w-3xl">
          <PublicCard className="space-y-4 p-8">
            <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">What happens next</h2>
            <p className="text-copy-14 text-[var(--ds-gray-900)]">
              If Meta sent us a deletion request for your Social Raven connection, we will review the
              request and remove the associated Social Raven data in line with our retention and legal
              obligations.
            </p>
            <p className="text-copy-14 text-[var(--ds-gray-900)]">
              This typically includes OAuth credentials and related Social Raven account linkage for the
              affected integration. If we need more information to identify the correct records, we may
              contact you using the account details we have on file.
            </p>
            <p className="text-copy-14 text-[var(--ds-gray-900)]">
              For direct privacy requests, email{" "}
              <a
                href="mailto:team+privacy@socialraven.io"
                className="text-[var(--ds-blue-600)] underline underline-offset-2"
              >
                team+privacy@socialraven.io
              </a>{" "}
              with the subject line <em>&quot;Data Deletion Request&quot;</em>.
            </p>
            <p className="text-copy-14 text-[var(--ds-gray-900)]">
              You can also review our full policy at{" "}
              <Link
                href="/privacy-policy"
                className="text-[var(--ds-blue-600)] underline underline-offset-2"
              >
                /privacy-policy
              </Link>
              .
            </p>
          </PublicCard>
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

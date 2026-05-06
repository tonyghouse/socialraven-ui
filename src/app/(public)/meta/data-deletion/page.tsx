import {
  PublicBackLink,
  PublicPrimaryLinkButton,
  PublicSubtleLinkButton,
} from "@/components/public/public-site-primitives";
import { PublicCard, PublicHero, PublicPageShell, PublicSection } from "@/components/public/public-layout";

export default function MetaDataDeletionPage() {
  return (
    <PublicPageShell>
      <PublicHero
        topSlot={
          <PublicBackLink href="/" />
        }
        title="Meta data deletion"
        description="How Social Raven handles deletion requests related to Meta-connected accounts."
      />

      <PublicSection>
        <PublicCard className="p-8 md:p-10">
          <div className="space-y-8">
            <div className="max-w-4xl space-y-3">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">What happens next</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                If Meta sends us a deletion request, we review the affected connection and remove the
                related Social Raven data in line with our retention and legal obligations.
              </p>
            </div>

            <div className="grid gap-5 border-t border-[var(--ds-gray-400)] pt-6 md:grid-cols-3">
              <div className="space-y-1.5">
                <h3 className="text-label-14 text-[var(--ds-gray-1000)]">Review the request</h3>
                <p className="text-copy-14 text-[var(--ds-gray-900)]">
                  We verify which Meta connection and Social Raven records are affected.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-label-14 text-[var(--ds-gray-1000)]">Remove related data</h3>
                <p className="text-copy-14 text-[var(--ds-gray-900)]">
                  This usually includes OAuth credentials and the account linkage for the affected
                  integration.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-label-14 text-[var(--ds-gray-1000)]">Follow up if needed</h3>
                <p className="text-copy-14 text-[var(--ds-gray-900)]">
                  If we need more information to identify the right records, we contact you using the
                  details on file.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-[var(--ds-gray-400)] pt-6 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-2xl text-copy-14 text-[var(--ds-gray-900)]">
                For direct privacy requests, email the privacy team with the subject line
                {" "}
                <em>&quot;Data Deletion Request&quot;</em>
                . You can also review our full privacy policy.
              </p>
              <div className="flex flex-wrap gap-3">
                <PublicPrimaryLinkButton href="mailto:team+privacy@socialraven.io?subject=Data%20Deletion%20Request">
                  Email privacy team
                </PublicPrimaryLinkButton>
                <PublicSubtleLinkButton href="/privacy-policy">
                  Privacy policy
                </PublicSubtleLinkButton>
              </div>
            </div>
          </div>
        </PublicCard>
      </PublicSection>
    </PublicPageShell>
  );
}

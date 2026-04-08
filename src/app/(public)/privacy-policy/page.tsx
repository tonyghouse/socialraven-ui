import type { Metadata } from "next";
import Link from "next/link";

import { PublicPrimaryLinkButton } from "@/components/public/public-site-primitives";
import {
  PublicCard,
  PublicHero,
  PublicInsetCard,
  PublicPageShell,
  PublicSection,
  PublicTable,
  PublicToc,
} from "@/components/public/public-layout";

export const metadata: Metadata = {
  title: "Privacy Policy | Social Raven",
  description:
    "Privacy Policy for Social Raven – how we collect, use, store, and protect your information under GDPR, CCPA, and applicable law.",
};

const TOC = [
  { id: "data-controller", label: "1. Data Controller" },
  { id: "information-collected", label: "2. Information We Collect" },
  { id: "legal-basis", label: "3. Legal Basis (GDPR)" },
  { id: "how-we-use", label: "4. How We Use Your Data" },
  { id: "data-sharing", label: "5. Data Sharing" },
  { id: "international-transfers", label: "6. International Transfers" },
  { id: "data-storage", label: "7. Data Storage & Security" },
  { id: "data-retention", label: "8. Data Retention" },
  { id: "your-rights", label: "9. Your Privacy Rights" },
  { id: "data-deletion", label: "10. Data Deletion" },
  { id: "children", label: "11. Children's Privacy" },
  { id: "updates", label: "12. Policy Updates" },
  { id: "contact", label: "13. Contact Us" },
];

export default function PrivacyPolicyPage() {
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
        title="Privacy Policy"
        meta={
          <>
            Last updated: <span className="font-medium text-[var(--ds-gray-1000)]">February 2026</span>
          </>
        }
        description='Social Raven ("we", "our", "us") is committed to protecting your personal data in compliance with the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable privacy laws. This Policy explains what data we collect, why we collect it, how we protect it, and what rights you have.'
      />

      <PublicSection>
        <div className="items-start lg:grid lg:grid-cols-[220px_1fr] lg:gap-14">
          <PublicToc items={TOC} />

          <div className="min-w-0 space-y-10">
            <PublicCard id="data-controller" className="space-y-4 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">1. Data Controller</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                The data controller responsible for your personal data is:
              </p>
              <PublicInsetCard className="space-y-1 p-4 text-copy-14 text-[var(--ds-gray-900)]">
                <p className="font-bold text-[var(--ds-gray-1000)]">Kammullu Ghouse</p>
                <p>Business form: Sole proprietor</p>
                <p>Trading name: Social Raven</p>
                <p>Country: India</p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:team+privacy@socialraven.io"
                    className="text-[var(--ds-blue-600)] underline underline-offset-2"
                  >
                    team+privacy@socialraven.io
                  </a>
                </p>
                <p>Website: socialraven.io</p>
              </PublicInsetCard>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                For EU residents, if you have questions about how we process your data or wish to exercise
                your rights, contact us at the address above.
              </p>
            </PublicCard>

            <PublicCard id="information-collected" className="space-y-5 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">2. Information We Collect</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                We collect only the minimum data required to deliver, secure, and improve our service.
              </p>

              <PublicInsetCard className="space-y-3 p-4 text-copy-14 text-[var(--ds-gray-900)]">
                <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">2.1 Account Information</h3>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Full name and email address (provided during registration)</li>
                  <li>Authentication identifiers managed by Clerk</li>
                  <li>Subscription and billing status (if applicable)</li>
                </ul>
              </PublicInsetCard>

              <PublicInsetCard className="space-y-3 p-4 text-copy-14 text-[var(--ds-gray-900)]">
                <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">2.2 Connected Social Media Accounts</h3>
                <p>
                  When you connect a social account (Instagram, Facebook, YouTube, LinkedIn, X/Twitter), we
                  store:
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>OAuth access tokens and refresh tokens</li>
                  <li>Platform-assigned user IDs and display names</li>
                  <li>Page/channel IDs for Business accounts</li>
                </ul>
                <p>
                  These tokens are used exclusively to publish posts, retrieve analytics, and manage
                  scheduled content on your behalf. We never access private messages, followers&apos; data,
                  or any information outside explicitly granted OAuth scopes.
                </p>
              </PublicInsetCard>

              <PublicInsetCard className="space-y-3 p-4 text-copy-14 text-[var(--ds-gray-900)]">
                <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">2.3 Content You Create</h3>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Post drafts, captions, hashtags, and scheduling metadata</li>
                  <li>Images and videos uploaded for scheduling (stored temporarily on our servers and/or AWS S3)</li>
                </ul>
              </PublicInsetCard>

              <PublicInsetCard className="space-y-3 p-4 text-copy-14 text-[var(--ds-gray-900)]">
                <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">2.4 Usage and Technical Data</h3>
                <ul className="ml-5 list-disc space-y-1">
                  <li>IP address, browser type, device type, and operating system</li>
                  <li>Pages visited, features used, and session duration</li>
                  <li>Error logs and performance diagnostics</li>
                </ul>
              </PublicInsetCard>

              <PublicInsetCard className="space-y-3 p-4 text-copy-14 text-[var(--ds-gray-900)]">
                <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">2.5 Cookies &amp; Tracking</h3>
                <p>
                  We use strictly necessary cookies for session management and authentication. We may also
                  use analytics cookies (e.g., anonymised analytics) to understand how users interact with
                  the platform. You may disable non-essential cookies in your browser settings; this will
                  not affect core functionality.
                </p>
              </PublicInsetCard>
            </PublicCard>

            <PublicCard id="legal-basis" className="space-y-5 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">
                3. Legal Basis for Processing (GDPR – EU/EEA Users)
              </h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Under the GDPR, we process your personal data on the following legal bases:
              </p>
              <PublicTable
                headers={["Purpose", "Legal Basis (Art. 6 GDPR)"]}
                rows={[
                  ["Providing and operating the service", "Performance of a contract (Art. 6(1)(b))"],
                  ["Account creation and authentication", "Performance of a contract (Art. 6(1)(b))"],
                  ["Security and fraud prevention", "Legitimate interests (Art. 6(1)(f))"],
                  ["Analytics and service improvement", "Legitimate interests (Art. 6(1)(f))"],
                  ["Marketing communications (where applicable)", "Consent (Art. 6(1)(a))"],
                  ["Compliance with legal obligations", "Legal obligation (Art. 6(1)(c))"],
                ]}
              />
            </PublicCard>

            <PublicCard id="how-we-use" className="space-y-5 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">4. How We Use Your Information</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                We use your data solely for the following purposes:
              </p>
              <ul className="ml-5 list-disc space-y-1 text-copy-14 text-[var(--ds-gray-900)]">
                <li>Authenticating your identity and maintaining your account</li>
                <li>Scheduling, queuing, and auto-publishing posts to connected platforms</li>
                <li>Storing content drafts and post history</li>
                <li>Retrieving analytics and performance data from connected accounts</li>
                <li>Providing customer support</li>
                <li>Detecting, preventing, and investigating abuse, fraud, or policy violations</li>
                <li>Ensuring the security and integrity of our platform</li>
                <li>Complying with legal obligations</li>
              </ul>
              <PublicInsetCard className="overflow-hidden border-[var(--ds-red-200)] bg-[var(--ds-red-100)]">
                <div className="border-b border-[var(--ds-red-200)] bg-[var(--ds-red-100)] px-4 py-3">
                  <h3 className="text-label-14 text-[var(--ds-red-700)]">
                    We will never
                  </h3>
                </div>
                <ul className="ml-5 list-disc space-y-2 px-4 py-4 text-copy-14 text-[var(--ds-red-1000)] marker:text-[var(--ds-red-600)]">
                  <li>Sell, rent, or trade your personal data to third parties</li>
                  <li>Share your data for advertising or profiling purposes</li>
                  <li>Use your content for AI training without explicit consent</li>
                  <li>Monetize your profile or social media presence</li>
                </ul>
              </PublicInsetCard>
            </PublicCard>

            <PublicCard id="data-sharing" className="space-y-5 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">5. Data Sharing &amp; Third-Party Services</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                We share data only with trusted sub-processors necessary to operate our service:
              </p>
              <PublicTable
                headers={["Service", "Purpose", "Data Shared"]}
                rows={[
                  ["Clerk", "Authentication & user management", "Name, email, auth identifiers"],
                  ["Paddle", "Payment processing and billing administration if paid billing is enabled", "Billing contact details, subscription metadata, transaction details"],
                  ["Amazon Web Services (AWS S3)", "Media file storage", "Uploaded images/videos"],
                  ["Meta (Instagram, Facebook)", "Content publishing via official API", "OAuth tokens, post content"],
                  ["Google (YouTube)", "Content publishing via official API", "OAuth tokens, post content"],
                  ["LinkedIn", "Content publishing via official API", "OAuth tokens, post content"],
                  ["X / Twitter", "Content publishing via official API", "OAuth tokens, post content"],
                ]}
              />
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                All sub-processors are bound by data processing agreements (DPAs) and handle data in
                accordance with applicable law. Each integration uses the official platform API and
                operates within the scopes you explicitly authorise.
              </p>
            </PublicCard>

            <PublicCard id="international-transfers" className="space-y-4 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">6. International Data Transfers</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Social Raven operates globally. Your data may be transferred to and processed in countries
                outside the European Economic Area (EEA), including the United States. Where such
                transfers occur, we ensure adequate safeguards are in place through:
              </p>
              <ul className="ml-5 list-disc space-y-1 text-copy-14 text-[var(--ds-gray-900)]">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Transfers to countries with an EU adequacy decision</li>
                <li>Binding Corporate Rules or other recognised legal mechanisms where applicable</li>
              </ul>
            </PublicCard>

            <PublicCard id="data-storage" className="space-y-4 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">7. Data Storage &amp; Security</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                We implement industry-standard technical and organisational security measures to protect
                your data:
              </p>
              <ul className="ml-5 list-disc space-y-1 text-copy-14 text-[var(--ds-gray-900)]">
                <li>Encryption of data in transit (TLS 1.2+) and at rest (AES-256)</li>
                <li>Encrypted storage of OAuth tokens — never stored in plaintext</li>
                <li>Role-based access control limiting internal access to personal data</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Incident response procedures meeting 72-hour GDPR breach notification requirements</li>
              </ul>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                While we take all reasonable precautions, no internet-based service is 100% secure. We
                encourage you to use strong passwords and report any suspected security issues promptly.
              </p>
            </PublicCard>

            <PublicCard id="data-retention" className="space-y-5 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">8. Data Retention</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                We retain personal data only as long as necessary for the purposes for which it was
                collected, or as required by law:
              </p>
              <PublicTable
                headers={["Data Type", "Retention Period"]}
                rows={[
                  ["Account data", "Duration of account + 30 days after deletion request"],
                  ["OAuth tokens", "Until account disconnection or deletion"],
                  ["Scheduled post data", "Duration of account + 30 days"],
                  ["Uploaded media files", "Until post is published or draft deleted"],
                  ["Technical/log data", "Up to 90 days"],
                ]}
              />
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Upon account deletion, all personal data is permanently erased within{" "}
                <span className="font-bold">30 days</span>, except where retention is required by law.
              </p>
            </PublicCard>

            <PublicCard id="your-rights" className="space-y-5 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">9. Your Privacy Rights</h2>

              <PublicInsetCard className="space-y-3 p-4 text-copy-14 text-[var(--ds-gray-900)]">
                <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">9.1 Rights Under GDPR (EU/EEA Residents)</h3>
                <p>Under the GDPR, you have the following rights:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li><strong>Right of Access (Art. 15):</strong> Request a copy of the personal data we hold about you.</li>
                  <li><strong>Right to Rectification (Art. 16):</strong> Request correction of inaccurate or incomplete data.</li>
                  <li><strong>Right to Erasure / &quot;Right to be Forgotten&quot; (Art. 17):</strong> Request deletion of your personal data under certain conditions.</li>
                  <li><strong>Right to Restriction of Processing (Art. 18):</strong> Request that we limit how we use your data.</li>
                  <li><strong>Right to Data Portability (Art. 20):</strong> Receive your data in a structured, machine-readable format.</li>
                  <li><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests or for direct marketing.</li>
                  <li><strong>Rights Related to Automated Decision-Making (Art. 22):</strong> We do not make solely automated decisions that produce legal or similarly significant effects.</li>
                  <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw it at any time.</li>
                  <li><strong>Right to Lodge a Complaint:</strong> You have the right to complain to your national Data Protection Authority (DPA). A list of EU DPAs is available at edpb.europa.eu.</li>
                </ul>
              </PublicInsetCard>

              <PublicInsetCard className="space-y-3 p-4 text-copy-14 text-[var(--ds-gray-900)]">
                <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">9.2 Rights Under CCPA (California Residents)</h3>
                <p>If you are a California resident, you have the following rights under the CCPA/CPRA:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li><strong>Right to Know:</strong> Request disclosure of the categories and specific pieces of personal information we have collected.</li>
                  <li><strong>Right to Delete:</strong> Request deletion of personal information we have collected, subject to certain exceptions.</li>
                  <li><strong>Right to Correct:</strong> Request correction of inaccurate personal information.</li>
                  <li><strong>Right to Opt-Out of Sale / Sharing:</strong> We do not sell or share personal information for cross-context behavioural advertising.</li>
                  <li><strong>Right to Limit Use of Sensitive Information:</strong> We do not use sensitive personal information beyond what is necessary for providing the service.</li>
                  <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any CCPA rights.</li>
                </ul>
              </PublicInsetCard>

              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                To exercise any of the above rights, contact us at{" "}
                <a
                  href="mailto:team+privacy@socialraven.io"
                  className="text-[var(--ds-blue-600)] underline underline-offset-2"
                >
                  team+privacy@socialraven.io
                </a>. We will respond within <span className="font-bold">30 days</span> (or 45 days for
                CCPA requests where permitted). We may require identity verification before processing requests.
              </p>
            </PublicCard>

            <PublicCard id="data-deletion" className="space-y-4 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">10. Data Deletion Requests</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                To request deletion of your data, email us with the subject line{" "}
                <em>&quot;Data Deletion Request&quot;</em>:
              </p>
              <PublicPrimaryLinkButton href="mailto:team+privacy@socialraven.io">
                team+privacy@socialraven.io
              </PublicPrimaryLinkButton>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Upon confirmed request, we will permanently erase:
              </p>
              <ul className="ml-5 list-disc space-y-1 text-copy-14 text-[var(--ds-gray-900)]">
                <li>Your account and profile information</li>
                <li>All OAuth access and refresh tokens</li>
                <li>All scheduled and published post records</li>
                <li>All uploaded media</li>
                <li>Analytics data linked to your identity</li>
                <li>All server logs containing your identifiers</li>
              </ul>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Deletion is completed within <span className="font-bold">30 days</span> of verification.
                We will confirm completion via email.
              </p>
            </PublicCard>

            <PublicCard id="children" className="space-y-4 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">11. Children&apos;s Privacy</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Social Raven is not directed at individuals under the age of{" "}
                <span className="font-bold">16</span> (or the applicable minimum age in your
                jurisdiction). We do not knowingly collect personal data from children. If we become aware
                that we have collected data from a child without appropriate consent, we will delete it
                promptly. If you believe a child has provided us with personal data, contact{" "}
                <a
                  href="mailto:team+privacy@socialraven.io"
                  className="text-[var(--ds-blue-600)] underline underline-offset-2"
                >
                  team+privacy@socialraven.io
                </a>{" "}
                immediately.
              </p>
            </PublicCard>

            <PublicCard id="updates" className="space-y-4 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">12. Updates to This Privacy Policy</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                We may update this Privacy Policy periodically to reflect changes to our practices,
                technology, legal requirements, or other factors. When we make material changes, we will
                notify you by email or via a prominent notice within the application at least{" "}
                <span className="font-bold">14 days</span> before changes take effect. The
                &quot;Last Updated&quot; date at the top of this page indicates when the most recent revision was made.
              </p>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Continued use of Social Raven after the effective date of changes constitutes acceptance
                of the revised policy.
              </p>
            </PublicCard>

            <PublicCard id="contact" className="space-y-4 p-8">
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">13. Contact Us</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                For questions, complaints, or to exercise your data rights:
              </p>
              <PublicPrimaryLinkButton href="mailto:team+privacy@socialraven.io">
                team+privacy@socialraven.io
              </PublicPrimaryLinkButton>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                We aim to respond to all privacy-related enquiries within{" "}
                <span className="font-bold">72 hours</span>.
              </p>
            </PublicCard>
          </div>
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

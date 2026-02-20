import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";

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
    <>
      <Navbar />
      <div className="bg-[#f9fafb] px-6 md:px-10 pt-5">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>
      <main className="min-h-screen bg-[#f9fafb]">

        {/* Hero */}
        <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-16">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Legal</p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-3">
              Last Updated: <span className="text-slate-700">February 2026</span>
            </p>
            <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
              Social Raven (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your personal data in
              compliance with the EU General Data Protection Regulation (GDPR), the California Consumer
              Privacy Act (CCPA), and other applicable privacy laws. This Policy explains what data we
              collect, why we collect it, how we protect it, and what rights you have.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 md:px-10 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-14 items-start">

              {/* Sticky TOC */}
              <aside className="hidden lg:block">
                <div className="sticky top-24 rounded-2xl bg-white border border-slate-100 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Contents</p>
                  <nav className="space-y-1">
                    {TOC.map(({ id, label }) => (
                      <a
                        key={id}
                        href={`#${id}`}
                        className="block text-xs text-slate-500 hover:text-slate-900 py-1 transition-colors"
                      >
                        {label}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Sections */}
              <div className="space-y-10 min-w-0">

                {/* 1. Data Controller */}
                <section id="data-controller" className="rounded-2xl bg-white border border-slate-100 p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">1. Data Controller</h2>
                  <p className="text-sm leading-relaxed text-slate-700">
                    The data controller responsible for your personal data is:
                  </p>
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-800 space-y-1">
                    <p className="font-semibold">Social Raven</p>
                    <p>Email:{" "}
                      <a href="mailto:team@socialraven.io" className="text-emerald-700 underline underline-offset-2">
                        team@socialraven.io
                      </a>
                    </p>
                    <p>Website: <span className="text-slate-600">socialraven.io</span></p>
                  </div>
                  <p className="text-sm text-slate-600">
                    For EU residents, if you have questions about how we process your data or wish to exercise
                    your rights, contact us at the address above.
                  </p>
                </section>

                {/* 2. Information We Collect */}
                <section id="information-collected" className="rounded-2xl bg-white border border-slate-100 p-8 space-y-5">
                  <h2 className="text-xl font-semibold text-slate-900">2. Information We Collect</h2>
                  <p className="text-sm text-slate-700">
                    We collect only the minimum data required to deliver, secure, and improve our service.
                  </p>

                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
                    <h3 className="font-semibold text-slate-900">2.1 Account Information</h3>
                    <ul className="ml-5 list-disc space-y-1">
                      <li>Full name and email address (provided during registration)</li>
                      <li>Authentication identifiers managed by Clerk</li>
                      <li>Subscription and billing status (if applicable)</li>
                    </ul>
                  </div>

                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
                    <h3 className="font-semibold text-slate-900">2.2 Connected Social Media Accounts</h3>
                    <p>
                      When you connect a social account (Instagram, Facebook, YouTube, LinkedIn, X/Twitter), we store:
                    </p>
                    <ul className="ml-5 list-disc space-y-1">
                      <li>OAuth access tokens and refresh tokens</li>
                      <li>Platform-assigned user IDs and display names</li>
                      <li>Page/channel IDs for Business accounts</li>
                    </ul>
                    <p className="pt-2 text-slate-600">
                      These tokens are used exclusively to publish posts, retrieve analytics, and manage
                      scheduled content on your behalf. We never access private messages, followers&apos; data,
                      or any information outside explicitly granted OAuth scopes.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
                    <h3 className="font-semibold text-slate-900">2.3 Content You Create</h3>
                    <ul className="ml-5 list-disc space-y-1">
                      <li>Post drafts, captions, hashtags, and scheduling metadata</li>
                      <li>Images and videos uploaded for scheduling (stored temporarily on our servers and/or AWS S3)</li>
                    </ul>
                  </div>

                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
                    <h3 className="font-semibold text-slate-900">2.4 Usage and Technical Data</h3>
                    <ul className="ml-5 list-disc space-y-1">
                      <li>IP address, browser type, device type, and operating system</li>
                      <li>Pages visited, features used, and session duration</li>
                      <li>Error logs and performance diagnostics</li>
                    </ul>
                  </div>

                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
                    <h3 className="font-semibold text-slate-900">2.5 Cookies &amp; Tracking</h3>
                    <p>
                      We use strictly necessary cookies for session management and authentication. We may also
                      use analytics cookies (e.g., anonymised analytics) to understand how users interact with
                      the platform. You may disable non-essential cookies in your browser settings; this will
                      not affect core functionality.
                    </p>
                  </div>
                </section>

                {/* 3. Legal Basis */}
                <section id="legal-basis" className="rounded-2xl bg-white border border-slate-100 p-8 space-y-5">
                  <h2 className="text-xl font-semibold text-slate-900">
                    3. Legal Basis for Processing (GDPR – EU/EEA Users)
                  </h2>
                  <p className="text-sm text-slate-700">
                    Under the GDPR, we process your personal data on the following legal bases:
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="p-3 text-left font-semibold text-slate-800">Purpose</th>
                          <th className="p-3 text-left font-semibold text-slate-800">Legal Basis (Art. 6 GDPR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr><td className="p-3">Providing and operating the service</td><td className="p-3">Performance of a contract (Art. 6(1)(b))</td></tr>
                        <tr><td className="p-3">Account creation and authentication</td><td className="p-3">Performance of a contract (Art. 6(1)(b))</td></tr>
                        <tr><td className="p-3">Security and fraud prevention</td><td className="p-3">Legitimate interests (Art. 6(1)(f))</td></tr>
                        <tr><td className="p-3">Analytics and service improvement</td><td className="p-3">Legitimate interests (Art. 6(1)(f))</td></tr>
                        <tr><td className="p-3">Marketing communications (where applicable)</td><td className="p-3">Consent (Art. 6(1)(a))</td></tr>
                        <tr><td className="p-3">Compliance with legal obligations</td><td className="p-3">Legal obligation (Art. 6(1)(c))</td></tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 4. How We Use */}
                <section id="how-we-use" className="rounded-2xl bg-white border border-slate-100 p-8 space-y-5">
                  <h2 className="text-xl font-semibold text-slate-900">4. How We Use Your Information</h2>
                  <p className="text-sm text-slate-700">We use your data solely for the following purposes:</p>
                  <ul className="ml-5 list-disc space-y-1 text-sm text-slate-700">
                    <li>Authenticating your identity and maintaining your account</li>
                    <li>Scheduling, queuing, and auto-publishing posts to connected platforms</li>
                    <li>Storing content drafts and post history</li>
                    <li>Retrieving analytics and performance data from connected accounts</li>
                    <li>Providing customer support</li>
                    <li>Detecting, preventing, and investigating abuse, fraud, or policy violations</li>
                    <li>Ensuring the security and integrity of our platform</li>
                    <li>Complying with legal obligations</li>
                  </ul>
                  <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm">
                    <p className="font-semibold text-rose-800">We will never:</p>
                    <ul className="ml-5 mt-2 list-disc space-y-1 text-rose-900">
                      <li>Sell, rent, or trade your personal data to third parties</li>
                      <li>Share your data for advertising or profiling purposes</li>
                      <li>Use your content for AI training without explicit consent</li>
                      <li>Monetize your profile or social media presence</li>
                    </ul>
                  </div>
                </section>

                {/* 5. Data Sharing */}
                <section id="data-sharing" className="rounded-2xl bg-white border border-slate-100 p-8 space-y-5">
                  <h2 className="text-xl font-semibold text-slate-900">5. Data Sharing &amp; Third-Party Services</h2>
                  <p className="text-sm text-slate-700">
                    We share data only with trusted sub-processors necessary to operate our service:
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="p-3 text-left font-semibold text-slate-800">Service</th>
                          <th className="p-3 text-left font-semibold text-slate-800">Purpose</th>
                          <th className="p-3 text-left font-semibold text-slate-800">Data Shared</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr><td className="p-3">Clerk</td><td className="p-3">Authentication &amp; user management</td><td className="p-3">Name, email, auth identifiers</td></tr>
                        <tr><td className="p-3">Amazon Web Services (AWS S3)</td><td className="p-3">Media file storage</td><td className="p-3">Uploaded images/videos</td></tr>
                        <tr><td className="p-3">Meta (Instagram, Facebook)</td><td className="p-3">Content publishing via official API</td><td className="p-3">OAuth tokens, post content</td></tr>
                        <tr><td className="p-3">Google (YouTube)</td><td className="p-3">Content publishing via official API</td><td className="p-3">OAuth tokens, post content</td></tr>
                        <tr><td className="p-3">LinkedIn</td><td className="p-3">Content publishing via official API</td><td className="p-3">OAuth tokens, post content</td></tr>
                        <tr><td className="p-3">X / Twitter</td><td className="p-3">Content publishing via official API</td><td className="p-3">OAuth tokens, post content</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-slate-600">
                    All sub-processors are bound by data processing agreements (DPAs) and handle data in
                    accordance with applicable law. Each integration uses the official platform API and
                    operates within the scopes you explicitly authorise.
                  </p>
                </section>

                {/* 6. International Transfers */}
                <section id="international-transfers" className="rounded-2xl bg-white border border-slate-100 p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">6. International Data Transfers</h2>
                  <p className="text-sm leading-relaxed text-slate-700">
                    Social Raven operates globally. Your data may be transferred to and processed in countries
                    outside the European Economic Area (EEA), including the United States. Where such
                    transfers occur, we ensure adequate safeguards are in place through:
                  </p>
                  <ul className="ml-5 list-disc space-y-1 text-sm text-slate-700">
                    <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                    <li>Transfers to countries with an EU adequacy decision</li>
                    <li>Binding Corporate Rules or other recognised legal mechanisms where applicable</li>
                  </ul>
                </section>

                {/* 7. Data Storage & Security */}
                <section id="data-storage" className="rounded-2xl bg-white border border-slate-100 p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">7. Data Storage &amp; Security</h2>
                  <p className="text-sm text-slate-700">
                    We implement industry-standard technical and organisational security measures to protect
                    your data:
                  </p>
                  <ul className="ml-5 list-disc space-y-1 text-sm text-slate-700">
                    <li>Encryption of data in transit (TLS 1.2+) and at rest (AES-256)</li>
                    <li>Encrypted storage of OAuth tokens — never stored in plaintext</li>
                    <li>Role-based access control limiting internal access to personal data</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Incident response procedures meeting 72-hour GDPR breach notification requirements</li>
                  </ul>
                  <p className="text-sm text-slate-600">
                    While we take all reasonable precautions, no internet-based service is 100% secure. We
                    encourage you to use strong passwords and report any suspected security issues promptly.
                  </p>
                </section>

                {/* 8. Data Retention */}
                <section id="data-retention" className="rounded-2xl bg-white border border-slate-100 p-8 space-y-5">
                  <h2 className="text-xl font-semibold text-slate-900">8. Data Retention</h2>
                  <p className="text-sm text-slate-700">
                    We retain personal data only as long as necessary for the purposes for which it was
                    collected, or as required by law:
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="p-3 text-left font-semibold text-slate-800">Data Type</th>
                          <th className="p-3 text-left font-semibold text-slate-800">Retention Period</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr><td className="p-3">Account data</td><td className="p-3">Duration of account + 30 days after deletion request</td></tr>
                        <tr><td className="p-3">OAuth tokens</td><td className="p-3">Until account disconnection or deletion</td></tr>
                        <tr><td className="p-3">Scheduled post data</td><td className="p-3">Duration of account + 30 days</td></tr>
                        <tr><td className="p-3">Uploaded media files</td><td className="p-3">Until post is published or draft deleted</td></tr>
                        <tr><td className="p-3">Technical/log data</td><td className="p-3">Up to 90 days</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-slate-600">
                    Upon account deletion, all personal data is permanently erased within{" "}
                    <span className="font-semibold">30 days</span>, except where retention is required by law.
                  </p>
                </section>

                {/* 9. Your Rights */}
                <section id="your-rights" className="rounded-2xl bg-white border border-slate-100 p-8 space-y-5">
                  <h2 className="text-xl font-semibold text-slate-900">9. Your Privacy Rights</h2>

                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
                    <h3 className="font-semibold text-slate-900">9.1 Rights Under GDPR (EU/EEA Residents)</h3>
                    <p className="text-slate-600 mb-2">Under the GDPR, you have the following rights:</p>
                    <ul className="ml-5 list-disc space-y-1">
                      <li><strong>Right of Access (Art. 15):</strong> Request a copy of the personal data we hold about you.</li>
                      <li><strong>Right to Rectification (Art. 16):</strong> Request correction of inaccurate or incomplete data.</li>
                      <li><strong>Right to Erasure / &quot;Right to be Forgotten&quot; (Art. 17):</strong> Request deletion of your personal data under certain conditions.</li>
                      <li><strong>Right to Restriction of Processing (Art. 18):</strong> Request that we limit how we use your data.</li>
                      <li><strong>Right to Data Portability (Art. 20):</strong> Receive your data in a structured, machine-readable format.</li>
                      <li><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests or for direct marketing.</li>
                      <li><strong>Rights Related to Automated Decision-Making (Art. 22):</strong> We do not make solely automated decisions that produce legal or similarly significant effects.</li>
                      <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw it at any time.</li>
                      <li><strong>Right to Lodge a Complaint:</strong> You have the right to complain to your national Data Protection Authority (DPA). A list of EU DPAs is available at <span className="text-slate-600">edpb.europa.eu</span>.</li>
                    </ul>
                  </div>

                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
                    <h3 className="font-semibold text-slate-900">9.2 Rights Under CCPA (California Residents)</h3>
                    <p className="text-slate-600 mb-2">If you are a California resident, you have the following rights under the CCPA/CPRA:</p>
                    <ul className="ml-5 list-disc space-y-1">
                      <li><strong>Right to Know:</strong> Request disclosure of the categories and specific pieces of personal information we have collected.</li>
                      <li><strong>Right to Delete:</strong> Request deletion of personal information we have collected, subject to certain exceptions.</li>
                      <li><strong>Right to Correct:</strong> Request correction of inaccurate personal information.</li>
                      <li><strong>Right to Opt-Out of Sale / Sharing:</strong> We do not sell or share personal information for cross-context behavioural advertising.</li>
                      <li><strong>Right to Limit Use of Sensitive Information:</strong> We do not use sensitive personal information beyond what is necessary for providing the service.</li>
                      <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any CCPA rights.</li>
                    </ul>
                  </div>

                  <p className="text-sm text-slate-600">
                    To exercise any of the above rights, contact us at{" "}
                    <a href="mailto:team@socialraven.io" className="text-emerald-700 underline underline-offset-2">
                      team@socialraven.io
                    </a>. We will respond within <span className="font-semibold">30 days</span> (or 45 days for
                    CCPA requests where permitted). We may require identity verification before processing requests.
                  </p>
                </section>

                {/* 10. Data Deletion */}
                <section id="data-deletion" className="rounded-2xl bg-white border border-slate-100 p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">10. Data Deletion Requests</h2>
                  <p className="text-sm text-slate-700">
                    To request deletion of your data, email us with the subject line{" "}
                    <em>&quot;Data Deletion Request&quot;</em>:
                  </p>
                  <a
                    href="mailto:team@socialraven.io"
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <span>📧</span>
                    <span>team@socialraven.io</span>
                  </a>
                  <p className="text-sm text-slate-700">Upon confirmed request, we will permanently erase:</p>
                  <ul className="ml-5 list-disc space-y-1 text-sm text-slate-700">
                    <li>Your account and profile information</li>
                    <li>All OAuth access and refresh tokens</li>
                    <li>All scheduled and published post records</li>
                    <li>All uploaded media</li>
                    <li>Analytics data linked to your identity</li>
                    <li>All server logs containing your identifiers</li>
                  </ul>
                  <p className="text-sm text-slate-600">
                    Deletion is completed within <span className="font-semibold">30 days</span> of verification.
                    We will confirm completion via email.
                  </p>
                </section>

                {/* 11. Children */}
                <section id="children" className="rounded-2xl bg-white border border-slate-100 p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">11. Children&apos;s Privacy</h2>
                  <p className="text-sm leading-relaxed text-slate-700">
                    Social Raven is not directed at individuals under the age of{" "}
                    <span className="font-semibold">16</span> (or the applicable minimum age in your
                    jurisdiction). We do not knowingly collect personal data from children. If we become aware
                    that we have collected data from a child without appropriate consent, we will delete it
                    promptly. If you believe a child has provided us with personal data, contact{" "}
                    <a href="mailto:team@socialraven.io" className="text-emerald-700 underline underline-offset-2">
                      team@socialraven.io
                    </a>{" "}
                    immediately.
                  </p>
                </section>

                {/* 12. Updates */}
                <section id="updates" className="rounded-2xl bg-white border border-slate-100 p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">12. Updates to This Privacy Policy</h2>
                  <p className="text-sm leading-relaxed text-slate-700">
                    We may update this Privacy Policy periodically to reflect changes to our practices,
                    technology, legal requirements, or other factors. When we make material changes, we will
                    notify you by email or via a prominent notice within the application at least{" "}
                    <span className="font-semibold">14 days</span> before changes take effect. The
                    &quot;Last Updated&quot; date at the top of this page indicates when the most recent revision was made.
                  </p>
                  <p className="text-sm text-slate-600">
                    Continued use of Social Raven after the effective date of changes constitutes acceptance
                    of the revised policy.
                  </p>
                </section>

                {/* 13. Contact */}
                <section id="contact" className="rounded-2xl bg-white border border-slate-100 p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">13. Contact Us</h2>
                  <p className="text-sm text-slate-700">For questions, complaints, or to exercise your data rights:</p>
                  <a
                    href="mailto:team@socialraven.io"
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <span>📧</span>
                    <span>team@socialraven.io</span>
                  </a>
                  <p className="text-sm text-slate-600">
                    We aim to respond to all privacy-related enquiries within{" "}
                    <span className="font-semibold">72 hours</span>.
                  </p>
                </section>

              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}

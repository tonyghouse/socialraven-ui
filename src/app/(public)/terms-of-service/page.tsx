import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";

export const metadata: Metadata = {
  title: "Terms of Service | Social Raven",
  description:
    "Terms of Service for Social Raven – the rules and conditions governing your use of our platform.",
};

const TOC = [
  { id: "introduction", label: "1. Introduction" },
  { id: "eligibility", label: "2. Eligibility" },
  { id: "account-registration", label: "3. Account Registration" },
  { id: "prohibited-content", label: "4. Prohibited Content" },
  { id: "acceptable-use", label: "5. Acceptable Use" },
  { id: "third-party-platforms", label: "6. Third-Party Platforms" },
  { id: "your-content", label: "7. Your Content & Licence" },
  { id: "privacy", label: "8. Privacy & Data" },
  { id: "intellectual-property", label: "9. Intellectual Property" },
  { id: "subscriptions", label: "10. Subscriptions & Payments" },
  { id: "termination", label: "11. Termination" },
  { id: "disclaimers", label: "12. Disclaimers" },
  { id: "limitation-of-liability", label: "13. Limitation of Liability" },
  { id: "indemnification", label: "14. Indemnification" },
  { id: "governing-law", label: "15. Governing Law" },
  { id: "updates", label: "16. Updates to Terms" },
  { id: "general", label: "17. General Provisions" },
  { id: "contact", label: "18. Contact" },
];

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <div className="bg-[#f9fafb] px-2 lg:px-5 pt-5">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>
      <main className="min-h-screen bg-[#f9fafb]">

        {/* Hero */}
        <div className="bg-white border-b border-[hsl(var(--border))] px-6 md:px-10 py-16">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Legal</p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-3">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: <span className="font-medium text-foreground">February 2026</span>
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 md:px-10 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-14 items-start">

              {/* Sticky TOC */}
              <aside className="hidden lg:block">
                <div className="sticky top-24 rounded-2xl bg-white border border-[hsl(var(--border))] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Contents</p>
                  <nav className="space-y-1">
                    {TOC.map(({ id, label }) => (
                      <a
                        key={id}
                        href={`#${id}`}
                        className="block text-xs text-muted-foreground hover:text-foreground py-1 transition-colors"
                      >
                        {label}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Sections */}
              <div className="space-y-6 min-w-0">

                {/* 1. Introduction */}
                <section id="introduction" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    Welcome to <strong>Social Raven</strong> (&quot;the Service&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;).
                    These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you
                    (&quot;User&quot;, &quot;you&quot;) and Social Raven governing your access to and use of our social media
                    scheduling and management platform, including all related tools, features, APIs, and
                    connected services.
                  </p>
                  <p className="text-foreground/70 leading-relaxed">
                    By creating an account or otherwise using the Service, you confirm that you have read,
                    understood, and agree to be bound by these Terms and our{" "}
                    <a href="/privacy-policy" className="underline underline-offset-2 text-foreground/90 hover:text-foreground transition-colors">
                      Privacy Policy
                    </a>
                    . If you do not agree, you must stop using the Service immediately.
                  </p>
                </section>

                {/* 2. Eligibility */}
                <section id="eligibility" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">2. Eligibility</h2>
                  <p className="text-foreground/70 leading-relaxed">To use Social Raven, you must:</p>
                  <ul className="list-disc pl-6 text-foreground/70 space-y-2">
                    <li>
                      Be at least <strong>16 years of age</strong> (or the minimum age required by law in
                      your jurisdiction to enter into a binding contract without parental consent — e.g., 18
                      in some US states and EU member states);
                    </li>
                    <li>
                      Have the legal authority to enter into these Terms on behalf of yourself or, if
                      applicable, the organisation you represent;
                    </li>
                    <li>
                      Not be prohibited from using the Service under applicable law, including EU sanctions
                      regulations, US export controls, or other applicable trade restrictions.
                    </li>
                  </ul>
                  <p className="text-foreground/70 leading-relaxed">
                    By using the Service, you represent and warrant that you meet these requirements.
                  </p>
                </section>

                {/* 3. Account Registration */}
                <section id="account-registration" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">3. Account Registration &amp; Security</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    You must provide accurate, current, and complete information when creating your account
                    and keep it updated. You are responsible for:
                  </p>
                  <ul className="list-disc pl-6 text-foreground/70 space-y-2">
                    <li>Maintaining the confidentiality of your login credentials;</li>
                    <li>All activity that occurs under your account;</li>
                    <li>
                      Notifying us immediately at{" "}
                      <a href="mailto:team+support@socialraven.io" className="underline underline-offset-2 text-foreground/90">
                        team+support@socialraven.io
                      </a>{" "}
                      if you suspect unauthorised access or a security breach.
                    </li>
                  </ul>
                  <p className="text-foreground/70 leading-relaxed">
                    We are not liable for any loss or damage arising from unauthorised use of your account.
                    You may not share your account credentials with third parties or allow others to access
                    your account.
                  </p>
                </section>

                {/* 4. Prohibited Content */}
                <section id="prohibited-content" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-5">
                  <h2 className="text-xl font-semibold text-foreground">4. Prohibited Content &amp; Conduct</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    Social Raven is a professional social media management tool. You agree not to use the
                    Service to create, upload, schedule, distribute, or publish any content or engage in any
                    conduct that:
                  </p>

                  <div className="rounded-xl border border-red-200 bg-red-50/60 p-5 space-y-3">
                    <h3 className="font-semibold text-red-900">4.1 Adult &amp; Explicit Content — Strictly Prohibited</h3>
                    <p className="text-red-800/80 text-sm leading-relaxed">
                      The following categories of content are <strong>absolutely prohibited</strong> on Social
                      Raven, regardless of platform destination or claimed artistic intent:
                    </p>
                    <ul className="list-disc pl-6 text-red-800/80 text-sm space-y-2">
                      <li>
                        <strong>Pornography and sexually explicit material</strong> of any kind, including
                        nudity intended for sexual gratification, graphic depictions of sexual acts, or
                        content produced for adult entertainment purposes;
                      </li>
                      <li>
                        <strong>Lewd or sexually suggestive content</strong> — material designed to sexualise
                        individuals, provoke sexual arousal in audiences, or simulate sexual scenarios, even
                        if not fully explicit;
                      </li>
                      <li>
                        <strong>Sexualised depictions of minors</strong> (CSAM) — this is illegal under all
                        applicable jurisdictions and will result in immediate termination, account reporting,
                        and referral to law enforcement;
                      </li>
                      <li>
                        <strong>Escort, adult services, or solicitation content</strong> promoting sexual
                        services, whether commercial or otherwise.
                      </li>
                    </ul>
                    <p className="text-red-800/80 text-sm">
                      Violations of this section will result in{" "}
                      <strong>immediate and permanent account termination</strong> without refund, and may be
                      reported to relevant authorities.
                    </p>
                  </div>

                  <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-5 space-y-3">
                    <h3 className="font-semibold text-orange-900">4.2 Hate Speech &amp; Harassment</h3>
                    <ul className="list-disc pl-6 text-orange-800/80 text-sm space-y-2">
                      <li>
                        Hate speech, discrimination, or content that promotes violence or dehumanises
                        individuals based on race, ethnicity, nationality, religion, gender, sexual
                        orientation, disability, or other protected characteristics;
                      </li>
                      <li>Harassment, intimidation, threatening, or bullying of any individual or group;</li>
                      <li>Content that glorifies, promotes, or incites self-harm, suicide, or violence.</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[#f9fafb] p-5 space-y-3">
                    <h3 className="font-semibold text-foreground/80">4.3 Illegal &amp; Harmful Activity</h3>
                    <ul className="list-disc pl-6 text-foreground/70 text-sm space-y-2">
                      <li>Content that infringes third-party intellectual property rights, including copyright, trademarks, or patents;</li>
                      <li>Defamatory, fraudulent, misleading, or deceptive content;</li>
                      <li>Content promoting illegal products, substances, or activities;</li>
                      <li>Malware, phishing, spyware, or any malicious code;</li>
                      <li>Content that violates applicable data protection or privacy laws.</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[#f9fafb] p-5 space-y-3">
                    <h3 className="font-semibold text-foreground/80">4.4 Platform Abuse &amp; Automation Misuse</h3>
                    <ul className="list-disc pl-6 text-foreground/70 text-sm space-y-2">
                      <li>Automated or artificial engagement (fake likes, followers, comments, or shares);</li>
                      <li>Spam — unsolicited bulk content, repetitive posting, or platform manipulation;</li>
                      <li>Use of bots, scrapers, or automated tools beyond the intended functionality of the Service;</li>
                      <li>Violating the Terms of Service of Instagram, X/Twitter, LinkedIn, YouTube, Facebook, or any other connected platform.</li>
                    </ul>
                  </div>

                  <p className="text-foreground/70 leading-relaxed">
                    We reserve the right — but not the obligation — to review, remove, or refuse any content
                    and to suspend or terminate accounts that violate these provisions, at our sole discretion
                    and without prior notice.
                  </p>
                </section>

                {/* 5. Acceptable Use */}
                <section id="acceptable-use" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">5. Acceptable Use</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    You agree to use Social Raven solely for lawful, professional social media management
                    purposes. You must not:
                  </p>
                  <ul className="list-disc pl-6 text-foreground/70 space-y-2">
                    <li>Attempt to gain unauthorised access to our systems or other users&apos; accounts;</li>
                    <li>Reverse engineer, decompile, or disassemble any part of the Service;</li>
                    <li>Resell or sublicense access to the Service without written permission;</li>
                    <li>Interfere with the integrity or performance of the Service or its related systems;</li>
                    <li>Use the Service to compete with Social Raven by building a substantially similar product.</li>
                  </ul>
                </section>

                {/* 6. Third-Party Platforms */}
                <section id="third-party-platforms" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">6. Third-Party Platforms</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    Social Raven integrates with third-party social media platforms (Instagram, X/Twitter,
                    LinkedIn, YouTube, Facebook) via their official APIs. By connecting these accounts, you
                    acknowledge that:
                  </p>
                  <ul className="list-disc pl-6 text-foreground/70 space-y-2">
                    <li>You must comply with the Terms of Service, Community Guidelines, and Content Policies of each connected platform at all times;</li>
                    <li>Social Raven is not affiliated with, endorsed by, or responsible for these third-party platforms;</li>
                    <li>We are not liable for service interruptions, API changes, content takedowns, or account suspensions enacted by third-party platforms;</li>
                    <li>You grant Social Raven permission to act as your authorised agent to publish, retrieve analytics, and manage content on your behalf on connected platforms, within the OAuth scopes you approve.</li>
                  </ul>
                </section>

                {/* 7. Your Content */}
                <section id="your-content" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">7. Your Content &amp; Licence</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    You retain ownership of all content you upload or create through Social Raven (&quot;Your
                    Content&quot;). By using the Service, you grant Social Raven a limited, non-exclusive,
                    royalty-free, worldwide licence to store, process, and transmit Your Content solely for
                    the purpose of providing the Service to you.
                  </p>
                  <p className="text-foreground/70 leading-relaxed">You represent and warrant that:</p>
                  <ul className="list-disc pl-6 text-foreground/70 space-y-2">
                    <li>You own or have the necessary rights and licences to Your Content;</li>
                    <li>Your Content does not violate any third-party rights or applicable law;</li>
                    <li>Your Content complies with the Prohibited Content provisions in Section 4.</li>
                  </ul>
                  <p className="text-foreground/70 leading-relaxed">
                    We do not use Your Content to train AI models, sell data, or for any purpose beyond
                    delivering the Service.
                  </p>
                </section>

                {/* 8. Privacy */}
                <section id="privacy" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">8. Privacy &amp; Data Protection</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    We handle your personal data in accordance with our{" "}
                    <a href="/privacy-policy" className="underline underline-offset-2 text-foreground/90 hover:text-foreground transition-colors">
                      Privacy Policy
                    </a>
                    , which is incorporated into these Terms by reference. The Privacy Policy describes how we
                    collect, use, store, share, and protect your personal information, and explains your
                    rights under the GDPR (for EU/EEA users) and the CCPA (for California residents).
                  </p>
                  <p className="text-foreground/70 leading-relaxed">
                    We do not sell your personal data. We process your data only as necessary to provide and
                    improve the Service and as required by law.
                  </p>
                </section>

                {/* 9. Intellectual Property */}
                <section id="intellectual-property" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">9. Intellectual Property</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    All rights, title, and interest in and to Social Raven — including its branding, logos,
                    UI design, software, documentation, and underlying technology — are and remain the
                    exclusive property of Social Raven and its licensors. These Terms do not grant you any
                    rights to use our trademarks, service marks, or trade dress.
                  </p>
                  <p className="text-foreground/70 leading-relaxed">
                    You may not copy, reproduce, modify, distribute, reverse-engineer, create derivative
                    works from, or otherwise exploit any part of the Service without our prior written
                    consent.
                  </p>
                </section>

                {/* 10. Subscriptions */}
                <section id="subscriptions" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">10. Subscriptions &amp; Payments</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    Certain features of Social Raven may be available on a paid subscription basis. Where
                    applicable:
                  </p>
                  <ul className="list-disc pl-6 text-foreground/70 space-y-2">
                    <li>Subscription fees are billed in advance on a monthly or annual cycle as selected at the time of purchase;</li>
                    <li>Prices are displayed at checkout inclusive of applicable taxes (VAT for EU users where required);</li>
                    <li>EU consumers have a statutory right of withdrawal within 14 days of purchase, unless the service has already commenced with your explicit consent;</li>
                    <li>Refunds outside the statutory withdrawal period are at our discretion;</li>
                    <li>We reserve the right to change pricing with at least 30 days&apos; notice to existing subscribers.</li>
                  </ul>
                </section>

                {/* 11. Termination */}
                <section id="termination" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">11. Termination</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    <strong>By you:</strong> You may stop using the Service and close your account at any
                    time by contacting{" "}
                    <a href="mailto:team+support@socialraven.io" className="underline underline-offset-2 text-foreground/90">
                      team+support@socialraven.io
                    </a>
                    . Upon termination, your data will be deleted in accordance with our Privacy Policy.
                  </p>
                  <p className="text-foreground/70 leading-relaxed">
                    <strong>By us:</strong> We may suspend or permanently terminate your access immediately,
                    without prior notice, if you:
                  </p>
                  <ul className="list-disc pl-6 text-foreground/70 space-y-2">
                    <li>Violate any provision of these Terms, particularly Section 4 (Prohibited Content);</li>
                    <li>Misuse the API or attempt to circumvent our technical safeguards;</li>
                    <li>Engage in conduct that harms other users, third parties, or Social Raven;</li>
                    <li>Fail to pay fees when due (for paid plans).</li>
                  </ul>
                  <p className="text-foreground/70 leading-relaxed">
                    Termination does not affect any rights or obligations that arose prior to the date of
                    termination. Sections 4, 7, 9, 13, 14, and 15 survive termination.
                  </p>
                </section>

                {/* 12. Disclaimers */}
                <section id="disclaimers" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">12. Disclaimers</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    The Service is provided <strong>&quot;as-is&quot;</strong> and{" "}
                    <strong>&quot;as-available&quot;</strong> without warranties of any kind, either express or
                    implied, including but not limited to implied warranties of merchantability, fitness for a
                    particular purpose, and non-infringement.
                  </p>
                  <p className="text-foreground/70 leading-relaxed">
                    We do not warrant that the Service will be uninterrupted, error-free, or free of harmful
                    components. Social media platforms may change their APIs, restrict access, or modify their
                    policies at any time, and we cannot guarantee continued compatibility or access.
                  </p>
                  <p className="text-foreground/70 leading-relaxed">
                    <em>
                      Nothing in these Terms limits or excludes any statutory rights you may have as a
                      consumer under EU or applicable national law that cannot be excluded by agreement.
                    </em>
                  </p>
                </section>

                {/* 13. Limitation of Liability */}
                <section id="limitation-of-liability" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">13. Limitation of Liability</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    To the fullest extent permitted by applicable law, Social Raven and its officers,
                    directors, employees, affiliates, and licensors shall not be liable for any indirect,
                    incidental, special, consequential, punitive, or exemplary damages, including but not
                    limited to loss of revenue, data, goodwill, or business opportunities, arising out of or
                    in connection with your use of or inability to use the Service.
                  </p>
                  <p className="text-foreground/70 leading-relaxed">
                    Our total aggregate liability to you for any claims arising under these Terms shall not
                    exceed the greater of:
                  </p>
                  <ul className="list-disc pl-6 text-foreground/70 space-y-1">
                    <li>The total fees paid by you to Social Raven in the 12 months preceding the claim; or</li>
                    <li>€100 / $100 USD if no fees have been paid.</li>
                  </ul>
                  <p className="text-foreground/70 leading-relaxed text-sm">
                    <em>
                      These limitations do not apply to liability for death or personal injury caused by
                      negligence, fraudulent misrepresentation, or any other liability that cannot be excluded
                      under EU consumer protection law or other applicable mandatory law.
                    </em>
                  </p>
                </section>

                {/* 14. Indemnification */}
                <section id="indemnification" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">14. Indemnification</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    You agree to indemnify, defend, and hold harmless Social Raven and its officers,
                    directors, employees, and affiliates from and against any claims, damages, losses,
                    liabilities, costs, and expenses (including reasonable legal fees) arising out of or
                    relating to:
                  </p>
                  <ul className="list-disc pl-6 text-foreground/70 space-y-2">
                    <li>Your use of or inability to use the Service;</li>
                    <li>Your violation of these Terms;</li>
                    <li>Your violation of any third-party rights, including intellectual property or privacy rights;</li>
                    <li>Any content you submit, post, or transmit through the Service.</li>
                  </ul>
                </section>

                {/* 15. Governing Law */}
                <section id="governing-law" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">15. Governing Law &amp; Dispute Resolution</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    These Terms are governed by and construed in accordance with applicable law. We will
                    always endeavour to resolve any disputes amicably in the first instance.
                  </p>
                  <p className="text-foreground/70 leading-relaxed">
                    <strong>EU/EEA Users:</strong> If you are an EU consumer, you benefit from the mandatory
                    consumer protection provisions of the law of your country of residence. Disputes may also
                    be submitted to your national consumer protection authority or via the EU Online Dispute
                    Resolution (ODR) platform at{" "}
                    <span className="text-foreground/60">ec.europa.eu/consumers/odr</span>.
                  </p>
                  <p className="text-foreground/70 leading-relaxed">
                    <strong>US Users:</strong> Any disputes not resolved through informal negotiation shall be
                    settled through binding arbitration in accordance with applicable arbitration rules, with
                    proceedings conducted in English. Class action lawsuits and class-wide arbitration are
                    waived to the extent permitted by law.
                  </p>
                </section>

                {/* 16. Updates */}
                <section id="updates" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">16. Updates to These Terms</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    We may revise these Terms from time to time. When we make material changes, we will
                    notify you by email or via an in-app notification at least{" "}
                    <strong>14 days</strong> before the changes take effect. The &quot;Last updated&quot; date at the
                    top reflects the date of the most recent revision.
                  </p>
                  <p className="text-foreground/70 leading-relaxed">
                    Continued use of the Service after the effective date of changes constitutes your
                    acceptance of the revised Terms. If you do not agree with the changes, you must stop
                    using the Service and may close your account before the changes take effect.
                  </p>
                </section>

                {/* 17. General */}
                <section id="general" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">17. General Provisions</h2>
                  <ul className="list-disc pl-6 text-foreground/70 space-y-2">
                    <li>
                      <strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy,
                      constitute the entire agreement between you and Social Raven regarding the Service and
                      supersede all prior agreements.
                    </li>
                    <li>
                      <strong>Severability:</strong> If any provision of these Terms is found to be
                      unenforceable, the remaining provisions will continue in full force and effect.
                    </li>
                    <li>
                      <strong>Waiver:</strong> Failure to enforce any provision of these Terms does not
                      constitute a waiver of our right to enforce it in the future.
                    </li>
                    <li>
                      <strong>Assignment:</strong> You may not assign or transfer your rights or obligations
                      under these Terms without our prior written consent. We may assign our rights to a
                      successor in the event of a merger, acquisition, or sale of assets.
                    </li>
                    <li>
                      <strong>Language:</strong> These Terms are provided in English. In case of conflict
                      between translated versions and the English version, the English version shall prevail.
                    </li>
                  </ul>
                </section>

                {/* 18. Contact */}
                <section id="contact" className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">18. Contact</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    If you have questions about these Terms or the Service, please contact us:
                  </p>
                  <div className="rounded-xl bg-muted/40 border border-[hsl(var(--border))] p-4 space-y-1 text-sm">
                    <p className="font-semibold text-foreground">Social Raven</p>
                    <p className="text-foreground/70">
                      Email:{" "}
                      <a
                        href="mailto:team+legal@socialraven.io"
                        className="font-medium text-foreground underline underline-offset-2"
                      >
                        team+legal@socialraven.io
                      </a>
                    </p>
                  </div>
                  <p className="text-foreground/60 text-sm">
                    We aim to respond to all enquiries within 3 business days.
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

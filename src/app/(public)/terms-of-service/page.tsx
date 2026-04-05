import type { Metadata } from "next";
import Link from "next/link";

import {
  PublicPrimaryLinkButton,
  PublicSectionMessage,
} from "@/components/public/public-atlassian";
import {
  PublicCard,
  PublicHero,
  PublicInsetCard,
  PublicPageShell,
  PublicSection,
  PublicToc,
} from "@/components/public/public-layout";

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
        title="Terms of Service"
        meta={
          <>
            Last updated: <span className="font-medium text-[hsl(var(--foreground))]">February 2026</span>
          </>
        }
      />

      <PublicSection>
        <div className="items-start lg:grid lg:grid-cols-[220px_1fr] lg:gap-14">
          <PublicToc items={TOC} />

          <div className="min-w-0 space-y-6">
            <PublicCard id="introduction" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">1. Introduction</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Welcome to <strong>Social Raven</strong> (&quot;the Service&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;),
                operated by <strong>Kammullu Ghouse</strong>, a sole proprietor trading as Social Raven.
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you
                (&quot;User&quot;, &quot;you&quot;) and Kammullu Ghouse trading as Social Raven governing your access to
                and use of our social media scheduling and management platform, including all related
                tools, features, APIs, and connected services.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                By creating an account or otherwise using the Service, you confirm that you have read,
                understood, and agree to be bound by these Terms and our{" "}
                <a href="/privacy-policy" className="text-[hsl(var(--accent))] underline underline-offset-2">
                  Privacy Policy
                </a>
                . If you do not agree, you must stop using the Service immediately.
              </p>
            </PublicCard>

            <PublicCard id="eligibility" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">2. Eligibility</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">To use Social Raven, you must:</p>
              <ul className="list-disc space-y-2 pl-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
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
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                By using the Service, you represent and warrant that you meet these requirements.
              </p>
            </PublicCard>

            <PublicCard id="account-registration" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">3. Account Registration &amp; Security</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                You must provide accurate, current, and complete information when creating your account
                and keep it updated. You are responsible for:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <li>Maintaining the confidentiality of your login credentials;</li>
                <li>All activity that occurs under your account;</li>
                <li>
                  Notifying us immediately at{" "}
                  <a
                    href="mailto:team+support@socialraven.io"
                    className="text-[hsl(var(--accent))] underline underline-offset-2"
                  >
                    team+support@socialraven.io
                  </a>{" "}
                  if you suspect unauthorised access or a security breach.
                </li>
              </ul>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                We are not liable for any loss or damage arising from unauthorised use of your account.
                You may not share your account credentials with third parties or allow others to access
                your account.
              </p>
            </PublicCard>

            <PublicCard id="prohibited-content" className="space-y-5 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">4. Prohibited Content &amp; Conduct</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Social Raven is a professional social media management tool. You agree not to use the
                Service to create, upload, schedule, distribute, or publish any content or engage in any
                conduct that:
              </p>

              <PublicSectionMessage appearance="error" title="4.1 Adult &amp; Explicit Content — Strictly Prohibited">
                <p className="text-sm leading-5">
                  The following categories of content are <strong>absolutely prohibited</strong> on Social
                  Raven, regardless of platform destination or claimed artistic intent:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-sm leading-5">
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
                <p className="text-sm leading-5">
                  Violations of this section will result in{" "}
                  <strong>immediate and permanent account termination</strong> without refund, and may be
                  reported to relevant authorities.
                </p>
              </PublicSectionMessage>

              <PublicSectionMessage appearance="warning" title="4.2 Hate Speech &amp; Harassment">
                <ul className="list-disc space-y-2 pl-6 text-sm">
                  <li>
                    Hate speech, discrimination, or content that promotes violence or dehumanises
                    individuals based on race, ethnicity, nationality, religion, gender, sexual
                    orientation, disability, or other protected characteristics;
                  </li>
                  <li>Harassment, intimidation, threatening, or bullying of any individual or group;</li>
                  <li>Content that glorifies, promotes, or incites self-harm, suicide, or violence.</li>
                </ul>
              </PublicSectionMessage>

              <PublicInsetCard className="space-y-3 p-5">
                <h3 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">4.3 Illegal &amp; Harmful Activity</h3>
                <ul className="list-disc space-y-2 pl-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                  <li>Content that infringes third-party intellectual property rights, including copyright, trademarks, or patents;</li>
                  <li>Defamatory, fraudulent, misleading, or deceptive content;</li>
                  <li>Content promoting illegal products, substances, or activities;</li>
                  <li>Malware, phishing, spyware, or any malicious code;</li>
                  <li>Content that violates applicable data protection or privacy laws.</li>
                </ul>
              </PublicInsetCard>

              <PublicInsetCard className="space-y-3 p-5">
                <h3 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">4.4 Platform Abuse &amp; Automation Misuse</h3>
                <ul className="list-disc space-y-2 pl-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                  <li>Automated or artificial engagement (fake likes, followers, comments, or shares);</li>
                  <li>Spam — unsolicited bulk content, repetitive posting, or platform manipulation;</li>
                  <li>Use of bots, scrapers, or automated tools beyond the intended functionality of the Service;</li>
                  <li>Violating the Terms of Service of Instagram, X/Twitter, LinkedIn, YouTube, Facebook, or any other connected platform.</li>
                </ul>
              </PublicInsetCard>

              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                We reserve the right — but not the obligation — to review, remove, or refuse any content
                and to suspend or terminate accounts that violate these provisions, at our sole discretion
                and without prior notice.
              </p>
            </PublicCard>

            <PublicCard id="acceptable-use" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">5. Acceptable Use</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                You agree to use Social Raven solely for lawful, professional social media management
                purposes. You must not:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <li>Attempt to gain unauthorised access to our systems or other users&apos; accounts;</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service;</li>
                <li>Resell or sublicense access to the Service without written permission;</li>
                <li>Interfere with the integrity or performance of the Service or its related systems;</li>
                <li>Use the Service to compete with Social Raven by building a substantially similar product.</li>
              </ul>
            </PublicCard>

            <PublicCard id="third-party-platforms" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">6. Third-Party Platforms</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Social Raven integrates with third-party social media platforms (Instagram, X/Twitter,
                LinkedIn, YouTube, Facebook) via their official APIs. By connecting these accounts, you
                acknowledge that:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <li>You must comply with the Terms of Service, Community Guidelines, and Content Policies of each connected platform at all times;</li>
                <li>Social Raven is not affiliated with, endorsed by, or responsible for these third-party platforms;</li>
                <li>We are not liable for service interruptions, API changes, content takedowns, or account suspensions enacted by third-party platforms;</li>
                <li>You grant Social Raven permission to act as your authorised agent to publish, retrieve analytics, and manage content on your behalf on connected platforms, within the OAuth scopes you approve.</li>
              </ul>
            </PublicCard>

            <PublicCard id="your-content" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">7. Your Content &amp; Licence</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                You retain ownership of all content you upload or create through Social Raven (&quot;Your
                Content&quot;). By using the Service, you grant Social Raven a limited, non-exclusive,
                royalty-free, worldwide licence to store, process, and transmit Your Content solely for
                the purpose of providing the Service to you.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">You represent and warrant that:</p>
              <ul className="list-disc space-y-2 pl-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <li>You own or have the necessary rights and licences to Your Content;</li>
                <li>Your Content does not violate any third-party rights or applicable law;</li>
                <li>Your Content complies with the Prohibited Content provisions in Section 4.</li>
              </ul>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                We do not use Your Content to train AI models, sell data, or for any purpose beyond
                delivering the Service.
              </p>
            </PublicCard>

            <PublicCard id="privacy" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">8. Privacy &amp; Data Protection</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                We handle your personal data in accordance with our{" "}
                <a href="/privacy-policy" className="text-[hsl(var(--accent))] underline underline-offset-2">
                  Privacy Policy
                </a>
                , which is incorporated into these Terms by reference. The Privacy Policy describes how we
                collect, use, store, share, and protect your personal information, and explains your
                rights under the GDPR (for EU/EEA users) and the CCPA (for California residents).
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                We do not sell your personal data. We process your data only as necessary to provide and
                improve the Service and as required by law.
              </p>
            </PublicCard>

            <PublicCard id="intellectual-property" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">9. Intellectual Property</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                All rights, title, and interest in and to Social Raven — including its branding, logos,
                UI design, software, documentation, and underlying technology — are and remain the
                exclusive property of Social Raven and its licensors. These Terms do not grant you any
                rights to use our trademarks, service marks, or trade dress.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                You may not copy, reproduce, modify, distribute, reverse-engineer, create derivative
                works from, or otherwise exploit any part of the Service without our prior written
                consent.
              </p>
            </PublicCard>

            <PublicCard id="subscriptions" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">10. Subscriptions &amp; Payments</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Certain features of Social Raven may be available on a paid subscription basis. Where
                applicable:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <li>Trial access may be offered without payment details;</li>
                <li>Current public plan prices are published on our <a href="/pricing" className="text-[hsl(var(--accent))] underline underline-offset-2">pricing page</a>;</li>
                <li>Paid self-serve billing is not currently enabled. Once enabled, subscription fees will be billed in advance on the billing cycle selected at purchase and processed securely by Paddle;</li>
                <li>When paid billing is enabled, applicable taxes will be displayed in the billing flow where required;</li>
                <li>EU consumers have a statutory right of withdrawal within 14 days of purchase, unless the service has already commenced with your explicit consent;</li>
                <li>Refund eligibility for paid charges is governed by our <a href="/refund-policy" className="text-[hsl(var(--accent))] underline underline-offset-2">Refund Policy</a>, except where stricter consumer rights apply by law;</li>
                <li>We reserve the right to change pricing with at least 30 days&apos; notice to existing subscribers once paid billing is active.</li>
              </ul>
            </PublicCard>

            <PublicCard id="termination" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">11. Termination</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <strong>By you:</strong> You may stop using the Service and close your account at any
                time by contacting{" "}
                <a
                  href="mailto:team+support@socialraven.io"
                  className="text-[hsl(var(--accent))] underline underline-offset-2"
                >
                  team+support@socialraven.io
                </a>
                . Upon termination, your data will be deleted in accordance with our Privacy Policy.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <strong>By us:</strong> We may suspend or permanently terminate your access immediately,
                without prior notice, if you:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <li>Violate any provision of these Terms, particularly Section 4 (Prohibited Content);</li>
                <li>Misuse the API or attempt to circumvent our technical safeguards;</li>
                <li>Engage in conduct that harms other users, third parties, or Social Raven;</li>
                <li>Fail to pay fees when due (for paid plans).</li>
              </ul>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Termination does not affect any rights or obligations that arose prior to the date of
                termination. Sections 4, 7, 9, 13, 14, and 15 survive termination.
              </p>
            </PublicCard>

            <PublicCard id="disclaimers" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">12. Disclaimers</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                The Service is provided <strong>&quot;as-is&quot;</strong> and{" "}
                <strong>&quot;as-available&quot;</strong> without warranties of any kind, either express or
                implied, including but not limited to implied warranties of merchantability, fitness for a
                particular purpose, and non-infringement.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                We do not warrant that the Service will be uninterrupted, error-free, or free of harmful
                components. Social media platforms may change their APIs, restrict access, or modify their
                policies at any time, and we cannot guarantee continued compatibility or access.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <em>
                  Nothing in these Terms limits or excludes any statutory rights you may have as a
                  consumer under EU or applicable national law that cannot be excluded by agreement.
                </em>
              </p>
            </PublicCard>

            <PublicCard id="limitation-of-liability" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">13. Limitation of Liability</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                To the fullest extent permitted by applicable law, Social Raven and its officers,
                directors, employees, affiliates, and licensors shall not be liable for any indirect,
                incidental, special, consequential, punitive, or exemplary damages, including but not
                limited to loss of revenue, data, goodwill, or business opportunities, arising out of or
                in connection with your use of or inability to use the Service.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Our total aggregate liability to you for any claims arising under these Terms shall not
                exceed the greater of:
              </p>
              <ul className="list-disc space-y-1 pl-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <li>The total fees paid by you to Social Raven in the 12 months preceding the claim; or</li>
                <li>€100 / $100 USD if no fees have been paid.</li>
              </ul>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <em>
                  These limitations do not apply to liability for death or personal injury caused by
                  negligence, fraudulent misrepresentation, or any other liability that cannot be excluded
                  under EU consumer protection law or other applicable mandatory law.
                </em>
              </p>
            </PublicCard>

            <PublicCard id="indemnification" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">14. Indemnification</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                You agree to indemnify, defend, and hold harmless Social Raven and its officers,
                directors, employees, and affiliates from and against any claims, damages, losses,
                liabilities, costs, and expenses (including reasonable legal fees) arising out of or
                relating to:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <li>Your use of or inability to use the Service;</li>
                <li>Your violation of these Terms;</li>
                <li>Your violation of any third-party rights, including intellectual property or privacy rights;</li>
                <li>Any content you submit, post, or transmit through the Service.</li>
              </ul>
            </PublicCard>

            <PublicCard id="governing-law" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">15. Governing Law &amp; Dispute Resolution</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                These Terms are governed by and construed in accordance with applicable law. We will
                always endeavour to resolve any disputes amicably in the first instance.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <strong>EU/EEA Users:</strong> If you are an EU consumer, you benefit from the mandatory
                consumer protection provisions of the law of your country of residence. Disputes may also
                be submitted to your national consumer protection authority or via the EU Online Dispute
                Resolution (ODR) platform at ec.europa.eu/consumers/odr.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                <strong>US Users:</strong> Any disputes not resolved through informal negotiation shall be
                settled through binding arbitration in accordance with applicable arbitration rules, with
                proceedings conducted in English. Class action lawsuits and class-wide arbitration are
                waived to the extent permitted by law.
              </p>
            </PublicCard>

            <PublicCard id="updates" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">16. Updates to These Terms</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                We may revise these Terms from time to time. When we make material changes, we will
                notify you by email or via an in-app notification at least{" "}
                <strong>14 days</strong> before the changes take effect. The &quot;Last updated&quot; date at the
                top reflects the date of the most recent revision.
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Continued use of the Service after the effective date of changes constitutes your
                acceptance of the revised Terms. If you do not agree with the changes, you must stop
                using the Service and may close your account before the changes take effect.
              </p>
            </PublicCard>

            <PublicCard id="general" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">17. General Provisions</h2>
              <ul className="list-disc space-y-2 pl-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
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
            </PublicCard>

            <PublicCard id="contact" className="space-y-4 p-8">
              <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">18. Contact</h2>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                If you have questions about these Terms or the Service, please contact us:
              </p>
              <PublicPrimaryLinkButton href="mailto:team+legal@socialraven.io">
                team+legal@socialraven.io
              </PublicPrimaryLinkButton>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                We aim to respond to all enquiries within 3 business days.
              </p>
            </PublicCard>
          </div>
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

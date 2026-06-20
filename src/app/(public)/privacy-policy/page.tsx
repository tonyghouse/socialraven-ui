import type { Metadata } from "next";
import type { CSSProperties, ComponentType, ReactNode, SVGAttributes } from "react";
import {
  ConnectedDoc,
  Doc,
  Globe,
  Inbox,
  Key,
  Locked,
  MoveArrowRight,
  Person,
  Security,
  UserStatus,
  Workflow,
} from "@vibe/icons";

import {
  PublicBackLink,
  PublicPrimaryLinkButton,
  PublicSectionMessage,
  PublicSubtleLinkButton,
} from "@/components/public/public-site-primitives";
import {
  PublicCard,
  PublicHero,
  PublicInsetCard,
  PublicPageShell,
  PublicSection,
  PublicTable,
  PublicToc,
} from "@/components/public/public-layout";
import { cn } from "@/lib/utils";

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

type VibeIcon = ComponentType<SVGAttributes<SVGElement>>;
type PrivacyTone = CSSProperties & {
  "--privacy-accent": string;
  "--privacy-accent-soft": string;
  "--privacy-accent-muted": string;
};

const createPrivacyTone = (colorToken: string): PrivacyTone => ({
  "--privacy-accent": colorToken,
  "--privacy-accent-soft": `color-mix(in srgb, ${colorToken} 7%, var(--primary-background-color))`,
  "--privacy-accent-muted": `color-mix(in srgb, ${colorToken} 13%, var(--allgrey-background-color))`,
});

const BLUE_TONE = createPrivacyTone("var(--primary-color)");
const TEAL_TONE = createPrivacyTone("var(--color-aquamarine)");
const GREEN_TONE = createPrivacyTone("var(--color-done-green)");
const ORANGE_TONE = createPrivacyTone("var(--color-working_orange)");
const INDIGO_TONE = createPrivacyTone("var(--color-indigo)");
const PINK_TONE = createPrivacyTone("var(--color-bazooka)");

const POLICY_SIGNALS = [
  {
    label: "Primary scope",
    value: "GDPR and CCPA",
    icon: Globe,
    style: BLUE_TONE,
  },
  {
    label: "Data sale",
    value: "Never sold",
    icon: Locked,
    style: GREEN_TONE,
  },
  {
    label: "Rights response",
    value: "30 days",
    icon: UserStatus,
    style: ORANGE_TONE,
  },
  {
    label: "Security baseline",
    value: "TLS 1.2+ and AES-256",
    icon: Security,
    style: INDIGO_TONE,
  },
];

const PRIVACY_DESK_ITEMS = [
  {
    label: "Account data",
    value: "Profile, auth, billing status",
    href: "#information-collected",
    state: "Scoped",
    style: BLUE_TONE,
  },
  {
    label: "OAuth tokens",
    value: "Used for connected platform actions",
    href: "#data-storage",
    state: "Encrypted",
    style: INDIGO_TONE,
  },
  {
    label: "Deletion flow",
    value: "Verified requests completed within 30 days",
    href: "#data-deletion",
    state: "Available",
    style: GREEN_TONE,
  },
];

const sectionClassName = "scroll-mt-24 space-y-5 px-5 py-7 md:px-8 md:py-8";
const compactSectionClassName = "scroll-mt-24 space-y-4 px-5 py-7 md:px-8 md:py-8";
const headingClassName = "text-heading-20 text-[var(--primary-text-color)]";
const copyClassName = "text-copy-14 text-[var(--secondary-text-color)]";
const listClassName =
  "ml-5 list-disc space-y-1.5 text-copy-14 text-[var(--secondary-text-color)]";
const linkClassName = "text-[var(--primary-color)] underline underline-offset-2";

function PrivacyIcon({
  icon: Icon,
  style,
}: {
  icon: VibeIcon;
  style: PrivacyTone;
}) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-[var(--ui-border-color)] bg-[var(--privacy-accent-soft)] text-[var(--privacy-accent)]"
      style={style}
    >
      <Icon className="h-4 w-4 opacity-85" />
    </span>
  );
}

function PolicySubsectionCard({
  title,
  className,
  icon,
  style = BLUE_TONE,
  children,
}: {
  title: string;
  className?: string;
  icon?: VibeIcon;
  style?: PrivacyTone;
  children: ReactNode;
}) {
  return (
    <PublicInsetCard className={cn("overflow-hidden p-0", className)} style={style}>
      <div className="flex items-center gap-3 border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-3">
        <span className="h-8 w-0.5 shrink-0 rounded-full bg-[var(--privacy-accent)] opacity-65" />
        {icon ? <PrivacyIcon icon={icon} style={style} /> : null}
        <div className="min-w-0">
          <p className="text-label-12 uppercase tracking-[0.1em] text-[var(--secondary-text-color)]">
            Data category
          </p>
          <h3 className="mt-0.5 text-heading-16 text-[var(--primary-text-color)]">{title}</h3>
        </div>
      </div>
      <div className="space-y-3 px-4 py-4 text-copy-14 text-[var(--secondary-text-color)]">
        {children}
      </div>
    </PublicInsetCard>
  );
}

function PrivacyDesk() {
  return (
    <PublicCard className="depth-soft min-w-0 overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] text-[var(--primary-color)]">
            <Security className="h-4 w-4" />
          </span>
          <div>
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Privacy desk
            </p>
            <p className="mt-0.5 text-label-14 text-[var(--primary-text-color)]">
              Data controls at a glance
            </p>
          </div>
        </div>
        <span className="h-2 w-2 rounded-full bg-[var(--color-done-green)] opacity-65" />
      </div>

      <div className="bg-[var(--allgrey-background-color)] p-3">
        <div className="overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)]">
          <div className="grid grid-cols-[minmax(0,1fr)_5.25rem] border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-2.5 text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
            <span>Control area</span>
            <span className="text-right">Status</span>
          </div>

          {PRIVACY_DESK_ITEMS.map(({ label, value, href, state, style }) => (
            <a
              key={label}
              href={href}
              className="group grid grid-cols-[0.2rem_minmax(0,1fr)_5.25rem] items-center gap-3 border-b border-[var(--ui-border-color)] px-4 py-3.5 last:border-b-0 hover:bg-[var(--privacy-accent-soft)]"
              style={style}
            >
              <span className="h-9 rounded-full bg-[var(--privacy-accent)] opacity-55" />
              <span className="min-w-0">
                <span className="block text-label-14 text-[var(--primary-text-color)]">
                  {label}
                </span>
                <span className="mt-1 block truncate text-label-12 text-[var(--secondary-text-color)]">
                  {value}
                </span>
              </span>
              <span className="flex items-center justify-end gap-1 text-label-12 text-[var(--secondary-text-color)] group-hover:text-[var(--primary-color)]">
                {state}
                <MoveArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </PublicCard>
  );
}

function PolicySignalsBoard() {
  return (
    <PublicCard className="overflow-hidden p-0 shadow-none">
      <div className="grid gap-px bg-[var(--ui-border-color)] md:grid-cols-4">
        {POLICY_SIGNALS.map(({ label, value, icon, style }) => (
          <div
            key={label}
            className="bg-[var(--primary-background-color)] px-5 py-5"
            style={style}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
                  {label}
                </p>
                <p className="mt-2 text-heading-16 text-[var(--primary-text-color)] [overflow-wrap:anywhere]">
                  {value}
                </p>
              </div>
              <PrivacyIcon icon={icon} style={style} />
            </div>
            <span className="mt-4 block h-1 w-16 rounded-full bg-[var(--privacy-accent)] opacity-35" />
          </div>
        ))}
      </div>
    </PublicCard>
  );
}

function MobilePolicyIndex() {
  return (
    <PublicCard className="overflow-hidden p-0 lg:hidden">
      <div className="border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
        <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
          Policy index
        </p>
      </div>
      <div className="grid gap-px bg-[var(--ui-border-color)] sm:grid-cols-2">
        {TOC.map(({ id, label }, index) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex items-center gap-2 bg-[var(--primary-background-color)] px-4 py-3 text-label-13 text-[var(--secondary-text-color)] hover:bg-[var(--primary-background-hover-color)] hover:text-[var(--primary-text-color)]"
          >
            <span className="w-5 shrink-0 text-label-12 text-[var(--placeholder-color)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{label}</span>
          </a>
        ))}
      </div>
    </PublicCard>
  );
}

function PolicyDocumentHeader() {
  return (
    <div className="grid gap-px bg-[var(--ui-border-color)] lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="bg-[var(--primary-background-color)] px-6 py-5 md:px-7">
        <div className="flex items-start gap-4">
          <PrivacyIcon icon={Doc} style={BLUE_TONE} />
          <div className="min-w-0 space-y-2">
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Policy document
            </p>
            <h2 className="text-heading-24 text-[var(--primary-text-color)]">
              Privacy commitments and operating rules.
            </h2>
            <p className="max-w-2xl text-copy-14 text-[var(--secondary-text-color)]">
              Structured for quick scanning first, full legal reading second.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[var(--allgrey-background-color)] p-3">
        <div className="h-full overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)]">
          {[
            ["Updated", "February 2026"],
            ["Sections", String(TOC.length).padStart(2, "0")],
            ["Contact", "team+privacy@socialraven.io"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-b border-[var(--ui-border-color)] px-4 py-3 last:border-b-0"
            >
              <span className="text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
                {label}
              </span>
              <span className="min-w-0 text-right text-label-12 text-[var(--primary-text-color)] [overflow-wrap:anywhere]">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrivacyContactPanel() {
  return (
    <PublicCard className="overflow-hidden p-0">
      <div className="grid gap-px bg-[var(--ui-border-color)] md:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="bg-[var(--primary-background-color)] px-7 py-7 md:px-8">
          <div className="flex items-start gap-4">
            <PrivacyIcon icon={Inbox} style={BLUE_TONE} />
            <div className="space-y-2">
              <p className="text-heading-16 text-[var(--primary-text-color)]">
                Need to exercise a privacy right?
              </p>
              <p className="max-w-2xl text-copy-14 text-[var(--secondary-text-color)]">
                Send deletion, access, correction, portability, or complaint requests to the
                privacy inbox. We may verify identity before processing requests.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <PublicPrimaryLinkButton href="mailto:team+privacy@socialraven.io">
              Contact privacy
            </PublicPrimaryLinkButton>
            <PublicSubtleLinkButton href="/meta/data-deletion">
              Data deletion details
            </PublicSubtleLinkButton>
          </div>
        </div>
        <div className="grid content-between gap-6 bg-[var(--allgrey-background-color)] px-7 py-7">
          <div className="grid grid-cols-2 gap-2.5" aria-hidden="true">
            {[BLUE_TONE, GREEN_TONE, ORANGE_TONE, INDIGO_TONE].map((style, index) => (
              <span
                key={index}
                className="flex h-12 items-end rounded-[0.85rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] p-2"
                style={style}
              >
                <span className="h-1 w-full rounded-full bg-[var(--privacy-accent)] opacity-40" />
              </span>
            ))}
          </div>
          <p className="text-label-12 text-[var(--secondary-text-color)]">
            Privacy requests are routed through a dedicated inbox.
          </p>
        </div>
      </div>
    </PublicCard>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <PublicPageShell mainClassName="bg-[linear-gradient(180deg,var(--primary-background-color)_0%,var(--allgrey-background-color)_24%,var(--primary-background-color)_58%,var(--allgrey-background-color)_100%)]">
      <PublicHero
        topSlot={<PublicBackLink href="/" />}
        title="Privacy Policy"
        meta={
          <>
            Last updated:{" "}
            <span className="font-medium text-[var(--primary-text-color)]">February 2026</span>
          </>
        }
        description='Social Raven ("we", "our", "us") is committed to protecting your personal data in compliance with the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable privacy laws. This Policy explains what data we collect, why we collect it, how we protect it, and what rights you have.'
        actions={
          <>
            <PublicPrimaryLinkButton href="mailto:team+privacy@socialraven.io">
              Contact privacy
            </PublicPrimaryLinkButton>
            <PublicSubtleLinkButton href="/meta/data-deletion">
              Data deletion
            </PublicSubtleLinkButton>
          </>
        }
        aside={<PrivacyDesk />}
      />

      <PublicSection
        eyebrow="Policy workspace"
        title="Privacy controls, rights, and data flows."
        description="A structured view of what we collect, how we use it, who processes it, and how users can exercise privacy rights."
        surface="surface"
      >
        <div className="space-y-6">
          <PolicySignalsBoard />
          <MobilePolicyIndex />

          <div className="items-start lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8 xl:gap-10">
            <PublicToc items={TOC} />

            <PublicCard className="depth-soft min-w-0 overflow-hidden p-0">
              <PolicyDocumentHeader />
              <div className="divide-y divide-[var(--ui-border-color)]">
              <section id="data-controller" className={compactSectionClassName}>
                <h2 className={headingClassName}>1. Data Controller</h2>
                <p className={copyClassName}>
                  The data controller responsible for your personal data is:
                </p>
                <PublicInsetCard className="max-w-xl space-y-1 p-4 text-copy-14 text-[var(--secondary-text-color)]">
                  <p>Trading name: Social Raven</p>
                  <p>
                    Email:{" "}
                    <a href="mailto:team+privacy@socialraven.io" className={linkClassName}>
                      team+privacy@socialraven.io
                    </a>
                  </p>
                  <p>Website: socialraven.io</p>
                </PublicInsetCard>
                <p className={copyClassName}>
                  For EU residents, if you have questions about how we process your data or wish to
                  exercise your rights, contact us at the address above.
                </p>
              </section>

              <section id="information-collected" className={sectionClassName}>
                <h2 className={headingClassName}>2. Information We Collect</h2>
                <p className={copyClassName}>
                  We collect only the minimum data required to deliver, secure, and improve our
                  service.
                </p>

                <div className="grid gap-4 lg:grid-cols-2">
                  <PolicySubsectionCard
                    title="2.1 Account Information"
                    icon={Person}
                    style={BLUE_TONE}
                  >
                    <ul className={listClassName}>
                      <li>Full name and email address (provided during registration)</li>
                      <li>Authentication identifiers managed by Clerk</li>
                      <li>Subscription and billing status (if applicable)</li>
                    </ul>
                  </PolicySubsectionCard>

                  <PolicySubsectionCard
                    title="2.2 Connected Social Media Accounts"
                    className="lg:col-span-2"
                    icon={ConnectedDoc}
                    style={INDIGO_TONE}
                  >
                    <p>
                      When you connect a social account (Instagram, Facebook, YouTube, LinkedIn,
                      X/Twitter), we store:
                    </p>
                    <ul className={listClassName}>
                      <li>OAuth access tokens and refresh tokens</li>
                      <li>Platform-assigned user IDs and display names</li>
                      <li>Page/channel IDs for Business accounts</li>
                    </ul>
                    <p>
                      These tokens are used exclusively to publish posts, retrieve analytics, and
                      manage scheduled content on your behalf. We never access private messages,
                      followers&apos; data, or any information outside explicitly granted OAuth
                      scopes.
                    </p>
                  </PolicySubsectionCard>

                  <PolicySubsectionCard
                    title="2.3 Content You Create"
                    icon={Doc}
                    style={ORANGE_TONE}
                  >
                    <ul className={listClassName}>
                      <li>Post drafts, captions, hashtags, and scheduling metadata</li>
                      <li>
                        Images and videos uploaded for scheduling (stored temporarily on our
                        servers and/or AWS S3)
                      </li>
                    </ul>
                  </PolicySubsectionCard>

                  <PolicySubsectionCard
                    title="2.4 Usage and Technical Data"
                    icon={Workflow}
                    style={TEAL_TONE}
                  >
                    <ul className={listClassName}>
                      <li>IP address, browser type, device type, and operating system</li>
                      <li>Pages visited, features used, and session duration</li>
                      <li>Error logs and performance diagnostics</li>
                    </ul>
                  </PolicySubsectionCard>

                  <PolicySubsectionCard
                    title="2.5 Cookies & Tracking"
                    className="lg:col-span-2"
                    icon={Key}
                    style={PINK_TONE}
                  >
                    <p>
                      We use strictly necessary cookies for session management and authentication.
                      We may also use analytics cookies (e.g., anonymised analytics) to understand
                      how users interact with the platform. You may disable non-essential cookies
                      in your browser settings; this will not affect core functionality.
                    </p>
                  </PolicySubsectionCard>
                </div>
              </section>

              <section id="legal-basis" className={sectionClassName}>
                <h2 className={headingClassName}>
                  3. Legal Basis for Processing (GDPR – EU/EEA Users)
                </h2>
                <p className={copyClassName}>
                  Under the GDPR, we process your personal data on the following legal bases:
                </p>
                <PublicTable
                  headers={["Purpose", "Legal Basis (Art. 6 GDPR)"]}
                  rows={[
                    [
                      "Providing and operating the service",
                      "Performance of a contract (Art. 6(1)(b))",
                    ],
                    [
                      "Account creation and authentication",
                      "Performance of a contract (Art. 6(1)(b))",
                    ],
                    [
                      "Security and fraud prevention",
                      "Legitimate interests (Art. 6(1)(f))",
                    ],
                    [
                      "Analytics and service improvement",
                      "Legitimate interests (Art. 6(1)(f))",
                    ],
                    [
                      "Marketing communications (where applicable)",
                      "Consent (Art. 6(1)(a))",
                    ],
                    ["Compliance with legal obligations", "Legal obligation (Art. 6(1)(c))"],
                  ]}
                />
              </section>

              <section id="how-we-use" className={sectionClassName}>
                <h2 className={headingClassName}>4. How We Use Your Information</h2>
                <p className={copyClassName}>
                  We use your data solely for the following purposes:
                </p>
                <ul className={listClassName}>
                  <li>Authenticating your identity and maintaining your account</li>
                  <li>Scheduling, queuing, and auto-publishing posts to connected platforms</li>
                  <li>Storing content drafts and post history</li>
                  <li>Retrieving analytics and performance data from connected accounts</li>
                  <li>Providing customer support</li>
                  <li>
                    Detecting, preventing, and investigating abuse, fraud, or policy violations
                  </li>
                  <li>Ensuring the security and integrity of our platform</li>
                  <li>Complying with legal obligations</li>
                </ul>
                <PublicSectionMessage appearance="error" title="We will never">
                  <ul className="list-disc space-y-2 pl-6 text-copy-14">
                    <li>Sell, rent, or trade your personal data to third parties</li>
                    <li>Share your data for advertising or profiling purposes</li>
                    <li>Use your content for AI training without explicit consent</li>
                    <li>Monetize your profile or social media presence</li>
                  </ul>
                </PublicSectionMessage>
              </section>

              <section id="data-sharing" className={sectionClassName}>
                <h2 className={headingClassName}>
                  5. Data Sharing &amp; Third-Party Services
                </h2>
                <p className={copyClassName}>
                  We share data only with trusted sub-processors necessary to operate our service:
                </p>
                <PublicTable
                  headers={["Service", "Purpose", "Data Shared"]}
                  rows={[
                    ["Clerk", "Authentication & user management", "Name, email, auth identifiers"],
                    [
                      "Paddle",
                      "Payment processing and billing administration if paid billing is enabled",
                      "Billing contact details, subscription metadata, transaction details",
                    ],
                    [
                      "Amazon Web Services (AWS S3)",
                      "Media file storage",
                      "Uploaded images/videos",
                    ],
                    [
                      "Meta (Instagram, Facebook)",
                      "Content publishing via official API",
                      "OAuth tokens, post content",
                    ],
                    [
                      "Google (YouTube)",
                      "Content publishing via official API",
                      "OAuth tokens, post content",
                    ],
                    [
                      "LinkedIn",
                      "Content publishing via official API",
                      "OAuth tokens, post content",
                    ],
                    [
                      "X / Twitter",
                      "Content publishing via official API",
                      "OAuth tokens, post content",
                    ],
                  ]}
                />
                <p className={copyClassName}>
                  All sub-processors are bound by data processing agreements (DPAs) and handle data
                  in accordance with applicable law. Each integration uses the official platform API
                  and operates within the scopes you explicitly authorise.
                </p>
              </section>

              <section id="international-transfers" className={compactSectionClassName}>
                <h2 className={headingClassName}>6. International Data Transfers</h2>
                <p className={copyClassName}>
                  Social Raven operates globally. Your data may be transferred to and processed in
                  countries outside the European Economic Area (EEA), including the United States.
                  Where such transfers occur, we ensure adequate safeguards are in place through:
                </p>
                <ul className={listClassName}>
                  <li>
                    Standard Contractual Clauses (SCCs) approved by the European Commission
                  </li>
                  <li>Transfers to countries with an EU adequacy decision</li>
                  <li>
                    Binding Corporate Rules or other recognised legal mechanisms where applicable
                  </li>
                </ul>
              </section>

              <section id="data-storage" className={compactSectionClassName}>
                <h2 className={headingClassName}>7. Data Storage &amp; Security</h2>
                <p className={copyClassName}>
                  We implement industry-standard technical and organisational security measures to
                  protect your data:
                </p>
                <ul className={listClassName}>
                  <li>Encryption of data in transit (TLS 1.2+) and at rest (AES-256)</li>
                  <li>Encrypted storage of OAuth tokens — never stored in plaintext</li>
                  <li>
                    Role-based access control limiting internal access to personal data
                  </li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>
                    Incident response procedures meeting 72-hour GDPR breach notification
                    requirements
                  </li>
                </ul>
                <p className={copyClassName}>
                  While we take all reasonable precautions, no internet-based service is 100%
                  secure. We encourage you to use strong passwords and report any suspected
                  security issues promptly.
                </p>
              </section>

              <section id="data-retention" className={sectionClassName}>
                <h2 className={headingClassName}>8. Data Retention</h2>
                <p className={copyClassName}>
                  We retain personal data only as long as necessary for the purposes for which it
                  was collected, or as required by law:
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
                <p className={copyClassName}>
                  Upon account deletion, all personal data is permanently erased within{" "}
                  <span className="font-bold">30 days</span>, except where retention is required by
                  law.
                </p>
              </section>

              <section id="your-rights" className={sectionClassName}>
                <h2 className={headingClassName}>9. Your Privacy Rights</h2>

                <div className="grid gap-4 xl:grid-cols-2">
                  <PolicySubsectionCard
                    title="9.1 Rights Under GDPR (EU/EEA Residents)"
                    icon={Globe}
                    style={TEAL_TONE}
                  >
                    <p>Under the GDPR, you have the following rights:</p>
                    <ul className={listClassName}>
                      <li>
                        <strong>Right of Access (Art. 15):</strong> Request a copy of the personal
                        data we hold about you.
                      </li>
                      <li>
                        <strong>Right to Rectification (Art. 16):</strong> Request correction of
                        inaccurate or incomplete data.
                      </li>
                      <li>
                        <strong>
                          Right to Erasure / &quot;Right to be Forgotten&quot; (Art. 17):
                        </strong>{" "}
                        Request deletion of your personal data under certain conditions.
                      </li>
                      <li>
                        <strong>Right to Restriction of Processing (Art. 18):</strong> Request
                        that we limit how we use your data.
                      </li>
                      <li>
                        <strong>Right to Data Portability (Art. 20):</strong> Receive your data in
                        a structured, machine-readable format.
                      </li>
                      <li>
                        <strong>Right to Object (Art. 21):</strong> Object to processing based on
                        legitimate interests or for direct marketing.
                      </li>
                      <li>
                        <strong>Rights Related to Automated Decision-Making (Art. 22):</strong> We
                        do not make solely automated decisions that produce legal or similarly
                        significant effects.
                      </li>
                      <li>
                        <strong>Right to Withdraw Consent:</strong> Where processing is based on
                        consent, you may withdraw it at any time.
                      </li>
                      <li>
                        <strong>Right to Lodge a Complaint:</strong> You have the right to complain
                        to your national Data Protection Authority (DPA). A list of EU DPAs is
                        available at edpb.europa.eu.
                      </li>
                    </ul>
                  </PolicySubsectionCard>

                  <PolicySubsectionCard
                    title="9.2 Rights Under CCPA (California Residents)"
                    icon={UserStatus}
                    style={ORANGE_TONE}
                  >
                    <p>
                      If you are a California resident, you have the following rights under the
                      CCPA/CPRA:
                    </p>
                    <ul className={listClassName}>
                      <li>
                        <strong>Right to Know:</strong> Request disclosure of the categories and
                        specific pieces of personal information we have collected.
                      </li>
                      <li>
                        <strong>Right to Delete:</strong> Request deletion of personal information
                        we have collected, subject to certain exceptions.
                      </li>
                      <li>
                        <strong>Right to Correct:</strong> Request correction of inaccurate
                        personal information.
                      </li>
                      <li>
                        <strong>Right to Opt-Out of Sale / Sharing:</strong> We do not sell or
                        share personal information for cross-context behavioural advertising.
                      </li>
                      <li>
                        <strong>Right to Limit Use of Sensitive Information:</strong> We do not use
                        sensitive personal information beyond what is necessary for providing the
                        service.
                      </li>
                      <li>
                        <strong>Right to Non-Discrimination:</strong> We will not discriminate
                        against you for exercising any CCPA rights.
                      </li>
                    </ul>
                  </PolicySubsectionCard>
                </div>

                <p className={copyClassName}>
                  To exercise any of the above rights, contact us at{" "}
                  <a href="mailto:team+privacy@socialraven.io" className={linkClassName}>
                    team+privacy@socialraven.io
                  </a>
                  . We will respond within <span className="font-bold">30 days</span> (or 45 days
                  for CCPA requests where permitted). We may require identity verification before
                  processing requests.
                </p>
              </section>

              <section id="data-deletion" className={compactSectionClassName}>
                <h2 className={headingClassName}>10. Data Deletion Requests</h2>
                <p className={copyClassName}>
                  To request deletion of your data, email us with the subject line{" "}
                  <em>&quot;Data Deletion Request&quot;</em>:
                </p>
                <div>
                  <PublicPrimaryLinkButton href="mailto:team+privacy@socialraven.io">
                    team+privacy@socialraven.io
                  </PublicPrimaryLinkButton>
                </div>
                <p className={copyClassName}>Upon confirmed request, we will permanently erase:</p>
                <ul className={listClassName}>
                  <li>Your account and profile information</li>
                  <li>All OAuth access and refresh tokens</li>
                  <li>All scheduled and published post records</li>
                  <li>All uploaded media</li>
                  <li>Analytics data linked to your identity</li>
                  <li>All server logs containing your identifiers</li>
                </ul>
                <p className={copyClassName}>
                  Deletion is completed within <span className="font-bold">30 days</span> of
                  verification. We will confirm completion via email.
                </p>
              </section>

              <section id="children" className={compactSectionClassName}>
                <h2 className={headingClassName}>11. Children&apos;s Privacy</h2>
                <p className={copyClassName}>
                  Social Raven is not directed at individuals under the age of{" "}
                  <span className="font-bold">16</span> (or the applicable minimum age in your
                  jurisdiction). We do not knowingly collect personal data from children. If we
                  become aware that we have collected data from a child without appropriate consent,
                  we will delete it promptly. If you believe a child has provided us with personal
                  data, contact{" "}
                  <a href="mailto:team+privacy@socialraven.io" className={linkClassName}>
                    team+privacy@socialraven.io
                  </a>{" "}
                  immediately.
                </p>
              </section>

              <section id="updates" className={compactSectionClassName}>
                <h2 className={headingClassName}>12. Updates to This Privacy Policy</h2>
                <p className={copyClassName}>
                  We may update this Privacy Policy periodically to reflect changes to our
                  practices, technology, legal requirements, or other factors. When we make
                  material changes, we will notify you by email or via a prominent notice within
                  the application at least <span className="font-bold">14 days</span> before
                  changes take effect. The &quot;Last Updated&quot; date at the top of this page
                  indicates when the most recent revision was made.
                </p>
                <p className={copyClassName}>
                  Continued use of Social Raven after the effective date of changes constitutes
                  acceptance of the revised policy.
                </p>
              </section>

              <section id="contact" className={compactSectionClassName}>
                <h2 className={headingClassName}>13. Contact Us</h2>
                <p className={copyClassName}>
                  For questions, complaints, or to exercise your data rights:
                </p>
                <div>
                  <PublicPrimaryLinkButton href="mailto:team+privacy@socialraven.io">
                    team+privacy@socialraven.io
                  </PublicPrimaryLinkButton>
                </div>
                <p className={copyClassName}>
                  We aim to respond to all privacy-related enquiries within{" "}
                  <span className="font-bold">72 hours</span>.
                </p>
              </section>
            </div>
          </PublicCard>
        </div>
        </div>
      </PublicSection>

      <PublicSection surface="canvas">
        <PrivacyContactPanel />
      </PublicSection>
    </PublicPageShell>
  );
}

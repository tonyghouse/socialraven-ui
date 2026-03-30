import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageCircle,
  Lock,
  Handshake,
  Clock,
  CheckCircle2,
  Building2,
  Shield,
  Globe,
  Zap,
} from "lucide-react";

import {
  PublicLozenge,
  PublicPrimaryLinkButton,
  PublicTag,
} from "@/components/public/public-atlassian";
import {
  PublicCard,
  PublicHero,
  PublicInsetCard,
  PublicPageShell,
  PublicSection,
} from "@/components/public/public-layout";

export const metadata: Metadata = {
  title: "Contact | Social Raven",
  description:
    "Get in touch with the Social Raven team — support, sales, privacy, and press.",
};

const CONTACTS = [
  {
    label: "General Support",
    description:
      "Questions about your account, troubleshooting, or how to use Social Raven.",
    detail:
      "Billing questions, feature how-tos, post scheduling issues, connected account problems — we handle it all.",
    email: "team+support@socialraven.io",
    icon: MessageCircle,
    response: "Within 24 hours",
  },
  {
    label: "Sales & Agency",
    description:
      "Custom plans, white-labelling, volume pricing, or agency onboarding.",
    detail:
      "We offer bespoke packages for large agencies. Let's find the right fit for your scale.",
    email: "team+sales@socialraven.io",
    icon: Building2,
    response: "Within 4 hours",
  },
  {
    label: "Privacy & Legal",
    description:
      "Data deletion requests, GDPR/CCPA queries, legal notices, or compliance questions.",
    detail:
      "GDPR requests processed within 30 days. CCPA requests within 45 days. Legal notices handled promptly.",
    email: "team+privacy@socialraven.io",
    icon: Lock,
    response: "Within 72 hours",
  },
  {
    label: "Press & Partnerships",
    description:
      "Media enquiries, press kit requests, or partnership opportunities.",
    detail:
      "We're open to integration partnerships, co-marketing campaigns, and media coverage. Let's connect.",
    email: "team+press@socialraven.io",
    icon: Handshake,
    response: "Within 48 hours",
  },
];

const TRUST = [
  { icon: Zap, label: "< 24h avg response", sub: "Average support reply time" },
  { icon: Globe, label: "40+ countries", sub: "Customers worldwide" },
  { icon: Shield, label: "GDPR & CCPA", sub: "Privacy-compliant platform" },
  { icon: CheckCircle2, label: "98% delivery", sub: "Post scheduling reliability" },
];

const FAQS = [
  {
    q: "How do I cancel my subscription?",
    a: "Email team+support@socialraven.io with the subject line 'Cancel subscription'. We'll process it the same business day — no questions asked.",
  },
  {
    q: "How do I request deletion of my data?",
    a: "Email team+privacy@socialraven.io with 'Data Deletion Request' in the subject. All personal data is permanently erased within 30 days of verification.",
  },
  {
    q: "Do you offer a free trial?",
    a: "Yes — start with our Trial plan, no credit card required. Explore the platform fully before deciding. Upgrade to Pro anytime.",
  },
  {
    q: "Can I manage multiple client accounts?",
    a: "Absolutely. Our Pro and Agency plans are designed for agencies. Manage all your clients from a single, clean dashboard.",
  },
  {
    q: "Which platforms does Social Raven support?",
    a: "We support Instagram, Twitter/X, LinkedIn, YouTube, and Facebook. More platforms are actively in development.",
  },
  {
    q: "Is my data safe with Social Raven?",
    a: "Yes. All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). We never sell your data or use it for advertising.",
  },
];

const AGENCY_FEATURES = [
  "Custom seat limits",
  "Dedicated onboarding",
  "White-label options",
  "SLA guarantee",
  "Priority support",
  "Custom invoicing",
];

export default function ContactPage() {
  return (
    <PublicPageShell>
      <PublicHero
        topSlot={
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[hsl(var(--foreground-muted))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            ← Back
          </Link>
        }
        eyebrow="Contact"
        title="We&apos;re here when you need us."
        description="Reach the right team directly — whether it&apos;s a support question, an agency enquiry, or a legal matter."
        aside={
          <PublicCard className="grid gap-4 p-6 sm:grid-cols-2">
            {TRUST.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{label}</p>
                  <p className="text-xs leading-5 text-[hsl(var(--foreground-muted))]">{sub}</p>
                </div>
              </div>
            ))}
          </PublicCard>
        }
      />

      <PublicSection eyebrow="Get in touch" title="Contact the right team">
        <div className="grid gap-5 sm:grid-cols-2">
          {CONTACTS.map(({ label, description, detail, email, icon: Icon, response }) => (
            <PublicCard key={label} className="space-y-4 p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1 text-xs text-[hsl(var(--foreground-muted))]">
                  <Clock className="h-3 w-3" />
                  {response}
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">{label}</h2>
                <p className="text-sm leading-6 text-[hsl(var(--foreground-muted))]">{description}</p>
              </div>
              <p className="border-t border-[hsl(var(--border-subtle))] pt-4 text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                {detail}
              </p>
              <PublicPrimaryLinkButton href={`mailto:${email}`}>{email}</PublicPrimaryLinkButton>
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection eyebrow="Quick answers" title="Before you write" surface="surface">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FAQS.map(({ q, a }) => (
            <PublicInsetCard key={q} className="space-y-2 p-5">
              <PublicTag text={q} />
              <p className="text-sm leading-6 text-[hsl(var(--foreground-muted))]">{a}</p>
            </PublicInsetCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection>
        <PublicCard className="p-10 md:p-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-4">
              <PublicLozenge appearance="inprogress">Agency</PublicLozenge>
              <h2 className="text-2xl font-semibold tracking-[-0.01em] text-[hsl(var(--foreground))] md:text-3xl">
                Need something built for scale?
              </h2>
              <p className="text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                Custom seat limits, dedicated onboarding, white-label options, and SLA guarantees. We partner with agencies and businesses that need more than an off-the-shelf plan.
              </p>
              <PublicPrimaryLinkButton href="mailto:team+sales@socialraven.io?subject=Agency%20Enquiry">
                Talk to sales
              </PublicPrimaryLinkButton>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {AGENCY_FEATURES.map((feature) => (
                <PublicInsetCard
                  key={feature}
                  className="flex items-center gap-2.5 p-4 text-sm text-[hsl(var(--foreground-muted))]"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[hsl(var(--accent))]" />
                  {feature}
                </PublicInsetCard>
              ))}
            </div>
          </div>
        </PublicCard>
      </PublicSection>
    </PublicPageShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageCircle,
  Lock,
  Handshake,
  CheckCircle2,
  Building2,
  Shield,
  Globe,
  Zap,
} from "lucide-react";

import {
  PublicLozenge,
  PublicPrimaryLinkButton,
} from "@/components/public/public-site-primitives";
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
  },
  {
    label: "Sales & Agency",
    description:
      "Custom plans, workspace setup, or agency onboarding.",
    detail:
      "We can help you choose the right plan and rollout path for multi-brand teams.",
    email: "team+sales@socialraven.io",
    icon: Building2,
  },
  {
    label: "Privacy & Legal",
    description:
      "Data deletion requests, GDPR/CCPA queries, legal notices, or compliance questions.",
    detail:
      "GDPR requests processed within 30 days. CCPA requests within 45 days. Legal notices handled promptly.",
    email: "team+privacy@socialraven.io",
    icon: Lock,
  },
  {
    label: "Press & Partnerships",
    description:
      "Media enquiries, press kit requests, or partnership opportunities.",
    detail:
      "We're open to integration partnerships, co-marketing campaigns, and media coverage. Let's connect.",
    email: "team+press@socialraven.io",
    icon: Handshake,
  },
];

const TRUST = [
  { icon: Zap, label: "Public pricing", sub: "Plan and billing details are available before checkout" },
  { icon: Globe, label: "Public website", sub: "Product, pricing, and policy pages are live on the main domain" },
  { icon: Shield, label: "Policy links", sub: "Privacy, terms, and refund policies are publicly accessible" },
  { icon: CheckCircle2, label: "Clear product scope", sub: "The site explains supported platforms and publishing workflows" },
];

const FAQS = [
  {
    q: "How do I cancel my subscription?",
    a: "Cancellation and refund terms are described on our refund policy and terms pages. Contact support if you need help with a billing or account issue.",
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
    a: "We use scoped OAuth connections, publish our privacy policy publicly, and limit data use to operating the service and supporting your account.",
  },
];

const AGENCY_FEATURES = [
  "Multi-workspace planning",
  "Connected account setup guidance",
  "Team onboarding",
  "Plan selection support",
  "Billing workflow guidance",
  "Priority coordination",
];

export default function ContactPage() {
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
        eyebrow="Contact"
        title="We&apos;re here when you need us."
        description="Reach the right team directly — whether it&apos;s a support question, an agency enquiry, or a legal matter. Social Raven is operated by Kammullu Ghouse, a sole proprietor trading as Social Raven."
        aside={
          <PublicCard className="grid gap-4 p-6 sm:grid-cols-2">
            {TRUST.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-blue-600)]">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-label-14 text-[var(--ds-gray-1000)]">{label}</p>
                  <p className="text-label-12 text-[var(--ds-gray-900)]">{sub}</p>
                </div>
              </div>
            ))}
          </PublicCard>
        }
      />

      <PublicSection eyebrow="Get in touch" title="Contact the right team">
        <div className="grid gap-5 sm:grid-cols-2">
          {CONTACTS.map(({ label, description, detail, email, icon: Icon }) => (
            <PublicCard key={label} className="space-y-4 p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-blue-600)]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">{label}</h2>
                <p className="text-copy-14 text-[var(--ds-gray-900)]">{description}</p>
              </div>
              <p className="border-t border-[var(--ds-gray-400)] pt-4 text-copy-14 text-[var(--ds-gray-900)]">
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
            <PublicInsetCard key={q} className="space-y-3 p-6">
              <h3 className="text-heading-16 text-[var(--ds-gray-1000)]">{q}</h3>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">{a}</p>
            </PublicInsetCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection>
        <PublicCard className="p-10 md:p-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-4">
              <PublicLozenge appearance="inprogress">Agency</PublicLozenge>
              <h2 className="text-heading-32 text-[var(--ds-gray-1000)]">
                Need something built for scale?
              </h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Dedicated onboarding, workspace planning, and support for multi-brand teams that need more guidance than a standard self-serve setup.
              </p>
              <PublicPrimaryLinkButton href="mailto:team+sales@socialraven.io?subject=Agency%20Enquiry">
                Talk to sales
              </PublicPrimaryLinkButton>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {AGENCY_FEATURES.map((feature) => (
                <PublicInsetCard
                  key={feature}
                  className="flex items-center gap-2.5 p-4 text-copy-14 text-[var(--ds-gray-900)]"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--ds-blue-600)]" />
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

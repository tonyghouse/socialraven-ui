import type { Metadata } from "next";
import {
  MessageCircle,
  Lock,
  Handshake,
  CheckCircle2,
  Building2,
  Shield,
  Globe,
} from "lucide-react";

import {
  PublicBackLink,
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
  {
    icon: MessageCircle,
    label: "Direct team inboxes",
    sub: "Support, sales, privacy, and partnership requests go to the right place.",
  },
  {
    icon: Shield,
    label: "Clear public information",
    sub: "Pricing, privacy, terms, and refund details stay accessible before you contact us.",
  },
  {
    icon: Globe,
    label: "Built for real teams",
    sub: "We help solo operators, agencies, and in-house teams with practical guidance.",
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
          <PublicBackLink href="/" />
        }
        eyebrow="Contact"
        title="Talk to the right team."
        description="Contact Social Raven for support, sales, privacy, or partnership questions. We keep the route clear so your message reaches the right team faster."
        aside={
          <PublicCard className="space-y-4 p-6">
            {TRUST.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-start gap-3 border-b border-[var(--ds-gray-400)] pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-blue-600)]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
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

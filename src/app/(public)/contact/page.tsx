import type { Metadata } from "next";
import {
  MessageCircle,
  Lock,
  Handshake,
  CheckCircle2,
  Building2,
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
    email: "team+support@socialraven.io",
    icon: MessageCircle,
  },
  {
    label: "Sales & Agency",
    description:
      "Custom plans, workspace setup, or agency onboarding.",
    email: "team+sales@socialraven.io",
    icon: Building2,
  },
  {
    label: "Privacy & Legal",
    description:
      "Data deletion requests, GDPR/CCPA queries, legal notices, or compliance questions.",
    email: "team+privacy@socialraven.io",
    icon: Lock,
  },
  {
    label: "Press & Partnerships",
    description:
      "Media enquiries, press kit requests, or partnership opportunities.",
    email: "team+press@socialraven.io",
    icon: Handshake,
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
        topSlot={<PublicBackLink href="/" />}
        title="Talk to the right team."
      />

      <PublicSection>
        <div className="grid gap-5 sm:grid-cols-2">
          {CONTACTS.map(({ label, description, email, icon: Icon }) => (
            <PublicCard key={label} className="space-y-5 p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-blue-600)]">
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">{label}</h2>
                <p className="text-copy-14 text-[var(--ds-gray-900)]">{description}</p>
              </div>
              <PublicPrimaryLinkButton href={`mailto:${email}`}>
                {email}
              </PublicPrimaryLinkButton>
            </PublicCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection>
        <PublicCard className="px-7 py-8 md:px-10 md:py-10">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-5">
              <PublicLozenge appearance="information">Agency</PublicLozenge>
              <h2 className="text-heading-24 text-[var(--ds-gray-1000)]">
                Need something built for scale?
              </h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                Dedicated onboarding, workspace planning, and support for multi-brand teams that need more than a self-serve setup.
              </p>
              <div>
                <PublicPrimaryLinkButton href="mailto:team+sales@socialraven.io?subject=Agency%20Enquiry">
                  Talk to sales
                </PublicPrimaryLinkButton>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {AGENCY_FEATURES.map((feature) => (
                <PublicInsetCard
                  key={feature}
                  className="flex items-center gap-2.5 p-4 text-copy-13 text-[var(--ds-gray-900)]"
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

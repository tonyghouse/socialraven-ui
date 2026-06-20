import type { Metadata } from "next";
import {
  Check,
  Comment,
  Connect,
  Inbox,
  Locked,
  MoveArrowRight,
  Work,
} from "@vibe/icons";
import type { CSSProperties, ComponentType, SVGAttributes } from "react";

import {
  PublicBackLink,
  PublicPrimaryLinkButton,
  PublicSubtleLinkButton,
} from "@/components/public/public-site-primitives";
import {
  PublicCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
} from "@/components/public/public-layout";

export const metadata: Metadata = {
  title: "Contact | Social Raven",
  description:
    "Get in touch with the Social Raven team — support, sales, privacy, and press.",
};

type VibeIcon = ComponentType<SVGAttributes<SVGElement>>;
type ContactAccentStyle = CSSProperties & {
  "--contact-accent": string;
  "--contact-accent-soft": string;
};

const createAccentStyle = (colorToken: string): ContactAccentStyle => ({
  "--contact-accent": colorToken,
  "--contact-accent-soft": `color-mix(in srgb, ${colorToken} 6%, var(--primary-background-color))`,
});

const BLUE_ACCENT = createAccentStyle("var(--primary-color)");
const TEAL_ACCENT = createAccentStyle("var(--color-aquamarine)");
const INDIGO_ACCENT = createAccentStyle("var(--color-indigo)");
const ORANGE_ACCENT = createAccentStyle("var(--color-working_orange)");

const CONTACTS = [
  {
    label: "General Support",
    description:
      "Questions about your account, troubleshooting, or how to use Social Raven.",
    email: "team+support@socialraven.io",
    icon: Comment,
    style: BLUE_ACCENT,
  },
  {
    label: "Sales & Agency",
    description: "Custom plans, workspace setup, or agency onboarding.",
    email: "team+sales@socialraven.io",
    icon: Work,
    style: TEAL_ACCENT,
  },
  {
    label: "Privacy & Legal",
    description:
      "Data deletion requests, GDPR/CCPA queries, legal notices, or compliance questions.",
    email: "team+privacy@socialraven.io",
    icon: Locked,
    style: INDIGO_ACCENT,
  },
  {
    label: "Press & Partnerships",
    description:
      "Media enquiries, press kit requests, or partnership opportunities.",
    email: "team+press@socialraven.io",
    icon: Connect,
    style: ORANGE_ACCENT,
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

function ContactIcon({
  icon: Icon,
  style,
}: {
  icon: VibeIcon;
  style: ContactAccentStyle;
}) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] text-[var(--contact-accent)]"
      style={style}
    >
      <Icon className="h-4 w-4 opacity-75" />
    </span>
  );
}

function RequestRouter() {
  return (
    <PublicCard className="depth-soft min-w-0 overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] text-[var(--primary-color)]">
            <Inbox className="h-4 w-4" />
          </span>
          <div>
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Request router
            </p>
            <p className="mt-0.5 text-label-14 text-[var(--primary-text-color)]">
              Dedicated inboxes for every request type.
            </p>
          </div>
        </div>
        <span className="h-2 w-2 rounded-full bg-[var(--color-done-green)] opacity-65" />
      </div>

      <div className="bg-[var(--allgrey-background-color)] p-3">
        <div className="overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)]">
          <div className="grid grid-cols-[minmax(0,1fr)_3rem] border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-2.5 text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
            <span>Request type</span>
            <span className="text-right">Route</span>
          </div>

          {CONTACTS.map(({ label, email, style }) => (
            <a
              key={label}
              href={`mailto:${email}`}
              className="group grid grid-cols-[0.2rem_minmax(0,1fr)_3rem] items-center gap-3 border-b border-[var(--ui-border-color)] px-4 py-3.5 last:border-b-0 hover:bg-[var(--contact-accent-soft)]"
              style={style}
            >
              <span className="h-9 rounded-full bg-[var(--contact-accent)] opacity-55" />
              <span className="min-w-0">
                <span className="block text-label-14 text-[var(--primary-text-color)]">{label}</span>
                <span className="mt-1 block truncate text-label-12 text-[var(--secondary-text-color)]">
                  {email}
                </span>
              </span>
              <span className="flex justify-end text-[var(--secondary-text-color)] group-hover:text-[var(--primary-color)]">
                <MoveArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                <span className="sr-only">Send email to {label}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </PublicCard>
  );
}

function ContactDirectory() {
  return (
    <PublicCard className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[var(--primary-color)] opacity-65" />
          <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
            Contact directory
          </p>
        </div>
        <span className="text-label-12 text-[var(--secondary-text-color)]">
          {String(CONTACTS.length).padStart(2, "0")} dedicated inboxes
        </span>
      </div>

      <div className="grid gap-px bg-[var(--ui-border-color)] lg:grid-cols-2">
        {CONTACTS.map(({ label, description, email, icon, style }, index) => (
          <article
            key={label}
            className="flex min-w-0 flex-col bg-[var(--primary-background-color)]"
            style={style}
          >
            <div className="flex items-center justify-between gap-4 border-b border-[var(--ui-border-color)] px-5 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <span className="h-8 w-0.5 rounded-full bg-[var(--contact-accent)] opacity-60" />
                <span className="text-label-12 text-[var(--secondary-text-color)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <ContactIcon icon={icon} style={style} />
            </div>

            <div className="flex flex-1 flex-col px-5 py-5 md:px-6 md:py-6">
              <div className="space-y-2">
                <h2 className="text-heading-16 text-[var(--primary-text-color)]">{label}</h2>
                <p className="text-copy-14 text-[var(--secondary-text-color)]">{description}</p>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-[var(--ui-border-color)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 text-label-12 text-[var(--secondary-text-color)] [overflow-wrap:anywhere]">
                  {email}
                </p>
                <div className="shrink-0">
                  <PublicSubtleLinkButton href={`mailto:${email}`}>
                    Send email
                    <MoveArrowRight className="ml-1.5 h-4 w-4" />
                  </PublicSubtleLinkButton>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PublicCard>
  );
}

function AgencyPanel() {
  return (
    <PublicCard className="overflow-hidden p-0" style={TEAL_ACCENT}>
      <div className="flex items-center justify-between gap-4 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-6 py-4 md:px-7">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[var(--contact-accent)] opacity-65" />
          <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
            Agency
          </p>
        </div>
        <span className="text-label-12 text-[var(--secondary-text-color)]">Planning at scale</span>
      </div>

      <div className="grid gap-px bg-[var(--ui-border-color)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="bg-[var(--primary-background-color)] px-7 py-7 md:px-8 md:py-8">
          <div className="space-y-3">
            <h2 className="text-heading-24 text-[var(--primary-text-color)]">
              Need something built for scale?
            </h2>
            <p className="max-w-xl text-copy-14 text-[var(--secondary-text-color)] md:text-[1rem] md:leading-6">
              Dedicated onboarding, workspace planning, and support for multi-brand teams that need more than a self-serve setup.
            </p>
          </div>
          <div className="mt-6">
            <PublicPrimaryLinkButton href="mailto:team+sales@socialraven.io?subject=Agency%20Enquiry">
              Talk to sales
            </PublicPrimaryLinkButton>
          </div>
        </div>

        <div className="bg-[var(--allgrey-background-color)] p-3 md:p-4">
          <div className="overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)]">
            <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-2.5 text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
              <span>Onboarding scope</span>
              <span className="text-right">Included</span>
            </div>
            {AGENCY_FEATURES.map((feature, index) => {
              const style = [BLUE_ACCENT, TEAL_ACCENT, ORANGE_ACCENT][index % 3];

              return (
                <div
                  key={feature}
                  className="grid grid-cols-[0.2rem_minmax(0,1fr)_5.5rem] items-center gap-3 border-b border-[var(--ui-border-color)] px-4 py-3 last:border-b-0"
                  style={style}
                >
                  <span className="h-7 rounded-full bg-[var(--contact-accent)] opacity-50" />
                  <span className="text-copy-13 text-[var(--secondary-text-color)]">{feature}</span>
                  <span className="flex justify-end">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[0.7rem] border border-[var(--ui-border-color)] bg-[var(--contact-accent-soft)] text-[var(--contact-accent)]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-6 py-3.5 md:px-7">
        <p className="text-label-12 text-[var(--secondary-text-color)]">
          Multi-workspace planning and onboarding support.
        </p>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {[BLUE_ACCENT, TEAL_ACCENT, ORANGE_ACCENT].map((style, index) => (
            <span
              key={index}
              className="h-1.5 w-7 rounded-full bg-[var(--contact-accent)] opacity-40"
              style={style}
            />
          ))}
        </div>
      </div>
    </PublicCard>
  );
}

export default function ContactPage() {
  return (
    <PublicPageShell mainClassName="bg-[linear-gradient(180deg,var(--primary-background-color)_0%,var(--allgrey-background-color)_24%,var(--primary-background-color)_58%,var(--allgrey-background-color)_100%)]">
      <PublicHero
        topSlot={<PublicBackLink href="/" />}
        title="Talk to the right team."
        description="Support, sales, privacy, and partnerships all route through dedicated inboxes so requests land in the right workflow quickly."
        aside={<RequestRouter />}
      />

      <PublicSection surface="surface">
        <ContactDirectory />
      </PublicSection>

      <PublicSection surface="canvas">
        <AgencyPanel />
      </PublicSection>
    </PublicPageShell>
  );
}

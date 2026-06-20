import type { Metadata } from "next";
import {
  Bolt,
  Calendar,
  Chart,
  Check,
  CheckList,
  Globe,
  Locked,
  Person,
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
  title: "About | Social Raven",
  description:
    "Learn about Social Raven, the team behind it, and the mission to simplify professional social media management.",
};

type VibeIcon = ComponentType<SVGAttributes<SVGElement>>;
type AccentStyle = CSSProperties & {
  "--about-accent": string;
  "--about-accent-soft": string;
  "--about-accent-muted": string;
};

const createAccentStyle = (colorToken: string): AccentStyle => ({
  "--about-accent": colorToken,
  "--about-accent-soft": `color-mix(in srgb, ${colorToken} 7%, var(--primary-background-color))`,
  "--about-accent-muted": `color-mix(in srgb, ${colorToken} 10%, var(--allgrey-background-color))`,
});

const BLUE_ACCENT = createAccentStyle("var(--primary-color)");
const BRIGHT_BLUE_ACCENT = createAccentStyle("var(--color-bright-blue)");
const GREEN_ACCENT = createAccentStyle("var(--color-done-green)");
const ORANGE_ACCENT = createAccentStyle("var(--color-working_orange)");
const INDIGO_ACCENT = createAccentStyle("var(--color-indigo)");
const PINK_ACCENT = createAccentStyle("var(--color-bazooka)");

const VALUES = [
  {
    icon: CheckList,
    title: "Simplicity first",
    description: "Every feature earns its place — if it doesn't make your workflow faster, it doesn't ship.",
    style: BLUE_ACCENT,
  },
  {
    icon: Locked,
    title: "Privacy by design",
    description: "Data use is limited to operating the service. Connected accounts stay scoped to official OAuth permissions.",
    style: INDIGO_ACCENT,
  },
  {
    icon: Bolt,
    title: "Reliable by default",
    description: "Clear workflows, visible status, and fewer operational surprises.",
    style: GREEN_ACCENT,
  },
  {
    icon: Globe,
    title: "Built for global teams",
    description: "Designed for distributed publishing across regions, time zones, and team sizes.",
    style: ORANGE_ACCENT,
  },
];

const PERSONAS = [
  {
    title: "Creators & Influencers",
    style: BRIGHT_BLUE_ACCENT,
    bullets: [
      "Multi-platform publishing in one step",
      "Clear calendar visibility",
      "Readable performance tracking",
    ],
  },
  {
    title: "Agencies & Freelancers",
    style: ORANGE_ACCENT,
    bullets: [
      "Workspace-based client separation",
      "Review flows for internal sign-off",
      "Scheduling built for repeatable delivery",
    ],
  },
  {
    title: "Brands & Businesses",
    style: GREEN_ACCENT,
    bullets: [
      "Consistent publishing process",
      "Cross-platform reporting in one view",
      "Controls that support growing teams",
    ],
  },
];

const CAPABILITIES = [
  {
    icon: Calendar,
    label: "Smart scheduling",
    value: "Plan campaigns and publishing windows clearly",
    style: BLUE_ACCENT,
  },
  {
    icon: Chart,
    label: "Unified analytics",
    value: "All platforms in one view",
    style: GREEN_ACCENT,
  },
  {
    icon: Person,
    label: "Multi-account",
    value: "Workspace-based account management",
    style: ORANGE_ACCENT,
  },
  {
    icon: Locked,
    label: "Secure & compliant",
    value: "GDPR · CCPA · TLS 1.2+",
    style: INDIGO_ACCENT,
  },
];

function AccentIcon({
  icon: Icon,
  style,
}: {
  icon: VibeIcon;
  style: AccentStyle;
}) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] text-[var(--about-accent)] shadow-[inset_0_0_0_0.0625rem_rgb(255_255_255_/_0.34)]"
      style={style}
    >
      <Icon className="h-4 w-4 opacity-80" />
    </div>
  );
}

function CheckBullet({ children }: { children: string }) {
  return (
    <li className="flex items-start gap-2.5 text-copy-13 text-[var(--secondary-text-color)]">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] text-[var(--primary-color)]">
        <Check className="h-3 w-3" />
      </span>
      {children}
    </li>
  );
}

function CapabilityBoard() {
  return (
    <PublicCard className="depth-soft overflow-hidden p-0">
      <div className="border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Capabilities
            </p>
            <h2 className="mt-2 text-heading-20 text-[var(--primary-text-color)]">
              Designed for clear execution.
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-1" aria-hidden="true">
            {[BLUE_ACCENT, GREEN_ACCENT, ORANGE_ACCENT, INDIGO_ACCENT].map((style, index) => (
              <span
                key={index}
                className="h-2 w-2 rounded-full bg-[var(--about-accent)] opacity-60"
                style={style}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[var(--allgrey-background-color)] p-3">
        <div className="overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)]">
          <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-2.5 text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
            <span>Capability</span>
            <span className="text-right">Signal</span>
          </div>
          {CAPABILITIES.map(({ icon, label, value, style }) => (
            <div
              key={label}
              className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-4 border-b border-[var(--ui-border-color)] px-4 py-4 last:border-b-0"
              style={style}
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-1.5 h-8 w-0.5 shrink-0 rounded-full bg-[var(--about-accent)] opacity-70" />
                <AccentIcon icon={icon} style={style} />
                <div className="min-w-0 space-y-1">
                  <p className="text-label-14 text-[var(--primary-text-color)]">{label}</p>
                  <p className="text-copy-13 text-[var(--secondary-text-color)]">{value}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <span className="h-2 w-full max-w-[4.5rem] rounded-full bg-[var(--allgrey-background-color)]">
                  <span className="block h-full w-2/3 rounded-full bg-[var(--about-accent)] opacity-35" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicCard>
  );
}

function MissionCard() {
  return (
    <PublicCard className="relative overflow-hidden p-0">
      <div className="border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-6 pt-7 pb-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--primary-color)] opacity-70" />
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Mission
            </p>
          </div>
          <h2 className="text-heading-24 text-[var(--primary-text-color)]">
            Give serious teams a simpler way to run social.
          </h2>
        </div>
      </div>
      <div className="space-y-6 px-6 py-6 md:px-7 md:py-7">
        <p className="max-w-2xl text-copy-14 text-[var(--secondary-text-color)] md:text-[1rem] md:leading-6">
          Social Raven makes scheduling, collaboration, and reporting clear enough for small
          teams and strong enough for growing ones — without the bloat.
        </p>
        <div className="flex flex-wrap gap-2">
          {VALUES.map(({ title, style }) => (
            <span
              key={title}
              className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-2.5 py-1 text-left text-label-12 leading-[1.1] text-[var(--secondary-text-color)] whitespace-normal [overflow-wrap:anywhere]"
              style={style}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--about-accent)] opacity-65" />
              {title}
            </span>
          ))}
        </div>
        <div>
          <PublicPrimaryLinkButton href="/sign-up">Start for free</PublicPrimaryLinkButton>
        </div>
      </div>
    </PublicCard>
  );
}

function TeamsBoard() {
  return (
    <PublicCard className="overflow-hidden p-0">
      <div className="border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-6 py-5">
        <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
          Teams
        </p>
        <h2 className="mt-2 text-heading-20 text-[var(--primary-text-color)]">
          One platform. Every team.
        </h2>
      </div>
      <div className="grid gap-px bg-[var(--ui-border-color)] lg:grid-cols-3">
        {PERSONAS.map(({ title, bullets, style }, index) => (
          <div key={title} className="bg-[var(--primary-background-color)]" style={style}>
            <div className="flex items-center gap-3 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
              <span className="h-8 w-0.5 rounded-full bg-[var(--about-accent)] opacity-70" />
              <div>
                <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 text-heading-16 text-[var(--primary-text-color)]">{title}</h3>
              </div>
            </div>
            <ul className="space-y-3 px-5 py-5">
              {bullets.map((bullet) => (
                <CheckBullet key={bullet}>{bullet}</CheckBullet>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PublicCard>
  );
}

function PrincipleCard({
  icon,
  title,
  description,
  index,
  style,
}: {
  icon: VibeIcon;
  title: string;
  description: string;
  index: number;
  style: AccentStyle;
}) {
  return (
    <PublicCard className="card-hover h-full overflow-hidden p-0" style={style}>
      <div className="flex items-center justify-between border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
        <span className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <AccentIcon icon={icon} style={style} />
      </div>
      <div className="grid gap-4 px-5 py-5 md:px-6 md:py-6">
        <div className="space-y-2">
          <h3 className="text-heading-16 text-[var(--primary-text-color)]">{title}</h3>
          <p className="text-copy-13 text-[var(--secondary-text-color)]">{description}</p>
        </div>
        <span className="h-1 w-20 rounded-full bg-[var(--about-accent-muted)]">
          <span className="block h-full w-2/3 rounded-full bg-[var(--about-accent)] opacity-45" />
        </span>
      </div>
    </PublicCard>
  );
}

function FinalCtaCard() {
  return (
    <PublicCard className="overflow-hidden p-0">
      <div className="grid gap-px bg-[var(--ui-border-color)] md:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="bg-[var(--primary-background-color)] px-7 py-7 md:px-8">
          <div className="space-y-2">
            <p className="text-heading-16 text-[var(--primary-text-color)]">
              Ready to get started?
            </p>
            <p className="max-w-2xl text-copy-14 text-[var(--secondary-text-color)]">
              Social Raven makes scheduling, collaboration, and reporting clear enough for small
              teams and strong enough for growing ones — without the bloat.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <PublicPrimaryLinkButton href="/sign-up">Start free trial</PublicPrimaryLinkButton>
            <PublicSubtleLinkButton href="/contact">Talk to us</PublicSubtleLinkButton>
          </div>
        </div>
        <div className="grid content-between bg-[var(--allgrey-background-color)] px-7 py-7">
          <div className="grid grid-cols-2 gap-2.5" aria-hidden="true">
            {[BLUE_ACCENT, GREEN_ACCENT, ORANGE_ACCENT, PINK_ACCENT].map((style, index) => (
              <span
                key={index}
                className="flex h-12 items-end rounded-[0.85rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] p-2"
                style={style}
              >
                <span className="h-1 w-full rounded-full bg-[var(--about-accent)] opacity-40" />
              </span>
            ))}
          </div>
          <p className="mt-6 text-label-12 uppercase tracking-[0.12em] text-[var(--primary-color)]">
            Designed for clear execution.
          </p>
        </div>
      </div>
    </PublicCard>
  );
}

export default function AboutPage() {
  return (
    <PublicPageShell mainClassName="bg-[linear-gradient(180deg,var(--primary-background-color)_0%,var(--allgrey-background-color)_24%,var(--primary-background-color)_55%,var(--allgrey-background-color)_100%)]">
      <PublicHero
        topSlot={<PublicBackLink href="/" />}
        title={
          <>
            Built for teams who take social media{" "}
            <span className="text-[var(--primary-text-color)]">seriously.</span>
          </>
        }
        description="Social Raven makes scheduling, collaboration, and reporting clear enough for small teams and strong enough for growing ones — without the bloat."
        actions={
          <PublicPrimaryLinkButton href="/sign-up">Start free trial</PublicPrimaryLinkButton>
        }
        aside={<CapabilityBoard />}
      />

      <PublicSection surface="surface">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <MissionCard />
          <TeamsBoard />
        </div>
      </PublicSection>

      <PublicSection eyebrow="Principles" title="The principles we build by">
        <div className="grid gap-4 md:grid-cols-2">
          {VALUES.map(({ icon, title, description, style }, index) => (
            <PrincipleCard
              key={title}
              icon={icon}
              title={title}
              description={description}
              index={index}
              style={style}
            />
          ))}
        </div>
      </PublicSection>

      <PublicSection surface="surface">
        <FinalCtaCard />
      </PublicSection>
    </PublicPageShell>
  );
}

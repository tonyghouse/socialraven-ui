import type { Metadata } from "next";
import { NavigationChevronDown, Person, Workspace } from "@vibe/icons";
import type { CSSProperties, ComponentType, SVGAttributes } from "react";

import {
  PublicBackLink,
  PublicPrimaryLinkButton,
} from "@/components/public/public-site-primitives";
import { PricingGrid, type PricingMode } from "@/components/public/pricing-grid";
import { PricingFaq } from "@/components/public/pricing-faq";
import {
  PublicCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
} from "@/components/public/public-layout";

export const metadata: Metadata = {
  title: "Pricing | Social Raven",
  description:
    "Simple, transparent pricing for creators and agencies. 14-day free trial, no credit card required.",
};

type VibeIcon = ComponentType<SVGAttributes<SVGElement>>;
type ModeStyle = CSSProperties & {
  "--mode-accent": string;
  "--mode-soft": string;
};

const INFLUENCER_STYLE: ModeStyle = {
  "--mode-accent": "var(--primary-color)",
  "--mode-soft":
    "color-mix(in srgb, var(--primary-color) 6%, var(--primary-background-color))",
};

const AGENCY_STYLE: ModeStyle = {
  "--mode-accent": "var(--color-aquamarine)",
  "--mode-soft":
    "color-mix(in srgb, var(--color-aquamarine) 7%, var(--primary-background-color))",
};

const PRICING_MODES = [
  {
    mode: "influencer" as const,
    label: "Influencer mode",
    description: "One workspace for creators building and scaling their own brand.",
    href: "#influencer-mode",
    price: "From $12 / month",
    icon: Person,
    style: INFLUENCER_STYLE,
  },
  {
    mode: "agency" as const,
    label: "Agency mode",
    description: "Multiple workspaces for teams managing client brands.",
    href: "#agency-mode",
    price: "From $79 / month",
    icon: Workspace,
    style: AGENCY_STYLE,
  },
];

const MODE_DETAILS: Record<
  PricingMode,
  {
    eyebrow: string;
    title: string;
    description: string;
    icon: VibeIcon;
    style: ModeStyle;
    metrics: Array<{ label: string; value: string }>;
  }
> = {
  influencer: {
    eyebrow: "Mode 01 · Influencer",
    title: "One workspace for your own brand.",
    description:
      "Creator plans keep publishing, connected accounts, analytics, and support in one focused workspace.",
    icon: Person,
    style: INFLUENCER_STYLE,
    metrics: [
      { label: "Workspaces", value: "1" },
      { label: "Accounts", value: "15–30" },
      { label: "Starts at", value: "$12 / mo" },
    ],
  },
  agency: {
    eyebrow: "Mode 02 · Agency",
    title: "Multiple workspaces for client operations.",
    description:
      "Agency plans separate client brands, support unlimited team seats, and scale from three workspaces to custom volume.",
    icon: Workspace,
    style: AGENCY_STYLE,
    metrics: [
      { label: "Workspaces", value: "3–30+" },
      { label: "Team seats", value: "Unlimited" },
      { label: "Starts at", value: "$79 / mo" },
    ],
  },
};

function PricingModeBoard() {
  return (
    <PublicCard className="depth-soft min-w-0 overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
        <div>
          <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
            Choose your mode
          </p>
          <p className="mt-1 text-label-14 text-[var(--primary-text-color)]">
            Two distinct pricing paths
          </p>
        </div>
        <span className="h-2 w-2 rounded-full bg-[var(--color-done-green)] opacity-65" />
      </div>

      <div className="grid gap-px bg-[var(--ui-border-color)]">
        {PRICING_MODES.map(({ label, description, href, price, icon: Icon, style }) => (
          <a
            key={label}
            href={href}
            className="group grid grid-cols-[0.2rem_2.5rem_minmax(0,1fr)] items-start gap-3 bg-[var(--primary-background-color)] px-5 py-4 hover:bg-[var(--mode-soft)] sm:grid-cols-[0.2rem_2.5rem_minmax(0,1fr)_auto]"
            style={style}
          >
            <span className="h-full min-h-12 rounded-full bg-[var(--mode-accent)] opacity-55" />
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] border border-[var(--ui-border-color)] bg-[var(--mode-soft)] text-[var(--mode-accent)]">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-label-14 text-[var(--primary-text-color)]">{label}</span>
              <span className="mt-1 block text-copy-13 text-[var(--secondary-text-color)]">
                {description}
              </span>
            </span>
            <span className="col-start-3 flex items-center gap-1.5 text-label-12 text-[var(--secondary-text-color)] group-hover:text-[var(--primary-color)] sm:col-start-auto sm:self-center">
              {price}
              <NavigationChevronDown className="h-4 w-4" />
            </span>
          </a>
        ))}
      </div>
    </PublicCard>
  );
}

function ModeHeader({ mode }: { mode: PricingMode }) {
  const { eyebrow, title, description, icon: Icon, style, metrics } = MODE_DETAILS[mode];

  return (
    <div className="mb-8 grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_30rem]" style={style}>
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-[var(--ui-border-color)] bg-[var(--mode-soft)] text-[var(--mode-accent)]">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 space-y-2">
          <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
            {eyebrow}
          </p>
          <h2 className="font-[var(--font-vibe-title)] text-[clamp(1.75rem,1.55rem+1vw,2.5rem)] font-bold leading-[1.02] tracking-[-0.04em] text-[var(--primary-text-color)]">
            {title}
          </h2>
          <p className="max-w-2xl text-copy-16 text-[var(--secondary-text-color)]">
            {description}
          </p>
        </div>
      </div>

      <PublicCard className="overflow-hidden p-0 shadow-none">
        <div className="grid h-full grid-cols-3 gap-px bg-[var(--ui-border-color)]">
          {metrics.map(({ label, value }) => (
            <div key={label} className="bg-[var(--primary-background-color)] px-4 py-4">
              <p className="text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
                {label}
              </p>
              <p className="mt-2 text-heading-16 text-[var(--primary-text-color)] [overflow-wrap:anywhere]">
                {value}
              </p>
              <span className="mt-3 block h-1 w-12 rounded-full bg-[var(--mode-accent)] opacity-40" />
            </div>
          ))}
        </div>
      </PublicCard>
    </div>
  );
}

function PlanNotes() {
  return (
    <PublicCard className="mt-6 overflow-hidden p-0 shadow-none">
      <div className="flex items-center gap-2.5 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-6 py-4">
        <span className="h-2 w-2 rounded-full bg-[var(--primary-color)] opacity-65" />
        <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
          Across all plans
        </p>
      </div>
      <div className="grid gap-px bg-[var(--ui-border-color)] md:grid-cols-2">
        <div className="bg-[var(--primary-background-color)] px-6 py-5">
          <p className="text-copy-13 text-[var(--secondary-text-color)]">
            <span className="font-semibold text-[var(--primary-text-color)]">Unlimited</span>{" "}
            scheduling across supported platforms.
          </p>
        </div>
        <div className="bg-[var(--primary-background-color)] px-6 py-5">
          <p className="text-copy-13 text-[var(--secondary-text-color)]">
            Every plan includes an x.com monthly allowance, and extra x.com volume is available with
            an add-on.
          </p>
        </div>
      </div>
    </PublicCard>
  );
}

export default function PricingPage() {
  return (
    <PublicPageShell mainClassName="bg-[linear-gradient(180deg,var(--primary-background-color)_0%,var(--allgrey-background-color)_22%,var(--primary-background-color)_58%,var(--allgrey-background-color)_100%)]">
      <PublicHero
        topSlot={<PublicBackLink href="/" />}
        title="Pricing"
        description="14-day trial · Cancel anytime · USD"
        actions={
          <PublicPrimaryLinkButton href="/sign-up">Start free trial</PublicPrimaryLinkButton>
        }
        aside={<PricingModeBoard />}
      />

      <PublicSection surface="surface">
        <div id="influencer-mode" className="scroll-mt-24">
          <ModeHeader mode="influencer" />
          <PricingGrid mode="influencer" />
        </div>
      </PublicSection>

      <PublicSection surface="canvas">
        <div id="agency-mode" className="scroll-mt-24">
          <ModeHeader mode="agency" />
          <PricingGrid mode="agency" />
          <PlanNotes />
        </div>
      </PublicSection>

      <PublicSection eyebrow="FAQ" title="Billing questions, answered simply." surface="surface">
        <div className="mx-auto w-full max-w-4xl">
          <PricingFaq />
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

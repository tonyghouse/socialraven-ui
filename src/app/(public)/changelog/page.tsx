import type { CSSProperties, ComponentType, SVGAttributes } from "react";
import type { Metadata } from "next";
import {
  AddUpdate,
  Board,
  Calendar,
  Chart,
  Check,
  CheckList,
  ConnectedDoc,
  Doc,
  Locked,
  MoveArrowRight,
  Status,
  Timeline,
  Workspace,
} from "@vibe/icons";

import {
  PublicBackLink,
  PublicLozenge,
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
  title: "Changelog | Social Raven",
  description:
    "Product updates, fixes, and rollout notes for Social Raven.",
};

type VibeIcon = ComponentType<SVGAttributes<SVGElement>>;
type ReleaseTone = CSSProperties & {
  "--changelog-accent": string;
  "--changelog-accent-soft": string;
  "--changelog-accent-muted": string;
};

const createReleaseTone = (colorToken: string): ReleaseTone => ({
  "--changelog-accent": colorToken,
  "--changelog-accent-soft": `color-mix(in srgb, ${colorToken} 7%, var(--primary-background-color))`,
  "--changelog-accent-muted": `color-mix(in srgb, ${colorToken} 12%, var(--allgrey-background-color))`,
});

const BLUE_TONE = createReleaseTone("var(--primary-color)");
const TEAL_TONE = createReleaseTone("var(--color-aquamarine)");
const GREEN_TONE = createReleaseTone("var(--color-done-green)");
const ORANGE_TONE = createReleaseTone("var(--color-working_orange)");
const INDIGO_TONE = createReleaseTone("var(--color-indigo)");
const PINK_TONE = createReleaseTone("var(--color-bazooka)");

const RELEASE_NAV_ITEMS = [
  {
    label: "Latest release",
    value: "v0.1 beta",
    href: "#latest-release",
    state: "Live",
    style: BLUE_TONE,
  },
  {
    label: "Publishing scope",
    value: "Planning and scheduling",
    href: "#release-scope",
    state: "Included",
    style: TEAL_TONE,
  },
  {
    label: "Operations",
    value: "Accounts, analytics, compliance",
    href: "#release-operations",
    state: "Included",
    style: ORANGE_TONE,
  },
];

const RELEASE_HIGHLIGHTS = [
  {
    label: "Connected channels",
    description: "Instagram, X, LinkedIn, YouTube, and Facebook integrations.",
    icon: ConnectedDoc,
    style: BLUE_TONE,
  },
  {
    label: "Publishing workflow",
    description: "Shared scheduling workflows for planned publishing.",
    icon: Calendar,
    style: TEAL_TONE,
  },
  {
    label: "Performance view",
    description: "Analytics for reach, engagement, and post performance.",
    icon: Chart,
    style: GREEN_TONE,
  },
  {
    label: "Agency control",
    description: "Multi-account management for growing agency operations.",
    icon: Workspace,
    style: ORANGE_TONE,
  },
];

const RELEASE_SECTIONS = [
  {
    id: "release-scope",
    label: "Publishing",
    icon: Calendar,
    style: BLUE_TONE,
    items: [
      "Shared scheduling workflows for planned publishing",
      "Multi-platform post creation for image, video, and text content",
      "Platform-specific publishing coverage for core social channels",
    ],
  },
  {
    id: "release-operations",
    label: "Operations",
    icon: Board,
    style: ORANGE_TONE,
    items: [
      "Multi-account management for agencies",
      "Workspace-ready structure for client and brand separation",
      "Clear rollout notes for what shipped in the beta foundation",
    ],
  },
  {
    id: "release-reporting",
    label: "Reporting",
    icon: Chart,
    style: GREEN_TONE,
    items: [
      "Analytics dashboard with reach and engagement visibility",
      "Post-level performance tracking",
      "Release notes structured for quick stakeholder review",
    ],
  },
  {
    id: "release-compliance",
    label: "Trust",
    icon: Locked,
    style: INDIGO_TONE,
    items: [
      "GDPR and CCPA-compliant data handling",
      "Connected account scope aligned to official OAuth permissions",
      "Privacy and legal request routing available from the public site",
    ],
  },
];

const CHANGE_TYPES = [
  {
    label: "New",
    description: "Net-new capabilities and platform coverage.",
    icon: AddUpdate,
    style: BLUE_TONE,
    appearance: "new" as const,
  },
  {
    label: "Improved",
    description: "Workflow refinements that make existing work clearer.",
    icon: CheckList,
    style: TEAL_TONE,
    appearance: "information" as const,
  },
  {
    label: "Fixed",
    description: "Corrections, stability work, and cleanup notes.",
    icon: Status,
    style: ORANGE_TONE,
    appearance: "warning" as const,
  },
];

const RELEASE_METRICS = [
  { label: "Release", value: "v0.1" },
  { label: "Stage", value: "Beta" },
  { label: "Month", value: "Feb 2026" },
];

function ReleaseIcon({
  icon: Icon,
  style,
}: {
  icon: VibeIcon;
  style: ReleaseTone;
}) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-[var(--ui-border-color)] bg-[var(--changelog-accent-soft)] text-[var(--changelog-accent)]"
      style={style}
    >
      <Icon className="h-4 w-4 opacity-85" />
    </span>
  );
}

function ReleaseDesk() {
  return (
    <PublicCard className="depth-soft min-w-0 overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] text-[var(--primary-color)]">
            <Timeline className="h-4 w-4" />
          </span>
          <div>
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Release desk
            </p>
            <p className="mt-0.5 text-label-14 text-[var(--primary-text-color)]">
              Product changes at a glance
            </p>
          </div>
        </div>
        <span className="h-2 w-2 rounded-full bg-[var(--color-done-green)] opacity-65" />
      </div>

      <div className="bg-[var(--allgrey-background-color)] p-3">
        <div className="overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)]">
          <div className="grid grid-cols-[minmax(0,1fr)_5rem] border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-2.5 text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
            <span>Update stream</span>
            <span className="text-right">State</span>
          </div>

          {RELEASE_NAV_ITEMS.map(({ label, value, href, state, style }) => (
            <a
              key={label}
              href={href}
              className="group grid grid-cols-[0.2rem_minmax(0,1fr)_5rem] items-center gap-3 border-b border-[var(--ui-border-color)] px-4 py-3.5 last:border-b-0 hover:bg-[var(--changelog-accent-soft)]"
              style={style}
            >
              <span className="h-9 rounded-full bg-[var(--changelog-accent)] opacity-55" />
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

function ReleaseSnapshot() {
  return (
    <PublicCard className="overflow-hidden p-0 shadow-none">
      <div className="grid gap-px bg-[var(--ui-border-color)] sm:grid-cols-3">
        {RELEASE_METRICS.map(({ label, value }) => (
          <div key={label} className="bg-[var(--primary-background-color)] px-5 py-4">
            <p className="text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
              {label}
            </p>
            <p className="mt-2 text-heading-16 text-[var(--primary-text-color)]">{value}</p>
            <span className="mt-3 block h-1 w-12 rounded-full bg-[var(--primary-color)] opacity-35" />
          </div>
        ))}
      </div>
    </PublicCard>
  );
}

function HighlightGrid() {
  return (
    <div className="grid gap-px bg-[var(--ui-border-color)] md:grid-cols-2">
      {RELEASE_HIGHLIGHTS.map(({ label, description, icon, style }) => (
        <div
          key={label}
          className="grid grid-cols-[0.2rem_minmax(0,1fr)] gap-4 bg-[var(--primary-background-color)] px-5 py-5 md:px-6"
          style={style}
        >
          <span className="h-full min-h-20 rounded-full bg-[var(--changelog-accent)] opacity-60" />
          <div className="min-w-0 space-y-3">
            <ReleaseIcon icon={icon} style={style} />
            <div className="space-y-1.5">
              <h3 className="text-heading-16 text-[var(--primary-text-color)]">{label}</h3>
              <p className="text-copy-13 text-[var(--secondary-text-color)]">{description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReleaseSection({
  label,
  icon,
  style,
  items,
}: {
  label: string;
  icon: VibeIcon;
  style: ReleaseTone;
  items: string[];
}) {
  return (
    <article
      className="overflow-hidden rounded-[1rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)]"
      style={style}
    >
      <div className="flex items-center justify-between gap-4 border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="h-7 w-0.5 rounded-full bg-[var(--changelog-accent)] opacity-65" />
          <ReleaseIcon icon={icon} style={style} />
          <h3 className="text-heading-16 text-[var(--primary-text-color)]">{label}</h3>
        </div>
        <PublicLozenge appearance="information">Included</PublicLozenge>
      </div>

      <ul className="divide-y divide-[var(--ui-border-color)]">
        {items.map((item) => (
          <li
            key={item}
            className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-3 px-4 py-3.5"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-[0.6rem] border border-[var(--ui-border-color)] bg-[var(--changelog-accent-soft)] text-[var(--changelog-accent)]">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="text-copy-13 text-[var(--secondary-text-color)]">{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function LatestReleaseBoard() {
  return (
    <PublicCard id="latest-release" className="scroll-mt-24 overflow-hidden p-0">
      <div className="grid gap-px bg-[var(--ui-border-color)] lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="bg-[var(--primary-background-color)] px-6 py-6 md:px-7">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-heading-24 text-[var(--primary-text-color)]">v0.1</h2>
              <PublicLozenge appearance="new" isBold>
                New
              </PublicLozenge>
            </div>
            <div className="space-y-2">
              <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
                February 2026 · Beta foundation
              </p>
              <p className="max-w-xl text-copy-14 text-[var(--secondary-text-color)] md:text-[1rem] md:leading-6">
                The first beta release establishes the core publishing, scheduling,
                analytics, agency, and compliance surface for Social Raven.
              </p>
            </div>
          </div>
        </div>
        <HighlightGrid />
      </div>

      <div className="border-t border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] p-3 md:p-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {RELEASE_SECTIONS.map(({ id, ...section }) => (
            <div key={id} id={id} className="scroll-mt-24">
              <ReleaseSection {...section} />
            </div>
          ))}
        </div>
      </div>
    </PublicCard>
  );
}

function ChangeTypeBoard() {
  return (
    <PublicCard className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[var(--primary-color)] opacity-65" />
          <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
            Change categories
          </p>
        </div>
        <span className="text-label-12 text-[var(--secondary-text-color)]">
          Simple release labels
        </span>
      </div>

      <div className="grid gap-px bg-[var(--ui-border-color)] md:grid-cols-3">
        {CHANGE_TYPES.map(({ label, description, icon, style, appearance }, index) => (
          <div
            key={label}
            className="bg-[var(--primary-background-color)] px-5 py-5 md:px-6"
            style={style}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="h-8 w-0.5 rounded-full bg-[var(--changelog-accent)] opacity-65" />
                <div>
                  <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-heading-16 text-[var(--primary-text-color)]">{label}</h3>
                </div>
              </div>
              <ReleaseIcon icon={icon} style={style} />
            </div>
            <p className="mt-5 text-copy-13 text-[var(--secondary-text-color)]">{description}</p>
            <div className="mt-5">
              <PublicLozenge appearance={appearance}>{label}</PublicLozenge>
            </div>
          </div>
        ))}
      </div>
    </PublicCard>
  );
}

function ReleaseCta() {
  return (
    <PublicCard className="overflow-hidden p-0">
      <div className="grid gap-px bg-[var(--ui-border-color)] md:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="bg-[var(--primary-background-color)] px-7 py-7 md:px-8">
          <div className="space-y-2">
            <p className="text-heading-16 text-[var(--primary-text-color)]">
              Need a release detail clarified?
            </p>
            <p className="max-w-2xl text-copy-14 text-[var(--secondary-text-color)]">
              Contact the team for rollout questions, platform coverage, or agency onboarding
              details tied to the beta release.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <PublicPrimaryLinkButton href="/contact">Contact the team</PublicPrimaryLinkButton>
            <PublicSubtleLinkButton href="/pricing">View pricing</PublicSubtleLinkButton>
          </div>
        </div>
        <div className="grid content-between gap-6 bg-[var(--allgrey-background-color)] px-7 py-7">
          <div className="grid grid-cols-2 gap-2.5" aria-hidden="true">
            {[BLUE_TONE, TEAL_TONE, ORANGE_TONE, PINK_TONE].map((style, index) => (
              <span
                key={index}
                className="flex h-12 items-end rounded-[0.85rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] p-2"
                style={style}
              >
                <span className="h-1 w-full rounded-full bg-[var(--changelog-accent)] opacity-40" />
              </span>
            ))}
          </div>
          <p className="text-label-12 text-[var(--secondary-text-color)]">
            Release notes stay structured, searchable, and tied to shipped work.
          </p>
        </div>
      </div>
    </PublicCard>
  );
}

export default function ChangelogPage() {
  return (
    <PublicPageShell mainClassName="bg-[linear-gradient(180deg,var(--primary-background-color)_0%,var(--allgrey-background-color)_24%,var(--primary-background-color)_58%,var(--allgrey-background-color)_100%)]">
      <PublicHero
        topSlot={<PublicBackLink href="/" />}
        title="Changelog"
        description="Product updates, fixes, and rollout notes in a structured release log for teams tracking what changed."
        aside={<ReleaseDesk />}
      />

      <PublicSection
        eyebrow="Latest"
        title="A release log built like an operations board."
        description="Each update is grouped by workflow area so product, agency, and support teams can scan changes without digging through prose."
        surface="surface"
      >
        <div className="space-y-5">
          <ReleaseSnapshot />
          <LatestReleaseBoard />
        </div>
      </PublicSection>

      <PublicSection
        eyebrow="Labels"
        title="Clear change types for every shipped note."
        surface="canvas"
      >
        <ChangeTypeBoard />
      </PublicSection>

      <PublicSection surface="surface">
        <ReleaseCta />
      </PublicSection>
    </PublicPageShell>
  );
}

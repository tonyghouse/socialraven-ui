import type { Metadata } from "next";
import {
  Check,
  Email,
  Locked,
  RecycleBin,
  Search,
  Security,
} from "@vibe/icons";
import type { CSSProperties, ComponentType, SVGAttributes } from "react";

import {
  PublicBackLink,
  PublicPrimaryLinkButton,
  PublicSectionMessage,
  PublicSubtleLinkButton,
  PublicTag,
} from "@/components/public/public-site-primitives";
import {
  PublicCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
} from "@/components/public/public-layout";

export const metadata: Metadata = {
  title: "Meta Data Deletion | Social Raven",
  description:
    "How Social Raven handles deletion requests related to Meta-connected accounts.",
};

type VibeIcon = ComponentType<SVGAttributes<SVGElement>>;
type DeletionAccentStyle = CSSProperties & {
  "--deletion-accent": string;
  "--deletion-accent-soft": string;
};

const createAccentStyle = (colorToken: string): DeletionAccentStyle => ({
  "--deletion-accent": colorToken,
  "--deletion-accent-soft": `color-mix(in srgb, ${colorToken} 6%, var(--primary-background-color))`,
});

const BLUE_ACCENT = createAccentStyle("var(--primary-color)");
const ORANGE_ACCENT = createAccentStyle("var(--color-working_orange)");
const PINK_ACCENT = createAccentStyle("var(--color-bazooka)");

const TOC = [
  { id: "what-happens-next", label: "What happens next" },
  { id: "deletion-process", label: "Deletion process" },
  { id: "privacy-requests", label: "Privacy requests" },
];

const DELETION_STEPS = [
  {
    title: "Review the request",
    body: "We verify which Meta connection and Social Raven records are affected.",
    icon: Search,
    style: BLUE_ACCENT,
  },
  {
    title: "Remove related data",
    body: "This usually includes OAuth credentials and the account linkage for the affected integration.",
    icon: RecycleBin,
    style: PINK_ACCENT,
  },
  {
    title: "Follow up if needed",
    body: "If we need more information to identify the right records, we contact you using the details on file.",
    icon: Email,
    style: ORANGE_ACCENT,
  },
];

function WorkflowIcon({
  icon: Icon,
  style,
}: {
  icon: VibeIcon;
  style: DeletionAccentStyle;
}) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] text-[var(--deletion-accent)]"
      style={style}
    >
      <Icon className="h-4 w-4 opacity-75" />
    </span>
  );
}

function DeletionWorkflowBoard() {
  return (
    <PublicCard className="depth-soft min-w-0 overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] text-[var(--primary-color)]">
            <Security className="h-4 w-4" />
          </span>
          <div>
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Deletion workflow
            </p>
            <p className="mt-0.5 text-label-14 text-[var(--primary-text-color)]">
              Meta-connected account records
            </p>
          </div>
        </div>
        <span className="h-2 w-2 rounded-full bg-[var(--color-done-green)] opacity-65" />
      </div>

      <div className="bg-[var(--allgrey-background-color)] p-3">
        <div className="overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)]">
          <div className="grid grid-cols-[minmax(0,1fr)_3.25rem] border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-2.5 text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
            <span>Process stage</span>
            <span className="text-right">Step</span>
          </div>
          {DELETION_STEPS.map(({ title, body, style }, index) => (
            <div
              key={title}
              className="grid grid-cols-[0.2rem_minmax(0,1fr)_3.25rem] items-center gap-3 border-b border-[var(--ui-border-color)] px-4 py-3.5 last:border-b-0"
              style={style}
            >
              <span className="h-10 rounded-full bg-[var(--deletion-accent)] opacity-55" />
              <span className="min-w-0">
                <span className="block text-label-14 text-[var(--primary-text-color)]">{title}</span>
                <span className="mt-1 block truncate text-label-12 text-[var(--secondary-text-color)]">
                  {body}
                </span>
              </span>
              <span className="text-right text-label-12 text-[var(--secondary-text-color)]">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PublicCard>
  );
}

function RequestSummary() {
  const summaryRows = [
    { label: "Integration", value: "Meta-connected account" },
    { label: "Request path", value: "Meta or direct email" },
    { label: "Contact", value: "team+privacy@socialraven.io" },
  ];

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-4">
        <PublicCard className="overflow-hidden p-0">
          <div className="flex items-center gap-2.5 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
            <span className="h-2 w-2 rounded-full bg-[var(--primary-color)] opacity-65" />
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Request summary
            </p>
          </div>
          <div className="grid gap-px bg-[var(--ui-border-color)]">
            {summaryRows.map(({ label, value }) => (
              <div key={label} className="bg-[var(--primary-background-color)] px-5 py-4">
                <p className="text-label-12 uppercase tracking-[0.1em] text-[var(--secondary-text-color)]">
                  {label}
                </p>
                <p className="mt-1.5 text-label-14 text-[var(--primary-text-color)] [overflow-wrap:anywhere]">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--ui-border-color)] p-4">
            <PublicSubtleLinkButton href="/privacy-policy">Privacy policy</PublicSubtleLinkButton>
          </div>
        </PublicCard>

        <PublicCard className="overflow-hidden p-0">
          <div className="border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              On this page
            </p>
          </div>
          <nav className="space-y-1 p-3">
            {TOC.map(({ id, label }, index) => {
              const style = [BLUE_ACCENT, PINK_ACCENT, ORANGE_ACCENT][index];

              return (
                <a
                  key={id}
                  href={`#${id}`}
                  className="flex items-center gap-3 rounded-[0.9rem] px-3 py-2.5 text-label-14 text-[var(--secondary-text-color)] transition-colors hover:bg-[var(--deletion-accent-soft)] hover:text-[var(--primary-text-color)]"
                  style={style}
                >
                  <span className="h-6 w-0.5 shrink-0 rounded-full bg-[var(--deletion-accent)] opacity-55" />
                  <span className="w-5 shrink-0 text-label-12 text-[var(--placeholder-color)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{label}</span>
                </a>
              );
            })}
          </nav>
        </PublicCard>
      </div>
    </aside>
  );
}

function MobileContents() {
  return (
    <PublicCard className="mb-5 overflow-hidden p-0 lg:hidden">
      <div className="border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-5 py-3.5">
        <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
          On this page
        </p>
      </div>
      <nav className="grid gap-px bg-[var(--ui-border-color)] sm:grid-cols-3">
        {TOC.map(({ id, label }, index) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex items-start gap-2 bg-[var(--primary-background-color)] px-4 py-3.5 text-label-12 text-[var(--secondary-text-color)]"
          >
            <span className="text-[var(--placeholder-color)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </PublicCard>
  );
}

function SectionHeading({
  index,
  title,
  style,
}: {
  index: number;
  title: string;
  style: DeletionAccentStyle;
}) {
  return (
    <div className="flex items-center gap-3" style={style}>
      <span className="flex h-8 w-8 items-center justify-center rounded-[0.75rem] border border-[var(--ui-border-color)] bg-[var(--deletion-accent-soft)] text-label-12 text-[var(--deletion-accent)]">
        {String(index).padStart(2, "0")}
      </span>
      <h2 className="text-heading-16 text-[var(--primary-text-color)]">{title}</h2>
    </div>
  );
}

function DeletionProcedure() {
  return (
    <PublicCard className="depth-soft min-w-0 overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-6 py-4 md:px-7">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[var(--primary-color)] opacity-65" />
          <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
            Meta compliance
          </p>
        </div>
        <PublicTag text="3-stage procedure" />
      </div>

      <section
        id="what-happens-next"
        className="scroll-mt-24 space-y-5 border-b border-[var(--ui-border-color)] px-6 py-7 md:px-8 md:py-8"
      >
        <SectionHeading index={1} title="What happens next" style={BLUE_ACCENT} />
        <PublicSectionMessage appearance="discovery" title="Meta-originated request">
          <p>
            If Meta sends us a deletion request, we review the affected connection and remove the
            related Social Raven data in line with our retention and legal obligations.
          </p>
        </PublicSectionMessage>
      </section>

      <section
        id="deletion-process"
        className="scroll-mt-24 space-y-5 border-b border-[var(--ui-border-color)] px-6 py-7 md:px-8 md:py-8"
      >
        <SectionHeading index={2} title="Deletion process" style={PINK_ACCENT} />
        <div className="overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)]">
          <div className="grid gap-px bg-[var(--ui-border-color)] md:grid-cols-3">
            {DELETION_STEPS.map(({ title, body, icon, style }, index) => (
              <article
                key={title}
                className="flex min-w-0 flex-col bg-[var(--primary-background-color)]"
                style={style}
              >
                <div className="flex items-center justify-between border-b border-[var(--ui-border-color)] px-4 py-3.5">
                  <span className="flex items-center gap-2.5">
                    <span className="h-7 w-0.5 rounded-full bg-[var(--deletion-accent)] opacity-55" />
                    <span className="text-label-12 text-[var(--secondary-text-color)]">
                      Step {index + 1}
                    </span>
                  </span>
                  <WorkflowIcon icon={icon} style={style} />
                </div>
                <div className="space-y-2 px-4 py-5">
                  <h3 className="text-heading-16 text-[var(--primary-text-color)]">{title}</h3>
                  <p className="text-copy-14 text-[var(--secondary-text-color)]">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="privacy-requests"
        className="scroll-mt-24 space-y-5 px-6 py-7 md:px-8 md:py-8"
      >
        <SectionHeading index={3} title="Direct privacy requests" style={ORANGE_ACCENT} />
        <div className="overflow-hidden rounded-[1rem] border border-[var(--ui-border-color)]">
          <div className="grid gap-px bg-[var(--ui-border-color)] lg:grid-cols-[minmax(0,1fr)_13rem]">
            <div className="bg-[var(--primary-background-color)] px-5 py-5 md:px-6">
              <p className="max-w-2xl text-copy-14 text-[var(--secondary-text-color)]">
                For direct privacy requests, email the privacy team with the subject line{" "}
                <em>&quot;Data Deletion Request&quot;</em>. You can also review our full privacy policy.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <PublicPrimaryLinkButton href="mailto:team+privacy@socialraven.io?subject=Data%20Deletion%20Request">
                  Email privacy team
                </PublicPrimaryLinkButton>
                <PublicSubtleLinkButton href="/privacy-policy">Privacy policy</PublicSubtleLinkButton>
              </div>
            </div>
            <div className="grid content-between bg-[var(--allgrey-background-color)] px-5 py-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] text-[var(--primary-color)]">
                <Locked className="h-4 w-4" />
              </span>
              <div className="mt-5 space-y-2" aria-hidden="true">
                {[BLUE_ACCENT, PINK_ACCENT, ORANGE_ACCENT].map((style, index) => (
                  <span
                    key={index}
                    className="flex h-7 items-center rounded-[0.65rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-2"
                    style={style}
                  >
                    <span className="h-1 w-full rounded-full bg-[var(--deletion-accent)] opacity-40" />
                  </span>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-label-12 text-[var(--secondary-text-color)]">
                <Check className="h-3.5 w-3.5 text-[var(--primary-color)]" />
                Privacy team route
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicCard>
  );
}

export default function MetaDataDeletionPage() {
  return (
    <PublicPageShell mainClassName="bg-[linear-gradient(180deg,var(--primary-background-color)_0%,var(--allgrey-background-color)_24%,var(--primary-background-color)_58%,var(--allgrey-background-color)_100%)]">
      <PublicHero
        topSlot={<PublicBackLink href="/" />}
        title="Meta data deletion"
        description="How Social Raven handles deletion requests related to Meta-connected accounts."
        aside={<DeletionWorkflowBoard />}
      />

      <PublicSection surface="surface">
        <div className="mx-auto items-start lg:grid lg:max-w-[75rem] lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8 xl:gap-10">
          <RequestSummary />
          <div className="min-w-0">
            <MobileContents />
            <DeletionProcedure />
          </div>
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

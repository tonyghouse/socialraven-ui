import type { Metadata } from "next";
import type { CSSProperties, ComponentType, ReactNode, SVGAttributes } from "react";
import {
  Calendar,
  Check,
  CheckList,
  CreditCard,
  Doc,
  Inbox,
  Info,
  MoveArrowRight,
  Status,
  Timeline,
  Undo,
  Warning,
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
  PublicToc,
} from "@/components/public/public-layout";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Refund Policy | Social Raven",
  description:
    "Refund Policy for Social Raven subscriptions, including the 14-day cancellation and refund window, renewal terms, and support contact details.",
};

const TOC = [
  { id: "overview", label: "1. Overview" },
  { id: "trials", label: "2. Free Trials" },
  { id: "renewals", label: "3. Renewals & Cancellations" },
  { id: "eligible", label: "4. Refund Eligibility" },
  { id: "non-refundable", label: "5. Non-Refundable Cases" },
  { id: "consumer-rights", label: "6. Consumer Rights" },
  { id: "requests", label: "7. How To Request a Refund" },
  { id: "timing", label: "8. Timing and Processing" },
];

type VibeIcon = ComponentType<SVGAttributes<SVGElement>>;
type RefundTone = CSSProperties & {
  "--refund-accent": string;
  "--refund-accent-soft": string;
  "--refund-accent-muted": string;
};

const createRefundTone = (colorToken: string): RefundTone => ({
  "--refund-accent": colorToken,
  "--refund-accent-soft": `color-mix(in srgb, ${colorToken} 7%, var(--primary-background-color))`,
  "--refund-accent-muted": `color-mix(in srgb, ${colorToken} 13%, var(--allgrey-background-color))`,
});

const BLUE_TONE = createRefundTone("var(--primary-color)");
const GREEN_TONE = createRefundTone("var(--color-done-green)");
const ORANGE_TONE = createRefundTone("var(--color-working_orange)");
const TEAL_TONE = createRefundTone("var(--color-aquamarine)");
const INDIGO_TONE = createRefundTone("var(--color-indigo)");
const PINK_TONE = createRefundTone("var(--color-bazooka)");

const refundEligibilityItems = [
  "You request cancellation and a refund within 14 calendar days of an initial paid subscription charge or renewal charge, without needing to give a reason.",
  "You were charged more than once for the same billing period.",
  "You were charged after a valid cancellation or during an active trial.",
  "A technical billing error or platform fault prevented initial access to the paid service.",
  "A refund is required under applicable consumer protection law.",
];

const REFUND_SIGNALS = [
  {
    label: "Refund window",
    value: "14 calendar days",
    icon: Undo,
    style: BLUE_TONE,
  },
  {
    label: "Review target",
    value: "5 business days",
    icon: Status,
    style: ORANGE_TONE,
  },
  {
    label: "Processing target",
    value: "14 days",
    icon: Calendar,
    style: GREEN_TONE,
  },
  {
    label: "Billing state",
    value: "Once paid billing is live",
    icon: CreditCard,
    style: INDIGO_TONE,
  },
];

const REFUND_DESK_ITEMS = [
  {
    label: "Standard window",
    value: "Initial or renewal paid charge",
    href: "#overview",
    state: "14 days",
    style: BLUE_TONE,
  },
  {
    label: "Billing errors",
    value: "Duplicate charge or invalid cancellation",
    href: "#eligible",
    state: "Review",
    style: ORANGE_TONE,
  },
  {
    label: "Support route",
    value: "team+support@socialraven.io",
    href: "#requests",
    state: "Email",
    style: TEAL_TONE,
  },
];

const REFUND_FLOW_STEPS = [
  {
    label: "Submit request",
    description: "Send the account email, billing date, amount charged, and issue summary.",
    icon: Inbox,
    style: BLUE_TONE,
  },
  {
    label: "Review eligibility",
    description: "We check the 14-day window, cancellation state, billing error, or legal basis.",
    icon: CheckList,
    style: ORANGE_TONE,
  },
  {
    label: "Cancel period",
    description: "Approved refund requests cancel the relevant paid period.",
    icon: Workflow,
    style: INDIGO_TONE,
  },
  {
    label: "Return funds",
    description: "Approved refunds go back to the original payment method through Paddle.",
    icon: CreditCard,
    style: GREEN_TONE,
  },
];

const sectionClassName = "scroll-mt-24 space-y-5 px-5 py-7 md:px-8 md:py-8";
const compactSectionClassName = "scroll-mt-24 space-y-4 px-5 py-7 md:px-8 md:py-8";
const headingClassName = "text-heading-20 text-[var(--primary-text-color)]";
const copyClassName = "text-copy-14 text-[var(--secondary-text-color)]";
const listClassName =
  "ml-5 list-disc space-y-2 text-copy-14 text-[var(--secondary-text-color)]";
const linkClassName = "text-[var(--primary-color)] underline underline-offset-2";

function RefundIcon({
  icon: Icon,
  style,
}: {
  icon: VibeIcon;
  style: RefundTone;
}) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-[var(--ui-border-color)] bg-[var(--refund-accent-soft)] text-[var(--refund-accent)]"
      style={style}
    >
      <Icon className="h-4 w-4 opacity-85" />
    </span>
  );
}

function PolicySubsectionCard({
  title,
  label = "Policy rule",
  className,
  icon,
  style = BLUE_TONE,
  children,
}: {
  title: string;
  label?: string;
  className?: string;
  icon?: VibeIcon;
  style?: RefundTone;
  children: ReactNode;
}) {
  return (
    <PublicInsetCard className={cn("overflow-hidden p-0", className)} style={style}>
      <div className="flex items-center gap-3 border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-3">
        <span className="h-8 w-0.5 shrink-0 rounded-full bg-[var(--refund-accent)] opacity-65" />
        {icon ? <RefundIcon icon={icon} style={style} /> : null}
        <div className="min-w-0">
          <p className="text-label-12 uppercase tracking-[0.1em] text-[var(--secondary-text-color)]">
            {label}
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

function RefundDesk() {
  return (
    <PublicCard className="depth-soft min-w-0 overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] text-[var(--primary-color)]">
            <Undo className="h-4 w-4" />
          </span>
          <div>
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Refund desk
            </p>
            <p className="mt-0.5 text-label-14 text-[var(--primary-text-color)]">
              Billing rules at a glance
            </p>
          </div>
        </div>
        <span className="h-2 w-2 rounded-full bg-[var(--color-done-green)] opacity-65" />
      </div>

      <div className="bg-[var(--allgrey-background-color)] p-3">
        <div className="overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)]">
          <div className="grid grid-cols-[minmax(0,1fr)_5.25rem] border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-2.5 text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
            <span>Refund area</span>
            <span className="text-right">Rule</span>
          </div>

          {REFUND_DESK_ITEMS.map(({ label, value, href, state, style }) => (
            <a
              key={label}
              href={href}
              className="group grid grid-cols-[0.2rem_minmax(0,1fr)_5.25rem] items-center gap-3 border-b border-[var(--ui-border-color)] px-4 py-3.5 last:border-b-0 hover:bg-[var(--refund-accent-soft)]"
              style={style}
            >
              <span className="h-9 rounded-full bg-[var(--refund-accent)] opacity-55" />
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

function RefundSignalsBoard() {
  return (
    <PublicCard className="overflow-hidden p-0 shadow-none">
      <div className="grid gap-px bg-[var(--ui-border-color)] md:grid-cols-4">
        {REFUND_SIGNALS.map(({ label, value, icon, style }) => (
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
              <RefundIcon icon={icon} style={style} />
            </div>
            <span className="mt-4 block h-1 w-16 rounded-full bg-[var(--refund-accent)] opacity-35" />
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
          <RefundIcon icon={Doc} style={BLUE_TONE} />
          <div className="min-w-0 space-y-2">
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Billing document
            </p>
            <h2 className="text-heading-24 text-[var(--primary-text-color)]">
              Refund rules without buried fine print.
            </h2>
            <p className="max-w-2xl text-copy-14 text-[var(--secondary-text-color)]">
              Structured for customers checking eligibility, request steps, and timing.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[var(--allgrey-background-color)] p-3">
        <div className="h-full overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)]">
          {[
            ["Updated", "April 7, 2026"],
            ["Sections", String(TOC.length).padStart(2, "0")],
            ["Support", "team+support@socialraven.io"],
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

function RefundFlowBoard() {
  return (
    <PublicCard className="overflow-hidden p-0 shadow-none">
      <div className="border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[var(--primary-color)] opacity-65" />
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Refund workflow
            </p>
          </div>
          <span className="text-label-12 text-[var(--secondary-text-color)]">
            Request to payout
          </span>
        </div>
      </div>

      <div className="grid gap-px bg-[var(--ui-border-color)] lg:grid-cols-4">
        {REFUND_FLOW_STEPS.map(({ label, description, icon, style }, index) => (
          <div
            key={label}
            className="grid grid-cols-[0.2rem_minmax(0,1fr)] gap-4 bg-[var(--primary-background-color)] px-5 py-5"
            style={style}
          >
            <span className="h-full min-h-20 rounded-full bg-[var(--refund-accent)] opacity-55" />
            <div className="min-w-0 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
                    Step {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-heading-16 text-[var(--primary-text-color)]">{label}</h3>
                </div>
                <RefundIcon icon={icon} style={style} />
              </div>
              <p className="text-copy-13 text-[var(--secondary-text-color)]">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </PublicCard>
  );
}

function EligibilityBoard() {
  return (
    <div className="overflow-hidden rounded-[1rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)]">
      <div className="grid grid-cols-[minmax(0,1fr)_6rem] border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-2.5 text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
        <span>Refund condition</span>
        <span className="text-right">Signal</span>
      </div>
      {refundEligibilityItems.map((item, index) => {
        const style = [BLUE_TONE, ORANGE_TONE, TEAL_TONE, PINK_TONE, GREEN_TONE][index];

        return (
          <div
            key={item}
            className="grid grid-cols-[0.2rem_minmax(0,1fr)_6rem] items-center gap-3 border-b border-[var(--ui-border-color)] px-4 py-3.5 last:border-b-0"
            style={style}
          >
            <span className="h-8 rounded-full bg-[var(--refund-accent)] opacity-55" />
            <span className="text-copy-13 text-[var(--secondary-text-color)]">{item}</span>
            <span className="flex justify-end">
              <span className="flex h-7 w-7 items-center justify-center rounded-[0.7rem] border border-[var(--ui-border-color)] bg-[var(--refund-accent-soft)] text-[var(--refund-accent)]">
                <Check className="h-3.5 w-3.5" />
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SupportPanel() {
  return (
    <PublicCard className="overflow-hidden p-0">
      <div className="bg-[var(--primary-background-color)]">
        <div className="bg-[var(--primary-background-color)] px-7 py-7 md:px-8">
          <div className="flex items-start gap-4">
            <RefundIcon icon={Inbox} style={BLUE_TONE} />
            <div className="space-y-2">
              <p className="text-heading-16 text-[var(--primary-text-color)]">
                Need help with a billing issue?
              </p>
              <p className="max-w-2xl text-copy-14 text-[var(--secondary-text-color)]">
                Send the account email, billing date, amount charged, and a short explanation so
                support can review eligibility without a long back-and-forth.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <PublicPrimaryLinkButton href="mailto:team+support@socialraven.io">
              Contact support
            </PublicPrimaryLinkButton>
            <PublicSubtleLinkButton href="/pricing">View pricing</PublicSubtleLinkButton>
          </div>
        </div>
      </div>
    </PublicCard>
  );
}

export default function RefundPolicyPage() {
  return (
    <PublicPageShell mainClassName="bg-[linear-gradient(180deg,var(--primary-background-color)_0%,var(--allgrey-background-color)_24%,var(--primary-background-color)_58%,var(--allgrey-background-color)_100%)]">
      <PublicHero
        topSlot={<PublicBackLink href="/" />}
        title="Refund Policy"
        meta={
          <>
            Last updated:{" "}
            <span className="font-medium text-[var(--primary-text-color)]">April 7, 2026</span>
          </>
        }
        description="How SocialRaven handles subscription cancellations, renewal charges, and the 14-day refund window once paid billing is enabled."
        actions={
          <>
            <PublicPrimaryLinkButton href="mailto:team+support@socialraven.io">
              Contact support
            </PublicPrimaryLinkButton>
            <PublicSubtleLinkButton href="/pricing">View pricing</PublicSubtleLinkButton>
          </>
        }
        aside={<RefundDesk />}
      />

      <PublicSection
        eyebrow="Billing policy workspace"
        title="Refund windows, eligibility, and request flow."
        description="A structured view of when refunds apply, when they usually do not, and how customers can route a billing issue."
        surface="surface"
      >
        <div className="space-y-6">
          <RefundSignalsBoard />
          <RefundFlowBoard />
          <MobilePolicyIndex />

          <div className="items-start lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8 xl:gap-10">
            <PublicToc items={TOC} />

            <PublicCard className="depth-soft min-w-0 overflow-hidden p-0">
              <PolicyDocumentHeader />
              <div className="divide-y divide-[var(--ui-border-color)]">
                <section id="overview" className={sectionClassName}>
                  <h2 className={headingClassName}>1. Overview</h2>
                  <p className={copyClassName}>
                    This policy applies to paid SocialRaven subscriptions once public paid billing
                    is enabled and purchases are processed through our checkout flow.
                  </p>
                  <PublicSectionMessage appearance="discovery">
                    <p>
                      SocialRaven will offer a minimum 14-day cancellation and refund window for
                      paid subscription charges processed through Paddle. If you request a refund
                      within 14 calendar days of a paid charge, you do not need to give a reason.
                    </p>
                  </PublicSectionMessage>
                </section>

                <section id="trials" className={sectionClassName}>
                  <h2 className={headingClassName}>2. Free Trials</h2>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <PolicySubsectionCard title="Trial access" icon={CheckList} style={BLUE_TONE}>
                      <p>
                        Eligible plans may include a free trial. Trial signup is currently offered
                        without payment details in the public self-serve flow.
                      </p>
                    </PolicySubsectionCard>
                    <PolicySubsectionCard
                      title="Trial-to-paid charges"
                      icon={CreditCard}
                      style={ORANGE_TONE}
                    >
                      <p>
                        If paid billing is enabled later, any trial-to-paid transition terms will
                        be shown clearly before a charge is taken. If a charge is taken contrary to
                        the published trial terms, contact us and we will investigate it as a
                        priority refund case.
                      </p>
                    </PolicySubsectionCard>
                  </div>
                </section>

                <section id="renewals" className={sectionClassName}>
                  <h2 className={headingClassName}>3. Renewals &amp; Cancellations</h2>
                  <div className="grid gap-4 xl:grid-cols-3">
                    <PolicySubsectionCard title="Auto-renewal" icon={Timeline} style={INDIGO_TONE}>
                      <p>
                        Once paid subscriptions are enabled, they renew automatically on the billing
                        cycle selected at checkout unless you cancel before the renewal date.
                      </p>
                    </PolicySubsectionCard>
                    <PolicySubsectionCard title="Cancellation" icon={Undo} style={TEAL_TONE}>
                      <p>
                        You may cancel a paid subscription at any time to stop future renewals. If
                        you cancel without requesting a refund, access remains active until the end
                        of the current paid period unless we state otherwise in writing.
                      </p>
                    </PolicySubsectionCard>
                    <PolicySubsectionCard title="Refund request" icon={Status} style={GREEN_TONE}>
                      <p>
                        If you request a refund within 14 calendar days of an initial paid
                        subscription charge or a renewal charge, we will treat that request as a
                        cancellation of the relevant paid period and issue a refund to the original
                        payment method.
                      </p>
                    </PolicySubsectionCard>
                  </div>
                </section>

                <section id="eligible" className={sectionClassName}>
                  <h2 className={headingClassName}>4. Refund Eligibility</h2>
                  <p className={copyClassName}>
                    Refunds are generally considered in the following situations:
                  </p>
                  <EligibilityBoard />
                </section>

                <section id="non-refundable" className={sectionClassName}>
                  <h2 className={headingClassName}>5. Non-Refundable Cases</h2>
                  <p className={copyClassName}>
                    After the 14-day refund window has passed, refunds are generally not provided
                    for the following paid billing cases unless required by law:
                  </p>
                  <PolicySubsectionCard
                    title="Usually not refundable after the window"
                    icon={Warning}
                    style={PINK_TONE}
                  >
                    <ul className={listClassName}>
                      <li>
                        Unused time remaining in a monthly or annual billing period after the
                        14-day refund window;
                      </li>
                      <li>Failure to cancel before the next renewal date;</li>
                      <li>Account suspension or termination due to Terms of Service violations.</li>
                    </ul>
                  </PolicySubsectionCard>
                </section>

                <section id="consumer-rights" className={compactSectionClassName}>
                  <h2 className={headingClassName}>6. Consumer Rights</h2>
                  <PublicSectionMessage appearance="information">
                    <p>
                      Nothing in this policy limits any non-waivable rights you may have under local
                      consumer law, including statutory withdrawal or cooling-off rights where they
                      apply.
                    </p>
                    <p>
                      If local law or Paddle&apos;s buyer-facing refund rules give you a stronger
                      refund entitlement than this policy, we will honor the higher standard.
                    </p>
                  </PublicSectionMessage>
                </section>

                <section id="requests" className={sectionClassName}>
                  <h2 className={headingClassName}>7. How To Request a Refund</h2>
                  <PolicySubsectionCard title="Support request" icon={Inbox} style={BLUE_TONE}>
                    <p>
                      To request a refund, email{" "}
                      <a href="mailto:team+support@socialraven.io" className={linkClassName}>
                        team+support@socialraven.io
                      </a>{" "}
                      with your account email, billing date, amount charged, and a short
                      explanation of the issue.
                    </p>
                  </PolicySubsectionCard>
                  <p className={copyClassName}>
                    Once Paddle billing is live, you may also use the Paddle receipt or
                    subscription management link to request cancellation or a refund. To use the
                    standard 14-day refund window, submit the request within 14 calendar days of
                    the charge.
                  </p>
                </section>

                <section id="timing" className={sectionClassName}>
                  <h2 className={headingClassName}>8. Timing and Processing</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <PolicySubsectionCard title="Review timing" icon={Info} style={ORANGE_TONE}>
                      <p>
                        We aim to review refund requests within 5 business days. Once paid billing
                        is enabled, any approved refunds will be issued back to the original
                        payment method through Paddle.
                      </p>
                    </PolicySubsectionCard>
                    <PolicySubsectionCard
                      title="Processing timing"
                      icon={Calendar}
                      style={GREEN_TONE}
                    >
                      <p>
                        Once approved, refunds are generally processed within 14 days. The time it
                        takes for funds to appear depends on your bank, card issuer, or payment
                        method provider.
                      </p>
                    </PolicySubsectionCard>
                  </div>
                </section>
              </div>
            </PublicCard>
          </div>
        </div>
      </PublicSection>

      <PublicSection surface="canvas">
        <SupportPanel />
      </PublicSection>
    </PublicPageShell>
  );
}

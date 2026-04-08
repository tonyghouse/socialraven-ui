"use client";

import { useUser } from "@clerk/nextjs";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/navbar/navbar";
import { PricingGrid } from "@/components/public/pricing-grid";
import { PublicSiteFooter } from "@/components/public/public-site-footer";

const INTEGRATIONS = [
  { name: "Instagram", icon: Instagram },
  { name: "X / Twitter", icon: Twitter },
  { name: "LinkedIn", icon: Linkedin },
  { name: "YouTube", icon: Youtube },
  { name: "Facebook", icon: Facebook },
];

const STATS = [
  { value: "5", label: "Supported platforms", detail: "Instagram, X, LinkedIn, YouTube, and Facebook" },
  { value: "3", label: "Post types", detail: "Plan image, video, and text posts from one workspace" },
  { value: "OAuth", label: "Secure connections", detail: "Accounts are linked through official authorization flows" },
  { value: "Review", label: "Approval workflows", detail: "Built for review links, handoff, and team publishing" },
];

const FEATURES = [
  {
    title: "Scheduling Workspace",
    description:
      "Plan campaigns on a shared calendar, organize batches, and keep publishing work visible before anything goes live.",
    meta: "Planning",
  },
  {
    title: "Auto Posting",
    description:
      "Create once and schedule across supported platforms using connected official APIs and one central workflow.",
    meta: "Automation",
  },
  {
    title: "Review & Approvals",
    description:
      "Share review links, collect decisions, and keep internal and client-facing publishing steps aligned.",
    meta: "Workflow",
  },
  {
    title: "Analytics & History",
    description:
      "Monitor post history and workspace reporting without jumping between multiple tools or dashboards.",
    meta: "Reporting",
  },
  {
    title: "Multi-Account Management",
    description:
      "Organize brands, workspaces, and connected profiles in one place for agencies and multi-brand teams.",
    meta: "Scale",
  },
  {
    title: "Security & Access",
    description:
      "OAuth-secured connections and workspace-based access controls support accountable day-to-day operations.",
    meta: "Trust",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Connect your accounts",
    description: "Link Instagram, LinkedIn, X, YouTube, and Facebook in seconds. OAuth-secured and simple to manage.",
  },
  {
    step: "02",
    title: "Create your content",
    description: "Upload media, write captions, and schedule to multiple platforms in one flow.",
  },
  {
    step: "03",
    title: "Let it run",
    description: "Approved posts go live on schedule. Track publish status and review history from your workspace.",
  },
];

const WORKFLOWS = [
  {
    title: "Weekly planning",
    description:
      "Build a content queue, group related posts, and keep campaign work organized before publish day.",
    tone: "information" as const,
  },
  {
    title: "Client review",
    description:
      "Share review links, collect approvals, and keep stakeholders out of internal workspaces when needed.",
    tone: "success" as const,
  },
  {
    title: "Agency operations",
    description:
      "Manage multiple brands and connected accounts from one place without losing context or handoff history.",
    tone: "discovery" as const,
  },
];

const FAQ = [
  {
    question: "Is Social Raven GDPR compliant?",
    answer:
      "Social Raven uses privacy-conscious practices, scoped OAuth permissions, and clear public policy pages for how account and billing data are handled.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "Start with a trial workspace with no credit card required. Public paid self-serve billing is still being finalized, and current plan prices are listed on the pricing page.",
  },
  {
    question: "Does SocialRaven generate images or videos?",
    answer:
      "No. SocialRaven is a scheduling and publishing platform. Users upload their own images or videos, write their own captions, and SocialRaven stores, schedules, and publishes that content through supported social platform APIs.",
  },
  {
    question: "Which social platforms are supported?",
    answer:
      "We currently support Instagram, Twitter/X, LinkedIn, YouTube, and Facebook. More platforms are on the way.",
  },
  {
    question: "Can I manage multiple clients from one account?",
    answer:
      "Absolutely. Our Pro and Agency plans are designed for agencies, manage all your clients from a single dashboard.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Trial workspaces can be closed at any time. Paid cancellation and renewal terms are documented on our pricing, terms, and refund pages and apply once paid billing is enabled.",
  },
];

const sectionEyebrowClassName = "text-label-12 text-[var(--ds-gray-900)]";
const sectionTitleClassName = "mt-3 text-heading-32 text-[var(--ds-gray-1000)]";
const primaryActionClassName =
  "inline-flex h-10 items-center justify-center rounded-md bg-[var(--ds-blue-600)] px-4 text-label-14 text-white transition-colors duration-150 hover:bg-[var(--ds-blue-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2";
const secondaryActionClassName =
  "inline-flex h-10 items-center justify-center rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 text-label-14 text-[var(--ds-gray-1000)] transition-colors duration-150 hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2";

function SurfaceCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] transition-colors duration-150 ${className}`}
    >
      {children}
    </div>
  );
}

function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "accent" | "success" | "neutral";
}) {
  const toneClass = {
    accent:
      "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
    success:
      "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
    neutral:
      "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]",
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-label-12 ${toneClass}`}
    >
      {children}
    </span>
  );
}

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) return null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]">
        <main>
          {/* Hero */}
          <section className="border-b border-[var(--ds-gray-400)] bg-[linear-gradient(180deg,var(--ds-background-100)_0%,var(--ds-background-200)_100%)] pt-24 pb-16 lg:pb-20">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_1fr] lg:items-stretch">
                <div className="flex h-full flex-col justify-center space-y-7 text-center lg:pr-4 lg:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                    <StatusPill tone="accent">Official API connections</StatusPill>
                    <StatusPill tone="neutral">14-day Pro trial</StatusPill>
                  </div>

                  <div className="space-y-4">
                    <h1 className="max-w-4xl text-5xl leading-[0.98] font-bold tracking-[-0.05em] text-[var(--ds-gray-1000)] md:text-6xl lg:text-6xl">
                      Your social media,
                      <br />
                      <span className="text-[var(--ds-blue-600)]">on autopilot.</span>
                    </h1>
                    <p className="max-w-2xl text-copy-16 text-[var(--ds-gray-900)]">
                      Schedule, publish, review, and track content across your social channels from one workspace.
                      Built for creators, agencies, and teams running recurring publishing operations.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                    <Link
                      href="/sign-up"
                      className={primaryActionClassName}
                    >
                      Start free, no card needed
                    </Link>
                    <button
                      onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                      className={secondaryActionClassName}
                    >
                      See how it works
                    </button>
                  </div>

                  <p className="text-copy-13 text-[var(--ds-gray-900)]">
                    14-day Pro trial · No credit card · GDPR compliant
                  </p>
                </div>

                <div className="flex h-full lg:pl-4">
                  <SurfaceCard className="flex h-full w-full flex-col overflow-hidden bg-[var(--ds-gray-100)]">
                    <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={sectionEyebrowClassName}>
                            Campaign overview
                          </p>
                          <h2 className="mt-1 text-heading-16">Q2 content operations</h2>
                        </div>
                        <StatusPill tone="success">Live publishing</StatusPill>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col space-y-4 p-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        {[
                          { label: "Scheduled this week", value: "48" },
                          { label: "Pending approval", value: "07" },
                          { label: "Accounts connected", value: "12" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4"
                          >
                            <p className="text-label-12 text-[var(--ds-gray-900)]">{item.label}</p>
                            <p className="mt-2 text-heading-24">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-heading-16">Workflow status</p>
                              <p className="mt-1 text-copy-13 text-[var(--ds-gray-900)]">Last 7 days</p>
                            </div>
                            <StatusPill tone="success">Stable</StatusPill>
                          </div>
                          <div className="mt-4 space-y-3">
                            {[
                              { label: "Content prepared", value: 82 },
                              { label: "Approvals cleared", value: 67 },
                              { label: "Queue ready", value: 91 },
                            ].map((metric) => (
                              <div key={metric.label}>
                                <div className="mb-1.5 flex items-center justify-between">
                                  <span className="text-label-13 text-[var(--ds-gray-900)]">{metric.label}</span>
                                  <span className="text-label-13 text-[var(--ds-gray-1000)]">{metric.value}%</span>
                                </div>
                                <div
                                  role="progressbar"
                                  aria-label={metric.label}
                                  aria-valuenow={metric.value}
                                  aria-valuemax={100}
                                  className="h-1.5 w-full rounded-full bg-[var(--ds-gray-200)]"
                                >
                                  <div
                                    className="h-full rounded-full bg-[var(--ds-blue-600)] transition-[width] duration-500"
                                    style={{ width: `${metric.value}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4">
                          <p className="text-heading-16">Next scheduled publish</p>
                          <p className="mt-1 text-copy-13 text-[var(--ds-gray-900)]">
                            Today, 7:30 PM IST
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {INTEGRATIONS.slice(0, 4).map(({ name, icon: Icon }) => (
                              <div
                                key={name}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                                title={name}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                            ))}
                          </div>

                          <hr className="my-3.5 border-t border-[var(--ds-gray-400)]" />

                          <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-3.5">
                            <p className="text-label-12 text-[var(--ds-gray-900)]">
                              Review status
                            </p>
                            <p className="mt-1 text-copy-13 text-[var(--ds-gray-900)]">
                              Internal review complete. The next publishing window is queued across connected accounts.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SurfaceCard>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-200)] py-14">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="grid gap-4 md:grid-cols-4">
                {STATS.map((item) => (
                  <SurfaceCard key={item.label} className="p-6">
                    <p className="text-heading-32 text-[var(--ds-gray-1000)]">{item.value}</p>
                    <p className="mt-2 text-label-14 text-[var(--ds-gray-1000)]">{item.label}</p>
                    <p className="mt-2 text-copy-13 text-[var(--ds-gray-900)]">{item.detail}</p>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </section>

          {/* Integrations */}
          <section id="integrations" className="bg-[var(--ds-background-100)] py-16">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="mx-auto max-w-3xl text-center">
                <p className={sectionEyebrowClassName}>
                  Works with your platforms
                </p>
                <h2 className={sectionTitleClassName}>
                  Connect the channels your team already uses.
                </h2>
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {INTEGRATIONS.map(({ name, icon: Icon }) => (
                  <SurfaceCard
                    key={name}
                    className="flex items-center gap-3 rounded-full bg-[var(--ds-gray-100)] px-4 py-3"
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]"
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-label-14 text-[var(--ds-gray-1000)]">{name}</span>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="border-y border-[var(--ds-gray-400)] bg-[var(--ds-background-200)] py-20">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="mb-12 max-w-2xl">
                <p className={sectionEyebrowClassName}>
                  Features
                </p>
                <h2 className={sectionTitleClassName}>
                  Built for speed.
                  <br />
                  Designed for growth.
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {FEATURES.map((feature, index) => (
                  <SurfaceCard key={feature.title} className="bg-[var(--ds-background-100)] p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-label-12 text-[var(--ds-gray-900)]">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-3 text-heading-16">{feature.title}</h3>
                      </div>
                      <StatusPill tone="accent">{feature.meta}</StatusPill>
                    </div>
                    <p className="mt-4 text-copy-14 text-[var(--ds-gray-900)]">
                      {feature.description}
                    </p>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="how-it-works" className="bg-[var(--ds-background-100)] py-20">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="mb-12 max-w-2xl">
                <p className={sectionEyebrowClassName}>
                  How it works
                </p>
                <h2 className={sectionTitleClassName}>
                  Up and running in minutes
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {STEPS.map((step) => (
                  <SurfaceCard key={step.step} className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-heading-24 text-[var(--ds-blue-600)]">{step.step}</span>
                      <StatusPill tone="accent">Guided flow</StatusPill>
                    </div>
                    <h3 className="mt-6 text-heading-16">{step.title}</h3>
                    <p className="mt-3 text-copy-14 text-[var(--ds-gray-900)]">{step.description}</p>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </section>

          {/* Workflows */}
          <section className="border-y border-[var(--ds-gray-400)] bg-[var(--ds-background-200)] py-20">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="mb-12 max-w-2xl">
                <p className={sectionEyebrowClassName}>
                  Workflows
                </p>
                <h2 className={sectionTitleClassName}>
                  Built for the way content teams actually operate.
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {WORKFLOWS.map((item) => (
                  <SurfaceCard key={item.title} className="p-6">
                    <StatusPill tone={item.tone === "success" ? "success" : "accent"}>Common workflow</StatusPill>
                    <p className="mt-5 text-copy-14 text-[var(--ds-gray-900)]">
                      {item.description}
                    </p>
                    <p className="mt-6 text-label-14 text-[var(--ds-gray-1000)]">{item.title}</p>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="bg-[var(--ds-background-100)] py-20">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="mb-6 max-w-2xl">
                <p className={sectionEyebrowClassName}>
                  Pricing
                </p>
                <h2 className={sectionTitleClassName}>
                  Simple, transparent pricing
                </h2>
              </div>

              <div className="rounded-xl border border-[var(--ds-blue-300)] bg-[var(--ds-blue-100)] px-5 py-4">
                <p className="text-label-14 text-[var(--ds-gray-1000)]">
                  All plans include a 14-day free trial
                </p>
                <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                  Start free and upgrade when you are ready.
                </p>
              </div>

              <div className="mt-6">
                <PricingGrid />
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="border-y border-[var(--ds-gray-400)] bg-[var(--ds-background-200)] py-20">
            <div className="container mx-auto max-w-3xl px-6">
              <div className="text-center">
                <p className={sectionEyebrowClassName}>
                  FAQ
                </p>
                <h2 className={sectionTitleClassName}>
                  Common questions from teams evaluating the platform.
                </h2>
              </div>

              <div className="mt-10 space-y-3">
                {FAQ.map((item, index) => {
                  const isOpen = openFaq === index;

                  return (
                    <SurfaceCard key={item.question} className="overflow-hidden bg-[var(--ds-background-100)]">
                      <button
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-[var(--ds-gray-100)]"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                      >
                        <span className="text-label-14 text-[var(--ds-gray-1000)]">{item.question}</span>
                        {isOpen ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[var(--ds-gray-900)]" aria-hidden="true">
                            <path d="M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[var(--ds-gray-900)]" aria-hidden="true">
                            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </button>
                      {isOpen && (
                        <div className="border-t border-[var(--ds-gray-400)] px-5 py-4 text-copy-14 text-[var(--ds-gray-900)]">
                          {item.answer}
                        </div>
                      )}
                    </SurfaceCard>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="border-t border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] py-24">
            <div className="container mx-auto max-w-5xl px-6">
              <div className="rounded-xl border border-[var(--ds-blue-300)] bg-[linear-gradient(180deg,var(--ds-background-100)_0%,var(--ds-blue-100)_100%)] p-8 md:p-10">
                <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <span className="inline-flex items-center rounded-full border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] px-2.5 py-1 text-label-12 text-[var(--ds-blue-700)]">
                      Clear pricing and policy pages
                    </span>
                    <h2 className="mt-5 text-heading-32 text-[var(--ds-gray-1000)]">
                      Start planning in one workspace.
                    </h2>
                    <p className="mt-4 max-w-2xl text-copy-16 text-[var(--ds-gray-900)]">
                      Connect accounts, review the public pricing and policy pages, and see whether SocialRaven fits your publishing workflow.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 md:items-end">
                    <Link
                      href="/sign-up"
                      className={primaryActionClassName}
                    >
                      Get started for free
                    </Link>
                    <Link
                      href="/contact"
                      className={secondaryActionClassName}
                    >
                      Talk to sales
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <PublicSiteFooter />
      </div>
    </>
  );
}

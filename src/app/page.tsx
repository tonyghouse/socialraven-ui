"use client";

import AtlassianButton, { LinkButton } from "@atlaskit/button/new";
import ProgressBar from "@atlaskit/progress-bar";
import { useUser } from "@clerk/nextjs";
import {
  Facebook,
  Instagram,
  Linkedin,
  Minus,
  Plus,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/navbar/navbar";
import { PricingGrid } from "@/components/public/pricing-grid";
import { PublicSiteFooter } from "@/components/public/public-site-footer";
import { Separator } from "@/components/ui/separator";

const INTEGRATIONS = [
  { name: "Instagram", icon: Instagram, tint: "text-pink-600", surface: "bg-pink-50 dark:bg-pink-500/10" },
  { name: "X / Twitter", icon: Twitter, tint: "text-slate-700 dark:text-slate-200", surface: "bg-slate-100 dark:bg-slate-500/10" },
  { name: "LinkedIn", icon: Linkedin, tint: "text-blue-700", surface: "bg-blue-50 dark:bg-blue-500/10" },
  { name: "YouTube", icon: Youtube, tint: "text-red-600", surface: "bg-red-50 dark:bg-red-500/10" },
  { name: "Facebook", icon: Facebook, tint: "text-blue-600", surface: "bg-blue-50 dark:bg-blue-500/10" },
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

function SurfaceCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] ${className}`}
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
      "border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]",
    success:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    neutral:
      "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]",
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium leading-4 ${toneClass}`}
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

      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <main>
          <section className="border-b border-[hsl(var(--border-subtle))] bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--surface-sunken))_100%)] pt-24 pb-16 lg:pb-20">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_1fr] lg:items-stretch">
                <div className="flex h-full flex-col justify-center space-y-7 text-center lg:pr-4 lg:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                    <StatusPill tone="accent">Official API connections</StatusPill>
                    <StatusPill tone="neutral">14-day Pro trial</StatusPill>
                  </div>

                  <div className="space-y-4">
                    <h1 className="max-w-3xl text-[2.5rem] leading-[2.75rem] font-bold tracking-[-0.025em] text-[hsl(var(--foreground))] md:text-[3rem] md:leading-[3.25rem] lg:text-[3.5rem] lg:leading-[3.75rem]">
                      Your social media,
                      <br />
                      <span className="text-[hsl(var(--accent))]">on autopilot.</span>
                    </h1>
                    <p className="max-w-2xl text-sm leading-5 text-[hsl(var(--foreground-muted))] md:text-[0.875rem] md:leading-5">
                      Schedule, publish, review, and track content across your social channels from one workspace.
                      Built for creators, agencies, and teams running recurring publishing operations.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                    <LinkButton appearance="primary" href="/sign-up">
                      Start free, no card needed
                    </LinkButton>
                    <AtlassianButton
                      appearance="subtle"
                      onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      See how it works
                    </AtlassianButton>
                  </div>

                  <p className="text-xs leading-4 text-[hsl(var(--foreground-muted))]">
                    14-day Pro trial · No credit card · GDPR compliant
                  </p>
                </div>

                <div className="flex h-full lg:pl-4">
                  <SurfaceCard className="flex h-full w-full flex-col overflow-hidden shadow-sm">
                    <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-3.5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                            Campaign overview
                          </p>
                          <h2 className="mt-1 text-base leading-5 font-bold tracking-[-0.01em]">Q2 content operations</h2>
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
                            className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-3.5"
                          >
                            <p className="text-xs leading-4 text-[hsl(var(--foreground-muted))]">{item.label}</p>
                            <p className="mt-1.5 text-[1.5rem] leading-7 font-bold tracking-[-0.02em]">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold leading-5">Workflow status</p>
                              <p className="text-xs leading-4 text-[hsl(var(--foreground-muted))]">Last 7 days</p>
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
                                <div className="mb-2 flex items-center justify-between text-sm leading-5">
                                  <span className="text-[hsl(var(--foreground-muted))]">{metric.label}</span>
                                  <span className="font-medium text-[hsl(var(--foreground))]">{metric.value}%</span>
                                </div>
                                <ProgressBar ariaLabel={metric.label} value={metric.value} appearance="default" />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] p-4">
                          <p className="text-sm font-bold leading-5">Next scheduled publish</p>
                          <p className="mt-1 text-xs leading-4 text-[hsl(var(--foreground-muted))]">
                            Today, 7:30 PM IST
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {INTEGRATIONS.slice(0, 4).map(({ name, icon: Icon, tint, surface }) => (
                              <div
                                key={name}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] ${surface}`}
                                title={name}
                              >
                                <Icon className={`h-4 w-4 ${tint}`} />
                              </div>
                            ))}
                          </div>

                          <Separator className="my-3.5 bg-[hsl(var(--border-subtle))]" />

                          <div className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] p-3">
                            <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                              Review status
                            </p>
                            <p className="mt-1 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
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

          <section className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] py-12">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="grid gap-4 md:grid-cols-4">
                {STATS.map((item) => (
                  <SurfaceCard key={item.label} className="p-5">
                    <p className="text-[1.5rem] leading-7 font-bold tracking-[-0.02em] text-[hsl(var(--foreground))]">{item.value}</p>
                    <p className="mt-2 text-sm font-medium leading-5 text-[hsl(var(--foreground))]">{item.label}</p>
                    <p className="mt-1 text-sm leading-5 text-[hsl(var(--foreground-muted))]">{item.detail}</p>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </section>

          <section id="integrations" className="bg-[hsl(var(--background))] py-16">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                  Works with your platforms
                </p>
                <h2 className="mt-3 text-[1.5rem] leading-7 font-bold tracking-[-0.02em] md:text-[1.5rem] md:leading-7">
                  Connect the channels your team already uses.
                </h2>
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {INTEGRATIONS.map(({ name, icon: Icon, tint, surface }) => (
                  <SurfaceCard
                    key={name}
                    className="flex items-center gap-3 rounded-full px-4 py-3 shadow-sm"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--border-subtle))] ${surface}`}
                    >
                      <Icon className={`h-4 w-4 ${tint}`} />
                    </div>
                    <span className="text-sm font-medium leading-5 text-[hsl(var(--foreground))]">{name}</span>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </section>

          <section id="features" className="border-y border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] py-20">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="mb-12 max-w-2xl">
                <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                  Features
                </p>
                <h2 className="mt-3 text-[1.5rem] leading-7 font-bold tracking-[-0.02em]">
                  Built for speed.
                  <br />
                  Designed for growth.
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {FEATURES.map((feature, index) => (
                  <SurfaceCard key={feature.title} className="p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-3 text-base leading-5 font-bold tracking-[-0.01em]">{feature.title}</h3>
                      </div>
                      <StatusPill tone="accent">{feature.meta}</StatusPill>
                    </div>
                    <p className="mt-4 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                      {feature.description}
                    </p>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </section>

          <section id="how-it-works" className="bg-[hsl(var(--background))] py-20">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="mb-12 max-w-2xl">
                <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                  How it works
                </p>
                <h2 className="mt-3 text-[1.5rem] leading-7 font-bold tracking-[-0.02em]">
                  Up and running in minutes
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {STEPS.map((step) => (
                  <SurfaceCard key={step.step} className="p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[1.5rem] leading-7 font-bold tracking-[-0.02em] text-[hsl(var(--accent))]">{step.step}</span>
                      <StatusPill tone="accent">Guided flow</StatusPill>
                    </div>
                    <h3 className="mt-6 text-base leading-5 font-bold tracking-[-0.01em]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-5 text-[hsl(var(--foreground-muted))]">{step.description}</p>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </section>

          <section className="border-y border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] py-20">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="mb-12 max-w-2xl">
                <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                  Workflows
                </p>
                <h2 className="mt-3 text-[1.5rem] leading-7 font-bold tracking-[-0.02em]">
                  Built for the way content teams actually operate.
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {WORKFLOWS.map((item) => (
                  <SurfaceCard key={item.title} className="p-6 shadow-sm">
                    <StatusPill tone={item.tone === "success" ? "success" : "accent"}>Common workflow</StatusPill>
                    <p className="mt-5 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                      {item.description}
                    </p>
                    <p className="mt-6 text-sm font-medium leading-5 text-[hsl(var(--foreground))]">{item.title}</p>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </section>

          <section id="pricing" className="bg-[hsl(var(--background))] py-20">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="mb-6 max-w-2xl">
                <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                  Pricing
                </p>
                <h2 className="mt-3 text-[1.5rem] leading-7 font-bold tracking-[-0.02em]">
                  Simple, transparent pricing
                </h2>
              </div>

              <div className="rounded-xl border border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/8 px-5 py-4 text-[hsl(var(--foreground))]">
                <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">
                  All plans include a 14-day free trial
                </p>
                <p className="mt-1 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                  Start free and upgrade when you are ready.
                </p>
              </div>

              <div className="mt-6">
                <PricingGrid />
              </div>
            </div>
          </section>

          <section className="border-y border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] py-20">
            <div className="container mx-auto max-w-3xl px-6">
              <div className="text-center">
                <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                  FAQ
                </p>
                <h2 className="mt-3 text-[1.5rem] leading-7 font-bold tracking-[-0.02em]">
                  Common questions from teams evaluating the platform.
                </h2>
              </div>

              <div className="mt-10 space-y-3">
                {FAQ.map((item, index) => {
                  const isOpen = openFaq === index;

                  return (
                    <SurfaceCard key={item.question} className="overflow-hidden shadow-sm">
                      <button
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                      >
                        <span className="text-sm font-medium leading-5 text-[hsl(var(--foreground))]">{item.question}</span>
                        {isOpen ? (
                          <Minus className="h-4 w-4 shrink-0 text-[hsl(var(--foreground-muted))]" />
                        ) : (
                          <Plus className="h-4 w-4 shrink-0 text-[hsl(var(--foreground-muted))]" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="border-t border-[hsl(var(--border-subtle))] px-5 py-4 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                          {item.answer}
                        </div>
                      )}
                    </SurfaceCard>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="bg-[#172B4D] py-24 text-white">
            <div className="container mx-auto max-w-5xl px-6">
              <div className="rounded-xl border border-white/15 bg-white/5 p-8 backdrop-blur-sm md:p-10">
                <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <span className="inline-flex items-center rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium leading-4 text-white/80">
                      Clear pricing and policy pages
                    </span>
                    <h2 className="mt-5 text-[2rem] leading-9 font-bold tracking-[-0.02em]">
                      Start planning in one workspace.
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-5 text-white/70 md:text-[0.875rem] md:leading-5">
                      Connect accounts, review the public pricing and policy pages, and see whether SocialRaven fits your publishing workflow.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 md:items-end">
                    <Link
                      href="/sign-up"
                      className="inline-flex min-h-10 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-[#172B4D] transition-colors hover:bg-white/90"
                    >
                      Get started for free
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
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

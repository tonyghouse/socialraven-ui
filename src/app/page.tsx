"use client";

import Avatar from "@atlaskit/avatar";
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
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/navbar/navbar";
import { PricingGrid } from "@/components/public/pricing-grid";
import { PublicSiteFooter } from "@/components/public/public-site-footer";
import { Separator } from "@/components/ui/separator";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.789-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.312-.883-2.378-.887h-.014c-.765 0-1.829.199-2.593 1.28l-1.64-1.154c1.046-1.489 2.637-2.306 4.526-2.306h.023c3.418.018 5.438 2.107 5.504 5.724.022.036.043.071.063.108.048.086.096.17.14.258.985 1.878.948 5.072-1.261 7.222-1.76 1.717-3.974 2.563-6.738 2.582zm1.464-9.625c1.035-.066 1.817-.44 2.327-1.112.403-.528.647-1.239.726-2.112a11.048 11.048 0 0 0-2.769-.218c-.945.055-1.671.33-2.159.817-.43.43-.636.989-.605 1.618.03.565.317 1.04.808 1.357.511.33 1.168.482 1.913.446l-.241.004z" />
    </svg>
  );
}

const INTEGRATIONS = [
  { name: "Instagram", icon: Instagram, tint: "text-pink-600", surface: "bg-pink-50 dark:bg-pink-500/10" },
  { name: "X / Twitter", icon: Twitter, tint: "text-slate-700 dark:text-slate-200", surface: "bg-slate-100 dark:bg-slate-500/10" },
  { name: "LinkedIn", icon: Linkedin, tint: "text-blue-700", surface: "bg-blue-50 dark:bg-blue-500/10" },
  { name: "YouTube", icon: Youtube, tint: "text-red-600", surface: "bg-red-50 dark:bg-red-500/10" },
  { name: "Facebook", icon: Facebook, tint: "text-blue-600", surface: "bg-blue-50 dark:bg-blue-500/10" },
  { name: "TikTok", icon: TikTokIcon, tint: "text-slate-900 dark:text-white", surface: "bg-slate-100 dark:bg-slate-500/10" },
  { name: "Threads", icon: ThreadsIcon, tint: "text-slate-800 dark:text-slate-100", surface: "bg-slate-100 dark:bg-slate-500/10" },
];

const STATS = [
  { value: "10K+", label: "Active creators", detail: "Trusted by teams worldwide" },
  { value: "2M+", label: "Posts scheduled", detail: "Published across channels" },
  { value: "98%", label: "Delivery rate", detail: "Reliable publishing performance" },
  { value: "5", label: "Platforms", detail: "Managed from one workspace" },
];

const FEATURES = [
  {
    title: "Smart Scheduling",
    description:
      "AI analyses your audience's activity patterns and recommends the best posting windows to maximise reach.",
    meta: "Planning",
  },
  {
    title: "Auto Posting",
    description:
      "Create once, publish everywhere automatically, at exactly the right time.",
    meta: "Automation",
  },
  {
    title: "AI-Powered Content",
    description:
      "Generate captions, hashtags, and content briefs in seconds using built-in AI tools.",
    meta: "Content",
  },
  {
    title: "Unified Analytics",
    description:
      "Track performance across all platforms in a single dashboard. Know what works, do more of it.",
    meta: "Reporting",
  },
  {
    title: "Multi-Account Management",
    description:
      "Add unlimited social profiles and switch between them instantly, ideal for agencies and teams.",
    meta: "Scale",
  },
  {
    title: "Security & Compliance",
    description:
      "GDPR-compliant by design. Enterprise-grade encryption protects every credential and connection.",
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
    description: "Upload media, write captions, or let AI help. Schedule to multiple platforms in one go.",
  },
  {
    step: "03",
    title: "Let it run",
    description: "Posts go live at optimal times automatically. Monitor everything from your analytics dashboard.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Social Raven transformed how we manage content. The AI scheduling is genuinely impressive and it just works.",
    author: "Sarah Chen",
    role: "Content Manager, Bloom Agency",
    initials: "SC",
    tone: "information" as const,
  },
  {
    quote: "Managing 15 client accounts used to be chaos. Now it's seamless. Best tool investment we've made this year.",
    author: "Marcus Rodriguez",
    role: "Founder, Rodriguez Media",
    initials: "MR",
    tone: "success" as const,
  },
  {
    quote: "The analytics dashboard alone is worth it. We doubled engagement in three months.",
    author: "Emily Watson",
    role: "Social Media Director, Luxe Brand",
    initials: "EW",
    tone: "discovery" as const,
  },
];

const FAQ = [
  {
    question: "Is Social Raven GDPR compliant?",
    answer:
      "Yes. Social Raven is built in Europe with GDPR compliance by design. All data is stored in US and EU data centres and we never sell your data to third parties.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "Start with the trial plan with no credit card required. Upgrade to Pro anytime. Your data and scheduled posts are always yours.",
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
      "Yes, cancel anytime with no questions asked. No lock-in and no exit fees.",
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
                    <StatusPill tone="accent">Trusted by 10,000+ creators</StatusPill>
                    <StatusPill tone="neutral">14-day Pro trial</StatusPill>
                  </div>

                  <div className="space-y-4">
                    <h1 className="max-w-3xl text-[2.5rem] leading-[2.75rem] font-bold tracking-[-0.025em] text-[hsl(var(--foreground))] md:text-[3rem] md:leading-[3.25rem] lg:text-[3.5rem] lg:leading-[3.75rem]">
                      Your social media,
                      <br />
                      <span className="text-[hsl(var(--accent))]">on autopilot.</span>
                    </h1>
                    <p className="max-w-2xl text-sm leading-5 text-[hsl(var(--foreground-muted))] md:text-[0.875rem] md:leading-5">
                      Schedule, publish, and analyse across every platform from one beautifully simple workspace.
                      Built for creators, agencies, and growth-focused teams.
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
                              <p className="text-sm font-bold leading-5">Performance</p>
                              <p className="text-xs leading-4 text-[hsl(var(--foreground-muted))]">Last 7 days</p>
                            </div>
                            <StatusPill tone="success">Stable</StatusPill>
                          </div>
                          <div className="mt-4 space-y-3">
                            {[
                              { label: "Delivery rate", value: 98 },
                              { label: "Engagement target", value: 76 },
                              { label: "Approval throughput", value: 84 },
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

                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Avatar name="Sarah Chen" size="small" appearance="square" />
                              <div>
                                <p className="text-sm font-medium leading-5">Reviewed by Sarah Chen</p>
                                <p className="text-xs leading-4 text-[hsl(var(--foreground-muted))]">Content Operations</p>
                              </div>
                            </div>
                            <div className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] p-3">
                              <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                                Campaign note
                              </p>
                              <p className="mt-1 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                                Your next campaign is lined up and ready to publish across connected platforms.
                              </p>
                            </div>
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
                  Testimonials
                </p>
                <h2 className="mt-3 text-[1.5rem] leading-7 font-bold tracking-[-0.02em]">
                  Loved by creators worldwide
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {TESTIMONIALS.map((item) => (
                  <SurfaceCard key={item.author} className="p-6 shadow-sm">
                    <StatusPill tone={item.tone === "success" ? "success" : "accent"}>Verified customer</StatusPill>
                    <p className="mt-5 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                      &quot;{item.quote}&quot;
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      <Avatar name={item.author} size="small" appearance="square" />
                      <div>
                        <p className="text-sm font-medium leading-5">{item.author}</p>
                        <p className="text-xs leading-4 text-[hsl(var(--foreground-muted))]">{item.role}</p>
                      </div>
                    </div>
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
                      Trusted by teams across 40+ countries
                    </span>
                    <h2 className="mt-5 text-[2rem] leading-9 font-bold tracking-[-0.02em]">
                      Start growing today.
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-5 text-white/70 md:text-[0.875rem] md:leading-5">
                      Join thousands of creators and agencies who&apos;ve simplified their workflow with SocialRaven.
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

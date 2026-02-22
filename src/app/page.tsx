"use client";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar/navbar";
import {
  Calendar,
  Clock,
  Feather,
  BarChart,
  ArrowRight,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Facebook,
  TrendingUp,
  Zap,
  Globe,
  Lock,
  Users,
  CheckCircle2,
  Star,
  Shield,
  Sparkles,
  Play,
  Plus,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PLANS } from "@/constants/plans";

/* ─────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────── */

const INTEGRATIONS = [
  { name: "Instagram", icon: Instagram, gradient: "from-purple-500 to-pink-500" },
  { name: "Twitter / X", icon: Twitter, gradient: "from-gray-800 to-gray-900" },
  { name: "LinkedIn", icon: Linkedin, gradient: "from-blue-600 to-blue-700" },
  { name: "YouTube", icon: Youtube, gradient: "from-red-500 to-red-600" },
  { name: "Facebook", icon: Facebook, gradient: "from-blue-500 to-blue-600" },
];

const STATS = [
  { value: "10K+", label: "Active creators" },
  { value: "2M+", label: "Posts scheduled" },
  { value: "98%", label: "Delivery rate" },
  { value: "5", label: "Platforms" },
];

const FEATURES = [
  {
    title: "Smart Scheduling",
    description: "AI analyses your audience's activity patterns and recommends the best posting windows to maximise reach.",
    icon: Calendar,
  },
  {
    title: "Auto Posting",
    description: "Create once, publish everywhere — automatically, at exactly the right time.",
    icon: Zap,
  },
  {
    title: "AI-Powered Content",
    description: "Generate captions, hashtags, and content briefs in seconds using built-in AI tools.",
    icon: Feather,
  },
  {
    title: "Unified Analytics",
    description: "Track performance across all platforms in a single dashboard. Know what works, do more of it.",
    icon: BarChart,
  },
  {
    title: "Multi-Account Management",
    description: "Add unlimited social profiles and switch between them instantly — ideal for agencies and teams.",
    icon: Users,
  },
  {
    title: "Security & Compliance",
    description: "GDPR-compliant by design. Enterprise-grade encryption protects every credential and connection.",
    icon: Shield,
  },
];

const STEPS = [
  {
    step: "01",
    title: "Connect your accounts",
    description: "Link Instagram, LinkedIn, X, YouTube, and Facebook in seconds. OAuth-secured — no passwords stored.",
    icon: Globe,
  },
  {
    step: "02",
    title: "Create your content",
    description: "Upload media, write captions, or let AI help. Schedule to multiple platforms in one go.",
    icon: Feather,
  },
  {
    step: "03",
    title: "Let it run",
    description: "Posts go live at optimal times automatically. Monitor everything from your analytics dashboard.",
    icon: Zap,
  },
];

const TESTIMONIALS = [
  {
    quote: "Social Raven transformed how we manage content. The AI scheduling is genuinely impressive — it just works.",
    author: "Sarah Chen",
    role: "Content Manager, Bloom Agency",
    rating: 5,
    initials: "SC",
  },
  {
    quote: "Managing 15 client accounts used to be chaos. Now it's seamless. Best tool investment we've made this year.",
    author: "Marcus Rodriguez",
    role: "Founder, Rodriguez Media",
    rating: 5,
    initials: "MR",
  },
  {
    quote: "The analytics dashboard alone is worth it. We doubled engagement in three months.",
    author: "Emily Watson",
    role: "Social Media Director, Luxe Brand",
    rating: 5,
    initials: "EW",
  },
];

const PAID_PLANS = PLANS.filter((p) => p.type !== "TRIAL");

const FAQ = [
  {
    question: "Is Social Raven GDPR compliant?",
    answer:
      "Yes. Social Raven is built in Europe with GDPR compliance by design. All data is stored in US & EU data centres and we never sell your data to third parties.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "Start with the Trial plan — no credit card required. Upgrade to Pro anytime. Your data and scheduled posts are always yours.",
  },
  {
    question: "Which social platforms are supported?",
    answer:
      "We currently support Instagram, Twitter/X, LinkedIn, YouTube, and Facebook. More platforms are on the way.",
  },
  {
    question: "Can I manage multiple clients from one account?",
    answer:
      "Absolutely. Our Pro and Enterprise plans are designed for agencies — manage all your clients from a single, clean dashboard.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, cancel anytime with no questions asked. We believe in earning your business every month — no lock-in, no exit fees.",
  },
];

/* ─────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────── */

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) router.replace("/dashboard");
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded || isSignedIn) return null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f9fafb]">
        {/* Ambient background */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-5%] left-[20%] w-[700px] h-[700px] bg-[hsl(214,65%,52%)]/[0.05] rounded-full blur-[160px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-[hsl(214,65%,52%)]/[0.04] rounded-full blur-[140px]" />
        </div>

        <main>
          {/* ── HERO ─────────────────────────────────────────── */}
          <section className="pt-28 pb-20">
            <div className="container max-w-7xl px-6 mx-auto">
              <div className="grid lg:grid-cols-[1.1fr_1fr] gap-14 items-center">

                {/* Copy */}
                <div className="space-y-7 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-white px-3.5 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]" />
                    Trusted by 10,000+ creators
                  </div>

                  <h1 className="text-5xl md:text-6xl lg:text-[72px] font-semibold tracking-[-0.04em] leading-[1.05] text-[hsl(var(--foreground))]">
                    Your social media,
                    <br />
                    <span className="text-[hsl(var(--accent))]">on autopilot.</span>
                  </h1>

                  <p className="text-lg leading-relaxed text-[hsl(var(--muted-foreground))] max-w-[500px] mx-auto lg:mx-0">
                    Schedule, publish, and analyse across every platform from one beautifully simple workspace.
                    Built for creators, agencies, and growth-focused teams.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <Link href="/sign-up">
                      <Button className="h-12 px-8 rounded-full bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent))]/90 font-medium text-sm shadow-md">
                        Start free — no card needed
                      </Button>
                    </Link>
                    <Link href="#how-it-works">
                      <Button
                        variant="outline"
                        className="h-12 px-8 rounded-full border-[hsl(var(--border))] bg-white hover:bg-[hsl(var(--muted))] font-medium text-sm text-[hsl(var(--foreground))]"
                      >
                        <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                        See how it works
                      </Button>
                    </Link>
                  </div>

                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    14-day Pro trial · No credit card · GDPR compliant 🇪🇺
                  </p>
                </div>

                {/* Dashboard mock */}
                <div className="flex justify-center lg:justify-end">
                  <div className="frosted-border depth-soft w-full max-w-[420px] rounded-2xl bg-white/80 backdrop-blur-xl p-6 space-y-4">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent))]/10 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-[hsl(var(--accent))]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Performance</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">Last 7 days</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Live
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Posts", value: "247", growth: "+18%" },
                        { label: "Reach", value: "8.4K", growth: "+32%" },
                        { label: "Engagement", value: "6.2%", growth: "+11%" },
                        { label: "Saves", value: "1.1K", growth: "+44%" },
                      ].map((m) => (
                        <div key={m.label} className="rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] p-3.5">
                          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{m.label}</p>
                          <p className="text-xl font-semibold text-[hsl(var(--foreground))] leading-none mb-1.5">{m.value}</p>
                          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <ArrowRight className="w-3 h-3 rotate-[-45deg]" />
                            {m.growth}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">Next scheduled</p>
                          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Today at 7:30 PM</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white border border-[hsl(var(--border))] flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {[
                          { icon: Instagram, gradient: "from-purple-500 to-pink-500" },
                          { icon: Twitter, gradient: "from-gray-800 to-gray-900" },
                          { icon: Linkedin, gradient: "from-blue-600 to-blue-700" },
                        ].map(({ icon: Icon, gradient }, i) => (
                          <div key={i} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                            <Icon className="w-3.5 h-3.5 text-white" />
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center">
                          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">+2</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── STATS ────────────────────────────────────────── */}
          <section className="py-12 border-y border-[hsl(var(--border))] bg-white">
            <div className="container max-w-6xl px-6 mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {STATS.map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-3xl md:text-4xl font-semibold text-[hsl(var(--foreground))] mb-1 tracking-tight">{value}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PLATFORMS ────────────────────────────────────── */}
          <section id="integrations" className="py-16 bg-[#f9fafb]">
            <div className="container max-w-7xl px-6 mx-auto text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-6">
                Works with your platforms
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {INTEGRATIONS.map(({ name, icon: Icon, gradient }) => (
                  <div
                    key={name}
                    className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-white border border-[hsl(var(--border))] hover:border-[hsl(var(--accent))]/40 hover:shadow-sm transition-all depth-soft"
                  >
                    <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[hsl(var(--foreground))]">{name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-white border border-dashed border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                  <span className="text-sm">More coming soon</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── FEATURES ─────────────────────────────────────── */}
          <section id="features" className="py-20 bg-white">
            <div className="container max-w-7xl px-6 mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-3">Features</p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-4">
                  Built for speed.
                  <br />
                  Designed for growth.
                </h2>
                <p className="text-base text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
                  Every tool you need to build a consistent, high-performing social presence — without the complexity.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="group rounded-2xl bg-[#f9fafb] border border-[hsl(var(--border))] p-6 hover:border-[hsl(var(--accent))]/30 hover:bg-white hover:shadow-md transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[hsl(var(--accent))]/10 flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--accent))]/15 transition-colors">
                      <Icon className="w-5 h-5 text-[hsl(var(--accent))]" />
                    </div>
                    <h3 className="font-semibold text-base text-[hsl(var(--foreground))] mb-2">{title}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ─────────────────────────────────── */}
          <section id="how-it-works" className="py-20 bg-[#f9fafb]">
            <div className="container max-w-6xl px-6 mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-3">How it works</p>
                <h2 className="text-3xl md:text-4xl font-semibold text-[hsl(var(--foreground))] tracking-tight">
                  Up and running in minutes
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 relative">
                <div className="hidden md:block absolute top-8 left-[calc(16.7%+2rem)] right-[calc(16.7%+2rem)] h-px bg-[hsl(var(--border))] z-0" />
                {STEPS.map(({ step, title, description, icon: Icon }) => (
                  <div key={step} className="relative z-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-[hsl(var(--border))] depth-soft flex items-center justify-center mx-auto mb-5">
                      <Icon className="w-6 h-6 text-[hsl(var(--accent))]" />
                    </div>
                    <div className="text-xs font-bold text-[hsl(var(--accent))] mb-2 tracking-widest">{step}</div>
                    <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">{title}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── TESTIMONIALS ─────────────────────────────────── */}
          <section className="py-20 bg-white">
            <div className="container max-w-7xl px-6 mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-3">Testimonials</p>
                <h2 className="text-3xl md:text-4xl font-semibold text-[hsl(var(--foreground))] tracking-tight">
                  Loved by creators worldwide
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {TESTIMONIALS.map(({ quote, author, role, rating, initials }) => (
                  <div
                    key={author}
                    className="frosted-border rounded-2xl bg-[#f9fafb] border border-[hsl(var(--border))] p-6 hover:border-[hsl(var(--accent))]/30 hover:shadow-md transition-all"
                  >
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[hsl(var(--accent))] text-[hsl(var(--accent))]" />
                      ))}
                    </div>
                    <p className="text-sm text-[hsl(var(--foreground))]/80 mb-5 leading-relaxed">&quot;{quote}&quot;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-[hsl(var(--accent))]">{initials}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{author}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PRICING ──────────────────────────────────────── */}
          <section id="pricing" className="py-20 bg-[#f9fafb]">
            <div className="container max-w-6xl px-6 mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-3">Pricing</p>
                <h2 className="text-3xl md:text-4xl font-semibold text-[hsl(var(--foreground))] tracking-tight mb-3">
                  Simple, transparent pricing
                </h2>
                <p className="text-base text-[hsl(var(--muted-foreground))]">Start free. Scale when you&apos;re ready.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 items-start">
                {PAID_PLANS.map((plan) => {
                  const isEnterprise = plan.type === "ENTERPRISE";
                  const cta     = isEnterprise ? "Contact sales" : "Start 14-day free trial";
                  const ctaHref = isEnterprise
                    ? "mailto:sales@socialraven.io?subject=Enterprise%20Plan%20Enquiry"
                    : "/sign-up";

                  return (
                    <div
                      key={plan.type}
                      className={`rounded-2xl border p-7 transition-all ${plan.popular
                          ? "border-[hsl(var(--accent))] bg-white shadow-xl shadow-[hsl(var(--accent))]/10 md:scale-[1.03]"
                          : "border-[hsl(var(--border))] bg-white hover:shadow-md"
                        }`}
                    >
                      {plan.popular && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] text-xs font-semibold mb-4">
                          <Sparkles className="w-3 h-3" />
                          Most Popular
                        </div>
                      )}

                      <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-1">{plan.name}</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-5">{plan.description}</p>

                      <div className="mb-6">
                        <span className="text-4xl font-semibold text-[hsl(var(--foreground))] tracking-tight">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-[hsl(var(--muted-foreground))] ml-1">/ month</span>
                      </div>

                      <ul className="space-y-3 mb-7">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5 text-sm text-[hsl(var(--foreground))]/80">
                            <CheckCircle2 className="w-4 h-4 text-[hsl(var(--accent))] flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Link href={ctaHref}>
                        <Button
                          className={`w-full h-11 rounded-full font-medium text-sm ${plan.popular
                              ? "bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent))]/90 shadow-md"
                              : "bg-[hsl(var(--foreground))] text-white hover:bg-[hsl(var(--foreground))]/90"
                            }`}
                        >
                          {cta}
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-8">
                All plans include a 14-day free trial. EU VAT applied where applicable.
              </p>
            </div>
          </section>

          {/* ── FAQ ──────────────────────────────────────────── */}
          <section className="py-20 bg-white">
            <div className="container max-w-3xl px-6 mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-3">FAQ</p>
                <h2 className="text-3xl md:text-4xl font-semibold text-[hsl(var(--foreground))] tracking-tight">
                  Common questions
                </h2>
              </div>

              <div className="space-y-2">
                {FAQ.map(({ question, answer }, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[hsl(var(--border))] bg-[#f9fafb] overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                    >
                      <span className="font-medium text-sm text-[hsl(var(--foreground))]">{question}</span>
                      {openFaq === i
                        ? <Minus className="w-4 h-4 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
                        : <Plus className="w-4 h-4 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
                      }
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed border-t border-[hsl(var(--border))] pt-4">
                        {answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-10">
                Still have questions?{" "}
                <Link href="/contact" className="text-[hsl(var(--accent))] hover:underline font-medium">
                  Contact us
                </Link>
              </p>
            </div>
          </section>

          {/* ── CTA ──────────────────────────────────────────── */}
          <section className="py-24 bg-[hsl(var(--foreground))]">
            <div className="container max-w-4xl px-6 mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Trusted by teams across 40+ countries
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
                Start growing today.
              </h2>
              <p className="text-base text-white/60 max-w-md mx-auto">
                Join thousands of creators and agencies who&apos;ve simplified their workflow with Social Raven.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link href="/sign-up">
                  <Button className="h-12 px-8 rounded-full bg-white text-[hsl(var(--foreground))] hover:bg-gray-100 font-medium text-sm">
                    Get started for free
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="h-12 px-8 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 font-medium text-sm"
                  >
                    Talk to sales
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer className="bg-[#f9fafb] border-t border-[hsl(var(--border))]">
          <div className="container max-w-7xl px-6 mx-auto py-14">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

              {/* Brand */}
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <img src="/SocialRavenLogo.svg" alt="SocialRaven" className="h-6 w-6" />
                  <span className="font-semibold text-[hsl(var(--foreground))]">SocialRaven</span>
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xs">
                  Schedule, publish, and analyse your social media from one clean, powerful workspace.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                  <Lock className="w-3 h-3" />
                  GDPR Compliant · Data stored in  US 🇺🇸 & EU 🇪🇺
                </div>
              </div>

              {/* Product */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--foreground))] mb-4">Product</p>
                <ul className="space-y-2.5">
                  {[
                    { label: "Features", href: "#features" },
                    { label: "Pricing", href: "#pricing" },
                    { label: "Integrations", href: "#integrations" },
                    { label: "Changelog", href: "/changelog" },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--foreground))] mb-4">Company</p>
                <ul className="space-y-2.5">
                  {[
                    { label: "About", href: "/about" },
                    { label: "Blog", href: "/blog" },
                    { label: "Contact", href: "/contact" },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--foreground))] mb-4">Legal</p>
                <ul className="space-y-2.5">
                  {[
                    { label: "Privacy Policy", href: "/privacy-policy" },
                    { label: "Terms of Service", href: "/terms-of-service" },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            <div className="border-t border-[hsl(var(--border))] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                © 2026 Social Raven. All rights reserved.
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Built for global businesses — empowering teams across the US, Europe, and beyond.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

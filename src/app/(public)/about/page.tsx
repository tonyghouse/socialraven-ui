import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import {
  Target,
  Shield,
  Globe,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  BarChart,
  Lock,
  Calendar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About | Social Raven",
  description:
    "Learn about Social Raven — who we are, why we built it, and our mission to simplify professional social media management for teams worldwide.",
};

const STATS = [
  { value: "10K+", label: "Active users" },
  { value: "2M+", label: "Posts scheduled" },
  { value: "98%", label: "Delivery rate" },
  { value: "40+", label: "Countries served" },
];

const VALUES = [
  {
    icon: Target,
    title: "Simplicity first",
    description:
      "We cut through the noise. Every feature earns its place — if it doesn't make your workflow faster, it doesn't ship.",
  },
  {
    icon: Shield,
    title: "Privacy by design",
    description:
      "GDPR and CCPA-compliant from the ground up. Your data is never sold, never shared for advertising, and never used to train AI without your explicit consent.",
  },
  {
    icon: Zap,
    title: "Reliability you can count on",
    description:
      "Missed post times cost engagement. We obsess over uptime, delivery rates, and resilience so your content goes live exactly when it should.",
  },
  {
    icon: Globe,
    title: "Built for global teams",
    description:
      "Whether you're a solo creator in London or an agency in New York, Social Raven works seamlessly across regions and time zones.",
  },
];

const PERSONAS = [
  {
    title: "Creators & Influencers",
    description:
      "Stop spending hours manually posting across platforms. Batch-create your content for the week, schedule it in minutes, and focus on what actually matters — making great content.",
    bullets: [
      "Multi-platform publishing in one step",
      "AI-powered best-time scheduling",
      "Post performance analytics",
    ],
  },
  {
    title: "Agencies & Freelancers",
    description:
      "Manage every client account from one clean dashboard. No more tab-switching, no more missed posts. Professional workflows built for teams handling multiple brands simultaneously.",
    bullets: [
      "Unlimited social profiles",
      "Client account management",
      "Team collaboration tools",
    ],
  },
  {
    title: "Brands & Businesses",
    description:
      "Maintain a consistent brand voice across all channels without a dedicated operations team. Scale your social presence intelligently with AI-powered insights and automation.",
    bullets: [
      "Brand consistency tools",
      "Advanced cross-platform analytics",
      "Enterprise security & compliance",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="bg-[#f9fafb] px-2 lg:px-5 pt-5">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>
      <main className="min-h-screen bg-[#f9fafb]">

        {/* Hero */}
        <div className="bg-white border-b border-[hsl(var(--border))] px-6 md:px-10 py-20">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-4">Our story</p>
            <h1 className="text-4xl md:text-5xl lg:text-[60px] font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6 max-w-3xl leading-[1.08]">
              Built for teams who take social media seriously.
            </h1>
            <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl mb-10">
              Social Raven is a professional social media management platform — built by a small, focused team who believed the category was overcomplicated and overpriced. We set out to fix that.
            </p>
            <div className="flex flex-wrap gap-10">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-semibold text-[hsl(var(--foreground))] tracking-tight leading-none mb-1">
                    {value}
                  </p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="px-6 md:px-10 py-16 bg-[#f9fafb]">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div className="space-y-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))]">Our mission</p>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[hsl(var(--foreground))] leading-snug">
                  Give every team the tools that used to cost a fortune.
                </h2>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Enterprise social media tools charge thousands per month and take weeks to set up. Meanwhile, creators and small businesses are duct-taping together spreadsheets, free trials, and manual posting.
                </p>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Social Raven exists to close that gap. We believe powerful, professional-grade scheduling and analytics should be accessible to every creator, agency, and business — not just the ones with six-figure software budgets.
                </p>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))] hover:underline"
                >
                  Start for free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Calendar, label: "Smart scheduling", value: "Post at peak times, automatically" },
                  { icon: BarChart, label: "Unified analytics", value: "All platforms in one view" },
                  { icon: Users, label: "Multi-account", value: "Unlimited social profiles" },
                  { icon: Lock, label: "Secure & compliant", value: "GDPR · CCPA · TLS 1.2+" },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-white border border-[hsl(var(--border))] p-5 space-y-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent))]/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[hsl(var(--accent))]" />
                    </div>
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{label}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="px-6 md:px-10 py-16 bg-white border-y border-[hsl(var(--border))]">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-3">
                What we stand for
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
                The principles we build by
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {VALUES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group rounded-2xl bg-[#f9fafb] border border-[hsl(var(--border))] p-6 hover:bg-white hover:border-[hsl(var(--accent))]/30 hover:shadow-md transition-all space-y-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-[hsl(var(--accent))]/10 flex items-center justify-center group-hover:bg-[hsl(var(--accent))]/15 transition-colors">
                    <Icon className="w-5 h-5 text-[hsl(var(--accent))]" />
                  </div>
                  <h3 className="font-semibold text-[hsl(var(--foreground))]">{title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Who we build for */}
        <div className="px-6 md:px-10 py-16 bg-[#f9fafb]">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-3">
                Who we build for
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
                One platform. Every team.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {PERSONAS.map(({ title, description, bullets }) => (
                <div
                  key={title}
                  className="rounded-2xl bg-white border border-[hsl(var(--border))] p-7 space-y-4"
                >
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">{title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{description}</p>
                  <ul className="space-y-2.5 pt-1">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-sm text-[hsl(var(--foreground))]/80">
                        <CheckCircle2 className="w-4 h-4 text-[hsl(var(--accent))] flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 md:px-10 py-20 bg-[hsl(var(--foreground))]">
          <div className="mx-auto max-w-3xl text-center space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Get started</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
              Ready to take back your time?
            </h2>
            <p className="text-base text-white/60 max-w-md mx-auto">
              Join thousands of creators and agencies managing their social media with Social Raven. Start free — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-white text-[hsl(var(--foreground))] hover:bg-gray-100 font-medium text-sm transition-colors"
              >
                Start free trial
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/10 font-medium text-sm transition-colors"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}

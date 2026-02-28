import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import {
  TrendingUp,
  Zap,
  Users,
  Shield,
  PenTool,
  BarChart,
  ArrowRight,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Social Raven",
  description:
    "Insights on social media strategy, scheduling, and growth from the Social Raven team.",
};

const CATEGORIES = [
  {
    icon: TrendingUp,
    title: "Growth Strategy",
    description:
      "Proven tactics to grow your following and engagement across every platform.",
  },
  {
    icon: Zap,
    title: "Automation & Scheduling",
    description:
      "Get the most out of your scheduling workflow — batch content, best times, and more.",
  },
  {
    icon: BarChart,
    title: "Analytics & Reporting",
    description:
      "Understand your numbers. Learn which posts work, when to post, and why.",
  },
  {
    icon: Users,
    title: "Agency Playbooks",
    description:
      "Tools, templates, and frameworks for agencies managing multiple client accounts.",
  },
  {
    icon: PenTool,
    title: "Content Creation",
    description:
      "AI-assisted writing, caption formulas, and creative frameworks for every platform.",
  },
  {
    icon: Shield,
    title: "Compliance & Privacy",
    description:
      "Staying GDPR and CCPA-compliant as regulations and platform policies continue to evolve.",
  },
];

const COMING_SOON = [
  {
    category: "Growth Strategy",
    title: "The 2026 Instagram Algorithm: What Actually Works Right Now",
    excerpt:
      "Instagram's algorithm has shifted significantly. We break down the signals that matter most — Reels, carousels, and why reach isn't dead.",
    readTime: "7 min read",
  },
  {
    category: "Automation & Scheduling",
    title: "How to Batch-Create a Month of Content in One Afternoon",
    excerpt:
      "A step-by-step workflow for planning, creating, and scheduling 30 days of cross-platform content in a single focused session.",
    readTime: "5 min read",
  },
  {
    category: "Agency Playbooks",
    title: "Managing 20+ Client Accounts Without Losing Your Mind",
    excerpt:
      "The systems, naming conventions, and tooling we see top agencies using to stay organised across dozens of brands simultaneously.",
    readTime: "8 min read",
  },
];

export default function BlogPage() {
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
            <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-4">Blog</p>
            <h1 className="text-4xl md:text-5xl lg:text-[60px] font-semibold tracking-tight text-[hsl(var(--foreground))] mb-5 max-w-2xl leading-[1.08]">
              Insights for modern social media teams.
            </h1>
            <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xl mb-8">
              Strategy, tools, and tactics for creators, agencies, and brands who take social seriously. First articles dropping soon — get notified when we publish.
            </p>
            <a
              href="mailto:team+blog@socialraven.io?subject=Blog%20Notifications"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[hsl(var(--accent))] text-white text-sm font-medium hover:bg-[hsl(var(--accent))]/90 transition-colors"
            >
              Notify me when we publish <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Coming soon articles */}
        <div className="px-6 md:px-10 py-14 bg-[#f9fafb]">
          <div className="mx-auto max-w-7xl space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-1">
                Coming soon
              </p>
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                First articles in the works
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {COMING_SOON.map(({ category, title, excerpt, readTime }) => (
                <div
                  key={title}
                  className="rounded-2xl bg-white border border-[hsl(var(--border))] p-6 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] text-xs font-semibold">
                      {category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {readTime}
                    </div>
                  </div>
                  <h3 className="font-semibold text-[hsl(var(--foreground))] leading-snug">{title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{excerpt}</p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--muted-foreground))]/30" />
                    Publishing soon
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Topic categories */}
        <div className="px-6 md:px-10 py-14 bg-white border-y border-[hsl(var(--border))]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-1">Topics</p>
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">What we&apos;ll cover</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CATEGORIES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group rounded-2xl bg-[#f9fafb] border border-[hsl(var(--border))] p-6 hover:bg-white hover:border-[hsl(var(--accent))]/30 hover:shadow-md transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent))]/10 flex items-center justify-center group-hover:bg-[hsl(var(--accent))]/15 transition-colors">
                    <Icon className="w-5 h-5 text-[hsl(var(--accent))]" />
                  </div>
                  <h3 className="font-semibold text-sm text-[hsl(var(--foreground))]">{title}</h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notify CTA */}
        <div className="px-6 md:px-10 py-14 bg-[#f9fafb]">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl bg-[hsl(var(--foreground))] p-10 md:p-14 text-center space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                Stay in the loop
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                Be the first to read our articles.
              </h2>
              <p className="text-sm text-white/60 max-w-sm mx-auto">
                Drop us an email and we&apos;ll notify you as soon as the first posts go live. No spam, unsubscribe any time.
              </p>
              <a
                href="mailto:team+blog@socialraven.io?subject=Blog%20Notifications"
                className="inline-flex items-center gap-2 h-11 px-7 rounded-full bg-white text-[hsl(var(--foreground))] text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Get notified <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}

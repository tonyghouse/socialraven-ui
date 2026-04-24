"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  MessageSquare,
  Shield,
  Twitter,
  Users,
  Youtube,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/navbar/navbar";
import { PricingGrid } from "@/components/public/pricing-grid";
import { PublicSiteFooter } from "@/components/public/public-site-footer";

/* ─────────────────────── Custom SVG Icons ──────────────────────────────── */
function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.321 5.562a5.124 5.124 0 01-.443-.258 6.228 6.228 0 01-1.137-.966c-.85-.971-1.166-1.943-1.282-2.645h.004C16.378 1.297 16.42 1 16.427 1H12.6v15.139a2.952 2.952 0 01-2.948 2.717 2.948 2.948 0 01-2.948-2.948 2.948 2.948 0 012.948-2.948c.29 0 .568.042.831.119V9.217a7.043 7.043 0 00-.831-.05 7.108 7.108 0 00-7.108 7.108 7.108 7.108 0 007.108 7.108 7.108 7.108 0 007.108-7.108V8.757a10.65 10.65 0 006.234 2.005v-3.75a6.156 6.156 0 01-3.673-1.45z" />
    </svg>
  );
}

function ThreadsIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.474 12.01v-.017c.024-3.576.876-6.43 2.521-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.747.02 5.043.682 6.826 1.966 1.645 1.19 2.67 2.842 3.051 4.909l-2.977.528c-.31-1.578-.998-2.801-2.111-3.638-1.263-.947-3.033-1.413-5.264-1.43-2.91.023-5.042.766-6.33 2.205-1.18 1.316-1.782 3.352-1.795 6.059v.018c.014 2.695.617 4.728 1.792 6.042 1.29 1.44 3.42 2.185 6.337 2.207 2.43-.017 3.972-.553 4.912-1.745.965-1.222 1.383-3.087 1.245-5.543a.764.764 0 00-.744-.717h-.086c.133 2.64-.308 4.687-1.311 6.065-1.05 1.44-2.879 2.17-5.44 2.17-.2 0-.4-.005-.6-.014-2.48-.111-4.423-.963-5.68-2.47C5.63 17.25 5.04 15.4 4.983 13.1v-.095c.057-2.314.647-4.161 1.757-5.49 1.268-1.516 3.22-2.367 5.723-2.469.186-.007.38-.011.578-.011 2.377 0 4.23.595 5.315 1.721.903.93 1.357 2.237 1.357 3.88v.02c0 1.683-.553 3.029-1.641 4.001-.959.85-2.249 1.32-3.76 1.35h-.045c-1.12 0-2.054-.354-2.74-1.027-.579-.57-.912-1.346-.962-2.262a3.32 3.32 0 01-.009-.197c0-1.097.33-2 1.007-2.695.61-.63 1.508-1.029 2.604-1.153l.244-.026c1.07-.107 2.027-.187 2.77-.39.26-.07.48-.162.63-.283.217-.174.303-.41.303-.734 0-.607-.18-1.053-.55-1.366-.39-.33-.992-.499-1.793-.499h-.06c-1.055.015-1.855.318-2.38.903-.474.527-.733 1.299-.773 2.295a.53.53 0 01-.528.512h-.008a.529.529 0 01-.52-.543c.048-1.243.42-2.253 1.105-3.003.741-.808 1.84-1.262 3.143-1.28H12c1.1 0 1.982.25 2.623.744.707.543 1.07 1.33 1.07 2.332 0 .697-.196 1.257-.58 1.67-.34.365-.848.63-1.506.788-.784.189-1.757.272-2.872.38l-.233.024c-.794.092-1.419.376-1.816.83-.36.41-.545.982-.545 1.7 0 .061.003.12.007.18.034.591.233 1.084.594 1.437.44.434 1.08.654 1.9.654 1.237-.026 2.232-.394 2.96-1.092.774-.743 1.165-1.788 1.165-3.11v-.02c0-1.302-.339-2.269-1.04-2.97-.736-.74-1.893-1.101-3.451-1.101-.174 0-.35.004-.524.01-2.17.091-3.821.794-4.912 2.088-.979 1.162-1.483 2.769-1.53 4.78v.063c.047 2.008.551 3.614 1.527 4.776 1.084 1.304 2.742 2.01 4.925 2.1.17.007.34.011.51.011 2.27 0 3.931-.62 4.93-1.837.932-1.139 1.441-2.915 1.43-5.116v-.078c0-1.993-.624-3.622-1.853-4.843-1.33-1.32-3.486-2-6.421-2.017z" />
    </svg>
  );
}

/* ──────────────────────────────── Data ─────────────────────────────────── */

const PLATFORMS = [
  { Icon: Instagram,   name: "Instagram",   color: "text-pink-500",  bg: "bg-pink-50 dark:bg-pink-500/10",  dot: "bg-pink-400" },
  { Icon: Twitter,     name: "X / Twitter", color: "text-sky-500",   bg: "bg-sky-50 dark:bg-sky-500/10",   dot: "bg-sky-400" },
  { Icon: Linkedin,    name: "LinkedIn",    color: "text-blue-600",  bg: "bg-blue-50 dark:bg-blue-500/10", dot: "bg-blue-500" },
  { Icon: Youtube,     name: "YouTube",     color: "text-red-500",   bg: "bg-red-50 dark:bg-red-500/10",   dot: "bg-red-400" },
  { Icon: Facebook,    name: "Facebook",    color: "text-blue-500",  bg: "bg-blue-50 dark:bg-blue-500/10", dot: "bg-blue-400" },
  { Icon: ThreadsIcon, name: "Threads",     color: "text-[var(--ds-gray-800)]", bg: "bg-[var(--ds-gray-100)] dark:bg-white/5", dot: "bg-[var(--ds-gray-700)]" },
  { Icon: TikTokIcon,  name: "TikTok",      color: "text-[var(--ds-gray-800)]", bg: "bg-[var(--ds-gray-100)] dark:bg-white/5", dot: "bg-[var(--ds-gray-700)]" },
];

function formatList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

const LIVE_PLATFORMS = PLATFORMS.filter(({ soon }) => !soon);
const LIVE_PLATFORM_COUNT = LIVE_PLATFORMS.length;
const LIVE_PLATFORM_NAMES = formatList(LIVE_PLATFORMS.map(({ name }) => name));

const MOCK_POSTS = [
  { platforms: [Instagram, Twitter, Linkedin],           title: "Q2 campaign — new product launch",       time: "Today, 7:30 PM",     status: "live"   as const },
  { platforms: [Facebook, Youtube],                      title: "Behind the scenes — studio walkthrough", time: "Today, 9:00 PM",     status: "queued" as const },
  { platforms: [Instagram],                              title: "Team spotlight: meet our designers",     time: "Tomorrow, 12:00 PM", status: "review" as const },
  { platforms: [Instagram, Twitter, Linkedin, Facebook], title: "Monthly newsletter: April roundup",     time: "Apr 12, 10:00 AM",   status: "draft"  as const },
];

const STATUS_CONFIG = {
  live:   { label: "Live",   dot: "bg-emerald-400", text: "text-emerald-700 dark:text-emerald-400" },
  queued: { label: "Queued", dot: "bg-blue-400",    text: "text-blue-700 dark:text-blue-400"       },
  review: { label: "Review", dot: "bg-amber-400",   text: "text-amber-700 dark:text-amber-400"     },
  draft:  { label: "Draft",  dot: "bg-[var(--ds-gray-400)]", text: "text-[var(--ds-gray-600)]"    },
};

const FEATURES = [
  {
    Icon: Calendar, tag: "Planning", title: "Visual content calendar",
    description: "See every scheduled post across all platforms at a glance. Drag, reorder, and batch-schedule without losing track of what's live.",
    iconCls: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    mockBg: "from-blue-50 to-sky-50/60 dark:from-blue-900/20 dark:to-blue-900/5",
  },
  {
    Icon: Zap, tag: "Publishing", title: "One post. All platforms.",
    description: "Write once, publish from one place. Official API connections — no browser extensions, no copy-pasting captions across separate tabs.",
    iconCls: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    mockBg: "from-amber-50 to-orange-50/60 dark:from-amber-900/20 dark:to-amber-900/5",
  },
  {
    Icon: Users, tag: "Collaboration", title: "Review before anything goes live",
    description: "Share a private review link, collect approvals from clients or stakeholders, and publish only when everyone signs off.",
    iconCls: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    mockBg: "from-purple-50 to-violet-50/60 dark:from-purple-900/20 dark:to-purple-900/5",
  },
  {
    Icon: BarChart3, tag: "Analytics", title: "Post history and workspace reports",
    description: "Track every post across every platform from one dashboard. See what published, when, and to which accounts.",
    iconCls: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    mockBg: "from-emerald-50 to-teal-50/60 dark:from-emerald-900/20 dark:to-emerald-900/5",
  },
  {
    Icon: Shield, tag: "Security", title: "OAuth-secured connections",
    description: "Every platform connection uses official OAuth — no password storage, no third-party workarounds. Workspace-scoped access controls.",
    iconCls: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
    mockBg: "from-rose-50 to-pink-50/60 dark:from-rose-900/20 dark:to-rose-900/5",
  },
  {
    Icon: Globe, tag: "Scale", title: "Multi-account management",
    description: "Organize brands, workspaces, and connected profiles in one place. Built for agencies and multi-brand teams from day one.",
    iconCls: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",
    mockBg: "from-sky-50 to-blue-50/60 dark:from-sky-900/20 dark:to-sky-900/5",
  },
];

const STEPS = [
  { n: "01", Icon: Globe,        title: "Connect your accounts",  body: `Link all ${LIVE_PLATFORM_COUNT} supported platforms in seconds. OAuth-secured — no password sharing required.` },
  { n: "02", Icon: Calendar,     title: "Create and schedule",    body: "Write captions, upload media, schedule to multiple platforms at once. Image, video, and text all supported." },
  { n: "03", Icon: CheckCircle2, title: "Publish and track",      body: "Posts go live on schedule. Monitor publish status, review history, and workspace analytics from one place." },
];

const PERSONAS = [
  {
    tag: "Influencer",
    headline: "Create once. Publish across every platform you need.",
    body: "Write captions, schedule, and publish to every platform in one sitting. Spend time making content, not copy-pasting it.",
    points: [`${LIVE_PLATFORM_COUNT} platforms from one dashboard`, "Image, video, and text support", "Visual content calendar", "14-day trial, no card needed"],
    chip: "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700/40 dark:text-purple-300",
    checkCls: "text-purple-500",
    accent: "hover:border-purple-300 dark:hover:border-purple-700",
    link: "text-purple-600 hover:text-purple-700 dark:text-purple-400",
  },
  {
    tag: "Agency",
    headline: "One workspace. Every client.",
    body: "Manage multiple brands, teams, and approval flows from a single operational hub. Built for agencies running at scale.",
    points: ["Multi-workspace management", "Team members with role-based access", "Client approval workflows", "Post history and analytics per brand"],
    chip: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700/40 dark:text-blue-300",
    checkCls: "text-blue-500",
    accent: "hover:border-blue-300 dark:hover:border-blue-700",
    link: "text-[var(--ds-blue-600)] hover:text-[var(--ds-blue-700)]",
  },
];

const TESTIMONIALS = [
  {
    quote: "We manage 14 client accounts across industries. SocialRaven is the first tool that doesn't feel like it's fighting us — approvals, handoffs, post queues all in one place.",
    name: "Sarah Chen", role: "Head of Social", company: "Clarity Agency", tag: "Agency · 14 clients",
    initials: "SC", avatarBg: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    quote: "As a creator juggling YouTube, Instagram, and LinkedIn, SocialRaven cuts my publishing time in half. The review links mean my editor can approve without needing access.",
    name: "Marcus T.", role: "Content Creator", company: "Independent", tag: "Creator · 180K followers",
    initials: "MT", avatarBg: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  {
    quote: "Our brand team used to send screenshots in Slack for approvals. Review links changed everything. Less chaos, more publishing.",
    name: "Priya Nair", role: "Social Media Lead", company: "Brandwave", tag: "Team · 3 brands managed",
    initials: "PN", avatarBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  {
    quote: "The scheduling calendar alone saved us 6+ hours per week. We used to do everything manually across tabs.",
    name: "James Okafor", role: "Digital Marketing Manager", company: "Nexus Group", tag: "Team · 8 brands",
    initials: "JO", avatarBg: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    quote: "I handle social for 3 DTC brands. Having everything in one place with approval flows means nothing slips through the cracks.",
    name: "Lena Fischer", role: "Social Media Manager", company: "Freelance", tag: "Creator · 3 brand clients",
    initials: "LF", avatarBg: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
];

const FAQ_ITEMS = [
  { q: "Is SocialRaven GDPR compliant?",              a: "SocialRaven uses privacy-conscious practices, scoped OAuth permissions, and clear public policy pages for how account and billing data are handled." },
  { q: "How does the free trial work?",               a: "Start with a 14-day trial workspace — no credit card required. Full access to all features from day one." },
  { q: "Does SocialRaven generate content?",          a: "No. SocialRaven is a scheduling and publishing platform. You bring the content — SocialRaven schedules and publishes it through official APIs." },
  { q: "Which platforms are supported?",              a: `Currently live: ${LIVE_PLATFORM_NAMES}.` },
  { q: "Can I manage multiple clients from one account?", a: "Yes. Pro and Agency plans are designed for multi-brand work — manage all clients from a single workspace with proper access controls." },
  { q: "What is the unified inbox?",                  a: "An upcoming feature that consolidates comments and DMs from all connected social accounts into one actionable workspace." },
];

/* ───────────────────────── Layout ──────────────────────────────────────── */
const W = "mx-auto w-full max-w-[88rem] px-6 md:px-10 lg:px-14";

/* ───────────────────────── Keyframes ───────────────────────────────────── */
const KEYFRAMES = `
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50%      { background-position: 100% 50%; }
  }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.55; }
    50%      { opacity: 0.85; }
  }
  @keyframes floatA {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-10px); }
  }
  @keyframes floatB {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }
  .gradient-text {
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    background-image: linear-gradient(130deg, hsl(212 86% 46%) 0%, hsl(228 72% 60%) 50%, hsl(212 86% 46%) 100%);
    background-size: 200% auto;
    animation: gradientShift 7s ease infinite;
  }
  .glow-pulse  { animation: glowPulse 9s ease-in-out infinite; }
  .float-a     { animation: floatA 6s ease-in-out infinite; }
  .float-b     { animation: floatB 8s ease-in-out infinite; }
  @keyframes fiberDown {
    from { top: -50%; }
    to   { top: 110%; }
  }
  @keyframes fiberOut {
    0% {
      opacity: 0;
      transform: translateX(-50%) scaleX(0.08);
    }
    20% {
      opacity: 0.95;
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) scaleX(1);
    }
  }
  .fiber-v { animation: fiberDown 1.6s linear infinite; }
  .fiber-h {
    animation: fiberOut 2.2s ease-out infinite;
    transform-origin: center;
  }
`;

/* ───────────────────────── Motion ──────────────────────────────────────── */
const EASE_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number];
const FV      = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } } };
const STAGGER = { visible: { transition: { staggerChildren: 0.09 } } };
const VP      = { once: true, margin: "-60px" };

/* ───────────────────────── Section pill ────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--ds-gray-400)] bg-white px-3.5 py-1 text-[0.75rem] font-medium text-[var(--ds-gray-900)] dark:bg-[var(--ds-background-200)]">
      {children}
    </span>
  );
}

/* ───────────────────────── Stars ───────────────────────────────────────── */
function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5 fill-amber-400" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.172c.969 0 1.371 1.24.588 1.81l-3.374 2.452a1 1 0 00-.364 1.118l1.287 3.967c.3.922-.755 1.688-1.54 1.118L10 14.347l-3.957 2.872c-.784.57-1.838-.196-1.539-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.054 9.394c-.783-.57-.38-1.81.588-1.81h4.172a1 1 0 00.95-.69l1.285-3.967z" />
        </svg>
      ))}
    </div>
  );
}

/* ───────────────────────── Dashboard Mock ──────────────────────────────── */
function DashboardMock() {
  const NAV_PATHS = [
    { d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", active: false },
    { d: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", active: true  },
    { d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", active: false },
    { d: "M4 6h16M4 12h16M4 18h16", active: false },
  ];
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[var(--ds-gray-200)] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.10),0_4px_16px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-[hsl(222_28%_8%)] dark:shadow-[0_48px_120px_-20px_rgba(0,0,0,0.72)]">
      {/* Chrome bar */}
      <div className="flex items-center gap-3 border-b border-[var(--ds-gray-100)] bg-[var(--ds-background-100)] px-4 py-3 dark:border-white/[0.06] dark:bg-[hsl(222_28%_6%)]">
        <div className="flex gap-1.5" aria-hidden="true">
          <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
          <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <div className="h-3 w-3 rounded-full bg-[#27C840]" />
        </div>
        <div className="mx-auto flex w-52 items-center justify-center rounded-md bg-[var(--ds-gray-100)] px-3 py-1 text-[0.6875rem] text-[var(--ds-gray-500)] dark:bg-white/[0.06] dark:text-white/30">
          app.socialraven.io
        </div>
        <div className="w-14" aria-hidden="true" />
      </div>
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-12 flex-col items-center gap-1 border-r border-[var(--ds-gray-100)] bg-[var(--ds-background-100)] py-3 dark:border-white/[0.05] dark:bg-[hsl(222_28%_6%)] sm:flex" aria-hidden="true">
          {NAV_PATHS.map(({ d, active }, i) => (
            <button key={i} tabIndex={-1} className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-[var(--ds-blue-100)] text-[var(--ds-blue-600)] dark:bg-white/10 dark:text-white/80" : "text-[var(--ds-gray-400)] dark:text-white/20"}`}>
              <svg className="h-[0.875rem] w-[0.875rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
            </button>
          ))}
        </div>
        {/* Main */}
        <div className="flex-1 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[0.75rem] font-semibold text-[var(--ds-gray-1000)]">Scheduled posts</p>
              <p className="mt-0.5 text-[0.625rem] text-[var(--ds-gray-500)]">April 2026 · 48 posts queued</p>
            </div>
            <button tabIndex={-1} className="self-start rounded-lg bg-[hsl(212_86%_50%)] px-2.5 py-1.5 text-[0.6875rem] font-semibold text-white sm:self-auto">+ New post</button>
          </div>
          <div className="space-y-1.5">
            {MOCK_POSTS.map((post, i) => {
              const cfg = STATUS_CONFIG[post.status];
              return (
                <div key={i} className="flex flex-col gap-2 rounded-xl border border-[var(--ds-gray-100)] bg-white px-3 py-2.5 hover:bg-[var(--ds-gray-50)] dark:border-white/[0.05] dark:bg-white/[0.025] dark:hover:bg-white/[0.05] sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex shrink-0 gap-1">
                      {post.platforms.slice(0, 3).map((Icon, j) => (
                        <div key={j} className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--ds-gray-200)] bg-[var(--ds-background-100)] dark:border-white/10 dark:bg-white/[0.06]">
                          <Icon className="h-2.5 w-2.5 text-[var(--ds-gray-600)] dark:text-white/55" />
                        </div>
                      ))}
                      {post.platforms.length > 3 && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--ds-gray-200)] bg-[var(--ds-background-100)] dark:border-white/10 dark:bg-white/[0.06]">
                          <span className="text-[0.5rem] text-[var(--ds-gray-500)] dark:text-white/40">+{post.platforms.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <p className="min-w-0 flex-1 truncate text-[0.6875rem] text-[var(--ds-gray-900)] dark:text-white/65">{post.title}</p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-3 pl-7 sm:ml-auto sm:w-auto sm:pl-0">
                    <span className="min-w-0 truncate text-[0.625rem] text-[var(--ds-gray-400)] dark:text-white/28">{post.time}</span>
                    <div className="flex shrink-0 items-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      <span className={`text-[0.625rem] font-medium ${cfg.text}`}>{cfg.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 dark:border-amber-500/15 dark:bg-amber-500/[0.05]">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="text-[0.6875rem] text-amber-700 dark:text-amber-300/80">3 posts awaiting approval</span>
            </div>
            <button tabIndex={-1} className="text-[0.625rem] font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400/70">Review →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Page ────────────────────────────────────── */
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
      <style>{KEYFRAMES}</style>
      <Navbar contentClassName="max-w-[88rem] px-4 sm:px-6" size="landing" />

      <div className="overflow-x-hidden bg-[hsl(40_6%_96%)] text-[var(--ds-gray-1000)] dark:bg-[var(--ds-background-100)]">

        {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
        <section className="relative mx-auto max-w-[88rem] overflow-hidden pb-0 pt-28">
          {/* Light bloom */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] dark:hidden" style={{ background: "radial-gradient(ellipse 70% 45% at 50% 0%, hsl(212 86% 82% / 0.20) 0%, transparent 56%)" }} aria-hidden="true" />
          {/* Dark bloom */}
          <div className="glow-pulse pointer-events-none absolute inset-x-0 top-0 hidden h-[44rem] dark:block" style={{ background: "radial-gradient(ellipse 80% 55% at 50% -5%, hsl(212 86% 54% / 0.22) 0%, transparent 61%)" }} aria-hidden="true" />
          {/* Dot grid — light mode base */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.28] dark:hidden" style={{ backgroundImage: "radial-gradient(circle, hsl(214 18% 46% / 0.68) 1.75px, transparent 1.75px)", backgroundSize: "1.75rem 1.75rem", maskImage: "linear-gradient(to bottom, black 0%, black 56%, transparent 81%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 56%, transparent 81%)" }} aria-hidden="true" />
          {/* Dot grid — light mode subtle glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] opacity-[0.34] dark:hidden" style={{ backgroundImage: "radial-gradient(circle, hsl(212 82% 66% / 0.44) 1.75px, transparent 1.75px)", backgroundSize: "1.75rem 1.75rem", maskImage: "radial-gradient(ellipse 76% 54% at 50% 8%, black 0%, transparent 69%)", WebkitMaskImage: "radial-gradient(ellipse 76% 54% at 50% 8%, black 0%, transparent 69%)", filter: "blur(0.55px) drop-shadow(0 0 8px hsl(212 86% 66% / 0.16))" }} aria-hidden="true" />
          {/* Dot grid — dark mode with glow */}
          <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{ backgroundImage: "radial-gradient(circle, hsl(212 86% 72% / 0.55) 1.75px, transparent 1.75px)", backgroundSize: "1.75rem 1.75rem", maskImage: "linear-gradient(to bottom, black 0%, black 46%, transparent 68%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 46%, transparent 68%)", filter: "blur(0.4px) drop-shadow(0 0 3px hsl(212 86% 65% / 0.6))" }} aria-hidden="true" />

          <div className={`${W} relative`}>

            {/* Floating widget A — top left: campaign live */}
            <motion.div
              initial={{ opacity: 0, x: -24, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0, ease: EASE_OUT }}
              className="float-a pointer-events-none absolute left-0 top-20 hidden xl:block"
              style={{ animationDelay: "0s" }}
              aria-hidden="true"
            >
              <div className="w-56 rounded-2xl border border-[var(--ds-gray-200)] bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.10)] dark:border-white/10 dark:bg-[var(--ds-background-100)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                    <CheckCircle2 className="h-4.5 w-4.5 h-[1.125rem] w-[1.125rem] text-emerald-600" />
                  </span>
                  <div>
                    <p className="text-[0.75rem] font-semibold text-[var(--ds-gray-1000)]">Campaign live</p>
                    <p className="text-[0.625rem] text-[var(--ds-gray-500)]">Published to {LIVE_PLATFORM_COUNT} platforms</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  {LIVE_PLATFORMS.map(({ Icon }, k) => (
                    <div key={k} className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--ds-gray-200)] bg-[var(--ds-background-100)]">
                      <Icon className="h-2.5 w-2.5 text-[var(--ds-gray-600)]" />
                    </div>
                  ))}
                  <span className="ml-auto text-[0.5625rem] font-semibold text-emerald-600">just now</span>
                </div>
              </div>
            </motion.div>

            {/* Floating widget B — top right: approval pending */}
            <motion.div
              initial={{ opacity: 0, x: 24, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 1.15, ease: EASE_OUT }}
              className="float-b pointer-events-none absolute right-0 top-12 hidden xl:block"
              style={{ animationDelay: "1.5s" }}
              aria-hidden="true"
            >
              <div className="w-52 rounded-2xl border border-[var(--ds-gray-200)] bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.10)] dark:border-white/10 dark:bg-[var(--ds-background-100)]">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </span>
                  <p className="text-[0.75rem] font-semibold text-[var(--ds-gray-1000)]">Review needed</p>
                </div>
                <p className="mt-2 text-[0.625rem] leading-relaxed text-[var(--ds-gray-500)]">3 posts awaiting client approval before publishing</p>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--ds-gray-100)]">
                  <div className="h-full w-[62%] rounded-full bg-amber-400" />
                </div>
                <p className="mt-1 text-right text-[0.5625rem] text-[var(--ds-gray-400)]">5 / 8 approved</p>
              </div>
            </motion.div>

            {/* Floating widget C — lower left: post stats */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.3, ease: EASE_OUT }}
              className="float-b pointer-events-none absolute bottom-52 left-0 hidden xl:block"
              style={{ animationDelay: "3s" }}
              aria-hidden="true"
            >
              <div className="w-48 rounded-2xl border border-[var(--ds-gray-200)] bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.10)] dark:border-white/10 dark:bg-[var(--ds-background-100)]">
                <p className="text-[0.6875rem] font-semibold text-[var(--ds-gray-700)]">Posts this week</p>
                <p className="mt-0.5 text-[1.5rem] font-black tracking-tight text-[var(--ds-gray-1000)]">48</p>
                <div className="mt-2.5 flex items-end gap-1" style={{ height: "2.5rem" }}>
                  {[55, 40, 75, 50, 85, 65, 100].map((h, k) => (
                    <div key={k} className="flex-1 rounded-sm bg-[hsl(212_86%_50%)]" style={{ height: `${h}%`, opacity: k === 6 ? 1 : 0.25 + k * 0.1 }} />
                  ))}
                </div>
                <p className="mt-1.5 text-[0.5625rem] font-semibold text-emerald-600">↑ 28% vs last week</p>
              </div>
            </motion.div>

            {/* Floating widget D — lower right: connected accounts */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.45, ease: EASE_OUT }}
              className="float-a pointer-events-none absolute bottom-60 right-0 hidden xl:block"
              style={{ animationDelay: "4s" }}
              aria-hidden="true"
            >
              <div className="w-52 rounded-2xl border border-[var(--ds-gray-200)] bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.10)] dark:border-white/10 dark:bg-[var(--ds-background-100)]">
                <div className="mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[hsl(212_86%_50%)]" />
                  <p className="text-[0.6875rem] font-semibold text-[var(--ds-gray-900)]">Connected accounts</p>
                </div>
                {LIVE_PLATFORMS.map(({ Icon, name, dot }, k) => (
                  <div key={k} className="flex items-center gap-2 py-0.5">
                    <Icon className="h-3 w-3 text-[var(--ds-gray-600)]" />
                    <span className="flex-1 text-[0.5625rem] text-[var(--ds-gray-600)]">{name}</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Center copy */}
            <motion.div initial="hidden" animate="visible" variants={STAGGER} className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <motion.div variants={FV}>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ds-gray-300)] bg-white/90 px-3.5 py-1.5 text-[0.75rem] font-medium text-[var(--ds-gray-900)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Live on {LIVE_PLATFORM_COUNT} platforms · 14-day trial, no card needed
                </span>
              </motion.div>

              <motion.h1 variants={FV} className="mt-7 text-[clamp(3rem,7vw,5.5rem)] font-black leading-[0.9] tracking-[-0.048em] text-[var(--ds-gray-1000)]">
                Post to every
                <br />
                platform.
                <br />
                <span className="gradient-text">From one place.</span>
              </motion.h1>

              <motion.p variants={FV} className="mt-7 max-w-[30rem] text-[1.0625rem] leading-[1.72] text-[var(--ds-gray-700)]">
                Schedule, publish, and get approvals across {LIVE_PLATFORM_NAMES} — without switching tabs or copy-pasting captions.
              </motion.p>

              <motion.div variants={FV} className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[hsl(212_86%_48%)] px-8 text-[0.9375rem] font-semibold text-white shadow-[0_4px_16px_hsl(212_86%_48%/0.38)] transition-all duration-150 hover:bg-[hsl(212_86%_43%)] hover:shadow-[0_6px_24px_hsl(212_86%_48%/0.48)]"
                >
                  Start for free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex h-12 items-center rounded-xl border border-[var(--ds-gray-300)] bg-white px-8 text-[0.9375rem] font-medium text-[var(--ds-gray-900)] transition-all duration-150 hover:border-[var(--ds-gray-400)] hover:shadow-sm dark:bg-white/5 dark:hover:bg-white/10"
                >
                  View pricing
                </Link>
              </motion.div>

              <motion.p variants={FV} className="mt-4 text-[0.75rem] text-[var(--ds-gray-500)]">
                No credit card · GDPR-conscious · OAuth-secured
              </motion.p>
            </motion.div>

            {/* Dashboard screenshot */}
            <motion.div
              initial={{ opacity: 0, y: 48, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.55, ease: EASE_OUT }}
              className="relative mx-auto mt-16 max-w-[58rem]"
            >
              <div className="pointer-events-none absolute -inset-x-8 -bottom-8 h-28 blur-3xl" style={{ background: "radial-gradient(ellipse at 50% 100%, hsl(212 86% 55% / 0.22) 0%, transparent 70%)" }} aria-hidden="true" />
              <DashboardMock />
            </motion.div>
          </div>

          {/* Bottom fade into next section */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 dark:hidden" style={{ background: "linear-gradient(to bottom, transparent, hsl(40 6% 96%))" }} aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-24 dark:block" style={{ background: "linear-gradient(to bottom, transparent, var(--ds-background-100))" }} aria-hidden="true" />
        </section>

        {/* ══════════════════════════ STATS BAR ═══════════════════════════════ */}
        <section className="border-y border-[var(--ds-gray-200)] bg-white py-8 dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-200)]">
          <div className={W}>
            <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
              {[
                { v: String(LIVE_PLATFORM_COUNT),    l: "Live platforms"     },
                { v: "14-day",                    l: "Free trial"         },
                { v: "OAuth",                     l: "Secure connections" },
              ].map(({ v, l }) => (
                <div key={l} className="text-center">
                  <p className="text-[2rem] font-black tracking-[-0.04em] text-[var(--ds-gray-1000)]">{v}</p>
                  <p className="mt-0.5 text-[0.75rem] text-[var(--ds-gray-600)]">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════ FEATURES ════════════════════════════════ */}
        <section id="features" className="py-24">
          <div className={W}>
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER} className="mb-14">
              <motion.div variants={FV}><Label>Features</Label></motion.div>
              <motion.h2 variants={FV} className="mt-4 max-w-2xl text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
                Everything you need to run<br />your social presence.
              </motion.h2>
              <motion.p variants={FV} className="mt-3 max-w-lg text-[1rem] leading-[1.7] text-[var(--ds-gray-700)]">
                One clean interface. No tab juggling. No copy-pasting captions across platforms.
              </motion.p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {FEATURES.map(({ Icon, tag, title, description, iconCls, mockBg }) => (
                <motion.div
                  key={title}
                  variants={FV}
                  className="group overflow-hidden rounded-2xl border border-[var(--ds-gray-200)] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-100)]"
                >
                  {/* Colored illustration zone */}
                  <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${mockBg}`}>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${iconCls}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[var(--ds-gray-500)]">{tag}</p>
                    <h3 className="text-[1.0625rem] font-bold tracking-[-0.02em] text-[var(--ds-gray-1000)]">{title}</h3>
                    <p className="mt-2 text-[0.875rem] leading-[1.65] text-[var(--ds-gray-700)]">{description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════ PLATFORM HUB ════════════════════════════════ */}
        <section className="border-y border-[var(--ds-gray-200)] bg-white py-24 dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-200)]">
          <div className={W}>
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER} className="mb-14 flex flex-col items-center text-center">
              <motion.div variants={FV}><Label>Integrations</Label></motion.div>
              <motion.h2 variants={FV} className="mt-4 max-w-xl text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
                Publish to every platform that matters.
              </motion.h2>
              <motion.p variants={FV} className="mt-3 max-w-lg text-[1rem] leading-[1.7] text-[var(--ds-gray-700)]">
                One workflow, all major platforms. Threads and TikTok are live now.
              </motion.p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER} className="flex flex-col items-center">

              {/* Globe hub */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[hsl(212_86%_48%)] bg-white shadow-[0_0_0_8px_hsl(212_86%_48%/0.08)] dark:bg-[var(--ds-background-100)]">
                <Globe className="h-7 w-7 text-[hsl(212_86%_48%)]" />
              </div>

              {/* Vertical trunk */}
              <div className="relative h-10 w-px overflow-hidden bg-[var(--ds-gray-200)] dark:bg-white/[0.08]">
                <div className="fiber-v absolute inset-x-0 h-[50%] bg-gradient-to-b from-transparent via-[hsl(212_86%_58%)] to-transparent" />
              </div>

              {/* Horizontal bus + drops + tiles */}
              <div className="w-full">
                {/* Horizontal bus */}
                <div className="relative mx-[calc((100%-1.5rem)/14)] h-px overflow-hidden bg-[var(--ds-gray-200)] sm:mx-[calc((100%-3rem)/14)] md:mx-[calc((100%-4.5rem)/14)] dark:bg-white/[0.08]">
                  <div className="fiber-h absolute inset-y-0 left-1/2 w-full bg-gradient-to-r from-transparent via-[hsl(212_86%_58%)] to-transparent" />
                </div>

                {/* Platform tiles grid */}
                <div className="grid grid-cols-7 gap-1 pt-2 sm:gap-2 md:gap-3">
                  {PLATFORMS.map(({ Icon, name, color, bg, soon }, i) => (
                    <div key={name} className="flex flex-col items-center">
                      {/* Drop line */}
                      <div className="relative h-4 w-px overflow-hidden bg-[var(--ds-gray-200)] dark:bg-white/[0.08] md:h-8">
                        <div
                          className="fiber-v absolute inset-x-0 h-[50%] bg-gradient-to-b from-transparent via-[hsl(212_86%_58%)] to-transparent"
                          style={{ animationDelay: `${i * 0.22}s` }}
                        />
                      </div>

                      {/* Tile */}
                      <motion.div
                        variants={FV}
                        className={`group flex aspect-square w-full items-center justify-center rounded-xl border p-1 transition-all duration-200 md:aspect-auto md:flex-col md:gap-3 md:rounded-2xl md:p-5 ${
                          soon
                            ? "border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] opacity-50 dark:bg-white/[0.02]"
                            : "border-[var(--ds-gray-200)] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] dark:bg-[var(--ds-background-100)]"
                        }`}
                        aria-label={soon ? `${name} coming soon` : name}
                      >
                        <div className={`flex h-5 w-5 items-center justify-center rounded-md md:h-11 md:w-11 md:rounded-xl ${bg}`}>
                          <Icon className={`h-3 w-3 md:h-5 md:w-5 ${color}`} />
                        </div>
                        <div className="hidden text-center md:block">
                          <p className={`text-[0.6875rem] font-semibold ${soon ? "text-[var(--ds-gray-400)]" : "text-[var(--ds-gray-900)]"}`}>{name}</p>
                          {soon && <p className="mt-0.5 text-[0.5625rem] font-medium text-[var(--ds-gray-400)]">Soon</p>}
                        </div>
                        <span className="sr-only">{soon ? `${name} coming soon` : name}</span>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        </section>

        {/* ════════════════════════ HOW IT WORKS ══════════════════════════════ */}
        <section id="how-it-works" className="py-24">
          <div className={W}>
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER} className="mb-14 flex flex-col items-center text-center">
              <motion.div variants={FV}><Label>How it works</Label></motion.div>
              <motion.h2 variants={FV} className="mt-4 max-w-xl text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
                Up and running in minutes.
              </motion.h2>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER} className="relative grid gap-6 md:grid-cols-3">
              <div className="pointer-events-none absolute left-[calc((100%-3rem)/6)] top-8 hidden h-px w-[calc((200%+3rem)/3)] border-t-2 border-dashed border-[var(--ds-gray-300)] md:block" aria-hidden="true" />
              {STEPS.map(({ n, Icon, title, body }) => (
                <motion.div key={n} variants={FV} className="flex flex-col items-center text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--ds-gray-200)] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-[var(--ds-background-100)]">
                    <Icon className="h-6 w-6 text-[hsl(212_86%_48%)]" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(212_86%_48%)] text-[0.5625rem] font-bold text-white">{n}</span>
                  </div>
                  <h3 className="mt-5 text-[1.0625rem] font-bold tracking-[-0.02em] text-[var(--ds-gray-1000)]">{title}</h3>
                  <p className="mt-2 text-[0.875rem] leading-[1.65] text-[var(--ds-gray-700)]">{body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════ PERSONAS ══════════════════════════════════ */}
        <section id="solutions" className="border-y border-[var(--ds-gray-200)] bg-white py-24 dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-200)]">
          <div className={W}>
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER} className="mb-14">
              <motion.div variants={FV}><Label>Who it&apos;s for</Label></motion.div>
              <motion.h2 variants={FV} className="mt-4 max-w-xl text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
                Different workflows, one platform.
              </motion.h2>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER} className="grid gap-4 lg:grid-cols-2">
              {PERSONAS.map((p) => (
                <motion.div
                  key={p.tag}
                  variants={FV}
                  className={`flex flex-col rounded-2xl border border-[var(--ds-gray-200)] bg-white p-7 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] dark:bg-[var(--ds-background-100)] ${p.accent}`}
                >
                  <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold ${p.chip}`}>{p.tag}</span>
                  <h3 className="mt-5 text-[1.25rem] font-bold leading-[1.2] tracking-[-0.025em] text-[var(--ds-gray-1000)]">{p.headline}</h3>
                  <p className="mt-3 text-[0.875rem] leading-[1.65] text-[var(--ds-gray-700)]">{p.body}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-2.5 text-[0.875rem] text-[var(--ds-gray-800)]">
                        <Check className={`h-3.5 w-3.5 shrink-0 ${p.checkCls}`} />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 border-t border-[var(--ds-gray-100)] pt-6 dark:border-[var(--ds-gray-400)]">
                    <Link href="/sign-up" className={`text-[0.875rem] font-semibold transition-colors ${p.link}`}>
                      Start free trial →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ════════════════════ UNIFIED INBOX TEASER ══════════════════════════ */}
        <section className="relative overflow-hidden border-y border-[var(--ds-gray-200)] bg-white py-24 dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-200)]">
          <div className={`${W} relative`}>
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER} className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <motion.div variants={FV}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(212_86%_54%/0.3)] bg-[hsl(212_86%_54%/0.08)] px-3 py-1 text-[0.75rem] font-medium text-[hsl(212_86%_42%)] dark:text-[hsl(212_86%_72%)]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(212_86%_52%)]" />
                    Coming soon
                  </span>
                </motion.div>
                <motion.h2 variants={FV} className="mt-6 text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
                  One inbox for every
                  <br />
                  <span className="gradient-text">comment and message.</span>
                </motion.h2>
                <motion.p variants={FV} className="mt-5 max-w-md text-[1rem] leading-[1.7] text-[var(--ds-gray-700)]">
                  Stop switching apps to manage replies. SocialRaven&apos;s unified inbox will consolidate comments and DMs from all your platforms into one actionable workspace.
                </motion.p>
                <motion.div variants={FV} className="mt-7 flex flex-wrap gap-2">
                  {["Instagram DMs", "X replies", "LinkedIn messages", "FB comments", "YouTube comments", "TikTok comments"].map((p) => (
                    <span key={p} className="rounded-full border border-[var(--ds-gray-200)] bg-[var(--ds-gray-100)] px-3 py-1.5 text-[0.75rem] text-[var(--ds-gray-700)] dark:border-white/10 dark:bg-white/[0.05]">{p}</span>
                  ))}
                </motion.div>
                <motion.div variants={FV} className="mt-8">
                  <Link href="/sign-up" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--ds-gray-300)] bg-[var(--ds-gray-100)] px-6 text-[0.9rem] font-semibold text-[var(--ds-gray-1000)] transition-all duration-150 hover:border-[var(--ds-gray-400)] hover:bg-[var(--ds-gray-200)] dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10">
                    Get early access <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>

              <motion.div variants={FV}>
                <div className="overflow-hidden rounded-2xl border border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-[var(--ds-background-100)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.40)]">
                  <div className="flex items-center gap-3 border-b border-[var(--ds-gray-200)] px-4 py-3.5 dark:border-white/[0.07]">
                    <MessageSquare className="h-4 w-4 text-[var(--ds-gray-500)]" />
                    <span className="text-[0.8125rem] font-semibold text-[var(--ds-gray-900)]">Unified Inbox</span>
                    <span className="ml-auto rounded-full bg-[hsl(212_86%_48%/0.12)] px-2 py-0.5 text-[0.625rem] font-bold text-[hsl(212_86%_42%)] dark:bg-[hsl(212_86%_48%/0.25)] dark:text-[hsl(212_86%_75%)]">12 new</span>
                  </div>
                  {[
                    { Icon: Instagram, name: "@sarah.design",  msg: "Love this post! Can I reshare it?",      time: "2m",  dot: "bg-pink-500"  },
                    { Icon: Twitter,   name: "@dev_marcus",    msg: "This is exactly what I needed, thanks!", time: "5m",  dot: "bg-sky-400"   },
                    { Icon: Linkedin,  name: "Priya N.",       msg: "Great insight — sharing with my team.",  time: "12m", dot: "bg-blue-500"  },
                    { Icon: Facebook,  name: "John D.",        msg: "When is the next update coming out?",    time: "18m", dot: "bg-blue-400"  },
                    { Icon: Youtube,   name: "@channel_xyz",   msg: "Subscribed! Amazing content 🎉",        time: "24m", dot: "bg-red-500"   },
                  ].map((row, i) => (
                    <div key={i} className="flex items-start gap-3 border-b border-[var(--ds-gray-200)] px-4 py-3.5 transition-colors hover:bg-[var(--ds-gray-100)] dark:border-white/[0.05] dark:hover:bg-white/[0.03]">
                      <div className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--ds-gray-200)] bg-white dark:border-white/10 dark:bg-white/[0.06]">
                        <row.Icon className="h-3.5 w-3.5 text-[var(--ds-gray-600)] dark:text-white/55" />
                        <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--ds-gray-50)] dark:border-[var(--ds-background-100)] ${row.dot}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.6875rem] font-semibold text-[var(--ds-gray-900)]">{row.name}</p>
                        <p className="mt-0.5 truncate text-[0.6875rem] text-[var(--ds-gray-600)]">{row.msg}</p>
                      </div>
                      <span className="shrink-0 text-[0.5625rem] text-[var(--ds-gray-400)]">{row.time}</span>
                    </div>
                  ))}
                  <div className="px-4 py-3 text-center text-[0.625rem] text-[var(--ds-gray-400)]">and 7 more messages across {LIVE_PLATFORM_COUNT} platforms</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════ TESTIMONIALS ══════════════════════════════ */}
        <section className="py-24">
          <div className={W}>
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER} className="mb-14 flex flex-col items-center text-center">
              <motion.div variants={FV}><Label>Testimonials</Label></motion.div>
              <motion.h2 variants={FV} className="mt-4 max-w-xl text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
                Trusted by teams that publish every day.
              </motion.h2>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER}>
              <div className="grid gap-4 md:grid-cols-3">
                {TESTIMONIALS.slice(0, 3).map((t) => (
                  <motion.div key={t.name} variants={FV} className="flex flex-col rounded-2xl border border-[var(--ds-gray-200)] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-100)]">
                    <Stars />
                    <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-[1.65] text-[var(--ds-gray-800)]">&ldquo;{t.quote}&rdquo;</blockquote>
                    <div className="mt-5 flex items-center gap-3 border-t border-[var(--ds-gray-100)] pt-5 dark:border-[var(--ds-gray-400)]">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold ${t.avatarBg}`}>{t.initials}</div>
                      <div>
                        <p className="text-[0.875rem] font-semibold text-[var(--ds-gray-1000)]">{t.name}</p>
                        <p className="text-[0.75rem] text-[var(--ds-gray-500)]">{t.role} · {t.company}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {TESTIMONIALS.slice(3, 5).map((t) => (
                  <motion.div key={t.name} variants={FV} className="flex flex-col rounded-2xl border border-[var(--ds-gray-200)] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-100)]">
                    <Stars />
                    <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-[1.65] text-[var(--ds-gray-800)]">&ldquo;{t.quote}&rdquo;</blockquote>
                    <div className="mt-5 flex items-center gap-3 border-t border-[var(--ds-gray-100)] pt-5 dark:border-[var(--ds-gray-400)]">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold ${t.avatarBg}`}>{t.initials}</div>
                      <div>
                        <p className="text-[0.875rem] font-semibold text-[var(--ds-gray-1000)]">{t.name}</p>
                        <p className="text-[0.75rem] text-[var(--ds-gray-500)]">{t.role} · {t.company}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════ PRICING ════════════════════════════════════ */}
        <section id="pricing" className="border-y border-[var(--ds-gray-200)] bg-white py-24 dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-200)]">
          <div className={W}>
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER} className="mb-14">
              <motion.div variants={FV}><Label>Pricing</Label></motion.div>
              <motion.h2 variants={FV} className="mt-4 max-w-xl text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
                Simple, transparent pricing.
              </motion.h2>
              <motion.p variants={FV} className="mt-3 text-[1rem] text-[var(--ds-gray-700)]">
                Start free for 14 days. No credit card required. Upgrade when ready.
              </motion.p>
            </motion.div>
            <PricingGrid />
          </div>
        </section>

        {/* ════════════════════════ FAQ ════════════════════════════════════════ */}
        <section className="py-24">
          <div className="mx-auto w-full max-w-3xl px-6 md:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER} className="mb-12">
              <motion.div variants={FV}><Label>FAQ</Label></motion.div>
              <motion.h2 variants={FV} className="mt-4 text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
                Common questions.
              </motion.h2>
            </motion.div>
            <div>
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="border-b border-[var(--ds-gray-200)] last:border-b-0 dark:border-[var(--ds-gray-400)]">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none"
                    aria-expanded={openFaq === i}
                  >
                    <span className="text-[0.9375rem] font-semibold text-[var(--ds-gray-1000)]">{item.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--ds-gray-500)] transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="pb-5 text-[0.9375rem] leading-[1.65] text-[var(--ds-gray-700)]">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════ FINAL CTA ══════════════════════════════════ */}
        <section className="relative overflow-hidden border-t border-[var(--ds-gray-200)] bg-white py-32 dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-200)]">
          <div className="pointer-events-none absolute inset-0 dark:hidden" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 120%, hsl(212 86% 82% / 0.22) 0%, transparent 60%)" }} aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 120%, hsl(212 86% 54% / 0.12) 0%, transparent 60%)" }} aria-hidden="true" />

          <div className="relative">
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={STAGGER} className="flex flex-col items-center text-center">
              <motion.h2 variants={FV} className="text-[clamp(2.5rem,6.5vw,5rem)] font-black leading-[0.92] tracking-[-0.048em] text-[var(--ds-gray-1000)]">
                Ready to take control of<br />your <span className="gradient-text">social presence?</span>
              </motion.h2>
              <motion.p variants={FV} className="mt-6 max-w-lg text-[1.0625rem] leading-[1.7] text-[var(--ds-gray-700)]">
                Start your free 14-day trial. No credit card required. Just clean, professional social publishing — from one workspace.
              </motion.p>
              <motion.div variants={FV} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/sign-up"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[hsl(212_86%_48%)] px-8 text-[0.9375rem] font-semibold text-white shadow-[0_4px_16px_hsl(212_86%_48%/0.38)] transition-all duration-150 hover:bg-[hsl(212_86%_43%)] hover:shadow-[0_6px_24px_hsl(212_86%_48%/0.48)]"
                >
                  Start for free — no card needed
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex h-12 items-center rounded-xl border border-[var(--ds-gray-300)] bg-white px-8 text-[0.9375rem] font-medium text-[var(--ds-gray-900)] transition-all duration-150 hover:border-[var(--ds-gray-400)] hover:shadow-sm dark:bg-white/5 dark:hover:bg-white/10"
                >
                  View pricing
                </Link>
              </motion.div>
              <motion.div variants={FV} className="mt-6 flex flex-wrap items-center justify-center gap-5 text-[0.8125rem] text-[var(--ds-gray-600)]">
                {["No credit card required", "GDPR-conscious", "OAuth-secured", "Cancel anytime"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

      </div>

      <PublicSiteFooter contentClassName="max-w-[88rem] px-6 py-14 md:px-10" />
    </>
  );
}

import type { ComponentType } from "react";

import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Shield,
  Twitter,
  Users,
  Youtube,
  Zap,
} from "lucide-react";

import { ThreadsIcon } from "@/components/generic/platform-svg-icons";

export type LandingPageIcon = ComponentType<{ className?: string }>;

type LandingPlatform = {
  Icon: LandingPageIcon;
  name: string;
  color: string;
  bg: string;
  dot: string;
  soon: boolean;
};

type MockPostStatus = "live" | "queued" | "review" | "draft";

type MockPost = {
  platforms: LandingPageIcon[];
  title: string;
  time: string;
  status: MockPostStatus;
};

type StatusConfig = Record<
  MockPostStatus,
  {
    label: string;
    dot: string;
    text: string;
  }
>;

type Feature = {
  Icon: LandingPageIcon;
  tag: string;
  title: string;
  description: string;
  iconCls: string;
  mockBg: string;
};

type Step = {
  n: string;
  Icon: LandingPageIcon;
  title: string;
  body: string;
};

type Persona = {
  tag: string;
  headline: string;
  body: string;
  points: string[];
  chip: string;
  checkCls: string;
  accent: string;
  link: string;
};

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  tag: string;
  initials: string;
  avatarBg: string;
};

type FaqItem = {
  q: string;
  a: string;
};

function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.321 5.562a5.124 5.124 0 01-.443-.258 6.228 6.228 0 01-1.137-.966c-.85-.971-1.166-1.943-1.282-2.645h.004C16.378 1.297 16.42 1 16.427 1H12.6v15.139a2.952 2.952 0 01-2.948 2.717 2.948 2.948 0 01-2.948-2.948 2.948 2.948 0 012.948-2.948c.29 0 .568.042.831.119V9.217a7.043 7.043 0 00-.831-.05 7.108 7.108 0 00-7.108 7.108 7.108 7.108 0 007.108 7.108 7.108 7.108 0 007.108-7.108V8.757a10.65 10.65 0 006.234 2.005v-3.75a6.156 6.156 0 01-3.673-1.45z" />
    </svg>
  );
}

function formatList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export const PLATFORMS: LandingPlatform[] = [
  { Icon: Instagram, name: "Instagram", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10", dot: "bg-pink-400", soon: false },
  { Icon: Twitter, name: "X / Twitter", color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-500/10", dot: "bg-sky-400", soon: false },
  { Icon: Linkedin, name: "LinkedIn", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", dot: "bg-blue-500", soon: false },
  { Icon: Youtube, name: "YouTube", color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", dot: "bg-red-400", soon: false },
  { Icon: Facebook, name: "Facebook", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", dot: "bg-blue-400", soon: false },
  { Icon: ThreadsIcon, name: "Threads", color: "text-[var(--ds-gray-800)]", bg: "bg-[var(--ds-gray-100)] dark:bg-white/5", dot: "bg-[var(--ds-gray-700)]", soon: false },
  { Icon: TikTokIcon, name: "TikTok", color: "text-[var(--ds-gray-800)]", bg: "bg-[var(--ds-gray-100)] dark:bg-white/5", dot: "bg-[var(--ds-gray-700)]", soon: false },
];

export const LIVE_PLATFORMS = PLATFORMS.filter(({ soon }) => !soon);
export const LIVE_PLATFORM_COUNT = LIVE_PLATFORMS.length;
export const LIVE_PLATFORM_NAMES = formatList(LIVE_PLATFORMS.map(({ name }) => name));

export const MOCK_POSTS: MockPost[] = [
  { platforms: [Instagram, Twitter, Linkedin], title: "Q2 campaign — new product launch", time: "Today, 7:30 PM", status: "live" },
  { platforms: [Facebook, Youtube], title: "Behind the scenes — studio walkthrough", time: "Today, 9:00 PM", status: "queued" },
  { platforms: [Instagram], title: "Team spotlight: meet our designers", time: "Tomorrow, 12:00 PM", status: "review" },
  { platforms: [Instagram, Twitter, Linkedin, Facebook], title: "Monthly newsletter: April roundup", time: "Apr 12, 10:00 AM", status: "draft" },
];

export const STATUS_CONFIG: StatusConfig = {
  live: { label: "Live", dot: "bg-emerald-400", text: "text-emerald-700 dark:text-emerald-400" },
  queued: { label: "Queued", dot: "bg-blue-400", text: "text-blue-700 dark:text-blue-400" },
  review: { label: "Review", dot: "bg-amber-400", text: "text-amber-700 dark:text-amber-400" },
  draft: { label: "Draft", dot: "bg-[var(--ds-gray-400)]", text: "text-[var(--ds-gray-600)]" },
};

export const FEATURES: Feature[] = [
  {
    Icon: Calendar,
    tag: "Planning",
    title: "Visual content calendar",
    description: "See every scheduled post across all platforms at a glance. Drag, reorder, and batch-schedule without losing track of what's live.",
    iconCls: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    mockBg: "from-blue-50 to-sky-50/60 dark:from-blue-900/20 dark:to-blue-900/5",
  },
  {
    Icon: Zap,
    tag: "Publishing",
    title: "One post. All platforms.",
    description: "Write once, publish from one place. Official API connections — no browser extensions, no copy-pasting captions across separate tabs.",
    iconCls: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    mockBg: "from-amber-50 to-orange-50/60 dark:from-amber-900/20 dark:to-amber-900/5",
  },
  {
    Icon: Users,
    tag: "Collaboration",
    title: "Review before anything goes live",
    description: "Share a private review link, collect approvals from clients or stakeholders, and publish only when everyone signs off.",
    iconCls: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    mockBg: "from-purple-50 to-violet-50/60 dark:from-purple-900/20 dark:to-purple-900/5",
  },
  {
    Icon: BarChart3,
    tag: "Analytics",
    title: "Post history and workspace reports",
    description: "Track every post across every platform from one dashboard. See what published, when, and to which accounts.",
    iconCls: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    mockBg: "from-emerald-50 to-teal-50/60 dark:from-emerald-900/20 dark:to-emerald-900/5",
  },
  {
    Icon: Shield,
    tag: "Security",
    title: "OAuth-secured connections",
    description: "Every platform connection uses official OAuth — no password storage, no third-party workarounds. Workspace-scoped access controls.",
    iconCls: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
    mockBg: "from-rose-50 to-pink-50/60 dark:from-rose-900/20 dark:to-rose-900/5",
  },
  {
    Icon: Globe,
    tag: "Scale",
    title: "Multi-account management",
    description: "Organize brands, workspaces, and connected profiles in one place. Built for agencies and multi-brand teams from day one.",
    iconCls: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",
    mockBg: "from-sky-50 to-blue-50/60 dark:from-sky-900/20 dark:to-blue-900/5",
  },
];

export const STEPS: Step[] = [
  { n: "01", Icon: Globe, title: "Connect your accounts", body: `Link all ${LIVE_PLATFORM_COUNT} supported platforms in seconds. OAuth-secured — no password sharing required.` },
  { n: "02", Icon: Calendar, title: "Create and schedule", body: "Write captions, upload media, schedule to multiple platforms at once. Image, video, and text all supported." },
  { n: "03", Icon: CheckCircle2, title: "Publish and track", body: "Posts go live on schedule. Monitor publish status, review history, and workspace analytics from one place." },
];

export const PERSONAS: Persona[] = [
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

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "We manage 14 client accounts across industries. SocialRaven is the first tool that doesn't feel like it's fighting us — approvals, handoffs, post queues all in one place.",
    name: "Sarah Chen",
    role: "Head of Social",
    company: "Clarity Agency",
    tag: "Agency · 14 clients",
    initials: "SC",
    avatarBg: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    quote: "As a creator juggling YouTube, Instagram, and LinkedIn, SocialRaven cuts my publishing time in half. The review links mean my editor can approve without needing access.",
    name: "Marcus T.",
    role: "Content Creator",
    company: "Independent",
    tag: "Creator · 180K followers",
    initials: "MT",
    avatarBg: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  {
    quote: "Our brand team used to send screenshots in Slack for approvals. Review links changed everything. Less chaos, more publishing.",
    name: "Priya Nair",
    role: "Social Media Lead",
    company: "Brandwave",
    tag: "Team · 3 brands managed",
    initials: "PN",
    avatarBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  {
    quote: "The scheduling calendar alone saved us 6+ hours per week. We used to do everything manually across tabs.",
    name: "James Okafor",
    role: "Digital Marketing Manager",
    company: "Nexus Group",
    tag: "Team · 8 brands",
    initials: "JO",
    avatarBg: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    quote: "I handle social for 3 DTC brands. Having everything in one place with approval flows means nothing slips through the cracks.",
    name: "Lena Fischer",
    role: "Social Media Manager",
    company: "Freelance",
    tag: "Creator · 3 brand clients",
    initials: "LF",
    avatarBg: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  { q: "Is SocialRaven GDPR compliant?", a: "SocialRaven uses privacy-conscious practices, scoped OAuth permissions, and clear public policy pages for how account and billing data are handled." },
  { q: "How does the free trial work?", a: "Start with a 14-day trial workspace — no credit card required. Full access to all features from day one." },
  { q: "Does SocialRaven generate content?", a: "No. SocialRaven is a scheduling and publishing platform. You bring the content — SocialRaven schedules and publishes it through official APIs." },
  { q: "Which platforms are supported?", a: `Currently live: ${LIVE_PLATFORM_NAMES}.` },
  { q: "Can I manage multiple clients from one account?", a: "Yes. Pro and Agency plans are designed for multi-brand work — manage all clients from a single workspace with proper access controls." },
  { q: "What is the unified inbox?", a: "An upcoming feature that consolidates comments and DMs from all connected social accounts into one actionable workspace." },
];

export const LANDING_PAGE_CONTAINER_CLASS = "mx-auto w-full max-w-[88rem] px-6 md:px-10 lg:px-14";

export const LANDING_PAGE_KEYFRAMES = `
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

export const LANDING_PAGE_EASE_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const LANDING_PAGE_FADE_VARIANT = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: LANDING_PAGE_EASE_OUT },
  },
};

export const LANDING_PAGE_STAGGER_VARIANT = {
  visible: {
    transition: { staggerChildren: 0.09 },
  },
};

export const LANDING_PAGE_VIEWPORT = { once: true, margin: "-60px" };

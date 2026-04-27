import { motion } from "framer-motion";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  MessageSquare,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
  LIVE_PLATFORM_COUNT,
} from "@/components/landing-page/landing-page-constants";

export function LandingPageUnifiedInboxSection() {
  return (
    <section className="relative overflow-hidden border-y border-[var(--ds-gray-200)] bg-white py-24 dark:border-[var(--ds-gray-400)] dark:bg-[var(--ds-background-200)]">
      <div className={`${LANDING_PAGE_CONTAINER_CLASS} relative`}>
        <motion.div initial="hidden" whileInView="visible" viewport={LANDING_PAGE_VIEWPORT} variants={LANDING_PAGE_STAGGER_VARIANT} className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <motion.div variants={LANDING_PAGE_FADE_VARIANT}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(212_86%_54%/0.3)] bg-[hsl(212_86%_54%/0.08)] px-3 py-1 text-[0.75rem] font-medium text-[hsl(212_86%_42%)] dark:text-[hsl(212_86%_72%)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(212_86%_52%)]" />
                Coming soon
              </span>
            </motion.div>
            <motion.h2 variants={LANDING_PAGE_FADE_VARIANT} className="mt-6 text-[clamp(1.875rem,4vw,2.875rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--ds-gray-1000)]">
              One inbox for every
              <br />
              <span className="gradient-text">comment and message.</span>
            </motion.h2>
            <motion.p variants={LANDING_PAGE_FADE_VARIANT} className="mt-5 max-w-md text-[1rem] leading-[1.7] text-[var(--ds-gray-700)]">
              Stop switching apps to manage replies. SocialRaven&apos;s unified inbox will consolidate comments and DMs from all your platforms into one actionable workspace.
            </motion.p>
            <motion.div variants={LANDING_PAGE_FADE_VARIANT} className="mt-7 flex flex-wrap gap-2">
              {["Instagram DMs", "X replies", "LinkedIn messages", "FB comments", "YouTube comments", "TikTok comments"].map((p) => (
                <span key={p} className="rounded-full border border-[var(--ds-gray-200)] bg-[var(--ds-gray-100)] px-3 py-1.5 text-[0.75rem] text-[var(--ds-gray-700)] dark:border-white/10 dark:bg-white/[0.05]">{p}</span>
              ))}
            </motion.div>
            <motion.div variants={LANDING_PAGE_FADE_VARIANT} className="mt-8">
              <Link href="/sign-up" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--ds-gray-300)] bg-[var(--ds-gray-100)] px-6 text-[0.9rem] font-semibold text-[var(--ds-gray-1000)] transition-all duration-150 hover:border-[var(--ds-gray-400)] hover:bg-[var(--ds-gray-200)] dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10">
                Get early access <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>

          <motion.div variants={LANDING_PAGE_FADE_VARIANT}>
            <div className="overflow-hidden rounded-2xl border border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-[var(--ds-background-100)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.40)]">
              <div className="flex items-center gap-3 border-b border-[var(--ds-gray-200)] px-4 py-3.5 dark:border-white/[0.07]">
                <MessageSquare className="h-4 w-4 text-[var(--ds-gray-500)]" />
                <span className="text-[0.8125rem] font-semibold text-[var(--ds-gray-900)]">Unified Inbox</span>
                <span className="ml-auto rounded-full bg-[hsl(212_86%_48%/0.12)] px-2 py-0.5 text-[0.625rem] font-bold text-[hsl(212_86%_42%)] dark:bg-[hsl(212_86%_48%/0.25)] dark:text-[hsl(212_86%_75%)]">12 new</span>
              </div>
              {[
                { Icon: Instagram, name: "@sarah.design", msg: "Love this post! Can I reshare it?", time: "2m", dot: "bg-pink-500" },
                { Icon: Twitter, name: "@dev_marcus", msg: "This is exactly what I needed, thanks!", time: "5m", dot: "bg-sky-400" },
                { Icon: Linkedin, name: "Priya N.", msg: "Great insight — sharing with my team.", time: "12m", dot: "bg-blue-500" },
                { Icon: Facebook, name: "John D.", msg: "When is the next update coming out?", time: "18m", dot: "bg-blue-400" },
                { Icon: Youtube, name: "@channel_xyz", msg: "Subscribed! Amazing content 🎉", time: "24m", dot: "bg-red-500" },
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
  );
}

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, Globe } from "lucide-react";
import Link from "next/link";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_EASE_OUT,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LIVE_PLATFORM_COUNT,
  LIVE_PLATFORM_NAMES,
  LIVE_PLATFORMS,
  MOCK_POSTS,
  STATUS_CONFIG,
} from "@/components/landing-page/landing-page-constants";

function DashboardMock() {
  const NAV_PATHS = [
    { d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", active: false },
    { d: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", active: true },
    { d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", active: false },
    { d: "M4 6h16M4 12h16M4 18h16", active: false },
  ];

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[var(--ds-gray-200)] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.10),0_4px_16px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-[hsl(222_28%_8%)] dark:shadow-[0_48px_120px_-20px_rgba(0,0,0,0.72)]">
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
        <div className="hidden w-12 flex-col items-center gap-1 border-r border-[var(--ds-gray-100)] bg-[var(--ds-background-100)] py-3 dark:border-white/[0.05] dark:bg-[hsl(222_28%_6%)] sm:flex" aria-hidden="true">
          {NAV_PATHS.map(({ d, active }, i) => (
            <button key={i} tabIndex={-1} className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-[var(--ds-blue-100)] text-[var(--ds-blue-600)] dark:bg-white/10 dark:text-white/80" : "text-[var(--ds-gray-400)] dark:text-white/20"}`}>
              <svg className="h-[0.875rem] w-[0.875rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
            </button>
          ))}
        </div>
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

export function LandingPageHeroSection() {
  return (
    <section className="relative mx-auto max-w-[88rem] overflow-hidden pb-0 pt-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] dark:hidden" style={{ background: "radial-gradient(ellipse 70% 45% at 50% 0%, hsl(212 86% 82% / 0.20) 0%, transparent 56%)" }} aria-hidden="true" />
      <div className="glow-pulse pointer-events-none absolute inset-x-0 top-0 hidden h-[44rem] dark:block" style={{ background: "radial-gradient(ellipse 80% 55% at 50% -5%, hsl(212 86% 54% / 0.22) 0%, transparent 61%)" }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.28] dark:hidden" style={{ backgroundImage: "radial-gradient(circle, hsl(214 18% 46% / 0.68) 1.75px, transparent 1.75px)", backgroundSize: "1.75rem 1.75rem", maskImage: "linear-gradient(to bottom, black 0%, black 56%, transparent 81%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 56%, transparent 81%)" }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] opacity-[0.34] dark:hidden" style={{ backgroundImage: "radial-gradient(circle, hsl(212 82% 66% / 0.44) 1.75px, transparent 1.75px)", backgroundSize: "1.75rem 1.75rem", maskImage: "radial-gradient(ellipse 76% 54% at 50% 8%, black 0%, transparent 69%)", WebkitMaskImage: "radial-gradient(ellipse 76% 54% at 50% 8%, black 0%, transparent 69%)", filter: "blur(0.55px) drop-shadow(0 0 8px hsl(212 86% 66% / 0.16))" }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{ backgroundImage: "radial-gradient(circle, hsl(212 86% 72% / 0.55) 1.75px, transparent 1.75px)", backgroundSize: "1.75rem 1.75rem", maskImage: "linear-gradient(to bottom, black 0%, black 46%, transparent 68%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 46%, transparent 68%)", filter: "blur(0.4px) drop-shadow(0 0 3px hsl(212 86% 65% / 0.6))" }} aria-hidden="true" />

      <div className={`${LANDING_PAGE_CONTAINER_CLASS} relative`}>
        <motion.div
          initial={{ opacity: 0, x: -24, y: 12 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0, ease: LANDING_PAGE_EASE_OUT }}
          className="float-a pointer-events-none absolute left-0 top-20 hidden origin-top-left scale-[0.955] xl:block"
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

        <motion.div
          initial={{ opacity: 0, x: 24, y: 12 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: 1.15, ease: LANDING_PAGE_EASE_OUT }}
          className="float-b pointer-events-none absolute right-0 top-12 hidden origin-top-right scale-[0.955] xl:block"
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

        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 1.3, ease: LANDING_PAGE_EASE_OUT }}
          className="float-b pointer-events-none absolute bottom-52 left-0 hidden origin-bottom-left scale-[0.955] xl:block"
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

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 1.45, ease: LANDING_PAGE_EASE_OUT }}
          className="float-a pointer-events-none absolute bottom-60 right-0 hidden origin-bottom-right scale-[0.955] xl:block"
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

        <motion.div initial="hidden" animate="visible" variants={LANDING_PAGE_STAGGER_VARIANT} className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <motion.div variants={LANDING_PAGE_FADE_VARIANT}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ds-gray-300)] bg-white/90 px-3.5 py-1.5 text-[0.75rem] font-medium text-[var(--ds-gray-900)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live on {LIVE_PLATFORM_COUNT} platforms · 14-day trial, no card needed
            </span>
          </motion.div>

          <motion.h1 variants={LANDING_PAGE_FADE_VARIANT} className="mt-7 text-[clamp(3rem,7vw,5.5rem)] font-black leading-[0.9] tracking-[-0.048em] text-[var(--ds-gray-1000)]">
            Post to every
            <br />
            platform.
            <br />
            <span className="gradient-text">From one place.</span>
          </motion.h1>

          <motion.p variants={LANDING_PAGE_FADE_VARIANT} className="mt-7 max-w-[30rem] text-[1.0625rem] leading-[1.72] text-[var(--ds-gray-700)]">
            Schedule, publish, and get approvals across {LIVE_PLATFORM_NAMES} — without switching tabs or copy-pasting captions.
          </motion.p>

          <motion.div variants={LANDING_PAGE_FADE_VARIANT} className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
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

          <motion.p variants={LANDING_PAGE_FADE_VARIANT} className="mt-4 text-[0.75rem] text-[var(--ds-gray-500)]">
            No credit card · GDPR-conscious · OAuth-secured
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.55, ease: LANDING_PAGE_EASE_OUT }}
          className="relative mx-auto mt-16 max-w-[56rem]"
        >
          <div className="pointer-events-none absolute -inset-x-8 -bottom-8 h-28 blur-3xl" style={{ background: "radial-gradient(ellipse at 50% 100%, hsl(212 86% 55% / 0.22) 0%, transparent 70%)" }} aria-hidden="true" />
          <DashboardMock />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 dark:hidden" style={{ background: "linear-gradient(to bottom, transparent, hsl(40 6% 96%))" }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-24 dark:block" style={{ background: "linear-gradient(to bottom, transparent, var(--ds-background-100))" }} aria-hidden="true" />
    </section>
  );
}

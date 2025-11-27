"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  Feather,
  BarChart,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/navbar/navbar";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return <div className="h-screen w-full bg-background" />;
  if (isSignedIn) return null;

  return (
    <>
      <Navbar />

      <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
        {/* 🍏 ABSTRACT BACKGROUND (Apple Neutral + Subtle Blue Motion) */}
        <div className="fixed inset-0 -z-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f6f7f8] to-[#eceef1]" />

          <motion.div
            className="absolute top-[5%] left-[18%] w-[620px] h-[620px] bg-[#dfe3ea]/55 rounded-full blur-[200px]"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute bottom-[6%] right-[18%] w-[500px] h-[500px] bg-[#d7dae0]/45 rounded-full blur-[190px]"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-accent/10 rounded-full blur-[170px]"
            animate={{ x: [-10, 10, -10] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <main className="flex-1 relative">
          {/* =============== HERO ================= */}
          <section className="w-full pt-24 pb-32 md:pt-28">
            <div className="container px-6 md:px-10">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
                
                {/* ================= HERO LEFT ================= */}
                <motion.div
                  className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8"
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 backdrop-blur-lg px-5 py-2 shadow-sm">
                    <Sparkles className="w-4 h-4 text-foreground/60" />
                    <span className="text-xs md:text-sm font-medium tracking-tight text-foreground/65">
                      Quiet power for your social media
                    </span>
                  </div>

                  <div className="space-y-5 max-w-xl">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.07] text-foreground">
                      Automate Your{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground/65 to-accent/60">
                        Social Presence
                      </span>
                    </h1>

                    <p className="text-lg md:text-xl text-foreground/55 leading-relaxed">
                      Effortless scheduling, publishing, and analytics. Designed
                      to stay out of your way and keep you ahead.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Link href="/sign-up">
                      <Button className="h-12 px-10 rounded-full text-white bg-accent hover:bg-accent/85 transition shadow-[0_12px_30px_-12px_rgba(14,122,255,0.45)]">
                        Get Started <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>

                    <Link href="#features">
                      <Button
                        variant="outline"
                        className="h-12 px-10 rounded-full border-foreground/10 text-foreground/80 hover:bg-foreground/5"
                      >
                        Learn More
                      </Button>
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-3 text-xs md:text-sm text-foreground/50">
                    <span>📈 Avg 32% Engagement Boost</span>
                    <span className="h-1 w-1 rounded-full bg-foreground/30" />
                    <span>🔒 Secure & Private</span>
                  </div>
                </motion.div>

                {/* ================= HERO RIGHT GLASS PANEL ================= */}
                <motion.div
                  className="relative flex justify-center lg:justify-end"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
                >
                  <motion.div
                    className="w-full max-w-md rounded-[32px] border border-foreground/10 bg-white/70 backdrop-blur-2xl shadow-[0_22px_60px_-30px_rgba(20,23,42,0.6)] p-6 flex flex-col gap-4"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                  >

                    {/* CARD CONTENT */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground/70">Today&apos;s Snapshot</span>
                      <span className="text-xs text-foreground/45">Social Raven</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-2xl bg-foreground/3 border border-foreground/5 px-3 py-3">
                        <p className="text-foreground/50 mb-1">Scheduled</p>
                        <p className="text-base font-semibold">18 posts</p>
                        <p className="text-[11px] text-foreground/45 mt-1">next at 4:15 PM</p>
                      </div>

                      <div className="rounded-2xl bg-foreground/3 border border-foreground/5 px-3 py-3">
                        <p className="text-foreground/50 mb-1">Engagement</p>
                        <p className="text-base font-semibold text-accent">+27%</p>
                        <p className="text-[11px] text-foreground/45 mt-1">vs last week</p>
                      </div>
                    </div>

                    <div className="mt-1 rounded-2xl border border-foreground/5 bg-foreground/2 px-3 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-foreground/55">Next auto-post</p>
                        <p className="text-sm font-medium text-foreground">Today · 7:30 PM</p>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-[11px] text-foreground/45 mb-1">Channels</span>

                        <div className="flex -space-x-2">
                          <span className="h-6 w-6 rounded-full bg-black/5 flex items-center justify-center text-[10px] text-foreground/60">IG</span>
                          <span className="h-6 w-6 rounded-full bg-black/5 flex items-center justify-center text-[10px] text-foreground/60">X</span>
                          <span className="h-6 w-6 rounded-full bg-black/5 flex items-center justify-center text-[10px] text-foreground/60">LI</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>


          {/* ================= FEATURES ================= */}
          <section id="features" className="pb-28">
            <div className="container px-6 md:px-10">
              <div className="text-center space-y-3 mb-14">
                <h2 className="text-4xl font-semibold tracking-tight">Everything You Need</h2>
                <p className="text-foreground/55 max-w-xl mx-auto text-lg">Calm, powerful, Apple-level execution.</p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: <Calendar className="text-foreground/60" />, title: "Smart Scheduling", desc: "Perfect timing always." },
                  { icon: <Clock className="text-foreground/60" />, title: "Auto-Posting", desc: "Runs even while you sleep." },
                  { icon: <Feather className="text-foreground/60" />, title: "Content Ideas", desc: "AI-powered creativity." },
                  { icon: <BarChart className="text-foreground/60" />, title: "Analytics", desc: "Clarity behind growth." },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="p-8 rounded-[28px] border border-foreground/10 bg-white/60 backdrop-blur-xl shadow-sm hover:border-accent/30 hover:shadow-md transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-foreground/5 mb-5">
                      {f.icon}
                    </div>
                    <h3 className="font-semibold text-xl">{f.title}</h3>
                    <p className="text-sm text-foreground/60 mt-2">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>


          {/* ================= WHY SECTION ================= */}
          <section className="py-16 border-t border-foreground/5">
            <div className="container px-6 md:px-10 text-center space-y-12">
              <motion.h2
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-semibold"
              >
                Why Teams Love Social Raven
              </motion.h2>

              <motion.div
                className="grid gap-8 md:grid-cols-3"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {[
                  { title: "Creators", desc: "Batch content, auto-post, track growth effortlessly." },
                  { title: "Businesses", desc: "Agencies + brands run all platforms in one hub." },
                  { title: "Teams", desc: "Roles, permissions, scheduling approvals, performance." },
                ].map((x, i) => (
                  <div
                    key={i}
                    className="p-10 rounded-[32px] bg-white/60 backdrop-blur-2xl border border-foreground/10 shadow-sm hover:border-accent/35 transition-all text-left"
                  >
                    <h3 className="text-xl font-semibold mb-3">{x.title}</h3>
                    <p className="text-sm/relaxed text-foreground/60">{x.desc}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>


          {/* ================= INTEGRATIONS ================= */}
          <section className="py-16">
            <div className="container px-6 md:px-10 text-center space-y-10">
              <motion.h2
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-4xl font-semibold"
              >
                Connect Your World Seamlessly
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.9 }}
                className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
              >
                {["Instagram", "Twitter / X", "LinkedIn", "YouTube", "Facebook"].map((p, i) => (
                  <div
                    key={i}
                    className="px-6 py-4 rounded-2xl border border-foreground/10 bg-white/70 backdrop-blur-xl 
                      text-sm font-medium text-foreground/70 hover:text-accent hover:border-accent/30 transition-all shadow-sm"
                  >
                    {p}
                  </div>
                ))}
              </motion.div>

              <p className="text-foreground/55 text-sm max-w-md mx-auto">
                More platforms coming soon — AI rewriting, cross-posting & automation.
              </p>
            </div>
          </section>


          {/* ================= CTA ================= */}
          <section className="py-24 relative text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent/75" />
            <div className="relative container px-6 md:px-10 text-center space-y-6 z-10">
              <h2 className="text-4xl md:text-5xl font-semibold">Ready to Begin?</h2>
              <p className="text-white/85 text-lg max-w-md mx-auto">
                Join creators scaling effortlessly.
              </p>

              <form className="w-full max-w-sm mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Email"
                    className="flex-1 h-12 rounded-full bg-white/25 border-white/40 text-white placeholder-white/60 focus:bg-white/35"
                  />
                  <Link href="/sign-up">
                    <Button className="h-12 px-8 rounded-full bg-white text-accent hover:bg-white/90">
                      Start
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          </section>
        </main>


        <footer className="py-6 text-center text-sm text-foreground/45">
          Crafted with ❤️ in India 🇮🇳 by Tony Ghouse
        </footer>
      </div>
    </>
  );
}

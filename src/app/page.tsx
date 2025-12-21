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
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Facebook,
  TrendingUp,
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
        {/* ULTRA-MINIMAL BACKGROUND */}
        <div className="fixed inset-0 -z-20 pointer-events-none">
          <div className="absolute inset-0 bg-background" />
          
          <motion.div
            className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-accent/[0.02] rounded-full blur-[100px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <main className="flex-1 relative">
          {/* HERO */}
          <section className="w-full pt-32 pb-24 md:pt-40 md:pb-32">
            <div className="container max-w-7xl px-6 md:px-8">
              <div className="grid gap-16 lg:grid-cols-[1fr_0.9fr] items-center">
                
                {/* HERO LEFT */}
                <motion.div
                  className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <div className="inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-card/50 backdrop-blur-xl px-4 py-2 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[13px] font-medium text-muted-foreground tracking-tight">
                      Trusted by 10,000+ creators
                    </span>
                  </div>

                  <div className="space-y-7">
                    <h1 className="text-[56px] md:text-[72px] lg:text-[84px] font-semibold tracking-[-0.03em] leading-[0.95] text-foreground">
                      Social media,{" "}
                      <span className="text-primary/80">
                        on autopilot
                      </span>
                    </h1>

                    <p className="text-[19px] md:text-[21px] text-muted-foreground/80 leading-[1.5] font-normal max-w-lg">
                      Schedule posts, grow your audience, and track performance—all from one beautifully simple dashboard.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                    <Link href="/sign-up" className="w-full sm:w-auto">
                      <Button size="lg" className="h-[52px] px-8 rounded-[14px] text-[15px] font-semibold w-full sm:w-auto shadow-sm hover:shadow-md transition-all">
                        Get started for free
                      </Button>
                    </Link>

                    <Link href="#features" className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-[52px] px-8 rounded-[14px] text-[15px] font-semibold border-border/60 bg-card/30 backdrop-blur-sm w-full sm:w-auto hover:bg-card/60 transition-all"
                      >
                        See how it works
                      </Button>
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-2 text-[14px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-accent" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Free 14-day trial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-accent" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>No credit card required</span>
                    </div>
                  </div>
                </motion.div>

                {/* HERO RIGHT - PREMIUM DASHBOARD */}
                <motion.div
                  className="relative flex justify-center lg:justify-end"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1], delay: 0.2 }}
                >
                  <motion.div
                    className="w-full max-w-md rounded-[28px] border border-border/60 bg-card/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center ring-1 ring-accent/10">
                          <TrendingUp className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <span className="text-[15px] font-semibold text-foreground">Overview</span>
                          <p className="text-[13px] text-muted-foreground">Last 7 days</p>
                        </div>
                      </div>
                      <motion.div
                        className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="rounded-[18px] bg-muted/40 border border-border/40 p-5">
                        <p className="text-[13px] text-muted-foreground font-medium mb-2">Posts</p>
                        <p className="text-[32px] font-semibold tracking-tight text-foreground leading-none">247</p>
                        <div className="flex items-center gap-1.5 mt-3">
                          <ArrowRight className="w-3.5 h-3.5 text-accent rotate-[-45deg]" />
                          <span className="text-[13px] text-accent font-medium">+18%</span>
                        </div>
                      </div>

                      <div className="rounded-[18px] bg-muted/40 border border-border/40 p-5">
                        <p className="text-[13px] text-muted-foreground font-medium mb-2">Reach</p>
                        <p className="text-[32px] font-semibold tracking-tight text-foreground leading-none">8.4K</p>
                        <div className="flex items-center gap-1.5 mt-3">
                          <ArrowRight className="w-3.5 h-3.5 text-accent rotate-[-45deg]" />
                          <span className="text-[13px] text-accent font-medium">+32%</span>
                        </div>
                      </div>
                    </div>

                    {/* Next Post */}
                    <div className="rounded-[18px] border border-border/40 bg-muted/30 p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[13px] text-muted-foreground font-medium mb-1">Next scheduled</p>
                          <p className="text-[15px] font-semibold text-foreground">Today at 7:30 PM</p>
                        </div>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/30">
                        <span className="text-[13px] text-muted-foreground">Platforms</span>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center ring-1 ring-pink-500/20">
                            <Instagram className="w-3.5 h-3.5 text-pink-600" />
                          </div>
                          <div className="w-7 h-7 rounded-full bg-foreground/5 flex items-center justify-center ring-1 ring-foreground/10">
                            <Twitter className="w-3.5 h-3.5 text-foreground" />
                          </div>
                          <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
                            <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>


          {/* FEATURES */}
          <section id="features" className="pb-32">
            <div className="container max-w-7xl px-6 md:px-8">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-[42px] md:text-[52px] font-semibold tracking-[-0.02em]">Everything you need</h2>
                <p className="text-[19px] text-muted-foreground/80 max-w-2xl mx-auto">Powerful features designed to save you time and grow your reach.</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: <Calendar className="w-5 h-5" />, title: "Smart Scheduling", desc: "AI-powered timing for maximum engagement." },
                  { icon: <Clock className="w-5 h-5" />, title: "Auto-Posting", desc: "Set it once, let it run on autopilot." },
                  { icon: <Feather className="w-5 h-5" />, title: "AI Content", desc: "Get inspired with AI-generated ideas." },
                  { icon: <BarChart className="w-5 h-5" />, title: "Analytics", desc: "Clear insights into what's working." },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group p-8 rounded-[22px] border border-border/50 bg-card/50 backdrop-blur-sm hover:border-accent/30 hover:bg-card/80 transition-all"
                  >
                    <div className="w-11 h-11 rounded-[13px] flex items-center justify-center bg-accent/10 text-accent mb-6 group-hover:scale-110 transition-transform">
                      {f.icon}
                    </div>
                    <h3 className="font-semibold text-[17px] mb-2 text-foreground">{f.title}</h3>
                    <p className="text-[15px] text-muted-foreground/80 leading-relaxed">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>


          {/* INTEGRATIONS */}
          <section className="py-32 border-y border-border/50">
            <div className="container max-w-7xl px-6 md:px-8">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-[42px] md:text-[52px] font-semibold tracking-[-0.02em]">All your platforms.<br />One dashboard.</h2>
                <p className="text-[19px] text-muted-foreground/80 max-w-2xl mx-auto">Connect once, post everywhere.</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                {[
                  { icon: <Instagram className="w-5 h-5" />, name: "Instagram", color: "from-pink-500/10 to-purple-500/10 ring-pink-500/20 text-pink-600" },
                  { icon: <Twitter className="w-5 h-5" />, name: "Twitter", color: "bg-foreground/5 ring-foreground/10 text-foreground" },
                  { icon: <Linkedin className="w-5 h-5" />, name: "LinkedIn", color: "from-blue-500/10 to-blue-600/10 ring-blue-500/20 text-blue-600" },
                  { icon: <Youtube className="w-5 h-5" />, name: "YouTube", color: "from-red-500/10 to-red-600/10 ring-red-500/20 text-red-600" },
                  { icon: <Facebook className="w-5 h-5" />, name: "Facebook", color: "from-blue-600/10 to-blue-700/10 ring-blue-600/20 text-blue-700" },
                ].map((platform, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group"
                  >
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-[16px] border border-border/50 bg-gradient-to-br ${platform.color} backdrop-blur-sm hover:scale-105 transition-all cursor-pointer ring-1`}>
                      {platform.icon}
                      <span className="text-[15px] font-semibold">{platform.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <p className="text-center text-[15px] text-muted-foreground/60">
                More platforms coming soon
              </p>
            </div>
          </section>


          {/* SOCIAL PROOF */}
          <section className="py-32">
            <div className="container max-w-7xl px-6 md:px-8">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-[42px] md:text-[52px] font-semibold tracking-[-0.02em]">Loved by creators</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { title: "Creators", desc: "Focus on creating. Let us handle the posting schedule." },
                  { title: "Agencies", desc: "Manage multiple clients from a single, powerful dashboard." },
                  { title: "Businesses", desc: "Scale your social presence without scaling your team." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="p-10 rounded-[22px] border border-border/50 bg-card/50 backdrop-blur-sm hover:border-accent/30 hover:bg-card/80 transition-all text-left"
                  >
                    <h3 className="text-[21px] font-semibold mb-3 text-foreground">{item.title}</h3>
                    <p className="text-[15px] text-muted-foreground/80 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>


          {/* CTA */}
          <section className="py-24 relative">
            <div className="absolute inset-0 bg-accent" />
            <div className="relative container max-w-4xl px-6 md:px-8 text-center space-y-8 z-10">
              <h2 className="text-[42px] md:text-[52px] font-semibold tracking-[-0.02em] text-white">
                Start growing today
              </h2>
              <p className="text-[19px] text-white/80 max-w-xl mx-auto">
                Join thousands of creators who've transformed their social media workflow.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
                <Input
                  placeholder="Enter your email"
                  className="max-w-xs h-[52px] rounded-[14px] bg-white/15 border-white/25 text-white placeholder:text-white/50 focus-visible:ring-white/30 backdrop-blur-sm text-[15px]"
                />
                <Link href="/sign-up">
                  <Button size="lg" className="h-[52px] px-8 rounded-[14px] bg-white text-accent hover:bg-white/95 font-semibold text-[15px] shadow-lg">
                    Get started free
                  </Button>
                </Link>
              </div>

              <p className="text-[13px] text-white/60">
                14-day free trial · No credit card required
              </p>
            </div>
          </section>
        </main>


        <footer className="py-8 border-t border-border/50">
          <div className="container max-w-7xl px-6 md:px-8 text-center">
            <p className="text-[14px] text-muted-foreground">
              © 2025 Social Raven. Crafted by Tony Ghouse & Team
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
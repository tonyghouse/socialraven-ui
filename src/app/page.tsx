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

/* -----------------------------
   Explicit data (NO hacks)
------------------------------ */

const FEATURES = [
  {
    title: "Smart Scheduling",
    description: "AI-powered timing for maximum engagement.",
    icon: Calendar,
  },
  {
    title: "Auto Posting",
    description: "Set it once, let it run on autopilot.",
    icon: Clock,
  },
  {
    title: "AI Content",
    description: "Generate ideas and captions instantly.",
    icon: Feather,
  },
  {
    title: "Analytics",
    description: "Clear insights into what’s working.",
    icon: BarChart,
  },
];

const INTEGRATIONS = [
  { name: "Instagram", icon: Instagram },
  { name: "Twitter / X", icon: Twitter },
  { name: "LinkedIn", icon: Linkedin },
  { name: "YouTube", icon: Youtube },
  { name: "Facebook", icon: Facebook },
];

const SOCIAL_PROOF = [
  {
    title: "Creators",
    description: "Focus on creating. We handle the posting schedule.",
  },
  {
    title: "Agencies",
    description: "Manage multiple clients from a single dashboard.",
  },
  {
    title: "Businesses",
    description: "Scale your social presence without scaling your team.",
  },
];

/* -----------------------------
   Component
------------------------------ */

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return <div className="h-screen w-full bg-background" />;
  if (isSignedIn) return null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background text-foreground">
        {/* Subtle Apple-style background */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-[20%] left-[8%] w-[520px] h-[520px] bg-blue-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[15%] right-[10%] w-[420px] h-[420px] bg-cyan-500/5 rounded-full blur-[120px]" />
        </div>

        <main>
          {/* ---------------- HERO ---------------- */}
          <section className="pt-28 pb-24">
            <div className="container max-w-7xl px-6">
              <div className="grid lg:grid-cols-[1fr_0.9fr] gap-16 items-center">
                {/* Left */}
                <div className="space-y-6 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/30 px-3 py-1 text-[12px] text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Trusted by 10,000+ creators
                  </div>

                  <h1 className="text-[44px] md:text-[58px] lg:text-[68px] font-semibold tracking-[-0.03em] leading-[1.04]">
                    Social media,
                    <br />
                    <span className="text-blue-600">on autopilot</span>
                  </h1>

                  <p className="text-[15px] md:text-[16px] leading-[1.45] text-muted-foreground max-w-[560px] mx-auto lg:mx-0">
                    Schedule posts, grow your audience, and track performance —
                    all from one beautifully simple dashboard.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
                    <Link href="/sign-up">
                      <Button className="h-[46px] px-6 rounded-full bg-foreground text-background hover:bg-foreground/90 transition">
                        Get started for free
                      </Button>
                    </Link>
                    <Link href="#features">
                      <Button
                        variant="outline"
                        className="h-[46px] px-6 rounded-full border-border/40 hover:bg-muted/40 transition"
                      >
                        Learn more
                      </Button>
                    </Link>
                  </div>

                  <p className="text-[12px] text-muted-foreground/70">
                    14-day free trial · No credit card required
                  </p>
                </div>

                {/* Right – Dashboard */}
                <div className="flex justify-center lg:justify-end">
                  <div className="w-full max-w-md rounded-[18px] bg-white/90 dark:bg-card/90 shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-6 transition-transform hover:-translate-y-1">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold">Overview</p>
                          <p className="text-[12px] text-muted-foreground">
                            Last 7 days
                          </p>
                        </div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-[14px] bg-muted/40 p-4 hover:bg-muted/60 transition">
                        <p className="text-[12px] text-muted-foreground">Posts</p>
                        <p className="text-[26px] font-semibold leading-none">
                          247
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-[12px] text-green-600">
                          <ArrowRight className="w-3 h-3 rotate-[-45deg]" />
                          +18%
                        </div>
                      </div>

                      <div className="rounded-[14px] bg-muted/40 p-4 hover:bg-muted/60 transition">
                        <p className="text-[12px] text-muted-foreground">
                          Reach
                        </p>
                        <p className="text-[26px] font-semibold leading-none">
                          8.4K
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-[12px] text-green-600">
                          <ArrowRight className="w-3 h-3 rotate-[-45deg]" />
                          +32%
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[14px] bg-muted/30 p-4">
                      <div className="flex justify-between mb-3">
                        <div>
                          <p className="text-[12px] text-muted-foreground">
                            Next scheduled
                          </p>
                          <p className="text-[14px] font-semibold">
                            Today at 7:30 PM
                          </p>
                        </div>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>

                      <div className="flex gap-2">
                        <Instagram className="w-4 h-4" />
                        <Twitter className="w-4 h-4" />
                        <Linkedin className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- FEATURES ---------------- */}
          <section id="features" className="py-24">
            <div className="container max-w-7xl px-6">
              <div className="text-center mb-14">
                <h2 className="text-[36px] md:text-[44px] font-semibold tracking-[-0.02em]">
                  Everything you need
                </h2>
                <p className="text-[15px] text-muted-foreground mt-2">
                  Powerful features designed to save you time.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {FEATURES.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-[16px] bg-card/80 p-5 hover:bg-card transition"
                  >
                    <Icon className="w-5 h-5 text-blue-600 mb-4" />
                    <p className="font-semibold text-[15px]">{title}</p>
                    <p className="text-[13px] text-muted-foreground mt-1">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ---------------- INTEGRATIONS ---------------- */}
          <section className="py-24 border-y border-border/40">
            <div className="container max-w-7xl px-6 text-center">
              <h2 className="text-[36px] md:text-[44px] font-semibold tracking-[-0.02em] mb-10">
                All your platforms. One dashboard.
              </h2>

              <div className="flex flex-wrap justify-center gap-3">
                {INTEGRATIONS.map(({ name, icon: Icon }) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted/50 hover:bg-muted transition"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[14px] font-medium">{name}</span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[12px] text-muted-foreground/60">
                More platforms coming soon
              </p>
            </div>
          </section>

          {/* ---------------- SOCIAL PROOF ---------------- */}
          <section className="py-24">
            <div className="container max-w-7xl px-6">
              <h2 className="text-center text-[36px] md:text-[44px] font-semibold mb-14">
                Loved by creators
              </h2>

              <div className="grid gap-4 md:grid-cols-3">
                {SOCIAL_PROOF.map(({ title, description }) => (
                  <div
                    key={title}
                    className="rounded-[18px] bg-card/80 p-6 hover:bg-card transition"
                  >
                    <p className="font-semibold mb-2">{title}</p>
                    <p className="text-[14px] text-muted-foreground">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ---------------- CTA ---------------- */}
          <section className="py-20 bg-blue-600 text-white">
            <div className="container max-w-3xl px-6 text-center space-y-4">
              <h2 className="text-[36px] font-semibold tracking-[-0.02em]">
                Start growing today
              </h2>
              <p className="text-[15px] text-white/80">
                Join thousands of creators simplifying their workflow.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                <Input
                  placeholder="Enter your email"
                  className="h-[46px] rounded-full bg-white/15 border-white/20 text-white placeholder:text-white/60"
                />
                <Link href="/sign-up">
                  <Button className="h-[46px] px-6 rounded-full bg-white text-blue-600">
                    Get started
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="py-5 text-center text-[12px] text-muted-foreground">
          © 2025 Social Raven. Crafted by Tony Ghouse & Team
        </footer>
      </div>
    </>
  );
}

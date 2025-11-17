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
import Navbar from "@/components/navbar";

export default function LandingPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
        <div className="fixed inset-0 -z-20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600 opacity-5"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-300/5 rounded-full blur-3xl"></div>
        </div>

        <main className="flex-1 relative z-0">
          <section className="w-full py-12 md:py-20 lg:py-28 relative overflow-hidden">
            <svg
              className="absolute inset-0 w-full h-full -z-10"
              preserveAspectRatio="none"
              viewBox="0 0 1200 600"
            >
              <defs>
                <linearGradient
                  id="heroGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#1e9df1" />
                  <stop offset="35%" stopColor="#1a7fb8" />
                  <stop offset="70%" stopColor="#1e9df1" />
                  <stop offset="100%" stopColor="#1e9df1" />
                </linearGradient>

                <radialGradient id="depthGlow" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="#55acee" />
                  <stop offset="100%" stopColor="#1e9df1" stopOpacity="0" />
                </radialGradient>

                <linearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#1e9df1" />
                  <stop offset="100%" stopColor="#1a7fb8" />
                </linearGradient>
              </defs>

              <rect
                width="1200"
                height="600"
                fill="url(#heroGradient)"
                opacity="0.12"
              />

              <path
                d="M0,300 Q300,150 600,250 T1200,300"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.25"
              />
              <path
                d="M0,200 Q300,400 600,150 T1200,250"
                stroke="url(#lineGradient)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.15"
              />
              <path
                d="M0,450 Q400,300 800,500 T1200,400"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.2"
              />

              <g
                opacity="0.08"
                stroke="url(#lineGradient)"
                fill="none"
                strokeWidth="1"
              >
                <polygon points="200,150 250,125 300,150 300,200 250,225 200,200" />
                <polygon points="900,400 950,375 1000,400 1000,450 950,475 900,450" />
                <polygon points="400,500 430,485 460,500 460,530 430,545 400,530" />
              </g>

              <g fill="url(#lineGradient)" opacity="0.15">
                <circle cx="150" cy="100" r="3" />
                <circle cx="170" cy="110" r="2" />
                <circle cx="140" cy="120" r="2" />

                <circle cx="1000" cy="500" r="3" />
                <circle cx="1020" cy="510" r="2" />
                <circle cx="985" cy="515" r="2" />

                <circle cx="600" cy="80" r="2.5" />
                <circle cx="620" cy="95" r="2" />
              </g>

              <circle
                cx="200"
                cy="200"
                r="200"
                fill="url(#depthGlow)"
                opacity="0.08"
              />
              <circle
                cx="1000"
                cy="400"
                r="250"
                fill="url(#depthGlow)"
                opacity="0.06"
              />
            </svg>

            <div className="absolute top-32 right-20 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-blue-300/15 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-32 left-40 w-96 h-96 bg-gradient-to-tr from-blue-300/15 to-blue-400/15 rounded-full blur-3xl -z-10"></div>

            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-6 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 border border-blue-200/50 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    The Future of Social Media Management
                  </span>
                </div>
                <div className="space-y-3">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-pretty">
                    Automate Your{" "}
                    <span className="bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">
                      Social Presence
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed text-pretty">
                    Schedule, analyze, and optimize your social media posts
                    across multiple platforms with intelligent automation and
                    powerful insights.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link href="/sign-up">
                    <Button className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 rounded-full shadow-lg hover:shadow-xl transition-all text-base font-semibold flex items-center gap-2">
                      Get Started <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="h-12 px-8 rounded-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 text-base font-semibold transition-all"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-20 bg-white/50 backdrop-blur-sm border-b border-blue-100/50">
            <div className="container px-4 md:px-6">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-pretty">
                  Everything You Need
                </h2>
                <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                  Powerful features designed to streamline your social media
                  workflow
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                {/* Feature Card 1 */}
                <div className="group p-8 rounded-2xl bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 text-white mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Smart Scheduling
                  </h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    Schedule posts for optimal times to maximize engagement and
                    reach.
                  </p>
                </div>

                {/* Feature Card 2 */}
                <div className="group p-8 rounded-2xl bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Auto-Posting
                  </h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    Set it and forget it with our reliable and consistent
                    auto-posting.
                  </p>
                </div>

                {/* Feature Card 3 */}
                <div className="group p-8 rounded-2xl bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 text-white mb-4 group-hover:scale-110 transition-transform">
                    <Feather className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Content Creation
                  </h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    AI-powered suggestions to create engaging content that
                    resonates.
                  </p>
                </div>

                {/* Feature Card 4 */}
                <div className="group p-8 rounded-2xl bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white mb-4 group-hover:scale-110 transition-transform">
                    <BarChart className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Advanced Analytics
                  </h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    Track performance with detailed analytics and actionable
                    insights.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary  to-primary/90 -z-10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-10"></div>

            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto">
                <div className="space-y-3">
                  <h2 className="text-4xl md:text-5xl font-bold text-white text-pretty">
                    Ready to Transform Your Social Strategy?
                  </h2>
                  <p className="text-lg text-blue-100 leading-relaxed">
                    Join thousands of businesses and creators who trust Social
                    Raven to manage their social media presence efficiently and
                    effectively.
                  </p>
                </div>
                <div className="w-full max-w-sm space-y-4">
                  <form className="flex flex-col sm:flex-row gap-3">
                    <Input
                      className="flex-1 h-12 rounded-full bg-white/20 text-white placeholder-white/50 border-white/30 focus:border-white focus:ring-0 focus:bg-white/30 transition-all"
                      placeholder="Enter your email"
                      type="email"
                    />
                    <Link href="/sign-up" className="sm:flex-shrink-0">
                      <Button
                        type="submit"
                        className="w-full sm:w-auto h-12 px-8 bg-white text-blue-600 hover:bg-blue-50 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className=" border-gray-200 text-center text-sm text-gray-600 py-6">
          <div>Crafted with ❤️ in Singapore 🇸🇬 by Tony Ghouse</div>
        </footer>
      </div>
    </>
  );
}

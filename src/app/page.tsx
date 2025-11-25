"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Feather, BarChart, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/navbar/navbar";

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <div className="h-screen w-full bg-background" />;
  }

  if (isSignedIn) return null;

  return (
    <>
      <Navbar />

      <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
        {/* Abstract Hero Background */}
        <div className="fixed inset-0 -z-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-blue-500/20 to-primary/40 opacity-20" />
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-primary/20 blur-[160px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] bg-blue-400/20 blur-[160px] rounded-full animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-soft-light pointer-events-none" />
        </div>

        <main className="flex-1 relative z-0">
          {/* HERO SECTION */}
          <section className="w-full py-20 md:py-32 relative">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-6 text-center max-w-4xl mx-auto">

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    The Future of Social Media Management
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-pretty">
                    Automate Your{" "}
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Social Presence
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                    Schedule, analyze, and optimize your social media posts
                    across multiple platforms using powerful automation
                    and intelligent insights.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link href="/sign-up">
                    <Button className="h-12 px-8 rounded-full text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-md">
                      Get Started <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>

                  <Link href="#features">
                    <Button
                      variant="outline"
                      className="h-12 px-8 rounded-full border-primary/30 text-primary hover:bg-primary/10"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" className="w-full py-16 md:py-24 bg-background/60 backdrop-blur border-b border-border/50">
            <div className="container px-4 md:px-6">
              <div className="text-center space-y-3 mb-12">
                <h2 className="text-4xl md:text-5xl font-bold">Everything You Need</h2>
                <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                  Tools designed to streamline your workflow and amplify your reach.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                {[
                  {
                    icon: <Calendar className="w-6 h-6" />,
                    title: "Smart Scheduling",
                    desc: "Post at the perfect time with automated scheduling.",
                  },
                  {
                    icon: <Clock className="w-6 h-6" />,
                    title: "Auto-Posting",
                    desc: "Set it once and let the system handle consistent posting.",
                  },
                  {
                    icon: <Feather className="w-6 h-6" />,
                    title: "Content Creation",
                    desc: "AI-assisted content ideas tailored to your audience.",
                  },
                  {
                    icon: <BarChart className="w-6 h-6" />,
                    title: "Advanced Analytics",
                    desc: "Insightful analytics to track performance and growth.",
                  },
                ].map((f, idx) => (
                  <div
                    key={idx}
                    className="group p-8 rounded-2xl bg-white dark:bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-4 group-hover:scale-110 transition-transform">
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                    <p className="text-sm text-foreground/60 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA SECTION */}
          <section className="w-full py-16 md:py-24 relative text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/90 -z-10" />
            <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-white/20 blur-[150px] rounded-full -z-10" />

            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Ready to Transform Your Social Strategy?
                </h2>
                <p className="text-blue-100 text-lg">
                  Join thousands of businesses who trust Social Raven to manage their presence.
                </p>

                <form className="w-full max-w-sm space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      className="flex-1 h-12 rounded-full bg-white/20 border-white/40 text-white placeholder-white/60 focus:bg-white/30"
                    />
                    <Link href="/sign-up">
                      <Button className="h-12 px-8 rounded-full bg-white text-primary hover:bg-white/90">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="py-6 text-center text-sm text-foreground/60">
          <div className="flex items-center justify-center gap-4">
            <span>Crafted with ❤️ in India 🇮🇳 by Tony Ghouse</span>
            <Link
              href="/privacy-policy"
              className="underline underline-offset-4 hover:text-primary transition"
            >
              Privacy Policy
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}

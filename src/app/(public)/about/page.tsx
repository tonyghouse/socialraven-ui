import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";

export const metadata: Metadata = {
  title: "About | Social Raven",
  description: "Learn about Social Raven — who we are, why we built it, and our mission.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="bg-[#f9fafb] px-6 md:px-10 pt-5">
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
        <div className="bg-white border-b border-[hsl(var(--border))] px-6 md:px-10 py-16">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-3">Our story</p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-4">
              About Social Raven
            </h1>
            <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl">
              We&apos;re a small team of builders and creators who got tired of juggling ten different tools to manage social media. So we built the one we always wanted.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 md:px-10 py-14">
          <div className="mx-auto max-w-7xl space-y-8">

            <div className="grid md:grid-cols-2 gap-6">

              <section className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent))]/10 flex items-center justify-center text-xl">
                  🎯
                </div>
                <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Our mission</h2>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Social Raven exists to give creators, agencies, and businesses back their time. We believe that growing a social presence shouldn&apos;t require a dedicated operations team — it should be simple, intelligent, and fast.
                </p>
              </section>

              <section className="rounded-2xl bg-white border border-[hsl(var(--border))] p-8 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent))]/10 flex items-center justify-center text-xl">
                  🇪🇺
                </div>
                <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Built in Europe</h2>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Social Raven is designed and built in Europe. We take privacy seriously — all data is stored in EU data centres and we are GDPR-compliant by design. We never sell your data or use it for advertising.
                </p>
              </section>

            </div>

            <section className="rounded-2xl bg-white border border-[hsl(var(--border))] p-10 text-center">
              <p className="text-[hsl(var(--muted-foreground))] mb-4">
                This page is coming soon with more about our team and journey.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))] hover:underline"
              >
                Get in touch →
              </Link>
            </section>

          </div>
        </div>

      </main>
    </>
  );
}

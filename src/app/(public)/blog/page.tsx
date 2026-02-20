import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";

export const metadata: Metadata = {
  title: "Blog | Social Raven",
  description: "Insights on social media strategy, scheduling, and growth from the Social Raven team.",
};

export default function BlogPage() {
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
            <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-3">Blog</p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-4">
              Insights &amp; Updates
            </h1>
            <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl">
              Tips on social media strategy, product updates, and how to grow your audience smarter.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 md:px-10 py-14">
          <div className="mx-auto max-w-7xl flex justify-center">

            <div className="rounded-2xl bg-white border border-[hsl(var(--border))] p-12 text-center w-full max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--accent))]/10 flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl">✍️</span>
              </div>
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">Coming soon</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
                We&apos;re working on our first posts. Subscribe to get notified when we publish.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[hsl(var(--accent))] text-white text-sm font-medium hover:bg-[hsl(var(--accent))]/90 transition-colors"
              >
                Get notified →
              </Link>
            </div>

          </div>
        </div>

      </main>
    </>
  );
}

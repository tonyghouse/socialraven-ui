import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";

export const metadata: Metadata = {
  title: "Contact | Social Raven",
  description: "Get in touch with the Social Raven team.",
};

const CONTACTS = [
  {
    label: "General support",
    description: "Questions about your account or how to use Social Raven.",
    email: "team@socialraven.io",
    icon: "💬",
  },
  {
    label: "Sales & Enterprise",
    description: "Discuss custom plans, white-labelling, or bulk pricing.",
    email: "team@socialraven.io",
    icon: "📊",
  },
  {
    label: "Privacy & Legal",
    description: "Data deletion requests, GDPR queries, or legal matters.",
    email: "team@socialraven.io",
    icon: "🔒",
  },
  {
    label: "Press & Partnerships",
    description: "Media enquiries or partnership opportunities.",
    email: "team@socialraven.io",
    icon: "🤝",
  },
];

export default function ContactPage() {
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
            <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-3">Contact</p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-4">
              Get in touch
            </h1>
            <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl">
              Whether you have a question, a feature request, or want to talk enterprise — we&apos;re here.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 md:px-10 py-14">
          <div className="mx-auto max-w-7xl space-y-10">

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {CONTACTS.map(({ label, description, email, icon }) => (
                <div
                  key={label}
                  className="rounded-2xl bg-white border border-[hsl(var(--border))] p-6 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent))]/10 flex items-center justify-center text-xl">
                    {icon}
                  </div>
                  <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{label}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{description}</p>
                  <a
                    href={`mailto:${email}`}
                    className="text-xs font-medium text-[hsl(var(--accent))] hover:underline"
                  >
                    {email}
                  </a>
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
              We typically respond within one business day.
            </p>

          </div>
        </div>

      </main>
    </>
  );
}

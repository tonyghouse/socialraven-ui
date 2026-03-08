import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import {
  MessageCircle,
  Lock,
  Handshake,
  Clock,
  CheckCircle2,
  ArrowRight,
  Building2,
  Shield,
  Globe,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | Social Raven",
  description:
    "Get in touch with the Social Raven team — support, sales, privacy, and press.",
};

const CONTACTS = [
  {
    label: "General Support",
    description:
      "Questions about your account, troubleshooting, or how to use Social Raven.",
    detail:
      "Billing questions, feature how-tos, post scheduling issues, connected account problems — we handle it all.",
    email: "team+support@socialraven.io",
    icon: MessageCircle,
    response: "Within 24 hours",
  },
  {
    label: "Sales & Enterprise",
    description:
      "Custom plans, white-labelling, volume pricing, or agency onboarding.",
    detail:
      "We offer bespoke packages for large agencies and enterprise teams. Let's find the right fit for your scale.",
    email: "team+sales@socialraven.io",
    icon: Building2,
    response: "Within 4 hours",
  },
  {
    label: "Privacy & Legal",
    description:
      "Data deletion requests, GDPR/CCPA queries, legal notices, or compliance questions.",
    detail:
      "GDPR requests processed within 30 days. CCPA requests within 45 days. Legal notices handled promptly.",
    email: "team+privacy@socialraven.io",
    icon: Lock,
    response: "Within 72 hours",
  },
  {
    label: "Press & Partnerships",
    description:
      "Media enquiries, press kit requests, or partnership opportunities.",
    detail:
      "We're open to integration partnerships, co-marketing campaigns, and media coverage. Let's connect.",
    email: "team+press@socialraven.io",
    icon: Handshake,
    response: "Within 48 hours",
  },
];

const TRUST = [
  { icon: Zap, label: "< 24h avg response", sub: "Average support reply time" },
  { icon: Globe, label: "40+ countries", sub: "Customers worldwide" },
  { icon: Shield, label: "GDPR & CCPA", sub: "Privacy-compliant platform" },
  { icon: CheckCircle2, label: "98% delivery", sub: "Post scheduling reliability" },
];

const FAQS = [
  {
    q: "How do I cancel my subscription?",
    a: "Email team+support@socialraven.io with the subject line 'Cancel subscription'. We'll process it the same business day — no questions asked.",
  },
  {
    q: "How do I request deletion of my data?",
    a: "Email team+privacy@socialraven.io with 'Data Deletion Request' in the subject. All personal data is permanently erased within 30 days of verification.",
  },
  {
    q: "Do you offer a free trial?",
    a: "Yes — start with our Trial plan, no credit card required. Explore the platform fully before deciding. Upgrade to Pro anytime.",
  },
  {
    q: "Can I manage multiple client accounts?",
    a: "Absolutely. Our Pro and Enterprise plans are designed for agencies. Manage all your clients from a single, clean dashboard.",
  },
  {
    q: "Which platforms does Social Raven support?",
    a: "We support Instagram, Twitter/X, LinkedIn, YouTube, and Facebook. More platforms are actively in development.",
  },
  {
    q: "Is my data safe with Social Raven?",
    a: "Yes. All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). We never sell your data or use it for advertising.",
  },
];

const ENTERPRISE_FEATURES = [
  "Custom seat limits",
  "Dedicated onboarding",
  "White-label options",
  "SLA guarantee",
  "Priority support",
  "Custom invoicing",
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div className="bg-[#f9fafb] px-2 lg:px-5 pt-5">
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
        <div className="bg-white border-b border-[hsl(var(--border))] px-6 md:px-10 py-20">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-4">Contact</p>
            <h1 className="text-4xl md:text-5xl lg:text-[60px] font-semibold tracking-tight text-[hsl(var(--foreground))] mb-5 max-w-2xl leading-[1.08]">
              We&apos;re here when you need us.
            </h1>
            <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xl mb-12">
              Reach the right team directly — whether it&apos;s a support question, an enterprise enquiry, or a legal matter.
            </p>
            <div className="flex flex-wrap gap-8">
              {TRUST.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent))]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[hsl(var(--accent))]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{label}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact channels */}
        <div className="px-6 md:px-10 py-14 bg-[#f9fafb]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-1">
                Get in touch
              </p>
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Contact the right team</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {CONTACTS.map(({ label, description, detail, email, icon: Icon, response }) => (
                <div
                  key={label}
                  className="group rounded-2xl bg-white border border-[hsl(var(--border))] p-7 space-y-4 hover:border-[hsl(var(--accent))]/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[hsl(var(--accent))]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--accent))]/15 transition-colors">
                      <Icon className="w-5 h-5 text-[hsl(var(--accent))]" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]/60 rounded-full px-3 py-1 whitespace-nowrap border border-[hsl(var(--border))]">
                      <Clock className="w-3 h-3" />
                      {response}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-semibold text-[hsl(var(--foreground))] mb-1.5">{label}</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{description}</p>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]/80 leading-relaxed border-t border-[hsl(var(--border))] pt-3.5">
                    {detail}
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))] hover:underline"
                  >
                    {email} <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick answers */}
        <div className="px-6 md:px-10 py-14 bg-white border-y border-[hsl(var(--border))]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--accent))] mb-1">
                Quick answers
              </p>
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                Before you write
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FAQS.map(({ q, a }) => (
                <div
                  key={q}
                  className="rounded-xl bg-[#f9fafb] border border-[hsl(var(--border))] p-5 space-y-2"
                >
                  <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{q}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="px-6 md:px-10 py-14 bg-[#f9fafb]">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl bg-[hsl(var(--foreground))] p-10 md:p-14">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Enterprise</p>
                  <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                    Need something built for scale?
                  </h2>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Custom seat limits, dedicated onboarding, white-label options, and SLA guarantees. We partner with agencies and businesses that need more than an off-the-shelf plan.
                  </p>
                  <a
                    href="mailto:team+sales@socialraven.io?subject=Enterprise%20Enquiry"
                    className="inline-flex items-center gap-2 h-11 px-7 rounded-full bg-white text-[hsl(var(--foreground))] text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Talk to sales <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {ENTERPRISE_FEATURES.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-white/40 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}

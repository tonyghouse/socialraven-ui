"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/navbar/navbar";
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
  Zap,
  Globe,
  Lock,
  Users,
  CheckCircle2,
  Star,
} from "lucide-react";
import Link from "next/link";

/* -----------------------------
   Data
------------------------------ */

const FEATURES = [
  { title: "Smart Scheduling", description: "AI-powered timing for maximum engagement.", icon: Calendar },
  { title: "Auto Posting", description: "Set it once, let it run on autopilot.", icon: Clock },
  { title: "AI Content", description: "Generate ideas and captions instantly.", icon: Feather },
  { title: "Analytics", description: "Clear insights into what's working.", icon: BarChart },
  { title: "Multi-Account", description: "Manage unlimited profiles seamlessly.", icon: Users },
  { title: "Secure & Private", description: "Enterprise-grade security for your data.", icon: Lock },
];

const INTEGRATIONS = [
  { name: "Instagram", icon: Instagram, gradient: "from-purple-500 to-pink-500" },
  { name: "Twitter / X", icon: Twitter, gradient: "from-gray-800 to-gray-900" },
  { name: "LinkedIn", icon: Linkedin, gradient: "from-blue-600 to-blue-700" },
  { name: "YouTube", icon: Youtube, gradient: "from-red-500 to-red-600" },
  { name: "Facebook", icon: Facebook, gradient: "from-blue-500 to-blue-600" },
];

const SOCIAL_PROOF = [
  { title: "Creators", description: "Focus on creating. We handle the posting schedule." },
  { title: "Agencies", description: "Manage multiple clients from a single dashboard." },
  { title: "Businesses", description: "Scale your social presence without scaling your team." },
];

const STATS = [
  { value: "10K+", label: "Active Users" },
  { value: "2M+", label: "Posts Scheduled" },
  { value: "98%", label: "Success Rate" },
  { value: "24/7", label: "Support" },
];

const TESTIMONIALS = [
  { 
    quote: "Social Raven transformed how we manage our content. The AI scheduling is incredibly accurate.",
    author: "Sarah Chen",
    role: "Content Manager",
    rating: 5
  },
  { 
    quote: "Managing 15 client accounts used to be chaos. Now it's seamless. Best investment we've made.",
    author: "Marcus Rodriguez",
    role: "Agency Owner",
    rating: 5
  },
  { 
    quote: "The analytics dashboard alone is worth it. We've doubled our engagement in three months.",
    author: "Emily Watson",
    role: "Social Media Director",
    rating: 5
  },
];

const PRICING_TIERS = [
  {
    name: "Trail",
    price: "$0",
    description: "Perfect for testing out feature",
    features: ["10 social accounts", "100 scheduled posts", "Basic analytics"]
  },
  {
    name: "Pro",
    price: "$8",
    description: "For serious creators",
    features: ["Unlimited social accounts", "Unlimited posts", "Advanced analytics", "AI analysis", "Priority support"],
    popular: true
  },
  {
    name: "Corporate",
    price: "$_",
    description: "For teams & agencies",
    features: ["Unlimited accounts", "Unlimited posts", "White-label reports", "Team collaboration", "24/7 mail support"]
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-white">
        {/* Minimal Glass Background */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-gray-400/5 rounded-full blur-[120px]" />
        </div>

      <main>
        {/* HERO */}
        <section className="pt-24 pb-16">
          <div className="container max-w-7xl px-6 mx-auto">
            <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
              <div className="space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Trusted by 10,000+ creators
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-[72px] font-semibold tracking-[-0.04em] leading-[1.05] text-gray-900">
                  Social media,
                  <br />
                  <span className="text-blue-600">on autopilot</span>
                </h1>

                <p className="text-base md:text-lg leading-relaxed text-gray-600 max-w-[520px] mx-auto lg:mx-0">
                  Schedule posts, grow your audience, and track performance — all from one beautifully simple dashboard.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
                  <Button className="h-11 px-7 rounded-full bg-gray-900 text-white hover:bg-gray-800 font-medium">
                    Get started for free
                  </Button>
                  <Button variant="outline" className="h-11 px-7 rounded-full border-gray-300 bg-white hover:bg-gray-50 font-medium">
                    Learn more
                  </Button>
                </div>

                <p className="text-xs text-gray-500">14-day free trial · No credit card required</p>
              </div>

              {/* Dashboard */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-md rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200 shadow-lg p-6">
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Overview</p>
                        <p className="text-xs text-gray-500">Last 7 days</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Posts", value: "247", growth: "+18%" },
                      { label: "Reach", value: "8.4K", growth: "+32%" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                        <p className="text-xs font-medium text-gray-500 mb-1">{m.label}</p>
                        <p className="text-2xl font-semibold text-gray-900 leading-none mb-2">{m.value}</p>
                        <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                          <ArrowRight className="w-3 h-3 rotate-[-45deg]" />
                          {m.growth}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <div className="flex justify-between mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Next scheduled</p>
                        <p className="text-sm font-semibold text-gray-900">Today at 7:30 PM</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Instagram className="w-4 h-4 text-white" />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Twitter className="w-4 h-4 text-white" />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                        <Linkedin className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-12 border-y border-gray-200 bg-gray-50">
          <div className="container max-w-6xl px-6 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl md:text-4xl font-semibold text-gray-900 mb-1">{value}</p>
                  <p className="text-sm text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16">
          <div className="container max-w-7xl px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 mb-2">
                Everything you need
              </h2>
              <p className="text-base text-gray-600">Powerful features designed to save you time.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ title, description, icon: Icon }) => (
                <div key={title} className="group rounded-xl bg-white border border-gray-200 p-5 hover:border-gray-300 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="font-semibold text-base text-gray-900 mb-1">{title}</p>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="py-16 bg-gray-50">
          <div className="container max-w-7xl px-6 mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-10 tracking-tight">
              All your platforms. One dashboard.
            </h2>

            <div className="flex flex-wrap justify-center gap-3 mb-3">
              {INTEGRATIONS.map(({ name, icon: Icon, gradient }) => (
                <div key={name} className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
                  <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{name}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500">More platforms coming soon</p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16">
          <div className="container max-w-6xl px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2 tracking-tight">
                How it works
              </h2>
              <p className="text-base text-gray-600">Get started in minutes</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Connect accounts", description: "Link your social media profiles with one click", icon: Globe },
                { step: "02", title: "Create content", description: "Use AI to generate posts or upload your own", icon: Feather },
                { step: "03", title: "Schedule & relax", description: "Let our smart scheduler post at optimal times", icon: Zap },
              ].map(({ step, title, description, icon: Icon }) => (
                <div key={step} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-xs font-semibold text-blue-600 mb-2">{step}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-16 bg-gray-50">
          <div className="container max-w-7xl px-6 mx-auto">
            <h2 className="text-center text-3xl md:text-4xl font-semibold text-gray-900 mb-12 tracking-tight">
              Loved by creators
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              {TESTIMONIALS.map(({ quote, author, role, rating }) => (
                <div key={author} className="rounded-xl bg-white border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-blue-500 text-blue-500" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">&quot;{quote}&quot;</p>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{author}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-16">
          <div className="container max-w-6xl px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2 tracking-tight">
                Simple, transparent pricing
              </h2>
              <p className="text-base text-gray-600">Choose the plan that fits your needs</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {PRICING_TIERS.map(({ name, price, description, features, popular }) => (
                <div key={name} className={`rounded-xl border p-6 ${popular ? 'border-blue-600 bg-blue-50/50 shadow-lg' : 'border-gray-200 bg-white'} hover:shadow-md transition-all`}>
                  {popular && (
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-semibold text-gray-900">{price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={"/sign-up"}>

                  <Button className={`w-full h-10 rounded-full font-medium ${popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                    Start free trial
                  </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gray-900">
          <div className="container max-w-3xl px-6 mx-auto text-center space-y-5">
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
              Start growing today
            </h2>
            <p className="text-base text-gray-400">
              Join thousands of creators simplifying their workflow.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
              <Input placeholder="Enter your email" className="h-11 rounded-full bg-white/10 border-white/20 text-white placeholder:text-gray-400" />
              <Button className="h-11 px-6 rounded-full bg-white text-gray-900 hover:bg-gray-100 font-medium whitespace-nowrap">
                Get started
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-gray-500 bg-white border-t border-gray-200">
        © 2025 Social Raven. Crafted by Tony Ghouse & Team
      </footer>
      </div>
    </>
  );
}
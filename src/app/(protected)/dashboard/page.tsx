"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";

import {
  Clock,
  Calendar,
  Link2,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

import { fetchPaginatedPostsApi } from "@/service/pagingatedPosts";
import { fetchConnectedAccountsApi } from "@/service/connectedAccounts";

import type { PostResponse } from "@/model/PostResponse";
import type { ConnectedAccount } from "@/model/ConnectedAccount";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatScheduledTime(iso: string | undefined): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [scheduledPosts, setScheduledPosts] = useState<PostResponse[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [upcomingRes, accountsRes] = await Promise.all([
          fetchPaginatedPostsApi(getToken, 0, "SCHEDULED"),
          fetchConnectedAccountsApi(getToken, null),
        ]);
        setScheduledPosts(upcomingRes.content);
        setAccounts(accountsRes);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </main>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const scheduledToday = scheduledPosts.filter((p) =>
    p.scheduledTime?.startsWith(today)
  ).length;

  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const scheduledThisWeek = scheduledPosts.filter(
    (p) => p.scheduledTime && p.scheduledTime <= weekFromNow
  ).length;

  const upcomingPosts = scheduledPosts.slice(0, 5);
  const allActive = accounts.every((acc) => acc.providerUserId);
  const failedAccounts = accounts.filter((a) => !a.providerUserId).length;
  const firstName = user?.firstName ?? "";

  return (
    <main className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[17px] font-semibold text-foreground tracking-tight leading-tight">
              {getGreeting()}{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Here&apos;s what&apos;s happening with your content
            </p>
          </div>

          <Link href="/schedule-post">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm">
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Post</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Calendar}
            label="Scheduled Today"
            value={scheduledToday}
            accent
          />
          <StatCard
            icon={Clock}
            label="This Week"
            value={scheduledThisWeek}
          />
          <StatCard
            icon={Link2}
            label="Connected Accounts"
            value={accounts.length}
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Upcoming Posts — 2/3 width */}
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <h2 className="text-[14px] font-semibold text-foreground">Upcoming Posts</h2>
              <Link
                href="/scheduled-posts"
                className="flex items-center gap-1 text-xs font-medium text-accent hover:opacity-75 transition-opacity"
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {upcomingPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No posts scheduled yet</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Schedule content to multiple platforms at once
                </p>
                <Link href="/schedule-post">
                  <button className="flex items-center gap-1.5 text-sm font-medium text-accent hover:opacity-75 transition-opacity">
                    Schedule your first post
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {upcomingPosts.map((post) => (
                  <Link key={post.id} href={`/scheduled-posts?id=${post.id}`}>
                    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {post.title || "Untitled Post"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatScheduledTime(post.scheduledTime) ?? "—"}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Account Health */}
            <div className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40">
                <h2 className="text-[14px] font-semibold text-foreground">Account Health</h2>
              </div>
              <div className="p-5 space-y-4">
                {accounts.length === 0 ? (
                  <div className="text-center py-3">
                    <AlertTriangle className="w-7 h-7 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground mb-2">No accounts connected</p>
                    <Link href="/connect-accounts">
                      <button className="text-xs font-medium text-accent hover:opacity-75 transition-opacity">
                        Connect your first account →
                      </button>
                    </Link>
                  </div>
                ) : allActive ? (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-emerald-800">All accounts active</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm font-medium text-red-700">
                      {failedAccounts} account{failedAccounts > 1 ? "s" : ""} need reconnection
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">Platforms connected</span>
                  <span className="text-2xl font-bold text-foreground tabular-nums">{accounts.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40">
                <h2 className="text-[14px] font-semibold text-foreground">Quick Actions</h2>
              </div>
              <div className="p-2">
                <QuickAction href="/schedule-post" icon={PlusCircle} label="Schedule a post" accent />
                <QuickAction href="/scheduled-posts" icon={Clock} label="Scheduled posts" />
                <QuickAction href="/calendar" icon={Calendar} label="Content calendar" />
                <QuickAction href="/connect-accounts" icon={Link2} label="Connect accounts" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 ${
        danger
          ? "bg-red-50 border-red-100"
          : "bg-card border-border/50 hover:shadow-md hover:border-border/80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {label}
          </p>
          <p
            className={`text-3xl font-bold tracking-tight tabular-nums ${
              danger ? "text-red-600" : "text-foreground"
            }`}
          >
            {value}
          </p>
        </div>
        <div
          className={`p-2.5 rounded-xl flex-shrink-0 ${
            danger ? "bg-red-100" : accent ? "bg-accent/10" : "bg-muted/60"
          }`}
        >
          <Icon
            className={`w-4 h-4 ${
              danger ? "text-red-500" : accent ? "text-accent" : "text-muted-foreground"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  accent,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  accent?: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group cursor-pointer ${
          accent ? "hover:bg-accent/8" : "hover:bg-muted/50"
        }`}
      >
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
            accent ? "bg-accent/10" : "bg-muted/70"
          }`}
        >
          <Icon
            className={`w-3.5 h-3.5 ${accent ? "text-accent" : "text-muted-foreground"}`}
          />
        </div>
        <span
          className={`text-sm font-medium flex-1 ${
            accent ? "text-accent" : "text-foreground"
          }`}
        >
          {label}
        </span>
        <ArrowRight className="w-3 h-3 text-muted-foreground/30 group-hover:translate-x-0.5 group-hover:text-muted-foreground/60 transition-all" />
      </div>
    </Link>
  );
}

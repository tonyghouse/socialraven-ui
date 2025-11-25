"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { Clock, Calendar, BarChart, Link2, PlusCircle, AlertTriangle, CheckCircle } from "lucide-react";

import { fetchAnalyticsData } from "@/service/analytics";
import { fetchScheduledPostsApi } from "@/service/posts";
import { fetchConnectedAccountsApi } from "@/service/connectedAccounts";

import type { AnalyticsData } from "@/service/analytics";
import type { PostResponse } from "@/model/PostResponse";
import type { ConnectedAccount } from "@/model/ConnectedAccount";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardPage() {
  const { getToken } = useAuth();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [upcomingPosts, setUpcomingPosts] = useState<PostResponse[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const tokenFn = getToken;

        const [analyticsRes, upcomingRes, accountsRes] = await Promise.all([
          fetchAnalyticsData(tokenFn),
          fetchScheduledPostsApi(tokenFn, 0, "SCHEDULED"),
          fetchConnectedAccountsApi(tokenFn, null),
        ]);

        setAnalytics(analyticsRes);
        setUpcomingPosts(upcomingRes.content.slice(0, 5)); // only first 3–5 entries
        setAccounts(accountsRes);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [getToken]);

  if (loading || !analytics) {
    return (
      <main className="p-6 flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </main>
    );
  }

  const scheduledToday = analytics.postsOverTime.find(
    (p) => p.date === new Date().toISOString().slice(0, 10)
  )?.count || 0;

  const failCount = analytics.failedPosts;

  const allActive = accounts.every((acc) => acc.providerUserId);
  const failedAccounts = accounts.filter((a) => !a.providerUserId).length;

  return (
    <main className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* ------------------------------------------------------------------ */}
      {/* 1. QUICK STATS OVERVIEW */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            icon={Calendar}
            title="Scheduled Today"
            value={scheduledToday}
          />

          <StatsCard
            icon={Clock}
            title="This Week"
            value={analytics.postsOverTime.slice(-7).reduce((a, b) => a + b.count, 0)}
          />

          <StatsCard
            icon={Link2}
            title="Connected Accounts"
            value={accounts.length}
          />

          <StatsCard
            icon={AlertTriangle}
            title="Failed Posts"
            value={failCount}
            danger={failCount > 0}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. QUICK ACTION PANEL */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <Card className="p-4 flex flex-wrap gap-4">
          <Link href="/schedule-post">
            <Button size="lg">
              <PlusCircle className="w-4 h-4 mr-2" /> Schedule a Post
            </Button>
          </Link>

          <Link href="/scheduled-posts">
            <Button variant="outline" size="lg">
              <Clock className="w-4 h-4 mr-2" /> View Scheduled Posts
            </Button>
          </Link>

          <Link href="/analytics">
            <Button variant="outline" size="lg">
              <BarChart className="w-4 h-4 mr-2" /> See Analytics
            </Button>
          </Link>

          <Link href="/connect-accounts">
            <Button variant="outline" size="lg">
              <Link2 className="w-4 h-4 mr-2" /> Connect Accounts
            </Button>
          </Link>
        </Card>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. UPCOMING POSTS LIST */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Posts</h2>

          {upcomingPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming posts.</p>
          ) : (
            <div className="space-y-4">
              {upcomingPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{post.title || "Untitled Post"}</p>
                    <p className="text-xs text-muted-foreground">
                      Scheduled at {post.scheduledTime}
                    </p>
                  </div>

                  <Link href={`/scheduled-posts?id=${post.id}`}>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. MINI ACTIVITY CHART */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Activity (Last 7 Days)</h2>

          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={analytics.postsOverTime.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: 12 }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. ACCOUNT HEALTH SUMMARY */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <Card className="p-6 flex items-center gap-3">
          {accounts.length === 0 ? (
            <>
              <AlertTriangle className="text-destructive" />
              <p className="text-sm">
                No accounts connected.{" "}
                <Link href="/connect-accounts" className="underline">
                  Connect your first account →
                </Link>
              </p>
            </>
          ) : allActive ? (
            <>
              <CheckCircle className="text-green-600" />
              <p>All accounts are active 👍</p>
            </>
          ) : (
            <>
              <AlertTriangle className="text-destructive" />
              <p>{failedAccounts} account(s) require reconnection ⚠️</p>
            </>
          )}
        </Card>
      </section>
    </main>
  );
}

/* Small reusable stats card */
function StatsCard({ icon: Icon, title, value, danger }: any) {
  return (
    <Card className={`p-4 ${danger ? "border-destructive/50 bg-red-50/40" : ""}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${danger ? "text-destructive" : "text-primary"}`} />
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}

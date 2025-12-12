"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

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
        setUpcomingPosts(upcomingRes.content.slice(0, 5));
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
      <main className="p-8 flex justify-center items-center min-h-screen bg-background">
        <p className="text-muted-foreground text-sm">Loading dashboard...</p>
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
    <main className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor your social media performance</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Quick Actions */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex flex-wrap gap-3">
            <Link href="/schedule-post">
              <button className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg
                hover:opacity-90 transition-all duration-200 flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Schedule Post
              </button>
            </Link>

            <Link href="/scheduled-posts">
              <button className="px-4 py-2.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg
                hover:bg-muted transition-colors duration-200 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Scheduled Posts
              </button>
            </Link>

            <Link href="/analytics">
              <button className="px-4 py-2.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg
                hover:bg-muted transition-colors duration-200 flex items-center gap-2">
                <BarChart className="w-4 h-4" /> Analytics
              </button>
            </Link>

            <Link href="/connect-accounts">
              <button className="px-4 py-2.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg
                hover:bg-muted transition-colors duration-200 flex items-center gap-2">
                <Link2 className="w-4 h-4" /> Connect Accounts
              </button>
            </Link>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Upcoming Posts - Takes 2 columns */}
          <div className="lg:col-span-2 bg-card rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Upcoming Posts</h2>

            {upcomingPosts.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No upcoming posts scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-md
                      hover:bg-muted transition-colors duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground truncate">
                        {post.title || "Untitled Post"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {post.scheduledTime}
                      </p>
                    </div>

                    <Link href={`/scheduled-posts?id=${post.id}`}>
                      <button className="ml-4 px-3 py-1.5 text-sm font-medium text-primary
                        hover:bg-secondary rounded-md transition-colors duration-200">
                        View
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Health - Takes 1 column */}
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Account Health</h2>
            
            <div className="space-y-4">
              {accounts.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
                  <p className="text-sm text-card-foreground mb-2">No accounts connected</p>
                  <Link href="/connect-accounts">
                    <button className="text-sm text-primary hover:text-accent font-medium transition-colors">
                      Connect your first account →
                    </button>
                  </Link>
                </div>
              ) : allActive ? (
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-md">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-sm text-card-foreground font-medium">All accounts active</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-md">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive font-medium">
                    {failedAccounts} account{failedAccounts > 1 ? 's' : ''} need reconnection
                  </p>
                </div>
              )}

              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">Connected platforms</p>
                <div className="text-2xl font-semibold text-card-foreground">{accounts.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-card-foreground mb-6">Activity (Last 7 Days)</h2>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics.postsOverTime.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                style={{ fontSize: 12 }} 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'calc(var(--radius) - 2px)',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--accent))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--accent))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </main>
  );
}

function StatsCard({ icon: Icon, title, value, danger }: any) {
  return (
    <div className={`bg-card rounded-lg p-6 shadow-sm border transition-all duration-200
      ${danger ? 'border-destructive/30 bg-destructive/5' : 'border-border hover:shadow-md'}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-md ${danger ? 'bg-destructive/10' : 'bg-secondary'}`}>
          <Icon className={`w-5 h-5 ${danger ? 'text-destructive' : 'text-primary'}`} />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
          <p className={`text-3xl font-semibold ${danger ? 'text-destructive' : 'text-card-foreground'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
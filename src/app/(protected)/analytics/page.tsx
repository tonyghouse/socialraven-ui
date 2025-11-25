"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Loader2,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { fetchAnalyticsData, type AnalyticsData } from "@/service/analytics";
import { StatsCard } from "@/components/analytics/stats-card";
import { ChartCard } from "@/components/analytics/chart-card";

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pastel palette
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
  const providerColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAnalyticsData(getToken);
        setAnalytics(data);
      } catch (err) {
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Overview of your posting activity and performance
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Posts"
            value={analytics.totalPosts}
            icon={TrendingUp}
            subtitle={`${analytics.averageMediaPerPost.toFixed(1)} media / post`}
          />
          <StatsCard
            title="Published"
            value={analytics.publishedPosts}
            icon={CheckCircle2}
            className="border-green-200/50 bg-green-50/50"
          />
          <StatsCard
            title="Scheduled"
            value={analytics.scheduledPosts}
            icon={Clock}
            className="border-blue-200/50 bg-blue-50/50"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ✔ Status Distribution */}
          <ChartCard title="Post Status Distribution">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.postStatusDistribution)
                    .filter(([name]) => name !== "draft")
                    .map(([name, value]) => ({
                      name: name.charAt(0).toUpperCase() + name.slice(1),
                      value,
                    }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {colors.map((color, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ✔ Posts by Provider */}
          <ChartCard title="Posts by Platform">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={Object.entries(analytics.postsPerProvider).map(
                  ([provider, count]) => ({
                    name: provider.charAt(0).toUpperCase() + provider.slice(1),
                    count,
                  })
                )}
                barCategoryGap="40%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: "rgba(59,130,246,0.08)" }} />
                <Bar
                  dataKey="count"
                  barSize={22}
                  radius={[8, 8, 0, 0]}
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ✔ Activity Timeline */}
          <ChartCard title="Activity Timeline" >
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.postsOverTime}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: 12 }}
                />
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
          </ChartCard>

          {/* ✔ Media Types */}
          <ChartCard title="Media Types Used" >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                layout="vertical"
                data={Object.entries(
                  analytics.mediaTypeDistribution
                ).map(([type, count]) => ({
                  type: type.toUpperCase(),
                  count,
                }))}
                barCategoryGap="35%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: 12 }}
                />
                <YAxis
                  dataKey="type"
                  type="category"
                  stroke="hsl(var(--muted-foreground))"
                  width={60}
                  style={{ fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: "rgba(139,92,246,0.06)" }} />
                <Bar
                  dataKey="count"
                  fill="#8b5cf6"
                  barSize={18}
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-6 bg-card border border-border rounded-lg">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Success Rate
            </p>
            <p className="text-3xl font-bold">
              {(
                (analytics.publishedPosts /
                  (analytics.publishedPosts + analytics.failedPosts)) *
                100
              ).toFixed(0)}
              %
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Avg Media Per Post
            </p>
            <p className="text-3xl font-bold">
              {analytics.averageMediaPerPost.toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

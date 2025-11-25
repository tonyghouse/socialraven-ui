"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"


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
} from "recharts"
import { AlertCircle, BarChart3, Loader2, FileText, Calendar, CheckCircle2 } from "lucide-react"
import { StatsCard } from "@/components/analytics/stats-card"
import { ChartCard } from "@/components/analytics/chart-card"
import { fetchAnalyticsData } from "@/service/analytics"

export default function AnalyticsPage() {
  const { getToken } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]
  const providerColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchAnalyticsData(getToken)
        setAnalytics(data)
      } catch (err) {
        console.error("Error loading analytics:", err)
        setError("Failed to load analytics data")
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [getToken])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-muted-foreground">{error || "Failed to load analytics"}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-sm text-muted-foreground">Comprehensive insights into your posts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Posts"
            value={analytics.totalPosts}
            icon={FileText}
            subtitle={`${analytics.averageMediaPerPost.toFixed(1)} media avg`}
          />
          <StatsCard
            title="Published"
            value={analytics.publishedPosts}
            icon={CheckCircle2}
            trend={12}
            className="border-green-500/20 bg-green-500/5"
          />
          <StatsCard
            title="Scheduled"
            value={analytics.scheduledPosts}
            icon={Calendar}
            subtitle={`${analytics.draftPosts} drafts`}
          />
          <StatsCard
            title="Failed Posts"
            value={analytics.failedPosts}
            icon={AlertCircle}
            trend={analytics.failedPosts > 0 ? -5 : 0}
            className={analytics.failedPosts > 0 ? "border-red-500/20 bg-red-500/5" : ""}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <ChartCard title="Post Status Distribution" description="Breakdown of all posts by status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.postStatusDistribution).map(([name, value]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#3b82f6"
                  dataKey="value"
                >
                  {colors.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Provider Distribution */}
          <ChartCard title="Posts by Provider" description="Distribution across social media platforms">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(analytics.postsPerProvider).map(([provider, count]) => ({
                  name: provider,
                  count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Posts Over Time */}
          <ChartCard title="Posts Over Time" description="Post activity in the last 14 days" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.postsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Media Type Distribution */}
          <ChartCard title="Media Types Used" description="Breakdown of media file types">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                layout="vertical"
                data={Object.entries(analytics.mediaTypeDistribution).map(([type, count]) => ({
                  type: type.charAt(0).toUpperCase() + type.slice(1),
                  count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="type" type="category" stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
            <p className="text-2xl font-bold text-foreground">
              {((analytics.publishedPosts / analytics.totalPosts) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Of total posts published</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Average Media Items</p>
            <p className="text-2xl font-bold text-foreground">{analytics.averageMediaPerPost.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">Per post</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Media Files</p>
            <p className="text-2xl font-bold text-foreground">
              {Object.values(analytics.mediaTypeDistribution).reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Across all posts</p>
          </div>
        </div>
      </div>
    </main>
  )
}

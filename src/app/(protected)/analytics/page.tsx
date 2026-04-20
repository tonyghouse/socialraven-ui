"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  FileText,
  Layers3,
  Minus,
  RefreshCw,
  Users,
} from "lucide-react";

import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";
import {
  fetchAnalyticsBreakdownEngineApi,
  fetchAnalyticsPostRankingsApi,
  fetchAnalyticsPostTableApi,
  fetchAnalyticsShellApi,
  fetchAnalyticsLinkedInPageActivityApi,
  fetchAnalyticsTikTokCreatorActivityApi,
  fetchAnalyticsTrendExplorerApi,
  fetchAnalyticsYouTubeChannelActivityApi,
  fetchAnalyticsWorkspaceOverviewApi,
  requestAnalyticsRefreshApi,
  type AnalyticsBreakdownResponse,
  type AnalyticsLinkedInPageActivityResponse,
  type AnalyticsManualRefreshProviderResult,
  type AnalyticsOverviewMetric,
  type AnalyticsMetricAvailabilityWindow,
  type AnalyticsPostRankingsResponse,
  type AnalyticsPostRow,
  type AnalyticsPostTableResponse,
  type AnalyticsProviderCoverage,
  type AnalyticsSelectOption,
  type AnalyticsShellResponse,
  type AnalyticsTikTokCreatorActivityResponse,
  type AnalyticsTrendExplorerPoint,
  type AnalyticsTrendExplorerResponse,
  type AnalyticsYouTubeChannelActivityResponse,
  type AnalyticsWorkspaceOverview,
  type DateRange,
} from "@/service/analytics";

const pageClassName = "min-h-screen bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)]";
const surfaceClassName =
  "overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-none";
const subtleButtonClassName =
  "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-[var(--ds-background-100)]";
const segmentedControlClassName =
  "flex items-center gap-1 rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-1";
const segmentedButtonClassName =
  "rounded-md px-3 py-1.5 text-label-14 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)]";

const countFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const compactCountFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const rankingMetricOptions: AnalyticsSelectOption[] = [
  { value: "engagements", label: "Engagements" },
  { value: "engagementRate", label: "Engagement Rate" },
  { value: "impressions", label: "Impressions" },
  { value: "reach", label: "Reach" },
  { value: "clicks", label: "Clicks" },
  { value: "shares", label: "Shares" },
  { value: "saves", label: "Saves" },
  { value: "videoViews", label: "Video Views" },
  { value: "watchTimeMinutes", label: "Watch Time" },
];

const tableSortOptions: AnalyticsSelectOption[] = [
  { value: "publishedAt", label: "Published date" },
  { value: "engagements", label: "Engagements" },
  { value: "engagementRate", label: "Engagement rate" },
  { value: "impressions", label: "Impressions" },
  { value: "reach", label: "Reach" },
  { value: "likes", label: "Likes" },
  { value: "comments", label: "Comments" },
  { value: "shares", label: "Shares" },
  { value: "saves", label: "Saves" },
  { value: "clicks", label: "Clicks" },
  { value: "videoViews", label: "Video views" },
  { value: "watchTimeMinutes", label: "Watch time" },
];

const sortDirectionOptions: AnalyticsSelectOption[] = [
  { value: "desc", label: "High to low" },
  { value: "asc", label: "Low to high" },
];

const breakdownDimensionOptions: AnalyticsSelectOption[] = [
  { value: "platform", label: "Platform" },
  { value: "account", label: "Account" },
  { value: "campaign", label: "Campaign" },
  { value: "postType", label: "Post type" },
  { value: "mediaFormat", label: "Media format" },
  { value: "weekday", label: "Weekday" },
  { value: "hourBucket", label: "Hour bucket" },
];

const breakdownMetricOptions: AnalyticsSelectOption[] = rankingMetricOptions.filter(
  (option) => option.value !== "engagementRate"
);

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLabel(value?: string | null) {
  if (!value) return "—";
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(value?: number | null, compact = false) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return compact ? compactCountFormatter.format(value) : countFormatter.format(value);
}

function formatWatchTimeMinutes(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (value < 60) return `${countFormatter.format(value)} min`;

  const hours = value / 60;
  if (hours < 24) return `${countFormatter.format(hours)} h`;

  const days = hours / 24;
  return `${countFormatter.format(days)} d`;
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${countFormatter.format(value)}%`;
}

function formatMetricValue(
  value: number | null | undefined,
  format: "number" | "percent",
  compact = false
) {
  return format === "percent" ? formatPercent(value) : formatNumber(value, compact);
}

function formatMetricByKey(
  metric: string,
  value: number | null | undefined,
  format: "number" | "percent",
  compact = false
) {
  if (metric === "watchTimeMinutes") {
    return formatWatchTimeMinutes(value);
  }
  return formatMetricValue(value, format, compact);
}

function formatAxisMetric(
  metric: string,
  value: number,
  format: "number" | "percent"
) {
  if (metric === "watchTimeMinutes") {
    return formatWatchTimeMinutes(value);
  }
  if (format === "percent") {
    return `${Math.round(value)}%`;
  }
  return compactCountFormatter.format(value);
}

function formatShortDateLabel(value?: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatBucketLabel(point: AnalyticsTrendExplorerPoint) {
  if (point.bucketStartDate === point.bucketEndDate) {
    return formatShortDateLabel(point.bucketStartDate);
  }
  return `${formatShortDateLabel(point.bucketStartDate)}-${formatShortDateLabel(
    point.bucketEndDate
  )}`;
}

function labelForProvider(provider: string) {
  switch (provider.toLowerCase()) {
    case "x":
      return "X";
    case "youtube":
      return "YouTube";
    case "linkedin":
      return "LinkedIn";
    case "instagram":
      return "Instagram";
    case "facebook":
      return "Facebook";
    case "threads":
      return "Threads";
    case "tiktok":
      return "TikTok";
    default:
      return provider;
  }
}

function labelForPostType(postType: string) {
  switch (postType.toLowerCase()) {
    case "image":
      return "Image";
    case "video":
      return "Video";
    case "text":
      return "Text";
    default:
      return postType;
  }
}

function statusPillClass(status: string) {
  switch (status) {
    case "LIVE":
    case "FRESH":
    case "SCHEDULED":
      return "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]";
    case "PARTIAL":
    case "DELAYED":
    case "COOLDOWN":
    case "WINDOW_EXPIRED":
      return "border-[var(--ds-yellow-300)] bg-[var(--ds-yellow-100)] text-[var(--ds-yellow-800)]";
    case "AVAILABLE":
      return "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]";
    case "UNSUPPORTED":
    case "STALE":
    case "FAILED":
      return "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]";
    default:
      return "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]";
  }
}

function toneForSurface(status: string) {
  if (status === "FRESH" || status === "LIVE") {
    return "border-[var(--ds-green-200)]";
  }
  if (status === "DELAYED" || status === "PARTIAL") {
    return "border-[var(--ds-yellow-300)]";
  }
  if (status === "STALE" || status === "UNSUPPORTED") {
    return "border-[var(--ds-red-200)]";
  }
  return "border-[var(--ds-gray-400)]";
}

function formatMetricLabel(metric: string) {
  return metric.toLowerCase().replace(/_/g, " ");
}

function formatModeLabel(mode: string) {
  return mode.toLowerCase().replace(/_/g, " ");
}

function formatAvailabilityMetrics(metrics: string[]) {
  return metrics.map(formatMetricLabel).join(", ");
}

function rankingMetricLabel(metric: string) {
  return (
    rankingMetricOptions.find((option) => option.value === metric)?.label ??
    formatMetricLabel(metric)
  );
}

function previewText(row: AnalyticsPostRow) {
  const raw = row.content || row.campaignLabel || row.providerPostId || `Post #${row.postId}`;
  return raw.length <= 110 ? raw : `${raw.slice(0, 107)}...`;
}

function rowMetricValue(row: AnalyticsPostRow, metric: string) {
  switch (metric) {
    case "impressions":
      return row.impressions;
    case "reach":
      return row.reach;
    case "likes":
      return row.likes;
    case "comments":
      return row.comments;
    case "shares":
      return row.shares;
    case "saves":
      return row.saves;
    case "clicks":
      return row.clicks;
    case "videoViews":
      return row.videoViews;
    case "watchTimeMinutes":
      return row.watchTimeMinutes;
    case "engagementRate":
      return row.engagementRate;
    default:
      return row.engagements;
  }
}

function formatRankingMetric(row: AnalyticsPostRow, metric: string) {
  const value = rowMetricValue(row, metric);
  if (metric === "engagementRate") {
    return formatPercent(value);
  }
  if (metric === "watchTimeMinutes") {
    return formatWatchTimeMinutes(value);
  }
  return formatNumber(value);
}

function deltaTone(metric: AnalyticsOverviewMetric) {
  if (metric.deltaValue > 0) return "positive";
  if (metric.deltaValue < 0) return "negative";
  return "neutral";
}

function deltaClassName(metric: AnalyticsOverviewMetric) {
  switch (deltaTone(metric)) {
    case "positive":
      return "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]";
    case "negative":
      return "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]";
    default:
      return "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]";
  }
}

function deltaCopy(metric: AnalyticsOverviewMetric) {
  const sign = metric.deltaValue > 0 ? "+" : "";
  const absolute =
    metric.format === "percent"
      ? `${sign}${formatNumber(metric.deltaValue)} pts`
      : `${sign}${formatNumber(metric.deltaValue)}`;

  if (metric.deltaPercent === null) {
    return metric.currentValue === 0 && metric.previousValue === 0 ? "No prior baseline" : absolute;
  }

  const relativeSign = metric.deltaPercent > 0 ? "+" : "";
  return `${absolute} · ${relativeSign}${formatNumber(metric.deltaPercent)}%`;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <section className={cn(surfaceClassName, "p-4")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
          <Icon className="h-4 w-4" />
        </div>
        {helper ? (
          <span className="text-label-12 text-[var(--ds-gray-900)]">{helper}</span>
        ) : null}
      </div>
      <p className="mt-4 text-label-12 text-[var(--ds-gray-900)]">{label}</p>
      <p className="mt-1 text-heading-32 text-[var(--ds-gray-1000)]">{value}</p>
    </section>
  );
}

function FilterField({
  label,
  value,
  onValueChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: AnalyticsSelectOption[];
  allLabel: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-label-12 text-[var(--ds-gray-900)]">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]">
          <SelectValue placeholder={allLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function ControlField({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: AnalyticsSelectOption[];
}) {
  return (
    <label className="space-y-2">
      <span className="text-label-12 text-[var(--ds-gray-900)]">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function OverviewMetricCard({
  metric,
  currentRangeLabel,
  previousRangeLabel,
}: {
  metric: AnalyticsOverviewMetric;
  currentRangeLabel: string;
  previousRangeLabel: string;
}) {
  const DeltaIcon =
    deltaTone(metric) === "positive"
      ? ArrowUpRight
      : deltaTone(metric) === "negative"
        ? ArrowDownRight
        : Minus;

  return (
    <section className={cn(surfaceClassName, "p-4")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label-12 text-[var(--ds-gray-900)]">{metric.label}</p>
          <p className="mt-1 text-heading-28 text-[var(--ds-gray-1000)]">
            {formatMetricValue(metric.currentValue, metric.format, true)}
          </p>
        </div>
        <span className="rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-900)]">
          {currentRangeLabel}
        </span>
      </div>

      <div
        className={cn(
          "mt-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label-12",
          deltaClassName(metric)
        )}
      >
        <DeltaIcon className="h-3.5 w-3.5" />
        <span>{deltaCopy(metric)}</span>
      </div>

      <p className="mt-3 text-copy-13 text-[var(--ds-gray-900)]">
        {previousRangeLabel}: {formatMetricValue(metric.previousValue, metric.format)}
      </p>
    </section>
  );
}

function ShareMeter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | null;
  tone: "neutral" | "accent";
}) {
  const safeValue = Math.max(0, Math.min(value ?? 0, 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-label-12">
        <span className="text-[var(--ds-gray-900)]">{label}</span>
        <span className="text-[var(--ds-gray-1000)]">{formatPercent(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--ds-gray-200)]">
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            tone === "accent" ? "bg-[var(--ds-blue-600)]" : "bg-[var(--ds-gray-700)]"
          )}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function shareGapClassName(value: number | null) {
  if (value === null || Number.isNaN(value) || value === 0) {
    return "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]";
  }
  if (value > 0) {
    return "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]";
  }
  return "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]";
}

function TrendExplorerSection({
  trend,
  loading,
  metric,
  granularity,
  onMetricChange,
  onGranularityChange,
}: {
  trend: AnalyticsTrendExplorerResponse | null;
  loading: boolean;
  metric: string;
  granularity: "daily" | "weekly";
  onMetricChange: (value: string) => void;
  onGranularityChange: (value: "daily" | "weekly") => void;
}) {
  const points = granularity === "daily" ? trend?.daily ?? [] : trend?.weekly ?? [];
  const chartData = points.map((point) => ({
    bucketKey: point.bucketKey,
    bucketLabel: formatBucketLabel(point),
    performanceValue: point.performanceValue,
    postsPublished: point.postsPublished,
    averagePerformancePerPost: point.averagePerformancePerPost,
  }));
  const metricLabel = trend?.metricLabel ?? rankingMetricLabel(metric);
  const metricFormat = trend?.metricFormat ?? (metric === "engagementRate" ? "percent" : "number");

  return (
    <section className={cn(surfaceClassName, "px-4 py-4")}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-heading-16 text-[var(--ds-gray-1000)]">Trend Explorer</p>
          <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
            Track how posting volume and the selected performance metric move together across the current workspace slice.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:max-w-2xl sm:grid-cols-[minmax(0,1fr)_auto]">
          <ControlField
            label="Performance metric"
            value={metric}
            onValueChange={onMetricChange}
            options={rankingMetricOptions}
          />
          <div className="space-y-2">
            <span className="text-label-12 text-[var(--ds-gray-900)]">Rollup</span>
            <div className={segmentedControlClassName}>
              {(["daily", "weekly"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onGranularityChange(value)}
                  className={cn(
                    segmentedButtonClassName,
                    granularity === value
                      ? "border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]"
                      : "text-[var(--ds-gray-900)] hover:bg-[var(--ds-background-100)] hover:text-[var(--ds-gray-1000)]"
                  )}
                >
                  {value === "daily" ? "Daily" : "Weekly"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          label={metricLabel}
          value={loading ? "—" : formatMetricByKey(metric, trend?.totalPerformanceValue, metricFormat, true)}
        />
        <MetricTile
          label="Posts published"
          value={loading ? "—" : formatNumber(trend?.totalPostsPublished ?? 0)}
        />
        <MetricTile
          label="Average per post"
          value={
            loading
              ? "—"
              : formatMetricByKey(metric, trend?.averagePerformancePerPost, metricFormat, true)
          }
        />
        <MetricTile
          label="Window"
          value={
            loading
              ? "—"
              : `${formatDateLabel(trend?.currentStartAt ?? null)} to ${formatDateLabel(
                  trend?.currentEndAt ?? null
                )}`
          }
        />
      </div>

      {points.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-6 text-copy-14 text-[var(--ds-gray-900)]">
          {loading
            ? "Loading workspace trend rollups."
            : "No published posts match the selected slice yet, so trend rollups are empty."}
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-3">
            <div className="h-[20rem] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--ds-gray-300)" vertical={false} />
                  <XAxis
                    dataKey="bucketLabel"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={16}
                    tick={{ fill: "var(--ds-gray-900)", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="performance"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatAxisMetric(metric, Number(value), metricFormat)}
                    tick={{ fill: "var(--ds-gray-900)", fontSize: 12 }}
                    width={72}
                  />
                  <YAxis
                    yAxisId="posts"
                    orientation="right"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatNumber(Number(value), true)}
                    tick={{ fill: "var(--ds-gray-900)", fontSize: 12 }}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      borderColor: "var(--ds-gray-400)",
                      backgroundColor: "var(--ds-background-100)",
                      borderRadius: 12,
                    }}
                    formatter={(value, name) => {
                      const numericValue = Number(value);
                      if (name === "postsPublished") {
                        return [formatNumber(numericValue), "Posts published"];
                      }
                      return [
                        formatMetricByKey(metric, numericValue, metricFormat),
                        metricLabel,
                      ];
                    }}
                  />
                  <Legend
                    formatter={(value) =>
                      value === "postsPublished" ? "Posts published" : metricLabel
                    }
                  />
                  <Bar
                    yAxisId="posts"
                    dataKey="postsPublished"
                    name="postsPublished"
                    radius={[6, 6, 0, 0]}
                    fill="var(--ds-gray-500)"
                    maxBarSize={34}
                  />
                  <Line
                    yAxisId="performance"
                    type="monotone"
                    dataKey="performanceValue"
                    name="performanceValue"
                    stroke="var(--ds-blue-600)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "var(--ds-blue-600)" }}
                    activeDot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[var(--ds-gray-400)]">
            <ScrollArea className="w-full">
              <table className="min-w-[52rem] border-collapse">
                <thead className="bg-[var(--ds-gray-100)]">
                  <tr className="border-b border-[var(--ds-gray-400)]">
                    <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">
                      Bucket
                    </th>
                    <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                      {metricLabel}
                    </th>
                    <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                      Posts Published
                    </th>
                    <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                      Average Per Post
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((point) => (
                    <tr
                      key={`${granularity}-${point.bucketKey}`}
                      className="border-b border-[var(--ds-gray-400)] align-top last:border-b-0"
                    >
                      <td className="px-3 py-3 text-copy-14 text-[var(--ds-gray-1000)]">
                        {formatBucketLabel(point)}
                      </td>
                      <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                        {formatMetricByKey(metric, point.performanceValue, metricFormat)}
                      </td>
                      <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                        {formatNumber(point.postsPublished)}
                      </td>
                      <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                        {formatMetricByKey(
                          metric,
                          point.averagePerformancePerPost,
                          metricFormat
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        </>
      )}
    </section>
  );
}

function BreakdownEngineSection({
  breakdown,
  loading,
  dimension,
  metric,
  onDimensionChange,
  onMetricChange,
}: {
  breakdown: AnalyticsBreakdownResponse | null;
  loading: boolean;
  dimension: string;
  metric: string;
  onDimensionChange: (value: string) => void;
  onMetricChange: (value: string) => void;
}) {
  const rows = breakdown?.rows ?? [];
  const metricLabel = breakdown?.metricLabel ?? rankingMetricLabel(metric);
  const metricFormat = breakdown?.metricFormat ?? "number";
  const usingUtcBuckets = dimension === "weekday" || dimension === "hourBucket";

  return (
    <section className={cn(surfaceClassName, "px-4 py-4")}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-heading-16 text-[var(--ds-gray-1000)]">Breakdown Engine</p>
          <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
            Compare share of publishing output against share of results to see which slices pull above or below their weight.
          </p>
          {usingUtcBuckets ? (
            <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">
              Weekday and hour buckets use UTC publish timestamps.
            </p>
          ) : null}
        </div>
        <div className="grid w-full gap-3 sm:max-w-2xl sm:grid-cols-2">
          <ControlField
            label="Break down by"
            value={dimension}
            onValueChange={onDimensionChange}
            options={breakdownDimensionOptions}
          />
          <ControlField
            label="Result metric"
            value={metric}
            onValueChange={onMetricChange}
            options={breakdownMetricOptions}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          label={metricLabel}
          value={
            loading
              ? "—"
              : formatMetricByKey(metric, breakdown?.totalPerformanceValue, metricFormat, true)
          }
        />
        <MetricTile
          label="Posts published"
          value={loading ? "—" : formatNumber(breakdown?.totalPostsPublished ?? 0)}
        />
        <MetricTile
          label="Average per post"
          value={
            loading
              ? "—"
              : formatMetricByKey(metric, breakdown?.averagePerformancePerPost, metricFormat, true)
          }
        />
        <MetricTile
          label="Current dimension"
          value={loading ? "—" : breakdown?.dimensionLabel ?? "—"}
        />
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-6 text-copy-14 text-[var(--ds-gray-900)]">
          {loading
            ? "Loading contribution breakdown rows."
            : "No published posts match the selected slice yet, so the breakdown is empty."}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-[var(--ds-gray-400)]">
          <ScrollArea className="w-full">
            <table className="min-w-[78rem] border-collapse">
              <thead className="bg-[var(--ds-gray-100)]">
                <tr className="border-b border-[var(--ds-gray-400)]">
                  <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">
                    {breakdown?.dimensionLabel ?? "Group"}
                  </th>
                  <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">
                    Share Comparison
                  </th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                    Share Gap
                  </th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                    Posts
                  </th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                    {metricLabel}
                  </th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                    Average Per Post
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${dimension}-${row.key}`}
                    className="border-b border-[var(--ds-gray-400)] align-top last:border-b-0"
                  >
                    <td className="px-3 py-3 text-copy-14 text-[var(--ds-gray-1000)]">
                      <div className="min-w-[13rem]">
                        <p>{row.label}</p>
                        <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">{row.key}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="min-w-[16rem] space-y-3">
                        <ShareMeter label="Output share" value={row.outputSharePercent} tone="neutral" />
                        <ShareMeter
                          label="Performance share"
                          value={row.performanceSharePercent}
                          tone="accent"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-label-12",
                          shareGapClassName(row.shareGapPercent)
                        )}
                      >
                        {row.shareGapPercent === null
                          ? "—"
                          : `${row.shareGapPercent > 0 ? "+" : ""}${formatPercent(
                              row.shareGapPercent
                            )}`}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.postsPublished)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatMetricByKey(metric, row.performanceValue, metricFormat)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatMetricByKey(metric, row.averagePerformancePerPost, metricFormat)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      )}
    </section>
  );
}

function MetricTag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-2">
      <p className="text-label-11 uppercase tracking-[0.04em] text-[var(--ds-gray-900)]">
        {label}
      </p>
      <p className="mt-1 text-label-13 text-[var(--ds-gray-1000)]">{value}</p>
    </div>
  );
}

function RankingColumn({
  title,
  rows,
  metric,
  emptyBody,
}: {
  title: string;
  rows: AnalyticsPostRow[];
  metric: string;
  emptyBody: string;
}) {
  return (
    <section className={cn(surfaceClassName, "px-4 py-4")}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-heading-16 text-[var(--ds-gray-1000)]">{title}</p>
          <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
            Ranked by {rankingMetricLabel(metric).toLowerCase()} inside the selected workspace slice.
          </p>
        </div>
        <span className="rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-900)]">
          {rows.length} posts
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-copy-14 text-[var(--ds-gray-900)]">{emptyBody}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((row, index) => (
            <div
              key={`${title}-${row.postId}`}
              className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-1000)]">
                      #{index + 1}
                    </span>
                    <span className="rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-900)]">
                      {labelForProvider(row.provider)}
                    </span>
                    <span className="rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-900)]">
                      {labelForPostType(row.postType)}
                    </span>
                  </div>

                  <p className="mt-3 text-copy-14 text-[var(--ds-gray-1000)]">{previewText(row)}</p>

                  <p className="mt-2 text-label-12 text-[var(--ds-gray-900)]">
                    {row.accountName || row.providerUserId}
                    {row.campaignLabel ? ` · ${row.campaignLabel}` : ""}
                    {row.publishedAt ? ` · ${formatDateTime(row.publishedAt)}` : ""}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-label-12 text-[var(--ds-gray-900)]">
                    {rankingMetricLabel(metric)}
                  </p>
                  <p className="mt-1 text-heading-24 text-[var(--ds-gray-1000)]">
                    {formatRankingMetric(row, metric)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <MetricTag label="Engagements" value={formatNumber(row.engagements)} />
                <MetricTag label="Engagement rate" value={formatPercent(row.engagementRate)} />
                <MetricTag label="Impressions" value={formatNumber(row.impressions)} />
                <MetricTag label="Likes" value={formatNumber(row.likes)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CoverageCard({ coverage }: { coverage: AnalyticsProviderCoverage }) {
  return (
    <section className={cn(surfaceClassName, "border", toneForSurface(coverage.freshnessStatus))}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--ds-gray-400)] px-4 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">
              {labelForProvider(coverage.provider)}
            </h2>
            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-1 text-label-12",
                statusPillClass(coverage.freshnessStatus)
              )}
            >
              {coverage.freshnessStatus.toLowerCase()}
            </span>
          </div>
          <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
            {coverage.connectedAccountCount} connected accounts in this workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-1 text-label-12",
              statusPillClass(coverage.postAnalyticsState)
            )}
          >
            post {coverage.postAnalyticsState.toLowerCase()}
          </span>
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-1 text-label-12",
              statusPillClass(coverage.accountAnalyticsState)
            )}
          >
            account {coverage.accountAnalyticsState.toLowerCase()}
          </span>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricTile label="Tracked posts" value={String(coverage.trackedPostCount)} />
            <MetricTile label="Milestone rows" value={String(coverage.milestoneSnapshotCount)} />
            <MetricTile
              label="Account daily rows"
              value={String(coverage.accountDailySnapshotCount)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailRow label="Last post write" value={formatDateTime(coverage.lastPostAnalyticsAt)} />
            <DetailRow
              label="Last account write"
              value={formatDateTime(coverage.lastAccountAnalyticsAt)}
            />
            <DetailRow
              label="Last successful job"
              value={formatDateTime(coverage.lastSuccessfulJobAt)}
            />
            <DetailRow
              label="Last attempted job"
              value={formatDateTime(coverage.lastAttemptedJobAt)}
            />
            <DetailRow
              label="Last manual refresh"
              value={formatDateTime(coverage.lastManualRefreshRequestedAt)}
            />
          </div>

          {coverage.lastErrorSummary ? (
            <div className="rounded-lg border border-[var(--ds-red-200)] bg-[var(--ds-red-100)] px-3 py-2 text-label-13 text-[var(--ds-red-700)]">
              {coverage.lastErrorSummary}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <AvailabilityBlock items={coverage.metricAvailability} />
          <TagBlock title="Supported post metrics" values={coverage.supportedPostMetrics} />
          <TagBlock
            title="Supported account metrics"
            values={coverage.supportedAccountMetrics}
          />
          <TagBlock
            title="Collection modes"
            values={coverage.collectionModes}
            formatter={formatModeLabel}
          />
        </div>
      </div>
    </section>
  );
}

function LinkedInPageActivitySection({
  activity,
  loading,
}: {
  activity: AnalyticsLinkedInPageActivityResponse | null;
  loading: boolean;
}) {
  const rows = activity?.rows ?? [];

  return (
    <section className={cn(surfaceClassName, "px-4 py-4")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-heading-16 text-[var(--ds-gray-1000)]">LinkedIn Page Activity</p>
          <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
            Daily organization page traffic and click contribution across the connected LinkedIn pages in this workspace.
          </p>
        </div>
        <span className="rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-900)]">
          {loading ? "Loading page activity..." : activity?.currentRangeLabel ?? "Current period"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricTile label="Tracked pages" value={loading ? "—" : String(activity?.trackedAccounts ?? 0)} />
        <MetricTile label="Page views" value={loading ? "—" : formatNumber(activity?.totalPageViews ?? 0)} />
        <MetricTile
          label="Unique page views"
          value={loading ? "—" : formatNumber(activity?.totalUniquePageViews ?? 0)}
        />
        <MetricTile label="Clicks" value={loading ? "—" : formatNumber(activity?.totalClicks ?? 0)} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <DetailRow label="Follower delta" value={loading ? "—" : formatNumber(activity?.totalFollowerDelta ?? 0)} />
        <DetailRow
          label="Window"
          value={
            loading
              ? "—"
              : `${formatDateLabel(activity?.currentStartDate ?? null)} to ${formatDateLabel(
                  activity?.currentEndDate ?? null
                )}`
          }
        />
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-6 text-copy-14 text-[var(--ds-gray-900)]">
          {loading
            ? "Loading LinkedIn organization page activity."
            : "No LinkedIn organization page snapshots exist for this date range yet."}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-[var(--ds-gray-400)]">
          <ScrollArea className="w-full">
            <table className="min-w-[68rem] border-collapse">
              <thead className="bg-[var(--ds-gray-100)]">
                <tr className="border-b border-[var(--ds-gray-400)]">
                  <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">Page</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Followers</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Follower Delta</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Page Views</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Unique Views</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Clicks</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Page View Share</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Click Share</th>
                  <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">Last Snapshot</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.providerUserId}
                    className="border-b border-[var(--ds-gray-400)] align-top last:border-b-0"
                  >
                    <td className="px-3 py-3">
                      <p className="text-copy-14 text-[var(--ds-gray-1000)]">{row.accountName || row.providerUserId}</p>
                      <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">{row.providerUserId}</p>
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.followers)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.followerDelta)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.pageViews)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.uniquePageViews)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.clicks)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatPercent(row.pageViewSharePercent)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatPercent(row.clickSharePercent)}
                    </td>
                    <td className="px-3 py-3 text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatDateLabel(row.lastSnapshotDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      )}
    </section>
  );
}

function YouTubeChannelActivitySection({
  activity,
  loading,
}: {
  activity: AnalyticsYouTubeChannelActivityResponse | null;
  loading: boolean;
}) {
  const rows = activity?.rows ?? [];
  const trend = activity?.trend ?? [];

  return (
    <section className={cn(surfaceClassName, "px-4 py-4")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-heading-16 text-[var(--ds-gray-1000)]">YouTube Channel Performance</p>
          <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
            Daily channel watch performance across the connected YouTube channels in this workspace, using the real YouTube Analytics API.
          </p>
        </div>
        <span className="rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-900)]">
          {loading ? "Loading channel activity..." : activity?.currentRangeLabel ?? "Current period"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricTile label="Tracked channels" value={loading ? "—" : String(activity?.trackedAccounts ?? 0)} />
        <MetricTile label="Views" value={loading ? "—" : formatNumber(activity?.totalVideoViews ?? 0)} />
        <MetricTile
          label="Watch time"
          value={loading ? "—" : formatWatchTimeMinutes(activity?.totalWatchTimeMinutes ?? 0)}
        />
        <MetricTile
          label="Subscriber delta"
          value={loading ? "—" : formatNumber(activity?.totalSubscriberDelta ?? 0)}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricTile label="Likes" value={loading ? "—" : formatNumber(activity?.totalLikes ?? 0)} />
        <MetricTile label="Comments" value={loading ? "—" : formatNumber(activity?.totalComments ?? 0)} />
        <MetricTile label="Shares" value={loading ? "—" : formatNumber(activity?.totalShares ?? 0)} />
        <MetricTile
          label="Window"
          value={
            loading
              ? "—"
              : `${formatDateLabel(activity?.currentStartDate ?? null)} to ${formatDateLabel(
                  activity?.currentEndDate ?? null
                )}`
          }
        />
      </div>

      {trend.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-6 text-copy-14 text-[var(--ds-gray-900)]">
          {loading
            ? "Loading daily YouTube channel trend rows."
            : "No YouTube channel snapshots exist for this date range yet."}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-[var(--ds-gray-400)]">
          <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-3">
            <p className="text-label-14 text-[var(--ds-gray-1000)]">Daily Trend</p>
            <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">
              Views, watch time, and subscriber movement by day for the selected workspace slice.
            </p>
          </div>
          <ScrollArea className="w-full">
            <table className="min-w-[44rem] border-collapse">
              <thead className="bg-[var(--ds-background-100)]">
                <tr className="border-b border-[var(--ds-gray-400)]">
                  <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">Date</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Views</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Watch Time</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Subscriber Delta</th>
                </tr>
              </thead>
              <tbody>
                {trend.map((point) => (
                  <tr
                    key={point.snapshotDate}
                    className="border-b border-[var(--ds-gray-400)] align-top last:border-b-0"
                  >
                    <td className="px-3 py-3 text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatDateLabel(point.snapshotDate)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(point.videoViews)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatWatchTimeMinutes(point.watchTimeMinutes)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(point.subscriberDelta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      )}

      {rows.length > 0 ? (
        <div className="mt-4 rounded-lg border border-[var(--ds-gray-400)]">
          <ScrollArea className="w-full">
            <table className="min-w-[76rem] border-collapse">
              <thead className="bg-[var(--ds-gray-100)]">
                <tr className="border-b border-[var(--ds-gray-400)]">
                  <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">Channel</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Subscribers</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Subscriber Delta</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Views</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Likes</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Comments</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Shares</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Watch Time</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">View Share</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Watch Time Share</th>
                  <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">Last Snapshot</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.providerUserId}
                    className="border-b border-[var(--ds-gray-400)] align-top last:border-b-0"
                  >
                    <td className="px-3 py-3">
                      <p className="text-copy-14 text-[var(--ds-gray-1000)]">{row.accountName || row.providerUserId}</p>
                      <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">{row.providerUserId}</p>
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.followers)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.subscriberDelta)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.videoViews)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.likes)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.comments)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.shares)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatWatchTimeMinutes(row.watchTimeMinutes)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatPercent(row.viewSharePercent)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatPercent(row.watchTimeSharePercent)}
                    </td>
                    <td className="px-3 py-3 text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatDateLabel(row.lastSnapshotDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      ) : null}
    </section>
  );
}

function TikTokCreatorActivitySection({
  activity,
  loading,
}: {
  activity: AnalyticsTikTokCreatorActivityResponse | null;
  loading: boolean;
}) {
  const rows = activity?.rows ?? [];
  const trend = activity?.trend ?? [];

  return (
    <section className={cn(surfaceClassName, "px-4 py-4")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-heading-16 text-[var(--ds-gray-1000)]">TikTok Creator Performance</p>
          <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
            Creator profile totals captured from TikTok daily snapshots, plus owned-video post metrics in the rankings and post table when SocialRaven has the TikTok video ID.
          </p>
        </div>
        <span className="rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-900)]">
          {loading ? "Loading creator activity..." : activity?.currentRangeLabel ?? "Current period"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricTile label="Tracked creators" value={loading ? "—" : String(activity?.trackedAccounts ?? 0)} />
        <MetricTile label="Followers" value={loading ? "—" : formatNumber(activity?.totalFollowers ?? 0)} />
        <MetricTile label="Public likes" value={loading ? "—" : formatNumber(activity?.totalLikesTotal ?? 0)} />
        <MetricTile label="Public videos" value={loading ? "—" : formatNumber(activity?.totalVideoCount ?? 0)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricTile label="Following" value={loading ? "—" : formatNumber(activity?.totalFollowing ?? 0)} />
        <MetricTile label="Follower delta" value={loading ? "—" : formatNumber(activity?.totalFollowerDelta ?? 0)} />
        <MetricTile label="Like delta" value={loading ? "—" : formatNumber(activity?.totalLikesDelta ?? 0)} />
        <MetricTile label="Video delta" value={loading ? "—" : formatNumber(activity?.totalVideoDelta ?? 0)} />
      </div>

      <div className="mt-4 rounded-lg border border-[var(--ds-yellow-300)] bg-[var(--ds-yellow-100)] px-4 py-3 text-copy-14 text-[var(--ds-yellow-800)]">
        TikTok’s approved integration exposes creator totals and owned-video views, likes, comments, and shares. It does not expose impressions, reach, clicks, saves, or watch time.
      </div>

      {trend.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-6 text-copy-14 text-[var(--ds-gray-900)]">
          {loading
            ? "Loading daily TikTok creator trend rows."
            : "No TikTok creator snapshots exist for this date range yet."}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-[var(--ds-gray-400)]">
          <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-3">
            <p className="text-label-14 text-[var(--ds-gray-1000)]">Daily Totals</p>
            <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">
              Aggregated creator totals by snapshot date for the selected workspace slice.
            </p>
          </div>
          <ScrollArea className="w-full">
            <table className="min-w-[44rem] border-collapse">
              <thead className="bg-[var(--ds-background-100)]">
                <tr className="border-b border-[var(--ds-gray-400)]">
                  <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">Date</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Followers</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Public Likes</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Public Videos</th>
                </tr>
              </thead>
              <tbody>
                {trend.map((point) => (
                  <tr
                    key={point.snapshotDate}
                    className="border-b border-[var(--ds-gray-400)] align-top last:border-b-0"
                  >
                    <td className="px-3 py-3 text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatDateLabel(point.snapshotDate)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(point.followers)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(point.likesTotal)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(point.videoCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      )}

      {rows.length > 0 ? (
        <div className="mt-4 rounded-lg border border-[var(--ds-gray-400)]">
          <ScrollArea className="w-full">
            <table className="min-w-[76rem] border-collapse">
              <thead className="bg-[var(--ds-gray-100)]">
                <tr className="border-b border-[var(--ds-gray-400)]">
                  <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">Creator</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Followers</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Following</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Public Likes</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Public Videos</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Follower Delta</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Like Delta</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Video Delta</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Follower Share</th>
                  <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">Like Share</th>
                  <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">Last Snapshot</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.providerUserId}
                    className="border-b border-[var(--ds-gray-400)] align-top last:border-b-0"
                  >
                    <td className="px-3 py-3">
                      <p className="text-copy-14 text-[var(--ds-gray-1000)]">{row.accountName || row.providerUserId}</p>
                      <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">{row.providerUserId}</p>
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.followers)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.following)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.likesTotal)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.videoCount)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.followerDelta)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.likesDelta)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatNumber(row.videoDelta)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatPercent(row.followerSharePercent)}
                    </td>
                    <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatPercent(row.likesSharePercent)}
                    </td>
                    <td className="px-3 py-3 text-copy-14 text-[var(--ds-gray-1000)]">
                      {formatDateLabel(row.lastSnapshotDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      ) : null}
    </section>
  );
}

function AvailabilityBlock({ items }: { items: AnalyticsMetricAvailabilityWindow[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-label-12 text-[var(--ds-gray-900)]">Metric availability</p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div
            key={`${item.label ?? "availability"}:${item.metrics.join(",")}`}
            className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-copy-14 text-[var(--ds-gray-1000)]">
                {item.label ?? formatAvailabilityMetrics(item.metrics)}
              </span>
              {item.status ? (
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2 py-0.5 text-label-12",
                    statusPillClass(item.status)
                  )}
                >
                  {item.status.toLowerCase().replace(/_/g, " ")}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">
              {formatAvailabilityMetrics(item.metrics)}
            </p>
            {item.note ? (
              <p className="mt-2 text-label-12 text-[var(--ds-gray-900)]">{item.note}</p>
            ) : null}
            {item.windowEndsAt || item.totalPostCount !== null ? (
              <div className="mt-2 flex flex-wrap gap-3 text-label-12 text-[var(--ds-gray-900)]">
                {item.windowEndsAt ? (
                  <span>Window ends {formatDateTime(item.windowEndsAt)}</span>
                ) : null}
                {item.totalPostCount !== null ? (
                  <span>
                    {item.eligiblePostCount ?? 0} of {item.totalPostCount} eligible
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-3">
      <p className="text-label-12 text-[var(--ds-gray-900)]">{label}</p>
      <p className="mt-1 text-heading-20 text-[var(--ds-gray-1000)]">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 py-3">
      <p className="text-label-12 text-[var(--ds-gray-900)]">{label}</p>
      <p className="mt-1 text-copy-14 text-[var(--ds-gray-1000)]">{value}</p>
    </div>
  );
}

function TagBlock({
  title,
  values,
  formatter = formatMetricLabel,
}: {
  title: string;
  values: string[];
  formatter?: (value: string) => string;
}) {
  return (
    <div>
      <p className="text-label-12 text-[var(--ds-gray-900)]">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.length === 0 ? (
          <span className="text-copy-14 text-[var(--ds-gray-900)]">None recorded yet.</span>
        ) : (
          values.map((value) => (
            <span
              key={value}
              className="inline-flex rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-1000)]"
            >
              {formatter(value)}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <section className={cn(surfaceClassName, "px-5 py-8 text-center")}>
      <p className="text-heading-16 text-[var(--ds-gray-1000)]">{title}</p>
      <p className="mx-auto mt-2 max-w-2xl text-copy-14 text-[var(--ds-gray-900)]">
        {body}
      </p>
      {actionHref && actionLabel ? (
        <Button
          asChild
          type="button"
          variant="outline"
          size="sm"
          className={cn("mt-4 h-9 rounded-md", subtleButtonClassName)}
        >
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </section>
  );
}

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const { canExportClientReports } = useRole();

  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [platform, setPlatform] = useState("ALL");
  const [providerUserId, setProviderUserId] = useState("ALL");
  const [campaignId, setCampaignId] = useState("ALL");
  const [contentType, setContentType] = useState("ALL");
  const [rankingMetric, setRankingMetric] = useState("engagements");
  const [trendMetric, setTrendMetric] = useState("engagements");
  const [trendGranularity, setTrendGranularity] = useState<"daily" | "weekly">("daily");
  const [breakdownDimension, setBreakdownDimension] = useState("platform");
  const [breakdownMetric, setBreakdownMetric] = useState("engagements");
  const [sortBy, setSortBy] = useState("publishedAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0);

  const [shell, setShell] = useState<AnalyticsShellResponse | null>(null);
  const [overview, setOverview] = useState<AnalyticsWorkspaceOverview | null>(null);
  const [trendExplorer, setTrendExplorer] = useState<AnalyticsTrendExplorerResponse | null>(null);
  const [breakdownEngine, setBreakdownEngine] = useState<AnalyticsBreakdownResponse | null>(null);
  const [rankings, setRankings] = useState<AnalyticsPostRankingsResponse | null>(null);
  const [postTable, setPostTable] = useState<AnalyticsPostTableResponse | null>(null);
  const [linkedInPageActivity, setLinkedInPageActivity] =
    useState<AnalyticsLinkedInPageActivityResponse | null>(null);
  const [tikTokCreatorActivity, setTikTokCreatorActivity] =
    useState<AnalyticsTikTokCreatorActivityResponse | null>(null);
  const [youTubeChannelActivity, setYouTubeChannelActivity] =
    useState<AnalyticsYouTubeChannelActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshResults, setRefreshResults] = useState<AnalyticsManualRefreshProviderResult[]>([]);
  const [reloadTick, setReloadTick] = useState(0);

  async function handleManualRefresh() {
    setRefreshing(true);
    setError(null);

    try {
      const response = await requestAnalyticsRefreshApi(getToken, {
        platform: platform === "ALL" ? null : platform,
        providerUserId: providerUserId === "ALL" ? null : providerUserId,
      });
      setRefreshResults(response.results);
      setReloadTick((current) => current + 1);
    } catch (refreshError: unknown) {
      setError(
        refreshError instanceof Error ? refreshError.message : "Failed to request analytics refresh."
      );
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadAnalytics() {
      setLoading(true);
      setError(null);

      try {
        const params = {
          dateRange,
          platform: platform === "ALL" ? null : platform,
          providerUserId: providerUserId === "ALL" ? null : providerUserId,
          campaignId: campaignId === "ALL" ? null : campaignId,
          contentType: contentType === "ALL" ? null : contentType,
        };

        const [
          shellResponse,
          overviewResponse,
          trendExplorerResponse,
          breakdownEngineResponse,
          rankingsResponse,
          tableResponse,
          linkedInPageActivityResponse,
          tikTokCreatorActivityResponse,
          youTubeChannelActivityResponse,
        ] =
          await Promise.all([
            fetchAnalyticsShellApi(getToken, params),
            fetchAnalyticsWorkspaceOverviewApi(getToken, params),
            fetchAnalyticsTrendExplorerApi(getToken, {
              ...params,
              metric: trendMetric,
            }),
            fetchAnalyticsBreakdownEngineApi(getToken, {
              ...params,
              dimension: breakdownDimension,
              metric: breakdownMetric,
            }),
            fetchAnalyticsPostRankingsApi(getToken, {
              ...params,
              metric: rankingMetric,
              limit: 5,
            }),
            fetchAnalyticsPostTableApi(getToken, {
              ...params,
              sortBy,
              sortDirection,
              page,
              size: 25,
            }),
            fetchAnalyticsLinkedInPageActivityApi(getToken, {
              dateRange,
              platform: platform === "ALL" ? null : platform,
              providerUserId: providerUserId === "ALL" ? null : providerUserId,
            }),
            fetchAnalyticsTikTokCreatorActivityApi(getToken, {
              dateRange,
              platform: platform === "ALL" ? null : platform,
              providerUserId: providerUserId === "ALL" ? null : providerUserId,
            }),
            fetchAnalyticsYouTubeChannelActivityApi(getToken, {
              dateRange,
              platform: platform === "ALL" ? null : platform,
              providerUserId: providerUserId === "ALL" ? null : providerUserId,
            }),
          ]);

        if (!isActive) return;

        setShell(shellResponse);
        setOverview(overviewResponse);
        setTrendExplorer(trendExplorerResponse);
        setBreakdownEngine(breakdownEngineResponse);
        setRankings(rankingsResponse);
        setPostTable(tableResponse);
        setLinkedInPageActivity(linkedInPageActivityResponse);
        setTikTokCreatorActivity(tikTokCreatorActivityResponse);
        setYouTubeChannelActivity(youTubeChannelActivityResponse);
      } catch (loadError: unknown) {
        if (!isActive) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load analytics.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadAnalytics();

    return () => {
      isActive = false;
    };
  }, [
    dateRange,
    platform,
    providerUserId,
    campaignId,
    contentType,
    rankingMetric,
    trendMetric,
    breakdownDimension,
    breakdownMetric,
    sortBy,
    sortDirection,
    page,
    getToken,
    reloadTick,
  ]);

  useEffect(() => {
    if (!shell) return;

    if (platform !== "ALL" && !shell.filters.platforms.some((option) => option.value === platform)) {
      setPlatform("ALL");
    }

    if (
      providerUserId !== "ALL" &&
      !shell.filters.accounts.some((option) => option.value === providerUserId)
    ) {
      setProviderUserId("ALL");
    }

    if (
      campaignId !== "ALL" &&
      !shell.filters.campaigns.some((option) => option.value === campaignId)
    ) {
      setCampaignId("ALL");
    }

    if (
      contentType !== "ALL" &&
      !shell.filters.contentTypes.some((option) => option.value === contentType)
    ) {
      setContentType("ALL");
    }
  }, [shell, platform, providerUserId, campaignId, contentType]);

  function resetPageAndRun(update: () => void) {
    startTransition(() => {
      update();
      setPage(0);
    });
  }

  const summary = shell?.summary;
  const filters = shell?.filters;
  const coverage = shell?.coverage ?? [];
  const noAccounts = summary ? summary.connectedAccountCount === 0 && coverage.length === 0 : false;
  const currentRows = postTable?.rows ?? [];
  const hasPosts = (postTable?.totalCount ?? 0) > 0;
  const showLinkedInPageActivity =
    (platform === "ALL" || platform === "linkedin") &&
    (loading ||
      (linkedInPageActivity?.trackedAccounts ?? 0) > 0 ||
      (linkedInPageActivity?.rows.length ?? 0) > 0);
  const showTikTokCreatorActivity =
    (platform === "ALL" || platform === "tiktok") &&
    (loading ||
      (tikTokCreatorActivity?.trackedAccounts ?? 0) > 0 ||
      (tikTokCreatorActivity?.rows.length ?? 0) > 0 ||
      (tikTokCreatorActivity?.trend.length ?? 0) > 0);
  const showYouTubeChannelActivity =
    (platform === "ALL" || platform === "youtube") &&
    (loading ||
      (youTubeChannelActivity?.trackedAccounts ?? 0) > 0 ||
      (youTubeChannelActivity?.rows.length ?? 0) > 0 ||
      (youTubeChannelActivity?.trend.length ?? 0) > 0);
  const visibleFrom = postTable && postTable.totalCount > 0 ? postTable.page * postTable.size + 1 : 0;
  const visibleTo =
    postTable && postTable.totalCount > 0 ? postTable.page * postTable.size + currentRows.length : 0;

  return (
    <div className={pageClassName}>
      <ProtectedPageHeader
        title="Analytics"
        description="Workspace-specific post performance, winners and losers, and collection health."
        icon={<BarChart2 className="h-4 w-4" />}
        actions={
          <>
            <div className={segmentedControlClassName}>
              {(["7d", "30d", "90d"] as DateRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() =>
                    resetPageAndRun(() => {
                      setDateRange(range);
                    })
                  }
                  className={cn(
                    segmentedButtonClassName,
                    dateRange === range
                      ? "border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]"
                      : "text-[var(--ds-gray-900)] hover:bg-[var(--ds-background-100)] hover:text-[var(--ds-gray-1000)]"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>

            {canExportClientReports ? (
              <Button
                asChild
                type="button"
                variant="outline"
                size="sm"
                className={cn("h-9 rounded-md", subtleButtonClassName)}
              >
                <Link href="/client-reports">
                  <FileText className="h-4 w-4" />
                  <span>Client Reports</span>
                </Link>
              </Button>
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleManualRefresh()}
              disabled={loading || refreshing}
              className={cn("h-9 rounded-md", subtleButtonClassName)}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              <span>Request Refresh</span>
            </Button>
          </>
        }
      />

      <main className="w-full space-y-5 px-4 py-5 sm:px-5">
        {error ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-[var(--ds-red-200)] bg-[var(--ds-red-100)] px-4 py-3 text-label-14 text-[var(--ds-red-700)]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setReloadTick((current) => current + 1)}
              className="text-label-12 underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : null}

        {refreshResults.length > 0 ? (
          <section className={cn(surfaceClassName, "px-4 py-4")}>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-heading-16 text-[var(--ds-gray-1000)]">Refresh queue</p>
              <span className="text-copy-14 text-[var(--ds-gray-900)]">
                Latest manual refresh request results for this workspace slice.
              </span>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {refreshResults.map((result) => (
                <div
                  key={`${result.provider}-${result.status}`}
                  className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-label-14 text-[var(--ds-gray-1000)]">
                      {labelForProvider(result.provider)}
                    </p>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-1 text-label-12",
                        statusPillClass(result.status)
                      )}
                    >
                      {result.status.toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">{result.reason}</p>
                  <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">
                    Scheduled jobs: {result.scheduledJobs}
                    {result.nextAllowedAt
                      ? ` · next window ${formatDateTime(result.nextAllowedAt)}`
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className={cn(surfaceClassName, "px-4 py-4")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-heading-16 text-[var(--ds-gray-1000)]">Workspace Slice</p>
              <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                Every number on this page is scoped to the active workspace and the selected slice.
              </p>
            </div>
            <div className="text-right">
              <p className="text-label-12 text-[var(--ds-gray-900)]">Last analytics write</p>
              <p className="mt-1 text-label-14 text-[var(--ds-gray-1000)]">
                {loading || !summary ? "Loading..." : formatDateTime(summary.lastAnalyticsAt)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <FilterField
              label="Platform"
              value={platform}
              onValueChange={(value) =>
                resetPageAndRun(() => {
                  setPlatform(value);
                  setProviderUserId("ALL");
                })
              }
              options={filters?.platforms ?? []}
              allLabel="All platforms"
            />
            <FilterField
              label="Account"
              value={providerUserId}
              onValueChange={(value) =>
                resetPageAndRun(() => {
                  setProviderUserId(value);
                })
              }
              options={filters?.accounts ?? []}
              allLabel="All accounts"
            />
            <FilterField
              label="Campaign"
              value={campaignId}
              onValueChange={(value) =>
                resetPageAndRun(() => {
                  setCampaignId(value);
                })
              }
              options={filters?.campaigns ?? []}
              allLabel="All campaigns"
            />
            <FilterField
              label="Content Type"
              value={contentType}
              onValueChange={(value) =>
                resetPageAndRun(() => {
                  setContentType(value);
                })
              }
              options={filters?.contentTypes ?? []}
              allLabel="All content types"
            />

            <div className="rounded-lg border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-3">
              <p className="text-label-12 text-[var(--ds-gray-900)]">Compare window</p>
              <p className="mt-1 text-heading-16 text-[var(--ds-gray-1000)]">
                {overview?.previousRangeLabel ?? "Previous period"}
              </p>
              <p className="mt-2 text-label-12 text-[var(--ds-gray-900)]">
                Changing the date range compares the current slice against the prior equivalent window.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <SummaryCard
            icon={Users}
            label="Connected Accounts"
            value={loading || !summary ? "—" : String(summary.connectedAccountCount)}
          />
          <SummaryCard
            icon={Layers3}
            label="Campaigns"
            value={loading || !summary ? "—" : String(summary.campaignCount)}
          />
          <SummaryCard
            icon={BarChart2}
            label="Published Posts"
            value={loading || !summary ? "—" : String(summary.publishedPostCount)}
          />
          <SummaryCard
            icon={Database}
            label="Tracked Posts"
            value={loading || !summary ? "—" : String(summary.trackedPostCount)}
          />
          <SummaryCard
            icon={Clock}
            label="Milestones"
            value={loading || !summary ? "—" : String(summary.milestoneSnapshotCount)}
          />
          <SummaryCard
            icon={RefreshCw}
            label="Pending Jobs"
            value={loading || !summary ? "—" : String(summary.pendingJobCount)}
          />
        </div>

        {noAccounts ? (
          <EmptyState
            title="No connected accounts in this workspace"
            body="Connect at least one account before analytics collection can start. This page only surfaces real workspace data."
            actionHref="/connect-accounts"
            actionLabel="Connect Accounts"
          />
        ) : null}

        {!loading && summary && !summary.hasLiveData ? (
          <div className="rounded-xl border border-[var(--ds-yellow-300)] bg-[var(--ds-yellow-100)] px-4 py-3 text-label-14 text-[var(--ds-yellow-900)]">
            No live analytics rows exist for the current slice yet. Overview deltas will stay at zero until provider collection writes real post metrics.
          </div>
        ) : null}

        <section className={cn(surfaceClassName, "px-4 py-4")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-heading-16 text-[var(--ds-gray-1000)]">Overview</p>
              <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                Current workspace performance versus the previous comparable period.
              </p>
            </div>
            <span className="rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-900)]">
              {loading ? "Loading real metrics..." : overview?.currentRangeLabel ?? "Current period"}
            </span>
          </div>

          {overview?.metrics?.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {overview.metrics.map((metric) => (
                <OverviewMetricCard
                  key={metric.key}
                  metric={metric}
                  currentRangeLabel={overview.currentRangeLabel}
                  previousRangeLabel={overview.previousRangeLabel}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-6 text-copy-14 text-[var(--ds-gray-900)]">
              Loading real workspace metrics.
            </div>
          )}
        </section>

        <TrendExplorerSection
          trend={trendExplorer}
          loading={loading}
          metric={trendMetric}
          granularity={trendGranularity}
          onMetricChange={(value) => {
            startTransition(() => {
              setTrendMetric(value);
            });
          }}
          onGranularityChange={(value) => {
            startTransition(() => {
              setTrendGranularity(value);
            });
          }}
        />

        <BreakdownEngineSection
          breakdown={breakdownEngine}
          loading={loading}
          dimension={breakdownDimension}
          metric={breakdownMetric}
          onDimensionChange={(value) => {
            startTransition(() => {
              setBreakdownDimension(value);
            });
          }}
          onMetricChange={(value) => {
            startTransition(() => {
              setBreakdownMetric(value);
            });
          }}
        />

        {showLinkedInPageActivity ? (
          <LinkedInPageActivitySection activity={linkedInPageActivity} loading={loading} />
        ) : null}

        {showTikTokCreatorActivity ? (
          <TikTokCreatorActivitySection activity={tikTokCreatorActivity} loading={loading} />
        ) : null}

        {showYouTubeChannelActivity ? (
          <YouTubeChannelActivitySection activity={youTubeChannelActivity} loading={loading} />
        ) : null}

        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-heading-16 text-[var(--ds-gray-1000)]">Winners And Losers</p>
              <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                Real post rankings for this workspace slice, based on the metric you choose.
              </p>
            </div>
            <div className="w-full max-w-xs">
              <ControlField
                label="Ranking metric"
                value={rankingMetric}
                onValueChange={(value) => {
                  startTransition(() => {
                    setRankingMetric(value);
                  });
                }}
                options={rankingMetricOptions}
              />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <RankingColumn
              title="Top Performers"
              rows={rankings?.topPosts ?? []}
              metric={rankings?.metric ?? rankingMetric}
              emptyBody="No posts in this slice have the selected metric yet."
            />
            <RankingColumn
              title="Needs Attention"
              rows={rankings?.worstPosts ?? []}
              metric={rankings?.metric ?? rankingMetric}
              emptyBody="There are no low-performing rows to rank for the selected metric yet."
            />
          </div>
        </section>

        <section className={cn(surfaceClassName, "px-4 py-4")}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-heading-16 text-[var(--ds-gray-1000)]">Post Table</p>
              <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                Full per-post metrics with real sorting and pagination. No placeholder rows are shown.
              </p>
              <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">
                Provider-specific metrics such as Instagram saves, Facebook clicks, or YouTube watch time vary by platform and can be provider-limited.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:max-w-2xl sm:grid-cols-2 lg:grid-cols-3">
              <ControlField
                label="Sort by"
                value={sortBy}
                onValueChange={(value) =>
                  resetPageAndRun(() => {
                    setSortBy(value);
                  })
                }
                options={tableSortOptions}
              />
              <ControlField
                label="Direction"
                value={sortDirection}
                onValueChange={(value) =>
                  resetPageAndRun(() => {
                    setSortDirection(value);
                  })
                }
                options={sortDirectionOptions}
              />
              <div className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-3">
                <p className="text-label-12 text-[var(--ds-gray-900)]">Visible rows</p>
                <p className="mt-1 text-heading-16 text-[var(--ds-gray-1000)]">
                  {loading ? "Loading..." : `${visibleFrom}-${visibleTo} of ${postTable?.totalCount ?? 0}`}
                </p>
                <p className="mt-2 text-label-12 text-[var(--ds-gray-900)]">25 posts per page</p>
              </div>
            </div>
          </div>

          {!hasPosts && !loading ? (
            <div className="mt-4">
              <EmptyState
                title="No posts match the selected slice"
                body="Adjust the workspace filters or request a refresh after published posts have been collected."
              />
            </div>
          ) : (
            <>
              <div className="mt-4 rounded-lg border border-[var(--ds-gray-400)]">
                <ScrollArea className="w-full">
                  <table className="min-w-[96rem] border-collapse">
                    <thead className="bg-[var(--ds-gray-100)]">
                      <tr className="border-b border-[var(--ds-gray-400)]">
                        <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">
                          Post
                        </th>
                        <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">
                          Account
                        </th>
                        <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">
                          Campaign
                        </th>
                        <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">
                          Published
                        </th>
                        <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                          Impressions
                        </th>
                        <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                          Reach
                        </th>
                        <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                          Likes
                        </th>
                        <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                          Comments
                        </th>
                        <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                          Shares
                        </th>
                        <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                          Saves
                        </th>
                        <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                          Clicks
                        </th>
                        <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                          Video Views
                        </th>
                        <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                          Watch Time
                        </th>
                        <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                          Engagements
                        </th>
                        <th className="px-3 py-3 text-right text-label-12 text-[var(--ds-gray-900)]">
                          Engagement Rate
                        </th>
                        <th className="px-3 py-3 text-left text-label-12 text-[var(--ds-gray-900)]">
                          Freshness
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentRows.map((row) => (
                        <tr
                          key={row.postId}
                          className="border-b border-[var(--ds-gray-400)] align-top last:border-b-0"
                        >
                          <td className="px-3 py-3">
                            <div className="min-w-[15rem]">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-900)]">
                                  {labelForProvider(row.provider)}
                                </span>
                                <span className="rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-900)]">
                                  {labelForPostType(row.postType)}
                                </span>
                              </div>
                              <p className="mt-2 line-clamp-2 text-copy-14 text-[var(--ds-gray-1000)]">
                                {previewText(row)}
                              </p>
                              <p className="mt-2 text-label-12 text-[var(--ds-gray-900)]">
                                {row.providerPostId || `Post #${row.postId}`}
                              </p>
                              {row.metricAvailability.length > 0 ? (
                                <div className="mt-2 space-y-1">
                                  {row.metricAvailability.map((item) => (
                                    <div
                                      key={`${row.postId}:${item.label ?? item.metrics.join(",")}`}
                                      className="flex flex-wrap items-center gap-2 text-label-12"
                                    >
                                      <span
                                        className={cn(
                                          "inline-flex rounded-full border px-2 py-0.5",
                                          statusPillClass(item.status ?? "DEFAULT")
                                        )}
                                      >
                                        {item.label ?? formatAvailabilityMetrics(item.metrics)}
                                      </span>
                                      {item.windowEndsAt ? (
                                        <span className="text-[var(--ds-gray-900)]">
                                          until {formatDateTime(item.windowEndsAt)}
                                        </span>
                                      ) : item.note ? (
                                        <span className="text-[var(--ds-gray-900)]">{item.note}</span>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-copy-14 text-[var(--ds-gray-1000)]">
                            <div className="min-w-[12rem]">
                              <p>{row.accountName || row.providerUserId}</p>
                              <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">
                                {row.providerUserId}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-copy-14 text-[var(--ds-gray-1000)]">
                            <div className="min-w-[12rem]">
                              <p>{row.campaignLabel || "—"}</p>
                              <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">
                                {row.campaignId ? `Collection #${row.campaignId}` : "No collection"}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-copy-14 text-[var(--ds-gray-1000)]">
                            <div className="min-w-[10rem]">
                              <p>{formatDateTime(row.publishedAt)}</p>
                              <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">
                                Last write {formatDateTime(row.lastCollectedAt)}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                            {formatNumber(row.impressions)}
                          </td>
                          <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                            {formatNumber(row.reach)}
                          </td>
                          <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                            {formatNumber(row.likes)}
                          </td>
                          <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                            {formatNumber(row.comments)}
                          </td>
                          <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                            {formatNumber(row.shares)}
                          </td>
                          <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                            {formatNumber(row.saves)}
                          </td>
                          <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                            {formatNumber(row.clicks)}
                          </td>
                          <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                            {formatNumber(row.videoViews)}
                          </td>
                          <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                            {formatWatchTimeMinutes(row.watchTimeMinutes)}
                          </td>
                          <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                            {formatNumber(row.engagements)}
                          </td>
                          <td className="px-3 py-3 text-right text-copy-14 text-[var(--ds-gray-1000)]">
                            {formatPercent(row.engagementRate)}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-2.5 py-1 text-label-12",
                                statusPillClass(row.freshnessStatus)
                              )}
                            >
                              {row.freshnessStatus.toLowerCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-copy-14 text-[var(--ds-gray-900)]">
                  {loading
                    ? "Loading real post rows..."
                    : `Showing ${visibleFrom}-${visibleTo} of ${postTable?.totalCount ?? 0} posts`}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading || page === 0}
                    onClick={() =>
                      startTransition(() => {
                        setPage((current) => Math.max(current - 1, 0));
                      })
                    }
                    className={cn("h-9 rounded-md", subtleButtonClassName)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading || !postTable?.hasNext}
                    onClick={() =>
                      startTransition(() => {
                        setPage((current) => current + 1);
                      })
                    }
                    className={cn("h-9 rounded-md", subtleButtonClassName)}
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>

        {coverage.length === 0 ? (
          <EmptyState
            title="No provider coverage rows yet"
            body="Coverage entries are created per connected provider. Once accounts are connected, this section shows freshness, supported metrics, and collection modes."
          />
        ) : (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-blue-600)]">
                <Database className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">Provider Coverage</h2>
            </div>

            <div className="space-y-4">
              {coverage.map((row) => (
                <CoverageCard key={row.provider} coverage={row} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

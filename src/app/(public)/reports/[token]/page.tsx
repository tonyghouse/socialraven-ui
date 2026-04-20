"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  BarChart3,
  Copy,
  Download,
  Eye,
  Layers3,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  PublicCard,
  PublicHero,
  PublicInsetCard,
  PublicPageShell,
  PublicSection,
  PublicTable,
} from "@/components/public/public-layout";
import {
  PublicLozenge,
  PublicPrimaryButton,
  PublicSectionMessage,
  PublicSubtleButton,
} from "@/components/public/public-site-primitives";
import type {
  ClientReportCampaignInsight,
  ClientReportContribution,
  ClientReportForecastItem,
  ClientReportTopPost,
  PublicClientReport,
} from "@/model/ClientReport";
import { getPublicClientReportApi, publicClientReportPdfUrl } from "@/service/clientReports";

type TrendDatum = {
  date: string;
  totalEngagements: number;
  postsPublished: number;
  averagePerPost: number | null;
};

function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined) return "Not available";
  return `${n.toFixed(1)}%`;
}

function fmtDate(value: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

function fmtShortDate(value: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function fmtCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function buildTrendSeries(trend: PublicClientReport["trend"]): TrendDatum[] {
  return trend
    .map((point) => ({
      date: point.bucketStartDate,
      totalEngagements: point.engagements,
      postsPublished: point.postsPublished,
      averagePerPost: point.averageEngagementsPerPost,
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

function TrendChart({ series }: { series: TrendDatum[] }) {
  const width = 560;
  const height = 240;
  const paddingX = 18;
  const paddingTop = 18;
  const paddingBottom = 28;
  const baselineY = height - paddingBottom;
  const maxValue = Math.max(...series.map((point) => point.totalEngagements), 1);
  const points = series.map((point, index) => {
    const x =
      series.length === 1
        ? width / 2
        : paddingX + (index / (series.length - 1)) * (width - paddingX * 2);
    const y =
      baselineY -
      (point.totalEngagements / maxValue) * (baselineY - paddingTop);
    return {
      ...point,
      x,
      y,
    };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = points.length
    ? [
        `M ${points[0].x} ${baselineY}`,
        ...points.map((point) => `L ${point.x} ${point.y}`),
        `L ${points[points.length - 1].x} ${baselineY}`,
        "Z",
      ].join(" ")
    : "";

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[linear-gradient(180deg,var(--ds-gray-100)_0%,var(--ds-background-100)_100%)] p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-60 w-full"
          role="img"
          aria-label="Daily engagement trend across the selected report window"
        >
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = baselineY - ratio * (baselineY - paddingTop);
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="var(--ds-gray-400)"
                strokeDasharray="4 6"
                strokeWidth="1"
              />
            );
          })}
          <path d={areaPath} fill="var(--ds-blue-100)" />
          <path
            d={linePath}
            fill="none"
            stroke="var(--ds-blue-600)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          {points.map((point) => (
            <circle
              key={point.date}
              cx={point.x}
              cy={point.y}
              r="4.5"
              fill="var(--ds-background-100)"
              stroke="var(--ds-blue-600)"
              strokeWidth="3"
            />
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-label-12 text-[var(--ds-gray-900)]">
        <span>{fmtCalendarDate(series[0]?.date ?? "")}</span>
        <span>Daily engagements across the selected report scope</span>
        <span>{fmtCalendarDate(series[series.length - 1]?.date ?? "")}</span>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <PublicInsetCard className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-blue-600)]">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-heading-32 text-[var(--ds-gray-1000)]">{value}</p>
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-label-14 text-[var(--ds-gray-1000)]">{label}</p>
        <p className="text-copy-14 text-[var(--ds-gray-900)]">{detail}</p>
      </div>
    </PublicInsetCard>
  );
}

function ForecastCard({
  item,
}: {
  item: ClientReportForecastItem | null;
}) {
  const range = item?.range;
  const headline = !item || !item.available
    ? "Not enough data"
    : range && range.expectedValue !== null && range.expectedValue !== undefined
      ? fmt(range.expectedValue)
      : item.slotLabel || "Available";

  const detail = !item
    ? "No forecast available."
    : !item.available
      ? item.unavailableReason || "No forecast available."
      : [item.slotLabel, range && range.lowValue !== null && range.highValue !== null
          ? `Range ${fmt(range.lowValue)} to ${fmt(range.highValue)}`
          : null, item.basisSummary]
          .filter(Boolean)
          .join(" · ");

  return (
    <PublicInsetCard className="p-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-label-14 text-[var(--ds-gray-1000)]">{item?.label || "Forecast"}</p>
          <PublicLozenge appearance={item?.available ? "success" : "default"}>
            {item?.confidenceTier || (item?.available ? "Available" : "Limited")}
          </PublicLozenge>
        </div>
        <p className="text-heading-28 text-[var(--ds-gray-1000)]">{headline}</p>
        <p className="text-copy-14 text-[var(--ds-gray-900)]">{detail}</p>
      </div>
    </PublicInsetCard>
  );
}

function TopPostCard({ post }: { post: ClientReportTopPost }) {
  return (
    <PublicCard className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <PublicLozenge appearance="default">{post.platformLabel}</PublicLozenge>
            {post.campaignLabel ? (
              <PublicLozenge appearance="new">{post.campaignLabel}</PublicLozenge>
            ) : null}
          </div>
          <p className="text-copy-13 text-[var(--ds-gray-900)]">
            {post.accountName || "Connected account"} · {fmtShortDate(post.publishedAt)}
          </p>
        </div>
        <PublicLozenge appearance="success">{fmt(post.engagements)} engagements</PublicLozenge>
      </div>
      <p className="mt-4 text-copy-14 leading-7 text-[var(--ds-gray-1000)]">
        {post.content || "No post caption was captured for this item."}
      </p>
      <div className="mt-5 grid gap-3 text-copy-13 text-[var(--ds-gray-900)] sm:grid-cols-2">
        <p>Impressions {fmt(post.impressions)}</p>
        <p>Engagement rate {fmtPct(post.engagementRate)}</p>
        <p>Likes {fmt(post.likes)}</p>
        <p>Comments {fmt(post.comments)}</p>
        <p>Shares {fmt(post.shares)}</p>
        <p>Clicks {fmt(post.clicks)}</p>
      </div>
    </PublicCard>
  );
}

function ContributionTable({
  title,
  contribution,
}: {
  title: string;
  contribution: ClientReportContribution | null;
}) {
  if (!contribution || contribution.rows.length === 0) {
    return null;
  }

  return (
    <PublicCard className="p-6">
      <div className="mb-4 space-y-1">
        <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
          {title}
        </p>
        <p className="text-copy-14 text-[var(--ds-gray-900)]">
          Contribution breakdown inside this campaign report.
        </p>
      </div>
      <PublicTable
        headers={["Segment", "Posts", "Performance", "Avg / Post"]}
        rows={contribution.rows.map((row) => [
          <span key={`${row.key}-label`} className="text-[var(--ds-gray-1000)]">
            {row.label}
          </span>,
          <span key={`${row.key}-posts`}>{fmt(row.postsPublished)}</span>,
          <span key={`${row.key}-performance`}>{fmt(row.performanceValue)}</span>,
          <span key={`${row.key}-average`}>{fmt(row.averagePerformancePerPost)}</span>,
        ])}
      />
    </PublicCard>
  );
}

function CampaignInsightPanel({
  campaignInsight,
}: {
  campaignInsight: ClientReportCampaignInsight | null;
}) {
  if (!campaignInsight) {
    return null;
  }

  if (campaignInsight.postsPublished === 0) {
    return (
      <PublicSection surface="surface" eyebrow="Campaign Insight" title="Campaign benchmark">
        <PublicSectionMessage appearance="information" title="Campaign benchmark is still building">
          <p className="text-copy-14">
            This campaign does not yet have enough tracked post data in the selected window to
            render a benchmark view.
          </p>
        </PublicSectionMessage>
      </PublicSection>
    );
  }

  return (
    <PublicSection
      eyebrow="Campaign Insight"
      title="Campaign benchmark"
      description="Campaign-scoped reports include percentile rank and contribution analysis against comparable campaigns in the same workspace slice."
      surface="surface"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Target}
          label="Percentile Rank"
          value={fmtPct(campaignInsight.percentile)}
          detail={`Rank ${campaignInsight.rank ?? "Not available"} of ${campaignInsight.comparableCount} comparable campaigns.`}
        />
        <KpiCard
          icon={TrendingUp}
          label="Lift vs Benchmark"
          value={fmtPct(campaignInsight.liftPercent)}
          detail={`Benchmark average ${fmt(campaignInsight.benchmarkAverage)} engagements per post.`}
        />
        <KpiCard
          icon={Layers3}
          label="Campaign Posts"
          value={fmt(campaignInsight.postsPublished)}
          detail="Posts included in this campaign snapshot."
        />
        <KpiCard
          icon={BarChart3}
          label="Campaign Engagements"
          value={fmt(campaignInsight.engagements)}
          detail={`Average ${fmt(campaignInsight.averageEngagementsPerPost)} engagements per post.`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ContributionTable
          title="Platform Contribution"
          contribution={campaignInsight.platformBreakdown}
        />
        <ContributionTable
          title="Account Contribution"
          contribution={campaignInsight.accountBreakdown}
        />
      </div>
    </PublicSection>
  );
}

export default function PublicClientReportPage() {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<PublicClientReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const next = await getPublicClientReportApi(token);
        if (!ignore) {
          setReport(next);
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.message ?? "Failed to load the client report.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [token]);

  const timelineSeries = useMemo(
    () => buildTrendSeries(report?.trend ?? []),
    [report]
  );

  const peakTrendPoint = useMemo(() => {
    if (timelineSeries.length === 0) return null;
    return timelineSeries.reduce((currentPeak, candidate) =>
      candidate.totalEngagements > currentPeak.totalEngagements
        ? candidate
        : currentPeak
    );
  }, [timelineSeries]);

  const topPlatform = report?.platformPerformance[0] ?? null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      throw new Error("Copy failed");
    }
  }

  function downloadPdf() {
    window.open(publicClientReportPdfUrl(token), "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ds-background-100)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--ds-gray-900)]" />
      </div>
    );
  }

  if (error && !report) {
    return (
      <PublicPageShell>
        <div className="mx-auto max-w-xl px-6 py-24">
          <PublicCard className="p-8">
            <div className="mb-4 flex justify-center">
              <AlertCircle className="h-12 w-12 text-[var(--ds-red-600)]" />
            </div>
            <h1 className="text-center text-heading-24 text-[var(--ds-gray-1000)]">
              Report unavailable
            </h1>
            <p className="mt-3 text-center text-copy-14 text-[var(--ds-gray-900)]">
              {error}
            </p>
          </PublicCard>
        </div>
      </PublicPageShell>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <PublicPageShell hideChromeOnPrint mainClassName="print:bg-white print:pt-0">
      <PublicHero
        eyebrow="Branded Client Report"
        title={report.reportTitle}
        description={report.commentary}
        topSlot={
          <div className="flex flex-wrap items-center gap-3">
            {report.logoUrl ? (
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={report.logoUrl} alt={report.agencyLabel} className="h-full w-full object-contain" />
              </div>
            ) : null}
            <div className="space-y-1">
              <p className="text-label-14 text-[var(--ds-gray-1000)]">{report.clientLabel}</p>
              <p className="text-copy-13 text-[var(--ds-gray-900)]">
                Prepared by {report.agencyLabel}
              </p>
            </div>
          </div>
        }
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <PublicLozenge appearance="new" isBold>
              {report.reportWindowLabel}
            </PublicLozenge>
            <PublicLozenge appearance="default">
              {report.templateType.replaceAll("_", " ")}
            </PublicLozenge>
            <PublicLozenge appearance="success">{report.reportScopeLabel}</PublicLozenge>
            {report.campaignLabel ? (
              <PublicLozenge appearance="new">{report.campaignLabel}</PublicLozenge>
            ) : null}
          </div>
        }
        actions={
          <>
            <div className="print:hidden">
              <PublicPrimaryButton onClick={downloadPdf}>
                <span className="inline-flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </span>
              </PublicPrimaryButton>
            </div>
            <div className="print:hidden">
              <PublicSubtleButton
                onClick={async () => {
                  try {
                    await copyLink();
                  } catch {
                    setError("Failed to copy the report link.");
                  }
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  <span>Copy Link</span>
                </span>
              </PublicSubtleButton>
            </div>
          </>
        }
        aside={
          <PublicCard className="p-5">
            <div className="space-y-4">
              <div>
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Report coverage
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-1000)]">
                  {report.reportWindowLabel} for {report.clientLabel} in {report.reportScopeLabel.toLowerCase()} mode.
                </p>
              </div>

              {report.linkExpiresAt ? (
                <div>
                  <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                    Share window
                  </p>
                  <p className="mt-2 text-copy-14 text-[var(--ds-gray-1000)]">
                    This report link stays active until {fmtDate(report.linkExpiresAt)}.
                  </p>
                </div>
              ) : null}

              <div>
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Generated
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-1000)]">
                  {fmtDate(report.generatedAt)}
                </p>
              </div>
            </div>
          </PublicCard>
        }
      />

      {error && (
        <div className="print:hidden">
          <PublicSection surface="surface">
            <PublicSectionMessage appearance="warning" title="Copy action failed">
              <p className="text-copy-13">{error}</p>
            </PublicSectionMessage>
          </PublicSection>
        </div>
      )}

      <PublicSection
        eyebrow="Performance Snapshot"
        title="Headline metrics"
        description="This section gives a fast executive view of the reporting window."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={Eye}
            label="Impressions"
            value={fmt(report.summary.impressions)}
            detail={`${fmt(report.summary.engagements)} engagements captured in this report scope.`}
          />
          <KpiCard
            icon={TrendingUp}
            label="Engagement Rate"
            value={fmtPct(report.summary.engagementRate)}
            detail={`${fmt(report.summary.clicks)} clicks generated across published content.`}
          />
          <KpiCard
            icon={Layers3}
            label="Posts Published"
            value={fmt(report.summary.postsPublished)}
            detail={`${fmt(report.platformPerformance.length)} platform segments contributed to this report.`}
          />
          <KpiCard
            icon={BarChart3}
            label="Top Platform"
            value={topPlatform?.platformLabel || "No data"}
            detail={
              topPlatform
                ? `${fmt(topPlatform.engagements)} engagements and ${fmtPct(topPlatform.engagementSharePercent)} of total engagement.`
                : "No platform performance data is available yet."
            }
          />
        </div>
      </PublicSection>

      <PublicSection
        eyebrow="Client Takeaways"
        title="What stands out"
        description="Key observations prepared for quick review in client meetings or email handoffs."
        surface="surface"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.95fr)]">
          <PublicCard className="p-6">
            <div className="space-y-4">
              {report.highlights.map((highlight, index) => (
                <div
                  key={`${highlight}-${index}`}
                  className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ds-blue-100)] text-[var(--ds-blue-600)]">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <p className="text-copy-14 text-[var(--ds-gray-1000)]">{highlight}</p>
                  </div>
                </div>
              ))}
            </div>
          </PublicCard>

          <PublicCard className="p-6">
            <div className="space-y-5">
              <div>
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Top channel
                </p>
                <p className="mt-2 text-heading-20 text-[var(--ds-gray-1000)]">
                  {topPlatform?.platformLabel ?? "No data yet"}
                </p>
                <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                  {topPlatform
                    ? `Led with ${fmt(topPlatform.engagements)} engagements across ${fmt(topPlatform.postsPublished)} posts.`
                    : "Publish a few posts and let analytics snapshots collect before sharing this report externally."}
                </p>
              </div>

              <div>
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Top content
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-1000)]">
                  {report.topPosts[0]?.content || "No top-post content captured yet."}
                </p>
              </div>
            </div>
          </PublicCard>
        </div>
      </PublicSection>

      <PublicSection
        eyebrow="Engagement Trend"
        title="Daily momentum"
        description="This view shows how engagement moved across the reporting window so agencies can explain spikes, dips, and campaign timing."
        surface="surface"
      >
        {timelineSeries.length === 0 ? (
          <PublicSectionMessage appearance="information" title="No trend data yet">
            <p className="text-copy-14">
              SocialRaven has not collected enough report-scope engagement data to render a daily trend for this window yet.
            </p>
          </PublicSectionMessage>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18.75rem,0.85fr)]">
            <PublicCard className="p-6">
              <TrendChart series={timelineSeries} />
            </PublicCard>

            <div className="space-y-4">
              <PublicInsetCard className="p-5">
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Peak day
                </p>
                <p className="mt-2 text-heading-24 text-[var(--ds-gray-1000)]">
                  {peakTrendPoint ? fmt(peakTrendPoint.totalEngagements) : "0"}
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
                  {peakTrendPoint
                    ? `${fmtCalendarDate(peakTrendPoint.date)} delivered the highest daily engagement in this report.`
                    : "No daily engagement peak is available yet."}
                </p>
              </PublicInsetCard>

              <PublicInsetCard className="p-5">
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Average per post
                </p>
                <p className="mt-2 text-heading-24 text-[var(--ds-gray-1000)]">
                  {fmt(timelineSeries[timelineSeries.length - 1]?.averagePerPost ?? 0)}
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
                  Average engagements per tracked post on the latest day inside this report window.
                </p>
              </PublicInsetCard>
            </div>
          </div>
        )}
      </PublicSection>

      <PublicSection
        eyebrow="Forecast Outlook"
        title="What the next publishing window looks like"
        description="These projections come from the same workspace analytics model used in the internal product."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <ForecastCard item={report.forecast?.nextPostPrediction || null} />
          <ForecastCard item={report.forecast?.nextBestSlot || null} />
          <ForecastCard item={report.forecast?.planningWindowProjection || null} />
        </div>
      </PublicSection>

      <PublicSection
        eyebrow="Channel Breakdown"
        title="Platform performance"
        description="Channel-level performance helps agencies explain where momentum is building and where creative needs adjustment."
      >
        {report.platformPerformance.length === 0 ? (
          <PublicSectionMessage appearance="information" title="No platform analytics yet">
            <p className="text-copy-14">
              Publish a few posts and let snapshots collect before sharing this report externally.
            </p>
          </PublicSectionMessage>
        ) : (
          <PublicTable
            headers={["Platform", "Impressions", "Engagements", "Avg / Post", "Share"]}
            rows={report.platformPerformance.map((platform) => [
              <div key={`${platform.provider}-platform`} className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[var(--ds-gray-900)]" />
                <span className="font-medium text-[var(--ds-gray-1000)]">{platform.platformLabel}</span>
              </div>,
              <span key={`${platform.provider}-impressions`}>{fmt(platform.impressions)}</span>,
              <span key={`${platform.provider}-engagement`}>{fmt(platform.engagements)}</span>,
              <span key={`${platform.provider}-average`}>{fmt(platform.averageEngagementsPerPost)}</span>,
              <span key={`${platform.provider}-share`}>{fmtPct(platform.engagementSharePercent)}</span>,
            ])}
          />
        )}
      </PublicSection>

      {report.reportScope === "CAMPAIGN" ? (
        <CampaignInsightPanel campaignInsight={report.campaignInsight} />
      ) : null}

      <PublicSection
        eyebrow="Top Content"
        title="Best-performing posts"
        description="Use these examples to explain what resonated, which format worked, and where to scale the next creative cycle."
        surface="surface"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {report.topPosts.length === 0 ? (
            <PublicCard className="p-6">
              <p className="text-copy-14 text-[var(--ds-gray-900)]">
                No published post snapshots were available for this report window.
              </p>
            </PublicCard>
          ) : (
            report.topPosts.map((post) => <TopPostCard key={post.postId} post={post} />)
          )}
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

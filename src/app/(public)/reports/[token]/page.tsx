"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  BarChart3,
  Copy,
  Download,
  Eye,
  Globe2,
  Heart,
  LineChart,
  Loader2,
  MessageCircle,
  Share2,
  TrendingUp,
  Users,
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
import type { PublicClientReport } from "@/model/ClientReport";
import { getPublicClientReportApi, publicClientReportPdfUrl } from "@/service/clientReports";

type TimelineDatum = {
  date: string;
  totalEngagements: number;
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function fmtPct(n: number): string {
  return `${n.toFixed(2)}%`;
}

function fmtDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

function fmtShortDate(value: string) {
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

function aggregateTimeline(timeline: PublicClientReport["timeline"]): TimelineDatum[] {
  const byDate = new Map<string, number>();
  for (const point of timeline) {
    byDate.set(point.date, (byDate.get(point.date) ?? 0) + point.totalEngagements);
  }
  return Array.from(byDate.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, totalEngagements]) => ({ date, totalEngagements }));
}

function TrendChart({ series }: { series: TimelineDatum[] }) {
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
        <span>Daily engagements across all connected platforms</span>
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
        <p className="text-heading-32 text-[var(--ds-gray-1000)]">
          {value}
        </p>
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-label-14 text-[var(--ds-gray-1000)]">{label}</p>
        <p className="text-copy-14 text-[var(--ds-gray-900)]">{detail}</p>
      </div>
    </PublicInsetCard>
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

  const totalEngagements = useMemo(() => {
    if (!report) return 0;
    return (
      report.overview.totalLikes +
      report.overview.totalComments +
      report.overview.totalShares
    );
  }, [report]);

  const timelineSeries = useMemo(
    () => aggregateTimeline(report?.timeline ?? []),
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

  const averageDailyEngagements = useMemo(() => {
    if (timelineSeries.length === 0) return 0;
    return Math.round(
      timelineSeries.reduce((sum, point) => sum + point.totalEngagements, 0) /
        timelineSeries.length
    );
  }, [timelineSeries]);

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
            <PublicLozenge appearance="success">
              Generated {fmtShortDate(report.generatedAt)}
            </PublicLozenge>
          </div>
        }
        actions={
          <>
            <div className="print:hidden">
              <PublicPrimaryButton
                onClick={downloadPdf}
              >
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
                  {report.reportWindowLabel} for {report.clientLabel}.
                </p>
              </div>

              <div>
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Share window
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-1000)]">
                  This report link stays active until {fmtDate(report.linkExpiresAt)}.
                </p>
              </div>

              <div>
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Timezone
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-1000)]">
                  Date and time values render in your local browser timezone.
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
            value={fmt(report.overview.totalImpressions)}
            detail={`${fmt(report.overview.totalReach)} reach captured across published content.`}
          />
          <KpiCard
            icon={Heart}
            label="Engagements"
            value={fmt(totalEngagements)}
            detail={`${fmtPct(report.overview.avgEngagementRate)} average engagement rate.`}
          />
          <KpiCard
            icon={Users}
            label="Follower Growth"
            value={fmt(report.overview.followerGrowth)}
            detail="Net audience movement across connected accounts."
          />
          <KpiCard
            icon={Globe2}
            label="Posts Published"
            value={fmt(report.overview.totalPosts)}
            detail="Published output included in this reporting window."
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
                  {report.platformStats[0]?.provider ?? "No data yet"}
                </p>
                <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                  Highest current impression volume in the selected report window.
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
          <PublicSectionMessage appearance="information" title="No timeline data yet">
            <p className="text-copy-14">
              SocialRaven has not collected enough engagement snapshots to render a daily trend for
              this report window yet.
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
                    ? `${fmtCalendarDate(peakTrendPoint.date)} delivered the highest daily engagement across the selected report window.`
                    : "No daily engagement peak is available yet."}
                </p>
              </PublicInsetCard>

              <PublicInsetCard className="p-5">
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Daily average
                </p>
                <p className="mt-2 text-heading-24 text-[var(--ds-gray-1000)]">
                  {fmt(averageDailyEngagements)}
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
                  Average daily engagements across {timelineSeries.length} tracked day
                  {timelineSeries.length === 1 ? "" : "s"} in this reporting period.
                </p>
              </PublicInsetCard>

              <PublicInsetCard className="p-5">
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Report framing
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
                  Use the trendline with the highlights above to explain which publishing windows
                  gained momentum and where the next creative sprint should focus.
                </p>
              </PublicInsetCard>
            </div>
          </div>
        )}
      </PublicSection>

      <PublicSection
        eyebrow="Channel Breakdown"
        title="Platform performance"
        description="Channel-level performance helps agencies explain where momentum is building and where creative needs adjustment."
      >
        {report.platformStats.length === 0 ? (
          <PublicSectionMessage appearance="information" title="No platform analytics yet">
            <p className="text-copy-14">
              Publish a few posts and let snapshots collect before sharing this report externally.
            </p>
          </PublicSectionMessage>
        ) : (
          <PublicTable
            headers={["Platform", "Impressions", "Engagements", "Follower Growth", "Posts"]}
            rows={report.platformStats.map((platform) => [
              <div key={`${platform.provider}-platform`} className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[var(--ds-gray-900)]" />
                <span className="font-medium text-[var(--ds-gray-1000)]">{platform.provider}</span>
              </div>,
              <span key={`${platform.provider}-impressions`}>{fmt(platform.impressions)}</span>,
              <span key={`${platform.provider}-engagement`}>
                {fmt(platform.likes + platform.comments + platform.shares)} · {fmtPct(platform.engagementRate)}
              </span>,
              <span key={`${platform.provider}-growth`}>{fmt(platform.followerGrowth)}</span>,
              <span key={`${platform.provider}-posts`}>{fmt(platform.postsPublished)}</span>,
            ])}
          />
        )}
      </PublicSection>

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
            report.topPosts.map((post) => (
              <PublicCard key={post.postId} className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <PublicLozenge appearance="default">{post.provider}</PublicLozenge>
                  <PublicLozenge appearance="success">
                    {fmtPct(post.engagementRate)} engagement
                  </PublicLozenge>
                </div>
                <p className="mt-4 text-copy-14 text-[var(--ds-gray-1000)]">
                  {post.content || "No post caption was captured for this item."}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--ds-gray-900)]">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {fmt(post.impressions)} impressions
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {fmt(post.comments)} comments
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Share2 className="h-3.5 w-3.5" />
                    {fmt(post.shares)} shares
                  </span>
                </div>
              </PublicCard>
            ))
          )}
        </div>
      </PublicSection>

      <PublicSection
        eyebrow="Reporting Context"
        title="How to read this report"
        description="This shareable report is generated from SocialRaven analytics snapshots and designed for agencies to hand off directly to clients."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <PublicInsetCard className="p-5">
            <LineChart className="h-5 w-5 text-[var(--ds-blue-600)]" />
            <p className="mt-3 text-label-14 text-[var(--ds-gray-1000)]">
              Snapshot-based analytics
            </p>
            <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
              Numbers are based on the latest analytics snapshots available for the selected report window.
            </p>
          </PublicInsetCard>
          <PublicInsetCard className="p-5">
            <Globe2 className="h-5 w-5 text-[var(--ds-blue-600)]" />
            <p className="mt-3 text-label-14 text-[var(--ds-gray-1000)]">
              Shareable by default
            </p>
            <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
              Agencies can send this link directly, and the print-safe layout is optimized for PDF
              export without exposing app navigation or extra client-unfriendly chrome.
            </p>
          </PublicInsetCard>
          <PublicInsetCard className="p-5">
            <Users className="h-5 w-5 text-[var(--ds-blue-600)]" />
            <p className="mt-3 text-label-14 text-[var(--ds-gray-1000)]">
              Client-friendly formatting
            </p>
            <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
              Commentary and highlights are structured to reduce manual deck-building for agencies serving US and EU clients.
            </p>
          </PublicInsetCard>
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}

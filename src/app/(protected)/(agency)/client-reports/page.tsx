"use client";

import { useAuth } from "@clerk/nextjs";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  Copy,
  Download,
  Eye,
  Globe2,
  Layers3,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/utils";
import type {
  ClientReportCadence,
  ClientReportForecastItem,
  ClientReportLink,
  ClientReportScope,
  ClientReportSchedule,
  ClientReportTemplate,
  ClientReportTopPost,
  PublicClientReport,
} from "@/model/ClientReport";
import {
  createClientReportLinkApi,
  createClientReportScheduleApi,
  deactivateClientReportScheduleApi,
  getClientReportLinksApi,
  getClientReportSchedulesApi,
  getClientReportSnapshotApi,
  publicClientReportPdfUrl,
  revokeClientReportLinkApi,
} from "@/service/clientReports";
import {
  fetchAnalyticsShellApi,
  type AnalyticsSelectOption,
} from "@/service/analytics";

const TEMPLATE_OPTIONS: Array<{
  value: ClientReportTemplate;
  label: string;
  description: string;
}> = [
  {
    value: "EXECUTIVE_SUMMARY",
    label: "Executive Summary",
    description: "Best for a balanced performance recap with clear executive takeaways.",
  },
  {
    value: "ENGAGEMENT_SPOTLIGHT",
    label: "Engagement Spotlight",
    description: "Best for client reviews focused on interaction quality and best-performing channels.",
  },
  {
    value: "GROWTH_SNAPSHOT",
    label: "Growth Snapshot",
    description: "Best for momentum reviews that need trend and forecast framing.",
  },
];

const REPORT_SCOPE_OPTIONS: Array<{
  value: ClientReportScope;
  label: string;
  description: string;
}> = [
  {
    value: "WORKSPACE",
    label: "Workspace",
    description: "Use all published analytics in the workspace for a full client-facing recap.",
  },
  {
    value: "CAMPAIGN",
    label: "Campaign",
    description: "Limit the report to one campaign and expose campaign-specific benchmarks.",
  },
];

const LINK_EXPIRY_OPTIONS = [
  { label: "7 days", hours: 24 * 7 },
  { label: "14 days", hours: 24 * 14 },
  { label: "30 days", hours: 24 * 30 },
] as const;

const SHARE_EXPIRY_OPTIONS = [
  { label: "7 days", value: 24 * 7 },
  { label: "14 days", value: 24 * 14 },
  { label: "30 days", value: 24 * 30 },
] as const;

const REPORT_DAY_OPTIONS = [7, 30, 90];
const HOUR_OPTIONS = [7, 8, 9, 10, 12, 15, 18];
const WEEKDAY_OPTIONS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

function formatTimestamp(value: string | null) {
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

function formatShortDate(value: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${Math.round(value)}`;
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "Not available";
  return `${value.toFixed(1)}%`;
}

function formatTemplateLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatScopeLabel(scope: ClientReportScope, campaignLabel?: string | null) {
  if (scope === "CAMPAIGN") {
    return campaignLabel || "Campaign report";
  }
  return "Workspace report";
}

function forecastHeadline(item: ClientReportForecastItem | null) {
  if (!item || !item.available) return "Not enough data";
  const range = item.range;
  if (range && range.expectedValue !== null && range.expectedValue !== undefined) {
    return formatNumber(range.expectedValue);
  }
  return item.slotLabel || "Available";
}

function forecastDetail(item: ClientReportForecastItem | null) {
  if (!item) return "No forecast available yet.";
  if (!item.available) {
    return item.unavailableReason || "No forecast available yet.";
  }

  const parts: string[] = [];
  const range = item.range;
  if (item.slotLabel) {
    parts.push(item.slotLabel);
  }
  if (range && range.lowValue !== null && range.highValue !== null) {
    parts.push(`Range ${formatNumber(range.lowValue)} to ${formatNumber(range.highValue)}`);
  }
  if (item.liftPercent !== null && item.liftPercent !== undefined) {
    parts.push(`Lift ${formatPercent(item.liftPercent)}`);
  }
  if (item.basisSummary) {
    parts.push(item.basisSummary);
  }
  return parts.join(" · ");
}

function reportUrl(token: string) {
  return `${window.location.origin}/reports/${token}`;
}

function downloadPdf(token: string) {
  window.open(publicClientReportPdfUrl(token), "_blank", "noopener,noreferrer");
}

const pageClassName = "min-h-screen bg-[var(--ds-background-200)]";
const surfaceClassName =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4 shadow-sm";
const insetSurfaceClassName =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4";
const emptyStateClassName =
  "rounded-xl border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-6 text-center text-label-14 text-[var(--ds-gray-900)]";
const sectionTitleClassName = "text-label-14 text-[var(--ds-gray-1000)]";
const sectionDescriptionClassName = "text-label-14 leading-6 text-[var(--ds-gray-900)]";
const labelClassName = "text-label-14 text-[var(--ds-gray-1000)]";
const helperTextClassName = "text-copy-12 text-[var(--ds-gray-900)]";
const inputBaseClassName =
  "w-full rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-label-14 text-[var(--ds-gray-1000)] outline-none transition-colors placeholder:text-[var(--ds-gray-700)] focus:border-[var(--ds-blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";
const inputClassName = cn(inputBaseClassName, "h-10");
const textareaClassName = cn(inputBaseClassName, "min-h-[7rem] py-2");
const subtleMetaClassName = "text-copy-12 text-[var(--ds-gray-900)]";
const footerEyebrowClassName =
  "text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[var(--ds-gray-800)]";

function ActionButton({
  variant = "secondary",
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  const variantClassName =
    variant === "primary"
      ? "border-transparent bg-[var(--ds-blue-600)] text-white hover:bg-[var(--ds-blue-700)]"
      : variant === "danger"
        ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)] hover:border-[var(--ds-red-300)] hover:bg-[var(--ds-red-200)]"
        : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3.5 text-label-14 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)] disabled:pointer-events-none disabled:opacity-50",
        variantClassName,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function ToneBadge({
  tone = "neutral",
  children,
}: {
  tone?: "info" | "success" | "warning" | "danger" | "neutral";
  children: ReactNode;
}) {
  const toneClassName =
    tone === "info"
      ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
      : tone === "success"
        ? "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]"
        : tone === "warning"
          ? "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]"
          : tone === "danger"
            ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]"
            : "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label-12",
        toneClassName
      )}
    >
      {children}
    </span>
  );
}

function Notice({
  tone,
  title,
  children,
}: {
  tone: "warning" | "danger";
  title: string;
  children: ReactNode;
}) {
  const toneClassName =
    tone === "warning"
      ? "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]"
      : "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]";

  return (
    <div className={cn("rounded-xl border px-4 py-3", toneClassName)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-label-14">{title}</p>
          <div className="text-copy-12 leading-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
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
    <div className={insetSurfaceClassName}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-blue-600)]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-right">
          <p className="text-[1.75rem] font-semibold leading-none text-[var(--ds-gray-1000)]">
            {value}
          </p>
          <p className="mt-1 text-copy-12 text-[var(--ds-gray-900)]">{label}</p>
        </div>
      </div>
      <p className="mt-4 text-copy-12 leading-5 text-[var(--ds-gray-900)]">{detail}</p>
    </div>
  );
}

function ForecastCard({
  item,
}: {
  item: ClientReportForecastItem | null;
}) {
  return (
    <div className={insetSurfaceClassName}>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-label-14 text-[var(--ds-gray-1000)]">
            {item?.label || "Forecast"}
          </p>
          <ToneBadge tone={item?.available ? "info" : "warning"}>
            {item?.confidenceTier || (item?.available ? "Available" : "Limited")}
          </ToneBadge>
        </div>
        <p className="text-[1.35rem] font-semibold leading-none text-[var(--ds-gray-1000)]">
          {forecastHeadline(item)}
        </p>
        <p className="text-copy-12 leading-5 text-[var(--ds-gray-900)]">
          {forecastDetail(item)}
        </p>
      </div>
    </div>
  );
}

function ScopeSelector({
  value,
  onChange,
}: {
  value: ClientReportScope;
  onChange: (value: ClientReportScope) => void;
}) {
  return (
    <div className="space-y-2">
      <span className={labelClassName}>Report scope</span>
      <div className="flex flex-wrap gap-2">
        {REPORT_SCOPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-label-12 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]",
              value === option.value
                ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
                : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className={helperTextClassName}>
        {REPORT_SCOPE_OPTIONS.find((option) => option.value === value)?.description}
      </p>
    </div>
  );
}

function TopPostPreviewCard({ post }: { post: ClientReportTopPost }) {
  return (
    <div className={insetSurfaceClassName}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className={sectionTitleClassName}>{post.platformLabel}</p>
            {post.campaignLabel && <ToneBadge tone="info">{post.campaignLabel}</ToneBadge>}
          </div>
          <p className="text-copy-12 text-[var(--ds-gray-900)]">
            {post.accountName || "Connected account"} ·{" "}
            {post.publishedAt ? formatShortDate(post.publishedAt) : "Publish date unavailable"}
          </p>
        </div>
        <ToneBadge tone="success">
          {formatNumber(post.engagements)} engagements
        </ToneBadge>
      </div>
      <p className="mt-3 line-clamp-3 text-copy-13 leading-6 text-[var(--ds-gray-1000)]">
        {post.content || "No post caption was captured for this item."}
      </p>
      <div className="mt-4 grid gap-2 text-copy-12 text-[var(--ds-gray-900)] sm:grid-cols-2">
        <p>Impressions {formatNumber(post.impressions)}</p>
        <p>Engagement rate {formatPercent(post.engagementRate)}</p>
        <p>Likes {formatNumber(post.likes)}</p>
        <p>Comments {formatNumber(post.comments)}</p>
        <p>Shares {formatNumber(post.shares)}</p>
        <p>Clicks {formatNumber(post.clicks)}</p>
      </div>
    </div>
  );
}

export default function ClientReportsPage() {
  const { getToken } = useAuth();
  const { canExportClientReports } = useRole();
  const { activeWorkspace } = useWorkspace();

  const [links, setLinks] = useState<ClientReportLink[]>([]);
  const [schedules, setSchedules] = useState<ClientReportSchedule[]>([]);
  const [campaignOptions, setCampaignOptions] = useState<AnalyticsSelectOption[]>([]);
  const [preview, setPreview] = useState<PublicClientReport | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [linkTitle, setLinkTitle] = useState("");
  const [linkClientLabel, setLinkClientLabel] = useState("");
  const [linkAgencyLabel, setLinkAgencyLabel] = useState("");
  const [linkTemplate, setLinkTemplate] =
    useState<ClientReportTemplate>("EXECUTIVE_SUMMARY");
  const [linkReportDays, setLinkReportDays] = useState<number>(30);
  const [linkCommentary, setLinkCommentary] = useState("");
  const [linkReportScope, setLinkReportScope] =
    useState<ClientReportScope>("WORKSPACE");
  const [linkCampaignId, setLinkCampaignId] = useState("");
  const [linkRecipientName, setLinkRecipientName] = useState("");
  const [linkRecipientEmail, setLinkRecipientEmail] = useState("");
  const [linkExpiryHours, setLinkExpiryHours] =
    useState<number>(LINK_EXPIRY_OPTIONS[1].hours);
  const [creatingLink, setCreatingLink] = useState(false);
  const [actingLinkId, setActingLinkId] = useState<string | null>(null);

  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleRecipientName, setScheduleRecipientName] = useState("");
  const [scheduleRecipientEmail, setScheduleRecipientEmail] = useState("");
  const [scheduleClientLabel, setScheduleClientLabel] = useState("");
  const [scheduleAgencyLabel, setScheduleAgencyLabel] = useState("");
  const [scheduleTemplate, setScheduleTemplate] =
    useState<ClientReportTemplate>("EXECUTIVE_SUMMARY");
  const [scheduleReportDays, setScheduleReportDays] = useState<number>(30);
  const [scheduleCommentary, setScheduleCommentary] = useState("");
  const [scheduleReportScope, setScheduleReportScope] =
    useState<ClientReportScope>("WORKSPACE");
  const [scheduleCampaignId, setScheduleCampaignId] = useState("");
  const [scheduleCadence, setScheduleCadence] =
    useState<ClientReportCadence>("WEEKLY");
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState<number>(1);
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState<number>(1);
  const [scheduleHourUtc, setScheduleHourUtc] = useState<number>(8);
  const [scheduleShareExpiryHours, setScheduleShareExpiryHours] = useState<number>(
    SHARE_EXPIRY_OPTIONS[1].value
  );
  const [creatingSchedule, setCreatingSchedule] = useState(false);
  const [actingScheduleId, setActingScheduleId] = useState<number | null>(null);

  useEffect(() => {
    if (!activeWorkspace) return;
    setLinkClientLabel((current) => current || activeWorkspace.name);
    setLinkAgencyLabel((current) => current || activeWorkspace.companyName || activeWorkspace.name);
    setScheduleClientLabel((current) => current || activeWorkspace.name);
    setScheduleAgencyLabel((current) => current || activeWorkspace.companyName || activeWorkspace.name);
  }, [activeWorkspace]);

  useEffect(() => {
    if (linkReportScope === "CAMPAIGN" && !linkCampaignId && campaignOptions[0]) {
      setLinkCampaignId(campaignOptions[0].value);
    }
  }, [linkCampaignId, linkReportScope, campaignOptions]);

  useEffect(() => {
    if (scheduleReportScope === "CAMPAIGN" && !scheduleCampaignId && campaignOptions[0]) {
      setScheduleCampaignId(campaignOptions[0].value);
    }
  }, [scheduleCampaignId, scheduleReportScope, campaignOptions]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [nextLinks, nextSchedules, shell] = await Promise.all([
        getClientReportLinksApi(getToken),
        getClientReportSchedulesApi(getToken),
        fetchAnalyticsShellApi(getToken, { dateRange: "90d" }),
      ]);
      setLinks(nextLinks);
      setSchedules(nextSchedules);
      setCampaignOptions(shell.filters.campaigns.filter((option) => option.value !== "NO_CAMPAIGN"));
    } catch (err: any) {
      setError(err?.message ?? "Failed to load client reports.");
    }
  }, [getToken]);

  useEffect(() => {
    if (!canExportClientReports) {
      setLoading(false);
      return;
    }

    let ignore = false;

    async function init() {
      setLoading(true);
      await loadData();
      if (!ignore) {
        setLoading(false);
      }
    }

    void init();
    return () => {
      ignore = true;
    };
  }, [canExportClientReports, loadData]);

  useEffect(() => {
    if (!canExportClientReports || !activeWorkspace) {
      return;
    }
    if (linkReportScope === "CAMPAIGN" && !linkCampaignId) {
      setPreview(null);
      setPreviewError(
        campaignOptions.length === 0
          ? "No campaigns are available yet. Create campaign-linked posts before using campaign report mode."
          : "Select a campaign to preview a campaign report."
      );
      return;
    }

    let ignore = false;
    const timeout = window.setTimeout(async () => {
      try {
        setPreviewLoading(true);
        setPreviewError(null);
        const expiresAt = new Date(
          Date.now() + linkExpiryHours * 60 * 60 * 1000
        ).toISOString();
        const next = await getClientReportSnapshotApi(getToken, {
          reportTitle: linkTitle || undefined,
          clientLabel: linkClientLabel || undefined,
          agencyLabel: linkAgencyLabel || undefined,
          reportScope: linkReportScope,
          campaignId:
            linkReportScope === "CAMPAIGN" && linkCampaignId ? Number(linkCampaignId) : undefined,
          templateType: linkTemplate,
          reportDays: linkReportDays,
          commentary: linkCommentary || undefined,
          expiresAt,
        });
        if (!ignore) {
          setPreview(next);
        }
      } catch (err: any) {
        if (!ignore) {
          setPreview(null);
          setPreviewError(err?.message ?? "Failed to generate the analytics snapshot.");
        }
      } finally {
        if (!ignore) {
          setPreviewLoading(false);
        }
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timeout);
    };
  }, [
    activeWorkspace,
    campaignOptions.length,
    canExportClientReports,
    getToken,
    linkAgencyLabel,
    linkCampaignId,
    linkClientLabel,
    linkCommentary,
    linkExpiryHours,
    linkReportDays,
    linkReportScope,
    linkTemplate,
    linkTitle,
  ]);

  async function refresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleCreateLink() {
    setCreatingLink(true);
    try {
      const expiresAt = new Date(Date.now() + linkExpiryHours * 60 * 60 * 1000).toISOString();
      const created = await createClientReportLinkApi(getToken, {
        reportTitle: linkTitle || undefined,
        clientLabel: linkClientLabel || undefined,
        agencyLabel: linkAgencyLabel || undefined,
        reportScope: linkReportScope,
        campaignId:
          linkReportScope === "CAMPAIGN" && linkCampaignId ? Number(linkCampaignId) : undefined,
        templateType: linkTemplate,
        reportDays: linkReportDays,
        commentary: linkCommentary || undefined,
        expiresAt,
        recipientName: linkRecipientName || undefined,
        recipientEmail: linkRecipientEmail || undefined,
      });

      setLinks((current) => [created, ...current]);
      if (!linkRecipientEmail.trim()) {
        await navigator.clipboard.writeText(reportUrl(created.token));
        toast.success("Report link created and copied.");
      } else {
        toast.success("Report link created and email delivery queued.");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create report link.");
    } finally {
      setCreatingLink(false);
    }
  }

  async function handleCopyLink(link: ClientReportLink) {
    try {
      await navigator.clipboard.writeText(reportUrl(link.token));
      toast.success("Report link copied.");
    } catch {
      toast.error("Failed to copy report link.");
    }
  }

  async function handleRevokeLink(linkId: string) {
    setActingLinkId(linkId);
    try {
      await revokeClientReportLinkApi(getToken, linkId);
      await loadData();
      toast.success("Report link revoked.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to revoke report link.");
    } finally {
      setActingLinkId(null);
    }
  }

  async function handleCreateSchedule() {
    setCreatingSchedule(true);
    try {
      const created = await createClientReportScheduleApi(getToken, {
        reportTitle: scheduleTitle || undefined,
        recipientName: scheduleRecipientName || undefined,
        recipientEmail: scheduleRecipientEmail,
        clientLabel: scheduleClientLabel || undefined,
        agencyLabel: scheduleAgencyLabel || undefined,
        reportScope: scheduleReportScope,
        campaignId:
          scheduleReportScope === "CAMPAIGN" && scheduleCampaignId
            ? Number(scheduleCampaignId)
            : undefined,
        templateType: scheduleTemplate,
        reportDays: scheduleReportDays,
        commentary: scheduleCommentary || undefined,
        cadence: scheduleCadence,
        dayOfWeek: scheduleCadence === "WEEKLY" ? scheduleDayOfWeek : undefined,
        dayOfMonth: scheduleCadence === "MONTHLY" ? scheduleDayOfMonth : undefined,
        hourOfDayUtc: scheduleHourUtc,
        shareExpiryHours: scheduleShareExpiryHours,
      });

      setSchedules((current) => [created, ...current]);
      toast.success("Recurring report schedule created.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create report schedule.");
    } finally {
      setCreatingSchedule(false);
    }
  }

  async function handleDeactivateSchedule(scheduleId: number) {
    setActingScheduleId(scheduleId);
    try {
      await deactivateClientReportScheduleApi(getToken, scheduleId);
      await loadData();
      toast.success("Recurring report paused.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to pause recurring report.");
    } finally {
      setActingScheduleId(null);
    }
  }

  return (
    <div className={pageClassName}>
      <ProtectedPageHeader
        title="Client Reports"
        description="Preview the actual analytics report first, then share links and automate recurring delivery."
        icon={<Globe2 className="h-4 w-4" />}
        className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95"
        actions={
          <ActionButton disabled={refreshing || loading} onClick={refresh}>
            <span className="inline-flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </span>
          </ActionButton>
        }
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-5">
        {!canExportClientReports && (
          <Notice tone="warning" title="Client reporting is restricted">
            Only workspaces with the client-report export capability can create branded report links
            or recurring deliveries.
          </Notice>
        )}

        {error && (
          <Notice tone="danger" title="Client reports failed to load">
            {error}
          </Notice>
        )}

        <section className={cn(surfaceClassName, "overflow-hidden p-0")}>
          <div className="border-b border-[var(--ds-gray-400)] bg-[radial-gradient(circle_at_top_left,rgba(47,101,235,0.12),transparent_55%),linear-gradient(180deg,var(--ds-background-100),var(--ds-gray-100))] px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className={footerEyebrowClassName}>Analytics Snapshot</p>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[1.35rem] font-semibold text-[var(--ds-gray-1000)]">
                    {preview?.reportTitle || `${activeWorkspace?.name ?? "Workspace"} report preview`}
                  </h2>
                  <ToneBadge tone="info">
                    {preview ? formatScopeLabel(preview.reportScope, preview.campaignLabel) : formatScopeLabel(linkReportScope)}
                  </ToneBadge>
                  <ToneBadge tone="neutral">{formatTemplateLabel(linkTemplate)}</ToneBadge>
                </div>
                <p className="max-w-3xl text-copy-13 leading-6 text-[var(--ds-gray-900)]">
                  {preview?.commentary ||
                    "This preview is generated from the live workspace analytics foundation. Share and export only after the on-screen report is useful."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {previewLoading && (
                  <ToneBadge tone="info">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Refreshing preview
                  </ToneBadge>
                )}
                {preview && (
                  <ToneBadge tone="success">
                    Updated {formatTimestamp(preview.generatedAt)}
                  </ToneBadge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5 px-4 py-4 sm:px-5">
            {previewError && (
              <Notice tone="danger" title="Preview unavailable">
                {previewError}
              </Notice>
            )}

            {preview ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    icon={Eye}
                    label="Impressions"
                    value={formatNumber(preview.summary.impressions)}
                    detail={`${formatNumber(preview.summary.engagements)} engagements in ${preview.reportWindowLabel}.`}
                  />
                  <MetricCard
                    icon={TrendingUp}
                    label="Engagement Rate"
                    value={formatPercent(preview.summary.engagementRate)}
                    detail={`${formatNumber(preview.summary.clicks)} clicks captured across this report scope.`}
                  />
                  <MetricCard
                    icon={Layers3}
                    label="Posts Published"
                    value={formatNumber(preview.summary.postsPublished)}
                    detail={`${formatNumber(preview.platformPerformance.length)} tracked platform segment${preview.platformPerformance.length === 1 ? "" : "s"} contributed.`}
                  />
                  <MetricCard
                    icon={BarChart3}
                    label="Top Window"
                    value={preview.reportWindowLabel}
                    detail={
                      preview.linkExpiresAt
                        ? `Share link stays active until ${formatTimestamp(preview.linkExpiresAt)}.`
                        : "Preview mode does not expose an active share window."
                    }
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
                  <div className={insetSurfaceClassName}>
                    <div className="mb-4 space-y-1">
                      <p className={sectionTitleClassName}>Client takeaways</p>
                      <p className={sectionDescriptionClassName}>
                        These are the exact highlights that will appear in the shared report.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {preview.highlights.map((highlight, index) => (
                        <div
                          key={`${highlight}-${index}`}
                          className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]">
                              <TrendingUp className="h-4 w-4" />
                            </div>
                            <p className="text-copy-13 leading-6 text-[var(--ds-gray-1000)]">
                              {highlight}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={insetSurfaceClassName}>
                      <div className="mb-4 space-y-1">
                        <p className={sectionTitleClassName}>Forecast outlook</p>
                        <p className={sectionDescriptionClassName}>
                          Real projections from the current workspace analytics slice.
                        </p>
                      </div>
                      <div className="grid gap-3">
                        <ForecastCard item={preview.forecast?.nextPostPrediction || null} />
                        <ForecastCard item={preview.forecast?.nextBestSlot || null} />
                        <ForecastCard item={preview.forecast?.planningWindowProjection || null} />
                      </div>
                    </div>

                    {preview.reportScope === "CAMPAIGN" && preview.campaignInsight && (
                      <div className={insetSurfaceClassName}>
                        <div className="mb-4 space-y-1">
                          <p className={sectionTitleClassName}>Campaign benchmark</p>
                          <p className={sectionDescriptionClassName}>
                            Campaign-specific performance against comparable campaigns in this workspace slice.
                          </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-3">
                            <p className="text-copy-12 text-[var(--ds-gray-900)]">Percentile rank</p>
                            <p className="mt-2 text-[1.35rem] font-semibold text-[var(--ds-gray-1000)]">
                              {formatPercent(preview.campaignInsight.percentile)}
                            </p>
                            <p className="mt-2 text-copy-12 text-[var(--ds-gray-900)]">
                              Lift vs benchmark {formatPercent(preview.campaignInsight.liftPercent)}
                            </p>
                          </div>
                          <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-3">
                            <p className="text-copy-12 text-[var(--ds-gray-900)]">Campaign output</p>
                            <p className="mt-2 text-[1.35rem] font-semibold text-[var(--ds-gray-1000)]">
                              {formatNumber(preview.campaignInsight.postsPublished)} posts
                            </p>
                            <p className="mt-2 text-copy-12 text-[var(--ds-gray-900)]">
                              {formatNumber(preview.campaignInsight.engagements)} engagements in this window
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
                  <div className={insetSurfaceClassName}>
                    <div className="mb-4 space-y-1">
                      <p className={sectionTitleClassName}>Platform performance</p>
                      <p className={sectionDescriptionClassName}>
                        Share-safe channel breakdown generated from the same workspace analytics system.
                      </p>
                    </div>
                    {preview.platformPerformance.length === 0 ? (
                      <div className={emptyStateClassName}>No platform analytics available yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[var(--ds-gray-400)]">
                          <thead>
                            <tr className="text-left text-copy-12 uppercase tracking-[0.12em] text-[var(--ds-gray-900)]">
                              <th className="pb-3 pr-4">Platform</th>
                              <th className="pb-3 pr-4">Impressions</th>
                              <th className="pb-3 pr-4">Engagements</th>
                              <th className="pb-3 pr-4">Avg / Post</th>
                              <th className="pb-3">Share</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--ds-gray-400)]">
                            {preview.platformPerformance.map((platform) => (
                              <tr key={platform.provider}>
                                <td className="py-3 pr-4 text-copy-13 text-[var(--ds-gray-1000)]">
                                  {platform.platformLabel}
                                </td>
                                <td className="py-3 pr-4 text-copy-13 text-[var(--ds-gray-900)]">
                                  {formatNumber(platform.impressions)}
                                </td>
                                <td className="py-3 pr-4 text-copy-13 text-[var(--ds-gray-900)]">
                                  {formatNumber(platform.engagements)}
                                </td>
                                <td className="py-3 pr-4 text-copy-13 text-[var(--ds-gray-900)]">
                                  {formatNumber(platform.averageEngagementsPerPost)}
                                </td>
                                <td className="py-3 text-copy-13 text-[var(--ds-gray-900)]">
                                  {formatPercent(platform.engagementSharePercent)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className={insetSurfaceClassName}>
                    <div className="mb-4 space-y-1">
                      <p className={sectionTitleClassName}>Top content</p>
                      <p className={sectionDescriptionClassName}>
                        Best-performing posts with the actual likes, comments, shares, and reach signals.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {preview.topPosts.length === 0 ? (
                        <div className={emptyStateClassName}>No top-post analytics available yet.</div>
                      ) : (
                        preview.topPosts.map((post) => (
                          <TopPostPreviewCard key={post.postId} post={post} />
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {preview.reportScope === "CAMPAIGN" && preview.campaignInsight && (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className={insetSurfaceClassName}>
                      <div className="mb-4 space-y-1">
                        <p className={sectionTitleClassName}>Platform contribution</p>
                        <p className={sectionDescriptionClassName}>
                          Which platforms carried the campaign in this window.
                        </p>
                      </div>
                      <div className="space-y-2">
                        {(preview.campaignInsight.platformBreakdown?.rows || []).map((row) => (
                          <div
                            key={`campaign-platform-${row.key}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 py-2"
                          >
                            <div>
                              <p className="text-copy-13 text-[var(--ds-gray-1000)]">{row.label}</p>
                              <p className="text-copy-12 text-[var(--ds-gray-900)]">
                                {formatNumber(row.postsPublished)} posts
                              </p>
                            </div>
                            <ToneBadge tone="info">
                              {formatNumber(row.performanceValue)} engagements
                            </ToneBadge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={insetSurfaceClassName}>
                      <div className="mb-4 space-y-1">
                        <p className={sectionTitleClassName}>Account contribution</p>
                        <p className={sectionDescriptionClassName}>
                          Which connected accounts contributed the most campaign performance.
                        </p>
                      </div>
                      <div className="space-y-2">
                        {(preview.campaignInsight.accountBreakdown?.rows || []).map((row) => (
                          <div
                            key={`campaign-account-${row.key}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 py-2"
                          >
                            <div>
                              <p className="text-copy-13 text-[var(--ds-gray-1000)]">{row.label}</p>
                              <p className="text-copy-12 text-[var(--ds-gray-900)]">
                                {formatNumber(row.postsPublished)} posts
                              </p>
                            </div>
                            <ToneBadge tone="info">
                              {formatNumber(row.performanceValue)} engagements
                            </ToneBadge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={emptyStateClassName}>
                {previewLoading
                  ? "Generating analytics snapshot..."
                  : "Adjust the report settings below to generate a live client-report preview."}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className={surfaceClassName}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className={sectionTitleClassName}>Quick Share</p>
                <p className={sectionDescriptionClassName}>
                  Generate a branded report link instantly. The preview above uses these exact report settings.
                </p>
              </div>
              <ToneBadge tone="info">{links.length} links</ToneBadge>
            </div>

            <div className="space-y-4">
              <ScopeSelector value={linkReportScope} onChange={setLinkReportScope} />

              {linkReportScope === "CAMPAIGN" && (
                <label className="space-y-2">
                  <span className={labelClassName}>Campaign</span>
                  <select
                    value={linkCampaignId}
                    onChange={(event) => setLinkCampaignId(event.target.value)}
                    className={inputClassName}
                    disabled={campaignOptions.length === 0}
                  >
                    {campaignOptions.length === 0 ? (
                      <option value="">No campaigns available</option>
                    ) : (
                      campaignOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    )}
                  </select>
                  <p className={helperTextClassName}>
                    Campaign report mode is only available when the workspace has campaign-linked posts.
                  </p>
                </label>
              )}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClassName}>Report title</span>
                <input
                  value={linkTitle}
                  onChange={(event) => setLinkTitle(event.target.value)}
                  placeholder={`${activeWorkspace?.name ?? "Workspace"} performance report`}
                  className={inputClassName}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClassName}>Reporting window</span>
                <select
                  value={linkReportDays}
                  onChange={(event) => setLinkReportDays(Number(event.target.value))}
                  className={inputClassName}
                >
                  {REPORT_DAY_OPTIONS.map((days) => (
                    <option key={days} value={days}>
                      Last {days} days
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className={labelClassName}>Client label</span>
                <input
                  value={linkClientLabel}
                  onChange={(event) => setLinkClientLabel(event.target.value)}
                  className={inputClassName}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClassName}>Agency label</span>
                <input
                  value={linkAgencyLabel}
                  onChange={(event) => setLinkAgencyLabel(event.target.value)}
                  className={inputClassName}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClassName}>Template</span>
                <select
                  value={linkTemplate}
                  onChange={(event) => setLinkTemplate(event.target.value as ClientReportTemplate)}
                  className={inputClassName}
                >
                  {TEMPLATE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className={helperTextClassName}>
                  {TEMPLATE_OPTIONS.find((option) => option.value === linkTemplate)?.description}
                </p>
              </label>
              <div className="space-y-2">
                <span className={labelClassName}>Link expiry</span>
                <div className="flex flex-wrap gap-2">
                  {LINK_EXPIRY_OPTIONS.map((option) => (
                    <button
                      key={option.hours}
                      type="button"
                      onClick={() => setLinkExpiryHours(option.hours)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-label-12 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]",
                        linkExpiryHours === option.hours
                          ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
                          : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClassName}>Recipient name</span>
                <input
                  value={linkRecipientName}
                  onChange={(event) => setLinkRecipientName(event.target.value)}
                  placeholder="Optional"
                  className={inputClassName}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClassName}>Recipient email</span>
                <input
                  value={linkRecipientEmail}
                  onChange={(event) => setLinkRecipientEmail(event.target.value)}
                  placeholder="Optional"
                  type="email"
                  className={inputClassName}
                />
              </label>
            </div>

            <label className="mt-4 block space-y-2">
              <span className={labelClassName}>Commentary block</span>
              <textarea
                value={linkCommentary}
                onChange={(event) => setLinkCommentary(event.target.value)}
                rows={4}
                placeholder="Optional narrative for the client-facing cover note..."
                className={textareaClassName}
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className={footerEyebrowClassName}>
                {linkRecipientEmail.trim() ? "Email delivery enabled" : "Copy link after creation"}
              </p>
              <ActionButton
                variant="primary"
                disabled={creatingLink || (linkReportScope === "CAMPAIGN" && !linkCampaignId)}
                onClick={handleCreateLink}
              >
                <span className="inline-flex items-center gap-2">
                  {creatingLink ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating…</span>
                    </>
                  ) : (
                    <>
                      {linkRecipientEmail.trim() ? (
                        <Mail className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span>{linkRecipientEmail.trim() ? "Create & Email Report" : "Create Share Link"}</span>
                    </>
                  )}
                </span>
              </ActionButton>
            </div>
          </div>

          <div className={surfaceClassName}>
            <div className="mb-5 space-y-1">
              <p className={sectionTitleClassName}>Active Links</p>
              <p className={sectionDescriptionClassName}>
                Share live report URLs or revoke them when a client handoff ends.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--ds-gray-900)]" />
              </div>
            ) : links.length === 0 ? (
              <div className={emptyStateClassName}>No report links yet.</div>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <div key={link.id} className={insetSurfaceClassName}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={sectionTitleClassName}>{link.reportTitle}</p>
                          <ToneBadge tone={link.active ? "success" : "danger"}>
                            {link.active ? "Active" : "Expired"}
                          </ToneBadge>
                        </div>
                        <p className={subtleMetaClassName}>
                          {formatScopeLabel(link.reportScope, link.campaignLabel)} · {link.reportDays}d ·{" "}
                          {formatTemplateLabel(link.templateType)}
                        </p>
                        <p className={subtleMetaClassName}>
                          Created {formatTimestamp(link.createdAt)} · Expires {formatTimestamp(link.expiresAt)}
                        </p>
                        {link.recipientEmail && (
                          <p className={subtleMetaClassName}>Delivered to {link.recipientEmail}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <ActionButton disabled={!link.active} onClick={() => downloadPdf(link.token)}>
                          <span className="inline-flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            <span>PDF</span>
                          </span>
                        </ActionButton>
                        <ActionButton onClick={() => handleCopyLink(link)}>
                          <span className="inline-flex items-center gap-2">
                            <Copy className="h-4 w-4" />
                            <span>Copy</span>
                          </span>
                        </ActionButton>
                        <ActionButton
                          variant="danger"
                          disabled={!link.active || actingLinkId === link.id}
                          onClick={() => handleRevokeLink(link.id)}
                        >
                          <span className="inline-flex items-center gap-2">
                            {actingLinkId === link.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span>Revoke</span>
                          </span>
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className={surfaceClassName}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className={sectionTitleClassName}>Recurring Delivery</p>
                <p className={sectionDescriptionClassName}>
                  Automate weekly or monthly client reporting with the same workspace or campaign scope.
                </p>
              </div>
              <ToneBadge tone="warning">{schedules.length} schedules</ToneBadge>
            </div>

            <div className="space-y-4">
              <ScopeSelector value={scheduleReportScope} onChange={setScheduleReportScope} />

              {scheduleReportScope === "CAMPAIGN" && (
                <label className="space-y-2">
                  <span className={labelClassName}>Campaign</span>
                  <select
                    value={scheduleCampaignId}
                    onChange={(event) => setScheduleCampaignId(event.target.value)}
                    className={inputClassName}
                    disabled={campaignOptions.length === 0}
                  >
                    {campaignOptions.length === 0 ? (
                      <option value="">No campaigns available</option>
                    ) : (
                      campaignOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    )}
                  </select>
                </label>
              )}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClassName}>Report title</span>
                <input
                  value={scheduleTitle}
                  onChange={(event) => setScheduleTitle(event.target.value)}
                  placeholder="Monthly client performance review"
                  className={inputClassName}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClassName}>Recipient email</span>
                <input
                  value={scheduleRecipientEmail}
                  onChange={(event) => setScheduleRecipientEmail(event.target.value)}
                  type="email"
                  className={inputClassName}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClassName}>Recipient name</span>
                <input
                  value={scheduleRecipientName}
                  onChange={(event) => setScheduleRecipientName(event.target.value)}
                  placeholder="Optional"
                  className={inputClassName}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClassName}>Cadence</span>
                <select
                  value={scheduleCadence}
                  onChange={(event) => setScheduleCadence(event.target.value as ClientReportCadence)}
                  className={inputClassName}
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClassName}>Client label</span>
                <input
                  value={scheduleClientLabel}
                  onChange={(event) => setScheduleClientLabel(event.target.value)}
                  className={inputClassName}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClassName}>Agency label</span>
                <input
                  value={scheduleAgencyLabel}
                  onChange={(event) => setScheduleAgencyLabel(event.target.value)}
                  className={inputClassName}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <label className="space-y-2 md:col-span-2">
                <span className={labelClassName}>Template</span>
                <select
                  value={scheduleTemplate}
                  onChange={(event) => setScheduleTemplate(event.target.value as ClientReportTemplate)}
                  className={inputClassName}
                >
                  {TEMPLATE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className={labelClassName}>Window</span>
                <select
                  value={scheduleReportDays}
                  onChange={(event) => setScheduleReportDays(Number(event.target.value))}
                  className={inputClassName}
                >
                  {REPORT_DAY_OPTIONS.map((days) => (
                    <option key={days} value={days}>
                      {days} days
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className={labelClassName}>Hour UTC</span>
                <select
                  value={scheduleHourUtc}
                  onChange={(event) => setScheduleHourUtc(Number(event.target.value))}
                  className={inputClassName}
                >
                  {HOUR_OPTIONS.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {scheduleCadence === "WEEKLY" ? (
                <label className="space-y-2">
                  <span className={labelClassName}>Weekly send day</span>
                  <select
                    value={scheduleDayOfWeek}
                    onChange={(event) => setScheduleDayOfWeek(Number(event.target.value))}
                    className={inputClassName}
                  >
                    {WEEKDAY_OPTIONS.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="space-y-2">
                  <span className={labelClassName}>Monthly send day</span>
                  <input
                    value={scheduleDayOfMonth}
                    onChange={(event) => setScheduleDayOfMonth(Number(event.target.value))}
                    type="number"
                    min={1}
                    max={28}
                    className={inputClassName}
                  />
                </label>
              )}
              <label className="space-y-2">
                <span className={labelClassName}>Shared link lifetime</span>
                <select
                  value={scheduleShareExpiryHours}
                  onChange={(event) => setScheduleShareExpiryHours(Number(event.target.value))}
                  className={inputClassName}
                >
                  {SHARE_EXPIRY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 block space-y-2">
              <span className={labelClassName}>Commentary block</span>
              <textarea
                value={scheduleCommentary}
                onChange={(event) => setScheduleCommentary(event.target.value)}
                rows={4}
                placeholder="Optional cover note for recurring report emails..."
                className={textareaClassName}
              />
            </label>

            <div className="mt-5 flex justify-end">
              <ActionButton
                variant="primary"
                disabled={
                  creatingSchedule || (scheduleReportScope === "CAMPAIGN" && !scheduleCampaignId)
                }
                onClick={handleCreateSchedule}
              >
                <span className="inline-flex items-center gap-2">
                  {creatingSchedule ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Scheduling…</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Create Recurring Delivery</span>
                    </>
                  )}
                </span>
              </ActionButton>
            </div>
          </div>

          <div className={surfaceClassName}>
            <div className="mb-5 space-y-1">
              <p className={sectionTitleClassName}>Active Schedules</p>
              <p className={sectionDescriptionClassName}>
                Monitor cadence, scope, and next-send timing before clients receive the next snapshot.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--ds-gray-900)]" />
              </div>
            ) : schedules.length === 0 ? (
              <div className={emptyStateClassName}>No recurring report schedules yet.</div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className={insetSurfaceClassName}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={sectionTitleClassName}>{schedule.reportTitle}</p>
                          <ToneBadge tone={schedule.active ? "success" : "danger"}>
                            {schedule.active ? "Active" : "Paused"}
                          </ToneBadge>
                        </div>
                        <p className={subtleMetaClassName}>
                          {schedule.recipientEmail} · {schedule.cadence.toLowerCase()} · {schedule.reportDays}d
                        </p>
                        <p className={subtleMetaClassName}>
                          {formatScopeLabel(schedule.reportScope, schedule.campaignLabel)}
                        </p>
                        <p className={subtleMetaClassName}>
                          Next send {formatTimestamp(schedule.nextSendAt)}
                        </p>
                        <p className={subtleMetaClassName}>
                          Last sent {schedule.lastSentAt ? formatTimestamp(schedule.lastSentAt) : "Not sent yet"}
                        </p>
                      </div>

                      <ActionButton
                        disabled={!schedule.active || actingScheduleId === schedule.id}
                        onClick={() => handleDeactivateSchedule(schedule.id)}
                      >
                        <span className="inline-flex items-center gap-2">
                          {actingScheduleId === schedule.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CalendarClock className="h-4 w-4" />
                          )}
                          <span>Pause</span>
                        </span>
                      </ActionButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

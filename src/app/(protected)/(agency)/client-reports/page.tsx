"use client";

import { useAuth } from "@clerk/nextjs";
import {
  AlertTriangle,
  CalendarClock,
  Copy,
  Download,
  Globe2,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import { type ButtonHTMLAttributes, type ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { useRole } from "@/hooks/useRole";
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import type {
  ClientReportCadence,
  ClientReportLink,
  ClientReportSchedule,
  ClientReportTemplate,
} from "@/model/ClientReport";
import {
  createClientReportLinkApi,
  createClientReportScheduleApi,
  deactivateClientReportScheduleApi,
  getClientReportLinksApi,
  getClientReportSchedulesApi,
  publicClientReportPdfUrl,
  revokeClientReportLinkApi,
} from "@/service/clientReports";

const TEMPLATE_OPTIONS: Array<{
  value: ClientReportTemplate;
  label: string;
  description: string;
}> = [
  {
    value: "EXECUTIVE_SUMMARY",
    label: "Executive Summary",
    description: "Balanced performance recap across reach, engagement, and publishing output.",
  },
  {
    value: "ENGAGEMENT_SPOTLIGHT",
    label: "Engagement Spotlight",
    description: "Best for clients who care about interaction quality and top-performing channels.",
  },
  {
    value: "GROWTH_SNAPSHOT",
    label: "Growth Snapshot",
    description: "Best for momentum-focused clients tracking follower and audience lift.",
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

function reportUrl(token: string) {
  return `${window.location.origin}/reports/${token}`;
}

function downloadPdf(token: string) {
  window.open(publicClientReportPdfUrl(token), "_blank", "noopener,noreferrer");
}

function formatTemplateLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
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
  "w-full rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-label-14 text-[var(--ds-gray-1000)] outline-none transition-colors placeholder:text-[var(--ds-gray-700)] focus:border-[hsl(var(--accent))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";
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
      ? "border-transparent bg-[hsl(var(--accent))] !text-white hover:bg-[hsl(var(--accent-hover))]"
      : variant === "danger"
        ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)] hover:border-[var(--ds-red-300)] hover:bg-[var(--ds-red-200)]"
        : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3.5 text-label-14 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)] disabled:pointer-events-none disabled:opacity-50",
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
      ? "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
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

export default function ClientReportsPage() {
  const { getToken } = useAuth();
  const { canExportClientReports } = useRole();
  const { activeWorkspace } = useWorkspace();

  const [links, setLinks] = useState<ClientReportLink[]>([]);
  const [schedules, setSchedules] = useState<ClientReportSchedule[]>([]);
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

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [nextLinks, nextSchedules] = await Promise.all([
        getClientReportLinksApi(getToken),
        getClientReportSchedulesApi(getToken),
      ]);
      setLinks(nextLinks);
      setSchedules(nextSchedules);
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
        description="Create client-ready report links, email branded recaps, and automate recurring delivery."
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

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className={surfaceClassName}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className={sectionTitleClassName}>Quick Share</p>
                <p className={sectionDescriptionClassName}>
                  Generate a branded report link instantly. Add a recipient email to deliver it
                  directly from SocialRaven.
                </p>
              </div>
              <ToneBadge tone="info">{links.length} links</ToneBadge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                        "rounded-full border px-3 py-1.5 text-label-12 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]",
                        linkExpiryHours === option.hours
                          ? "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
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
              <ActionButton variant="primary" disabled={creatingLink} onClick={handleCreateLink}>
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
              <div className={emptyStateClassName}>
                No report links yet.
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className={insetSurfaceClassName}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={sectionTitleClassName}>{link.reportTitle}</p>
                          <ToneBadge tone={link.active ? "success" : "danger"}>
                            {link.active ? "Active" : "Expired"}
                          </ToneBadge>
                        </div>
                        <p className={subtleMetaClassName}>
                          {link.clientLabel || activeWorkspace?.name} · {link.reportDays}d · {formatTemplateLabel(link.templateType)}
                        </p>
                        <p className={subtleMetaClassName}>
                          Created {formatTimestamp(link.createdAt)} · Expires {formatTimestamp(link.expiresAt)}
                        </p>
                        {link.recipientEmail && (
                          <p className={subtleMetaClassName}>
                            Delivered to {link.recipientEmail}
                          </p>
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
                  Send automated weekly or monthly client reports with branded links.
                </p>
              </div>
              <ToneBadge tone="warning">{schedules.length} schedules</ToneBadge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
              <ActionButton variant="primary" disabled={creatingSchedule} onClick={handleCreateSchedule}>
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
                Monitor cadence, next send times, and pause delivery when a client no longer needs
                updates.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--ds-gray-900)]" />
              </div>
            ) : schedules.length === 0 ? (
              <div className={emptyStateClassName}>
                No recurring report schedules yet.
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={insetSurfaceClassName}
                  >
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

"use client";

import AtlassianButton from "@atlaskit/button/new";
import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
import { useAuth } from "@clerk/nextjs";
import {
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
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { useRole } from "@/hooks/useRole";
import { useWorkspace } from "@/context/WorkspaceContext";
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
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <ProtectedPageHeader
        title="Client Reports"
        description="Create client-ready report links, email branded recaps, and automate recurring delivery."
        icon={<Globe2 className="h-4 w-4" />}
        actions={
          <AtlassianButton appearance="subtle" isDisabled={refreshing || loading} onClick={refresh}>
            <span className="inline-flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </span>
          </AtlassianButton>
        }
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
        {!canExportClientReports && (
          <SectionMessage appearance="warning" title="Client reporting is restricted">
            <p className="text-sm">
              Only workspaces with the client-report export capability can create branded report
              links or recurring deliveries.
            </p>
          </SectionMessage>
        )}

        {error && (
          <SectionMessage appearance="error" title="Client reports failed to load">
            <p className="text-sm">{error}</p>
          </SectionMessage>
        )}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-[0_1px_2px_rgb(0 0 0 / 0.08)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Quick Share
                </p>
                <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                  Generate a branded report link instantly. Add a recipient email to deliver it
                  directly from SocialRaven.
                </p>
              </div>
              <Lozenge appearance="new">{links.length} links</Lozenge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Report title</span>
                <input
                  value={linkTitle}
                  onChange={(event) => setLinkTitle(event.target.value)}
                  placeholder={`${activeWorkspace?.name ?? "Workspace"} performance report`}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Reporting window</span>
                <select
                  value={linkReportDays}
                  onChange={(event) => setLinkReportDays(Number(event.target.value))}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                >
                  {REPORT_DAY_OPTIONS.map((days) => (
                    <option key={days} value={days}>
                      Last {days} days
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Client label</span>
                <input
                  value={linkClientLabel}
                  onChange={(event) => setLinkClientLabel(event.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Agency label</span>
                <input
                  value={linkAgencyLabel}
                  onChange={(event) => setLinkAgencyLabel(event.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Template</span>
                <select
                  value={linkTemplate}
                  onChange={(event) => setLinkTemplate(event.target.value as ClientReportTemplate)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                >
                  {TEMPLATE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[hsl(var(--foreground-subtle))]">
                  {TEMPLATE_OPTIONS.find((option) => option.value === linkTemplate)?.description}
                </p>
              </label>
              <div className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Link expiry</span>
                <div className="flex flex-wrap gap-2">
                  {LINK_EXPIRY_OPTIONS.map((option) => (
                    <button
                      key={option.hours}
                      type="button"
                      onClick={() => setLinkExpiryHours(option.hours)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        linkExpiryHours === option.hours
                          ? "border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Recipient name</span>
                <input
                  value={linkRecipientName}
                  onChange={(event) => setLinkRecipientName(event.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Recipient email</span>
                <input
                  value={linkRecipientEmail}
                  onChange={(event) => setLinkRecipientEmail(event.target.value)}
                  placeholder="Optional"
                  type="email"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                />
              </label>
            </div>

            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">Commentary block</span>
              <textarea
                value={linkCommentary}
                onChange={(event) => setLinkCommentary(event.target.value)}
                rows={4}
                placeholder="Optional narrative for the client-facing cover note..."
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
                {linkRecipientEmail.trim() ? "Email delivery enabled" : "Copy link after creation"}
              </p>
              <AtlassianButton appearance="primary" isDisabled={creatingLink} onClick={handleCreateLink}>
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
              </AtlassianButton>
            </div>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-[0_1px_2px_rgb(0 0 0 / 0.08)]">
            <div className="mb-5 space-y-1">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Active Links
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Share live report URLs or revoke them when a client handoff ends.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--foreground-muted))]" />
              </div>
            ) : links.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-4 py-8 text-center text-sm text-[hsl(var(--foreground-muted))]">
                No report links yet.
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                            {link.reportTitle}
                          </p>
                          <Lozenge appearance={link.active ? "success" : "removed"}>
                            {link.active ? "Active" : "Expired"}
                          </Lozenge>
                        </div>
                        <p className="text-xs text-[hsl(var(--foreground-subtle))]">
                          {link.clientLabel || activeWorkspace?.name} · {link.reportDays}d · {link.templateType.replaceAll("_", " ")}
                        </p>
                        <p className="text-xs text-[hsl(var(--foreground-subtle))]">
                          Created {formatTimestamp(link.createdAt)} · Expires {formatTimestamp(link.expiresAt)}
                        </p>
                        {link.recipientEmail && (
                          <p className="text-xs text-[hsl(var(--foreground-subtle))]">
                            Delivered to {link.recipientEmail}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <AtlassianButton
                          appearance="subtle"
                          isDisabled={!link.active}
                          onClick={() => downloadPdf(link.token)}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            <span>PDF</span>
                          </span>
                        </AtlassianButton>
                        <AtlassianButton appearance="subtle" onClick={() => handleCopyLink(link)}>
                          <span className="inline-flex items-center gap-2">
                            <Copy className="h-4 w-4" />
                            <span>Copy</span>
                          </span>
                        </AtlassianButton>
                        <AtlassianButton
                          appearance="subtle"
                          isDisabled={!link.active || actingLinkId === link.id}
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
                        </AtlassianButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-[0_1px_2px_rgb(0 0 0 / 0.08)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Recurring Delivery
                </p>
                <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                  Send automated weekly or monthly client reports with branded links.
                </p>
              </div>
              <Lozenge appearance="inprogress">{schedules.length} schedules</Lozenge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Report title</span>
                <input
                  value={scheduleTitle}
                  onChange={(event) => setScheduleTitle(event.target.value)}
                  placeholder="Monthly client performance review"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Recipient email</span>
                <input
                  value={scheduleRecipientEmail}
                  onChange={(event) => setScheduleRecipientEmail(event.target.value)}
                  type="email"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Recipient name</span>
                <input
                  value={scheduleRecipientName}
                  onChange={(event) => setScheduleRecipientName(event.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Cadence</span>
                <select
                  value={scheduleCadence}
                  onChange={(event) => setScheduleCadence(event.target.value as ClientReportCadence)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Client label</span>
                <input
                  value={scheduleClientLabel}
                  onChange={(event) => setScheduleClientLabel(event.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Agency label</span>
                <input
                  value={scheduleAgencyLabel}
                  onChange={(event) => setScheduleAgencyLabel(event.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Template</span>
                <select
                  value={scheduleTemplate}
                  onChange={(event) => setScheduleTemplate(event.target.value as ClientReportTemplate)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                >
                  {TEMPLATE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Window</span>
                <select
                  value={scheduleReportDays}
                  onChange={(event) => setScheduleReportDays(Number(event.target.value))}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                >
                  {REPORT_DAY_OPTIONS.map((days) => (
                    <option key={days} value={days}>
                      {days} days
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Hour UTC</span>
                <select
                  value={scheduleHourUtc}
                  onChange={(event) => setScheduleHourUtc(Number(event.target.value))}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
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
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">Weekly send day</span>
                  <select
                    value={scheduleDayOfWeek}
                    onChange={(event) => setScheduleDayOfWeek(Number(event.target.value))}
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
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
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">Monthly send day</span>
                  <input
                    value={scheduleDayOfMonth}
                    onChange={(event) => setScheduleDayOfMonth(Number(event.target.value))}
                    type="number"
                    min={1}
                    max={28}
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
                  />
                </label>
              )}
              <label className="space-y-2">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">Shared link lifetime</span>
                <select
                  value={scheduleShareExpiryHours}
                  onChange={(event) => setScheduleShareExpiryHours(Number(event.target.value))}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
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
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">Commentary block</span>
              <textarea
                value={scheduleCommentary}
                onChange={(event) => setScheduleCommentary(event.target.value)}
                rows={4}
                placeholder="Optional cover note for recurring report emails..."
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))]"
              />
            </label>

            <div className="mt-5 flex justify-end">
              <AtlassianButton appearance="primary" isDisabled={creatingSchedule} onClick={handleCreateSchedule}>
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
              </AtlassianButton>
            </div>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-[0_1px_2px_rgb(0 0 0 / 0.08)]">
            <div className="mb-5 space-y-1">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Active Schedules
              </p>
              <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                Monitor cadence, next send times, and pause delivery when a client no longer needs
                updates.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--foreground-muted))]" />
              </div>
            ) : schedules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-4 py-8 text-center text-sm text-[hsl(var(--foreground-muted))]">
                No recurring report schedules yet.
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                            {schedule.reportTitle}
                          </p>
                          <Lozenge appearance={schedule.active ? "success" : "removed"}>
                            {schedule.active ? "Active" : "Paused"}
                          </Lozenge>
                        </div>
                        <p className="text-xs text-[hsl(var(--foreground-subtle))]">
                          {schedule.recipientEmail} · {schedule.cadence.toLowerCase()} · {schedule.reportDays}d
                        </p>
                        <p className="text-xs text-[hsl(var(--foreground-subtle))]">
                          Next send {formatTimestamp(schedule.nextSendAt)}
                        </p>
                        <p className="text-xs text-[hsl(var(--foreground-subtle))]">
                          Last sent {schedule.lastSentAt ? formatTimestamp(schedule.lastSentAt) : "Not sent yet"}
                        </p>
                      </div>

                      <AtlassianButton
                        appearance="subtle"
                        isDisabled={!schedule.active || actingScheduleId === schedule.id}
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
                      </AtlassianButton>
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

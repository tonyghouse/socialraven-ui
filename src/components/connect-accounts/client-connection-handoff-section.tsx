"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Copy,
  Link2,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import type {
  ClientConnectPlatform,
  ClientConnectionSession,
} from "@/model/ClientConnection";
import {
  createClientConnectionSessionApi,
  getClientConnectionSessionsApi,
  revokeClientConnectionSessionApi,
} from "@/service/clientConnections";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  ConnectBadge,
  ConnectButton,
  connectBodyClassName,
  connectEmptyStateClassName,
  connectEyebrowClassName,
  connectInputClassName,
  connectInsetCardClassName,
  connectSectionHeaderClassName,
  connectSoftCardClassName,
  connectSurfaceClassName,
  connectTextareaClassName,
  connectTitleClassName,
} from "@/components/connect-accounts/connect-accounts-primitives";

const PLATFORM_OPTIONS: Array<{
  value: ClientConnectPlatform;
  label: string;
}> = [
  { value: "x", label: "X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
];

const EXPIRY_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
] as const;

const selectionChipClassName =
  "rounded-full border px-3 py-1.5 text-label-14 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";

function formatTimestamp(value: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function clientConnectUrl(token: string) {
  return `${window.location.origin}/client-connect/${token}`;
}

export default function ClientConnectionHandoffSection() {
  const { getToken } = useAuth();
  const { activeWorkspace } = useWorkspace();

  const [sessions, setSessions] = useState<ClientConnectionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actingSessionId, setActingSessionId] = useState<string | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<ClientConnectionSession | null>(null);

  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [clientLabel, setClientLabel] = useState("");
  const [agencyLabel, setAgencyLabel] = useState("");
  const [message, setMessage] = useState(
    "Use this secure handoff to connect the social accounts your agency will manage inside this workspace."
  );
  const [allowedPlatforms, setAllowedPlatforms] = useState<ClientConnectPlatform[]>(
    PLATFORM_OPTIONS.map((item) => item.value)
  );
  const [expiryDays, setExpiryDays] = useState<number>(14);

  useEffect(() => {
    if (!activeWorkspace) return;
    setClientLabel((current) => current || activeWorkspace.name);
    setAgencyLabel(
      (current) => current || activeWorkspace.companyName || activeWorkspace.name
    );
  }, [activeWorkspace]);

  const sessionCountLabel = useMemo(() => {
    if (sessions.length === 1) return "1 active handoff track";
    return `${sessions.length} handoff tracks`;
  }, [sessions.length]);

  const loadSessions = useCallback(async () => {
    const next = await getClientConnectionSessionsApi(getToken);
    setSessions(next);
  }, [getToken]);

  useEffect(() => {
    let ignore = false;

    async function init() {
      try {
        setLoading(true);
        await loadSessions();
      } catch (err: any) {
        if (!ignore) {
          toast.error(err?.message ?? "Failed to load client handoffs.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void init();
    return () => {
      ignore = true;
    };
  }, [loadSessions]);

  async function refresh() {
    try {
      setRefreshing(true);
      await loadSessions();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to refresh client handoffs.");
    } finally {
      setRefreshing(false);
    }
  }

  function togglePlatform(platform: ClientConnectPlatform) {
    setAllowedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    );
  }

  async function handleCreate() {
    if (!recipientEmail.trim()) {
      toast.error("Recipient email is required.");
      return;
    }
    if (allowedPlatforms.length === 0) {
      toast.error("Select at least one platform.");
      return;
    }

    try {
      setCreating(true);
      const expiresAt = new Date(
        Date.now() + expiryDays * 24 * 60 * 60 * 1000
      ).toISOString();
      const created = await createClientConnectionSessionApi(getToken, {
        recipientName: recipientName || undefined,
        recipientEmail: recipientEmail.trim(),
        clientLabel: clientLabel || undefined,
        agencyLabel: agencyLabel || undefined,
        message: message || undefined,
        allowedPlatforms,
        expiresAt,
      });
      setSessions((current) => [created, ...current]);
      await navigator.clipboard.writeText(clientConnectUrl(created.token));
      toast.success("Client handoff created and copied.");
      setRecipientName("");
      setRecipientEmail("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create client handoff.");
    } finally {
      setCreating(false);
    }
  }

  async function handleCopy(session: ClientConnectionSession) {
    try {
      await navigator.clipboard.writeText(clientConnectUrl(session.token));
      toast.success("Client handoff link copied.");
    } catch {
      toast.error("Failed to copy client handoff link.");
    }
  }

  async function handleRevoke(sessionId: string) {
    try {
      setActingSessionId(sessionId);
      await revokeClientConnectionSessionApi(getToken, sessionId);
      await loadSessions();
      toast.success("Client handoff revoked.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to revoke client handoff.");
    } finally {
      setActingSessionId(null);
      setPendingRevoke(null);
    }
  }

  return (
    <>
      <ConfirmDialog
        open={!!pendingRevoke}
        description={
          pendingRevoke
            ? `Revoke the secure handoff for ${pendingRevoke.recipientEmail}? Any open client link will stop working immediately.`
            : ""
        }
        confirmLabel="Revoke"
        destructive
        onConfirm={() => pendingRevoke && handleRevoke(pendingRevoke.id)}
        onCancel={() => setPendingRevoke(null)}
      />

      <section className={connectSurfaceClassName}>
        <div className={cn(connectSectionHeaderClassName, "py-4")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--ds-plum-700)]" />
                <p className={connectTitleClassName}>Secure client connection handoff</p>
              </div>
              <p className={cn("max-w-2xl", connectBodyClassName)}>
                Send a branded handoff page to the client contact so they can connect
                their own channels without sharing passwords or entering the main
                workspace.
              </p>
            </div>

            <ConnectButton
              compact
              onClick={refresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </ConnectButton>
          </div>
        </div>

        <div className="grid gap-6 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className={cn(connectInsetCardClassName, "space-y-4 p-4")}>
            <div className="space-y-1">
              <p className={connectTitleClassName}>Create client handoff</p>
              <p className={connectBodyClassName}>
                Tie the handoff to a specific client email so reconnects remain
                attributable and controlled.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className={connectEyebrowClassName}>
                  Recipient name
                </span>
                <input
                  value={recipientName}
                  onChange={(event) => setRecipientName(event.target.value)}
                  className={connectInputClassName}
                  placeholder="Ava Client"
                />
              </label>

              <label className="space-y-1.5">
                <span className={connectEyebrowClassName}>
                  Recipient email
                </span>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  className={connectInputClassName}
                  placeholder="client@example.com"
                />
              </label>

              <label className="space-y-1.5">
                <span className={connectEyebrowClassName}>
                  Client label
                </span>
                <input
                  value={clientLabel}
                  onChange={(event) => setClientLabel(event.target.value)}
                  className={connectInputClassName}
                />
              </label>

              <label className="space-y-1.5">
                <span className={connectEyebrowClassName}>
                  Agency label
                </span>
                <input
                  value={agencyLabel}
                  onChange={(event) => setAgencyLabel(event.target.value)}
                  className={connectInputClassName}
                />
              </label>
            </div>

            <label className="space-y-1.5">
              <span className={connectEyebrowClassName}>
                Message
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                className={connectTextareaClassName}
              />
            </label>

            <div className="space-y-2">
              <p className={connectEyebrowClassName}>
                Allowed platforms
              </p>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map((platform) => {
                  const selected = allowedPlatforms.includes(platform.value);
                  return (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => togglePlatform(platform.value)}
                      className={cn(
                        selectionChipClassName,
                        selected
                          ? "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
                          : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
                      )}
                    >
                      {platform.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className={connectEyebrowClassName}>
                Link expiry
              </p>
              <div className="flex flex-wrap gap-2">
                {EXPIRY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setExpiryDays(option.value)}
                    className={cn(
                      selectionChipClassName,
                      expiryDays === option.value
                        ? "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
                        : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 py-3 text-label-14 text-[var(--ds-gray-900)]">
              The handoff page is restricted to the invited email and records who
              connected or reconnected each account.
            </div>

            <ConnectButton
              tone="primary"
              onClick={handleCreate}
              disabled={creating}
              className="w-full"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating handoff
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  Create and Copy Handoff Link
                </>
              )}
            </ConnectButton>
          </div>

          <div className={cn(connectInsetCardClassName, "space-y-4 p-4")}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className={connectTitleClassName}>Live handoff links</p>
                <p className={connectBodyClassName}>
                  {sessionCountLabel}. Track last access, connection activity, and
                  revoke any link immediately.
                </p>
              </div>
              <ConnectBadge>
                {sessions.filter((item) => item.active).length} active
              </ConnectBadge>
            </div>

            {loading ? (
              <div className="flex min-h-[13.75rem] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--ds-gray-900)]" />
              </div>
            ) : sessions.length === 0 ? (
              <div className={cn(connectEmptyStateClassName, "py-10")}>
                <p className={connectTitleClassName}>
                  No handoff links yet
                </p>
                <p className={cn("mt-2", connectBodyClassName)}>
                  Create the first secure client handoff to keep account connection
                  out of email threads and password sharing.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <article
                    key={session.id}
                    className={cn(connectSoftCardClassName, "p-4")}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={connectTitleClassName}>
                              {session.clientLabel || activeWorkspace?.name}
                            </p>
                            <ConnectBadge tone={session.active ? "success" : "danger"}>
                              {session.active ? "Active" : "Closed"}
                            </ConnectBadge>
                            <ConnectBadge>
                              {session.connectionCount} events
                            </ConnectBadge>
                          </div>

                          <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", connectBodyClassName)}>
                            <span className="inline-flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5" />
                              {session.recipientEmail}
                            </span>
                            {session.recipientName ? (
                              <span className="inline-flex items-center gap-1.5">
                                <UserRound className="h-3.5 w-3.5" />
                                {session.recipientName}
                              </span>
                              ) : null}
                          </div>

                          <p className={connectBodyClassName}>
                            Expires {formatTimestamp(session.expiresAt)}. Last opened{" "}
                            {formatTimestamp(session.lastAccessedAt)}.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <ConnectButton compact onClick={() => handleCopy(session)}>
                            <Copy className="h-4 w-4" />
                            Copy link
                          </ConnectButton>
                          <ConnectButton
                            compact
                            tone="danger"
                            onClick={() => setPendingRevoke(session)}
                            disabled={!!session.revokedAt || actingSessionId === session.id}
                          >
                            <Trash2 className="h-4 w-4" />
                            Revoke
                          </ConnectButton>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {session.allowedPlatforms.map((platform) => (
                          <ConnectBadge key={platform}>
                            {platform}
                          </ConnectBadge>
                        ))}
                      </div>

                      {session.message ? (
                        <p className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-3 text-label-14 leading-6 text-[var(--ds-gray-900)]">
                          {session.message}
                        </p>
                      ) : null}

                      {session.recentActivity.length > 0 ? (
                        <div className="space-y-2">
                          <p className={connectEyebrowClassName}>
                            Recent activity
                          </p>
                          <div className="space-y-2">
                            {session.recentActivity.map((activity) => (
                              <div
                                key={`${session.id}-${activity.platform}-${activity.createdAt}`}
                                className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-3 text-label-14"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <ConnectBadge>
                                    {activity.platform}
                                  </ConnectBadge>
                                  <ConnectBadge tone={activity.eventType === "RECONNECTED" ? "warning" : "info"}>
                                    {activity.eventType === "RECONNECTED"
                                      ? "Reconnected"
                                      : "Connected"}
                                  </ConnectBadge>
                                </div>
                                <p className="mt-2 text-label-14 text-[var(--ds-gray-1000)]">
                                  {activity.actorDisplayName} connected{" "}
                                  <span className="font-medium">{activity.providerUserId}</span>
                                </p>
                                <p className="mt-1 text-copy-12 text-[var(--ds-gray-900)]">
                                  {activity.actorEmail} · {formatTimestamp(activity.createdAt)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-5 text-label-14 text-[var(--ds-gray-900)]">
                          No client activity yet. Once the client connects or reconnects an
                          account, the audit trail will show up here.
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

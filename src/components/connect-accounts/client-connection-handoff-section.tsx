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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

      <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-sm">
        <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--accent))]" />
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Secure client connection handoff
                </p>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                Send a branded handoff page to the client contact so they can connect
                their own channels without sharing passwords or entering the main
                workspace.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={refreshing}
              className="rounded-lg"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-6 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="space-y-4 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Create client handoff
              </p>
              <p className="text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                Tie the handoff to a specific client email so reconnects remain
                attributable and controlled.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
                  Recipient name
                </span>
                <input
                  value={recipientName}
                  onChange={(event) => setRecipientName(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-3 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))]"
                  placeholder="Ava Client"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
                  Recipient email
                </span>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-3 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))]"
                  placeholder="client@example.com"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
                  Client label
                </span>
                <input
                  value={clientLabel}
                  onChange={(event) => setClientLabel(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-3 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))]"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
                  Agency label
                </span>
                <input
                  value={agencyLabel}
                  onChange={(event) => setAgencyLabel(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-3 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))]"
                />
              </label>
            </div>

            <label className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
                Message
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                className="w-full rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-3 py-2.5 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))]"
              />
            </label>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
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
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        selected
                          ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent-soft))] text-[hsl(var(--foreground))]"
                          : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))]"
                      }`}
                    >
                      {platform.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
                Link expiry
              </p>
              <div className="flex flex-wrap gap-2">
                {EXPIRY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setExpiryDays(option.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      expiryDays === option.value
                        ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent-soft))] text-[hsl(var(--foreground))]"
                        : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-3 py-3 text-sm text-[hsl(var(--foreground-muted))]">
              The handoff page is restricted to the invited email and records who
              connected or reconnected each account.
            </div>

            <Button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="w-full rounded-lg"
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
            </Button>
          </div>

          <div className="space-y-4 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Live handoff links
                </p>
                <p className="text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                  {sessionCountLabel}. Track last access, connection activity, and
                  revoke any link immediately.
                </p>
              </div>
              <Badge variant="outline" className="rounded-full">
                {sessions.filter((item) => item.active).length} active
              </Badge>
            </div>

            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--foreground-muted))]" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[hsl(var(--border-subtle))] px-4 py-10 text-center">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  No handoff links yet
                </p>
                <p className="mt-2 text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                  Create the first secure client handoff to keep account connection
                  out of email threads and password sharing.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <article
                    key={session.id}
                    className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] p-4"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                              {session.clientLabel || activeWorkspace?.name}
                            </p>
                            <Badge
                              variant={session.active ? "default" : "secondary"}
                              className="rounded-full"
                            >
                              {session.active ? "Active" : "Closed"}
                            </Badge>
                            <Badge variant="outline" className="rounded-full">
                              {session.connectionCount} events
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[hsl(var(--foreground-muted))]">
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

                          <p className="text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                            Expires {formatTimestamp(session.expiresAt)}. Last opened{" "}
                            {formatTimestamp(session.lastAccessedAt)}.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => handleCopy(session)}
                          >
                            <Copy className="h-4 w-4" />
                            Copy link
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-[hsl(var(--destructive))]"
                            onClick={() => setPendingRevoke(session)}
                            disabled={!!session.revokedAt || actingSessionId === session.id}
                          >
                            <Trash2 className="h-4 w-4" />
                            Revoke
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {session.allowedPlatforms.map((platform) => (
                          <Badge key={platform} variant="secondary" className="rounded-full">
                            {platform}
                          </Badge>
                        ))}
                      </div>

                      {session.message ? (
                        <p className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-3 py-3 text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                          {session.message}
                        </p>
                      ) : null}

                      {session.recentActivity.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
                            Recent activity
                          </p>
                          <div className="space-y-2">
                            {session.recentActivity.map((activity) => (
                              <div
                                key={`${session.id}-${activity.platform}-${activity.createdAt}`}
                                className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-3 py-3 text-sm"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="outline" className="rounded-full">
                                    {activity.platform}
                                  </Badge>
                                  <Badge variant="secondary" className="rounded-full">
                                    {activity.eventType === "RECONNECTED"
                                      ? "Reconnected"
                                      : "Connected"}
                                  </Badge>
                                </div>
                                <p className="mt-2 text-[hsl(var(--foreground))]">
                                  {activity.actorDisplayName} connected{" "}
                                  <span className="font-medium">{activity.providerUserId}</span>
                                </p>
                                <p className="mt-1 text-[hsl(var(--foreground-muted))]">
                                  {activity.actorEmail} · {formatTimestamp(activity.createdAt)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-[hsl(var(--border-subtle))] px-3 py-5 text-sm text-[hsl(var(--foreground-muted))]">
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

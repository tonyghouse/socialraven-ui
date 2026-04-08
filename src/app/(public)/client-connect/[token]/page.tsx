"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Camera,
  CalendarClock,
  CheckCircle2,
  Globe2,
  Loader2,
  PlayCircle,
  ShieldCheck,
  Tv2,
  UserRound,
} from "lucide-react";
import {
  PublicCard,
  PublicHero,
  PublicInsetCard,
  PublicPageShell,
  PublicSection,
} from "@/components/public/public-layout";
import {
  PublicLozenge,
  PublicPrimaryButton,
  PublicSectionMessage,
} from "@/components/public/public-site-primitives";
import type {
  ClientConnectPlatform,
  PublicClientConnectionSession,
} from "@/model/ClientConnection";
import { getPublicClientConnectionSessionApi } from "@/service/clientConnections";

function formatTimestamp(value: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function platformIcon(platform: ClientConnectPlatform) {
  switch (platform) {
    case "linkedin":
      return Globe2;
    case "youtube":
      return PlayCircle;
    case "instagram":
      return Camera;
    case "facebook":
      return Tv2;
    case "x":
    default:
      return ShieldCheck;
  }
}

function platformLabel(platform: ClientConnectPlatform) {
  switch (platform) {
    case "x":
      return "X";
    case "linkedin":
      return "LinkedIn";
    case "youtube":
      return "YouTube";
    case "instagram":
      return "Instagram";
    case "facebook":
      return "Facebook";
  }
}

export default function PublicClientConnectPage() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<PublicClientConnectionSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [redirectingPlatform, setRedirectingPlatform] =
    useState<ClientConnectPlatform | null>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("clientConnectName");
    const savedEmail = localStorage.getItem("clientConnectEmail");
    if (savedName) setClientName(savedName);
    if (savedEmail) setClientEmail(savedEmail);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const next = await getPublicClientConnectionSessionApi(token);
        if (!ignore) {
          setSession(next);
          setClientName((current) => current || next.recipientName || "");
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.message ?? "Failed to load the client connection handoff.");
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

  const statusMessage = useMemo(() => {
    const status = searchParams.get("status");
    const provider = searchParams.get("provider");
    const reason = searchParams.get("reason");
    if (!status || !provider) return null;
    const label = platformLabel(provider as ClientConnectPlatform);
    if (status === "success") {
      return {
        tone: "success" as const,
        title: `${label} connected`,
        body: `The account handoff completed successfully. You can connect another approved platform from this page if needed.`,
      };
    }
    return {
      tone: "warning" as const,
      title: `${label} connection failed`,
      body: reason || "The provider did not complete the connection. Try again from this page.",
    };
  }, [searchParams]);

  function persistIdentity() {
    localStorage.setItem("clientConnectName", clientName.trim());
    localStorage.setItem("clientConnectEmail", clientEmail.trim().toLowerCase());
  }

  function validateIdentity() {
    if (!clientName.trim() || !clientEmail.trim()) {
      setError("Enter your name and email before starting the secure handoff.");
      return false;
    }
    return true;
  }

  function beginConnection(platform: ClientConnectPlatform) {
    if (!validateIdentity()) return;
    persistIdentity();
    setRedirectingPlatform(platform);
    const params = new URLSearchParams({
      token,
      name: clientName.trim(),
      email: clientEmail.trim().toLowerCase(),
    });
    window.location.href = `/api/client-connect/${platform}?${params.toString()}`;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ds-background-100)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--ds-gray-900)]" />
      </div>
    );
  }

  if (error && !session) {
    return (
      <PublicPageShell>
        <div className="mx-auto max-w-xl px-6 py-24">
          <PublicCard className="p-8">
            <div className="mb-4 flex justify-center">
              <AlertCircle className="h-12 w-12 text-[var(--ds-red-600)]" />
            </div>
            <h1 className="text-center text-heading-24 text-[var(--ds-gray-1000)]">
              Client handoff unavailable
            </h1>
            <p className="mt-3 text-center text-copy-14 text-[var(--ds-gray-900)]">
              {error}
            </p>
          </PublicCard>
        </div>
      </PublicPageShell>
    );
  }

  if (!session) {
    return null;
  }

  const restrictionEmail = session.recipientEmail;

  return (
    <PublicPageShell>
      <PublicHero
        eyebrow="Secure Client Account Connection"
        title={session.clientLabel}
        description={session.message}
        topSlot={
          <div className="flex flex-wrap items-center gap-3">
            {session.logoUrl ? (
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={session.logoUrl}
                  alt={session.agencyLabel}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : null}
            <div className="space-y-1">
              <p className="text-label-14 text-[var(--ds-gray-1000)]">
                {session.agencyLabel}
              </p>
              <p className="text-copy-13 text-[var(--ds-gray-900)]">
                Connecting channels for {session.workspaceName}
              </p>
            </div>
          </div>
        }
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <PublicLozenge appearance={session.canConnect ? "success" : "removed"} isBold>
              {session.canConnect ? "Open" : "Closed"}
            </PublicLozenge>
            <PublicLozenge appearance="new">
              Expires {formatTimestamp(session.linkExpiresAt)}
            </PublicLozenge>
            <PublicLozenge appearance="default">{session.companyName}</PublicLozenge>
          </div>
        }
        aside={
          <PublicCard className="p-5">
            <div className="space-y-4">
              <div>
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  What this does
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-1000)]">
                  Connect approved social accounts directly to SocialRaven without
                  sharing passwords with the agency team.
                </p>
              </div>

              <div>
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Invited contact
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-1000)]">
                  {session.recipientName || "Client contact"}
                  {restrictionEmail ? ` · ${restrictionEmail}` : ""}
                </p>
              </div>

              <div>
                <p className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Audit trail
                </p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-1000)]">
                  Every connection and reconnection is recorded with the contact
                  identity used on this page.
                </p>
              </div>
            </div>
          </PublicCard>
        }
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-16">
        {statusMessage ? (
          <PublicSectionMessage
            appearance={statusMessage.tone === "success" ? "success" : "warning"}
            title={statusMessage.title}
          >
            <p>{statusMessage.body}</p>
          </PublicSectionMessage>
        ) : null}

        {error ? (
          <PublicSectionMessage appearance="error" title="Identity required">
            <p>{error}</p>
          </PublicSectionMessage>
        ) : null}

        {(session.linkExpired || session.linkRevoked) && (
          <PublicSectionMessage
            appearance="warning"
            title={session.linkRevoked ? "This handoff has been revoked" : "This handoff has expired"}
          >
            <p>
              The agency team needs to issue a fresh secure handoff link before any
              new account connection can continue.
            </p>
          </PublicSectionMessage>
        )}

        <PublicSection
          title="Confirm your identity"
          description="Use the invited client contact details so the connection log remains accurate."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <PublicInsetCard className="p-5">
              <label className="space-y-1.5">
                <span className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Your name
                </span>
                <input
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-copy-14 text-[var(--ds-gray-1000)] outline-none focus:border-[var(--ds-blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2"
                  placeholder="Ava Client"
                />
              </label>
            </PublicInsetCard>

            <PublicInsetCard className="p-5">
              <label className="space-y-1.5">
                <span className="text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                  Your email
                </span>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(event) => setClientEmail(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-copy-14 text-[var(--ds-gray-1000)] outline-none focus:border-[var(--ds-blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2"
                  placeholder={session.recipientEmail || "client@example.com"}
                />
              </label>
            </PublicInsetCard>
          </div>
        </PublicSection>

        <PublicSection
          title="Connect approved platforms"
          description="Choose one of the approved channels below. If a channel was already linked before, the action will run as a secure reconnect."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {session.allowedPlatforms.map((platform) => {
              const Icon = platformIcon(platform);
              const latest = session.recentActivity.find((item) => item.platform === platform);
              return (
                <PublicInsetCard key={platform} className="flex h-full flex-col justify-between p-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-blue-600)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      {latest ? (
                        <PublicLozenge appearance="success">
                          {latest.eventType === "RECONNECTED" ? "Reconnected" : "Connected"}
                        </PublicLozenge>
                      ) : (
                        <PublicLozenge appearance="default">Ready</PublicLozenge>
                      )}
                    </div>

                    <div>
                      <p className="text-heading-16 text-[var(--ds-gray-1000)]">
                        {platformLabel(platform)}
                      </p>
                      <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
                        {latest
                          ? `${latest.providerUserId} was last updated on ${formatTimestamp(latest.createdAt)}.`
                          : `Start a secure ${platformLabel(platform)} connection without exposing workspace settings or other agency data.`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <PublicPrimaryButton
                      onClick={() => beginConnection(platform)}
                      disabled={!session.canConnect || redirectingPlatform === platform}
                    >
                      <span className="inline-flex items-center gap-2">
                        {redirectingPlatform === platform ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        <span>{latest ? "Reconnect" : "Connect"} {platformLabel(platform)}</span>
                      </span>
                    </PublicPrimaryButton>
                  </div>
                </PublicInsetCard>
              );
            })}
          </div>
        </PublicSection>

        <PublicSection
          title="Recent connection activity"
          description="Use this as a quick reference for which client identity last connected a channel from this handoff."
        >
          {session.recentActivity.length === 0 ? (
            <PublicInsetCard className="p-8">
              <p className="text-copy-13 text-[var(--ds-gray-900)]">
                No channels have been connected through this secure handoff yet.
              </p>
            </PublicInsetCard>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {session.recentActivity.map((activity) => (
                <PublicInsetCard
                  key={`${activity.platform}-${activity.createdAt}`}
                  className="p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <PublicLozenge appearance="default">
                      {platformLabel(activity.platform)}
                    </PublicLozenge>
                    <PublicLozenge appearance="success">
                      {activity.eventType === "RECONNECTED" ? "Reconnected" : "Connected"}
                    </PublicLozenge>
                  </div>
                  <p className="mt-4 text-copy-14 text-[var(--ds-gray-1000)]">
                    <span className="font-semibold">{activity.actorDisplayName}</span> connected{" "}
                    <span className="font-semibold">{activity.providerUserId}</span>.
                  </p>
                  <p className="mt-2 text-copy-13 text-[var(--ds-gray-900)]">
                    {activity.actorEmail}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-copy-13 text-[var(--ds-gray-900)]">
                    <CalendarClock className="h-4 w-4" />
                    <span>{formatTimestamp(activity.createdAt)}</span>
                  </div>
                </PublicInsetCard>
              ))}
            </div>
          )}
        </PublicSection>
      </div>
    </PublicPageShell>
  );
}

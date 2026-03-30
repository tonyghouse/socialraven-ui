"use client";

import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { ArrowRight, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function oauthUrl(base: string) {
  if (typeof window === "undefined") return base;
  const workspaceId = localStorage.getItem("activeWorkspaceId");
  return workspaceId ? `${base}?workspaceId=${workspaceId}` : base;
}

type Props = {
  platformKey: string;
  label: string;
  Icon: any;
  accent?: string;
  connectHref?: string;
  accounts: ConnectedAccount[];
  comingSoon?: boolean;
  onRemove?: (acc: ConnectedAccount) => void;
  onReconnect?: (acc: ConnectedAccount) => void;
  canWrite?: boolean;
};

const needsProxyDomains = ["linkedin.com", "licdn.com"];

const getImageUrl = (url?: string | null) => {
  if (!url) return null;
  try {
    const lower = url.toLowerCase();
    const requiresProxy = needsProxyDomains.some((d) => lower.includes(d));
    if (requiresProxy) {
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }
    return url;
  } catch {
    return url;
  }
};

const getInitials = (username?: string) =>
  !username
    ? "?"
    : username
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

export default function ConnectedAccountsColumn({
  label,
  Icon,
  accent,
  connectHref = "#",
  accounts = [],
  comingSoon,
  onRemove,
  onReconnect,
  canWrite = true,
}: Props) {
  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] shadow-sm">
      <div className="flex items-center gap-3 border-b border-[hsl(var(--border-subtle))] px-4 py-4 sm:px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-sm">
          <Icon
            size={18}
            className={accent ?? "text-[hsl(var(--foreground))]"}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-[hsl(var(--foreground))]">{label}</div>
          <div className="mt-0.5 text-xs text-[hsl(var(--foreground-muted))]">
            {comingSoon
              ? "Coming soon"
              : accounts.length === 0
              ? "No accounts connected"
              : `${accounts.length} account${accounts.length !== 1 ? "s" : ""} connected`}
          </div>
        </div>
        {comingSoon ? (
          <Badge
            variant="outline"
            className="shrink-0 rounded-md border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--foreground-muted))]"
          >
            Soon
          </Badge>
        ) : accounts.length > 0 ? (
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-2 text-[11px] font-semibold text-[hsl(var(--foreground-muted))]">
            {accounts.length}
          </span>
        ) : null}
      </div>

      <div className="flex-1 px-4 py-4 sm:px-5">
        {comingSoon ? (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-5 text-center">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Coming soon
            </p>
            <p className="mt-1 text-sm leading-6 text-[hsl(var(--foreground-muted))]">
              {label} support is on the roadmap.
            </p>
          </div>
        ) : accounts.length === 0 ? (
          canWrite ? (
            <button
              onClick={() => { window.location.href = oauthUrl(connectHref); }}
              className="group flex w-full items-center gap-3 rounded-xl border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-4 text-left transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-[hsl(var(--accent))]/35 hover:bg-[hsl(var(--background))]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] text-[hsl(var(--foreground-muted))] transition-colors group-hover:text-accent">
                <Plus size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Connect {label}
                </p>
                <p className="mt-1 text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                  Authorize a new account for this channel.
                </p>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 text-[hsl(var(--foreground-subtle))] transition-colors group-hover:text-accent"
              />
            </button>
          ) : (
            <div className="rounded-xl border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-5 text-center">
              <p className="text-sm text-[hsl(var(--foreground-muted))]">
                No accounts connected
              </p>
            </div>
          )
        ) : (
          <div className="space-y-2.5">
            {accounts.map((acc) => (
              <AccountRow
                key={acc.providerUserId}
                acc={acc}
                onRemove={canWrite ? onRemove : undefined}
                onReconnect={canWrite ? onReconnect : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {!comingSoon && accounts.length > 0 && canWrite && (
        <div className="border-t border-[hsl(var(--border-subtle))] px-4 py-3.5 sm:px-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { window.location.href = oauthUrl(connectHref); }}
            className="h-9 rounded-lg border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-3 text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background))] hover:text-accent"
          >
            <Plus size={14} />
            Add another account
          </Button>
        </div>
      )}
    </section>
  );
}

function AccountRow({
  acc,
  onRemove,
  onReconnect,
}: {
  acc: ConnectedAccount;
  onRemove?: (acc: ConnectedAccount) => void;
  onReconnect?: (acc: ConnectedAccount) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const src = getImageUrl(acc.profilePicLink);

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-3.5 py-3 transition-[border-color,background-color] hover:border-[hsl(var(--accent))]/20 hover:bg-[hsl(var(--background))]">
      <Avatar className="h-9 w-9 shrink-0">
        {!imgError && src ? (
          <AvatarImage
            src={src}
            alt={acc.username}
            onError={() => setImgError(true)}
          />
        ) : (
          <AvatarFallback className="bg-accent/10 text-[11px] font-medium text-accent">
            {getInitials(acc.username)}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium leading-tight text-[hsl(var(--foreground))]">
          {acc.username}
        </div>
        <div className="mt-0.5 truncate text-xs capitalize text-[hsl(var(--foreground-muted))]">
          {acc.platform}
        </div>
      </div>

      {(onReconnect || onRemove) && (
        <div className="ml-auto flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          {onReconnect && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onReconnect(acc)}
              aria-label="Reconnect account"
              className="h-8 w-8 rounded-lg text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background))] hover:text-[hsl(var(--foreground))]"
            >
              <RefreshCw size={14} />
            </Button>
          )}
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(acc)}
              aria-label="Remove account"
              className="h-8 w-8 rounded-lg text-[hsl(var(--foreground-muted))] hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

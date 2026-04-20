"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { ArrowRight, Plus, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ConnectBadge,
  ConnectButton,
  connectEmptyStateClassName,
  connectInsetCardClassName,
  connectMetaClassName,
  connectSectionHeaderClassName,
  connectSurfaceClassName,
  connectTitleClassName,
} from "@/components/connect-accounts/connect-accounts-primitives";
import {
  platformAccentColor,
  platformLabel,
  platformSurfaceStyle,
} from "@/components/connect-accounts/platform-meta";

function oauthUrl(base: string) {
  if (typeof window === "undefined") return base;
  const workspaceId = localStorage.getItem("activeWorkspaceId");
  return workspaceId ? `${base}?workspaceId=${workspaceId}` : base;
}

type Props = {
  platformKey: string;
  label: string;
  Icon: any;
  accentColor?: string;
  iconClassName?: string;
  connectHref?: string;
  permissionSummary?: string;
  accounts: ConnectedAccount[];
  comingSoon?: boolean;
  onRemove?: (acc: ConnectedAccount) => void;
  onReconnect?: (acc: ConnectedAccount) => void;
  canWrite?: boolean;
};

const getImageUrl = (url?: string | null) => {
  if (!url) return null;
  try {
    if (url.startsWith("/")) return url;
    const isRemoteUrl = /^https?:\/\//i.test(url);
    return isRemoteUrl ? `/api/proxy-image?url=${encodeURIComponent(url)}` : url;
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
  platformKey,
  label,
  Icon,
  accentColor,
  iconClassName,
  connectHref = "#",
  permissionSummary,
  accounts = [],
  comingSoon,
  onRemove,
  onReconnect,
  canWrite = true,
}: Props) {
  return (
    <section className={cn(connectSurfaceClassName, "flex flex-col")}>
      <div className={cn(connectSectionHeaderClassName, "flex items-center gap-3")}>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-[var(--ds-background-100)] shadow-sm"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor ?? "var(--ds-gray-1000)"} 10%, var(--ds-background-100))`,
            borderColor: `color-mix(in srgb, ${accentColor ?? "var(--ds-gray-1000)"} 24%, var(--ds-gray-400))`,
          }}
        >
          <Icon
            size={16}
            className={cn(iconClassName)}
            style={{ color: accentColor ?? "var(--ds-gray-1000)" }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className={connectTitleClassName}>{label}</div>
          <div className={cn("mt-0.5", connectMetaClassName)}>
            {comingSoon
              ? "Coming soon"
              : accounts.length === 0
              ? "No accounts connected"
              : `${accounts.length} account${accounts.length !== 1 ? "s" : ""} connected`}
          </div>
        </div>
        {comingSoon ? (
          <ConnectBadge className="shrink-0 rounded-md px-2 py-1">
            Soon
          </ConnectBadge>
        ) : accounts.length > 0 ? (
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-1.5 text-label-12 text-[var(--ds-gray-900)]">
            {accounts.length}
          </span>
        ) : null}
      </div>

      <div className="flex-1 px-4 py-4 sm:px-5">
        {comingSoon ? (
          <div className={connectEmptyStateClassName}>
            <p className={connectTitleClassName}>
              Coming soon
            </p>
            <p className={cn("mt-1", connectMetaClassName)}>
              {label} support is on the roadmap.
            </p>
          </div>
        ) : accounts.length === 0 ? (
          canWrite ? (
            <button
              onClick={() => { window.location.href = oauthUrl(connectHref); }}
              className="group flex w-full items-center gap-3 rounded-xl border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-3 text-left transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
              style={platformSurfaceStyle(platformKey, 6, 20)}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-[var(--ds-background-100)] transition-colors"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accentColor ?? "var(--ds-gray-1000)"} 10%, var(--ds-background-100))`,
                  borderColor: `color-mix(in srgb, ${accentColor ?? "var(--ds-gray-1000)"} 24%, var(--ds-gray-400))`,
                  color: accentColor ?? "var(--ds-gray-1000)",
                }}
              >
                <Plus size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={connectTitleClassName}>
                  Connect {label}
                </p>
                <p className={cn("mt-0.5", connectMetaClassName)}>
                  Authorize a new channel for this account.
                </p>
                {permissionSummary ? (
                  <p className={cn("mt-1 text-label-12 text-[var(--ds-gray-900)]")}>
                    {permissionSummary}
                  </p>
                ) : null}
              </div>
              <ArrowRight
                size={14}
                className="shrink-0 transition-colors"
                style={{ color: accentColor ?? "var(--ds-gray-1000)" }}
              />
            </button>
          ) : (
            <div className={connectEmptyStateClassName}>
              <p className={connectMetaClassName}>
                No accounts connected
              </p>
            </div>
          )
        ) : (
          <div className="space-y-2">
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
        <div className="border-t border-[var(--ds-gray-400)] px-4 py-3 sm:px-5">
          <ConnectButton
            compact
            onClick={() => { window.location.href = oauthUrl(connectHref); }}
            className="rounded-md"
          >
            <Plus size={13} />
            Add another account
          </ConnectButton>
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
    <div className={cn(connectInsetCardClassName, "group flex items-center gap-3 px-3 py-2.5")}>
      <Avatar className="h-8 w-8 shrink-0">
        {!imgError && src ? (
          <AvatarImage
            src={src}
            alt={acc.username}
            onError={() => setImgError(true)}
          />
        ) : (
          <AvatarFallback
            className="text-label-12"
            style={{
              backgroundColor: `color-mix(in srgb, ${platformAccentColor(acc.platform)} 10%, var(--ds-background-100))`,
              color: "var(--ds-gray-1000)",
            }}
          >
            {getInitials(acc.username)}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className={cn("truncate", connectTitleClassName)}>
          {acc.username}
        </div>
        <div className={cn("mt-0.5 truncate", connectMetaClassName)}>
          {platformLabel(acc.platform)}
        </div>
      </div>

      {(onReconnect || onRemove) && (
        <div className="ml-auto flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          {onReconnect && (
            <ConnectButton
              compact
              iconOnly
              tone="ghost"
              onClick={() => onReconnect(acc)}
              aria-label="Reconnect account"
            >
              <RefreshCw size={13} />
            </ConnectButton>
          )}
          {onRemove && (
            <ConnectButton
              compact
              iconOnly
              tone="danger"
              onClick={() => onRemove(acc)}
              aria-label="Remove account"
            >
              <Trash2 size={13} />
            </ConnectButton>
          )}
        </div>
      )}
    </div>
  );
}

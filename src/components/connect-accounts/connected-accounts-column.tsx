"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { Trash2, RefreshCw, Plus, ArrowRight } from "lucide-react";

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

const PLATFORM_ICON_STYLE: Record<string, { bg: string; ring: string }> = {
  x:         { bg: "bg-slate-100",  ring: "ring-slate-200/80" },
  linkedin:  { bg: "bg-blue-50",    ring: "ring-blue-100" },
  youtube:   { bg: "bg-red-50",     ring: "ring-red-100" },
  instagram: { bg: "bg-pink-50",    ring: "ring-pink-100" },
  facebook:  { bg: "bg-blue-50",    ring: "ring-blue-100" },
  tiktok:    { bg: "bg-slate-100",  ring: "ring-slate-200/80" },
  threads:   { bg: "bg-slate-100",  ring: "ring-slate-200/80" },
};

export default function ConnectedAccountsColumn({
  platformKey,
  label,
  Icon,
  accent,
  connectHref = "#",
  accounts = [],
  comingSoon,
  onRemove,
  onReconnect,
}: Props) {
  const iconStyle = PLATFORM_ICON_STYLE[platformKey] ?? {
    bg: "bg-foreground/5",
    ring: "ring-foreground/10",
  };

  return (
    <div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-foreground/8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
      {/* Platform header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-foreground/6">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconStyle.bg} ring-1 ${iconStyle.ring}`}
        >
          <Icon className={`h-[18px] w-[18px] ${accent ?? "text-foreground/80"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {comingSoon
              ? "Coming soon"
              : accounts.length === 0
              ? "No accounts connected"
              : `${accounts.length} account${accounts.length !== 1 ? "s" : ""} connected`}
          </div>
        </div>
        {comingSoon ? (
          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-foreground/8 text-foreground/45 rounded-md tracking-widest uppercase flex-shrink-0">
            Soon
          </span>
        ) : accounts.length > 0 ? (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-foreground/6 text-foreground/50 text-[11px] font-semibold flex-shrink-0">
            {accounts.length}
          </span>
        ) : null}
      </div>

      {/* Account list / empty state */}
      <div className="px-4 py-3 flex-1">
        {comingSoon ? (
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed border-foreground/8 bg-foreground/[0.015]">
            <div className="flex-1 min-w-0 text-center">
              <p className="text-sm font-medium text-foreground/35">
                Coming soon
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {label} support is on the way
              </p>
            </div>
          </div>
        ) : accounts.length === 0 ? (
          <Link
            href={connectHref}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed border-foreground/15 hover:border-accent/35 hover:bg-accent/3 transition-all duration-200 group"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconStyle.bg} transition-all`}
            >
              <Plus className="w-4 h-4 text-foreground/40 group-hover:text-accent transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground/65 group-hover:text-foreground transition-colors">
                Connect {label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click to authorize your account
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </Link>
        ) : (
          <div className="space-y-1.5 overflow-y-auto max-h-[200px] pr-0.5 scrollbar-thin">
            {accounts.map((acc) => (
              <AccountRow
                key={acc.providerUserId}
                acc={acc}
                onRemove={onRemove}
                onReconnect={onReconnect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer: add more */}
      {!comingSoon && accounts.length > 0 && (
        <div className="px-4 pb-4">
          <Link
            href={connectHref}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-accent hover:bg-accent/5 border border-dashed border-foreground/10 hover:border-accent/20 transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Add another account
          </Link>
        </div>
      )}
    </div>
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
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.06] transition-colors group">
      <Avatar className="h-8 w-8 flex-shrink-0">
        {!imgError && src ? (
          <AvatarImage
            src={src}
            alt={acc.username}
            onError={() => setImgError(true)}
          />
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-accent/25 to-accent/10 text-accent text-[11px] font-semibold">
            {getInitials(acc.username)}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground truncate leading-tight">
          {acc.username}
        </div>
        <div className="text-[11px] text-muted-foreground capitalize truncate mt-0.5">
          {acc.platform}
        </div>
      </div>

      {/* Actions revealed on hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
        <button
          onClick={() => onReconnect?.(acc)}
          aria-label="Reconnect account"
          className="p-1.5 rounded-lg hover:bg-white text-foreground/40 hover:text-foreground/70 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onRemove?.(acc)}
          aria-label="Remove account"
          className="p-1.5 rounded-lg hover:bg-red-50 text-foreground/40 hover:text-red-500 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

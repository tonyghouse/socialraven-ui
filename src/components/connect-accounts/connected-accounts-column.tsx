"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { Trash2, RefreshCw, Plus } from "lucide-react";

type Props = {
  platformKey: string;
  label: string;
  Icon: any;
  accent?: string;
  connectHref?: string;
  accounts: ConnectedAccount[];
  onRemove?: (acc: ConnectedAccount) => void;
  onReconnect?: (acc: ConnectedAccount) => void;
};

const needsProxyDomains = ["linkedin.com", "licdn.com"];

/**
 * If URL belongs to certain domains (LinkedIn) use a server-side proxy route
 * to avoid CORS issues. Otherwise return original URL.
 */
const getImageUrl = (url?: string | null) => {
  if (!url) return null;
  try {
    // quick guard — treat relative urls as safe
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
  platformKey,
  label,
  Icon,
  accent,
  connectHref = "#",
  accounts = [],
  onRemove,
  onReconnect,
}: Props) {
  // show two items worth of height, but allow vertical scroll if more exist
  // h-14 per item + gaps => max-h around 14*2 + padding => ~120px
  const maxListHeight = "max-h-[128px]";

  return (
    <div
      className="
        rounded-2xl bg-white/65 backdrop-blur-xl
        border border-foreground/10 p-4
        shadow-[0_8px_28px_-12px_rgba(0,0,0,0.12)]
      "
    >
      {/* header */}
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${accent ?? "text-foreground/80"}`} />
        <div>
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">
            {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* list area - fixed visible ~2 items height, scroll if more */}
      <div className={`space-y-2 overflow-y-auto pr-2 ${maxListHeight} scrollbar-thin`}>
        {accounts.length === 0 ? (
          // show two dashed placeholders when empty
          <>
            {[0, 1].map((i) => (
              <Link
                key={`empty-${i}`}
                href={connectHref}
                className="
                  flex items-center gap-3
                  p-2 rounded-lg
                  border border-dashed border-foreground/15
                  bg-white/50
                  hover:border-accent/30 hover:text-accent
                  transition
                "
              >
                <div className="h-10 w-10 rounded-full flex items-center justify-center border border-foreground/10 text-muted-foreground">
                  <Plus className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="h-3 w-36 rounded bg-foreground/10" />
                  <div className="h-2 w-24 mt-1 rounded bg-foreground/6" />
                </div>

                <div className="ml-auto">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
                    Connect
                  </div>
                </div>
              </Link>
            ))}
          </>
        ) : (
          // map actual accounts (all of them) into vertically stacked rows
          accounts.map((acc) => (
            <AccountRow
              key={acc.providerUserId}
              acc={acc}
              onRemove={onRemove}
              onReconnect={onReconnect}
            />
          ))
        )}
      </div>

      {/* footer note when more than 2 */}
      {accounts.length > 2 && (
        <div className="mt-3 text-xs text-muted-foreground text-center">
          + {accounts.length - 2} more
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
    <div
      className="
        flex items-center gap-3 p-2
        rounded-lg bg-white/60 backdrop-blur-lg
        border border-foreground/10
        hover:bg-foreground/5 transition
      "
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          {!imgError && src ? (
            <AvatarImage
              src={src}
              alt={acc.username}
              onError={() => {
                // fallback to initials if proxied or remote image fails
                setImgError(true);
              }}
            />
          ) : (
            <AvatarFallback className="bg-accent text-white">
              {getInitials(acc.username)}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{acc.username}</div>
        <div className="text-xs text-muted-foreground truncate capitalize">
          {acc.platform}
        </div>
      </div>

      {/* actions */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => onReconnect?.(acc)}
          aria-label="Reconnect account"
          className="p-1.5 rounded-full hover:bg-white/80 transition"
        >
          <RefreshCw className="w-4 h-4 text-foreground/70" />
        </button>

        <button
          onClick={() => onRemove?.(acc)}
          aria-label="Remove account"
          className="p-1.5 rounded-full hover:bg-red-50 transition"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

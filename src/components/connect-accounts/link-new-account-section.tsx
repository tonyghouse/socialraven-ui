"use client";

import { useState } from "react";
import { AlertTriangle, ArrowUpRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ConnectBadge,
  connectBodyClassName,
  connectSectionHeaderClassName,
  connectSurfaceClassName,
  connectTitleClassName,
} from "@/components/connect-accounts/connect-accounts-primitives";
import {
  CONNECT_PLATFORM_META,
  CONNECT_PLATFORM_ORDER,
  platformSurfaceStyle,
} from "@/components/connect-accounts/platform-meta";

function oauthUrl(base: string) {
  if (typeof window === "undefined") return base;
  const workspaceId = localStorage.getItem("activeWorkspaceId");
  return workspaceId ? `${base}?workspaceId=${workspaceId}` : base;
}

export default function LinkNewAccountSection() {
  const [error, setError] = useState<string | null>(null);

  return (
    <section className={connectSurfaceClassName}>
      <div className={connectSectionHeaderClassName}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className={connectTitleClassName}>Add new account connection</p>
          <ConnectBadge>
            OAuth redirect
          </ConnectBadge>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-[var(--ds-red-200)] bg-[var(--ds-red-100)] px-3 py-2.5 sm:mx-5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--ds-red-700)]" />
          <p className="flex-1 text-label-14 text-[var(--ds-red-700)]">{error}</p>
          <button
            onClick={() => setError(null)}
            className="inline-flex h-5 w-5 items-center justify-center rounded text-[var(--ds-red-700)] transition-colors hover:bg-[var(--ds-red-200)]"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:p-4 lg:grid-cols-5 xl:grid-cols-7">
        {CONNECT_PLATFORM_ORDER.map((providerKey) => {
          const provider = CONNECT_PLATFORM_META[providerKey];
          return (
          <a
            key={providerKey}
            href={provider.enabled ? oauthUrl(provider.connectHref) : undefined}
            onClick={(e) => {
              if (!provider.enabled) e.preventDefault();
            }}
            className={cn(
              "group relative flex min-h-[108px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-center transition-[border-color,background-color,transform,box-shadow]",
              "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]",
              provider.enabled
                ? "cursor-pointer hover:-translate-y-0.5 hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] hover:shadow-sm"
                : "cursor-not-allowed opacity-55",
            )}
            style={provider.enabled ? platformSurfaceStyle(providerKey, 4, 18) : undefined}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm"
              style={{
                backgroundColor: `color-mix(in srgb, ${provider.accentColor} 10%, var(--ds-background-100))`,
                borderColor: `color-mix(in srgb, ${provider.accentColor} 24%, var(--ds-gray-400))`,
              }}
            >
              <provider.Icon
                className={cn("h-4 w-4", provider.iconClassName)}
                style={{ color: provider.accentColor }}
              />
            </div>

            <div className="min-w-0 space-y-0.5">
              <p className="text-label-13 text-[var(--ds-gray-1000)]">{provider.label}</p>
              <p className={connectBodyClassName}>
                {provider.enabled ? "Connect account" : "Not available yet"}
              </p>
            </div>

            {!provider.enabled && (
              <ConnectBadge className="absolute right-2 top-2 px-1.5 py-0.5">
                Soon
              </ConnectBadge>
            )}
            {provider.enabled && (
              <div
                className="absolute right-2 top-2 rounded-md p-1 transition-colors"
                style={{
                  backgroundColor: `color-mix(in srgb, ${provider.accentColor} 14%, var(--ds-background-100))`,
                  color: provider.accentColor,
                }}
              >
                <ArrowUpRight size={14} />
              </div>
            )}
          </a>
        );
        })}
      </div>
    </section>
  );
}

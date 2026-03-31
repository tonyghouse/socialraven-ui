"use client";

import { useState } from "react";
import { AlertTriangle, ArrowUpRight, X } from "lucide-react";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  {
    name: "X / Twitter",
    key: "x",
    href: "/api/auth/x",
    icon: PLATFORM_ICONS.x,
    iconColor: "text-[hsl(var(--foreground))]",
    enabled: true,
  },
  {
    name: "LinkedIn",
    key: "linkedin",
    href: "/api/auth/linkedin",
    icon: PLATFORM_ICONS.linkedin,
    iconColor: "text-[#0A66C2]",
    enabled: true,
  },
  {
    name: "YouTube",
    key: "youtube",
    href: "/api/auth/youtube",
    icon: PLATFORM_ICONS.youtube,
    iconColor: "text-[#FF0000]",
    enabled: true,
  },
  {
    name: "Instagram",
    key: "instagram",
    href: "/api/auth/instagram",
    icon: PLATFORM_ICONS.instagram,
    iconColor: "text-[#E1306C]",
    enabled: true,
  },
  {
    name: "Facebook",
    key: "facebook",
    href: "/api/auth/facebook",
    icon: PLATFORM_ICONS.facebook,
    iconColor: "text-[#1877F2]",
    enabled: true,
  },
  {
    name: "TikTok",
    key: "tiktok",
    href: "/api/auth/tiktok",
    icon: PLATFORM_ICONS.tiktok,
    iconColor: "text-[hsl(var(--foreground))]",
    enabled: false,
  },
  {
    name: "Threads",
    key: "threads",
    href: "/api/auth/threads",
    icon: PLATFORM_ICONS.threads,
    iconColor: "text-[hsl(var(--foreground))]",
    enabled: false,
  },
];

function oauthUrl(base: string) {
  if (typeof window === "undefined") return base;
  const workspaceId = localStorage.getItem("activeWorkspaceId");
  return workspaceId ? `${base}?workspaceId=${workspaceId}` : base;
}

export default function LinkNewAccountSection() {
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-sm">
      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">
            Add new account connection
          </p>
          <Badge
            variant="outline"
            className="rounded-md border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-2.5 py-1 text-xs font-medium leading-4 text-[hsl(var(--foreground-muted))]"
          >
            OAuth redirect
          </Badge>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5 sm:mx-5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="flex-1 text-sm text-[hsl(var(--foreground))]">{error}</p>
          <button
            onClick={() => setError(null)}
            className="inline-flex h-5 w-5 items-center justify-center rounded text-[hsl(var(--foreground-muted))] transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:p-4 lg:grid-cols-5 xl:grid-cols-7">
        {PROVIDERS.map((provider) => (
          <a
            key={provider.key}
            href={provider.enabled ? oauthUrl(provider.href) : undefined}
            onClick={(e) => {
              if (!provider.enabled) e.preventDefault();
            }}
            className={cn(
              "group relative flex min-h-[108px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-center transition-[border-color,background-color,transform,box-shadow]",
              "border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))]",
              provider.enabled
                ? "cursor-pointer hover:-translate-y-0.5 hover:border-[hsl(var(--accent))]/35 hover:bg-[hsl(var(--surface))] hover:shadow-sm"
                : "cursor-not-allowed opacity-55",
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-sm">
              <provider.icon className={`h-4 w-4 ${provider.iconColor}`} />
            </div>

            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground))]">
                {provider.name}
              </p>
              <p className="text-xs leading-4 text-[hsl(var(--foreground-muted))]">
                {provider.enabled ? "Connect account" : "Not available yet"}
              </p>
            </div>

            {!provider.enabled && (
              <Badge
                variant="outline"
                className="absolute right-2 top-2 rounded-md border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-1.5 py-0.5 text-xs font-medium leading-4 text-[hsl(var(--foreground-muted))]"
              >
                Soon
              </Badge>
            )}
            {provider.enabled && (
              <div className="absolute right-2 top-2 rounded-md bg-[hsl(var(--accent))]/[0.08] p-1 text-[hsl(var(--accent))] transition-colors group-hover:bg-[hsl(var(--accent))]/[0.12]">
                <ArrowUpRight size={14} />
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}

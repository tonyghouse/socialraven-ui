"use client";

import { ConnectedAccount } from "@/model/ConnectedAccount";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";

const PLATFORM_META: Record<
  string,
  { label: string; icon: any; accent: string }
> = {
  x: { label: "X / Twitter", icon: PLATFORM_ICONS.x, accent: "text-[hsl(var(--foreground))]" },
  linkedin: { label: "LinkedIn", icon: PLATFORM_ICONS.linkedin, accent: "text-[var(--ds-plum-700)]" },
  youtube: { label: "YouTube", icon: PLATFORM_ICONS.youtube, accent: "text-red-500" },
  instagram: { label: "Instagram", icon: PLATFORM_ICONS.instagram, accent: "text-[#E1306C]" },
  facebook: { label: "Facebook", icon: PLATFORM_ICONS.facebook, accent: "text-[var(--ds-plum-700)]" },
};

const ORDER = ["x", "linkedin", "youtube", "instagram", "facebook"];

// Helper function to get initials from username
const getInitials = (username: string) => {
  if (!username) return "?";
  return username
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to get proxied or direct image URL
const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;

  // List of domains that need proxying due to CORS
  const needsProxy = [
    'linkedin.com',
    'licdn.com',
  ];

  // Check if URL needs proxying
  const requiresProxy = needsProxy.some(domain => url.includes(domain));

  if (requiresProxy) {
    // Use the proxy API route
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }

  // Return direct URL for other platforms
  return url;
};

// Account item component with error handling
function AccountItem({ acc }: { acc: ConnectedAccount }) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(acc.profilePicLink);
  const initials = getInitials(acc.username);

  return (
    <div
      className="flex w-full items-center gap-3 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-3 transition-colors hover:bg-[hsl(var(--surface))]"
    >
      <Avatar className="h-10 w-10">
        {imageUrl && !imageError ? (
          <AvatarImage
            src={imageUrl}
            alt={acc.username}
            onError={() => {
              console.error('Failed to load image:', imageUrl);
              setImageError(true);
            }}
          />
        ) : null}
        <AvatarFallback className="flex items-center justify-center bg-accent/10 text-xs font-medium text-accent">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">{acc.username}</p>
        <p className="truncate text-xs capitalize text-[hsl(var(--foreground-muted))]">
          {acc.platform}
        </p>
      </div>
    </div>
  );
}

export default function ConnectedAccountsList({
  accounts,
}: {
  accounts: ConnectedAccount[];
}) {
  const grouped = ORDER.reduce((acc, key) => {
    acc[key] = accounts.filter((a) => a.platform === key);
    return acc;
  }, {} as Record<string, ConnectedAccount[]>);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {ORDER.map((platformKey) => {
        const { label, icon: Icon, accent } = PLATFORM_META[platformKey];
        const items = grouped[platformKey];

        return (
          <div
            key={platformKey}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center gap-2">
              <Icon size={18} className={accent} />
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</p>
            </div>

            {items.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
                <p className="text-sm text-[hsl(var(--foreground-muted))]">
                  No accounts connected
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.slice(0, 2).map((acc) => (
                  <AccountItem key={acc.providerUserId} acc={acc} />
                ))}

                {items.length > 2 && (
                  <div className="pt-1 text-center text-xs text-[hsl(var(--foreground-muted))]">
                    + {items.length - 2} more account{items.length - 2 > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

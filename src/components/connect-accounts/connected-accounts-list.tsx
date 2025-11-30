"use client";

import { Instagram, Twitter, Linkedin, Youtube, Facebook } from "lucide-react";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

const PLATFORM_META: Record<
  string,
  { label: string; icon: any; accent: string }
> = {
  x: { label: "X / Twitter", icon: Twitter, accent: "text-foreground/80" },
  linkedin: { label: "LinkedIn", icon: Linkedin, accent: "text-accent" },
  youtube: { label: "YouTube", icon: Youtube, accent: "text-red-500" },
  instagram: { label: "Instagram", icon: Instagram, accent: "text-pink-500" },
};

const ORDER = ["x", "linkedin", "youtube", "instagram"];

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
      className="
        frosted-border depth-soft
        flex items-center gap-3 
        p-3 rounded-2xl
        bg-white/70 backdrop-blur-xl 
        border border-foreground/10
        hover:bg-foreground/5 transition-all
        w-full
      "
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
        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{acc.username}</p>
        <p className="text-xs text-muted-foreground truncate capitalize">
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
    <div className="grid md:grid-cols-2 gap-6">
      {ORDER.map((platformKey) => {
        const { label, icon: Icon, accent } = PLATFORM_META[platformKey];
        const items = grouped[platformKey];

        return (
          <div
            key={platformKey}
            className="
              frosted-border depth-soft
              rounded-[24px]
              bg-white/70 backdrop-blur-xl
              p-5
            "
          >
            {/* HEADER */}
            <div className="flex items-center gap-2 mb-4">
              <Icon className={`h-5 w-5 ${accent}`} />
              <p className="font-semibold text-foreground">{label}</p>
            </div>

            {/* EMPTY BLOCK */}
            {items.length === 0 ? (
              <div
                className="
                  frosted-border depth-soft
                  h-40 rounded-2xl bg-white/60 backdrop-blur-xl 
                  border border-foreground/10
                  flex items-center justify-center
                "
              >
                <p className="text-sm text-muted-foreground italic">
                  No accounts connected
                </p>
              </div>
            ) : (
              <div
                className="
                  space-y-3 
                  max-h-48 overflow-y-auto 
                  pr-2 scrollbar-thin
                "
              >
                {items.slice(0, 2).map((acc) => (
                  <AccountItem key={acc.providerUserId} acc={acc} />
                ))}

                {/* Show count if more */}
                {items.length > 2 && (
                  <div className="text-xs text-muted-foreground/80 pt-1 text-center">
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
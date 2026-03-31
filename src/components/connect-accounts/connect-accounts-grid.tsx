"use client";

import { ConnectedAccount } from "@/model/ConnectedAccount";
import ConnectedAccountsColumn from "./connected-accounts-column";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";

type GridProps = {
  accounts: ConnectedAccount[];
  onRemove?: (acc: ConnectedAccount) => void;
  onReconnect?: (acc: ConnectedAccount) => void;
  canWrite?: boolean;
};

interface PlatformMeta {
  label: string;
  Icon: React.ComponentType<any>;
  accent: string;
  connectHref: string;
  comingSoon?: boolean;
  iconClassName?: string;
}



export type PlatformKey = "x" | "linkedin" | "youtube" | "instagram" | "facebook" | "tiktok" | "threads";

export const PLATFORM_META: Record<PlatformKey, PlatformMeta> = {
  x: {
    label: "X / Twitter",
    Icon: PLATFORM_ICONS.x,
    accent: "text-[hsl(var(--foreground))]",
    connectHref: "/api/auth/x",
  },
  linkedin: {
    label: "LinkedIn",
    Icon: PLATFORM_ICONS.linkedin,
    accent: "text-[#0A66C2]",
    connectHref: "/api/auth/linkedin",
  },
  youtube: {
    label: "YouTube",
    Icon: PLATFORM_ICONS.youtube,
    accent: "text-red-500",
    connectHref: "/api/auth/youtube",
  },
  instagram: {
    label: "Instagram",
    Icon: PLATFORM_ICONS.instagram,
    accent: "text-[#E1306C]",
    connectHref: "/api/auth/instagram",
  },
  facebook: {
    label: "Facebook",
    Icon: PLATFORM_ICONS.facebook,
    accent: "text-[#1877F2]",
    connectHref: "/api/auth/facebook",
  },
  tiktok: {
    label: "TikTok",
    Icon: PLATFORM_ICONS.tiktok,
    accent: "text-slate-900",
    connectHref: "/api/auth/tiktok",
    comingSoon: true,
    iconClassName: "h-[15px] w-[15px]",
  },
  threads: {
    label: "Threads",
    Icon: PLATFORM_ICONS.threads,
    accent: "text-slate-900",
    connectHref: "/api/auth/threads",
    comingSoon: true,
    iconClassName: "h-[15px] w-[15px]",
  },
};

const ORDER: PlatformKey[] = ["x", "linkedin", "youtube", "instagram", "facebook", "tiktok", "threads"];

export default function ConnectedAccountsGrid({
  accounts,
  onRemove,
  onReconnect,
  canWrite = true,
}: GridProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {ORDER.map((key) => {
        const meta = PLATFORM_META[key];
        if (!meta) return null;

        const accountsForPlatform = accounts.filter(
          (a) => a.platform === key
        );

        return (
          <ConnectedAccountsColumn
            key={key}
            platformKey={key}
            label={meta.label}
            Icon={meta.Icon}
            accent={meta.accent}
            connectHref={meta.connectHref}
            accounts={accountsForPlatform}
            comingSoon={meta.comingSoon}
            iconClassName={meta.iconClassName}
            onRemove={onRemove}
            onReconnect={onReconnect}
            canWrite={canWrite}
          />
        );
      })}
    </div>
  );
}

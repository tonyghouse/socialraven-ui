"use client";

import { ConnectedAccount } from "@/model/ConnectedAccount";
import {
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
} from "lucide-react";
import ConnectedAccountsColumn from "./connected-accounts-column";

type GridProps = {
  accounts: ConnectedAccount[];
  onRemove?: (acc: ConnectedAccount) => void;
  onReconnect?: (acc: ConnectedAccount) => void;
};

interface PlatformMeta {
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  accent: string;
  connectHref: string;
  comingSoon?: boolean;
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function ThreadsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.789-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.312-.883-2.378-.887h-.014c-.765 0-1.829.199-2.593 1.28l-1.64-1.154c1.046-1.489 2.637-2.306 4.526-2.306h.023c3.418.018 5.438 2.107 5.504 5.724.022.036.043.071.063.108.048.086.096.17.14.258.985 1.878.948 5.072-1.261 7.222-1.76 1.717-3.974 2.563-6.738 2.582zm1.464-9.625c1.035-.066 1.817-.44 2.327-1.112.403-.528.647-1.239.726-2.112a11.048 11.048 0 0 0-2.769-.218c-.945.055-1.671.33-2.159.817-.43.43-.636.989-.605 1.618.03.565.317 1.04.808 1.357.511.33 1.168.482 1.913.446l-.241.004z" />
    </svg>
  );
}

export type PlatformKey = "x" | "linkedin" | "youtube" | "instagram" | "facebook" | "tiktok" | "threads";

export const PLATFORM_META: Record<PlatformKey, PlatformMeta> = {
  x: {
    label: "X / Twitter",
    Icon: Twitter,
    accent: "text-foreground/80",
    connectHref: "/api/auth/x",
  },
  linkedin: {
    label: "LinkedIn",
    Icon: Linkedin,
    accent: "text-accent",
    connectHref: "/api/auth/linkedin",
  },
  youtube: {
    label: "YouTube",
    Icon: Youtube,
    accent: "text-red-500",
    connectHref: "/api/auth/youtube",
  },
  instagram: {
    label: "Instagram",
    Icon: Instagram,
    accent: "text-[#E1306C]",
    connectHref: "/api/auth/instagram",
    comingSoon: true,
  },
  facebook: {
    label: "Facebook",
    Icon: Facebook,
    accent: "text-[#1877F2]",
    connectHref: "/api/auth/facebook",
    comingSoon: true,
  },
  tiktok: {
    label: "TikTok",
    Icon: TikTokIcon,
    accent: "text-slate-900",
    connectHref: "/api/auth/tiktok",
    comingSoon: true,
  },
  threads: {
    label: "Threads",
    Icon: ThreadsIcon,
    accent: "text-slate-900",
    connectHref: "/api/auth/threads",
    comingSoon: true,
  },
};

const ORDER: PlatformKey[] = ["x", "linkedin", "youtube", "instagram", "facebook", "tiktok", "threads"];

export default function ConnectedAccountsGrid({
  accounts,
  onRemove,
  onReconnect,
}: GridProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
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
            onRemove={onRemove}
            onReconnect={onReconnect}
          />
        );
      })}
    </div>
  );
}

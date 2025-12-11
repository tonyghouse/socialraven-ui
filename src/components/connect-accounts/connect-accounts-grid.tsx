"use client";


import { ConnectedAccount } from "@/model/ConnectedAccount";
import {
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
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
}

export type PlatformKey = "x" | "linkedin" | "youtube" | "instagram";

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
    accent: "text-pink-500",
    connectHref: "/api/auth/instagram",
  },
};

const ORDER: PlatformKey[] = ["x", "linkedin", "youtube", "instagram"];

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
            onRemove={onRemove}
            onReconnect={onReconnect}
          />
        );
      })}
    </div>
  );
}

"use client";

import { ConnectedAccount } from "@/model/ConnectedAccount";
import ConnectedAccountsColumn from "./connected-accounts-column";
import {
  CONNECT_PLATFORM_META,
  CONNECT_PLATFORM_ORDER,
  type ConnectPlatformKey,
} from "@/components/connect-accounts/platform-meta";

type GridProps = {
  accounts: ConnectedAccount[];
  onRemove?: (acc: ConnectedAccount) => void;
  onReconnect?: (acc: ConnectedAccount) => void;
  canWrite?: boolean;
};

export default function ConnectedAccountsGrid({
  accounts,
  onRemove,
  onReconnect,
  canWrite = true,
}: GridProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {CONNECT_PLATFORM_ORDER.map((key) => {
        const meta = CONNECT_PLATFORM_META[key as ConnectPlatformKey];
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
            accentColor={meta.accentColor}
            connectHref={meta.connectHref}
            accounts={accountsForPlatform}
            permissionSummary={meta.permissionSummary}
            comingSoon={!meta.enabled}
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

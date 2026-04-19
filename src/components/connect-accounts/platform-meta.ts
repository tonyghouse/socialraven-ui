import { PLATFORM_ICONS } from "@/components/generic/platform-icons";

export type ConnectPlatformKey =
  | "x"
  | "linkedin"
  | "youtube"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "threads";

type ConnectPlatformMeta = {
  label: string;
  Icon: React.ComponentType<any>;
  accentColor: string;
  connectHref: string;
  enabled: boolean;
  iconClassName?: string;
};

export const CONNECT_PLATFORM_ORDER: ConnectPlatformKey[] = [
  "x",
  "linkedin",
  "youtube",
  "instagram",
  "facebook",
  "threads",
  "tiktok",
];

export const CONNECT_PLATFORM_META: Record<ConnectPlatformKey, ConnectPlatformMeta> = {
  x: {
    label: "X / Twitter",
    Icon: PLATFORM_ICONS.x,
    accentColor: "var(--chart-neutral)",
    connectHref: "/api/auth/x",
    enabled: true,
  },
  linkedin: {
    label: "LinkedIn",
    Icon: PLATFORM_ICONS.linkedin,
    accentColor: "var(--chart-categorical-2)",
    connectHref: "/api/auth/linkedin",
    enabled: true,
  },
  youtube: {
    label: "YouTube",
    Icon: PLATFORM_ICONS.youtube,
    accentColor: "var(--ds-red-600)",
    connectHref: "/api/auth/youtube",
    enabled: true,
  },
  instagram: {
    label: "Instagram",
    Icon: PLATFORM_ICONS.instagram,
    accentColor: "var(--chart-categorical-4)",
    connectHref: "/api/auth/instagram",
    enabled: true,
  },
  facebook: {
    label: "Facebook",
    Icon: PLATFORM_ICONS.facebook,
    accentColor: "var(--chart-categorical-5)",
    connectHref: "/api/auth/facebook",
    enabled: true,
  },
  tiktok: {
    label: "TikTok",
    Icon: PLATFORM_ICONS.tiktok,
    accentColor: "var(--ds-gray-1000)",
    connectHref: "/api/auth/tiktok",
    enabled: false,
    iconClassName: "h-[0.9375rem] w-[0.9375rem]",
  },
  threads: {
    label: "Threads",
    Icon: PLATFORM_ICONS.threads,
    accentColor: "var(--ds-gray-1000)",
    connectHref: "/api/auth/threads",
    enabled: true,
    iconClassName: "h-[0.9375rem] w-[0.9375rem]",
  },
};

export function platformAccentColor(platform: string) {
  return CONNECT_PLATFORM_META[platform as ConnectPlatformKey]?.accentColor ?? "var(--ds-gray-1000)";
}

export function platformLabel(platform: string) {
  return CONNECT_PLATFORM_META[platform as ConnectPlatformKey]?.label ?? platform;
}

export function platformSurfaceStyle(platform: string, backgroundPercent = 12, borderPercent = 28) {
  const accentColor = platformAccentColor(platform);

  return {
    backgroundColor: `color-mix(in srgb, ${accentColor} ${backgroundPercent}%, var(--ds-background-100))`,
    borderColor: `color-mix(in srgb, ${accentColor} ${borderPercent}%, var(--ds-gray-400))`,
  };
}

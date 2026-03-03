// components/platform-icons.ts
import { InstagramLogo, LinkedinLogo, XLogo, FacebookLogo, YoutubeLogo } from "@phosphor-icons/react";
import { TikTokIcon, ThreadsIcon } from "./platform-svg-icons";

export const PLATFORM_ICONS: Record<string, any> = {
  // lowercase keys (matches Platform type)
  instagram: InstagramLogo,
  linkedin: LinkedinLogo,
  x: XLogo,
  facebook: FacebookLogo,
  youtube: YoutubeLogo,
  threads: ThreadsIcon,
  tiktok: TikTokIcon,
  // uppercase keys (backward compatibility)
  INSTAGRAM: InstagramLogo,
  LINKEDIN: LinkedinLogo,
  X: XLogo,
  FACEBOOK: FacebookLogo,
  YOUTUBE: YoutubeLogo,
  THREADS: ThreadsIcon,
  TIKTOK: TikTokIcon,
};

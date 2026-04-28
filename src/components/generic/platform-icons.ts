// components/platform-icons.ts
import { Instagram, Linkedin, Twitter, Facebook, Youtube } from "lucide-react";
import { TikTokIcon, ThreadsIcon } from "./platform-svg-icons";

export const PLATFORM_ICONS: Record<string, any> = {
  // lowercase keys (matches Platform type)
  instagram: Instagram,
  linkedin: Linkedin,
  x: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  threads: ThreadsIcon,
  tiktok: TikTokIcon,
  // uppercase keys (backward compatibility)
  INSTAGRAM: Instagram,
  LINKEDIN: Linkedin,
  X: Twitter,
  FACEBOOK: Facebook,
  YOUTUBE: Youtube,
  THREADS: ThreadsIcon,
  TIKTOK: TikTokIcon,
};

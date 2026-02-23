import { ConnectedAccount } from "@/model/ConnectedAccount";
import { PostMedia } from "./PostMedia";
import { PostType } from "./PostType";

// ---------- Platform-specific configuration types ----------

export interface FacebookConfig {
  audience?: "PUBLIC" | "FRIENDS" | "FRIENDS_OF_FRIENDS" | "SELF";
  firstComment?: string;
}

export interface InstagramConfig {
  altText?: string;
  firstComment?: string;
  disableComments?: boolean;
}

export interface XConfig {
  replySettings?: "EVERYONE" | "FOLLOWERS" | "MENTIONED";
}

export interface YouTubeConfig {
  videoTitle?: string;
  privacy?: "PUBLIC" | "UNLISTED" | "PRIVATE";
  category?: string;
  tags?: string[];
  madeForKids?: boolean;
  notifySubscribers?: boolean;
}

export interface ThreadsConfig {
  replyControl?: "EVERYONE" | "PROFILES_YOU_FOLLOW" | "MENTIONED_ONLY";
}

export interface TikTokConfig {
  privacyLevel?: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "FOLLOWER_OF_CREATOR" | "SELF_ONLY";
  allowComment?: boolean;
  allowDuet?: boolean;
  allowStitch?: boolean;
  brandContentToggle?: boolean;
}

export interface LinkedInConfig {
  visibility?: "PUBLIC" | "CONNECTIONS";
}

export interface PlatformConfigs {
  facebook?: FacebookConfig;
  instagram?: InstagramConfig;
  x?: XConfig;
  youtube?: YouTubeConfig;
  threads?: ThreadsConfig;
  tiktok?: TikTokConfig;
  linkedin?: LinkedInConfig;
}

// ---------- Main collection type ----------

export interface PostCollection {
  title: string;
  description: string;
  postType: PostType;
  media: PostMedia[]; // multiple media files as byte arrays homogenous image or video either one
  connectedAccounts: ConnectedAccount[];
  scheduledTime: string; // ISO string
  platformConfigs?: PlatformConfigs;
}

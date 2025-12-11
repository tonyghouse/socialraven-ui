import { Platform } from "./Platform";
import { PostType } from "./PostType";

export interface ConnectedAccount {
  providerUserId: string;
  platform: Platform;
  username: string;
  profilePicLink: string;
  allowedFormats: PostType[];
}
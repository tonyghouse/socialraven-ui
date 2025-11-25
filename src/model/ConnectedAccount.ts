import { Platform } from "./Platform";

export interface ConnectedAccount {
  providerUserId: string;
  platform: Platform;
  username: string;
  profilePicLink: string;
}
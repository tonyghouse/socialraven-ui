import { Platform } from "./Platform";

export interface ConnectedAccount {
  id: string;
  platform: Platform;
  username: string;
  profile: string;
}
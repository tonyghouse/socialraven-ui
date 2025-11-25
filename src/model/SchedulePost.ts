import { ConnectedAccount } from "@/model/ConnectedAccount";
import { PostMedia } from "./PostMedia";

export interface SchedulePost {
  title: string;
  description: string;
  media: PostMedia[]; // multiple media files as byte arrays
  connectedAccounts: ConnectedAccount[];
  scheduledTime: string; // ISO string
}

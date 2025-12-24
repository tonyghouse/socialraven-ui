import { ConnectedAccount } from "@/model/ConnectedAccount";
import { PostMedia } from "./PostMedia";
import { PostType } from "./PostType";

export interface PostCollection {
  title: string;
  description: string;
  postType: PostType;
  media: PostMedia[]; // multiple media files as byte arrays homogenous image or video either one
  connectedAccounts: ConnectedAccount[];
  scheduledTime: string; // ISO string
}

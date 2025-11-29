import { ConnectedAccount } from "./ConnectedAccount";
import { MediaResponse } from "./MediaResponse";

export interface PostResponse {
  id: number;
  title: string;
  description: string;
  provider: string;
  postStatus: "SCHEDULED" | "PUBLISHED" | "FAILED"
  scheduledTime: string;
  media: MediaResponse[];
  connectedAccounts: ConnectedAccount[];
}
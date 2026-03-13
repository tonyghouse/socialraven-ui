import { ConnectedAccount } from "./ConnectedAccount";
import { MediaResponse } from "./MediaResponse";

export interface PostResponse {
  id: number;
  postCollectionId: number;
  title: string;
  description: string;
  provider: string;
  postStatus: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED"
  scheduledTime: string | null;
  media: MediaResponse[];
  connectedAccount: ConnectedAccount;
}
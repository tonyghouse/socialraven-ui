import { ConnectedAccount } from "./ConnectedAccount";
import { MediaResponse } from "./MediaResponse";

export interface PostResponse {
  id: number;
  postCollectionId: number;
  description: string;
  provider: string;
  postStatus: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED"
  scheduledTime: string | null;
  media: MediaResponse[];
  connectedAccount: ConnectedAccount;
}
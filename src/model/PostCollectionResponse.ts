import { PostResponse } from "./PostResponse";
import { MediaResponse } from "./MediaResponse";

export interface PostCollectionResponse {
  id: number;
  title: string;
  description: string;
  scheduledTime: string;
  postCollectionType: "IMAGE" | "VIDEO" | "TEXT";
  overallStatus: "SCHEDULED" | "PUBLISHED" | "PARTIAL_SUCCESS" | "FAILED";
  posts: PostResponse[];
  media: MediaResponse[];
}

export interface PostCollectionResponsePage {
  content: PostCollectionResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

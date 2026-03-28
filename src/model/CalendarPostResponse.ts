export interface CalendarPostResponse {
  id: number;
  postCollectionId: number;
  /** lowercase platform name: instagram | x | linkedin | facebook | youtube | tiktok | threads */
  platform: string;
  providerUserId: string;
  postStatus: "SCHEDULED" | "PUBLISHED" | "FAILED";
  postCollectionType: "IMAGE" | "VIDEO" | "TEXT";
  /** ISO-8601 UTC datetime string */
  scheduledTime: string;
}

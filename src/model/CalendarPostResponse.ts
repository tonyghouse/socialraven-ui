export interface CalendarPostResponse {
  id: number;
  postCollectionId: number;
  title: string;
  /** lowercase platform name: instagram | x | linkedin | facebook | youtube | tiktok | threads */
  platform: string;
  providerUserId: string;
  postStatus: "SCHEDULED" | "POSTED" | "FAILED";
  postCollectionType: "IMAGE" | "VIDEO" | "TEXT";
  /** ISO-8601 UTC datetime string */
  scheduledTime: string;
}

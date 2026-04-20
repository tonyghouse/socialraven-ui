export const INSTAGRAM_OAUTH_SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
  "instagram_business_manage_messages",
  "instagram_business_manage_comments",
  "instagram_business_manage_insights",
].join(",");

export const FACEBOOK_OAUTH_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_read_user_content",
  "pages_manage_posts",
  "pages_manage_metadata",
  "public_profile",
  "business_management",
].join(",");

export const THREADS_OAUTH_SCOPES = [
  "threads_basic",
  "threads_content_publish",
  "threads_manage_insights",
].join(",");

export const LINKEDIN_OAUTH_SCOPES = [
  "openid",
  "profile",
  "email",
  "w_member_social",
  "w_organization_social",
  "rw_organization_admin",
].join(" ");

export const YOUTUBE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
].join(" ");

export const TIKTOK_OAUTH_SCOPES = [
  "user.info.basic",
  "user.info.stats",
  "video.list",
].join(",");

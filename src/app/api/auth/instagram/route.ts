import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.FACEBOOK_APP_ID!;
  const redirectUri = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_BASE_URL_FB}/api/auth/instagram/callback`
  );

  const scopes = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_show_list",
    "pages_read_engagement"
  ].join(",");

  const authUrl =
    `https://www.facebook.com/v21.0/dialog/oauth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${scopes}`;

  return NextResponse.redirect(authUrl);
}

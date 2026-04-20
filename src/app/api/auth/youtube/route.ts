import { NextRequest, NextResponse } from "next/server";
import { YOUTUBE_OAUTH_SCOPES } from "@/lib/oauth-scopes";

export async function GET(req: NextRequest) {
  const clientId = process.env.YT_CLIENT_ID!;
  const redirectUri = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/youtube/callback`
  );

  const workspaceId = new URL(req.url).searchParams.get("workspaceId") ?? "";

  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(YOUTUBE_OAUTH_SCOPES)}` +
    `&access_type=offline` +
    `&prompt=consent`;

  const res = NextResponse.redirect(authUrl);
  if (workspaceId) {
    res.cookies.set("oauth_workspace_id", workspaceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    });
  }
  return res;
}

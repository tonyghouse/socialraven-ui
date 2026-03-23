import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const redirectUri = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`
  );

  const workspaceId = new URL(req.url).searchParams.get("workspaceId") ?? "";
  const state = crypto.randomUUID();

  const scopes = ["openid", "profile", "email", "w_member_social"].join(" ");

  const url =
    `https://www.linkedin.com/oauth/v2/authorization` +
    `?response_type=code&client_id=${clientId}` +
    `&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}` +
    `&state=${state}`;

  const res = NextResponse.redirect(url);
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

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const TIKTOK_STATE_COOKIE = "oauth_tiktok_state";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 10 * 60,
  path: "/",
};

export async function GET(request: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !redirectUri) {
    return NextResponse.json(
      { error: "TikTok credentials not configured" },
      { status: 500 }
    );
  }

  const workspaceId = new URL(request.url).searchParams.get("workspaceId") ?? "";
  const state = crypto.randomUUID();

  const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authUrl.searchParams.set("client_key", clientKey);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "user.info.basic");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set(TIKTOK_STATE_COOKIE, state, COOKIE_OPTIONS);

  if (workspaceId) {
    response.cookies.set("oauth_workspace_id", workspaceId, {
      ...COOKIE_OPTIONS,
      maxAge: 10 * 60,
    });
  }

  return response;
}

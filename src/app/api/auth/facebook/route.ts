import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { FACEBOOK_OAUTH_SCOPES } from "@/lib/oauth-scopes";

const FACEBOOK_STATE_COOKIE = "oauth_facebook_state";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 10 * 60,
  path: "/",
};

export async function GET(request: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: "Facebook credentials not configured" },
      { status: 500 }
    );
  }

  const workspaceId = new URL(request.url).searchParams.get("workspaceId") ?? "";
  const state = crypto.randomUUID();

  const authUrl = new URL("https://www.facebook.com/v22.0/dialog/oauth");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set(
    "scope",
    FACEBOOK_OAUTH_SCOPES
  );
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set(FACEBOOK_STATE_COOKIE, state, COOKIE_OPTIONS);

  if (workspaceId) {
    response.cookies.set("oauth_workspace_id", workspaceId, COOKIE_OPTIONS);
  }

  return response;
}

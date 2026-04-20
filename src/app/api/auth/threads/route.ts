import { NextRequest, NextResponse } from "next/server";
import { THREADS_OAUTH_SCOPES } from "@/lib/oauth-scopes";

export async function GET(request: NextRequest) {
  const appId = process.env.THREADS_APP_ID;
  const redirectUri = process.env.THREADS_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: "Threads credentials not configured" },
      { status: 500 }
    );
  }

  const workspaceId = new URL(request.url).searchParams.get("workspaceId") ?? "";

  const authUrl = new URL("https://threads.net/oauth/authorize");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", THREADS_OAUTH_SCOPES);
  authUrl.searchParams.set("response_type", "code");

  const response = NextResponse.redirect(authUrl.toString());
  if (workspaceId) {
    response.cookies.set("oauth_workspace_id", workspaceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    });
  }

  return response;
}

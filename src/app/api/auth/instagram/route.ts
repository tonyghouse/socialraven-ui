
// app/api/auth/instagram/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { INSTAGRAM_OAUTH_SCOPES } from "@/lib/oauth-scopes";

export async function GET(request: NextRequest) {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: 'Instagram credentials not configured' },
      { status: 500 }
    );
  }

  const workspaceId = new URL(request.url).searchParams.get("workspaceId") ?? "";

  // Build Instagram OAuth URL (matching your developer console format)
  const authUrl = new URL('https://www.instagram.com/oauth/authorize');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', INSTAGRAM_OAUTH_SCOPES);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('force_reauth', 'true'); // Optional: force re-auth each time

  const res = NextResponse.redirect(authUrl.toString());
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

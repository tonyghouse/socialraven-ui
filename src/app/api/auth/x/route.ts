import { NextRequest, NextResponse } from "next/server";

const TOKEN_URL = "https://api.twitter.com/2/oauth2/token";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const storedState = req.cookies.get("x_oauth_state")?.value;
  const verifier = req.cookies.get("x_oauth_verifier")?.value;

  if (!code || !state || !verifier) {
    return NextResponse.json(
      { error: "Invalid request", message: "Missing PKCE values" },
      { status: 400 }
    );
  }

  if (state !== storedState) {
    return NextResponse.json(
      { error: "State mismatch" },
      { status: 400 }
    );
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: process.env.X_CLIENT_ID!,
    redirect_uri: process.env.X_REDIRECT_URI!,
    code_verifier: verifier,
  });

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { 
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body,
  });

  const tokenJson = await tokenRes.json();

  if (!tokenRes.ok) {
    return NextResponse.json(
      { error: tokenJson.error, details: tokenJson },
      { status: 400 }
    );
  }

  return NextResponse.json(tokenJson);
}

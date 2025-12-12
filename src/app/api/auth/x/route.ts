// app/api/auth/x/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from "@/lib/x-oauth";

const X_CLIENT_ID = process.env.X_CLIENT_ID!;
const X_REDIRECT_URI = process.env.X_REDIRECT_URI!;

export async function GET(req: NextRequest) {
  const { getToken } = auth();
  const jwt = await getToken();

  if (!jwt) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // PKCE
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  // Store verifier in backend (not cookies!)
  const storeResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/x/store-pkce`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ verifier }),
    }
  );

  if (!storeResponse.ok) {
    return NextResponse.json({ error: "Failed to store PKCE" }, { status: 500 });
  }

  const { state } = await storeResponse.json();

  // Updated scopes with media.write
  const scope = [
    "tweet.read",
    "tweet.write",
    "tweet.moderate.write",
    "media.write",        // Required for media upload
    "users.read",
    "offline.access"
  ].join(" ");

  // Use x.com instead of twitter.com
  const authUrl =
    "https://x.com/i/oauth2/authorize" +
    `?response_type=code` +
    `&client_id=${encodeURIComponent(X_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(X_REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${state}` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256`;

  return NextResponse.redirect(authUrl);
}
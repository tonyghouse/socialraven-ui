// app/api/auth/x/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from "@/lib/x-oauth";

const X_CLIENT_ID = process.env.X_CLIENT_ID!;
const X_REDIRECT_URI = process.env.X_REDIRECT_URI!;
// e.g. http://localhost:3001/api/auth/x/callback

export async function GET(req: NextRequest) {
  console.log("🟢 Starting X OAuth flow");
  
  // PKCE
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  // CSRF protection
  const state = crypto.randomBytes(16).toString("hex");

  // ✅ URL-encode scope since it contains spaces
  const scope = encodeURIComponent([
    "tweet.read",
    "tweet.write",
    "users.read",
    "offline.access"
  ].join(" "));

  const authUrl =
    "https://twitter.com/i/oauth2/authorize" +
    `?response_type=code` +
    `&client_id=${encodeURIComponent(X_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(X_REDIRECT_URI)}` +
    `&scope=${scope}` +
    `&state=${state}` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256`;

  console.log("🔍 Generated Auth URL:", authUrl);
  console.log("🔍 Redirect URI:", X_REDIRECT_URI);
  console.log("🔍 Client ID:", X_CLIENT_ID?.substring(0, 10) + "...");

  const res = NextResponse.redirect(authUrl);

  // ✅ DELETE ALL OLD OAUTH COOKIES (both OAuth 1.0a and 2.0)
  // This prevents conflicts from previous auth attempts
  res.cookies.delete("x_oauth_state");
  res.cookies.delete("x_oauth_verifier");
  res.cookies.delete("x_oauth_secret");
  res.cookies.delete("x_oauth_token");
  res.cookies.delete("x_oauth_token_secret");

  // ✅ SET NEW COOKIES
  res.cookies.set("x_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60, // 10 minutes
    path: "/",
  });

  res.cookies.set("x_oauth_verifier", verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60, // 10 minutes
    path: "/",
  });

  console.log("🟢 Redirecting to Twitter with state:", state.substring(0, 8) + "...");

  return res;
}
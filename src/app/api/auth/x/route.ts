// app/api/auth/x/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from "@/lib/x-oauth";

const X_CLIENT_ID = process.env.X_CLIENT_ID!;
const X_REDIRECT_URI = process.env.X_REDIRECT_URI!;
// e.g. https://your-app.com/api/auth/x/callback

export async function GET(req: NextRequest) {
  // PKCE
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  // CSRF protection
  const state = crypto.randomBytes(16).toString("hex");

const scope = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "offline.access"
].join(" ");


  const authUrl =
    "https://twitter.com/i/oauth2/authorize" +
    `?response_type=code` +
    `&client_id=${encodeURIComponent(X_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(X_REDIRECT_URI)}` +
    `&scope=${scope}` +
    `&state=${state}` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256`;

  const res = NextResponse.redirect(authUrl);


res.cookies.set("x_oauth_state", state, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 10 * 60,
  path: "/",
});

res.cookies.set("x_oauth_verifier", verifier, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 10 * 60,
  path: "/",
});

return res;
}

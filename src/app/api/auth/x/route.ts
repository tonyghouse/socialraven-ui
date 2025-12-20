// app/api/auth/x/route.ts - OAuth 1.0a Implementation
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

const X_API_KEY = process.env.X_API_KEY!; // Consumer Key (OAuth 1.0a)
const X_API_SECRET = process.env.X_API_SECRET!; // Consumer Secret (OAuth 1.0a)
const X_CALLBACK_URL = process.env.X_REDIRECT_URI!;

// OAuth 1.0a signature generation
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string = ""
): string {
  // Sort parameters
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&");

  // Create signature base string
  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join("&");

  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  // Generate signature
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");

  return signature;
}

export async function GET(req: NextRequest) {
  console.log("🟢 Starting X OAuth 1.0a flow");

  const { getToken } = auth();
  const jwt = await getToken();

  if (!jwt) {
    console.error("❌ Not authenticated with Clerk");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Step 1: Request token from Twitter
    const requestTokenUrl = "https://api.twitter.com/oauth/request_token";
    
    const oauthParams: Record<string, string> = {
      oauth_callback: X_CALLBACK_URL,
      oauth_consumer_key: X_API_KEY,
      oauth_nonce: crypto.randomBytes(32).toString("base64").replace(/\W/g, ""),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: "1.0",
    };

    // Generate signature
    const signature = generateOAuthSignature(
      "POST",
      requestTokenUrl,
      oauthParams,
      X_API_SECRET
    );
    oauthParams.oauth_signature = signature;

    // Build Authorization header
    const authHeader =
      "OAuth " +
      Object.keys(oauthParams)
        .map((key) => `${key}="${encodeURIComponent(oauthParams[key])}"`)
        .join(", ");

    console.log("🔵 Requesting token from Twitter...");

    // Request token from Twitter
    const response = await fetch(requestTokenUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to get request token:", errorText);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=request_token_failed`
      );
    }

    const responseText = await response.text();
    const params = new URLSearchParams(responseText);
    const oauthToken = params.get("oauth_token");
    const oauthTokenSecret = params.get("oauth_token_secret");

    if (!oauthToken || !oauthTokenSecret) {
      console.error("❌ Missing oauth_token or oauth_token_secret");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=invalid_response`
      );
    }

    console.log("✅ Got request token:", oauthToken.substring(0, 10) + "...");

    // Store token secret in backend (more secure than cookies)
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/x/store-token-secret`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            oauthToken,
            oauthTokenSecret,
          }),
        }
      );
    } catch (e) {
      console.error("⚠️ Failed to store token secret in backend, will use cookies as fallback");
    }

    // Step 2: Redirect to Twitter authorization
    const authorizeUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`;

    const res = NextResponse.redirect(authorizeUrl);

    // Fallback: Store token secret in cookie (in case backend storage fails)
    res.cookies.set("x_oauth_token_secret", oauthTokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60, // 10 minutes
      path: "/",
    });

    // Clean up old OAuth 2.0 cookies if they exist
    res.cookies.delete("x_oauth_state");
    res.cookies.delete("x_oauth_verifier");

    console.log("🟢 Redirecting to Twitter authorization page");

    return res;
  } catch (error) {
    console.error("❌ OAuth 1.0a error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=exception`
    );
  }
}
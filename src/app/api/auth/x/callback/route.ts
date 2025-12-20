// app/api/auth/x/callback/route.ts - OAuth 1.0a Implementation
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

const X_API_KEY = process.env.X_API_KEY!;
const X_API_SECRET = process.env.X_API_SECRET!;

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string = ""
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&");

  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join("&");

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");

  return signature;
}

export async function GET(req: NextRequest) {
  console.log("🔵 OAuth 1.0a Callback hit");

  const { getToken } = auth();
  const jwt = await getToken();

  if (!jwt) {
    console.error("❌ Not authenticated with Clerk");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const oauthToken = url.searchParams.get("oauth_token");
  const oauthVerifier = url.searchParams.get("oauth_verifier");
  const denied = url.searchParams.get("denied");

  // User denied authorization
  if (denied) {
    console.log("⚠️ User denied authorization");
    const errorResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=user_denied`
    );
    errorResponse.cookies.delete("x_oauth_token_secret");
    return errorResponse;
  }

  if (!oauthToken || !oauthVerifier) {
    console.error("❌ Missing oauth_token or oauth_verifier");
    const errorResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=missing_params`
    );
    errorResponse.cookies.delete("x_oauth_token_secret");
    return errorResponse;
  }

  // Try to get token secret from backend first, fallback to cookie
  let tokenSecret = "";
  
  try {
    console.log("🔍 Attempting to retrieve token secret from backend...");
    const secretResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/x/get-token-secret?oauthToken=${oauthToken}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (secretResponse.ok) {
      const data = await secretResponse.json();
      tokenSecret = data.oauthTokenSecret;
      console.log("✅ Retrieved token secret from backend");
    } else {
      console.log("⚠️ Backend token secret not found, using cookie fallback");
    }
  } catch (e) {
    console.log("⚠️ Failed to fetch from backend, using cookie fallback");
  }

  // Fallback to cookie if backend didn't work
  if (!tokenSecret) {
    tokenSecret = req.cookies.get("x_oauth_token_secret")?.value || "";
    if (tokenSecret) {
      console.log("✅ Using token secret from cookie");
    }
  }

  if (!tokenSecret) {
    console.error("❌ Missing token secret in both backend and cookies");
    const errorResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=missing_secret`
    );
    errorResponse.cookies.delete("x_oauth_token_secret");
    return errorResponse;
  }

  try {
    // Step 3: Exchange for access token
    const accessTokenUrl = "https://api.twitter.com/oauth/access_token";

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: X_API_KEY,
      oauth_nonce: crypto.randomBytes(32).toString("base64").replace(/\W/g, ""),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: oauthToken,
      oauth_verifier: oauthVerifier,
      oauth_version: "1.0",
    };

    // Generate signature with token secret
    const signature = generateOAuthSignature(
      "POST",
      accessTokenUrl,
      oauthParams,
      X_API_SECRET,
      tokenSecret
    );
    oauthParams.oauth_signature = signature;

    // Build Authorization header
    const authHeader =
      "OAuth " +
      Object.keys(oauthParams)
        .map((key) => `${key}="${encodeURIComponent(oauthParams[key])}"`)
        .join(", ");

    console.log("🟡 Exchanging verifier for access token...");

    // Request access token
    const response = await fetch(accessTokenUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to get access token:", errorText);
      const errorResponse = NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=token_exchange_failed`
      );
      errorResponse.cookies.delete("x_oauth_token_secret");
      return errorResponse;
    }

    const responseText = await response.text();
    const params = new URLSearchParams(responseText);
    const accessToken = params.get("oauth_token");
    const accessTokenSecret = params.get("oauth_token_secret");
    const userId = params.get("user_id");
    const screenName = params.get("screen_name");

    if (!accessToken || !accessTokenSecret) {
      console.error("❌ Missing access token or secret");
      const errorResponse = NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=invalid_token`
      );
      errorResponse.cookies.delete("x_oauth_token_secret");
      return errorResponse;
    }

    console.log("✅ Got access token for user:", screenName);

    // Send to your backend
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/x/callback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          accessToken,
          accessTokenSecret,
          userId,
          screenName,
        }),
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("❌ Backend error:", errorText);
      const errorResponse = NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=backend_error`
      );
      errorResponse.cookies.delete("x_oauth_token_secret");
      return errorResponse;
    }

    console.log("✅ Successfully connected X account");

    // Success - clean up and redirect
    const successResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=success`
    );
    successResponse.cookies.delete("x_oauth_token_secret");
    
    return successResponse;

  } catch (error) {
    console.error("❌ OAuth callback error:", error);
    const errorResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=exception`
    );
    errorResponse.cookies.delete("x_oauth_token_secret");
    return errorResponse;
  }
}
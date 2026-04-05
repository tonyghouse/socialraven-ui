// app/api/auth/x/callback/route.ts - OAuth 1.0a Implementation
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import {
  buildClientConnectResultUrl,
  clearClientConnectCookies,
  getClientConnectContext,
} from "@/lib/client-connect-flow";

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

  return crypto
    .createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");
}

export async function GET(req: NextRequest) {
  console.log("🔵 OAuth 1.0a Callback hit");

  const url = new URL(req.url);
  const oauthToken = url.searchParams.get("oauth_token");
  const oauthVerifier = url.searchParams.get("oauth_verifier");
  const denied = url.searchParams.get("denied");
  const publicContext = getClientConnectContext(req);

  if (publicContext.token) {
    const finish = (status: "success" | "error", reason?: string) => {
      const response = NextResponse.redirect(
        buildClientConnectResultUrl(publicContext.token, "x", status, reason)
      );
      clearClientConnectCookies(response);
      return response;
    };

    if (denied) {
      return finish("error", "The X authorization request was denied.");
    }
    if (!oauthToken || !oauthVerifier || !publicContext.xTokenSecret) {
      return finish("error", "Missing X OAuth callback parameters.");
    }

    try {
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

      oauthParams.oauth_signature = generateOAuthSignature(
        "POST",
        accessTokenUrl,
        oauthParams,
        X_API_SECRET,
        publicContext.xTokenSecret
      );

      const authHeader =
        "OAuth " +
        Object.keys(oauthParams)
          .map((key) => `${key}="${encodeURIComponent(oauthParams[key])}"`)
          .join(", ");

      const response = await fetch(accessTokenUrl, {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        return finish("error", "Failed to exchange the X request token.");
      }

      const responseText = await response.text();
      const params = new URLSearchParams(responseText);
      const accessToken = params.get("oauth_token");
      const accessTokenSecret = params.get("oauth_token_secret");

      if (!accessToken || !accessTokenSecret) {
        return finish("error", "X did not return a valid access token.");
      }

      const backendResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/public/client-connect/${publicContext.token}/x/callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken,
            accessTokenSecret,
            actorDisplayName: publicContext.actorName,
            actorEmail: publicContext.actorEmail,
          }),
        }
      );

      if (!backendResponse.ok) {
        return finish("error", (await backendResponse.text()) || "X connection failed.");
      }

      return finish("success");
    } catch (error) {
      console.error("❌ Public X OAuth callback error:", error);
      return finish("error", "Unable to complete the X connection.");
    }
  }

  const { getToken } = await auth();
  const jwt = await getToken();

  if (!jwt) {
    console.error("❌ Not authenticated with Clerk");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const workspaceId = req.cookies.get("oauth_workspace_id")?.value ?? "";

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
  } catch {
    console.log("⚠️ Failed to fetch from backend, using cookie fallback");
  }

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

    oauthParams.oauth_signature = generateOAuthSignature(
      "POST",
      accessTokenUrl,
      oauthParams,
      X_API_SECRET,
      tokenSecret
    );

    const authHeader =
      "OAuth " +
      Object.keys(oauthParams)
        .map((key) => `${key}="${encodeURIComponent(oauthParams[key])}"`)
        .join(", ");

    console.log("🟡 Exchanging verifier for access token...");

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

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/x/callback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
          ...(workspaceId ? { "X-Workspace-Id": workspaceId } : {}),
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

    const successResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=success`
    );
    successResponse.cookies.delete("x_oauth_token_secret");
    successResponse.cookies.delete("oauth_workspace_id");
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

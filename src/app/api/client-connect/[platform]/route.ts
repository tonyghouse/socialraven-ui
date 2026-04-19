import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  applyClientConnectCookies,
  buildClientConnectResultUrl,
} from "@/lib/client-connect-flow";

const X_API_KEY = process.env.X_API_KEY!;
const X_API_SECRET = process.env.X_API_SECRET!;
const X_CALLBACK_URL = process.env.X_REDIRECT_URI!;

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

function resolvePlatform(request: NextRequest) {
  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export async function GET(request: NextRequest) {
  const platform = resolvePlatform(request);
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const actorName = request.nextUrl.searchParams.get("name") ?? "";
  const actorEmail = request.nextUrl.searchParams.get("email") ?? "";

  if (!token || !actorName || !actorEmail) {
    return NextResponse.json(
      { error: "Missing handoff token or client identity" },
      { status: 400 }
    );
  }

  const errorRedirect = (reason: string) =>
    NextResponse.redirect(
      buildClientConnectResultUrl(token, platform, "error", reason)
    );

  try {
    if (platform === "linkedin") {
      const state = crypto.randomUUID();
      const clientId = process.env.LINKEDIN_CLIENT_ID!;
      const redirectUri = encodeURIComponent(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`
      );
      const scopes = ["openid", "profile", "email", "w_member_social"].join(" ");
      const authUrl =
        `https://www.linkedin.com/oauth/v2/authorization` +
        `?response_type=code&client_id=${clientId}` +
        `&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}` +
        `&state=${state}`;

      const response = NextResponse.redirect(authUrl);
      applyClientConnectCookies(response, { token, actorName, actorEmail, state });
      return response;
    }

    if (platform === "youtube") {
      const state = crypto.randomUUID();
      const clientId = process.env.YT_CLIENT_ID!;
      const redirectUri = encodeURIComponent(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/youtube/callback`
      );
      const scopes = [
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube",
      ].join(" ");
      const authUrl =
        "https://accounts.google.com/o/oauth2/v2/auth" +
        `?client_id=${clientId}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${state}`;

      const response = NextResponse.redirect(authUrl);
      applyClientConnectCookies(response, { token, actorName, actorEmail, state });
      return response;
    }

    if (platform === "instagram") {
      const state = crypto.randomUUID();
      const appId = process.env.INSTAGRAM_APP_ID;
      const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
      if (!appId || !redirectUri) {
        return errorRedirect("Instagram credentials are not configured.");
      }

      const authUrl = new URL("https://www.instagram.com/oauth/authorize");
      authUrl.searchParams.set("client_id", appId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set(
        "scope",
        "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_manage_insights"
      );
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("force_reauth", "true");
      authUrl.searchParams.set("state", state);

      const response = NextResponse.redirect(authUrl.toString());
      applyClientConnectCookies(response, { token, actorName, actorEmail, state });
      return response;
    }

    if (platform === "facebook") {
      const state = crypto.randomUUID();
      const appId = process.env.FACEBOOK_APP_ID;
      const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
      if (!appId || !redirectUri) {
        return errorRedirect("Facebook credentials are not configured.");
      }

      const authUrl = new URL("https://www.facebook.com/v22.0/dialog/oauth");
      authUrl.searchParams.set("client_id", appId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set(
        "scope",
        "pages_show_list,pages_read_engagement,pages_manage_posts,public_profile,business_management"
      );
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("state", state);

      const response = NextResponse.redirect(authUrl.toString());
      applyClientConnectCookies(response, { token, actorName, actorEmail, state });
      return response;
    }

    if (platform === "tiktok") {
      const state = crypto.randomUUID();
      const clientKey = process.env.TIKTOK_CLIENT_KEY;
      const redirectUri = process.env.TIKTOK_REDIRECT_URI;
      if (!clientKey || !redirectUri) {
        return errorRedirect("TikTok credentials are not configured.");
      }

      const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
      authUrl.searchParams.set("client_key", clientKey);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "user.info.basic");
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("state", state);

      const response = NextResponse.redirect(authUrl.toString());
      applyClientConnectCookies(response, { token, actorName, actorEmail, state });
      return response;
    }

    if (platform === "x") {
      const requestTokenUrl = "https://api.twitter.com/oauth/request_token";
      const oauthParams: Record<string, string> = {
        oauth_callback: X_CALLBACK_URL,
        oauth_consumer_key: X_API_KEY,
        oauth_nonce: crypto.randomBytes(32).toString("base64").replace(/\W/g, ""),
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_version: "1.0",
      };

      oauthParams.oauth_signature = generateOAuthSignature(
        "POST",
        requestTokenUrl,
        oauthParams,
        X_API_SECRET
      );

      const authHeader =
        "OAuth " +
        Object.keys(oauthParams)
          .map((key) => `${key}="${encodeURIComponent(oauthParams[key])}"`)
          .join(", ");

      const response = await fetch(requestTokenUrl, {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        return errorRedirect("Failed to start the X authorization flow.");
      }

      const responseText = await response.text();
      const params = new URLSearchParams(responseText);
      const oauthToken = params.get("oauth_token");
      const oauthTokenSecret = params.get("oauth_token_secret");

      if (!oauthToken || !oauthTokenSecret) {
        return errorRedirect("X did not return a valid request token.");
      }

      const redirect = NextResponse.redirect(
        `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`
      );
      applyClientConnectCookies(redirect, {
        token,
        actorName,
        actorEmail,
        xTokenSecret: oauthTokenSecret,
      });
      return redirect;
    }

    return errorRedirect("Unsupported platform.");
  } catch (error) {
    console.error("Client connect initiation failed:", error);
    return errorRedirect("Unable to start the secure handoff.");
  }
}

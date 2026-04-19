import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  buildClientConnectResultUrl,
  clearClientConnectCookies,
  getClientConnectContext,
} from "@/lib/client-connect-flow";

const TIKTOK_STATE_COOKIE = "oauth_tiktok_state";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const state = searchParams.get("state");
  const publicContext = getClientConnectContext(req);

  if (publicContext.token) {
    const finish = (status: "success" | "error", reason?: string) => {
      const response = NextResponse.redirect(
        buildClientConnectResultUrl(publicContext.token, "tiktok", status, reason)
      );
      clearClientConnectCookies(response);
      response.cookies.delete(TIKTOK_STATE_COOKIE);
      return response;
    };

    if (error) {
      return finish("error", errorDescription || error);
    }
    if (!code) {
      return finish("error", "Missing TikTok authorization code.");
    }
    if (!state || state !== publicContext.state) {
      return finish("error", "TikTok state validation failed.");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/public/client-connect/${publicContext.token}/tiktok/callback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          actorDisplayName: publicContext.actorName,
          actorEmail: publicContext.actorEmail,
        }),
      }
    );

    if (!response.ok) {
      return finish("error", (await response.text()) || "TikTok connection failed.");
    }

    return finish("success");
  }

  const finishWorkspace = (status: "success" | "error", reason?: string) => {
    const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts`);
    url.searchParams.set("provider", "tiktok");
    url.searchParams.set("status", status);
    if (reason) {
      url.searchParams.set("reason", reason);
    }
    const response = NextResponse.redirect(url.toString());
    response.cookies.delete(TIKTOK_STATE_COOKIE);
    return response;
  };

  if (error) {
    return finishWorkspace("error", errorDescription || error);
  }

  if (!code) {
    return finishWorkspace("error", "no_code");
  }

  const expectedState = req.cookies.get(TIKTOK_STATE_COOKIE)?.value ?? "";
  if (!state || !expectedState || state !== expectedState) {
    return finishWorkspace("error", "state_mismatch");
  }

  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return finishWorkspace("error", "unauthorized");
  }

  const workspaceId = req.cookies.get("oauth_workspace_id")?.value ?? "";
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/tiktok/callback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(workspaceId ? { "X-Workspace-Id": workspaceId } : {}),
      },
      body: JSON.stringify({ code }),
    }
  );

  if (!response.ok) {
    return finishWorkspace("error", (await response.text()) || "backend_error");
  }

  return finishWorkspace("success");
}

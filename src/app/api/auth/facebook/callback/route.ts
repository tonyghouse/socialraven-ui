import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  buildClientConnectResultUrl,
  clearClientConnectCookies,
  getClientConnectContext,
} from "@/lib/client-connect-flow";

const FACEBOOK_STATE_COOKIE = "oauth_facebook_state";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");
  const errorDescription = searchParams.get("error_description");
  const state = searchParams.get("state");
  const publicContext = getClientConnectContext(req);

  if (publicContext.token) {
    const finish = (status: "success" | "error", reason?: string) => {
      const response = NextResponse.redirect(
        buildClientConnectResultUrl(publicContext.token, "facebook", status, reason)
      );
      clearClientConnectCookies(response);
      response.cookies.delete(FACEBOOK_STATE_COOKIE);
      return response;
    };

    if (error) {
      return finish("error", errorDescription || errorReason || error);
    }
    if (!code) {
      return finish("error", "Missing Facebook authorization code.");
    }
    if (!state || state !== publicContext.state) {
      return finish("error", "Facebook state validation failed.");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/public/client-connect/${publicContext.token}/facebook/callback`,
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
      return finish("error", (await response.text()) || "Facebook connection failed.");
    }

    return finish("success");
  }

  const finishWorkspace = (status: "success" | "error", reason?: string) => {
    const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts`);
    url.searchParams.set("provider", "facebook");
    url.searchParams.set("status", status);
    if (reason) {
      url.searchParams.set("reason", reason);
    }

    const response = NextResponse.redirect(url.toString());
    response.cookies.delete(FACEBOOK_STATE_COOKIE);
    return response;
  };

  if (error) {
    return finishWorkspace("error", errorDescription || errorReason || error);
  }

  if (!code) {
    return finishWorkspace("error", "no_code");
  }

  const expectedState = req.cookies.get(FACEBOOK_STATE_COOKIE)?.value ?? "";
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
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/facebook/callback`,
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

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  buildClientConnectResultUrl,
  clearClientConnectCookies,
  getClientConnectContext,
} from "@/lib/client-connect-flow";

export async function GET(req: NextRequest) {
  const publicContext = getClientConnectContext(req);
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (publicContext.token) {
    const finish = (status: "success" | "error", reason?: string) => {
      const response = NextResponse.redirect(
        buildClientConnectResultUrl(publicContext.token, "youtube", status, reason)
      );
      clearClientConnectCookies(response);
      return response;
    };

    if (error) {
      return finish("error", error);
    }
    if (!code) {
      return finish("error", "Missing YouTube authorization code.");
    }
    if (!state || state !== publicContext.state) {
      return finish("error", "YouTube state validation failed.");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/public/client-connect/${publicContext.token}/youtube/callback`,
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
      return finish("error", (await response.text()) || "YouTube connection failed.");
    }

    return finish("success");
  }

  const { getToken } = await auth();
  const jwt = await getToken();

  if (!jwt) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const workspaceId = req.cookies.get("oauth_workspace_id")?.value ?? "";

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=youtube&status=error`
    );
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/youtube/callback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
          ...(workspaceId ? { "X-Workspace-Id": workspaceId } : {}),
        },
        body: JSON.stringify({ code }),
      }
    );

    if (!response.ok) {
      console.error("YouTube callback failed:", await response.text());
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=youtube&status=error`
      );
    }

    // backend returned ok → success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=youtube&status=success`
    );
  } catch (err) {
    console.error("YouTube callback error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=youtube&status=error`
    );
  }
}

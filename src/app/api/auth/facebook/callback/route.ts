// app/api/auth/facebook/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  buildClientConnectResultUrl,
  clearClientConnectCookies,
  getClientConnectContext,
} from "@/lib/client-connect-flow";

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

  // Handle OAuth errors from Facebook
  if (error) {
    console.error("Facebook OAuth error:", { error, errorReason, errorDescription });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=facebook&status=error&reason=${error}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=facebook&status=error&reason=no_code`
    );
  }

  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=facebook&status=error&reason=unauthorized`
    );
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
    console.log("Backend returned error:", await response.text());
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=facebook&status=error`
    );
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=facebook&status=success`
  );
}

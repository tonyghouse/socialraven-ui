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
  const errorDescription = searchParams.get("error_description");
  const publicContext = getClientConnectContext(req);

  if (publicContext.token) {
    const finish = (status: "success" | "error", reason?: string) => {
      const response = NextResponse.redirect(
        buildClientConnectResultUrl(publicContext.token, "threads", status, reason)
      );
      clearClientConnectCookies(response);
      return response;
    };

    if (error) {
      return finish("error", errorDescription || error);
    }
    if (!code) {
      return finish("error", "Missing Threads authorization code.");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/public/client-connect/${publicContext.token}/threads/callback`,
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
      return finish("error", (await response.text()) || "Threads connection failed.");
    }

    return finish("success");
  }

  if (error) {
    console.error("Threads OAuth error:", { error, errorDescription });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=threads&status=error&reason=${encodeURIComponent(
        errorDescription || error
      )}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=threads&status=error&reason=no_code`
    );
  }

  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=threads&status=error&reason=unauthorized`
    );
  }

  const workspaceId = req.cookies.get("oauth_workspace_id")?.value ?? "";

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/threads/callback`,
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
    console.log("Threads backend returned error:", await response.text());
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=threads&status=error`
    );
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=threads&status=success`
  );
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {

      const { getToken } = await auth();
      const jwt = await getToken();

      if (!jwt) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

  const workspaceId = req.cookies.get("oauth_workspace_id")?.value ?? "";
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

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

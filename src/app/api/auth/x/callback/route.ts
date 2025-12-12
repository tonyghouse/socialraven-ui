// app/api/auth/x/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { getToken } = auth();
  const jwt = await getToken();

  if (!jwt) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    console.error("Missing code or state");
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error`
    );
  }

  try {
    // Get verifier from backend (NO COOKIES!)
    const pkceResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/x/get-pkce?state=${state}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (!pkceResponse.ok) {
      console.error("Failed to get PKCE data");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error`
      );
    }

    const { verifier: codeVerifier } = await pkceResponse.json();

    // Send to your existing backend endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/x/callback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          code,
          codeVerifier,
        }),
      }
    );

    if (!response.ok) {
      console.error("X OAuth callback failed:", await response.text());
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error`
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=success`
    );

  } catch (err) {
    console.error("X OAuth callback exception:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error`
    );
  }
}
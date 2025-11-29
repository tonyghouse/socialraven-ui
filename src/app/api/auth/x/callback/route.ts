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
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error`
    );
  }

  // 🔥 Correct way: get cookies using NextRequest API
  const expectedState = req.cookies.get("x_oauth_state")?.value || "";
  const codeVerifier = req.cookies.get("x_oauth_verifier")?.value || "";

  // 🔥 Validate PKCE + CSRF
  if (!expectedState || !codeVerifier || expectedState !== state) {
    console.error("PKCE mismatch", {
      expectedState,
      receivedState: state,
      codeVerifierExists: !!codeVerifier,
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error`
    );
  }

  try {
    // Send code + PKCE verifier to your backend
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

    // Success
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

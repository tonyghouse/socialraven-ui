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
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error`
    );
  }

  // Get cookies
  const expectedState = req.cookies.get("x_oauth_state")?.value || "";
  const codeVerifier = req.cookies.get("x_oauth_verifier")?.value || "";

  // Validate PKCE + CSRF
  if (!expectedState || !codeVerifier || expectedState !== state) {
    console.error("PKCE mismatch", {
      expectedState,
      receivedState: state,
      codeVerifierExists: !!codeVerifier,
    });

    // Delete cookies even on error
    const errorResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error`
    );
    errorResponse.cookies.delete("x_oauth_state");
    errorResponse.cookies.delete("x_oauth_verifier");
    return errorResponse;
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

      // Delete cookies on error
      const errorResponse = NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error`
      );
      errorResponse.cookies.delete("x_oauth_state");
      errorResponse.cookies.delete("x_oauth_verifier");
      return errorResponse;
    }

    // ✅ SUCCESS - DELETE COOKIES IMMEDIATELY TO PREVENT REUSE
    const successResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=success`
    );
    successResponse.cookies.delete("x_oauth_state");
    successResponse.cookies.delete("x_oauth_verifier");
    return successResponse;

  } catch (err) {
    console.error("X OAuth callback exception:", err);

    // Delete cookies on exception
    const errorResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error`
    );
    errorResponse.cookies.delete("x_oauth_state");
    errorResponse.cookies.delete("x_oauth_verifier");
    return errorResponse;
  }
}
// app/api/auth/x/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  console.log("🔵 Callback hit:", {
    url: req.url,
    cookies: req.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
  });

  const { getToken } = auth();
  const jwt = await getToken();

  if (!jwt) {
    console.error("❌ Not authenticated with Clerk");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Handle Twitter authorization errors
  if (error) {
    console.error("❌ Twitter returned error:", error);
    const errorResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=twitter_${error}`
    );
    errorResponse.cookies.delete("x_oauth_state");
    errorResponse.cookies.delete("x_oauth_verifier");
    errorResponse.cookies.delete("x_oauth_secret");
    errorResponse.cookies.delete("x_oauth_token");
    errorResponse.cookies.delete("x_oauth_token_secret");
    return errorResponse;
  }

  if (!code || !state) {
    console.error("❌ Missing code or state parameter");
    const errorResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=missing_params`
    );
    errorResponse.cookies.delete("x_oauth_state");
    errorResponse.cookies.delete("x_oauth_verifier");
    errorResponse.cookies.delete("x_oauth_secret");
    errorResponse.cookies.delete("x_oauth_token");
    errorResponse.cookies.delete("x_oauth_token_secret");
    return errorResponse;
  }

  // Get cookies
  const expectedState = req.cookies.get("x_oauth_state")?.value || "";
  const codeVerifier = req.cookies.get("x_oauth_verifier")?.value || "";

  // Validate PKCE + CSRF
  if (!expectedState || !codeVerifier || expectedState !== state) {
    console.error("❌ OAuth validation failed:", {
      hasExpectedState: !!expectedState,
      hasCodeVerifier: !!codeVerifier,
      stateMatch: expectedState === state,
      expectedState: expectedState?.substring(0, 8) + "...",
      receivedState: state?.substring(0, 8) + "...",
    });

    // Delete cookies even on error
    const errorResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=state_mismatch`
    );
    errorResponse.cookies.delete("x_oauth_state");
    errorResponse.cookies.delete("x_oauth_verifier");
    errorResponse.cookies.delete("x_oauth_secret");
    errorResponse.cookies.delete("x_oauth_token");
    errorResponse.cookies.delete("x_oauth_token_secret");
    return errorResponse;
  }

  try {
    console.log("🟡 Sending code to backend...");
    
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
      const errorText = await response.text();
      console.error("❌ X OAuth callback failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      // Delete cookies on error
      const errorResponse = NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=backend_error`
      );
      errorResponse.cookies.delete("x_oauth_state");
      errorResponse.cookies.delete("x_oauth_verifier");
      errorResponse.cookies.delete("x_oauth_secret");
      errorResponse.cookies.delete("x_oauth_token");
      errorResponse.cookies.delete("x_oauth_token_secret");
      return errorResponse;
    }

    console.log("✅ X OAuth callback successful");

    // ✅ SUCCESS - DELETE ALL COOKIES IMMEDIATELY TO PREVENT REUSE
    const successResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=success`
    );
    successResponse.cookies.delete("x_oauth_state");
    successResponse.cookies.delete("x_oauth_verifier");
    successResponse.cookies.delete("x_oauth_secret");
    successResponse.cookies.delete("x_oauth_token");
    successResponse.cookies.delete("x_oauth_token_secret");
    return successResponse;

  } catch (err) {
    console.error("❌ X OAuth callback exception:", err);

    // Delete cookies on exception
    const errorResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error&reason=exception`
    );
    errorResponse.cookies.delete("x_oauth_state");
    errorResponse.cookies.delete("x_oauth_verifier");
    errorResponse.cookies.delete("x_oauth_secret");
    errorResponse.cookies.delete("x_oauth_token");
    errorResponse.cookies.delete("x_oauth_token_secret");
    return errorResponse;
  }
}
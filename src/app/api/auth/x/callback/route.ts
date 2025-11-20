import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const oauth_token = url.searchParams.get("oauth_token");
  const oauth_verifier = url.searchParams.get("oauth_verifier");

  // Read stored token secret from secure cookie
  const oauth_token_secret = cookies().get("x_oauth_token_secret")?.value;

  if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
    console.log("oauth_token:", oauth_token);
    console.log("oauth_verifier:", oauth_verifier);
    console.log("x_oauth_token_secret:", oauth_token_secret);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=linkedin&status=error`
    );
  }

  const { getToken } = auth();
  const jwt = await getToken();

  if (!jwt) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Exchange for access token in backend
  const backendRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/x/access-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        oauth_token,
        oauth_verifier,
        oauth_token_secret,
      }),
    }
  );

  if (!backendRes.ok) {
    console.log("Backend returned error:", await backendRes.text());
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=error`
    );
  }

  // Redirect to success page
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?provider=x&status=success`
  );
}

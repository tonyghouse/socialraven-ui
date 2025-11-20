import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { getToken } = auth();
  const token = await getToken();

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/x/request-token`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?x=error`
    );
  }

  const data = await res.json();

  // Create redirect response
  const response = NextResponse.redirect(data.auth_url);

  // Attach cookie directly to redirect response
 response.cookies.set({
  name: "x_oauth_token_secret",
  value: data.oauth_token_secret,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

  return response;
}

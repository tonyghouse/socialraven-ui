import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const redirectUri = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`
  );

  const state = crypto.randomUUID();

  const scopes = ["openid", "profile", "email", "w_member_social"].join(" ");

  const url =
    `https://www.linkedin.com/oauth/v2/authorization` +
    `?response_type=code&client_id=${clientId}` +
    `&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}` +
    `&state=${state}`;

  return NextResponse.redirect(url);
}

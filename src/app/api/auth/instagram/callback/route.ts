import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL_FB}/connected-accounts?provider=instagram&status=error`
    );
  }

  await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/instagram/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL_FB}/connected-accounts?provider=instagram&status=success`
  );
}

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const { getToken } = auth();
  const token = await getToken();

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/linkedin/callback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code }),
    }
  );

  if (!response.ok) {
    const msg = await response.text();
    return NextResponse.json(
      { error: "Backend error", detail: msg },
      { status: 500 }
    );
  }

  return NextResponse.redirect(
  `${process.env.NEXT_PUBLIC_BASE_URL}/connect-accounts?linkedin=success`
  );
}

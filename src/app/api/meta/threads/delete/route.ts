import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function getBaseUrl(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return request.nextUrl.origin;
}

function buildDeletionResponse(request: NextRequest) {
  const confirmationCode = `threads_${randomUUID().replace(/-/g, "")}`;
  const statusUrl = `${getBaseUrl(request)}/meta/data-deletion?code=${confirmationCode}`;

  return new NextResponse(
    `{ url: '${statusUrl}', confirmation_code: '${confirmationCode}' }`,
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET(request: NextRequest) {
  return buildDeletionResponse(request);
}

export async function POST(request: NextRequest) {
  return buildDeletionResponse(request);
}

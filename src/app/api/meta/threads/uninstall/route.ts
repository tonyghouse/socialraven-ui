import { NextRequest, NextResponse } from "next/server";

function buildAckResponse() {
  return NextResponse.json(
    { status: "ok" },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET() {
  return buildAckResponse();
}

export async function POST(_request: NextRequest) {
  return buildAckResponse();
}

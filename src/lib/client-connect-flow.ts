import type { NextRequest, NextResponse } from "next/server";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 10 * 60,
  path: "/",
};

export const CLIENT_CONNECT_COOKIE_NAMES = [
  "client_connect_token",
  "client_connect_name",
  "client_connect_email",
  "client_connect_state",
  "client_x_oauth_token_secret",
] as const;

export function getClientConnectContext(req: NextRequest) {
  return {
    token: req.cookies.get("client_connect_token")?.value ?? "",
    actorName: req.cookies.get("client_connect_name")?.value ?? "",
    actorEmail: req.cookies.get("client_connect_email")?.value ?? "",
    state: req.cookies.get("client_connect_state")?.value ?? "",
    xTokenSecret: req.cookies.get("client_x_oauth_token_secret")?.value ?? "",
  };
}

export function applyClientConnectCookies(
  response: NextResponse,
  input: {
    token: string;
    actorName: string;
    actorEmail: string;
    state?: string;
    xTokenSecret?: string;
  }
) {
  response.cookies.set("client_connect_token", input.token, COOKIE_OPTIONS);
  response.cookies.set("client_connect_name", input.actorName, COOKIE_OPTIONS);
  response.cookies.set("client_connect_email", input.actorEmail, COOKIE_OPTIONS);
  if (input.state) {
    response.cookies.set("client_connect_state", input.state, COOKIE_OPTIONS);
  }
  if (input.xTokenSecret) {
    response.cookies.set("client_x_oauth_token_secret", input.xTokenSecret, COOKIE_OPTIONS);
  }
}

export function clearClientConnectCookies(response: NextResponse) {
  CLIENT_CONNECT_COOKIE_NAMES.forEach((name) => response.cookies.delete(name));
}

export function buildClientConnectResultUrl(
  token: string,
  platform: string,
  status: "success" | "error",
  reason?: string
) {
  const url = new URL(
    `/client-connect/${encodeURIComponent(token)}`,
    process.env.NEXT_PUBLIC_BASE_URL
  );
  url.searchParams.set("provider", platform);
  url.searchParams.set("status", status);
  if (reason) {
    url.searchParams.set("reason", reason);
  }
  return url.toString();
}

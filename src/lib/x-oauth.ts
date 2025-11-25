// lib/x-oauth.ts
import crypto from "crypto";

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  const random = crypto.randomBytes(32);
  return base64UrlEncode(random);
}

export async function generateCodeChallenge(
  verifier: string
): Promise<string> {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return base64UrlEncode(hash);
}

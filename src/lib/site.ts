const FALLBACK_SITE_URL = "https://www.socialraven.io";

export const SITE_NAME = "SocialRaven";

export function getSiteUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? FALLBACK_SITE_URL;

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function getMetadataBase() {
  try {
    return new URL(getSiteUrl());
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
}

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getSiteUrl()}${normalizedPath}`;
}

export function toJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

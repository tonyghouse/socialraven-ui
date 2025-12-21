export const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  const needsProxy = ["linkedin.com", "licdn.com"];
  const requiresProxy = needsProxy.some((d) => url.includes(d));
  return requiresProxy ? `/api/proxy-image?url=${encodeURIComponent(url)}` : url;
};
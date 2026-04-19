export const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  const isRemoteUrl = /^https?:\/\//i.test(url);
  return isRemoteUrl ? `/api/proxy-image?url=${encodeURIComponent(url)}` : url;
};

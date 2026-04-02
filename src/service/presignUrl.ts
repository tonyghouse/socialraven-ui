import { workspaceIdHeader } from "@/lib/api-headers";

export async function getPresignedUrl(file: File, getToken: any) {
  const tokenStart = performance.now();
  const token = await getToken();
  const tokenDurationMs = Math.round(performance.now() - tokenStart);

  const requestStart = performance.now();

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/presign`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...workspaceIdHeader(),
    },
    body: new URLSearchParams({
      fileName: file.name,
      mimeType: file.type,
    }),
  });

  if (!res.ok) throw new Error("Failed to get presigned URL");

  const browserDurationMs = Math.round(performance.now() - requestStart);
  const serverDurationMs = Number(res.headers.get("X-Presign-Latency-Ms") || "0");
  const networkAndOverheadMs = Math.max(browserDurationMs - serverDurationMs, 0);
  const serverTiming = res.headers.get("Server-Timing") || "";

  if (browserDurationMs > 700 || tokenDurationMs > 300 || serverDurationMs > 300) {
    console.warn("Slow presign detected", {
      fileName: file.name,
      fileSizeBytes: file.size,
      tokenDurationMs,
      browserDurationMs,
      serverDurationMs,
      networkAndOverheadMs,
      serverTiming,
    });
  }

  return res.json(); // { uploadUrl, fileKey }
}

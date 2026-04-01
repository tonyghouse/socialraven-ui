import { workspaceIdHeader } from "@/lib/api-headers";

export async function getPresignedUrl(file: File, getToken: any) {
  const token = await getToken();
  const startedAt = performance.now();

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

  const durationMs = Math.round(performance.now() - startedAt);
  const serverDurationMs = Number(res.headers.get("X-Presign-Latency-Ms") || "0");

  if (durationMs > 1000 || serverDurationMs > 300) {
    console.warn("Slow presign detected", {
      fileName: file.name,
      fileSizeBytes: file.size,
      browserDurationMs: durationMs,
      serverDurationMs,
    });
  }

  return res.json(); // { uploadUrl, fileKey }
}

export async function uploadToS3(uploadUrl: string, file: File) {
  const startedAt = performance.now();

  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,                       // ❗ NO CUSTOM HEADERS
    headers: {
      "Content-Type": file.type       // ❗ only this one is allowed
    }
  });

  const durationMs = Math.round(performance.now() - startedAt);

  if (!res.ok) {
    const text = await res.text();
    console.error("S3 upload failed:", { status: res.status, durationMs, body: text });
    throw new Error(`Failed to upload to S3 (status ${res.status})`);
  }

  if (durationMs > 10_000) {
    console.warn("Slow S3 upload detected", {
      durationMs,
      fileName: file.name,
      sizeBytes: file.size,
      mimeType: file.type,
    });
  }
}

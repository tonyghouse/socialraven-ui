export async function uploadToS3(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,                       // ❗ NO CUSTOM HEADERS
    headers: {
      "Content-Type": file.type       // ❗ only this one is allowed
    }
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Upload failed:", text);
    throw new Error("Failed to upload to Tigris");
  }
}

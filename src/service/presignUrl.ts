export async function getPresignedUrl(file: File, getToken: any) {
  const token = await getToken();

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/presign`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      fileName: file.name,
      mimeType: file.type,
    }),
  });

  if (!res.ok) throw new Error("Failed to get presigned URL");
  
  return res.json(); // { uploadUrl, fileUrl, fileKey }
}

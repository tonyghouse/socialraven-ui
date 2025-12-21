import type { MediaResponse } from "@/model/MediaResponse";

export interface Media {
  url: string;
  type?: "IMAGE" | "VIDEO" | "DOCUMENT";
  name?: string;
}

export function mapMediaResponseToMedia(m: MediaResponse): Media {
  let type: Media["type"] = "DOCUMENT";

  if (m.mimeType.startsWith("image/")) {
    type = "IMAGE";
  } else if (m.mimeType.startsWith("video/")) {
    type = "VIDEO";
  }

  return {
    url: m.fileUrl,      // ✅ FIX
    name: m.fileName,
    type,
  };
}

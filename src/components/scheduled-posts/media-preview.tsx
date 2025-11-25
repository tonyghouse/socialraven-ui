"use client"

import { PostMedia } from "@/model/PostMedia"
import { Play, FileText, Music, AlertCircle } from "lucide-react"
import { useState } from "react"

interface MediaPreviewProps {
  media: PostMedia
}

export function MediaPreview({ media }: MediaPreviewProps) {
  const [isError, setIsError] = useState(false)

  const isVideo = media.mimeType.startsWith("video/")
  const isAudio = media.mimeType.startsWith("audio/")
  const isImage = media.mimeType.startsWith("image/")

  if (isError) {
    return (
      <div className="w-32 h-32 bg-secondary/50 rounded-lg flex items-center justify-center border border-border">
        <AlertCircle className="w-6 h-6 text-muted-foreground" />
      </div>
    )
  }

  if (isImage) {
    return (
      <img
        src={media.fileUrl || "/placeholder.svg"}
        alt={media.fileName}
        onError={() => setIsError(true)}
        className="w-32 h-32 rounded-lg object-cover border border-border hover:border-primary/50 transition-colors"
      />
    )
  }

  if (isVideo) {
    return (
      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border group">
        <video src={media.fileUrl} className="w-full h-full object-cover" onError={() => setIsError(true)} />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
          <Play className="w-8 h-8 text-white fill-white" />
        </div>
      </div>
    )
  }

  if (isAudio) {
    return (
      <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex flex-col items-center justify-center border border-border p-2">
        <Music className="w-8 h-8 text-primary mb-2" />
        <p className="text-xs text-center text-foreground/60 truncate">{media.fileName}</p>
      </div>
    )
  }

  // Generic file preview
  return (
    <div className="w-32 h-32 bg-secondary/50 rounded-lg flex flex-col items-center justify-center border border-border p-2">
      <FileText className="w-8 h-8 text-muted-foreground mb-2" />
      <p className="text-xs text-center text-foreground/60 truncate">{media.fileName}</p>
    </div>
  )
}

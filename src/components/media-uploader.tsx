"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, Play } from "lucide-react"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface MediaUploaderProps {
  files: File[]
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
}

export default function MediaUploader({ files, setFiles }: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  const addFiles = (newFiles: File[]) => {
    const MAX_FILES = 10
    const validFiles = newFiles.filter((file) => {
      const isImage = file.type.startsWith("image/")
      const isVideo = file.type.startsWith("video/")
      if (!isImage && !isVideo) {
        toast.error(`${file.name} is not an image or video`)
        return false
      }
      return true
    })

    if (files.length + validFiles.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`)
      return
    }

    setFiles((prev) => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const renderMediaPreview = (file: File) => {
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(file) || "/placeholder.svg"}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      )
    } else if (file.type.startsWith("video/")) {
      return <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
    }
    return null
  }

  return (
    <div className="space-y-5">
      <Label className="text-sm font-medium">
        Media <span className="text-muted-foreground">(Optional)</span>
      </Label>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
          dragActive
            ? "border-primary bg-primary/8 scale-[1.02]"
            : "border-border bg-gradient-to-br from-muted/40 to-muted/20 hover:border-primary/60 hover:from-muted/60"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
          <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-3.5">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Drop your media here</p>
            <p className="text-sm text-muted-foreground mt-1">or click to select (up to 10 files)</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </p>
            <p className="text-xs text-muted-foreground">{files.length}/10</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {files.map((file, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg border border-border/60 bg-muted/40 aspect-square shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/40"
              >
                {/* Media content */}
                <div className="relative w-full h-full bg-gradient-to-br from-background to-muted/30 flex items-center justify-center overflow-hidden">
                  {renderMediaPreview(file)}
                </div>

                {file.type.startsWith("video/") && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 rounded-full p-2.5">
                      <Play className="h-5 w-5 text-black fill-black" />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-destructive/90 hover:bg-destructive rounded-lg p-1.5 shadow-md"
                >
                  <X className="h-4 w-4 text-white" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-xs text-white truncate font-medium leading-tight">{file.name}</p>
                  <p className="text-xs text-white/70 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

"use client";

import { useRef } from "react";
import { X, Plus, GripVertical, Upload } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  files: File[];
  setFiles: (v: File[]) => void;
  accept?: string;
  label?: string;
  /** Hard cap on how many files can be added. Defaults to 10. */
  maxFiles?: number;
  /** Label shown next to the file count, e.g. "X / Twitter" */
  maxFilesLabel?: string;
  appearance?: "default" | "geist";
}

export default function MediaUploader({
  files,
  setFiles,
  accept = "image/*,video/*",
  label = "Add Media",
  maxFiles = 10,
  maxFilesLabel,
  appearance = "default",
}: Props) {
  const isGeist = appearance === "geist";
  const inputRef = useRef<HTMLInputElement>(null);

  function pickMedia() {
    inputRef.current?.click();
  }

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const updated  = [...files, ...selected].slice(0, maxFiles);
    setFiles(updated);
    if (inputRef.current) inputRef.current.value = "";
  }

  const remove = (file: File) => setFiles(files.filter((f) => f !== file));

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={onSelect}
        hidden
      />

      <motion.button
        onClick={pickMedia}
        type="button"
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className={`group relative w-full overflow-hidden rounded-xl border border-dashed transition-[border-color,background-color,box-shadow] duration-150
          ${files.length === 0
            ? isGeist
              ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] py-8 hover:border-[var(--ds-plum-200)] hover:bg-[var(--ds-gray-100)]"
              : "border-border-subtle bg-surface py-8 hover:border-[hsl(var(--accent))]/25 hover:bg-surface-raised"
            : isGeist
              ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] py-3 hover:border-[var(--ds-plum-200)] hover:bg-[var(--ds-gray-100)]"
              : "border-border-subtle bg-surface py-3 hover:border-[hsl(var(--accent))]/20 hover:bg-surface-raised"
          }`}
      >
        <div className="flex items-center justify-center gap-3">
          <div className={`relative flex-shrink-0 ${files.length === 0 ? "w-10 h-10" : "w-8 h-8"}`}>
            <div
              className={cn(
                "absolute inset-0 rounded-full blur-md transition-all",
                isGeist
                  ? "bg-[var(--ds-plum-100)] group-hover:bg-[var(--ds-plum-200)]"
                  : "bg-[hsl(var(--accent))]/10 group-hover:bg-[hsl(var(--accent))]/14"
              )}
            />
            <div
              className={cn(
                "relative flex h-full w-full items-center justify-center rounded-full border transition-colors",
                isGeist
                  ? "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)]"
                  : "border-[hsl(var(--accent))]/12 bg-[hsl(var(--accent))]/8"
              )}
            >
              {files.length === 0
                ? <Upload className={cn("h-5 w-5", isGeist ? "text-[var(--ds-plum-700)]" : "text-[hsl(var(--accent))]")} />
                : <Plus className={cn("h-4 w-4", isGeist ? "text-[var(--ds-plum-700)]" : "text-[hsl(var(--accent))]")} />
              }
            </div>
          </div>
          <div className="text-left">
            <p className={cn(isGeist ? "text-label-14 text-[var(--ds-gray-1000)]" : "text-sm font-semibold text-foreground")}>{label}</p>
            {files.length === 0 && (
              <p className={cn("mt-0.5", isGeist ? "text-copy-12 text-[var(--ds-gray-900)]" : "text-xs text-foreground-muted")}>
                Drag & drop or click to browse
                {maxFiles === 1
                  ? " — 1 file only"
                  : ` — up to ${maxFiles} file${maxFiles !== 1 ? "s" : ""}`}
                {maxFilesLabel ? ` (${maxFilesLabel} limit)` : ""}
              </p>
            )}
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="overflow-x-auto pb-1 -mx-1 px-1">
              <Reorder.Group
                axis="x"
                values={files}
                onReorder={setFiles}
                className="flex gap-2.5 min-w-min"
              >
                {files.map((file) => (
                  <Reorder.Item
                    key={file.name + file.size + file.lastModified}
                    value={file}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative group cursor-grab active:cursor-grabbing flex-shrink-0"
                  >
                    <div
                      className={cn(
                        "relative h-28 w-28 overflow-hidden rounded-xl border shadow-sm transition-[border-color,box-shadow]",
                        isGeist
                          ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] group-hover:border-[var(--ds-plum-200)] group-hover:shadow-md"
                          : "border-border-subtle bg-surface group-hover:border-[hsl(var(--accent))]/15 group-hover:shadow-md"
                      )}
                    >
                      <div className={cn("flex h-full w-full items-center justify-center", isGeist ? "bg-[var(--ds-gray-100)]" : "bg-surface-raised")}>
                        {file.type.startsWith("video/") ? (
                          <video
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-contain"
                            muted
                          />
                        ) : (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            fill
                            className="object-contain"
                          />
                        )}
                      </div>

                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(23,43,77,0.42),rgba(23,43,77,0.08),transparent)] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                        <motion.button
                          onClick={() => remove(file)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={cn(
                            "absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border shadow-md",
                            isGeist
                              ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]"
                              : "border-border-subtle bg-surface"
                          )}
                        >
                          <X className={cn("h-3 w-3", isGeist ? "text-[var(--ds-gray-900)]" : "text-foreground-muted")} strokeWidth={2.5} />
                        </motion.button>

                        <div
                          className={cn(
                            "absolute bottom-1.5 left-1.5 rounded-full border px-1.5 py-0.5 shadow-sm",
                            isGeist
                              ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]"
                              : "border-border-subtle bg-surface"
                          )}
                        >
                          <GripVertical className={cn("h-3 w-3", isGeist ? "text-[var(--ds-gray-900)]" : "text-foreground-muted")} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>

            {files.length >= 1 && (
              <p className={cn("mt-2", isGeist ? "text-copy-12 text-[var(--ds-gray-900)]" : "text-xs text-foreground-muted")}>
                {files.length >= 2 ? "Drag to reorder · " : ""}
                {files.length} / {maxFiles} file{maxFiles !== 1 ? "s" : ""} added
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

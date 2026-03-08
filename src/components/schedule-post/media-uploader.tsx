"use client";

import { useRef } from "react";
import { X, Plus, GripVertical, Upload } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import Image from "next/image";

interface Props {
  files: File[];
  setFiles: (v: File[]) => void;
  accept?: string;
  label?: string;
}

export default function MediaUploader({
  files,
  setFiles,
  accept = "image/*,video/*",
  label = "Add Media",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function pickMedia() {
    inputRef.current?.click();
  }

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const updated  = [...files, ...selected].slice(0, 10);
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
        className={`w-full group relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200
          ${files.length === 0
            ? "border-border hover:border-primary/50 bg-muted/30 hover:bg-primary/3 py-8"
            : "border-border hover:border-primary/40 bg-card py-3"
          }`}
      >
        <div className="flex items-center justify-center gap-3">
          <div className={`relative flex-shrink-0 ${files.length === 0 ? "w-10 h-10" : "w-8 h-8"}`}>
            <div className="absolute inset-0 bg-primary/15 rounded-full blur-lg group-hover:blur-xl transition-all" />
            <div className={`relative rounded-full bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center transition-colors w-full h-full`}>
              {files.length === 0
                ? <Upload className="w-5 h-5 text-primary" />
                : <Plus className="w-4 h-4 text-primary" />
              }
            </div>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            {files.length === 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Drag & drop or click to browse — up to 10 files
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
                    <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm group-hover:shadow-md transition-shadow w-28 h-28">
                      <div className="w-full h-full flex items-center justify-center bg-muted/30">
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

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <motion.button
                          onClick={() => remove(file)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/95 shadow-md flex items-center justify-center border border-black/10"
                        >
                          <X className="w-3 h-3 text-gray-700" strokeWidth={2.5} />
                        </motion.button>

                        <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-white/90 shadow-sm">
                          <GripVertical className="w-3 h-3 text-gray-600" strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>

            {files.length >= 2 && (
              <p className="text-xs text-muted-foreground mt-2">
                Drag to reorder · {files.length} file{files.length !== 1 ? "s" : ""} added
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

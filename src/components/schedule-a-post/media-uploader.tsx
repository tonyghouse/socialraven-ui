"use client";

import { useRef, useState } from "react";
import { X, Upload, GripVertical } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

interface Props {
  files: File[];
  setFiles: (v: File[]) => void;
}

export default function MediaUploader({ files, setFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function pickMedia() {
    inputRef.current?.click();
  }

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    // limit + merge
    const updated = [...files, ...selected].slice(0, 10); // max 10 items
    setFiles(updated);
  }

  const remove = (file: File) => setFiles(files.filter(f => f !== file));

  return (
    <div className="space-y-4">

      {/* Upload Button */}
      <button
        onClick={pickMedia}
        type="button"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl 
        bg-gradient-to-br from-white/60 to-white/20 backdrop-blur-xl 
        border border-border/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)]
        hover:scale-[1.01] active:scale-[0.99] transition-all"
      >
        <Upload className="w-4 h-4 opacity-80" />
        <span className="text-sm font-medium">Upload Images / Video</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={onSelect}
        hidden
      />

      {/* Preview Grid */}
      {files.length > 0 && (
        <Reorder.Group
          axis="x"
          values={files}
          onReorder={setFiles}
          className="grid grid-cols-3 gap-3 pt-2"
        >
          <AnimatePresence>
            {files.map((file) => (
              <Reorder.Item
                key={file.name}
                value={file}
                layout
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative group rounded-2xl overflow-hidden bg-black/5 backdrop-blur-lg"
              >
                {/* Thumbnail */}
                <motion.img
                  src={URL.createObjectURL(file)}
                  alt="media"
                  className="w-full h-32 object-cover rounded-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                />

                {/* Remove Button */}
                <button
                  onClick={() => remove(file)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 backdrop-blur
                  text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Drag Handle */}
                <div className="absolute bottom-2 left-2 text-white opacity-0 group-hover:opacity-100 transition">
                  <GripVertical className="w-4 h-4 drop-shadow" />
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}
    </div>
  );
}

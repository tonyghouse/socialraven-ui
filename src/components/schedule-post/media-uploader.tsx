"use client";

import { useRef } from "react";
import { X, Plus, GripVertical } from "lucide-react";
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
    const updated = [...files, ...selected].slice(0, 10);
    setFiles(updated);
  }

  const remove = (file: File) => setFiles(files.filter(f => f !== file));

  return (
    <div className="w-full mx-auto">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={onSelect}
        hidden
      />

      {/* Upload Area */}
      <motion.button
        onClick={pickMedia}
        type="button"
        whileHover={{ scale: 1.002 }}
        whileTap={{ scale: 0.998 }}
        className="w-full group relative overflow-hidden rounded-[18px] bg-white/80 backdrop-blur-2xl
        border border-black/[0.08] hover:border-black/[0.12] 
        shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]
        hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.06)]
        transition-all duration-300 ease-out"
      >
        <div className="flex items-center justify-center gap-2.5 py-4 px-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
            flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Plus className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-black/85">
            Add Media
          </span>
        </div>
      </motion.button>

      {/* Preview Grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5"
          >
            <Reorder.Group
              axis="x"
              values={files}
              onReorder={setFiles}
              className="grid grid-cols-3 gap-3"
            >
              {files.map((file) => (
                <Reorder.Item
                  key={file.name}
                  value={file}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group cursor-grab active:cursor-grabbing"
                >
                  {/* Card Container */}
                  <div className="relative overflow-hidden rounded-[16px] bg-white/90 backdrop-blur-xl
                  border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]
                  group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]
                  transition-all duration-300">
                    
                    {/* Thumbnail */}
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="media"
                        className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Overlay Controls */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      
                      {/* Remove Button */}
                      <motion.button
                        onClick={() => remove(file)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full 
                        bg-white/95 backdrop-blur-xl shadow-lg
                        flex items-center justify-center
                        border border-black/[0.06]"
                      >
                        <X className="w-3.5 h-3.5 text-black/70" strokeWidth={2.5} />
                      </motion.button>

                      {/* Drag Handle */}
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full 
                      bg-white/95 backdrop-blur-xl shadow-md border border-black/[0.06]">
                        <GripVertical className="w-3.5 h-3.5 text-black/50" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
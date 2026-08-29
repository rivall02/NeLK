"use client";

import { motion } from "motion/react";
import { FolderOpen, UploadSimple, FilePdf, FileText, MagnifyingGlass, DotsThree, Trash, Spinner } from "@phosphor-icons/react";
import { useState, useRef } from "react";
import { uploadDocument, deleteDocument } from "@/lib/actions";

type FileDoc = {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  fileUrl?: string | null;
};

export default function FilesClient({ initialFiles }: { initialFiles: FileDoc[] }) {
  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFiles = initialFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadDocument(formData);
    } catch (err) {
      console.error(err);
      alert("Failed to upload document");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      await deleteDocument(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3"
          >
            <FolderOpen weight="fill" className="text-[var(--color-primary)]" />
            Files & Documents
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--color-text-muted)] mt-2"
          >
            Manage and organize your study materials in one place.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
            accept=".pdf,.txt,.docx"
          />
          <button 
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors font-medium shadow-sm disabled:opacity-50"
          >
            {isUploading ? <Spinner className="animate-spin" /> : <UploadSimple weight="bold" />}
            {isUploading ? "Uploading..." : "Upload File"}
          </button>
        </motion.div>
      </header>

      <div className="mb-6">
        <div className="flex items-center gap-3 bg-[var(--color-surface)] border border-black/10 dark:border-white/10 p-3 rounded-2xl w-full max-w-md">
          <MagnifyingGlass size={20} className="text-[var(--color-text-muted)]" />
          <input 
            type="text" 
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-[var(--color-text-muted)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredFiles.map((file, i) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + Math.min(i, 10) * 0.05 }}
            className="bg-[var(--color-surface)] border border-black/5 dark:border-white/10 rounded-2xl p-5 hover:shadow-md transition-shadow group flex flex-col cursor-pointer"
            onClick={() => {
               if (file.fileUrl) window.open(file.fileUrl, '_blank');
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
                {file.type === "pdf" ? <FilePdf size={24} weight="fill" /> : <FileText size={24} weight="fill" />}
              </div>
              <button 
                onClick={(e) => handleDelete(file.id, e)}
                className="text-[var(--color-text-muted)] hover:text-red-500 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash size={20} />
              </button>
            </div>
            <h3 className="font-semibold text-sm line-clamp-1 mb-1" title={file.name}>{file.name}</h3>
            <div className="flex justify-between items-center mt-auto pt-2 text-xs text-[var(--color-text-muted)] font-medium">
              <span>{file.size}</span>
              <span>{file.date}</span>
            </div>
          </motion.div>
        ))}
        
        {filteredFiles.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
            <FolderOpen size={48} className="mb-4 opacity-50 text-[var(--color-primary)]" />
            <p>{search ? "No files match your search." : "No files uploaded yet."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

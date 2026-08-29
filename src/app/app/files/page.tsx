"use client";

import { motion } from "motion/react";
import { FolderOpen, UploadSimple, FilePdf, FileText, MagnifyingGlass, DotsThree } from "@phosphor-icons/react";
import { useState } from "react";

export default function FilesPage() {
  const [search, setSearch] = useState("");

  const files = [
    { id: 1, name: "Syllabus_2026.pdf", size: "2.4 MB", type: "pdf", date: "Today" },
    { id: 2, name: "Database_Normalization_Notes.docx", size: "124 KB", type: "text", date: "Yesterday" },
    { id: 3, name: "Algorithm_Assignment_1.pdf", size: "1.1 MB", type: "pdf", date: "2 days ago" },
    { id: 4, name: "Project_Proposal_Draft.txt", size: "12 KB", type: "text", date: "Last week" },
  ];

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-nelk-text-light dark:text-nelk-text-dark tracking-tight flex items-center gap-3"
          >
            <FolderOpen weight="fill" className="text-[var(--color-primary)]" />
            Files & Documents
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-nelk-text-light/60 dark:text-nelk-text-dark/60 mt-2"
          >
            Manage and organize your study materials in one place.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors font-medium shadow-sm">
            <UploadSimple weight="bold" />
            Upload File
          </button>
        </motion.div>
      </header>

      <div className="mb-6">
        <div className="flex items-center gap-3 bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)] border border-black/10 dark:border-white/10 p-3 rounded-2xl w-full max-w-md">
          <MagnifyingGlass size={20} className="text-nelk-text-light/50 dark:text-nelk-text-dark/50" />
          <input 
            type="text" 
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-nelk-text-light/50 dark:placeholder:text-nelk-text-dark/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file, i) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)] border border-black/5 dark:border-white/10 rounded-2xl p-5 hover:shadow-md transition-shadow group flex flex-col cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                {file.type === "pdf" ? <FilePdf size={24} weight="fill" /> : <FileText size={24} weight="fill" />}
              </div>
              <button className="text-nelk-text-light/40 dark:text-nelk-text-dark/40 hover:text-[var(--color-primary)] p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <DotsThree size={24} weight="bold" />
              </button>
            </div>
            <h3 className="font-semibold text-sm line-clamp-1 mb-1" title={file.name}>{file.name}</h3>
            <div className="flex justify-between items-center mt-auto pt-2 text-xs text-nelk-text-light/50 dark:text-nelk-text-dark/50 font-medium">
              <span>{file.size}</span>
              <span>{file.date}</span>
            </div>
          </motion.div>
        ))}
        
        {files.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-nelk-text-light/50 dark:text-nelk-text-dark/50">
            <FolderOpen size={48} className="mb-4 opacity-50" />
            <p>No files found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

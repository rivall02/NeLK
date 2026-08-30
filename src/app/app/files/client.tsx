"use client";

import { motion } from "motion/react";
import {
  FolderOpen,
  UploadSimple,
  FilePdf,
  FileText,
  MagnifyingGlass,
  Trash,
  SpinnerGap,
  DownloadSimple,
} from "@phosphor-icons/react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { uploadDocument, deleteDocument } from "@/lib/actions";

type FileDoc = {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  downloadUrl: string;
};

export default function FilesClient({ initialFiles }: { initialFiles: FileDoc[] }) {
  const [files, setFiles] = useState<FileDoc[]>(initialFiles);
  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Mengunggah dan mengamankan dokumen...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadDocument(formData);

      if (res.success && res.document) {
        const newDoc: FileDoc = {
          id: res.document.id,
          name: res.document.title,
          size: `${Math.round(file.size / 1024)} KB`,
          type: file.type.includes("pdf") ? "pdf" : "text",
          date: "Hari ini",
          downloadUrl: `/api/documents/${res.document.id}/download`,
        };
        setFiles([newDoc, ...files]);
        toast.success("Dokumen berhasil diunggah dengan aman!", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah dokumen.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const previous = [...files];
    setFiles(files.filter((f) => f.id !== id));

    try {
      await deleteDocument(id);
      toast.success("Dokumen berhasil dihapus.");
    } catch (err: any) {
      setFiles(previous);
      toast.error(err.message || "Gagal menghapus dokumen.");
    }
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 pt-6 min-h-screen">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3"
          >
            <FolderOpen weight="fill" className="text-[var(--color-primary)]" />
            Dokumen & Modul Kuliah
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--color-text-muted)] mt-1 text-sm"
          >
            Penyimpanan terenkripsi dan terproteksi untuk silabus, e-book, dan slide presentasi.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.txt,.md,.docx"
          />
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors font-semibold text-sm shadow-sm disabled:opacity-50"
          >
            {isUploading ? (
              <SpinnerGap size={18} className="animate-spin" />
            ) : (
              <UploadSimple weight="bold" size={18} />
            )}
            <span>{isUploading ? "Mengunggah..." : "Unggah Dokumen"}</span>
          </button>
        </motion.div>
      </header>

      {/* Search Input */}
      <div className="mb-6">
        <div className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-2xl w-full max-w-md shadow-sm">
          <MagnifyingGlass size={18} className="text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Cari file dokumen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
          />
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredFiles.map((file, i) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.04 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
            onClick={() => {
              window.open(file.downloadUrl, "_blank");
            }}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
                  {file.type === "pdf" ? (
                    <FilePdf size={26} weight="fill" />
                  ) : (
                    <FileText size={26} weight="fill" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={file.downloadUrl}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                    title="Unduh file"
                  >
                    <DownloadSimple size={16} weight="bold" />
                  </a>
                  <button
                    onClick={(e) => handleDelete(file.id, e)}
                    className="text-[var(--color-text-muted)] hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus file"
                    aria-label="Hapus file"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-sm text-[var(--color-text)] line-clamp-2 mb-1" title={file.name}>
                {file.name}
              </h3>
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)] font-medium">
              <span>{file.size}</span>
              <span>{file.date}</span>
            </div>
          </motion.div>
        ))}

        {filteredFiles.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8">
            <FolderOpen size={48} className="mb-3 opacity-30 text-[var(--color-primary)]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {search ? "Tidak ada dokumen yang cocok." : "Belum ada dokumen yang diunggah."}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Unggah file PDF atau modul kuliahmu untuk diakses kapan saja.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

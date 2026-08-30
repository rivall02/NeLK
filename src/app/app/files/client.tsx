"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  FolderOpen,
  UploadSimple,
  FilePdf,
  FileText,
  MagnifyingGlass,
  Trash,
  SpinnerGap,
  DownloadSimple,
  Sparkle,
  GameController,
  BookOpen,
  GraduationCap,
  ListChecks,
  X,
  CheckCircle,
  Lightning,
  Plus,
} from "@phosphor-icons/react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  uploadDocument,
  deleteDocument,
  summarizeContent,
  generateQuizFromContent,
  createCourse,
  syncClassroomMaterials,
} from "@/lib/actions";

type FileDoc = {
  id: string;
  name: string;
  size: string;
  type: string;
  content: string;
  date: string;
  downloadUrl?: string;
};

type Course = {
  id: string;
  title: string;
  description: string;
  flashcardCount: number;
};

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function FilesClient({
  initialFiles,
  initialCourses,
}: {
  initialFiles: FileDoc[];
  initialCourses: Course[];
}) {
  const [files, setFiles] = useState<FileDoc[]>(initialFiles);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Feature modals
  const [activeFeature, setActiveFeature] = useState<"summary" | "quiz" | "game" | null>(null);
  const [selectedFileForAI, setSelectedFileForAI] = useState<FileDoc | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryResult, setSummaryResult] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // Course modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 50MB (disimpan ke Google Drive).");
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
          content: res.document.content || "",
          date: "Hari ini",
          downloadUrl: `/api/documents/${res.document.id}/download`,
        };
        setFiles([newDoc, ...files]);
        toast.success("Dokumen berhasil diunggah!", { id: toastId });
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

  // AI Features
  const handleSummarize = async (file: FileDoc) => {
    setSelectedFileForAI(file);
    setActiveFeature("summary");
    setIsProcessing(true);
    try {
      const content = file.content || "Tidak ada konten teks yang bisa dianalisis dari file ini.";
      const result = await summarizeContent(content);
      setSummaryResult(result);
    } catch (err: any) {
      setSummaryResult("Gagal membuat ringkasan. " + (err.message || ""));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateQuiz = async (file: FileDoc) => {
    setSelectedFileForAI(file);
    setActiveFeature("quiz");
    setIsProcessing(true);
    try {
      const content = file.content || "";
      if (!content.trim()) {
        setQuizQuestions([]);
        toast.error("File ini tidak memiliki konten teks yang cukup untuk membuat kuis.");
        return;
      }
      const result = await generateQuizFromContent(content);
      if (result.success && result.questions) {
        setQuizQuestions(result.questions);
        setCurrentQuizIndex(0);
        setQuizScore(0);
        setSelectedAnswer(null);
        setShowQuizResult(false);
      } else {
        toast.error(result.message || "Gagal membuat kuis.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat kuis.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnswerQuiz = (answer: string) => {
    setSelectedAnswer(answer);
    setShowQuizResult(true);
    if (answer === quizQuestions[currentQuizIndex]?.correctAnswer) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowQuizResult(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourseName.trim()) {
      toast.error("Nama mata kuliah tidak boleh kosong.");
      return;
    }
    try {
      await createCourse(newCourseName);
      setNewCourseName("");
      setShowCourseModal(false);
      toast.success("Mata kuliah baru berhasil dibuat!");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat mata kuliah.");
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
            Belajar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--color-text-muted)] mt-1 text-sm"
          >
            Kelola dokumen, rangkum materi, persiapan ujian, dan belajar dengan interaktif.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
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
            <span>{isUploading ? "Mengunggah..." : "Unggah File"}</span>
          </button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              const loadingToast = toast.loading("Menyinkronkan materi Classroom...");
              try {
                const res = await syncClassroomMaterials();
                toast.dismiss(loadingToast);
                if (res.success) {
                  toast.success(res.message);
                  window.location.reload();
                } else {
                  toast.error(res.message);
                }
              } catch (e: any) {
                toast.dismiss(loadingToast);
                toast.error("Gagal menyinkronkan materi.");
              }
            }}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] shadow-sm hover:bg-[var(--color-surface-hover)] active:scale-95 transition-colors"
          >
            <Lightning size={16} weight="duotone" className="text-[var(--color-primary)]" />
            Sync Classroom
          </motion.button>
        </motion.div>
      </header>

      {/* 3 AI Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-primary)]/20 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => files.length > 0 ? handleSummarize(files[0]) : toast.info("Upload file terlebih dahulu.")}
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center mb-3">
            <BookOpen size={20} weight="fill" />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">Rangkum Materi</h3>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Upload file → AI buat ringkasan poin-poin kunci materi.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-amber-50 to-[var(--color-surface)] dark:from-amber-950/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-800 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => files.length > 0 ? handleGenerateQuiz(files[0]) : toast.info("Upload file terlebih dahulu.")}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3">
            <ListChecks size={20} weight="fill" />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">Persiapan Ujian</h3>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Generate kuis, flashcards, dan latihan soal dari materi.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-[var(--color-surface)] dark:from-purple-950/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-800 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveFeature("game")}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center mb-3">
            <GameController size={20} weight="fill" />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">Mini Games</h3>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Game edukatif harian untuk memperkuat memori materi.
          </p>
        </motion.div>
      </div>

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
            onClick={() => window.open(file.downloadUrl, "_blank")}
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
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSummarize(file); }}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-ai)] p-1.5 rounded-lg hover:bg-[var(--color-ai-light)] transition-colors"
                    title="Rangkum AI"
                  >
                    <Sparkle size={14} weight="fill" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleGenerateQuiz(file); }}
                    className="text-[var(--color-text-muted)] hover:text-amber-500 p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                    title="Generate Kuis"
                  >
                    <ListChecks size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(file.id, e)}
                    className="text-[var(--color-text-muted)] hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus file"
                  >
                    <Trash size={14} />
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

      {/* Courses / Mata Kuliah Section */}
      <div className="mt-10 pt-8 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <GraduationCap size={22} className="text-[var(--color-primary)]" weight="fill" />
            Mata Kuliah
          </h2>
          <button
            onClick={() => setShowCourseModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            <Plus size={16} weight="bold" />
            Upload / Buat
          </button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              const loadingToast = toast.loading("Menyinkronkan materi Classroom...");
              try {
                const res = await syncClassroomMaterials();
                toast.dismiss(loadingToast);
                if (res.success) {
                  toast.success(res.message);
                  window.location.reload();
                } else {
                  toast.error(res.message);
                }
              } catch (e: any) {
                toast.dismiss(loadingToast);
                toast.error("Gagal menyinkronkan materi.");
              }
            }}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] shadow-sm hover:bg-[var(--color-surface-hover)] active:scale-95 transition-colors"
          >
            <Lightning size={16} weight="duotone" className="text-[var(--color-primary)]" />
            Sync Classroom
          </motion.button>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
                    <GraduationCap size={20} weight="fill" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-text)]">{course.title}</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">{course.flashcardCount} flashcards</p>
                  </div>
                </div>
                {course.description && (
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{course.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
            <GraduationCap size={36} className="mx-auto mb-2 opacity-30 text-[var(--color-primary)]" />
            <p className="text-sm font-medium text-[var(--color-text-muted)]">Belum ada mata kuliah.</p>
          </div>
        )}
      </div>

      {/* AI Summary Modal */}
      <AnimatePresence>
        {activeFeature === "summary" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Sparkle size={20} className="text-[var(--color-ai)]" weight="fill" />
                  Rangkuman AI
                </h3>
                <button onClick={() => { setActiveFeature(null); setSummaryResult(""); }} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={20} />
                </button>
              </div>
              {selectedFileForAI && (
                <p className="text-xs text-[var(--color-text-muted)] mb-3">📄 {selectedFileForAI.name}</p>
              )}
              {isProcessing ? (
                <div className="py-8 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-ai)] border-t-transparent mx-auto mb-3" />
                  <p className="text-sm text-[var(--color-text-muted)]">AI sedang meringkas materi...</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto text-sm leading-relaxed text-[var(--color-text)] whitespace-pre-wrap bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)]">
                  {summaryResult}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quiz Modal */}
      <AnimatePresence>
        {activeFeature === "quiz" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                  <ListChecks size={20} className="text-amber-500" weight="fill" />
                  Kuis Cepat
                </h3>
                <button onClick={() => { setActiveFeature(null); setQuizQuestions([]); }} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={20} />
                </button>
              </div>

              {isProcessing ? (
                <div className="py-8 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto mb-3" />
                  <p className="text-sm text-[var(--color-text-muted)]">AI sedang membuat soal kuis...</p>
                </div>
              ) : quizQuestions.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4 text-xs text-[var(--color-text-muted)]">
                    <span>Soal {currentQuizIndex + 1} dari {quizQuestions.length}</span>
                    <span className="font-bold text-[var(--color-primary)]">Skor: {quizScore}</span>
                  </div>
                  <div className="bg-[var(--color-bg)] rounded-xl p-4 mb-4 border border-[var(--color-border)]">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {quizQuestions[currentQuizIndex].question}
                    </p>
                  </div>
                  <div className="space-y-2 mb-4">
                    {quizQuestions[currentQuizIndex].options.map((opt, idx) => {
                      const isCorrect = opt.startsWith(quizQuestions[currentQuizIndex].correctAnswer + ".");
                      const isSelected = selectedAnswer === opt.charAt(0);
                      return (
                        <button
                          key={idx}
                          onClick={() => !showQuizResult && handleAnswerQuiz(opt.charAt(0))}
                          disabled={showQuizResult}
                          className={`w-full text-left p-3 rounded-xl text-sm border transition-all ${
                            showQuizResult && isCorrect
                              ? "bg-green-100 dark:bg-green-950/30 border-green-300 text-green-700 dark:text-green-400"
                              : showQuizResult && isSelected && !isCorrect
                              ? "bg-red-100 dark:bg-red-950/30 border-red-300 text-red-700 dark:text-red-400"
                              : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text)]"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {showQuizResult && (
                    <button
                      onClick={currentQuizIndex < quizQuestions.length - 1 ? nextQuizQuestion : () => {
                        toast.success(`Kuis selesai! Skor: ${quizScore}/${quizQuestions.length}`);
                        setActiveFeature(null);
                        setQuizQuestions([]);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm hover:bg-[var(--color-primary-hover)] transition-colors"
                    >
                      {currentQuizIndex < quizQuestions.length - 1 ? "Soal Berikutnya" : "Selesai"}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-8">Tidak ada soal yang dihasilkan.</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mini Game Modal */}
      <AnimatePresence>
        {activeFeature === "game" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <GameController size={20} weight="fill" />
                  Mini Game Edukatif
                </h3>
                <button onClick={() => setActiveFeature(null)} className="p-1 text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 text-center">
                <Lightning size={40} className="mx-auto mb-3 text-yellow-300" weight="fill" />
                <h4 className="text-xl font-bold mb-2">Brain Teaser Harian</h4>
                <p className="text-sm text-white/70 mb-4">
                  Jawab pertanyaan acak untuk mendapatkan 10 XP! Tersedia 1x per hari.
                </p>
                <button
                  onClick={() => {
                    toast.info("Mini game harian tersedia di halaman Gamifikasi!");
                    setActiveFeature(null);
                  }}
                  className="bg-white text-purple-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                >
                  Main di Halaman Gamifikasi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Course Modal */}
      <AnimatePresence>
        {showCourseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--color-text)]">Tambah Mata Kuliah</h3>
                <button onClick={() => setShowCourseModal(false)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={20} />
                </button>
              </div>
              <input
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="Nama mata kuliah..."
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] mb-4"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateCourse()}
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowCourseModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]">
                  Batal
                </button>
                <button onClick={handleCreateCourse} className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm hover:bg-[var(--color-primary-hover)]">
                  Simpan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

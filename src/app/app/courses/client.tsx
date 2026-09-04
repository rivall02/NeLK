"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  Plus,
  Trash,
  BookOpen,
  Notebook,
  MagnifyingGlass,
  Eye,
  EyeSlash,
  FloppyDisk,
  Sparkle,
  Clock,
  CheckCircle,
  WarningCircle,
  ArrowLeft,
} from "@phosphor-icons/react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  createCourse,
  deleteCourse,
  createNote,
  updateNote,
  deleteNote as deleteNoteAction,
  toggleNoteVisibility,
  summarizeContent,
} from "@/lib/actions";
import { toast } from "sonner";

type Course = {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
};

type Note = {
  id: string;
  title: string;
  content: string;
  preview: string;
  subject: string;
  visibility?: "public" | "private";
  updatedAt: string;
  courseId: string | null;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";
type ActiveTab = "modul" | "catatan";

export default function CoursesClient({
  initialCourses,
  initialNotes,
}: {
  initialCourses: Course[];
  initialNotes: Note[];
}) {
  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>("modul");

  // Course state
  const [courses, setCourses] = useState(initialCourses);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  // Note state
  const [notes, setNotes] = useState(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(
    initialNotes.length > 0 ? initialNotes[0] : null
  );
  const [editorTitle, setEditorTitle] = useState(
    initialNotes.length > 0 ? initialNotes[0].title : ""
  );
  const [editorContent, setEditorContent] = useState(
    initialNotes.length > 0 ? initialNotes[0].content : ""
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [noteSearch, setNoteSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");
  const [noteCourseFilter, setNoteCourseFilter] = useState<string>("all");

  // Save timeout
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(noteSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (visibilityFilter !== "all" && (n.visibility || "private") !== visibilityFilter) return false;
    if (noteCourseFilter !== "all" && n.courseId !== noteCourseFilter) return false;
    return true;
  });

  const performSave = useCallback(
    async (id: string, titleToSave: string, contentToSave: string) => {
      if (!id || id.startsWith("temp-")) return;
      setSaveStatus("saving");

      try {
        await updateNote(id, {
          title: titleToSave.trim() || "Catatan Tanpa Judul",
          content: contentToSave,
        });

        setNotes((current) =>
          current.map((n) =>
            n.id === id
              ? {
                  ...n,
                  title: titleToSave.trim() || "Catatan Tanpa Judul",
                  content: contentToSave,
                  preview: contentToSave.slice(0, 100),
                  updatedAt: "Baru saja",
                }
              : n
          )
        );

        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch (err: any) {
        setSaveStatus("error");
        toast.error(err.message || "Gagal menyimpan catatan.");
      }
    },
    []
  );

  const triggerDebouncedSave = (newTitle: string, newContent: string) => {
    if (!selectedNote || selectedNote.id.startsWith("temp-")) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("saving");
    saveTimeoutRef.current = setTimeout(() => {
      performSave(selectedNote.id, newTitle, newContent);
    }, 750);
  };

  function openNote(note: Note) {
    if (selectedNote && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      performSave(selectedNote.id, editorTitle, editorContent);
    }

    setSelectedNote(note);
    setEditorTitle(note.title);
    setEditorContent(note.content);
    setSaveStatus("idle");
  }

  async function createNewNote() {
    const tempId = `temp-${Date.now()}`;
    const newNote: Note = {
      id: tempId,
      title: "Catatan Baru",
      content: "",
      preview: "",
      subject: "Umum",
      updatedAt: "Baru saja",
      courseId: null,
    };

    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditorTitle(newNote.title);
    setEditorContent("");
    setSaveStatus("idle");

    try {
      const saved = await createNote({ title: newNote.title, content: "" });
      setNotes((curr) =>
        curr.map((n) => (n.id === tempId ? { ...n, id: saved.id } : n))
      );
      setSelectedNote((curr) =>
        curr?.id === tempId ? { ...curr, id: saved.id } : curr
      );
      toast.success("Catatan baru dibuat!");
    } catch (e: any) {
      setNotes((curr) => curr.filter((n) => n.id !== tempId));
      toast.error(e.message || "Gagal membuat catatan.");
    }
  }

  async function handleDeleteNote(id: string) {
    const previous = [...notes];
    setNotes(notes.filter((n) => n.id !== id));

    if (selectedNote?.id === id) {
      const remaining = notes.filter((n) => n.id !== id);
      if (remaining.length > 0) {
        openNote(remaining[0]);
      } else {
        setSelectedNote(null);
        setEditorTitle("");
        setEditorContent("");
      }
    }

    try {
      await deleteNoteAction(id);
      toast.success("Catatan berhasil dihapus.");
    } catch (err: any) {
      setNotes(previous);
      toast.error(err.message || "Gagal menghapus catatan.");
    }
  }

  async function handleToggleVisibility(id: string) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const previousVisibility = note.visibility;
    const newVisibility = previousVisibility === "public" ? "private" : "public";

    setNotes((current) =>
      current.map((n) => (n.id === id ? { ...n, visibility: newVisibility } : n))
    );
    if (selectedNote?.id === id) {
      setSelectedNote((prev) => prev ? { ...prev, visibility: newVisibility } : null);
    }

    try {
      await toggleNoteVisibility(id);
      toast.success(`Catatan sekarang ${newVisibility === "public" ? "publik" : "privat"}.`);
    } catch (err: any) {
      setNotes((current) =>
        current.map((n) => (n.id === id ? { ...n, visibility: previousVisibility } : n))
      );
      toast.error(err.message || "Gagal mengubah visibilitas.");
    }
  }

  async function handleSummarize() {
    if (!editorContent.trim()) {
      toast.error("Tulis konten catatan terlebih dahulu sebelum membuat ringkasan AI.");
      return;
    }

    setIsSummarizing(true);
    try {
      const summary = await summarizeContent(editorContent);
      const updatedContent = `${editorContent}\n\n---\n### AI Summary\n${summary}`;
      setEditorContent(updatedContent);

      if (selectedNote) {
        await performSave(selectedNote.id, editorTitle, updatedContent);
      }
      toast.success("Ringkasan AI berhasil dibuat dan disimpan!");
    } catch (e: any) {
      toast.error(e.message || "Gagal membuat ringkasan.");
    } finally {
      setIsSummarizing(false);
    }
  }

  // Course handlers
  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Nama topik / modul belajar tidak boleh kosong.");
      return;
    }

    setIsCreating(true);
    const tempId = `temp-${Date.now()}`;
    const newCourse: Course = {
      id: tempId,
      title: title.trim(),
      description: desc.trim() || null,
      createdAt: new Date(),
    };

    setCourses([newCourse, ...courses]);
    setTitle("");
    setDesc("");

    try {
      const saved = await createCourse(newCourse.title, newCourse.description || undefined);
      setCourses((curr) => curr.map((c) => (c.id === tempId ? { ...c, id: saved.id } : c)));
      toast.success("Modul belajar berhasil ditambahkan!");
    } catch (e: any) {
      setCourses((curr) => curr.filter((c) => c.id !== tempId));
      toast.error(e.message || "Gagal membuat modul belajar.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const previous = [...courses];
    setCourses(courses.filter((c) => c.id !== id));

    try {
      await deleteCourse(id);
      toast.success("Modul belajar berhasil dihapus.");
    } catch (e: any) {
      setCourses(previous);
      toast.error(e.message || "Gagal menghapus modul belajar.");
    }
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 pt-6 min-h-screen">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3"
          >
            <GraduationCap weight="fill" className="text-[var(--color-primary)]" />
            Belajar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--color-text-muted)] mt-1 text-sm"
          >
            Kelola mata kuliah, topik belajar, dan catatan dalam satu tempat.
          </motion.p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-1">
          <button
            onClick={() => setActiveTab("modul")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "modul"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} />
              Modul
            </span>
          </button>
          <button
            onClick={() => setActiveTab("catatan")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "catatan"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Notebook size={14} />
              Catatan
            </span>
          </button>
        </div>
      </header>

      {/* MODUL TAB */}
      <AnimatePresence>
        {activeTab === "modul" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Create New Course Form */}
            <div className="mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-3xl w-full max-w-xl shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[var(--color-text)]">Tambah Modul / Topik Baru</h3>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Nama Mata Kuliah / Topik (contoh: Jaringan Komputer)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
                <input
                  type="text"
                  placeholder="Deskripsi singkat atau target belajar (opsional)"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors font-semibold text-xs self-end disabled:opacity-50 shadow-sm"
                >
                  <Plus weight="bold" />
                  <span>{isCreating ? "Menyimpan..." : "Tambah Modul"}</span>
                </button>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 8) * 0.04 }}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 hover:shadow-md transition-shadow group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
                        <BookOpen size={24} weight="fill" />
                      </div>
                      <button
                        onClick={(e) => handleDelete(course.id, e)}
                        className="text-[var(--color-text-muted)] hover:text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Hapus modul"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                    <h3 className="font-bold text-base text-[var(--color-text)] mb-1">{course.title}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">
                      {course.description || "Belum ada deskripsi topik."}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] font-medium">
                    Dibuat {new Date(course.createdAt).toLocaleDateString("id-ID")}
                  </div>
                </motion.div>
              ))}

              {courses.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 text-center">
                  <GraduationCap size={48} className="mb-3 opacity-30 text-[var(--color-primary)]" />
                  <p className="text-sm font-semibold text-[var(--color-text)]">Belum ada modul belajar.</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Tambahkan mata kuliah atau materi yang ingin kamu kuasai semester ini.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CATATAN TAB */}
      <AnimatePresence>
        {activeTab === "catatan" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-[calc(100vh-220px)] min-h-[400px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
          >
            {/* Notes Sidebar */}
            <div
              className={`flex w-full flex-col border-r border-[var(--color-border)] md:w-[300px] lg:w-[340px] ${
                selectedNote ? "hidden md:flex" : "flex"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
                <div>
                  <h2 className="text-sm font-bold text-[var(--color-text)]">Catatan</h2>
                  <p className="text-xs text-[var(--color-text-muted)]">{notes.length} catatan</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={createNewNote}
                  className="flex items-center justify-center rounded-xl bg-[var(--color-primary)] p-2 text-white shadow-sm hover:bg-[var(--color-primary-hover)] transition-colors"
                  aria-label="Catatan baru"
                >
                  <Plus size={18} weight="bold" />
                </motion.button>
              </div>

              {/* Search & Filters */}
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                  <MagnifyingGlass size={16} className="text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    value={noteSearch}
                    onChange={(e) => setNoteSearch(e.target.value)}
                    placeholder="Cari catatan..."
                    className="flex-1 bg-transparent text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
                  />
                </div>

                {/* Course Filter */}
                <select
                  value={noteCourseFilter}
                  onChange={(e) => setNoteCourseFilter(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none"
                >
                  <option value="all">Semua Modul</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>

                {/* Visibility Filter */}
                <div className="flex items-center gap-1.5">
                  {[
                    { id: "all", label: "Semua" },
                    { id: "private", label: "Privat" },
                    { id: "public", label: "Publik" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setVisibilityFilter(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        visibilityFilter === tab.id
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[var(--color-bg)] text-[var(--color-text-muted)]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
                <AnimatePresence>
                  {filteredNotes.map((note, i) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      onClick={() => openNote(note)}
                      className={`group w-full rounded-xl p-3 text-left transition-colors cursor-pointer ${
                        selectedNote?.id === note.id
                          ? "bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20"
                          : "hover:bg-[var(--color-surface-hover)] border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-semibold truncate flex-1 ${
                            selectedNote?.id === note.id ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"
                          }`}
                        >
                          {note.title}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVisibility(note.id);
                            }}
                            className={`h-5 w-5 flex items-center justify-center rounded-md transition-colors ${
                              note.visibility === "public"
                                ? "text-[var(--color-primary)]"
                                : "text-[var(--color-text-muted)]"
                            }`}
                            title={note.visibility === "public" ? "Publik" : "Privat"}
                          >
                            {note.visibility === "public" ? <Eye size={12} /> : <EyeSlash size={12} />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
                            className="hidden h-5 w-5 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-red-500 group-hover:flex transition-colors"
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)] line-clamp-2">
                        {note.content ? note.content.slice(0, 80) : "(Catatan kosong)"}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                        <span className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 font-medium border border-[var(--color-border)]">
                          {note.subject}
                        </span>
                        <span>{note.updatedAt}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredNotes.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Notebook size={40} className="text-[var(--color-text-muted)] mb-2 opacity-50" />
                    <p className="text-sm font-medium text-[var(--color-text-muted)]">
                      {notes.length === 0 ? "Belum ada catatan" : "Tidak ada catatan ditemukan"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Editor Area */}
            <div className={`flex flex-1 flex-col ${!selectedNote ? "hidden md:flex" : "flex"}`}>
              {selectedNote ? (
                <>
                  {/* Editor Header */}
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 md:px-6 py-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => setSelectedNote(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] md:hidden"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <input
                        type="text"
                        value={editorTitle}
                        onChange={(e) => {
                          setEditorTitle(e.target.value);
                          triggerDebouncedSave(e.target.value, editorContent);
                        }}
                        placeholder="Judul Catatan..."
                        className="text-base md:text-lg font-bold text-[var(--color-text)] bg-transparent outline-none flex-1 min-w-0 placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        {saveStatus === "saving" && (
                          <span className="inline-flex items-center gap-1 text-amber-500">
                            <Clock size={13} className="animate-spin" /> Menyimpan...
                          </span>
                        )}
                        {saveStatus === "saved" && (
                          <span className="inline-flex items-center gap-1 text-green-500">
                            <CheckCircle size={13} weight="fill" /> Tersimpan
                          </span>
                        )}
                        {saveStatus === "error" && (
                          <span className="inline-flex items-center gap-1 text-red-500">
                            <WarningCircle size={13} weight="fill" /> Gagal
                          </span>
                        )}
                        {saveStatus === "idle" && <span className="text-[11px] opacity-70">Autosave</span>}
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSummarize}
                        disabled={isSummarizing || !editorContent.trim()}
                        className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 text-xs font-semibold disabled:opacity-50"
                      >
                        <Sparkle weight="fill" size={14} className={isSummarizing ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">{isSummarizing ? "Meringkas..." : "AI"}</span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => performSave(selectedNote.id, editorTitle, editorContent)}
                        className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold"
                      >
                        <FloppyDisk size={14} weight="bold" />
                        <span className="hidden sm:inline">Simpan</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Editor Body */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <textarea
                      value={editorContent}
                      onChange={(e) => {
                        setEditorContent(e.target.value);
                        triggerDebouncedSave(editorTitle, e.target.value);
                      }}
                      placeholder="Tulis catatan materi kuliah di sini..."
                      className="h-full w-full resize-none bg-transparent text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none font-sans min-h-[200px]"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
                  <Notebook size={56} weight="thin" className="text-[var(--color-text-muted)] mb-3 opacity-40" />
                  <p className="text-base font-semibold text-[var(--color-text)]">
                    Pilih catatan untuk mengedit
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)] max-w-sm">
                    Atau klik tombol "+" untuk membuat catatan baru.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

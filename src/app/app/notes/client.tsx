"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  MagnifyingGlass,
  Notebook,
  Clock,
  Trash,
  Sparkle,
  FloppyDisk,
  CheckCircle,
  WarningCircle,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  createNote,
  updateNote,
  deleteNote as deleteNoteAction,
  summarizeContent,
  toggleNoteVisibility,
} from "@/lib/actions";

interface Note {
  id: string;
  title: string;
  content: string;
  preview: string;
  subject: string;
  visibility?: "public" | "private";
  updatedAt: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(
    initialNotes.length > 0 ? initialNotes[0] : null
  );

  // Editor State
  const [editorTitle, setEditorTitle] = useState(
    initialNotes.length > 0 ? initialNotes[0].title : ""
  );
  const [editorContent, setEditorContent] = useState(
    initialNotes.length > 0 ? initialNotes[0].content : ""
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");

  // Save timeout ref for debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestContentRef = useRef({ title: editorTitle, content: editorContent });

  useEffect(() => {
    latestContentRef.current = { title: editorTitle, content: editorContent };
  }, [editorTitle, editorContent]);

  const filtered = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.subject.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (visibilityFilter === "all") return true;
    return (n.visibility || "private") === visibilityFilter;
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

        // Update in notes list
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

  // Autosave trigger on editor change
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
    // If there is an unsaved pending save for current note, flush it
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
      const updatedContent = `${editorContent}\n\n---\n### 🤖 AI Summary\n${summary}`;
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

  return (
    <div className="flex h-[calc(100dvh-var(--topbar-height)-48px)] md:h-[calc(100dvh-64px)] gap-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {/* Sidebar: Notes List */}
      <div
        className={`flex w-full flex-col border-r border-[var(--color-border)] md:w-[320px] ${
          selectedNote ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text)]">Catatan Kuliah</h1>
            <p className="text-xs text-[var(--color-text-muted)]">{notes.length} catatan tersimpan</p>
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

        {/* Search & Visibility Filters */}
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
            <MagnifyingGlass size={16} className="text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari catatan..."
              className="flex-1 bg-transparent text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
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
                    ? "bg-[var(--color-primary)] text-white shadow-xs"
                    : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
          <AnimatePresence>
            {filtered.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
                onClick={() => openNote(note)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") openNote(note);
                }}
                className={`group w-full rounded-xl p-3 text-left transition-colors cursor-pointer ${
                  selectedNote?.id === note.id
                    ? "bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20"
                    : "hover:bg-[var(--color-surface-hover)] border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm font-semibold truncate flex-1 ${
                      selectedNote?.id === note.id
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-text)]"
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
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      } group-hover:flex hidden md:flex`}
                      title={note.visibility === "public" ? "Publik" : "Privat"}
                      aria-label="Toggle visibilitas"
                    >
                      {note.visibility === "public" ? <Eye size={12} /> : <EyeSlash size={12} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40 group-hover:flex transition-colors"
                      aria-label="Hapus catatan"
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-muted)] line-clamp-2">
                  {note.content ? note.content.slice(0, 100) : "(Catatan kosong)"}
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

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Notebook size={40} className="text-[var(--color-text-muted)] mb-2 opacity-50" />
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Tidak ada catatan ditemukan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Main Area */}
      <div className={`flex flex-1 flex-col ${!selectedNote ? "hidden md:flex" : "flex"}`}>
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-3.5 bg-[var(--color-surface)]">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] md:hidden"
                  aria-label="Kembali ke daftar"
                >
                  ←
                </button>
                <input
                  type="text"
                  value={editorTitle}
                  onChange={(e) => {
                    setEditorTitle(e.target.value);
                    triggerDebouncedSave(e.target.value, editorContent);
                  }}
                  placeholder="Judul Catatan..."
                  className="text-lg font-bold text-[var(--color-text)] bg-transparent outline-none flex-1 min-w-0 placeholder:text-[var(--color-text-muted)]"
                />
              </div>

              {/* Status & Action Buttons */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                  {saveStatus === "saving" && (
                    <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
                      <Clock size={13} className="animate-spin" /> Menyimpan...
                    </span>
                  )}
                  {saveStatus === "saved" && (
                    <span className="inline-flex items-center gap-1 text-green-500 font-medium">
                      <CheckCircle size={13} weight="fill" /> Tersimpan
                    </span>
                  )}
                  {saveStatus === "error" && (
                    <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                      <WarningCircle size={13} weight="fill" /> Gagal simpan
                    </span>
                  )}
                  {saveStatus === "idle" && (
                    <span className="text-[11px] opacity-70">Autosave aktif</span>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSummarize}
                  disabled={isSummarizing || !editorContent.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 transition-colors text-xs font-semibold disabled:opacity-50"
                  aria-label="AI Summarize"
                >
                  <Sparkle weight="fill" size={14} className={isSummarizing ? "animate-spin" : ""} />
                  <span>{isSummarizing ? "Meringkas..." : "AI Summary"}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => performSave(selectedNote.id, editorTitle, editorContent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors text-xs font-semibold"
                >
                  <FloppyDisk size={14} weight="bold" />
                  <span>Simpan</span>
                </motion.button>
              </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <textarea
                value={editorContent}
                onChange={(e) => {
                  setEditorContent(e.target.value);
                  triggerDebouncedSave(editorTitle, e.target.value);
                }}
                placeholder="Tulis catatan kuliah, materi dosen, rangkuman rumus, atau ide belajarmu di sini..."
                className="h-full w-full resize-none bg-transparent text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none font-sans"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
            <Notebook size={56} weight="thin" className="text-[var(--color-text-muted)] mb-3 opacity-40" />
            <p className="text-base font-semibold text-[var(--color-text)]">
              Pilih catatan untuk mulai membaca atau mengedit
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] max-w-sm">
              Atau klik tombol '+' di sudut kiri atas untuk membuat catatan materi kuliah baru.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

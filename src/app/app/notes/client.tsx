"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  MagnifyingGlass,
  Notebook,
  Clock,
  Trash,
  Sparkle,
  DotsThree,
} from "@phosphor-icons/react";

interface Note {
  id: string;
  title: string;
  preview: string;
  subject: string;
  updatedAt: string;
}

import { createNote, updateNote, deleteNote as deleteNoteAction, summarizeContent } from "@/lib/actions";

export default function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.subject.toLowerCase().includes(search.toLowerCase())
  );

  function openNote(note: Note) {
    setSelectedNote(note);
    setEditorContent(note.preview);
  }

  async function createNewNote() {
    const tempId = Date.now().toString();
    const newNote: Note = {
      id: tempId,
      title: "Catatan Baru",
      preview: "",
      subject: "Umum",
      updatedAt: "Baru saja",
    };
    setNotes([newNote, ...notes]);
    openNote(newNote);
    
    try {
      const saved = await createNote({ title: newNote.title });
      setNotes((curr) => curr.map(n => n.id === tempId ? { ...n, id: saved.id } : n));
      setSelectedNote((curr) => curr?.id === tempId ? { ...curr, id: saved.id } : curr);
    } catch (e) {
      console.error(e);
      setNotes((curr) => curr.filter(n => n.id !== tempId));
    }
  }

  async function deleteNote(id: string) {
    setNotes(notes.filter((n) => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setEditorContent("");
    }
    await deleteNoteAction(id);
  }

  async function saveNote(id: string, updates: { title?: string, content?: string }) {
    await updateNote(id, updates);
  }

  async function handleSummarize() {
    if (!editorContent.trim()) return;
    setIsSummarizing(true);
    try {
      const summary = await summarizeContent(editorContent);
      const newContent = editorContent + "\n\n--- AI Summary ---\n" + summary;
      setEditorContent(newContent);
      await saveNote(selectedNote!.id, { content: newContent });
    } catch (e) {
      console.error(e);
      alert("Failed to summarize.");
    } finally {
      setIsSummarizing(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-var(--topbar-height)-48px)] md:h-[calc(100dvh-64px)] gap-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
      {/* Sidebar: Notes List */}
      <div className={`flex w-full flex-col border-r border-[var(--color-border)] md:w-[320px] ${selectedNote ? "hidden md:flex" : "flex"}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
          <h1 className="text-lg font-bold text-[var(--color-text)]">Catatan</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={createNewNote}
            className="flex items-center justify-center rounded-xl bg-[var(--color-primary)] p-2 text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-primary-hover)] active:scale-95"
            aria-label="Catatan baru"
          >          <Plus size={18} weight="bold" />
          </motion.button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
            <MagnifyingGlass size={16} className="text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari catatan..."
              className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          <AnimatePresence>
            {filtered.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                onClick={() => openNote(note)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') openNote(note); }}
                className={`group w-full rounded-xl p-3 text-left transition-colors ${
                  selectedNote?.id === note.id
                    ? "bg-[var(--color-primary-light)]"
                    : "hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className={`text-sm font-medium truncate ${
                    selectedNote?.id === note.id ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"
                  }`}>
                    {note.title}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-active)] hover:text-[var(--color-error)] group-hover:flex"
                    aria-label="Hapus catatan"
                  >
                    <Trash size={13} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-muted)] line-clamp-2">{note.preview}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-primary)]">
                    {note.subject}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{note.updatedAt}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Notebook size={40} className="text-[var(--color-text-muted)] mb-3" />
              <p className="text-sm text-[var(--color-text-muted)]">Tidak ada catatan ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className={`flex flex-1 flex-col ${!selectedNote ? "hidden md:flex" : "flex"}`}>
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] md:hidden"
                  aria-label="Kembali"
                >
                  ←
                </button>
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => {
                    const updated = { ...selectedNote, title: e.target.value };
                    setSelectedNote(updated);
                    setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
                  }}
                  onBlur={() => saveNote(selectedNote.id, { title: selectedNote.title })}
                  className="text-lg font-bold text-[var(--color-text)] bg-transparent outline-none flex-1 min-w-0"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center -space-x-2 mr-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[var(--color-surface)] flex items-center justify-center text-[10px] text-white font-bold" title="Alice is editing">A</div>
                  <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-[var(--color-surface)] flex items-center justify-center text-[10px] text-white font-bold" title="Bob is viewing">B</div>
                  <div className="w-6 h-6 rounded-full bg-[var(--color-surface-hover)] border-2 border-[var(--color-surface)] flex items-center justify-center text-[10px] text-[var(--color-text-muted)] font-bold">+1</div>
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <Clock size={12} />
                  <span>{selectedNote.updatedAt}</span>
                </div>
                <button 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isSummarizing ? "bg-gray-200 text-gray-500" : "bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20"} transition-colors text-xs font-semibold`}
                  aria-label="AI Summarize"
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                >
                  <Sparkle weight="fill" size={14} className={isSummarizing ? "animate-spin" : ""} />
                  <span>{isSummarizing ? "Summarizing..." : "Summarize"}</span>
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]" aria-label="Opsi lainnya">
                  <DotsThree size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder="Mulai menulis..."
                onBlur={() => {
                  const updatedPreview = editorContent.slice(0, 50) + (editorContent.length > 50 ? "..." : "");
                  setNotes(notes.map((n) => (n.id === selectedNote.id ? { ...n, preview: updatedPreview } : n)));
                  saveNote(selectedNote.id, { content: editorContent });
                }}
                className="h-full w-full resize-none bg-transparent text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Notebook size={48} weight="thin" className="text-[var(--color-text-muted)] mb-4" />
            <p className="text-base font-medium text-[var(--color-text-secondary)]">Pilih catatan untuk mulai</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Atau buat catatan baru dengan tombol +</p>
          </div>
        )}
      </div>
    </div>
  );
}

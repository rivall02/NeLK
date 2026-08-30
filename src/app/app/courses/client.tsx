"use client";

import { motion } from "motion/react";
import { GraduationCap, Plus, Trash, BookOpen } from "@phosphor-icons/react";
import { useState } from "react";
import { createCourse, deleteCourse } from "@/lib/actions";
import { toast } from "sonner";

type Course = {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
};

export default function CoursesClient({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

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
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3"
          >
            <GraduationCap weight="fill" className="text-[var(--color-primary)]" />
            Belajar & Modul Kuliah
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--color-text-muted)] mt-1 text-sm"
          >
            Kelola mata kuliah, topik belajar, dan susun flashcard untuk persiapan ujian.
          </motion.p>
        </div>
      </header>

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
    </div>
  );
}

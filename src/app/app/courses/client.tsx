"use client";

import { motion } from "motion/react";
import { GraduationCap, Plus, Trash, BookOpen } from "@phosphor-icons/react";
import { useState } from "react";
import { createCourse, deleteCourse } from "@/lib/actions";

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
    if (!title.trim()) return;
    setIsCreating(true);
    try {
      const course = await createCourse(title, desc);
      setCourses([course, ...courses]);
      setTitle("");
      setDesc("");
    } catch (e) {
      console.error(e);
      alert("Failed to create course");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure?")) return;
    setCourses(courses.filter(c => c.id !== id));
    try {
      await deleteCourse(id);
    } catch (e) {
      console.error(e);
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
            <GraduationCap weight="fill" className="text-[var(--color-primary)]" />
            Belajar & Kursus
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--color-text-muted)] mt-2"
          >
            Kelola mata kuliah, topik belajar, dan flashcard Anda.
          </motion.p>
        </div>
      </header>

      {/* Create New Course Form */}
      <div className="mb-8 bg-[var(--color-surface)] border border-black/10 dark:border-white/10 p-5 rounded-2xl w-full max-w-xl">
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-text)]">Tambah Modul Baru</h3>
        <div className="flex flex-col gap-3">
          <input 
            type="text" 
            placeholder="Nama Mata Kuliah / Topik" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          <input 
            type="text" 
            placeholder="Deskripsi singkat (opsional)" 
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          <button 
            onClick={handleCreate}
            disabled={isCreating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors font-medium text-sm self-end disabled:opacity-50"
          >
            <Plus weight="bold" />
            {isCreating ? "Menyimpan..." : "Tambah"}
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + Math.min(i, 10) * 0.05 }}
            className="bg-[var(--color-surface)] border border-black/5 dark:border-white/10 rounded-2xl p-5 hover:shadow-md transition-shadow group flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
                <BookOpen size={24} weight="fill" />
              </div>
              <button 
                onClick={(e) => handleDelete(course.id, e)}
                className="text-[var(--color-text-muted)] hover:text-red-500 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash size={20} />
              </button>
            </div>
            <h3 className="font-bold text-lg text-[var(--color-text)] mb-1">{course.title}</h3>
            <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">{course.description || "Tidak ada deskripsi"}</p>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
              Dibuat pada {new Date(course.createdAt).toLocaleDateString("id-ID")}
            </div>
          </motion.div>
        ))}
        
        {courses.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
            <GraduationCap size={48} className="mb-4 opacity-50 text-[var(--color-primary)]" />
            <p>Belum ada modul belajar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

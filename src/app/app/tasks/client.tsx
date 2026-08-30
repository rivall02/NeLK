"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  CheckSquare,
  Clock,
  Flag,
  Trash,
  Circle,
  CheckCircle,
  Archive,
  ArrowClockwise,
  CalendarBlank,
  Tag,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  createTask,
  updateTaskStatus,
  deleteTask as deleteTaskAction,
  syncGoogleClassroom,
  toggleTaskVisibility,
} from "@/lib/actions";
import { CanonicalTaskPriority, CanonicalTaskStatus } from "@/lib/validations";

interface Task {
  id: string;
  title: string;
  description?: string;
  due?: string;
  priority: CanonicalTaskPriority;
  status: CanonicalTaskStatus;
  subject?: string;
  visibility?: "public" | "private";
}

const tabs: { key: CanonicalTaskStatus; label: string; icon: any }[] = [
  { key: "TODO", label: "Inbox / Belum", icon: CheckSquare },
  { key: "IN_PROGRESS", label: "Dikerjakan", icon: Clock },
  { key: "DONE", label: "Selesai", icon: CheckCircle },
];

const priorityConfig: Record<CanonicalTaskPriority, { label: string; color: string; bg: string }> = {
  HIGH: { label: "Tinggi", color: "var(--color-error)", bg: "rgba(239, 68, 68, 0.1)" },
  MEDIUM: { label: "Sedang", color: "var(--color-accent-yellow)", bg: "rgba(245, 158, 11, 0.1)" },
  LOW: { label: "Rendah", color: "var(--color-text-muted)", bg: "rgba(100, 116, 139, 0.1)" },
};

export default function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<CanonicalTaskStatus>("TODO");
  const [showCreate, setShowCreate] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<CanonicalTaskPriority>("MEDIUM");
  const [newDueDate, setNewDueDate] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ connected: boolean; count: number } | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");

  const filtered = tasks.filter((t) => {
    if (t.status !== activeTab) return false;
    if (visibilityFilter === "all") return true;
    return t.visibility === visibilityFilter;
  });

  async function handleToggleVisibility(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const previousVisibility = task.visibility;
    const newVisibility = previousVisibility === "public" ? "private" : "public";

    setTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, visibility: newVisibility } : t))
    );

    try {
      await toggleTaskVisibility(id);
      toast.success(`Tugas sekarang ${newVisibility === "public" ? "publik" : "privat"}.`);
    } catch (err: any) {
      setTasks((current) =>
        current.map((t) => (t.id === id ? { ...t, visibility: previousVisibility } : t))
      );
      toast.error(err.message || "Gagal mengubah visibilitas.");
    }
  }

  async function toggleComplete(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const previousStatus = task.status;
    const nextStatus: CanonicalTaskStatus = task.status === "DONE" ? "TODO" : "DONE";

    // Optimistic UI update
    setTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    if (nextStatus === "DONE") {
      toast.success("Tugas selesai! +15 XP diperoleh 🚀");
    }

    try {
      await updateTaskStatus(id, nextStatus);
    } catch (err: any) {
      // Rollback
      setTasks((current) =>
        current.map((t) => (t.id === id ? { ...t, status: previousStatus } : t))
      );
      toast.error(err.message || "Gagal memperbarui status tugas.");
    }
  }

  async function moveToInProgress(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const previousStatus = task.status;
    setTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, status: "IN_PROGRESS" } : t))
    );

    try {
      await updateTaskStatus(id, "IN_PROGRESS");
      toast.info("Tugas dipindahkan ke status Dikerjakan.");
    } catch (err: any) {
      setTasks((current) =>
        current.map((t) => (t.id === id ? { ...t, status: previousStatus } : t))
      );
      toast.error(err.message || "Gagal mengubah status tugas.");
    }
  }

  async function deleteTask(id: string) {
    const previousTasks = [...tasks];
    setTasks((current) => current.filter((t) => t.id !== id));

    try {
      await deleteTaskAction(id);
      toast.success("Tugas berhasil dihapus.");
    } catch (err: any) {
      setTasks(previousTasks);
      toast.error(err.message || "Gagal menghapus tugas.");
    }
  }

  async function handleAddTask() {
    if (!newTitle.trim()) {
      toast.error("Judul tugas tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      title: newTitle.trim(),
      priority: newPriority,
      status: "TODO",
      due: newDueDate ? new Date(newDueDate).toISOString() : undefined,
      subject: newSubject.trim() || undefined,
    };

    setTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewSubject("");
    setNewDueDate("");
    setShowCreate(false);

    try {
      const saved = await createTask({
        title: newTask.title,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.due,
        subject: newTask.subject,
      });

      setTasks((current) =>
        current.map((t) => (t.id === tempId ? { ...t, id: saved.id } : t))
      );
      toast.success("Tugas baru berhasil ditambahkan!");
    } catch (err: any) {
      setTasks((current) => current.filter((t) => t.id !== tempId));
      toast.error(err.message || "Gagal menambahkan tugas.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSyncClassroom() {
    setIsSyncing(true);
    try {
      const result = await syncGoogleClassroom();
      setSyncStatus({ connected: result.connected, count: result.count });
      if (result.success) {
        toast.success(result.message || `Berhasil menyinkronkan ${result.count} tugas dari Google Classroom.`);
        window.location.reload();
      } else if (!result.connected) {
        toast.info("Menghubungkan akun Google Classroom...");
        const { signIn } = await import("next-auth/react");
        await signIn("google", { callbackUrl: "/app/tasks" });
      } else {
        toast.info(result.message || "Tidak ada tugas baru dari Google Classroom.");
      }
    } catch (e: any) {
      toast.error(e.message || "Gagal menyinkronkan tugas.");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] md:text-3xl">
            Tugas Akademik
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Kelola tugas kuliah, PR, dan proyek kelompok dengan teratur.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSyncClassroom}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] shadow-sm hover:bg-[var(--color-surface-hover)] active:scale-95 disabled:opacity-50 transition-colors"
          >
            <ArrowClockwise size={16} weight="bold" className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Menyinkronkan..." : "Sync Classroom"}
            {syncStatus && syncStatus.connected && (
              <span className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {syncStatus.count > 0 ? `${syncStatus.count} baru` : "Terhubung"}
              </span>
            )}
            {syncStatus && !syncStatus.connected && (
              <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Belum terhubung
              </span>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-hover)] active:scale-95 transition-colors"
          >
            <Plus size={16} weight="bold" />
            Tugas Baru
          </motion.button>
        </div>
      </motion.div>

      {/* Create Task Panel */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-[var(--color-primary)] bg-[var(--color-surface)] p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base text-[var(--color-text)]">Tambah Tugas Baru</h3>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Tutup
                </button>
              </div>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                placeholder="Judul tugas (contoh: Laporan Praktikum Struktur Data)..."
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)]"
                autoFocus
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 block">
                    Prioritas
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as CanonicalTaskPriority)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
                  >
                    <option value="LOW">Rendah</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="HIGH">Tinggi (Mendesak)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 block">
                    Mata Kuliah / Subjek
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Misal: Kalkulus 2"
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 block">
                    Tenggat Waktu
                  </label>
                  <input
                    type="datetime-local"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                >
                  Batal
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddTask}
                  disabled={isSubmitting || !newTitle.trim()}
                  className="rounded-xl bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Tugas"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visibility Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-[var(--color-text-muted)]">Visibilitas:</span>
        {([
          { key: "all", label: "Semua" },
          { key: "public", label: "Publik" },
          { key: "private", label: "Privat" },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setVisibilityFilter(f.key)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              visibilityFilter === f.key
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          const count = tasks.filter((t) => t.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <Icon size={16} weight={active ? "fill" : "regular"} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span
                className={`min-w-[20px] rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  active
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                    : "bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((task, i) => {
            const priorityInfo = priorityConfig[task.priority] || priorityConfig.MEDIUM;

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
                className="group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-sm transition-all hover:shadow-md"
              >
                {/* Complete Checkbox */}
                <button
                  onClick={() => toggleComplete(task.id)}
                  className="shrink-0 transition-transform active:scale-90"
                  aria-label={task.status === "DONE" ? "Tandai belum selesai" : "Tandai selesai"}
                >
                  {task.status === "DONE" ? (
                    <CheckCircle size={24} weight="fill" className="text-green-500" />
                  ) : (
                    <Circle size={24} className="text-[var(--color-border)] group-hover:text-[var(--color-primary)]" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-semibold truncate ${
                        task.status === "DONE"
                          ? "text-[var(--color-text-muted)] line-through"
                          : "text-[var(--color-text)]"
                      }`}
                    >
                      {task.title}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {task.subject && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-primary-light)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-primary)]">
                        <Tag size={11} />
                        {task.subject}
                      </span>
                    )}

                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                      style={{ backgroundColor: priorityInfo.bg, color: priorityInfo.color }}
                    >
                      <Flag size={11} weight="fill" />
                      {priorityInfo.label}
                    </span>

                    {task.due && (
                      <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                        <CalendarBlank size={12} />
                        {new Date(task.due).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisibility(task.id)}
                    className={`h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors ${
                      task.visibility === "public"
                        ? "text-[var(--color-primary)] bg-[var(--color-primary-light)]"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                    title={task.visibility === "public" ? "Publik (terlihat semua orang)" : "Privat (hanya Anda)"}
                    aria-label="Toggle visibilitas"
                  >
                    {task.visibility === "public" ? <Eye size={16} /> : <EyeSlash size={16} />}
                  </button>

                  {task.status === "TODO" && (
                    <button
                      onClick={() => moveToInProgress(task.id)}
                      className="hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                    >
                      Kerjakan
                    </button>
                  )}

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
                    aria-label="Hapus tugas"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8"
          >
            {activeTab === "DONE" ? (
              <Archive size={48} weight="thin" className="text-[var(--color-text-muted)] mb-3" />
            ) : (
              <CheckSquare size={48} weight="thin" className="text-[var(--color-text-muted)] mb-3" />
            )}
            <p className="text-base font-semibold text-[var(--color-text)]">
              {activeTab === "DONE"
                ? "Belum ada tugas yang diselesaikan"
                : activeTab === "IN_PROGRESS"
                ? "Tidak ada tugas yang sedang dikerjakan"
                : "Tidak ada tugas baru di inbox"}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] max-w-sm">
              {activeTab === "TODO"
                ? "Klik tombol 'Tugas Baru' di atas untuk mencatat tugas atau pekerjaan rumahmu."
                : "Pindahkan tugas dari tab Inbox untuk mulai mengerjakan."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

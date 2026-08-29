"use client";

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import {
  Plus,
  CheckSquare,
  Clock,
  Flag,
  Trash,
  Circle,
  CheckCircle,
  Archive,
  FunnelSimple,
} from "@phosphor-icons/react";

interface Task {
  id: string;
  title: string;
  description?: string;
  due?: string;
  priority: "low" | "medium" | "high";
  status: "inbox" | "planned" | "completed";
  subject?: string;
}

import { createTask, updateTaskStatus, deleteTask as deleteTaskAction, syncGoogleClassroom } from "@/lib/actions";

const tabs = [
  { key: "inbox" as const, label: "Inbox", icon: CheckSquare },
  { key: "planned" as const, label: "Direncanakan", icon: Clock },
  { key: "completed" as const, label: "Selesai", icon: CheckCircle },
];

const priorityColors = {
  high: "var(--color-error)",
  medium: "var(--color-accent-yellow)",
  low: "var(--color-text-muted)",
};

export default function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTab, setActiveTab] = useState<"inbox" | "planned" | "completed">("inbox");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const filtered = tasks.filter((t) => t.status === activeTab);

  async function toggleComplete(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === "completed" ? "inbox" : "completed";
    
    // Optimistic UI update
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, status: newStatus } : t
      )
    );
    
    // Server update
    await updateTaskStatus(id, newStatus);
  }

  async function deleteTask(id: string) {
    // Optimistic UI update
    setTasks(tasks.filter((t) => t.id !== id));
    
    // Server update
    await deleteTaskAction(id);
  }

  async function addTask() {
    if (!newTitle.trim()) return;
    
    const tempId = Date.now().toString();
    const task: Task = {
      id: tempId,
      title: newTitle.trim(),
      priority: "medium",
      status: "inbox",
    };
    
    // Optimistic UI update
    setTasks([task, ...tasks]);
    setNewTitle("");
    setShowCreate(false);
    
    // Server update
    try {
      const savedTask = await createTask({
        title: task.title,
        priority: task.priority,
        status: task.status
      });
      // Replace temporary ID with real ID
      setTasks(current => current.map(t => t.id === tempId ? { ...t, id: savedTask.id } : t));
    } catch (e) {
      console.error(e);
      // Revert if failed
      setTasks(current => current.filter(t => t.id !== tempId));
    }
  }

  async function handleSyncClassroom() {
    setIsSyncing(true);
    try {
      const result = await syncGoogleClassroom();
      if (result.success) {
        alert(`Berhasil sinkronisasi ${result.count} tugas dari Google Classroom (Mock). Muat ulang halaman untuk melihat.`);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      alert("Gagal sinkronisasi");
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
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] md:text-3xl">Tugas</h1>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleSyncClassroom}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-surface-hover)] active:scale-[0.97] disabled:opacity-50"
          >
            <Clock size={16} weight="bold" className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Sync Classroom"}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-primary-hover)] active:scale-[0.97]"
          >
            <Plus size={16} weight="bold" />
            Tugas Baru
          </motion.button>
        </div>
      </motion.div>

      {/* Create Task Inline */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-primary)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-md)]">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Judul tugas baru..."
                className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
                autoFocus
              />
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={addTask}
                className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
              >
                Tambah
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-[var(--shadow-sm)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          const count = tasks.filter((t) => t.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-[var(--duration-micro)] ${
                active
                  ? "bg-[var(--color-bg)] text-[var(--color-text)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              <Icon size={16} weight={active ? "fill" : "regular"} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                active ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]" : "bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((task, i) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className="group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
            >
              {/* Check */}
              <button
                onClick={() => toggleComplete(task.id)}
                className="shrink-0 transition-colors"
                aria-label={task.status === "completed" ? "Tandai belum selesai" : "Tandai selesai"}
              >
                {task.status === "completed" ? (
                  <CheckCircle size={22} weight="fill" className="text-[var(--color-success)]" />
                ) : (
                  <Circle size={22} className="text-[var(--color-border)] group-hover:text-[var(--color-primary)]" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  task.status === "completed" ? "text-[var(--color-text-muted)] line-through" : "text-[var(--color-text)]"
                }`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {task.subject && (
                    <span className="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-primary)]">
                      {task.subject}
                    </span>
                  )}
                  {task.due && (
                    <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                      <Clock size={11} />
                      {task.due}
                    </span>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div className="flex items-center gap-2">
                <Flag size={14} weight="fill" style={{ color: priorityColors[task.priority] }} />
                <button
                  onClick={() => deleteTask(task.id)}
                  className="hidden h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-error)] group-hover:flex"
                  aria-label="Hapus tugas"
                >
                  <Trash size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            {activeTab === "completed" ? (
              <Archive size={48} weight="thin" className="text-[var(--color-text-muted)] mb-4" />
            ) : (
              <CheckSquare size={48} weight="thin" className="text-[var(--color-text-muted)] mb-4" />
            )}
            <p className="text-base font-medium text-[var(--color-text-secondary)]">
              {activeTab === "completed" ? "Belum ada tugas selesai" : "Tidak ada tugas di sini"}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {activeTab === "inbox" ? "Tambahkan tugas baru untuk memulai" : "Pindahkan tugas dari inbox"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

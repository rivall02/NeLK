"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Lightning,
  CheckSquare,
  CalendarDots,
  Notebook,
  Brain,
  ArrowRight,
  Clock,
  Target,
  Trophy,
  Plus,
} from "@phosphor-icons/react";
import Link from "next/link";
import { toast } from "sonner";
import {
  getRandomNoteSummary,
  getUserProfile,
  getUpcomingTasks,
  getTodaySchedule,
  getRecentNotes,
  updateContextMode,
} from "@/lib/actions";

export default function DashboardPage() {
  const greeting = getGreeting();
  const [noteSummary, setNoteSummary] = React.useState<{ title: string; summary: string } | null>(null);
  const [userProfile, setUserProfile] = React.useState<{
    name: string | null;
    email: string | null;
    xp: number;
    level: number;
    contextMode: string;
    subscriptionPlan: string;
  } | null>(null);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [schedule, setSchedule] = React.useState<any[]>([]);
  const [notes, setNotes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [summary, profile, upcoming, today, recent] = await Promise.all([
          getRandomNoteSummary(),
          getUserProfile(),
          getUpcomingTasks(),
          getTodaySchedule(),
          getRecentNotes(),
        ]);

        setNoteSummary(summary as any);
        if (profile) setUserProfile(profile as any);
        setTasks(upcoming || []);
        setSchedule(today || []);
        setNotes(recent || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const level = userProfile?.level || 1;
  const xp = userProfile?.xp || 0;
  const xpForNextLevel = 1000;
  const xpProgress = Math.min(100, Math.round(((xp % xpForNextLevel) / xpForNextLevel) * 100));
  const contextMode = userProfile?.contextMode || "NORMAL";
  const displayName = userProfile?.name || "Mahasiswa";

  const handleSetContext = async (mode: string) => {
    setUserProfile((prev) => (prev ? { ...prev, contextMode: mode } : null));
    try {
      await updateContextMode(mode);
      toast.success(`Mode perkuliahan diubah ke: ${mode}`);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengubah mode perkuliahan.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          <p className="text-sm font-medium text-[var(--color-text-muted)]">Memuat data akademik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Gamification Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] md:text-3xl flex items-center gap-2">
            {greeting}, {displayName}
            <span className="text-xs font-semibold px-2.5 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg">
              {contextMode === "NORMAL"
                ? "Semester Reguler"
                : contextMode === "EXAM_WEEK"
                ? "Minggu Ujian (UAS/UTS)"
                : "Libur Semester"}
            </span>
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {contextMode === "EXAM_WEEK"
              ? "Fokus penuh pada materi ujian dan deadline tugas terdekat."
              : contextMode === "VACATION"
              ? "Waktunya bersantai dan mengembangkan hobi di luar akademik."
              : `Kamu memiliki ${tasks.length} tugas aktif dan ${schedule.length} jadwal hari ini.`}
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={contextMode}
            onChange={(e) => handleSetContext(e.target.value)}
            className="text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 outline-none text-[var(--color-text)] cursor-pointer hover:border-[var(--color-primary)] transition-colors shadow-sm"
          >
            <option value="NORMAL">Semester Reguler</option>
            <option value="EXAM_WEEK">Minggu Ujian</option>
            <option value="VACATION">Liburan</option>
          </select>

          <Link
            href="/app/gamification"
            className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-2xl shadow-sm hover:border-[var(--color-primary)]/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
              <Trophy size={22} weight="fill" />
            </div>
            <div>
              <div className="flex justify-between items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[var(--color-text)]">Level {level}</span>
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
                  {xp % xpForNextLevel}/{xpForNextLevel} XP
                </span>
              </div>
              <div className="w-24 h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tasks Section (Col 1-2) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={20} weight="duotone" className="text-[var(--color-primary)]" />
                <h2 className="text-base font-bold text-[var(--color-text)]">Tugas Mendatang</h2>
              </div>
              <Link
                href="/app/tasks"
                className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                Lihat Semua <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3.5 rounded-2xl px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] transition-colors hover:border-[var(--color-primary)]/40"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                        {task.subject && (
                          <span className="font-medium text-[var(--color-primary)]">{task.subject}</span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString("id-ID") : "Fleksibel"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                      {task.priority || "SEDANG"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                  <CheckSquare size={40} className="mb-2 opacity-40 text-[var(--color-primary)]" />
                  <p className="text-sm font-semibold text-[var(--color-text)]">Semua tugas beres!</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Tidak ada tugas yang menunggu saat ini.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--color-border)] flex justify-end">
            <Link
              href="/app/tasks"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              <Plus size={14} weight="bold" />
              <span>Tambah Tugas Baru</span>
            </Link>
          </div>
        </motion.div>

        {/* Right Column: AI Insight & Today's Schedule */}
        <div className="space-y-6">
          {/* Proactive AI Insight */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-3xl border border-[var(--color-border)] p-6 shadow-sm bg-gradient-to-br from-[#8B5CF6]/10 to-[var(--color-surface)]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain size={20} weight="duotone" className="text-[#8B5CF6]" />
                <h2 className="text-base font-bold text-[var(--color-text)]">Insight AI NeLK</h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6] bg-[#8B5CF6]/15 px-2 py-0.5 rounded-full">
                Asisten Akademik
              </span>
            </div>

            {noteSummary && noteSummary.title && (
              <div className="mb-2 text-xs font-bold text-[var(--color-text)] px-2.5 py-1 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] inline-block">
                📚 {noteSummary.title}
              </div>
            )}

            <div className="text-xs leading-relaxed text-[var(--color-text-muted)] whitespace-pre-wrap">
              {noteSummary ? noteSummary.summary : "Menganalisis pola belajarmu..."}
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
              <Link
                href="/app/ai"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6] hover:underline"
              >
                <Lightning size={12} weight="fill" />
                Tanya AI Lebih Lanjut
              </Link>
              <Link
                href="/app/notes"
                className="text-xs font-medium text-[var(--color-text-muted)] hover:underline"
              >
                Catatan
              </Link>
            </div>
          </motion.div>

          {/* Today's Schedule Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDots size={20} weight="duotone" className="text-[var(--color-primary)]" />
                <h2 className="text-base font-bold text-[var(--color-text)]">Jadwal Hari Ini</h2>
              </div>
              <Link href="/app/schedule" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
                Buka Kalender
              </Link>
            </div>

            <div className="space-y-3">
              {schedule.length > 0 ? (
                schedule.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--color-bg)] border-l-4 border-[var(--color-primary)]"
                  >
                    <span className="text-xs font-mono font-semibold text-[var(--color-primary)] w-14 shrink-0 pt-0.5">
                      {item.startTime || "--:--"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--color-text)] truncate">{item.title}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        {item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : "Hari ini"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">
                  Tidak ada agenda kuliah atau kegiatan hari ini.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 17) return "Selamat Siang";
  if (hour < 20) return "Selamat Sore";
  return "Selamat Malam";
}

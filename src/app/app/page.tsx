"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { toast } from "sonner";
import {
  getRandomNoteSummary,
  getUserProfile,
  getUpcomingTasks,
  getTodaySchedule,
  getRecentNotes,
  updateContextMode,
  getStudySessions,
  createStudySession,
  setActiveSession,
  deleteStudySession,
  getDashboardInsight,
} from "@/lib/actions";
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
  CaretDown,
  CaretUp,
  X,
  Stack,
  Trash,
  Check,
} from "@phosphor-icons/react";

export default function DashboardPage() {
  const greeting = getGreeting();
  const [aiInsight, setAiInsight] = useState<{ title: string; summary: string; source?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<{
    name: string | null;
    email: string | null;
    xp: number;
    level: number;
    contextMode: string;
    subscriptionPlan: string;
    activeSessionId: string | null;
  } | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsightExpanded, setAiInsightExpanded] = useState(true);
  // Study Session State
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSessionState] = useState<any>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionStart, setNewSessionStart] = useState("");
  const [newSessionEnd, setNewSessionEnd] = useState("");
  const [newSessionAllTime, setNewSessionAllTime] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [insight, profile, upcoming, today, recent, studySessions] = await Promise.all([
          getDashboardInsight(),
          getUserProfile(),
          getUpcomingTasks(),
          getTodaySchedule(),
          getRecentNotes(),
          getStudySessions(),
        ]);

        setAiInsight(insight as any);
        if (profile) {
          setUserProfile(profile as any);
          // Find active session
          const activeId = (profile as any).activeSessionId;
          if (activeId && studySessions) {
            const active = studySessions.find((s: any) => s.id === activeId);
            setActiveSessionState(active || null);
          }
        }
        setTasks(upcoming || []);
        setSchedule(today || []);
        setNotes(recent || []);
        setSessions(studySessions || []);
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

  // Session handlers
  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      toast.error("Nama sesi tidak boleh kosong.");
      return;
    }
    try {
      const newSession = await createStudySession({
        name: newSessionName.trim(),
        startDate: newSessionStart || undefined,
        endDate: newSessionAllTime ? undefined : newSessionEnd || undefined,
        isAllTime: newSessionAllTime,
      });
      setSessions((prev) => [newSession, ...prev]);
      if (!activeSession) {
        setActiveSessionState(newSession);
        await setActiveSession(newSession.id);
      }
      setShowNewSession(false);
      setNewSessionName("");
      setNewSessionStart("");
      setNewSessionEnd("");
      setNewSessionAllTime(false);
      toast.success(`Sesi "${newSession.name}" berhasil dibuat!`);
    } catch (e: any) {
      toast.error(e.message || "Gagal membuat sesi.");
    }
  };

  const handleSwitchSession = async (sessionId: string) => {
    try {
      await setActiveSession(sessionId);
      const session = sessions.find((s) => s.id === sessionId);
      setActiveSessionState(session);
      setShowSessionModal(false);
      toast.success(`Berpindah ke sesi "${session?.name}"`);
    } catch (e: any) {
      toast.error(e.message || "Gagal berpindah sesi.");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteStudySession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSession?.id === sessionId) {
        setActiveSessionState(sessions.find((s) => s.id !== sessionId) || null);
      }
      toast.success("Sesi berhasil dihapus.");
    } catch (e: any) {
      toast.error(e.message || "Gagal menghapus sesi.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">Memuat data akademik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header & Controls Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] md:text-3xl flex items-center gap-2 flex-wrap">
            {greeting}, {displayName}
            {/* Active Session Badge */}
            {activeSession ? (
              <button
                onClick={() => setShowSessionModal(true)}
                className="text-xs font-semibold px-2.5 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors flex items-center gap-1"
              >
                <Stack size={12} weight="fill" />
                {activeSession.name}
              </button>
            ) : (
              <button
                onClick={() => setShowNewSession(true)}
                className="text-xs font-semibold px-2.5 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors flex items-center gap-1"
              >
                <Plus size={12} weight="bold" />
                Buat Sesi
              </button>
            )}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            {activeSession
              ? `Sesi aktif: ${activeSession.name}${activeSession.isAllTime ? " (Aktif selamanya)" : activeSession.startDate ? ` (Berlaku sejak ${new Date(activeSession.startDate).toLocaleDateString("id-ID")})` : ""}`
              : `Kamu memiliki ${tasks.length} tugas aktif dan ${schedule.length} jadwal hari ini.`}
          </p>
        </div>

        {/* Mobile: Session/Level right-aligned */}
        <div className="flex flex-row items-center justify-between w-full md:w-auto gap-4">
          <button
            onClick={() => setShowSessionModal(true)}
            className="flex-1 md:flex-initial text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 outline-none text-[var(--color-text)] cursor-pointer hover:border-[var(--color-primary)] transition-colors shadow-[var(--shadow-sm)] flex items-center gap-2"
          >
            <Stack size={14} className="text-[var(--color-primary)]" />
            {activeSession ? "Ganti Sesi" : "Buat Sesi"}
          </button>

          <Link
            href="/app/gamification"
            className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] p-2.5 md:p-3 rounded-2xl shadow-[var(--shadow-sm)] hover:border-[var(--color-primary)]/40 transition-colors shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
              <Trophy size={20} weight="fill" />
            </div>
            <div>
              <div className="flex justify-between items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[var(--color-text)]">Level {level}</span>
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
                  {xp % xpForNextLevel}/{xpForNextLevel} XP
                </span>
              </div>
              <div className="w-20 sm:w-24 h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Main Grid: On mobile AI insight is at the very top, followed by Schedule, Tasks, and Notes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Mobile-only Top Stack: AI Insight + Schedule */}
        <div className="space-y-6 lg:hidden">
          {/* AI Insight Card with Expand/Collapse */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-3xl border border-[var(--color-border)] p-5 shadow-sm bg-gradient-to-br from-[#8B5CF6]/10 to-[var(--color-surface)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={20} weight="duotone" className="text-[#8B5CF6]" />
                <h2 className="text-sm font-bold text-[var(--color-text)]">Insight AI NeLK</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6] bg-[#8B5CF6]/15 px-2 py-0.5 rounded-full">
                  Asisten
                </span>
                <button
                  onClick={() => setAiInsightExpanded(!aiInsightExpanded)}
                  className="text-[var(--color-text-muted)] p-1 hover:text-[var(--color-text)]"
                  aria-label="Toggle AI Insight"
                >
                  {aiInsightExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {aiInsightExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {aiInsight && aiInsight.title && (
                    <div className="mt-3 mb-2 text-xs font-bold text-[var(--color-text)] px-2.5 py-1 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] inline-block">
                      📚 {aiInsight.title}
                    </div>
                  )}
                  <div className="mt-2 text-xs leading-relaxed text-[var(--color-text-muted)] whitespace-pre-wrap">
                    {aiInsight ? aiInsight.summary : "Menganalisis jadwal dan catatan belajarmu..."}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                    <Link
                      href="/app/ai"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B5CF6] hover:underline"
                    >
                      <Lightning size={12} weight="fill" />
                      Tanya AI
                    </Link>
                    <Link href="/app/notes" className="text-xs font-medium text-[var(--color-text-muted)] hover:underline">
                      Lihat Catatan
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Today's Schedule Card (Mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarDots size={20} weight="duotone" className="text-[var(--color-primary)]" />
                <h2 className="text-sm font-bold text-[var(--color-text)]">Jadwal Hari Ini</h2>
              </div>
              <Link href="/app/schedule" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
                Buka Kalender
              </Link>
            </div>
            <div className="space-y-2.5">
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
                <p className="text-xs text-[var(--color-text-muted)] py-3 text-center">
                  Tidak ada agenda kuliah atau kegiatan hari ini.
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tasks Section (Col 1-2 on Desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
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
                      {task.priority || "MEDIUM"}
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
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              <Plus size={14} weight="bold" />
              <span>Tambah Tugas Baru</span>
            </Link>
          </div>
        </motion.div>

        {/* Desktop-only Right Column: AI Insight & Today's Schedule */}
        <div className="space-y-6 hidden lg:block">
          {/* Proactive AI Insight (Desktop) */}
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

            {aiInsight && aiInsight.title && (
              <div className="mb-2 text-xs font-bold text-[var(--color-text)] px-2.5 py-1 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] inline-block">
                📚 {aiInsight.title}
              </div>
            )}

            <div className="text-xs leading-relaxed text-[var(--color-text-muted)] whitespace-pre-wrap">
              {aiInsight ? aiInsight.summary : "Menganalisis pola belajarmu..."}
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

          {/* Today's Schedule Card (Desktop) */}
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

        {/* Recent Notes Section (Full width on bottom) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-3 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Notebook size={20} weight="duotone" className="text-[var(--color-primary)]" />
              <h2 className="text-base font-bold text-[var(--color-text)]">Catatan Terkini</h2>
            </div>
            <Link
              href="/app/notes"
              className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
            >
              Semua Catatan <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {notes.length > 0 ? (
              notes.map((note) => (
                <Link
                  key={note.id}
                  href="/app/notes"
                  className="p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 transition-colors group flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xs font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                      {note.title}
                    </h3>
                    <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2 mt-1.5">
                      {note.content || "Belum ada konten."}
                    </p>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)] mt-3 block">
                    Diperbarui {new Date(note.updatedAt).toLocaleDateString("id-ID")}
                  </span>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-[var(--color-text-muted)]">
                Belum ada catatan materi kuliah.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Session Management Modal */}
      <AnimatePresence>
        {showSessionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSessionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Stack size={20} className="text-[var(--color-primary)]" />
                  Kelola Sesi
                </h3>
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Session List */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      activeSession?.id === session.id
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <button
                      onClick={() => handleSwitchSession(session.id)}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-semibold text-[var(--color-text)]">{session.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {session.isAllTime
                          ? "Aktif selamanya"
                          : session.startDate
                          ? `Dari ${new Date(session.startDate).toLocaleDateString("id-ID")}`
                          : "Tanpa batas waktu"}
                      </p>
                    </button>
                    {activeSession?.id === session.id && (
                      <Check size={18} className="text-[var(--color-primary)]" weight="bold" />
                    )}
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}

                {sessions.length === 0 && (
                  <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                    Belum ada sesi. Buat sesi pertama kamu.
                  </p>
                )}
              </div>

              {/* Create New Session */}
              {showNewSession ? (
                <div className="space-y-3 p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <input
                    type="text"
                    placeholder="Nama sesi (contoh: Semester 5)"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Dari Tanggal</label>
                      <input
                        type="date"
                        value={newSessionStart}
                        onChange={(e) => setNewSessionStart(e.target.value)}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Sampai Tanggal</label>
                      <input
                        type="date"
                        value={newSessionEnd}
                        onChange={(e) => setNewSessionEnd(e.target.value)}
                        disabled={newSessionAllTime}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSessionAllTime}
                      onChange={(e) => setNewSessionAllTime(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    Aktif selamanya (tanpa batas akhir)
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowNewSession(false)}
                      className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleCreateSession}
                      className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                    >
                      Buat Sesi
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewSession(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                >
                  <Plus size={16} weight="bold" />
                  Buat Sesi Baru
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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

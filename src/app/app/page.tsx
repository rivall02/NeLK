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
} from "@phosphor-icons/react";
import Link from "next/link";


const upcomingTasks = [
  { title: "Tugas Basis Data — ERD Perpustakaan", due: "Besok, 23:59", priority: "high" },
  { title: "Baca Bab 5 — Kalkulus II", due: "Rabu, 10:00", priority: "medium" },
  { title: "Quiz Pemrograman Web", due: "Kamis, 08:00", priority: "high" },
];

const todaySchedule = [
  { time: "08:00", title: "Basis Data", type: "class", color: "var(--color-primary)" },
  { time: "10:00", title: "Kalkulus II", type: "class", color: "var(--color-accent-pink)" },
  { time: "13:00", title: "Sesi Belajar — Sorting", type: "study", color: "var(--color-accent-lime)" },
  { time: "15:00", title: "Pemrograman Web", type: "class", color: "var(--color-accent-yellow)" },
];

const recentNotes = [
  { title: "Normalisasi Database", subject: "Basis Data", updatedAt: "2 jam lalu" },
  { title: "Quick Sort vs Merge Sort", subject: "Algoritma", updatedAt: "5 jam lalu" },
];

export default function DashboardPage() {
  const greeting = getGreeting();
  const [noteSummary, setNoteSummary] = React.useState<{title: string, summary: string} | null>(null);
  const [userProfile, setUserProfile] = React.useState<{xp: number, level: number, contextMode: string} | null>(null);

  React.useEffect(() => {
    import("@/lib/actions").then(actions => {
      actions.getRandomNoteSummary().then(res => setNoteSummary(res as any));
      actions.getUserProfile().then(profile => {
        if (profile) setUserProfile(profile as any);
      });
    });
  }, []);

  const level = userProfile?.level || 1;
  const xp = userProfile?.xp || 0;
  const xpForNextLevel = 1000;
  const xpProgress = Math.min(100, Math.round((xp % xpForNextLevel) / xpForNextLevel * 100));
  const contextMode = userProfile?.contextMode || "NORMAL";

  const setContext = async (mode: string) => {
    setUserProfile(prev => prev ? { ...prev, contextMode: mode } : null);
    const actions = await import("@/lib/actions");
    await actions.updateContextMode(mode);
  };

  return (
    <div className="space-y-8">
      {/* Header & Gamification */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] md:text-3xl flex items-center gap-2">
            {greeting}, Rhys
            <span className="text-sm font-medium px-2 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-md">
              {contextMode === "NORMAL" ? "Normal Semester" : contextMode === "EXAM_WEEK" ? "Exam Week" : "Vacation"} Mode
            </span>
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {contextMode === "EXAM_WEEK" 
              ? "Minggu ujian! Fokus ke materi penting dan tugas mendesak." 
              : contextMode === "VACATION"
              ? "Waktunya bersantai dan kembangkan hobi di luar akademik."
              : "Kamu punya 3 tugas mendesak dan 4 jadwal hari ini."}
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <select 
            value={contextMode} 
            onChange={(e) => setContext(e.target.value)}
            className="text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-2 py-1 outline-none text-[var(--color-text)] cursor-pointer hover:border-[var(--color-primary)] transition-colors"
          >
            <option value="NORMAL">Normal</option>
            <option value="EXAM_WEEK">Exam Week</option>
            <option value="VACATION">Vacation</option>
          </select>
          <div className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <Trophy size={24} weight="fill" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-[var(--color-text)]">Level {level}</span>
                <span className="text-xs font-semibold text-[var(--color-text-muted)]">{xp % xpForNextLevel}/{xpForNextLevel}</span>
              </div>
              <div className="w-24 h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>


      {/* Main Grid - Adaptive */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {contextMode === "EXAM_WEEK" ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl border border-[var(--color-error)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={18} weight="duotone" className="text-[var(--color-error)]" />
                <h2 className="text-base font-semibold text-[var(--color-text)]">Fokus Ujian & Deadline Dekat</h2>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { title: "Review Bab Kalkulus (Final Exam)", due: "Besok, 08:00", priority: "high" },
                { title: "Simulasi Kuis Basis Data", due: "Hari ini, 19:00", priority: "high" }
              ].map((task, i) => (
                <div key={i} className="group flex items-center gap-4 rounded-xl px-4 py-3 bg-[var(--color-bg)] border-l-4 border-[var(--color-error)]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--color-error)] truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={12} className="text-[var(--color-text-muted)]" />
                      <span className="text-xs font-semibold text-[var(--color-text)]">{task.due}</span>
                    </div>
                  </div>
                  <button className="text-xs font-medium bg-[var(--color-error)] text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">
                    Mulai Belajar
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ) : contextMode === "VACATION" ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={18} weight="duotone" className="text-[var(--color-primary)]" />
                <h2 className="text-base font-semibold text-[var(--color-text)]">Personal Goals & Lifestyle</h2>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">Liburan adalah waktu yang tepat untuk recharge dan hobi.</p>
              {[
                { title: "Morning Run 5K", stat: "3/5 hari minggu ini", color: "var(--color-accent-pink)" },
                { title: "Baca Buku Non-Fiksi", stat: "Bab 4/10", color: "var(--color-primary)" }
              ].map((goal, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{goal.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{goal.stat}</p>
                  </div>
                  <button className="text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-1.5 rounded-lg hover:border-[var(--color-primary)] transition-colors">
                    Update Progress
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={18} weight="duotone" className="text-[var(--color-accent-lime)]" />
                <h2 className="text-base font-semibold text-[var(--color-text)]">Tugas Mendatang</h2>
              </div>
              <Link href="/app/tasks" className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline">
                Lihat Semua <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map((task, i) => (
                <motion.div
                  key={task.title}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                  className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)]"
                >
                  <button className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-[var(--color-border)] transition-colors group-hover:border-[var(--color-primary)]" aria-label="Tandai selesai" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={12} className="text-[var(--color-text-muted)]" />
                      <span className="text-xs text-[var(--color-text-muted)]">{task.due}</span>
                    </div>
                  </div>
                  <div
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      task.priority === "high" ? "bg-[var(--color-error)]" : "bg-[var(--color-accent-yellow)]"
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Schedule / AI Insight Column */}
        <div className="space-y-6">
          {/* Proactive Insight */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className={`rounded-2xl border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)] ${
              contextMode === "EXAM_WEEK" 
                ? "bg-gradient-to-br from-red-50 to-[var(--color-surface)] dark:from-red-950/20" 
                : "bg-gradient-to-br from-[var(--color-ai-light)] to-[var(--color-surface)]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Brain size={18} weight="duotone" className="text-[var(--color-ai)]" />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--color-ai)]"
                  />
                </div>
                <h2 className="text-base font-semibold text-[var(--color-text)]">Insight AI</h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ai)] bg-[var(--color-ai-light)] px-2 py-0.5 rounded-full">
                Random Recall
              </span>
            </div>
            {noteSummary && noteSummary.title !== "Insight AI" && (
              <div className="mb-2 text-xs font-semibold text-[var(--color-text)] px-2 py-1 bg-[var(--color-bg)] rounded-md border border-[var(--color-border)] inline-block">
                📚 {noteSummary.title}
              </div>
            )}
            <div className="text-sm leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap">
              {noteSummary ? noteSummary.summary : "Sedang menganalisis catatanmu..."}
            </div>
            <Link
              href="/app/notes"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ai)] hover:underline"
            >
              <Lightning size={12} weight="fill" />
              Lihat Semua Catatan
            </Link>
          </motion.div>

          {/* Contextual Secondary Block */}
          {contextMode === "NORMAL" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDots size={18} weight="duotone" className="text-[var(--color-primary)]" />
                  <h2 className="text-base font-semibold text-[var(--color-text)]">Hari Ini</h2>
                </div>
              </div>
              <div className="space-y-3">
                {todaySchedule.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-0.5 text-xs font-mono text-[var(--color-text-muted)] w-10 shrink-0">
                      {item.time}
                    </span>
                    <div className="flex-1 rounded-lg border-l-2 pl-3 py-1" style={{ borderColor: item.color }}>
                      <p className="text-sm font-medium text-[var(--color-text)]">{item.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)] capitalize">{item.type}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {contextMode === "EXAM_WEEK" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Notebook size={18} weight="duotone" className="text-[var(--color-primary)]" />
                  <h2 className="text-base font-semibold text-[var(--color-text)]">Materi Terkait</h2>
                </div>
              </div>
              <div className="space-y-3">
                {recentNotes.map((note, i) => (
                  <div key={i} className="p-3 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors">
                    <p className="text-sm font-medium">{note.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{note.subject}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 17) return "Selamat Siang";
  if (hour < 21) return "Selamat Sore";
  return "Selamat Malam";
}

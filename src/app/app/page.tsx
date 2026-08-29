"use client";

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] md:text-3xl">
          {greeting}, Rhys
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Kamu punya 3 tugas mendesak dan 4 jadwal hari ini.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { label: "Catatan Baru", icon: Notebook, href: "/app/notes", color: "var(--color-primary)" },
          { label: "Tugas Baru", icon: CheckSquare, href: "/app/tasks", color: "var(--color-accent-lime)" },
          { label: "Lihat Jadwal", icon: CalendarDots, href: "/app/schedule", color: "var(--color-accent-pink)" },
          { label: "Tanya AI", icon: Brain, href: "/app/ai", color: "var(--color-ai)" },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <motion.div
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `color-mix(in srgb, ${action.color} 12%, transparent)` }}
                >
                  <Icon size={20} weight="duotone" style={{ color: action.color }} />
                </div>
                <span className="text-sm font-medium text-[var(--color-text)]">{action.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tasks — 2 col */}
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
            <Link
              href="/app/tasks"
              className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
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

        {/* Schedule — 1 col */}
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
            <Link
              href="/app/schedule"
              className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              Kalender <ArrowRight size={12} />
            </Link>
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

        {/* Recent Notes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Notebook size={18} weight="duotone" className="text-[var(--color-primary)]" />
              <h2 className="text-base font-semibold text-[var(--color-text)]">Catatan Terbaru</h2>
            </div>
            <Link
              href="/app/notes"
              className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              Semua Catatan <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {recentNotes.map((note, i) => (
              <motion.div
                key={note.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.06 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 transition-shadow hover:shadow-[var(--shadow-sm)] cursor-pointer"
              >
                <p className="text-sm font-medium text-[var(--color-text)]">{note.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-primary)]">
                    {note.subject}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">{note.updatedAt}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-ai-light)] to-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]"
        >
          <div className="flex items-center gap-2 mb-3">
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
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Topik <strong className="text-[var(--color-text)]">Normalisasi 2NF</strong> perlu
            perhatian ekstra. Hasil kuis terakhir menunjukkan akurasi 65%.
            Coba review catatan dan minta AI untuk buatkan latihan soal.
          </p>
          <Link
            href="/app/ai"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ai)] hover:underline"
          >
            <Lightning size={12} weight="fill" />
            Buka AI Asisten
          </Link>
        </motion.div>
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

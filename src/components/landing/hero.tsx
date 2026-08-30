"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Lightning, Brain, CalendarDots, Notebook } from "@phosphor-icons/react";

export function LandingHero() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden pt-24 pb-16">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[var(--color-primary)] opacity-[0.06] blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[var(--color-ai)] opacity-[0.06] blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
        {/* Left: Copy */}
        <div className="max-w-xl order-2 order-lg-1">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-xs font-semibold text-[var(--color-primary)] shadow-[var(--shadow-sm)]">
              <Lightning size={14} weight="fill" />
              AI-Powered Learning Platform
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--color-text)] md:text-5xl lg:text-6xl"
            >
              Satu workspace untuk
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-ai)] bg-clip-text text-transparent">
                seluruh perjalanan
              </span>
              belajarmu
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-5 max-w-[50ch] text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg"
            >
              NeLK menghubungkan catatan, tugas, jadwal, dan mata kuliah ke
              dalam satu sistem cerdas yang memahami konteks akademikmu.
            </motion.p>
            {/* Semester and Level selector for mobile & desktop */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="mt-8 flex flex-row items-center justify-between gap-4 w-full">
                <div className="flex-1 max-w-[240px]">
                  <select
                    value="NORMAL"
                    onChange={() => {}}
                    className="w-full rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-3.5 py-2 text-xs font-semibold text-[var(--color-text)] cursor-default shadow-[var(--shadow-sm)] outline-none"
                    disabled
                  >
                    <option value="NORMAL">Semester Reguler</option>
                    <option value="EXAM_WEEK">Minggu Ujian</option>
                    <option value="VACATION">Liburan</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 shrink-0 bg-[var(--color-surface)] border border-[var(--color-border)] px-3.5 py-1.5 rounded-xl shadow-[var(--shadow-sm)]">
                  <span className="text-xs font-medium text-[var(--color-text-muted)]">Level</span>
                  <span className="text-sm font-bold text-[var(--color-primary)]">3</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right: App Preview (Bento Grid) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative w-full"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card: Notes */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-light)]">
                  <Notebook size={20} weight="duotone" className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">Catatan Terkini</p>
                  <p className="text-xs text-[var(--color-text-muted)]">3 catatan diperbarui hari ini</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[ "Normalisasi Database — Bentuk 1NF, 2NF, 3NF", "Algoritma Sorting — Quick Sort vs Merge Sort", "Kalkulus II — Integral Lipat Dua" ].map((note, i) => (
                  <div key={i} className="rounded-xl bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text-secondary)]">
                    {note}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Card: Schedule */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent-lime)]/10">
                  <CalendarDots size={18} weight="duotone" className="text-[var(--color-accent-lime)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--color-text)]">Jadwal Hari Ini</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                  <span className="text-[var(--color-text-secondary)]">08:00 — Basis Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[var(--color-accent-pink)]" />
                  <span className="text-[var(--color-text-secondary)]">10:00 — Kalkulus II</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[var(--color-accent-lime)]" />
                  <span className="text-[var(--color-text-secondary)]">14:00 — Pemrograman Web</span>
                </div>
              </div>
            </motion.div>

            {/* Card: AI */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-ai-light)] to-[var(--color-surface)] p-5 shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-ai)]/10">
                  <Brain size={18} weight="duotone" className="text-[var(--color-ai)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--color-text)]">AI Asisten</p>
              </div>
              <div className="rounded-xl bg-[var(--color-surface)] px-3 py-2.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                "Topik <strong>Normalisasi</strong> perlu diulas kembali. Kuis terakhir menunjukkan kelemahan di 2NF."
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
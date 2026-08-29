"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Brain, Sparkle, ChatCircleDots } from "@phosphor-icons/react";

const aiCapabilities = [
  { label: "Merangkum materi perkuliahan", delay: 0 },
  { label: "Menjelaskan konsep yang sulit", delay: 0.8 },
  { label: "Membuat kuis dari catatanmu", delay: 1.6 },
  { label: "Merekomendasikan jadwal belajar", delay: 2.4 },
];

export function LandingAI() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="ai"
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-[var(--color-bg)] via-[var(--color-ai-light)] to-[var(--color-bg)] py-24 md:py-32"
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-ai)] opacity-[0.05] blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left: AI Chat Preview */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-ai)]">
                  <Brain size={20} weight="fill" className="text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[var(--color-success)] ring-2 ring-[var(--color-surface)]"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">NeLK AI</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Konteks: Basis Data</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="mt-4 space-y-3">
                {/* User */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-[var(--color-primary)] px-4 py-2.5 text-sm text-white">
                    Jelaskan perbedaan 2NF dan 3NF
                  </div>
                </div>

                {/* AI */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[var(--color-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    <div className="mb-2 flex items-center gap-1.5">
                      <Sparkle size={14} weight="fill" className="text-[var(--color-ai)]" />
                      <span className="text-xs font-medium text-[var(--color-ai)]">Berdasarkan catatanmu</span>
                    </div>
                    <strong className="text-[var(--color-text)]">2NF</strong> menghilangkan ketergantungan
                    parsial — atribut non-key bergantung pada sebagian kunci komposit.{" "}
                    <strong className="text-[var(--color-text)]">3NF</strong> menghilangkan ketergantungan
                    transitif — atribut non-key bergantung pada atribut non-key lain.
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex flex-1 items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5">
                  <ChatCircleDots size={16} className="mr-2 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text-muted)]">Tanyakan sesuatu...</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Copy */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
              AI yang memahami{" "}
              <span className="bg-gradient-to-r from-[var(--color-ai)] to-[var(--color-primary)] bg-clip-text text-transparent">
                konteks belajarmu
              </span>
            </h2>
            <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg">
              Bukan chatbot biasa. NeLK AI membaca catatan, memahami kurikulum,
              dan memberikan jawaban yang relevan dengan mata kuliahmu.
            </p>

            {/* AI Capabilities */}
            <div className="mt-8 space-y-3">
              {aiCapabilities.map((cap, i) => (
                <motion.div
                  key={cap.label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-ai-light)]">
                    <Sparkle size={12} weight="fill" className="text-[var(--color-ai)]" />
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text)]">{cap.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

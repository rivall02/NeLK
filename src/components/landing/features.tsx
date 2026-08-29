"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Notebook,
  CheckSquare,
  CalendarDots,
  Brain,
  MagnifyingGlass,
  Gear,
} from "@phosphor-icons/react";

const features = [
  {
    icon: Notebook,
    title: "Knowledge & Catatan",
    description: "Tulis, organisasi, dan hubungkan catatan dengan mata kuliah. AI bantu merangkum dan menjelaskan materi.",
    color: "var(--color-primary)",
    bgColor: "var(--color-primary-light)",
  },
  {
    icon: CheckSquare,
    title: "Manajemen Tugas",
    description: "Lacak semua tugas dari inbox hingga selesai. Atur prioritas, tenggat waktu, dan estimasi durasi.",
    color: "var(--color-accent-lime)",
    bgColor: "rgba(132, 204, 22, 0.1)",
  },
  {
    icon: CalendarDots,
    title: "Jadwal Terpusat",
    description: "Satukan kelas, tugas, ujian, dan sesi belajar. Bedakan jadwal tetap dan fleksibel.",
    color: "var(--color-accent-pink)",
    bgColor: "rgba(236, 72, 153, 0.1)",
  },
  {
    icon: Brain,
    title: "Kecerdasan AI",
    description: "AI kontekstual yang memahami hubungan antara catatan, tugas, dan jadwal akademikmu.",
    color: "var(--color-ai)",
    bgColor: "var(--color-ai-light)",
  },
  {
    icon: MagnifyingGlass,
    title: "Pencarian Global",
    description: "Temukan catatan, dokumen, tugas, atau jadwal dengan satu pencarian universal.",
    color: "var(--color-accent-yellow)",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
  {
    icon: Gear,
    title: "Personalisasi",
    description: "Atur tema gelap/terang, bahasa, preferensi notifikasi, dan perilaku AI sesuai kebutuhanmu.",
    color: "var(--color-text-secondary)",
    bgColor: "var(--color-surface-hover)",
  },
];

export function LandingFeatures() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
            Semua yang kamu butuhkan, dalam satu tempat
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg">
            Berhenti berpindah antar aplikasi. NeLK menyatukan seluruh alat
            belajarmu ke dalam workspace yang saling terhubung.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <Icon size={22} weight="duotone" style={{ color: feature.color }} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[var(--color-text)]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

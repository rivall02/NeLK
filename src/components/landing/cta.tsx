"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

export function LandingCTA() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="about" ref={ref} className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[var(--color-ai)] p-12 text-white shadow-[var(--shadow-lg)] md:p-16"
        >
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

          <div className="relative max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Siap menata perjalanan belajarmu?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/80 md:text-lg">
              Bergabung dengan mahasiswa yang sudah menggunakan NeLK untuk
              menghubungkan semua aspek akademik mereka.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-[var(--color-primary-dark)] shadow-[var(--shadow-md)] transition-all duration-[var(--duration-micro)] hover:bg-white/90 hover:shadow-[var(--shadow-lg)] active:scale-[0.97]"
              >
                Mulai Gratis
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

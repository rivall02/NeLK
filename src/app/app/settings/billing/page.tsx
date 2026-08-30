"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, CheckCircle, ShieldCheck, Sparkle } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { getUserProfile } from "@/lib/actions";
import { toast } from "sonner";

export default function BillingPage() {
  const [profile, setProfile] = useState<{ subscriptionPlan: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile().then((data) => {
      setProfile(data as any);
      setLoading(false);
    });
  }, []);

  const isPro = profile?.subscriptionPlan === "PRO";

  const handleUpgradeClick = () => {
    toast.info("Integrasi pembayaran online (Stripe/Midtrans) sedang dalam tahap konfigurasi. Hubungi administrator untuk akses awal.");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] md:text-3xl">
          Paket Langganan & Akses
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Kelola paket langganan NeLK Anda dan nikmati fitur akademik tingkat lanjut.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Tier */}
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-[var(--color-text)]">Paket Dasar (Free)</h2>
              {!isPro && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400">
                  Paket Aktif
                </span>
              )}
            </div>
            <p className="text-3xl font-extrabold mt-4 mb-1 text-[var(--color-text)]">
              Rp 0<span className="text-sm font-normal text-[var(--color-text-muted)]">/bulan</span>
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mb-6">Gratis untuk seluruh mahasiswa.</p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2.5 text-xs text-[var(--color-text)]">
                <CheckCircle size={18} className="text-green-500 shrink-0" weight="fill" />
                Manajemen Catatan & Tugas Lengkap
              </li>
              <li className="flex items-center gap-2.5 text-xs text-[var(--color-text)]">
                <CheckCircle size={18} className="text-green-500 shrink-0" weight="fill" />
                Kalender Akademik & Jadwal Kuliah
              </li>
              <li className="flex items-center gap-2.5 text-xs text-[var(--color-text)]">
                <CheckCircle size={18} className="text-green-500 shrink-0" weight="fill" />
                Integrasi Strava & Gamifikasi XP
              </li>
            </ul>
          </div>

          <button
            disabled
            className="w-full py-2.5 rounded-xl bg-[var(--color-bg)] text-[var(--color-text-muted)] font-semibold text-sm border border-[var(--color-border)] opacity-80 cursor-default"
          >
            {!isPro ? "Paket Saat Ini" : "Turun ke Dasar"}
          </button>
        </div>

        {/* Pro Tier */}
        <div className="rounded-3xl border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 bg-[var(--color-primary)] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Akademik Pro
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-[var(--color-primary)]">Paket Pro</h2>
              {isPro && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                  Paket Aktif
                </span>
              )}
            </div>

            <p className="text-3xl font-extrabold mt-4 mb-1 text-[var(--color-text)]">
              Rp 49.000<span className="text-sm font-normal text-[var(--color-text-muted)]">/bulan</span>
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mb-6">Untuk produktivitas dan AI intensif.</p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2.5 text-xs text-[var(--color-text)]">
                <CheckCircle size={18} className="text-[var(--color-primary)] shrink-0" weight="fill" />
                Semua Fitur Paket Dasar
              </li>
              <li className="flex items-center gap-2.5 text-xs text-[var(--color-text)]">
                <CheckCircle size={18} className="text-[var(--color-primary)] shrink-0" weight="fill" />
                AI Assistant & RAG Insight Tanpa Batas
              </li>
              <li className="flex items-center gap-2.5 text-xs text-[var(--color-text)]">
                <CheckCircle size={18} className="text-[var(--color-primary)] shrink-0" weight="fill" />
                Smart Auto-Scheduling Cerdas
              </li>
              <li className="flex items-center gap-2.5 text-xs text-[var(--color-text)]">
                <CheckCircle size={18} className="text-[var(--color-primary)] shrink-0" weight="fill" />
                Penyimpanan Dokumen Hingga 500MB
              </li>
            </ul>
          </div>

          <div>
            <button
              onClick={handleUpgradeClick}
              className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm hover:bg-[var(--color-primary-hover)] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <CreditCard size={18} />
              <span>Upgrade ke Pro (Hubungi Admin)</span>
            </button>
            <p className="text-[11px] text-[var(--color-text-muted)] text-center mt-2">
              Gerbang pembayaran otomatis akan segera diluncurkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

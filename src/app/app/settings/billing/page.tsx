"use client";

import React, { useState } from "react";
import { CreditCard, CheckCircle, Warning } from "@phosphor-icons/react";
import { motion } from "motion/react";

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSubscribed(true);
      alert("Simulasi berhasil! Akun Anda telah diupgrade ke PRO.");
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] md:text-3xl">
          Berlangganan & Penagihan
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Kelola paket langganan NeLK Anda (Simulasi Stripe).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Tier */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[var(--color-text)]">Paket Basic</h2>
          <p className="text-3xl font-bold mt-4 mb-2 text-[var(--color-text)]">Rp 0<span className="text-sm font-normal text-[var(--color-text-muted)]">/bulan</span></p>
          <ul className="space-y-3 mb-6 mt-6">
            <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <CheckCircle size={18} className="text-green-500" weight="fill" />
              Fitur Catatan & Tugas Dasar
            </li>
            <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <CheckCircle size={18} className="text-green-500" weight="fill" />
              Integrasi Terbatas (Strava)
            </li>
          </ul>
          {!subscribed ? (
            <button disabled className="w-full py-2.5 rounded-xl bg-[var(--color-bg)] text-[var(--color-text-muted)] font-medium border border-[var(--color-border)]">
              Paket Saat Ini
            </button>
          ) : (
            <button className="w-full py-2.5 rounded-xl bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors">
              Turun ke Basic
            </button>
          )}
        </div>

        {/* Pro Tier */}
        <div className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5 p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            POPULER
          </div>
          <h2 className="text-xl font-bold text-[var(--color-primary)]">Paket Pro</h2>
          <p className="text-3xl font-bold mt-4 mb-2 text-[var(--color-text)]">Rp 49.000<span className="text-sm font-normal text-[var(--color-text-muted)]">/bulan</span></p>
          <ul className="space-y-3 mb-6 mt-6">
            <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <CheckCircle size={18} className="text-[var(--color-primary)]" weight="fill" />
              Semua Fitur Basic
            </li>
            <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <CheckCircle size={18} className="text-[var(--color-primary)]" weight="fill" />
              AI Chat & Insight Tanpa Batas
            </li>
            <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <CheckCircle size={18} className="text-[var(--color-primary)]" weight="fill" />
              Akses Komunitas Premium
            </li>
          </ul>
          {subscribed ? (
            <button disabled className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-medium opacity-80 cursor-default">
              Paket Saat Ini
            </button>
          ) : (
            <button 
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <CreditCard size={20} />
                  Mulai Simulasi Pembayaran
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

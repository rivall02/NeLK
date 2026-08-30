"use client";

import { motion } from "motion/react";
import { Sneaker, ArrowClockwise, Heartbeat, Flame, Timer } from "@phosphor-icons/react";
import { useState } from "react";
import { syncStrava } from "@/lib/actions";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

type Activity = {
  id: string;
  title: string;
  type: string;
  duration: number | null;
  calories: number | null;
  createdAt: Date;
};

export default function FitnessClient({
  initialActivities,
  hasStrava,
}: {
  initialActivities: Activity[];
  hasStrava: boolean;
}) {
  const [activities, setActivities] = useState(initialActivities);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!hasStrava) {
      await signIn("strava", { callbackUrl: "/app/fitness" });
      return;
    }

    setIsSyncing(true);
    const toastId = toast.loading("Menyinkronkan data aktivitas Strava...");
    try {
      const result = await syncStrava();
      if (result.success) {
        toast.success(result.message || `Berhasil menyinkronkan ${result.count} aktivitas.`, { id: toastId });
      } else {
        toast.info(result.message || "Tidak ada aktivitas baru.", { id: toastId });
      }
    } catch (e: any) {
      toast.error(e.message || "Gagal menyinkronkan Strava.", { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 pt-6 min-h-screen">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3"
          >
            <Sneaker weight="fill" className="text-[#FC4C02]" />
            Kebugaran & Olahraga
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--color-text-muted)] mt-1 text-sm"
          >
            Seimbangkan waktu belajar dan kesehatan fisikmu melalui integrasi Strava.
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FC4C02] text-white rounded-xl hover:bg-[#e04302] transition-colors font-semibold text-sm shadow-sm disabled:opacity-50"
        >
          <ArrowClockwise weight="bold" className={isSyncing ? "animate-spin" : ""} />
          <span>{isSyncing ? "Menyinkronkan..." : hasStrava ? "Sync Strava" : "Hubungkan Strava"}</span>
        </motion.button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-3xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
            <Flame size={24} weight="fill" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] font-medium">Kalori Terbakar</p>
            <p className="text-xl font-bold text-[var(--color-text)]">
              {activities.reduce((acc, curr) => acc + (curr.calories || 0), 0)} kcal
            </p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-3xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
            <Timer size={24} weight="fill" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] font-medium">Total Durasi</p>
            <p className="text-xl font-bold text-[var(--color-text)]">
              {activities.reduce((acc, curr) => acc + (curr.duration || 0), 0)} menit
            </p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-3xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-500 flex items-center justify-center">
            <Heartbeat size={24} weight="fill" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] font-medium">Total Aktivitas</p>
            <p className="text-xl font-bold text-[var(--color-text)]">{activities.length} Sesi</p>
          </div>
        </div>
      </div>

      <h3 className="text-base font-bold text-[var(--color-text)] mb-4">Riwayat Aktivitas Fisik</h3>

      {/* Activity List */}
      <div className="space-y-3">
        {activities.map((act, i) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.04 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-[#FC4C02] flex items-center justify-center">
                <Sneaker size={20} weight="fill" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--color-text)]">{act.title}</h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {new Date(act.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-xs font-semibold">
              <div className="text-right">
                <span className="text-[var(--color-text-muted)] text-[10px] block">Durasi</span>
                <span>{act.duration} m</span>
              </div>
              <div className="text-right">
                <span className="text-[var(--color-text-muted)] text-[10px] block">Kalori</span>
                <span className="text-orange-500">{act.calories} kcal</span>
              </div>
            </div>
          </motion.div>
        ))}

        {activities.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8">
            <Sneaker size={48} className="mb-3 opacity-30 text-[#FC4C02]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">Belum ada data aktivitas olahraga.</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Hubungkan akun Strava untuk menyinkronkan lari, bersepeda, dan latihan fisikmu secara otomatis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

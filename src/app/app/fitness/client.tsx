"use client";

import { motion } from "motion/react";
import { Sneaker, ArrowClockwise, Heartbeat, Flame, Timer } from "@phosphor-icons/react";
import { useState } from "react";
import { syncStrava } from "@/lib/actions";

type Activity = {
  id: string;
  title: string;
  type: string;
  duration: number | null;
  calories: number | null;
  createdAt: Date;
};

export default function FitnessClient({ initialActivities }: { initialActivities: Activity[] }) {
  const [activities, setActivities] = useState(initialActivities);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncStrava();
      if (result.success) {
        alert(`Berhasil sync ${result.count} aktivitas dari Strava (Mock). Refresh halaman untuk melihat.`);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to sync Strava");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3"
          >
            <Sneaker weight="fill" className="text-[#FC4C02]" />
            Kesehatan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--color-text-muted)] mt-2"
          >
            Lacak aktivitas olahraga dan kesehatan tubuhmu.
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FC4C02] text-white rounded-xl hover:bg-[#e04302] transition-colors font-medium shadow-sm disabled:opacity-50"
        >
          <ArrowClockwise weight="bold" className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing..." : "Sync Strava"}
        </motion.button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center">
            <Flame size={24} weight="fill" />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Kalori Terbakar</p>
            <p className="text-2xl font-bold text-[var(--color-text)]">
              {activities.reduce((acc, curr) => acc + (curr.calories || 0), 0)} kcal
            </p>
          </div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center">
            <Timer size={24} weight="fill" />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Total Waktu</p>
            <p className="text-2xl font-bold text-[var(--color-text)]">
              {activities.reduce((acc, curr) => acc + (curr.duration || 0), 0)} min
            </p>
          </div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-500 flex items-center justify-center">
            <Heartbeat size={24} weight="fill" />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Total Aktivitas</p>
            <p className="text-2xl font-bold text-[var(--color-text)]">{activities.length}</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Riwayat Aktivitas</h3>

      {/* Activity List */}
      <div className="space-y-3">
        {activities.map((act, i) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + Math.min(i, 10) * 0.05 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
                <Sneaker size={20} weight="fill" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--color-text)]">{act.title}</h4>
                <p className="text-xs text-[var(--color-text-muted)]">{new Date(act.createdAt).toLocaleString("id-ID")}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium">
              <div className="flex flex-col items-end">
                <span className="text-[var(--color-text-muted)] text-xs">Durasi</span>
                <span>{act.duration} m</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[var(--color-text-muted)] text-xs">Kalori</span>
                <span>{act.calories} kcal</span>
              </div>
            </div>
          </motion.div>
        ))}

        {activities.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
            <Sneaker size={48} className="mb-4 opacity-50 text-[var(--color-primary)]" />
            <p>Belum ada aktivitas olahraga.</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { motion } from "motion/react";
import { Trophy, GameController, Medal, Lightning } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { recordFocusSessionXP } from "@/lib/actions";
import { toast } from "sonner";

export default function GamificationClient({
  initialUsers,
  currentUserXp,
  currentUserLevel,
}: {
  initialUsers: any[];
  currentUserXp: number;
  currentUserLevel: number;
}) {
  const [xp, setXp] = useState(currentUserXp);
  const [level, setLevel] = useState(currentUserLevel);
  const [clickCount, setClickCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  // Focus Game logic
  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (isPlaying && timeLeft === 0) {
      setIsPlaying(false);
      finishGame();
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setClickCount(0);
    setTimeLeft(15);
    setIsPlaying(true);
  };

  const handleClick = () => {
    if (isPlaying) {
      setClickCount((prev) => prev + 1);
    }
  };

  const finishGame = async () => {
    if (clickCount >= 10) {
      try {
        const res = await recordFocusSessionXP(10);
        setXp(res.xp);
        setLevel(res.level);
        toast.success(`Latihan konsentrasi selesai! +${res.gainedXp} XP diperoleh.`);
      } catch (err: any) {
        toast.error(err.message || "Gagal mengklaim XP.");
      }
    } else {
      toast.info("Latihan selesai. Terus tingkatkan konsentrasi belajarmu!");
    }
  };

  const xpForNextLevel = 1000;
  const xpProgress = Math.min(100, Math.round(((xp % xpForNextLevel) / xpForNextLevel) * 100));

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 pt-6 min-h-screen">
      <header className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3"
        >
          <GameController weight="fill" className="text-[var(--color-primary)]" />
          Gamifikasi & Leaderboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[var(--color-text-muted)] mt-1 text-sm"
        >
          Kumpulkan XP dari penyelesaian tugas dan latihan fokus untuk menaikkan level akademikmu!
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Your Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 w-full h-2 bg-[var(--color-primary)]" />
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] mb-3 mt-2">
            <Trophy size={40} weight="duotone" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-0.5">Level {level}</h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">{xp} Total XP Diperoleh</p>

          <div className="w-full bg-[var(--color-bg)] rounded-full h-2.5 mb-1.5 overflow-hidden border border-[var(--color-border)]">
            <div
              className="bg-[var(--color-primary)] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-[11px] font-semibold text-[var(--color-text-muted)] w-full text-right">
            {xp % xpForNextLevel} / {xpForNextLevel} XP menuju Level {level + 1}
          </p>
        </motion.div>

        {/* Mini Focus Game */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-md text-white flex flex-col justify-between md:col-span-2"
        >
          <div>
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Lightning weight="fill" className="text-yellow-300" />
                Latihan Refleks & Fokus Belajar
              </h2>
              {isPlaying && (
                <div className="bg-white/20 px-3 py-1 rounded-xl font-mono text-sm font-bold backdrop-blur-sm">
                  {timeLeft} detik
                </div>
              )}
            </div>
            <p className="text-white/80 text-xs mb-4 max-w-md leading-relaxed">
              Istirahatkan pikiran sejenak dari materi berat! Klik tombol fokus dalam 15 detik untuk melatih ketangkasan dan memperoleh bonus XP fokus.
            </p>
          </div>

          <div className="flex flex-col items-center py-2">
            {!isPlaying && timeLeft === 15 ? (
              <button
                onClick={startGame}
                className="bg-white text-indigo-700 px-6 py-2.5 rounded-2xl font-bold text-sm hover:scale-105 transition-transform shadow-lg"
              >
                Mulai Sesi Fokus
              </button>
            ) : isPlaying ? (
              <button
                onClick={handleClick}
                className="bg-yellow-400 text-yellow-950 w-28 h-28 rounded-3xl font-black text-3xl flex items-center justify-center hover:scale-95 active:scale-90 transition-all shadow-2xl"
              >
                {clickCount}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-base font-bold mb-2">Skor Ketangkasan: {clickCount}</p>
                <button
                  onClick={startGame}
                  className="bg-white/20 text-white px-5 py-2 rounded-xl font-semibold text-xs hover:bg-white/30 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Leaderboard Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-sm mt-2"
        >
          <div className="p-5 px-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg)]/50">
            <h2 className="text-base font-bold flex items-center gap-2 text-[var(--color-text)]">
              <Medal weight="fill" className="text-yellow-500" />
              Peringkat Mahasiswa Teraktif
            </h2>
            <span className="text-xs text-[var(--color-text-muted)]">Top 20 Pengguna</span>
          </div>

          <div>
            {initialUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                Belum ada data peringkat pengguna.
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {initialUsers.slice(0, 20).map((user, idx) => (
                  <div
                    key={user.id}
                    className="p-4 px-6 flex items-center gap-4 hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300"
                          : idx === 1
                          ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          : idx === 2
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-[var(--color-bg)] text-[var(--color-text-muted)]"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold text-xs">
                      {user.name ? user.name[0].toUpperCase() : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-[var(--color-text)] truncate">
                        {user.name || "Anonim"}
                      </h4>
                      <p className="text-[11px] text-[var(--color-text-muted)]">Level {user.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-[var(--color-primary)]">{user.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

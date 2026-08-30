"use client";

import { motion } from "motion/react";
import { Trophy, GameController, Medal, Star, Lightning } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { awardXP } from "@/lib/actions";
import { toast } from "sonner";

export default function GamificationClient({ initialUsers, currentUserXp, currentUserLevel }: { initialUsers: any[], currentUserXp: number, currentUserLevel: number }) {
  const [xp, setXp] = useState(currentUserXp);
  const [level, setLevel] = useState(currentUserLevel);
  const [clickCount, setClickCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  
  // Game logic
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
    setTimeLeft(10);
    setIsPlaying(true);
  };

  const handleClick = () => {
    if (isPlaying) {
      setClickCount(prev => prev + 1);
    }
  };

  const finishGame = async () => {
    const gainedXp = Math.floor(clickCount / 2); // 1 XP for every 2 clicks
    if (gainedXp > 0) {
      toast.success(`Permainan selesai! Kamu mendapatkan ${gainedXp} XP!`);
      const res = await awardXP(gainedXp);
      if (res) {
        setXp(res.xp);
        setLevel(res.level);
      }
    } else {
      toast("Permainan selesai! Terus berlatih agar bisa dapat XP ya.");
    }
  };

  const xpForNextLevel = 1000;
  const xpProgress = Math.min(100, Math.round((xp % xpForNextLevel) / xpForNextLevel * 100));

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
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
          className="text-[var(--color-text-muted)] mt-2"
        >
          Bersaing dengan teman-temanmu dan dapatkan XP!
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Your Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 w-full h-2 bg-[var(--color-primary)]" />
          <div className="w-24 h-24 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] mb-4">
            <Trophy size={48} weight="duotone" />
          </div>
          <h2 className="text-xl font-bold mb-1">Level {level}</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">{xp} Total XP</p>
          
          <div className="w-full bg-[var(--color-bg)] rounded-full h-3 mb-2 overflow-hidden border border-[var(--color-border)]">
            <div className="bg-[var(--color-primary)] h-3 rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
          </div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] w-full text-right">{xp % xpForNextLevel} / {xpForNextLevel} XP</p>
        </motion.div>

        {/* Mini Game */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-md text-white flex flex-col justify-between md:col-span-2"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Lightning weight="fill" className="text-yellow-300" />
                Focus Clicker
              </h2>
              {isPlaying && (
                <div className="bg-white/20 px-3 py-1 rounded-lg font-mono text-xl font-bold">
                  {timeLeft}s
                </div>
              )}
            </div>
            <p className="text-white/80 text-sm mb-6 max-w-sm">
              Istirahat sejenak! Klik sebanyak-banyaknya dalam 10 detik untuk mendapatkan bonus XP. (1 XP per 2 Klik)
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            {!isPlaying && timeLeft === 10 ? (
              <button 
                onClick={startGame}
                className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg"
              >
                Mulai Main
              </button>
            ) : isPlaying ? (
              <button 
                onClick={handleClick}
                className="bg-yellow-400 text-yellow-900 w-32 h-32 rounded-full font-black text-4xl flex items-center justify-center hover:scale-95 active:scale-90 transition-all shadow-xl"
              >
                {clickCount}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-xl font-bold mb-3">Skor: {clickCount}</p>
                <button 
                  onClick={startGame}
                  className="bg-white/20 text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-white/30 transition-colors"
                >
                  Main Lagi
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-sm mt-4"
        >
          <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg)]/50">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Medal weight="fill" className="text-yellow-500" />
              Leaderboard Kampus
            </h2>
          </div>
          <div className="p-0">
            {initialUsers.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-muted)]">
                Belum ada data pengguna.
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {initialUsers.map((user, idx) => (
                  <div key={user.id} className="p-4 px-6 flex items-center gap-4 hover:bg-[var(--color-bg)] transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${idx === 0 ? "bg-yellow-100 text-yellow-600" : 
                        idx === 1 ? "bg-gray-200 text-gray-600" : 
                        idx === 2 ? "bg-orange-100 text-orange-600" : "bg-black/5 dark:bg-white/5 text-[var(--color-text-muted)]"}
                    `}>
                      {idx + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold">
                      {user.name ? user.name[0].toUpperCase() : "?"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{user.name || "Anonim"}</h4>
                      <p className="text-xs text-[var(--color-text-muted)]">Level {user.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-[var(--color-primary)]">{user.xp} XP</p>
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

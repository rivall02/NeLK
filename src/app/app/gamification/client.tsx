"use client";

import { motion } from "motion/react";
import { Trophy, GameController, Medal, Lightning, Question, CheckCircle, XCircle, Clock } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { recordFocusSessionXP, getDailyQuiz, answerDailyQuiz } from "@/lib/actions";
import { toast } from "sonner";

export default function GamificationClient({
  initialUsers,
  currentUserXp,
  currentUserLevel,
  currentUserId,
}: {
  initialUsers: any[];
  currentUserXp: number;
  currentUserLevel: number;
  currentUserId: string;
}) {
  const [xp, setXp] = useState(currentUserXp);
  const [level, setLevel] = useState(currentUserLevel);
  const [clickCount, setClickCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  // Daily Quiz State
  const [dailyQuiz, setDailyQuiz] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(true);
  const [quizAttempted, setQuizAttempted] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{ isCorrect: boolean; gainedXp: number; correctAnswer: string } | null>(null);
  const [quizTimeTaken, setQuizTimeTaken] = useState(0);
  const [quizDifficulty, setQuizDifficulty] = useState<string>("HARD");
  const [quizBaseXp, setQuizBaseXp] = useState<number>(20);

  // Load daily quiz
  useEffect(() => {
    async function loadQuiz() {
      try {
        const result = await getDailyQuiz();
        setDailyQuiz(result.quiz);
        setQuizAttempted(result.alreadyAttempted);
        setQuizDifficulty(result.difficulty || "HARD");
        setQuizBaseXp(result.baseXp || 20);
        if (result.alreadyAttempted && result.isCorrect !== null) {
          const baseXp = result.baseXp || 20;
          setQuizResult({ isCorrect: result.isCorrect, gainedXp: result.isCorrect ? baseXp : 0, correctAnswer: result.quiz.correctAnswer });
        }
      } catch (err) {
        console.error("Failed to load daily quiz", err);
      } finally {
        setQuizLoading(false);
      }
    }
    loadQuiz();
  }, []);

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

  // Quiz timer
  useEffect(() => {
    if (dailyQuiz && !quizAttempted && !quizResult) {
      const interval = setInterval(() => {
        setQuizTimeTaken((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [dailyQuiz, quizAttempted, quizResult]);

  const handleQuizAnswer = async (answer: string) => {
    if (quizAttempted || !dailyQuiz) return;
    setSelectedQuizAnswer(answer);

    try {
      const result = await answerDailyQuiz(dailyQuiz.id, answer, quizTimeTaken);
      setQuizResult(result);
      setQuizAttempted(true);
      if (result.isCorrect) {
        setXp((prev) => prev + result.gainedXp);
        const newLevel = Math.floor((xp + result.gainedXp) / 1000) + 1;
        if (newLevel > level) setLevel(newLevel);
        toast.success(`Benar! +${result.gainedXp} XP`);
      } else {
        toast.info(`Jawaban: ${result.correctAnswer}. Coba lagi besok!`);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan jawaban.");
    }
  };

  const xpForNextLevel = 1000;
  const xpProgress = Math.min(100, Math.round(((xp % xpForNextLevel) / xpForNextLevel) * 100));

  const topicLabels: Record<string, string> = {
    matematika: "Matematika",
    sejarah: "Sejarah",
    umum: "Umum",
    sains: "Sains",
    bahasa: "Bahasa",
  };

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
          Kumpulkan XP dari penyelesaian tugas, kuis harian, dan latihan fokus untuk menaikkan level akademikmu!
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

        {/* Daily Quiz Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 shadow-md text-white flex flex-col justify-between md:col-span-2"
        >
          <div>
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Question weight="fill" className="text-yellow-300" />
                Kuis Harian
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  quizDifficulty === "ADVANCED"
                    ? "bg-purple-500/30 text-purple-200 border border-purple-400/50"
                    : "bg-amber-500/30 text-amber-200 border border-amber-400/50"
                }`}>
                  {quizDifficulty === "ADVANCED" ? "ADVANCED" : "HARD"}
                </span>
              </h2>
              {!quizLoading && !quizAttempted && dailyQuiz && (
                <div className="bg-white/20 px-3 py-1 rounded-xl font-mono text-sm font-bold backdrop-blur-sm">
                  ⏱ {quizTimeTaken}s
                </div>
              )}
              {quizAttempted && (
                <div className={`px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-sm ${quizResult?.isCorrect ? "bg-green-400/30 text-green-200" : "bg-white/20 text-white/80"}`}>
                  {quizResult?.isCorrect ? "Benar!" : "Salah"}
                </div>
              )}
            </div>

            {quizLoading ? (
              <div className="py-4 text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto" />
              </div>
            ) : dailyQuiz ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-white/70 capitalize">{topicLabels[dailyQuiz.topic] || dailyQuiz.topic}</span>
                </div>
                <p className="text-base font-semibold mb-4">{dailyQuiz.question}</p>

                {dailyQuiz.options && (
                  <div className="grid grid-cols-2 gap-2">
                    {(Array.isArray(dailyQuiz.options) ? dailyQuiz.options : []).map((opt: string, idx: number) => {
                      const optionLetter = opt.charAt(0);
                      const isCorrectOption = optionLetter === dailyQuiz.correctAnswer;
                      const isSelected = selectedQuizAnswer === optionLetter;

                      return (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswer(optionLetter)}
                          disabled={quizAttempted}
                          className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            quizAttempted && isCorrectOption
                              ? "bg-green-400/30 border border-green-300/50 text-green-100"
                              : quizAttempted && isSelected && !isCorrectOption
                              ? "bg-red-400/30 border border-red-300/50 text-red-100"
                              : "bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {quizAttempted && quizResult && (
                  <div className="mt-3 text-xs text-white/70">
                    {quizResult.isCorrect
                      ? `Benar! +${quizResult.gainedXp} XP diperoleh.`
                      : `Jawaban yang benar: ${dailyQuiz.correctAnswer}. Coba lagi besok!`}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/70">Tidak ada kuis hari ini.</p>
            )}
          </div>
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
            <span className="text-xs text-[var(--color-text-muted)]">Top 10 Pengguna</span>
          </div>

          <div>
            {initialUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                Belum ada data peringkat pengguna.
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {initialUsers.slice(0, 10).map((user, idx) => (
                  <div
                    key={user.id}
                    className={`p-4 px-6 flex items-center gap-4 hover:bg-[var(--color-surface-hover)] transition-colors ${user.id === currentUserId ? "bg-[var(--color-primary-light)]/50" : ""}`}
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
                        {user.id === currentUserId && <span className="text-[var(--color-primary)] ml-1">(Anda)</span>}
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

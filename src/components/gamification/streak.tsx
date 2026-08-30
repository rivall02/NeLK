"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  todayCompleted: boolean;
  streakEmoji: string;
}

export function useStreakTracking(
  activityDates: Date[]
): StreakData {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    todayCompleted: false,
    streakEmoji: "🔥",
  });

  useEffect(() => {
    if (activityDates.length === 0) {
      setStreakData({
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        todayCompleted: false,
        streakEmoji: "🔥",
      });
      return;
    }

    // Sort dates descending
    const sortedDates = [...activityDates].sort(
      (a, b) => b.getTime() - a.getTime()
    );

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Check if user completed activity today
    const todayCompleted = sortedDates.some(
      (d) => d.getTime() === today.getTime()
    );

    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let streakCount = 0;

    // Iterate through dates to calculate streak
    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      const dateTime = currentDate.getTime();

      // Check if it's today or yesterday (to start/continue streak)
      if (dateTime === today.getTime() || dateTime === yesterday.getTime()) {
        currentStreak += 1;
        streakCount += 1;
      } else if (dateTime < yesterday.getTime()) {
        // Streak broken
        longestStreak = Math.max(longestStreak, streakCount);
        streakCount = 0;
      }

      // Update yesterday for next iteration
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
    }

    // Final longest streak check
    longestStreak = Math.max(longestStreak, streakCount);

    setStreakData({
      currentStreak: currentStreak || 0,
      longestStreak,
      lastActivityDate: sortedDates[0] || null,
      todayCompleted,
      streakEmoji:
        currentStreak >= 7
          ? "🔥🔥🔥"
          : currentStreak >= 3
          ? "🔥🔥"
          : currentStreak >= 1
          ? "🔥"
          : "💎",
    });
  }, [activityDates]);

  return streakData;
}

export function StreakBadge({ streakCount }: { streakCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
  rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-ai)] 
  px-3 py-1.5 text-xs font-semibold text-white 
  shadow-[var(--shadow-md)] ${streakCount >= 7 ? "animate-pulse" : ""}
`}
    >
      {streakCount >= 7
        ? "Streak Panjang!"
        : streakCount >= 3
        ? "Streak Baik!"
        : `${streakCount} Hari`}
    </motion.div>
  );
}

export function AchievementCard({
  title,
  description,
  earned,
  icon,
}: {
  title: string;
  description: string;
  earned: boolean;
  icon: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`
  rounded-2xl border ${earned ? `border-[var(--color-primary)]` : `border-[var(--color-border)]`}
  bg-[var(--color-surface)] p-6 shadow-[var(--shadow-md]}
  transition-colors`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <span className={`
  text-2xl ${earned ? `text-[var(--color-primary)]` : `text-[var(--color-text-muted)]`}
`}
          >{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[var(--color-text)]">{title}</h4>
          <p className="text-xs text-[var(--color-text-secondary)]">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
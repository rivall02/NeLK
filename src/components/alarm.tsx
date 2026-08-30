"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

export interface AlarmConfig {
  id: string;
  label: string;
  time: string; // HH:MM format
  enabled: boolean;
  snoozeMinutes: number;
}

export function useAlarm(
  initialAlarms: AlarmConfig[] = []
) {
  const [alarms, setAlarms] = useState<AlarmConfig[]>(initialAlarms);
  const [isActive, setIsActive] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState<{ time: string; label: string; snoozeMinutes: number } | null>(null);

  // Check if any alarm should trigger
  useEffect(() => {
    const checkAlarm = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const timeString = `${hours}:${minutes}`;

      const matchingAlarm = alarms.find((alarm) => {
        if (!alarm.enabled) return false;
        return alarm.time === timeString;
      });

      if (matchingAlarm && !isActive) {
        setIsActive(true);
        setCurrentAlarm({ time: matchingAlarm.time, label: matchingAlarm.label, snoozeMinutes: matchingAlarm.snoozeMinutes });
      }
    };

    // Check every minute
    const timer = setInterval(checkAlarm, 60 * 1000);
    checkAlarm(); // Initial check

    return () => clearInterval(timer);
  }, [alarms, isActive]);

  const triggerAlarm = () => {
    setIsActive(false);
    setCurrentAlarm(null);
  };

  const snoozeAlarm = () => {
    // Add snooze minutes to current alarm time
    if (currentAlarm) {
      const [h, m] = currentAlarm.time.split(":").map(Number);
      const date = new Date();
      date.setHours(h, m, 0, 0);
      date.setMinutes(date.getMinutes() + (currentAlarm.snoozeMinutes || 5));
      const newHours = String(date.getHours()).padStart(2, "0");
      const newMinutes = String(date.getMinutes()).padStart(2, "0");
      setAlarms((prevAlarms) =>
        prevAlarms.map((alarm) =>
          alarm.time === currentAlarm.time
            ? { ...alarm, time: `${newHours}:${newMinutes}`, enabled: true, snoozeMinutes: currentAlarm.snoozeMinutes }
            : alarm
        )
      );
    }
    setIsActive(false);
    setCurrentAlarm(null);
  };

  const dismissAlarm = () => {
    if (currentAlarm) {
      setAlarms((prevAlarms) =>
        prevAlarms.filter((alarm) => alarm.time !== currentAlarm.time)
      );
    }
    setIsActive(false);
    setCurrentAlarm(null);
  };

  return {
    alarms,
    isActive,
    currentAlarm,
    triggerAlarm,
    snoozeAlarm,
    dismissAlarm,
    setAlarms,
  };
}

export function AlarmClock({ initialAlarms }: { initialAlarms: AlarmConfig[] }) {
  const {
    alarms,
    isActive,
    currentAlarm,
    triggerAlarm,
    snoozeAlarm,
    dismissAlarm,
    setAlarms,
  } = useAlarm(initialAlarms);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Display active alarm */}
      {isActive && currentAlarm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-surface)] rounded-2xl p-8 w-full max-w-md shadow-2xl z-50 border border-[var(--color-primary)]"
        >
          <div className="text-center">
            <span className="text-6xl font-bold text-[var(--color-primary)] mb-2">
              🔔
            </span>
            <h3 className="text-2xl font-bold mb-2">Alarm!</h3>
            <p className="text-lg text-[var(--color-text-secondary)] mb-6">
              Waktu: {currentAlarm.time}
            </p>
            <div className="flex gap-3">
              <button
                onClick={snoozeAlarm}
                className="flex-1 rounded-lg bg-[var(--color-accent-lime)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-accent-lime-hover)]"
              >
                Snooze (5 menit)
              </button>
              <button
                onClick={dismissAlarm}
                className="flex-1 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alarm management UI - visible on desktop */}
      {!isActive && (
        <motion.div className="md:hidden mt-4">
          <button
            onClick={() =>
              setAlarms((prev) =>
                [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    label: "Alarm Baru",
                    time: new Date(Date.now() + 30 * 60 * 1000)
                      .toLocaleTimeString("id-ID", { hour12: false })
                      .replace(/\s/g, ""),
                    enabled: true,
                    snoozeMinutes: 5,
                  },
                ]
              )
            }
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Tambah Alarm
          </button>
        </motion.div>
      )}
    </div>
  );
}
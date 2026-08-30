"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { getNotifications, markNotificationsRead, generateTaskReminders } from "@/lib/actions";

export function NotificationBell({ isMobileInline = false }: { isMobileInline?: boolean }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    generateTaskReminders().then(() => fetchNotifications());
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch {
      // Sesi belum ada / auth loading
    }
  }

  async function handleOpen() {
    setOpen(!open);
    if (!open) {
      await markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Render inline for mobile header integration, or fixed top-right for desktop
  return (
    <div className={isMobileInline ? "relative" : "hidden md:block fixed top-4 right-8 z-40"}>
      <button
        onClick={handleOpen}
        aria-label="Lihat notifikasi"
        className="relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all text-[var(--color-text)]"
      >
        <Bell
          size={19}
          weight={unreadCount > 0 ? "fill" : "regular"}
          className={unreadCount > 0 ? "text-[var(--color-primary)]" : ""}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-[var(--color-surface)]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed top-14 right-3 md:absolute md:top-full md:right-0 mt-2 w-[calc(100vw-24px)] max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] overflow-hidden z-50"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3 bg-[var(--color-bg)]/60 backdrop-blur-sm">
              <h3 className="text-xs font-bold text-[var(--color-text)] tracking-wide">Pemberitahuan</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--color-text-muted)] flex flex-col items-center gap-2">
                  <CheckCircle size={24} weight="duotone" className="text-[var(--color-primary)]" />
                  <span>Semua tugas aman, belum ada notifikasi baru!</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-xl p-3 text-xs ${
                        notification.read
                          ? "opacity-75 bg-[var(--color-bg)]/40"
                          : "bg-[var(--color-primary-light)]/60 text-[var(--color-text)] font-medium border border-[var(--color-primary)]/20"
                      }`}
                    >
                      <p className="leading-relaxed">{notification.message}</p>
                      <span className="text-[10px] text-[var(--color-text-muted)] mt-1.5 block font-mono">
                        {new Date(notification.createdAt).toLocaleDateString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

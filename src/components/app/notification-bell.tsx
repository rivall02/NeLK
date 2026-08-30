"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { getNotifications, markNotificationsRead, generateTaskReminders } from "@/lib/actions";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Simulasi Background Cron Job yang triggernya numpang di client load
    generateTaskReminders().then(() => fetchNotifications());
    
    // In a real app, this might poll or use websockets
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    const data = await getNotifications();
    setNotifications(data);
  }

  async function handleOpen() {
    setOpen(!open);
    if (!open) {
      await markNotificationsRead();
      // Optimistically mark all as read
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed top-[calc(var(--topbar-height)+4px)] right-2 z-50 md:top-4 md:right-8">
      <button 
        onClick={handleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow text-[var(--color-text)]"
      >
        <Bell size={20} weight={unreadCount > 0 ? "fill" : "regular"} className={unreadCount > 0 ? "text-[var(--color-primary)]" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-error)] text-[9px] font-bold text-white ring-2 ring-[var(--color-surface)]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3 bg-[var(--color-bg)]">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Notifikasi</h3>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--color-text-muted)] flex flex-col items-center gap-2">
                  <CheckCircle size={24} weight="light" />
                  <span>Tidak ada notifikasi</span>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`rounded-xl p-3 text-sm ${notification.read ? 'opacity-70' : 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium'}`}
                    >
                      <p className="text-[var(--color-text)]">{notification.message}</p>
                      <span className="text-[10px] text-[var(--color-text-muted)] mt-1 block">
                        {new Date(notification.createdAt).toLocaleString()}
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

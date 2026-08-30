"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MagnifyingGlass,
  FileText,
  CalendarBlank,
  CheckSquare,
  Sparkle,
  Command,
  X,
  PlusCircle,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export function CommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }

      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const navigation = [
    { name: "Beranda Dashboard", href: "/app", icon: <Command weight="bold" /> },
    { name: "Catatan Kuliah", href: "/app/notes", icon: <FileText weight="bold" /> },
    { name: "Daftar Tugas", href: "/app/tasks", icon: <CheckSquare weight="bold" /> },
    { name: "Jadwal & Kalender", href: "/app/schedule", icon: <CalendarBlank weight="bold" /> },
    { name: "Tanya AI NeLK", href: "/app/ai", icon: <Sparkle weight="bold" /> },
  ];

  const actions = [
    { name: "Buat Catatan Baru", href: "/app/notes", icon: <PlusCircle size={18} /> },
    { name: "Tambah Tugas Baru", href: "/app/tasks", icon: <PlusCircle size={18} /> },
    { name: "Tambah Jadwal Baru", href: "/app/schedule", icon: <PlusCircle size={18} /> },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = actions.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleNavigate = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed top-[12%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden z-[101]"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)]">
                <MagnifyingGlass className="text-[var(--color-text-muted)] text-xl" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Cari menu, perintah, atau aksi cepat..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                  aria-label="Tutup"
                >
                  <X weight="bold" size={16} />
                </button>
              </div>

              <div className="max-h-[55vh] overflow-y-auto p-3 space-y-3">
                {/* Actions */}
                {filteredActions.length > 0 && (
                  <div>
                    <div className="px-3 mb-1 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Aksi Cepat
                    </div>
                    {filteredActions.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleNavigate(item.href)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors text-left text-sm text-[var(--color-text)] font-medium"
                      >
                        <span className="text-[var(--color-primary)]">{item.icon}</span>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Navigation */}
                {filteredNavigation.length > 0 && (
                  <div>
                    <div className="px-3 mb-1 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Navigasi Halaman
                    </div>
                    {filteredNavigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleNavigate(item.href)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors text-left text-sm text-[var(--color-text)] font-medium"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0 text-xs">
                          {item.icon}
                        </div>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredNavigation.length === 0 && filteredActions.length === 0 && (
                  <div className="py-12 text-center text-xs text-[var(--color-text-muted)]">
                    Tidak ditemukan hasil untuk "{query}"
                  </div>
                )}
              </div>

              <div className="px-4 py-2.5 bg-[var(--color-bg)] text-[11px] text-[var(--color-text-muted)] flex items-center justify-between border-t border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px] font-sans">
                      Esc
                    </kbd>
                    tutup
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px] font-sans">
                      ↵
                    </kbd>
                    buka
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Notebook,
  CheckSquare,
  CalendarDots,
  Brain,
  Gear,
  Folder,
  CaretLeft,
  List,
  X,
  Command,
  MagnifyingGlass,
  GraduationCap,
} from "@phosphor-icons/react";

const navItems = [
  { label: "Beranda", href: "/app", icon: House },
  { label: "Catatan", href: "/app/notes", icon: Notebook },
  { label: "Tugas", href: "/app/tasks", icon: CheckSquare },
  { label: "Jadwal", href: "/app/schedule", icon: CalendarDots },
  { label: "Files", href: "/app/files", icon: Folder },
  { label: "Belajar", href: "/app/courses", icon: GraduationCap },
  { label: "AI", href: "/app/ai", icon: Brain },
  { label: "Pengaturan", href: "/app/settings", icon: Gear },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-[var(--topbar-height)] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 backdrop-blur-xl md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          aria-label="Buka menu"
        >
          <List size={22} weight="bold" />
        </button>
        <Link href="/app" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-white font-bold text-xs overflow-hidden">
            <img src="/assets/images/secondry-logo.png" alt="NeLK Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-base font-bold text-[var(--color-text)]">NeLK</span>
        </Link>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          aria-label="Pencarian"
        >
          <MagnifyingGlass size={20} />
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[260px] border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <Link href="/app" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-white font-bold text-xs overflow-hidden">
                    <img src="/assets/images/secondry-logo.png" alt="NeLK Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-base font-bold text-[var(--color-text)]">NeLK</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      <Icon size={20} weight={active ? "fill" : "regular"} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 bottom-0 z-30 hidden flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] md:flex"
      >
        {/* Logo */}
        <div className="flex h-[var(--topbar-height)] items-center justify-between px-4">
          <Link href="/app" className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-white font-bold text-sm overflow-hidden">
              <img src="/assets/images/secondry-logo.png" alt="NeLK Logo" className="w-full h-full object-cover" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold tracking-tight text-[var(--color-text)] whitespace-nowrap"
              >
                NeLK
              </motion.span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            aria-label="Toggle sidebar"
          >
            <CaretLeft
              size={14}
              className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Command Center Trigger */}
        <div className="px-3 mb-2">
          <button className={`flex w-full items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] ${collapsed ? "justify-center" : ""}`}>
            {collapsed ? (
              <Command size={16} />
            ) : (
              <>
                <MagnifyingGlass size={16} />
                <span className="flex-1 text-left">Cari atau perintah...</span>
                <kbd className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-[var(--duration-micro)] ${
                  collapsed ? "justify-center" : ""
                } ${
                  active
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                }`}
              >
                <Icon size={20} weight={active ? "fill" : "regular"} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}

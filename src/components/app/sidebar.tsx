"use client";

import { useState, useEffect } from "react";
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
  UsersThree,
  Sneaker,
  Trophy,
} from "@phosphor-icons/react";
import { NotificationBell } from "@/components/app/notification-bell";

const allNavItems = [
  { label: "Beranda", href: "/app", icon: House },
  { label: "Catatan", href: "/app/notes", icon: Notebook },
  { label: "Tugas", href: "/app/tasks", icon: CheckSquare },
  { label: "Jadwal", href: "/app/schedule", icon: CalendarDots },
  { label: "Belajar", href: "/app/files", icon: Folder },
  { label: "Komunitas", href: "/app/community", icon: UsersThree },
  { label: "Kesehatan", href: "/app/fitness", icon: Sneaker },
  { label: "AI", href: "/app/ai", icon: Brain },
  { label: "Gamifikasi", href: "/app/gamification", icon: Trophy },
  { label: "Pengaturan", href: "/app/settings", icon: Gear },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Mobile Top Header - Clean, Integrated Bell, No Overlap */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-[var(--topbar-height)] items-center justify-between bg-[var(--color-surface)]/90 px-4 backdrop-blur-md md:hidden border-b border-[var(--color-border)] shadow-[var(--shadow-sm)]">
        <Link href="/app" className="flex items-center gap-2.5">
          <img
            src="/assets/images/secondry-logo.png"
            alt="NeLK Logo"
            className="h-8 w-auto drop-shadow-sm transition-transform hover:scale-105"
          />
          <span className="text-base font-bold tracking-tight text-[var(--color-text)]">NeLK</span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell isMobileInline={true} />
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar with Floating Box */}
      <div className="fixed bottom-4 left-4 right-4 z-40 pb-[env(safe-area-inset-bottom)] md:hidden pointer-events-none">
        <div className="relative mx-auto w-full max-w-md pointer-events-auto">
          {/* Background panel (Floating Box) */}
          <div className="absolute bottom-0 left-0 right-0 h-[68px] bg-[var(--color-surface)] rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[var(--color-border)] flex items-center justify-around px-2" />

          <div className="relative flex h-[96px] items-end justify-around pb-[14px]">
            {allNavItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative z-10 flex h-14 w-14 flex-col items-center justify-center gap-1 outline-none"
                >
                  <Icon
                    size={24}
                    weight={isActive ? "fill" : "regular"}
                    className={`transition-all duration-300 ${
                      isActive
                        ? "text-[var(--color-primary)] -translate-y-1 scale-110"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-semibold tracking-wide transition-all duration-300 ${
                      isActive
                        ? "text-[var(--color-primary)] opacity-100"
                        : "text-[var(--color-text-muted)] opacity-0 -translate-y-2"
                    }`}
                  >
                    {isActive ? item.label : ""}
                  </span>
                </Link>
              );
            })}

            {/* "Menu" Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="relative z-10 flex h-14 w-14 flex-col items-center justify-center gap-1 outline-none"
            >
              <List
                size={24}
                weight="regular"
                className={`transition-all duration-300 ${
                  mobileMenuOpen
                    ? "text-[var(--color-primary)] -translate-y-1 scale-110"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              />
              <span
                className={`text-[10px] font-semibold tracking-wide transition-all duration-300 ${
                  mobileMenuOpen
                    ? "text-[var(--color-primary)] opacity-100"
                    : "text-[var(--color-text-muted)] opacity-0 -translate-y-2"
                }`}
              >
                Menu
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile "More Menu" Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col rounded-t-[32px] bg-[var(--color-surface)] p-6 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-2xl md:hidden max-h-[85vh] border-t border-[var(--color-border)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--color-text)]">Semua Menu NeLK</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3.5 overflow-y-auto scrollbar-hide">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div
                        className={`flex h-13 w-13 items-center justify-center rounded-2xl transition-colors ${
                          isActive
                            ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/40"
                            : "bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]"
                        }`}
                      >
                        <Icon size={22} weight={isActive ? "fill" : "duotone"} />
                      </div>
                      <span
                        className={`text-[10px] font-semibold text-center leading-tight ${
                          isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: [0.2, 1, 0.2, 1] }}
        className="fixed left-0 top-0 bottom-0 z-30 hidden flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] md:flex"
      >
        <div className="flex h-[var(--topbar-height)] items-center justify-between px-4">
          <Link href="/app" className="flex items-center gap-2.5 overflow-hidden">
            <img
              src="/assets/images/secondry-logo.png"
              alt="NeLK Logo"
              className="h-8 w-auto shrink-0 drop-shadow-sm transition-transform hover:scale-105"
            />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-lg font-bold tracking-tight text-[var(--color-text)] whitespace-nowrap overflow-hidden"
                >
                  NeLK
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-colors"
          >
            <CaretLeft
              size={14}
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <div className="px-3 mb-3">
          <button
            className={`group flex w-full items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-text-muted)] transition-all hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]/30 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? (
              <Command size={16} className="group-hover:text-[var(--color-primary)] transition-colors" />
            ) : (
              <>
                <MagnifyingGlass size={16} className="group-hover:text-[var(--color-primary)] transition-colors" />
                <span className="flex-1 text-left group-hover:text-[var(--color-text)] transition-colors">
                  Cari cepat...
                </span>
                <kbd className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)] shadow-sm">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 overflow-y-auto overflow-x-hidden pb-6 scrollbar-hide">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                  collapsed ? "justify-center" : ""
                } ${
                  active
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="desktop-active-nav"
                    className="absolute inset-0 rounded-xl bg-[var(--color-primary-light)] border border-[var(--color-primary)]/15"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon
                  size={19}
                  weight={active ? "fill" : "duotone"}
                  className="relative z-10 shrink-0 group-hover:scale-110 transition-transform duration-200"
                />

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="relative z-10 whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}

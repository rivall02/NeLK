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
  GraduationCap,
  UsersThree,
  Sneaker,
  Trophy
} from "@phosphor-icons/react";

const allNavItems = [
  { label: "Beranda", href: "/app", icon: House },
  { label: "Catatan", href: "/app/notes", icon: Notebook },
  { label: "Tugas", href: "/app/tasks", icon: CheckSquare },
  { label: "Jadwal", href: "/app/schedule", icon: CalendarDots },
  { label: "Files", href: "/app/files", icon: Folder },
  { label: "Belajar", href: "/app/courses", icon: GraduationCap },
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

  const activeIndex = allNavItems.findIndex(i => i.href === pathname);
  const selectedIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <>
      {/* Mobile Top Header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex h-[var(--topbar-height)] items-center justify-between bg-[var(--color-bg)]/80 px-4 backdrop-blur-md md:hidden border-b border-[var(--color-border)]/50">
        <Link href="/app" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold overflow-hidden">
            <img src="/assets/images/secondry-logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-base font-bold text-[var(--color-text)]">NeLK</span>
        </Link>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]">
          <MagnifyingGlass size={20} />
        </button>
      </div>


      {/* Mobile Bottom Navigation Bar with Floating Box */}
      <div className="fixed bottom-4 left-4 right-4 z-50 pb-[env(safe-area-inset-bottom)] md:hidden pointer-events-none">
        <div className="relative mx-auto w-full max-w-md pointer-events-auto">
          {/* Background panel (Floating Box) */}
          <div className="absolute bottom-0 left-0 right-0 h-[72px] bg-[var(--color-surface)] rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[var(--color-border)]/50" />
          
          <div className="relative flex h-[106px] items-end overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            
            {/* Animated Indicator Track */}
            <div className="absolute top-0 left-0 flex h-full" style={{ width: `${allNavItems.length * 72}px` }}>
              {mounted && (
                <motion.div
                  className="absolute top-0 flex h-full w-[72px] items-start justify-center pointer-events-none"
                  initial={false}
                  animate={{ x: selectedIndex * 72 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                >
                  {/* Floating Bubble (Separated visually by matching page background) */}
                  <div className="relative -top-1 flex shrink-0 h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/40 border-[8px] border-[var(--color-bg)]" />
                </motion.div>
              )}
            </div>

            {allNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = selectedIndex === index;
              
              return (
                <button
                  key={item.label}
                  className="relative z-10 flex h-[72px] shrink-0 w-[72px] flex-col items-center justify-center gap-1 snap-center"
                >
                  <Link href={item.href} className="flex flex-col items-center justify-center h-full w-full outline-none">
                     <Icon 
                        size={24} 
                        weight={isActive ? "fill" : "regular"} 
                        className={`transition-all duration-300 ${isActive ? "text-white -translate-y-[28px]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`} 
                     />
                     <span className={`absolute bottom-2 text-[10px] font-semibold tracking-wide transition-all duration-300 ${isActive ? "text-[var(--color-primary)] opacity-100 translate-y-0" : "text-[var(--color-text-muted)] opacity-0 translate-y-4"}`}>
                       {item.label}
                     </span>
                  </Link>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.2, 1, 0.2, 1] }}
        className="fixed left-0 top-0 bottom-0 z-30 hidden flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] md:flex"
      >
        <div className="flex h-[var(--topbar-height)] items-center justify-between px-4">
          <Link href="/app" className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold text-sm overflow-hidden">
              <img src="/assets/images/secondry-logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
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
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-colors"
          >
            <CaretLeft
              size={14}
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <div className="px-3 mb-4">
          <button className={`group flex w-full items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text-muted)] transition-all hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]/30 ${collapsed ? "justify-center" : ""}`}>
            {collapsed ? (
              <Command size={16} className="group-hover:text-[var(--color-primary)] transition-colors" />
            ) : (
              <>
                <MagnifyingGlass size={16} className="group-hover:text-[var(--color-primary)] transition-colors" />
                <span className="flex-1 text-left group-hover:text-[var(--color-text)] transition-colors">Cari perintah...</span>
                <kbd className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)] shadow-sm">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 overflow-y-auto overflow-x-hidden pb-6">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  collapsed ? "justify-center" : ""
                } ${
                  active
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="desktop-active-nav"
                    className="absolute inset-0 rounded-xl bg-[var(--color-primary-light)] border border-[var(--color-primary)]/10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <Icon size={20} weight={active ? "fill" : "duotone"} className="relative z-10 shrink-0 group-hover:scale-110 transition-transform duration-200" />
                
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

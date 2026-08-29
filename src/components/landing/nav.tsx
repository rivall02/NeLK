"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import Link from "next/link";

const navLinks = [
  { label: "Fitur", href: "#features" },
  { label: "AI", href: "#ai" },
  { label: "Tentang", href: "#about" },
];

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-6 pt-4">
        <nav className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-6 py-3 shadow-[var(--shadow-md)] backdrop-blur-xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm">
              N
            </div>
            <span className="text-lg font-bold tracking-tight text-[var(--color-text)]">
              NeLK
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[var(--color-text-secondary)] transition-colors duration-[var(--duration-micro)] hover:text-[var(--color-text)]"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-all duration-[var(--duration-micro)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-all duration-[var(--duration-micro)] hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-md)] active:scale-[0.98]"
            >
              Mulai Gratis
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)] md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-6 mt-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-lg)] md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                >
                  {link.label}
                </a>
              ))}
              <hr className="my-2 border-[var(--color-border)]" />
              <Link
                href="/login"
                className="rounded-xl px-4 py-3 text-center text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Mulai Gratis
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

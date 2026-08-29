"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MagnifyingGlass, FileText, CalendarBlank, CheckSquare, Sparkle, Command, X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export function CommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle Ctrl+K / Cmd+K
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
    { name: "Dashboard", href: "/app", icon: <Command weight="bold" /> },
    { name: "Notes", href: "/app/notes", icon: <FileText weight="bold" /> },
    { name: "Tasks", href: "/app/tasks", icon: <CheckSquare weight="bold" /> },
    { name: "Schedule", href: "/app/schedule", icon: <CalendarBlank weight="bold" /> },
    { name: "Ask AI", href: "/app/ai", icon: <Sparkle weight="bold" /> },
  ];

  const actions = [
    { name: "Create new note", icon: <FileText /> },
    { name: "Add new task", icon: <CheckSquare /> },
    { name: "Schedule event", icon: <CalendarBlank /> },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  );
  
  const filteredActions = actions.filter(item => 
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
              className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-nelk-surface-light dark:bg-nelk-surface-dark rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden z-[101]"
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-black/5 dark:border-white/5">
                <MagnifyingGlass className="text-nelk-text-light/50 dark:text-nelk-text-dark/50 text-xl" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search commands, notes, tasks..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-nelk-text-light/40 dark:placeholder:text-nelk-text-dark/40"
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-nelk-text-light/50 dark:text-nelk-text-dark/50 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <X weight="bold" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredNavigation.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 mb-2 text-xs font-semibold text-nelk-text-light/50 dark:text-nelk-text-dark/50 uppercase tracking-wider">
                      Navigation
                    </div>
                    {filteredNavigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleNavigate(item.href)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-nelk-primary/10 text-nelk-primary flex items-center justify-center shrink-0">
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredActions.length > 0 && (
                  <div>
                    <div className="px-3 mb-2 text-xs font-semibold text-nelk-text-light/50 dark:text-nelk-text-dark/50 uppercase tracking-wider">
                      Quick Actions
                    </div>
                    {filteredActions.map((item) => (
                      <button
                        key={item.name}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="text-nelk-text-light/50 dark:text-nelk-text-dark/50 shrink-0">
                          {item.icon}
                        </div>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredNavigation.length === 0 && filteredActions.length === 0 && (
                  <div className="py-12 text-center text-nelk-text-light/50 dark:text-nelk-text-dark/50">
                    <p>No results found for "{query}"</p>
                  </div>
                )}
              </div>
              
              <div className="px-4 py-3 bg-black/5 dark:bg-white/5 text-xs text-nelk-text-light/50 dark:text-nelk-text-dark/50 flex items-center justify-between border-t border-black/5 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-sans border border-black/10 dark:border-white/10">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-sans border border-black/10 dark:border-white/10">↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-sans border border-black/10 dark:border-white/10">↵</kbd>
                    to select
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

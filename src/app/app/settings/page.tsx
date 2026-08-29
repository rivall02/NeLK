"use client";

import { motion } from "motion/react";
import { User, Bell, Palette, Globe, ShieldCheck, SignOut } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { logout } from "@/lib/actions";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sections = [
    {
      title: "Profile",
      icon: <User />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-nelk-primary/10 text-nelk-primary flex items-center justify-center font-bold text-xl">
              JD
            </div>
            <div>
              <h3 className="font-semibold text-lg">John Doe</h3>
              <p className="text-sm text-nelk-text-light/60 dark:text-nelk-text-dark/60">student@university.edu</p>
            </div>
            <button className="ml-auto px-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
              Edit
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Appearance",
      icon: <Palette />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Theme</h3>
              <p className="text-sm text-nelk-text-light/60 dark:text-nelk-text-dark/60">Select your preferred color theme</p>
            </div>
            {mounted && (
              <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                {["light", "dark", "system"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                      theme === t
                        ? "bg-white dark:bg-black shadow-sm text-nelk-text-light dark:text-nelk-text-dark"
                        : "text-nelk-text-light/60 dark:text-nelk-text-dark/60 hover:text-nelk-text-light dark:hover:text-nelk-text-dark"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Language",
      icon: <Globe />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Display Language</h3>
              <p className="text-sm text-nelk-text-light/60 dark:text-nelk-text-dark/60">Choose your preferred language</p>
            </div>
            <select className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-nelk-primary">
              <option value="en">English (US)</option>
              <option value="id">Bahasa Indonesia</option>
            </select>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
      <header className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-nelk-text-light dark:text-nelk-text-dark tracking-tight"
        >
          Settings
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-nelk-text-light/60 dark:text-nelk-text-dark/60 mt-1"
        >
          Manage your account preferences and settings.
        </motion.p>
      </header>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="bg-nelk-surface-light dark:bg-nelk-surface-dark rounded-3xl p-6 md:p-8 border border-black/5 dark:border-white/10 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-xl text-nelk-text-light/70 dark:text-nelk-text-dark/70">
                {section.icon}
              </div>
              <h2 className="text-xl font-bold">{section.title}</h2>
            </div>
            {section.content}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <form action={logout}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium transition-colors">
              <SignOut weight="bold" className="text-xl" />
              Sign Out
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

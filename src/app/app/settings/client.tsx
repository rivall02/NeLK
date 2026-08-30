"use client";

import { motion } from "motion/react";
import { User, Bell, Palette, Globe, ShieldCheck, SignOut, Student } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { logout, updateUserProfile } from "@/lib/actions";
import { toast } from "sonner";

export default function SettingsClient({ initialProfile }: { initialProfile: any }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [university, setUniversity] = useState(initialProfile?.university || "");
  const [major, setMajor] = useState(initialProfile?.major || "");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({ university, major });
      setIsEditing(false);
      toast.success("Profile saved successfully");
    } catch (e) {
      toast.error("Failed to save profile");
    }
  };

  const sections = [
    {
      title: "Profile & Akademik",
      icon: <User />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-nelk-primary/10 text-nelk-primary flex items-center justify-center font-bold text-xl">
              {initialProfile?.name ? initialProfile.name.substring(0, 2).toUpperCase() : "JD"}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{initialProfile?.name || "Rhys"}</h3>
              <p className="text-sm text-nelk-text-light/60 dark:text-nelk-text-dark/60">{initialProfile?.email || "student@university.edu"}</p>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="ml-auto px-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              {isEditing ? "Batal" : "Edit"}
            </button>
          </div>

          {isEditing ? (
            <div className="mt-4 p-4 rounded-xl border border-[var(--color-border)] space-y-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">Universitas / Sekolah</label>
                <input 
                  type="text" 
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 outline-none"
                  placeholder="Misal: Universitas Indonesia"
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Jurusan</label>
                <input 
                  type="text" 
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 outline-none"
                  placeholder="Misal: Ilmu Komputer"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Student className="text-[var(--color-text-muted)]" />
                <span className="text-sm font-medium text-[var(--color-text)]">Universitas: <span className="font-normal">{university || "Belum diatur"}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="text-[var(--color-text-muted)]" />
                <span className="text-sm font-medium text-[var(--color-text)]">Jurusan: <span className="font-normal">{major || "Belum diatur"}</span></span>
              </div>
            </div>
          )}
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
          Pengaturan
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-nelk-text-light/60 dark:text-nelk-text-dark/60 mt-1"
        >
          Kelola profil dan preferensi akun Anda.
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

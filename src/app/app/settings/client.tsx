"use client";

import { motion } from "motion/react";
import {
  User,
  Bell,
  Palette,
  Globe,
  ShieldCheck,
  SignOut,
  Student,
  Clock,
  House,
  ArrowClockwise,
  Sneaker,
  Info,
  Lightning,
  Translate,
  Plugs,
  PlugsConnected,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { logout, updateUserProfile, updateUserSettings } from "@/lib/actions";
import { toast } from "sonner";

interface SettingsProfile {
  id: string;
  name: string | null;
  email: string | null;
  university: string | null;
  major: string | null;
  language: string;
  timeFormat: string;
  timezone: string;
  privacyProfile: string;
  notificationSettings: any;
  profileImageUrl: string | null;
  role: string;
  subscriptionPlan: string;
}

interface Integrations {
  googleClassroom: boolean;
  googleDrive: boolean;
  strava: boolean;
}

export default function SettingsClient({
  initialProfile,
  integrations,
}: {
  initialProfile: SettingsProfile;
  integrations: Integrations;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [university, setUniversity] = useState(initialProfile?.university || "");
  const [major, setMajor] = useState(initialProfile?.major || "");
  const [displayName, setDisplayName] = useState(initialProfile?.name || "");

  // Settings state
  const [language, setLanguage] = useState(initialProfile?.language || "id");
  const [timeFormat, setTimeFormat] = useState(initialProfile?.timeFormat || "24h");
  const [timezone, setTimezone] = useState(initialProfile?.timezone || "Asia/Jakarta");
  const [privacyProfile, setPrivacyProfile] = useState(initialProfile?.privacyProfile || "private");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailDigest, setEmailDigest] = useState("daily");

  useEffect(() => {
    setMounted(true);
    if (initialProfile?.notificationSettings) {
      const settings = initialProfile.notificationSettings as any;
      setNotificationsEnabled(settings.push !== false);
      setEmailDigest(settings.emailDigest || "daily");
    }
  }, [initialProfile]);

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({ university, major });
      if (displayName !== initialProfile.name) {
        await updateUserSettings({ name: displayName });
      }
      setIsEditingProfile(false);
      toast.success("Profil berhasil disimpan!");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan profil.");
    }
  };

  const handleSaveSettings = async (section: string) => {
    try {
      await updateUserSettings({
        language,
        timeFormat,
        timezone,
        privacyProfile,
        notificationSettings: {
          push: notificationsEnabled,
          emailDigest,
        },
      });
      toast.success(`Pengaturan ${section} berhasil disimpan!`);
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan pengaturan.");
    }
  };

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 min-h-screen">
      <header className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-[var(--color-text)] tracking-tight"
        >
          Pengaturan
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[var(--color-text-muted)] mt-1"
        >
          Kelola profil, integrasi, dan preferensi akun Anda.
        </motion.p>
      </header>

      <div className="space-y-6">
        {/* Section 1: Profile & Akademik */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--color-surface)] rounded-3xl p-6 md:p-8 border border-[var(--color-border)] shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
              <User size={20} weight="duotone" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Profile & Akademik</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold text-xl">
                {displayName ? displayName.substring(0, 2).toUpperCase() : "NL"}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--color-text)]">{displayName || "Pengguna"}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{initialProfile?.email}</p>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="ml-auto px-4 py-2 bg-[var(--color-bg)] rounded-xl text-sm font-medium hover:bg-[var(--color-surface-hover)] transition-colors border border-[var(--color-border)]"
              >
                {isEditingProfile ? "Batal" : "Edit"}
              </button>
            </div>

            {isEditingProfile ? (
              <div className="mt-4 p-4 rounded-xl border border-[var(--color-border)] space-y-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block text-[var(--color-text-muted)]">Nama Tampilan</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                    placeholder="Nama Anda"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block text-[var(--color-text-muted)]">Universitas / Sekolah</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                    placeholder="Misal: Universitas Indonesia"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block text-[var(--color-text-muted)]">Jurusan</label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                    placeholder="Misal: Ilmu Komputer"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    Simpan Profil
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Student size={16} className="text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">
                    Universitas: <span className="font-medium">{university || "Belum diatur"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">
                    Jurusan: <span className="font-medium">{major || "Belum diatur"}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Section 2: Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[var(--color-surface)] rounded-3xl p-6 md:p-8 border border-[var(--color-border)] shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-lime)]/10 flex items-center justify-center text-[var(--color-accent-lime)]">
              <Plugs size={20} weight="duotone" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Integrasi</h2>
          </div>

          <div className="space-y-3">
            {[
              { name: "Google Classroom", key: "googleClassroom" as const, icon: <Student size={18} />, desc: "Sinkronkan tugas dari Google Classroom" },
              { name: "Google Drive", key: "googleDrive" as const, icon: <House size={18} />, desc: "Simpan file langsung ke Google Drive Anda" },
              { name: "Strava", key: "strava" as const, icon: <Sneaker size={18} />, desc: "Sinkronkan aktivitas olahraga dan kesehatan" },
            ].map((integration) => (
              <div
                key={integration.key}
                className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text)] border border-[var(--color-border)]">
                    {integration.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{integration.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{integration.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {integrations[integration.key] ? (
                    <>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Terhubung
                      </span>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-error)] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border border-red-200 dark:border-red-800">
                        Putuskan
                      </button>
                    </>
                  ) : (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors">
                      <Plugs size={12} />
                      Hubungkan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 3: Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--color-surface)] rounded-3xl p-6 md:p-8 border border-[var(--color-border)] shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-ai-light)] flex items-center justify-center text-[var(--color-ai)]">
              <Palette size={20} weight="duotone" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Tampilan</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm text-[var(--color-text)]">Tema</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Pilih tema warna yang Anda sukai</p>
              </div>
              {mounted && (
                <div className="flex bg-[var(--color-bg)] p-1 rounded-xl border border-[var(--color-border)]">
                  {["light", "dark", "system"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                        theme === t
                          ? "bg-[var(--color-surface)] shadow-sm text-[var(--color-text)] border border-[var(--color-border)]"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      {t === "light" ? "Terang" : t === "dark" ? "Gelap" : "Sistem"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Section 4: Language & Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-[var(--color-surface)] rounded-3xl p-6 md:p-8 border border-[var(--color-border)] shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
              <Translate size={20} weight="duotone" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Bahasa & Waktu</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-sm text-[var(--color-text)]">Bahasa</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Pilih bahasa tampilan aplikasi</p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
              >
                <option value="id">🇮🇩 Indonesia</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-sm text-[var(--color-text)]">Format Jam</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Pilih format penampilan waktu</p>
              </div>
              <select
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
              >
                <option value="24h">24 Jam (14:30)</option>
                <option value="12h">12 Jam (2:30 PM)</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-sm text-[var(--color-text)]">Zona Waktu</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Zona waktu perangkat Anda</p>
              </div>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
              >
                <option value="Asia/Jakarta">WIB (Jakarta)</option>
                <option value="Asia/Makassar">WITA (Makassar)</option>
                <option value="Asia/Jayapura">WIT (Jayapura)</option>
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleSaveSettings("Bahasa & Waktu")}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </motion.div>

        {/* Section 5: Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--color-surface)] rounded-3xl p-6 md:p-8 border border-[var(--color-border)] shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <Bell size={20} weight="duotone" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Notifikasi</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm text-[var(--color-text)]">Push Notification</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Aktifkan notifikasi push untuk pengingat tugas</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  notificationsEnabled ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    notificationsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-sm text-[var(--color-text)]">Email Digest</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Ringkasan aktivitas via email</p>
              </div>
              <select
                value={emailDigest}
                onChange={(e) => setEmailDigest(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
              >
                <option value="off">Mati</option>
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleSaveSettings("Notifikasi")}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </motion.div>

        {/* Section 6: Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[var(--color-surface)] rounded-3xl p-6 md:p-8 border border-[var(--color-border)] shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600">
              <ShieldCheck size={20} weight="duotone" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Privasi</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-sm text-[var(--color-text)]">Visibilitas Profil</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Siapa yang bisa melihat profil Anda</p>
              </div>
              <select
                value={privacyProfile}
                onChange={(e) => setPrivacyProfile(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
              >
                <option value="private">Privat</option>
                <option value="public">Publik</option>
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleSaveSettings("Privasi")}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </motion.div>

        {/* Section 7: Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--color-surface)] rounded-3xl p-6 md:p-8 border border-[var(--color-border)] shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text)]">
              <User size={20} weight="duotone" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Akun</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text)]">
                <span className="font-medium">Paket:</span>{" "}
                <span className={initialProfile.subscriptionPlan === "PRO" ? "text-[var(--color-primary)] font-semibold" : ""}>
                  {initialProfile.subscriptionPlan === "PRO" ? "Akademik Pro" : "Paket Dasar (Free)"}
                </span>
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium text-sm transition-colors"
                >
                  <SignOut weight="bold" />
                  Keluar dari Semua Perangkat
                </button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Section 8: About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-[var(--color-surface)] rounded-3xl p-6 md:p-8 border border-[var(--color-border)] shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
              <Info size={20} weight="duotone" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Tentang NeLK</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg)]">
              <span className="text-sm text-[var(--color-text-muted)]">Versi Aplikasi</span>
              <span className="text-sm font-semibold text-[var(--color-text)]">NeLK v0.1.0</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg)]">
              <span className="text-sm text-[var(--color-text-muted)]">Built with</span>
              <span className="text-sm font-medium text-[var(--color-text)]">Next.js 16 + Prisma + Gemini AI</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg)]">
              <span className="text-sm text-[var(--color-text-muted)]">Ketentuan & Privasi</span>
              <a href="#" className="text-sm font-medium text-[var(--color-primary)] hover:underline">Lihat Dokumen</a>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg)]">
              <span className="text-sm text-[var(--color-text-muted)]">Feedback</span>
              <a href="#" className="text-sm font-medium text-[var(--color-primary)] hover:underline">Kirim Masukan</a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

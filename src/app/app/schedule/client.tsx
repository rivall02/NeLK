"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  CalendarBlank,
  Clock,
  Plus,
  CaretLeft,
  CaretRight,
  MapPin,
  Trash,
  Sparkle,
  CheckCircle,
  X,
} from "@phosphor-icons/react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  createEvent,
  deleteEvent as deleteEventAction,
  autoScheduleStudy,
} from "@/lib/actions";

interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  time: string;
  type: "class" | "study" | "meeting" | "exam";
  date: string; // YYYY-MM-DD
  location?: string;
}

interface DeadlineTask {
  id: string;
  title: string;
  dueDate?: string;
  priority?: string;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAYS_HEADER = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function ScheduleClient({
  initialEvents,
  initialDeadlines,
}: {
  initialEvents: ScheduleEvent[];
  initialDeadlines: DeadlineTask[];
}) {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("10:30");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate days in current selected month
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  }, [currentYear, currentMonth]);

  // Selected date formatted as YYYY-MM-DD
  const selectedDateStr = useMemo(() => {
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(selectedDate).padStart(2, "0");
    return `${currentYear}-${m}-${d}`;
  }, [currentYear, currentMonth, selectedDate]);

  // Filter events for selected date
  const todayEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDateStr);
  }, [events, selectedDateStr]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Judul kegiatan wajib diisi.");
      return;
    }

    if (newStartTime >= newEndTime) {
      toast.error("Waktu selesai harus lebih lambat dari waktu mulai.");
      return;
    }

    // Check for overlapping events on the selected date
    const hasConflict = todayEvents.some((ev) => {
      if (!ev.startTime || !ev.endTime) return false;
      return ev.startTime < newEndTime && newStartTime < ev.endTime;
    });

    if (hasConflict) {
      toast.warning("Peringatan: Waktu kegiatan ini bertabrakan dengan jadwal yang sudah ada.");
    }

    setIsSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const newEv: ScheduleEvent = {
      id: tempId,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      startTime: newStartTime,
      endTime: newEndTime,
      time: `${newStartTime} - ${newEndTime}`,
      type: "class",
      date: selectedDateStr,
    };

    setEvents([...events, newEv]);
    setShowAddModal(false);
    setNewTitle("");
    setNewDescription("");

    try {
      const saved = await createEvent({
        title: newEv.title,
        date: new Date(selectedDateStr),
        startTime: newEv.startTime,
        endTime: newEv.endTime,
        description: newEv.description,
      });

      setEvents((current) =>
        current.map((ev) => (ev.id === tempId ? { ...ev, id: saved.id } : ev))
      );
      toast.success("Kegiatan berhasil ditambahkan ke jadwal!");
    } catch (err: any) {
      setEvents((current) => current.filter((ev) => ev.id !== tempId));
      toast.error(err.message || "Gagal membuat jadwal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleDeleteEvent(id: string) {
    const previous = [...events];
    setEvents(events.filter((e) => e.id !== id));

    try {
      await deleteEventAction(id);
      toast.success("Jadwal kegiatan berhasil dihapus.");
    } catch (err: any) {
      setEvents(previous);
      toast.error(err.message || "Gagal menghapus kegiatan.");
    }
  }

  async function handleAutoSchedule() {
    setIsAutoScheduling(true);
    try {
      const result = await autoScheduleStudy(selectedDateStr);
      if (result.success && result.event) {
        const d = new Date(result.event.date);
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const newEv: ScheduleEvent = {
          id: result.event.id,
          title: result.event.title,
          description: result.event.description || undefined,
          startTime: result.event.startTime || "",
          endTime: result.event.endTime || "",
          time: `${result.event.startTime} - ${result.event.endTime}`,
          type: "study",
          date: dStr,
        };
        setEvents((curr) => [...curr, newEv]);
        toast.success(result.message);
      } else {
        toast.info(result.message || "Sesi belajar sudah tersedia.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat jadwal belajar otomatis.");
    } finally {
      setIsAutoScheduling(false);
    }
  }

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 pt-6 min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3"
          >
            <CalendarBlank weight="fill" className="text-[var(--color-primary)]" />
            Jadwal & Kalender
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--color-text-muted)] mt-1 text-sm"
          >
            Atur perkuliahan, praktikum, bimbingan, dan sesi belajar mandirimu.
          </motion.p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAutoSchedule}
            disabled={isAutoScheduling}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 rounded-xl text-sm font-semibold transition-colors active:scale-95 shadow-sm disabled:opacity-50"
          >
            <Sparkle weight="fill" className={isAutoScheduling ? "animate-spin" : ""} />
            <span>{isAutoScheduling ? "Menganalisis..." : "Auto Schedule AI"}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] rounded-xl text-sm font-semibold transition-colors active:scale-95 shadow-sm"
          >
            <Plus weight="bold" />
            <span>Tambah Jadwal</span>
          </motion.button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Calendar Mini */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-80 shrink-0"
        >
          <div className="bg-[var(--color-surface)] rounded-3xl p-5 md:p-6 border border-[var(--color-border)] shadow-sm">
            {/* Month & Nav */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-base text-[var(--color-text)]">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors text-[var(--color-text-muted)]"
                  aria-label="Bulan sebelumnya"
                >
                  <CaretLeft size={16} weight="bold" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors text-[var(--color-text-muted)]"
                  aria-label="Bulan berikutnya"
                >
                  <CaretRight size={16} weight="bold" />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_HEADER.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-[var(--color-text-muted)] py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading slots */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Day numbers */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = selectedDate === dayNum;
                const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const hasEvents = events.some((e) => e.date === dateKey);

                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDate(dayNum)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-medium transition-all relative ${
                      isSelected
                        ? "bg-[var(--color-primary)] text-white font-bold shadow-md shadow-[var(--color-primary)]/20"
                        : "hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]"
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasEvents && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-[var(--color-primary)] absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Real Deadlines from DB */}
            <div className="mt-8 pt-5 border-t border-[var(--color-border)]">
              <h3 className="font-bold text-xs text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">
                Tenggat Tugas Terdekat
              </h3>
              <div className="space-y-2.5">
                {initialDeadlines.length > 0 ? (
                  initialDeadlines.map((task) => (
                    <div key={task.id} className="flex items-start gap-2.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--color-text)] truncate">
                          {task.title}
                        </p>
                        <p className="text-[var(--color-text-muted)] mt-0.5">
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Tenggat fleksibel"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Tidak ada tenggat tugas mendesak.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Right Side: Timeline View for Selected Day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1"
        >
          <div className="bg-[var(--color-surface)] rounded-3xl p-5 md:p-8 border border-[var(--color-border)] shadow-sm min-h-[500px] flex flex-col justify-between">
            <div>
              {/* Day Title */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex flex-col items-center justify-center font-bold">
                  <span className="text-[10px] uppercase tracking-wider">
                    {MONTH_NAMES[currentMonth].slice(0, 3)}
                  </span>
                  <span className="text-xl leading-none mt-0.5">{selectedDate}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">
                    Jadwal Hari Ini ({selectedDate} {MONTH_NAMES[currentMonth]} {currentYear})
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {todayEvents.length} kegiatan tercatat
                  </p>
                </div>
              </div>

              {/* Timeline Items */}
              <div className="relative">
                {todayEvents.length > 0 ? (
                  <div className="space-y-4">
                    {todayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] group hover:border-[var(--color-primary)]/40 transition-colors"
                      >
                        <div className="w-20 shrink-0 text-xs font-bold text-[var(--color-primary)] pt-0.5">
                          {ev.startTime || "Sepanjang hari"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-sm text-[var(--color-text)]">
                              {ev.title}
                            </h3>
                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="text-[var(--color-text-muted)] hover:text-red-500 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Hapus kegiatan"
                            >
                              <Trash size={16} />
                            </button>
                          </div>

                          {ev.description && (
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                              {ev.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-xs text-[var(--color-text-muted)]">
                            <span className="inline-flex items-center gap-1">
                              <Clock size={12} />
                              {ev.time}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={12} />
                              {ev.location || "Kampus / Online"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <CalendarBlank size={48} className="text-[var(--color-text-muted)] mb-3 opacity-40" />
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      Belum ada jadwal untuk tanggal ini.
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm">
                      Klik tombol "Tambah Jadwal" atau "Auto Schedule AI" untuk mengatur rencana belajarmu.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="text-lg font-bold text-[var(--color-text)]">Tambah Jadwal Baru</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddEventSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 block">
                    Judul Kegiatan
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Kuliah Teori Komputasi"
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 block">
                      Waktu Mulai
                    </label>
                    <input
                      type="time"
                      required
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 block">
                      Waktu Selesai
                    </label>
                    <input
                      type="time"
                      required
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 block">
                    Deskripsi / Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Ruang kelas, link zoom, atau topik materi..."
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] text-sm font-semibold shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

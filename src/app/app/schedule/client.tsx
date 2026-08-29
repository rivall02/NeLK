"use client";

import { motion } from "motion/react";
import { CalendarBlank, Clock, Plus, CaretLeft, CaretRight, MapPin, VideoCamera } from "@phosphor-icons/react";
import { useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DATES = Array.from({ length: 31 }, (_, i) => i + 1);

import { createEvent, deleteEvent as deleteEventAction, autoScheduleStudy } from "@/lib/actions";
import { Sparkle } from "@phosphor-icons/react";

interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  type: string;
  date: string;
  location?: string;
  color?: string;
}

export default function ScheduleClient({ initialEvents }: { initialEvents: ScheduleEvent[] }) {
  const [currentDate, setCurrentDate] = useState(15);
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [events, setEvents] = useState(initialEvents);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);

  async function handleAddEvent() {
    const tempId = Date.now().toString();
    const newEvent = {
      id: tempId,
      title: "Jadwal Baru " + Math.floor(Math.random() * 100),
      time: "09:00 - 10:00",
      type: "class",
      date: new Date().toISOString().split("T")[0],
    };
    setEvents([...events, newEvent]);

    try {
      const saved = await createEvent({
        title: newEvent.title,
        date: new Date(newEvent.date),
        startTime: "09:00",
        endTime: "10:00",
      });
      setEvents((curr) => curr.map(e => e.id === tempId ? { ...e, id: saved.id } : e));
    } catch (err) {
      console.error(err);
      setEvents((curr) => curr.filter(e => e.id !== tempId));
    }
  }

  async function handleDeleteEvent(id: string) {
    setEvents(events.filter(e => e.id !== id));
    await deleteEventAction(id);
  }

  async function handleAutoSchedule() {
    setIsAutoScheduling(true);
    try {
      const result = await autoScheduleStudy();
      if (result.success) {
        alert(`AI has generated ${result.count} smart study blocks. Reload to view.`);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to auto schedule");
    } finally {
      setIsAutoScheduling(false);
    }
  }

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-nelk-text-light dark:text-nelk-text-dark tracking-tight"
          >
            Schedule
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-nelk-text-light/60 dark:text-nelk-text-dark/60 mt-1"
          >
            Manage your classes, meetings, and study time.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="flex bg-nelk-surface-light dark:bg-nelk-surface-dark p-1 rounded-full border border-black/5 dark:border-white/10 shadow-sm">
            {(["day", "week", "month"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors duration-200 ${
                  view === v 
                    ? "bg-nelk-primary text-white shadow-sm" 
                    : "text-nelk-text-light/70 dark:text-nelk-text-dark/70 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <button 
            onClick={handleAutoSchedule}
            disabled={isAutoScheduling}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full font-medium hover:bg-[#8B5CF6]/20 transition-colors active:scale-95 shadow-sm disabled:opacity-50"
          >
            <Sparkle weight="fill" className={isAutoScheduling ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{isAutoScheduling ? "Generating..." : "Auto Schedule"}</span>
          </button>
          <button 
            onClick={handleAddEvent}
            className="flex items-center gap-2 px-4 py-2 bg-nelk-text-light dark:bg-nelk-text-dark text-nelk-surface-light dark:text-nelk-surface-dark rounded-full font-medium hover:bg-black dark:hover:bg-white transition-colors active:scale-95 shadow-sm"
          >
            <Plus weight="bold" />
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </motion.div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Calendar Mini */}
        <motion.aside 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full lg:w-80 shrink-0"
        >
          <div className="bg-nelk-surface-light dark:bg-nelk-surface-dark rounded-3xl p-5 md:p-6 border border-black/5 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">August 2026</h2>
              <div className="flex gap-1">
                <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                  <CaretLeft />
                </button>
                <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                  <CaretRight />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-xs font-medium text-nelk-text-light/50 dark:text-nelk-text-dark/50 py-1">
                  {day[0]}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}
              {DATES.map(date => (
                <button
                  key={date}
                  onClick={() => setCurrentDate(date)}
                  className={`aspect-square flex items-center justify-center rounded-full text-sm transition-all duration-200 ${
                    currentDate === date
                      ? "bg-nelk-primary text-white font-bold shadow-md shadow-nelk-primary/30"
                      : "hover:bg-black/5 dark:hover:bg-white/10 text-nelk-text-light/80 dark:text-nelk-text-dark/80"
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10">
              <h3 className="font-semibold text-sm text-nelk-text-light/60 dark:text-nelk-text-dark/60 mb-4 uppercase tracking-wider">
                Upcoming Deadlines
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Calculus Assignment 4</p>
                    <p className="text-xs text-nelk-text-light/60 dark:text-nelk-text-dark/60 mt-0.5">Tomorrow, 23:59</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Software Eng Proposal</p>
                    <p className="text-xs text-nelk-text-light/60 dark:text-nelk-text-dark/60 mt-0.5">Aug 18, 12:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Right Side: Timeline View */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex-1"
        >
          <div className="bg-nelk-surface-light dark:bg-nelk-surface-dark rounded-3xl p-5 md:p-8 border border-black/5 dark:border-white/10 shadow-sm min-h-[600px]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-nelk-primary/10 text-nelk-primary flex flex-col items-center justify-center font-bold">
                <span className="text-xs opacity-70 leading-none mb-1">AUG</span>
                <span className="text-xl leading-none">{currentDate}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Today's Schedule</h2>
                <p className="text-nelk-text-light/60 dark:text-nelk-text-dark/60 text-sm">3 events planned</p>
              </div>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-[39px] top-4 bottom-4 w-px bg-black/5 dark:bg-white/10" />

              <div className="space-y-8 relative">
                {events.map((event, index) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 100 }}
                    className="flex gap-4 group"
                  >
                    <div className="w-20 shrink-0 text-right text-sm font-medium text-nelk-text-light/60 dark:text-nelk-text-dark/60 pt-3">
                      {event.time.split(" - ")[0]}
                    </div>
                    
                    <div className="relative pt-4">
                      <div className="absolute left-[-5px] top-[18px] w-2.5 h-2.5 rounded-full bg-nelk-surface-light dark:bg-nelk-surface-dark border-2 border-nelk-primary z-10" />
                    </div>

                    <div className={`flex-1 p-5 rounded-2xl border ${event.color} transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md`}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-bold">{event.title}</h3>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-black/5 dark:bg-white/10 capitalize">
                          {event.type}
                        </span>
                        <button 
                          onClick={() => handleDeleteEvent(event.id.toString())}
                          className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm opacity-80">
                        <div className="flex items-center gap-1.5">
                          <Clock weight="fill" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {event.location?.includes("Google") || event.location?.includes("Zoom") ? (
                            <VideoCamera weight="fill" />
                          ) : (
                            <MapPin weight="fill" />
                          )}
                          <span>{event.location || "Online"}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
}

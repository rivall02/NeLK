/**
 * Normalization utilities for AI-extracted schedule data
 * Converts various formats to standardized format
 */

import { logger } from "@/lib/logger";

export interface NormalizedCourse {
  name: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  date?: string;     // YYYY-MM-DD (optional if recurring)
}

export interface NormalizedAcademicEvent {
  name: string;
  date: string;      // YYYY-MM-DD
  type: "exam" | "deadline" | "holiday" | "event";
}

export interface ExtractedSchedule {
  documentType: "class_schedule" | "academic_calendar";
  courses: NormalizedCourse[];
  academicEvents: NormalizedAcademicEvent[];
}

// Day name mappings (multi-language support)
const DAY_MAPPINGS: Record<string, string> = {
  // English
  "monday": "Monday",
  "tuesday": "Tuesday",
  "wednesday": "Wednesday",
  "thursday": "Thursday",
  "friday": "Friday",
  "saturday": "Saturday",
  "sunday": "Sunday",
  // Indonesian
  "senin": "Monday",
  "selasa": "Tuesday",
  "rabu": "Wednesday",
  "kamis": "Thursday",
  "jumat": "Friday",
  "sabtu": "Saturday",
  "minggu": "Sunday",
  // Abbreviations
  "mon": "Monday",
  "tue": "Tuesday",
  "wed": "Wednesday",
  "thu": "Thursday",
  "fri": "Friday",
  "sat": "Saturday",
  "sun": "Sunday",
  "mo": "Monday",
  "tu": "Tuesday",
  "we": "Wednesday",
  "th": "Thursday",
  "fr": "Friday",
  "sa": "Saturday",
  "su": "Sunday",
};

/**
 * Normalize time string to HH:MM format
 */
export function normalizeTime(timeStr: string): string | null {
  if (!timeStr) return null;
  
  // Already in HH:MM format
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    const [h, m] = timeStr.split(":").map(Number);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return timeStr;
    }
  }
  
  // Handle various formats: "08.00", "8 AM", "8:00 AM", etc.
  const cleaned = timeStr.replace(/\./g, ":").toLowerCase().trim();
  
  // AM/PM format
  const amPmMatch = cleaned.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (amPmMatch) {
    let [, h, m, period] = amPmMatch;
    let hours = parseInt(h, 10);
    if (period.toLowerCase() === "pm" && hours !== 12) {
      hours += 12;
    }
    if (period.toLowerCase() === "am" && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${m}`;
  }
  
  // Decimal format: "8.00" -> "08:00"
  const decimalMatch = cleaned.match(/(\d{1,2}):(\d{2})/);
  if (decimalMatch) {
    const [, h, m] = decimalMatch;
    return `${h.padStart(2, "0")}:${m}`;
  }
  
  logger.warn("Could not normalize time", { input: timeStr });
  return null;
}

/**
 * Normalize day name to standard English format
 */
export function normalizeDay(dayStr: string): string | null {
  if (!dayStr) return null;
  const lower = dayStr.toLowerCase().trim();
  return DAY_MAPPINGS[lower] || null;
}

/**
 * Normalize date string to YYYY-MM-DD format
 */
export function normalizeDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Try parsing various formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  }
  
  return null;
}

/**
 * Clean course name - remove extra spaces, standardize
 */
export function normalizeCourseName(name: string): string {
  if (!name) return "";
  return name
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[^\w\s\-:]/g, "");
}

/**
 * Normalize a single course from AI output
 */
export function normalizeCourse(course: Record<string, any>): NormalizedCourse | null {
  const name = normalizeCourseName(course.name || course.title || course.course || "");
  let dayStr = normalizeDay(course.day || course.hari || "");
  const dateStr = normalizeDate(course.date || course.tanggal || "");
  
  if (!dayStr && dateStr) {
    // Derive day from date
    const dateObj = new Date(dateStr);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (!isNaN(dateObj.getTime())) {
      dayStr = days[dateObj.getDay()];
    }
  }

  if (!dayStr) {
    logger.warn("Invalid day in course data", { original: course });
    return null;
  }
  const day = dayStr as NormalizedCourse["day"];
  const startTime = normalizeTime(course.startTime || course.start || course["start time"] || "");
  const endTime = normalizeTime(course.endTime || course.end || course["end time"] || "");
  
  if (!name || !startTime || !endTime) {
    logger.warn("Incomplete course data after normalization", { original: course });
    return null;
  }
  
  return { name, day, startTime, endTime, date: dateStr || undefined };
}

/**
 * Normalize a single academic event from AI output
 */
export function normalizeAcademicEvent(event: Record<string, any>): NormalizedAcademicEvent | null {
  const name = normalizeCourseName(event.name || event.title || "");
  const type = (event.type || event.jenis || "event").toString().toLowerCase();
  const date = normalizeDate(event.date || event.tanggal || "");
  
  const normalizedType: "exam" | "deadline" | "holiday" | "event" = 
    type.includes("uas") || type.includes("exam") ? "exam" :
    type.includes("uts") || type.includes("midterm") ? "exam" :
    type.includes("deadline") || type.includes("tenggat") ? "deadline" :
    type.includes("holiday") || type.includes("libur") ? "holiday" :
    "event";
  
  if (!name || !date) {
    logger.warn("Incomplete academic event data", { original: event });
    return null;
  }
  
  return { name, date, type: normalizedType };
}

/**
 * Main normalization function - takes raw AI output and returns clean structure
 */
export function normalizeExtractedSchedule(raw: any): ExtractedSchedule {
  // Handle different AI output formats
  const data = typeof raw === "string" ? JSON.parse(raw) : raw;
  
  let coursesList = [];
  let eventsList = [];

  if (Array.isArray(data)) {
    // If it's an array, we assume it contains mixed items (mostly courses)
    // We separate them based on whether they have a day/startTime or just a date
    data.forEach(item => {
      // It might have "title" mapped to "name" in normalizeCourse
      if (item.startTime && item.endTime && item.day) {
        coursesList.push(item);
      } else if (item.startTime && item.endTime && item.date) {
         // Try to derive day from date if missing day? Or just keep it as course if it has time
         coursesList.push(item);
      } else if (item.date) {
        eventsList.push(item);
      } else {
        coursesList.push(item); // Fallback
      }
    });
  } else {
    coursesList = data.courses || data.mataKuliah || data.kuliah || [];
    eventsList = data.academicEvents || data.academic_calendar || data.jadwalAkademik || [];
  }

  // Normalize courses
  const courses = coursesList
    .map((c: any) => normalizeCourse(c))
    .filter((c: NormalizedCourse | null): c is NormalizedCourse => c !== null);
  
  // Normalize academic events
  const academicEvents = eventsList
    .map((e: any) => normalizeAcademicEvent(e))
    .filter((e: NormalizedAcademicEvent | null): e is NormalizedAcademicEvent => e !== null);
  
  logger.info("Schedule normalization complete", { 
    coursesCount: courses.length, 
    eventsCount: academicEvents.length 
  });
  
  return {
    documentType: data.documentType || (academicEvents.length > courses.length ? "academic_calendar" : "class_schedule"),
    courses,
    academicEvents,
  };
}
/**
 * Strict runtime input validation schemas and helpers.
 * Prevents invalid data, SQL/NoSQL injection, oversized payloads, and bad state.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Canonical Task Statuses and Priorities
export type CanonicalTaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type CanonicalTaskPriority = "LOW" | "MEDIUM" | "HIGH";

export function normalizeTaskStatus(rawStatus?: string | null): CanonicalTaskStatus {
  if (!rawStatus) return "TODO";
  const s = rawStatus.toLowerCase().trim();
  if (s === "done" || s === "completed") return "DONE";
  if (s === "in_progress" || s === "in-progress" || s === "planned") return "IN_PROGRESS";
  if (s === "todo" || s === "inbox") return "TODO";
  return "TODO";
}

export function normalizeTaskPriority(rawPriority?: string | null): CanonicalTaskPriority {
  if (!rawPriority) return "MEDIUM";
  const p = rawPriority.toUpperCase().trim();
  if (p === "HIGH" || p === "MEDIUM" || p === "LOW") return p;
  return "MEDIUM";
}

export function validateTaskInput(data: {
  title?: any;
  priority?: any;
  status?: any;
  dueDate?: any;
  description?: any;
  subject?: any;
}) {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Data tugas tidak valid.");
  }

  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title || title.length === 0) {
    throw new ValidationError("Judul tugas wajib diisi.");
  }
  if (title.length > 200) {
    throw new ValidationError("Judul tugas maksimal 200 karakter.");
  }

  const priority = normalizeTaskPriority(data.priority);
  const status = normalizeTaskStatus(data.status);

  let dueDate: Date | null = null;
  if (data.dueDate) {
    const parsed = new Date(data.dueDate);
    if (isNaN(parsed.getTime())) {
      throw new ValidationError("Format tanggal tenggat waktu tidak valid.");
    }
    dueDate = parsed;
  }

  const description =
    typeof data.description === "string" ? data.description.trim().slice(0, 2000) : null;
  const subject =
    typeof data.subject === "string" ? data.subject.trim().slice(0, 100) : null;

  return { title, priority, status, dueDate, description, subject };
}

export function validateNoteInput(data: { title?: any; content?: any }) {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Data catatan tidak valid.");
  }

  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title || title.length === 0) {
    throw new ValidationError("Judul catatan wajib diisi.");
  }
  if (title.length > 200) {
    throw new ValidationError("Judul catatan maksimal 200 karakter.");
  }

  const content =
    typeof data.content === "string" ? data.content.slice(0, 50000) : "";

  return { title, content };
}

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function validateEventInput(data: {
  title?: any;
  date?: any;
  startTime?: any;
  endTime?: any;
  description?: any;
}) {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Data jadwal tidak valid.");
  }

  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title || title.length === 0) {
    throw new ValidationError("Judul jadwal wajib diisi.");
  }
  if (title.length > 200) {
    throw new ValidationError("Judul jadwal maksimal 200 karakter.");
  }

  if (!data.date) {
    throw new ValidationError("Tanggal jadwal wajib diisi.");
  }
  const date = new Date(data.date);
  if (isNaN(date.getTime())) {
    throw new ValidationError("Format tanggal tidak valid.");
  }

  let startTime: string | null = null;
  if (data.startTime) {
    if (!TIME_REGEX.test(data.startTime)) {
      throw new ValidationError("Format waktu mulai harus HH:mm (contoh: 09:00).");
    }
    startTime = data.startTime;
  }

  let endTime: string | null = null;
  if (data.endTime) {
    if (!TIME_REGEX.test(data.endTime)) {
      throw new ValidationError("Format waktu selesai harus HH:mm (contoh: 10:30).");
    }
    endTime = data.endTime;
  }

  if (startTime && endTime && startTime >= endTime) {
    throw new ValidationError("Waktu selesai harus lebih lambat dari waktu mulai.");
  }

  const description =
    typeof data.description === "string" ? data.description.trim().slice(0, 2000) : null;

  return { title, date, startTime, endTime, description };
}

export function validateAuthInput(data: { email?: any; password?: any; name?: any }) {
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new ValidationError("Format email tidak valid.");
  }
  if (email.length > 255) {
    throw new ValidationError("Email terlalu panjang.");
  }

  const password = typeof data.password === "string" ? data.password : "";
  if (!password || password.length < 8) {
    throw new ValidationError("Password minimal 8 karakter.");
  }
  if (password.length > 128) {
    throw new ValidationError("Password maksimal 128 karakter.");
  }

  const name = typeof data.name === "string" ? data.name.trim().slice(0, 100) : "Pengguna";

  return { email, password, name };
}

export function validateCommunityPostInput(data: {
  title?: any;
  content?: any;
  category?: any;
}) {
  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title || title.length === 0) {
    throw new ValidationError("Judul postingan wajib diisi.");
  }
  if (title.length > 200) {
    throw new ValidationError("Judul postingan maksimal 200 karakter.");
  }

  const content = typeof data.content === "string" ? data.content.trim() : "";
  if (!content || content.length === 0) {
    throw new ValidationError("Isi postingan wajib diisi.");
  }
  if (content.length > 5000) {
    throw new ValidationError("Isi postingan maksimal 5000 karakter.");
  }

  const validCategories = ["Diskusi Umum", "Tanya PR", "Cari Teman Belajar", "Info Kampus"];
  const category = validCategories.includes(data.category) ? data.category : "Diskusi Umum";

  return { title, content, category };
}

export function validateProfileInput(data: { university?: any; major?: any; contextMode?: any }) {
  const university =
    typeof data.university === "string" ? data.university.trim().slice(0, 150) : null;
  const major =
    typeof data.major === "string" ? data.major.trim().slice(0, 150) : null;

  const validModes = ["NORMAL", "EXAM_WEEK", "VACATION"];
  const contextMode = validModes.includes(data.contextMode) ? data.contextMode : undefined;

  return { university, major, contextMode };
}

"use server";

import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import {
  validateTaskInput,
  validateNoteInput,
  validateEventInput,
  validateAuthInput,
  validateCommunityPostInput,
  validateProfileInput,
  normalizeTaskStatus,
} from "./validations";
import { storageService } from "./storage";
import { enforceRateLimit } from "./rate-limit";
import { env, hasGeminiConfigured, hasGroqConfigured, hasMimoConfigured } from "./env";
import { logger } from "./logger";
import { generateAIChatResponse, generateComplexTaskAI, extractScheduleWithAI, getAvailableAIModels, AIModelId } from "./ai";

// Helper to require active user session
async function requireAuth(): Promise<{ id: string; name?: string | null; email?: string | null }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Anda harus login untuk melakukan aksi ini.");
  }
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
}

// ----------------------------------------------------------------------
// AUTH ACTIONS
// ----------------------------------------------------------------------

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    validateAuthInput({ email, password });
    enforceRateLimit(`auth:${email}`, 10, 60 * 1000, "Login");

    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email atau password salah.";
        default:
          return "Terjadi kesalahan saat masuk.";
      }
    }
    if (error instanceof Error) {
      return error.message;
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

export async function registerUser(formData: FormData) {
  try {
    const name = (formData.get("name") as string) || "Pengguna";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const validated = validateAuthInput({ email, password, name });
    enforceRateLimit(`register:${validated.email}`, 5, 60 * 1000, "Registrasi");

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return "Email sudah terdaftar. Silakan login.";
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);
    await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        xp: 0,
        level: 1,
        role: "USER",
        subscriptionPlan: "FREE",
      },
    });

    logger.info("New user registered", { email: validated.email });

    // Automatically sign in after registration
    await signIn("credentials", {
      email: validated.email,
      password: validated.password,
      redirect: false,
    });
    return "Success";
  } catch (error) {
    logger.error("Failed to register user", error);
    if (error instanceof Error) return error.message;
    return "Gagal mendaftarkan akun. Silakan coba lagi.";
  }
}

// ----------------------------------------------------------------------
// TASK ACTIONS (P0 & P1)
// ----------------------------------------------------------------------

export async function createTask(data: {
  title: string;
  priority?: string;
  status?: string;
  dueDate?: Date | string;
  description?: string;
  subject?: string;
}) {
  const user = await requireAuth();
  const validated = validateTaskInput(data);
  enforceRateLimit(`task:create:${user.id}`, 60, 60 * 1000, "Pembuatan Tugas");

  const task = await prisma.task.create({
    data: {
      title: validated.title,
      status: validated.status,
      priority: validated.priority,
      dueDate: validated.dueDate,
      description: validated.description,
      subject: validated.subject,
      userId: user.id,
    },
  });

  revalidatePath("/app/tasks");
  revalidatePath("/app");
  return task;
}

export async function updateTaskStatus(id: string, rawStatus: string) {
  const user = await requireAuth();
  const nextStatus = normalizeTaskStatus(rawStatus);

  // Perform atomic update with status checking to award XP exactly once
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.task.findUnique({
      where: { id, userId: user.id },
    });

    if (!existing) {
      throw new Error("Tugas tidak ditemukan.");
    }

    const updatedTask = await tx.task.update({
      where: { id, userId: user.id },
      data: { status: nextStatus },
    });

    // Award XP ONLY if task transitioned from non-DONE to DONE
    const wasDone = existing.status === "DONE" || existing.status === "done" || existing.status === "completed";
    const isNowDone = nextStatus === "DONE";

    let xpAwarded = 0;
    if (!wasDone && isNowDone) {
      xpAwarded = 15; // 15 XP per completed task
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          xp: { increment: xpAwarded },
        },
      });

      // Recalculate level on server
      const newLevel = Math.floor(updatedUser.xp / 1000) + 1;
      if (newLevel !== updatedUser.level) {
        await tx.user.update({
          where: { id: user.id },
          data: { level: newLevel },
        });
      }
    }

    return { task: updatedTask, xpAwarded };
  });

  revalidatePath("/app/tasks");
  revalidatePath("/app");
  revalidatePath("/app/gamification");
  return result.task;
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    priority?: string;
    status?: string;
    dueDate?: Date | string;
    description?: string;
    subject?: string;
  }
) {
  const user = await requireAuth();
  const validated = validateTaskInput(data);

  const task = await prisma.task.update({
    where: { id, userId: user.id },
    data: {
      title: validated.title,
      priority: validated.priority,
      status: validated.status,
      dueDate: validated.dueDate,
      description: validated.description,
      subject: validated.subject,
    },
  });

  revalidatePath("/app/tasks");
  revalidatePath("/app");
  return task;
}

export async function deleteTask(id: string) {
  const user = await requireAuth();

  await prisma.task.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/app/tasks");
  revalidatePath("/app");
}

// ----------------------------------------------------------------------
// NOTE ACTIONS (P1 #5)
// ----------------------------------------------------------------------

export async function createNote(data: { title: string; content?: string }) {
  const user = await requireAuth();
  const validated = validateNoteInput(data);

  const note = await prisma.note.create({
    data: {
      title: validated.title,
      content: validated.content,
      userId: user.id,
    },
  });

  revalidatePath("/app/notes");
  revalidatePath("/app");
  return note;
}

export async function updateNote(
  id: string,
  data: { title?: string; content?: string }
) {
  const user = await requireAuth();
  const validated = validateNoteInput(data);

  const note = await prisma.note.update({
    where: { id, userId: user.id },
    data: {
      title: validated.title,
      content: validated.content,
    },
  });

  revalidatePath("/app/notes");
  revalidatePath("/app");
  return note;
}

export async function deleteNote(id: string) {
  const user = await requireAuth();

  await prisma.note.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/app/notes");
  revalidatePath("/app");
}

// ----------------------------------------------------------------------
// VISIBILITY ACTIONS (Feature #4: Public/Private Toggle)
// ----------------------------------------------------------------------

export async function toggleTaskVisibility(id: string) {
  const user = await requireAuth();

  const task = await prisma.task.findUnique({
    where: { id, userId: user.id },
  });

  if (!task) throw new Error("Tugas tidak ditemukan.");

  const newVisibility = task.visibility === "public" ? "private" : "public";

  await prisma.task.update({
    where: { id, userId: user.id },
    data: { visibility: newVisibility },
  });

  revalidatePath("/app/tasks");
  revalidatePath("/app/community");
  return { visibility: newVisibility };
}

export async function toggleNoteVisibility(id: string) {
  const user = await requireAuth();

  const note = await prisma.note.findUnique({
    where: { id, userId: user.id },
  });

  if (!note) throw new Error("Catatan tidak ditemukan.");

  const newVisibility = note.visibility === "public" ? "private" : "public";

  await prisma.note.update({
    where: { id, userId: user.id },
    data: { visibility: newVisibility },
  });

  // Auto-post to community when note becomes public
  if (newVisibility === "public") {
    const existingPost = await prisma.communityPost.findFirst({
      where: {
        userId: user.id,
        category: "Berbagi Catatan",
        title: note.title,
      },
    });

    if (!existingPost) {
      const excerpt = note.content ? note.content.slice(0, 200) + (note.content.length > 200 ? "..." : "") : "(Catatan tanpa konten)";
      await prisma.communityPost.create({
        data: {
          title: `📝 ${note.title}`,
          content: excerpt,
          category: "Berbagi Catatan",
          userId: user.id,
        },
      });
    }
  } else if (newVisibility === "private") {
    // Remove auto-posted community post when going private
    await prisma.communityPost.deleteMany({
      where: {
        userId: user.id,
        category: "Berbagi Catatan",
        title: `📝 ${note.title}`,
      },
    });
  }

  revalidatePath("/app/notes");
  revalidatePath("/app/community");
  return { visibility: newVisibility };
}

export async function getPublicNotes() {
  return await prisma.note.findMany({
    where: { visibility: "public" },
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: { name: true, id: true },
      },
    },
  });
}

// ----------------------------------------------------------------------
// EVENT & SCHEDULE ACTIONS (P1 #6)
// ----------------------------------------------------------------------

export async function extractScheduleFromDocument(content: string) {
  const user = await requireAuth();

  if (!hasGroqConfigured() && !hasGeminiConfigured()) {
    return { success: false, message: "Layanan AI belum aktif. Tambahkan GROQ_API_KEY atau GEMINI_API_KEY." };
  }

  const sanitized = (content || "").slice(0, 8000);
  if (!sanitized.trim()) {
    return { success: false, message: "Dokumen kosong tidak dapat dianalisis." };
  }

  try {
    // Uses Groq Qwen 3.8 27B with fallback cascade
    const events = await extractScheduleWithAI(sanitized);
    return { success: true, events };
  } catch (e) {
    logger.error("AI Schedule extraction error", e);
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan saat menganalisis dokumen.";
    return { success: false, message: msg };
  }
}

export async function createEvent(data: {
  title: string;
  date: Date | string;
  startTime?: string;
  endTime?: string;
  description?: string;
}) {
  const user = await requireAuth();
  const validated = validateEventInput(data);

  // Validate event duration (minimum 30 min, maximum 4 hours)
  if (validated.startTime && validated.endTime) {
    const [startH, startM] = validated.startTime.split(":").map(Number);
    const [endH, endM] = validated.endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const duration = endMinutes - startMinutes;

    if (duration < 30) {
      throw new Error("Durasi acara minimal 30 menit.");
    }
    if (duration > 240) {
      throw new Error("Durasi acara maksimal 4 jam.");
    }
  }

  // Check for schedule conflicts
  if (validated.startTime && validated.endTime) {
    const eventDate = new Date(validated.date);
    eventDate.setHours(0, 0, 0, 0);

    const existingEvents = await prisma.event.findMany({
      where: {
        userId: user.id,
        date: {
          gte: eventDate,
          lt: new Date(eventDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    const [newStartH, newStartM] = validated.startTime.split(":").map(Number);
    const [newEndH, newEndM] = validated.endTime.split(":").map(Number);
    const newStart = newStartH * 60 + newStartM;
    const newEnd = newEndH * 60 + newEndM;

    for (const existing of existingEvents) {
      if (existing.startTime && existing.endTime) {
        const [existStartH, existStartM] = existing.startTime.split(":").map(Number);
        const [existEndH, existEndM] = existing.endTime.split(":").map(Number);
        const existStart = existStartH * 60 + existStartM;
        const existEnd = existEndH * 60 + existEndM;

        // Check for overlap: startA < endB && startB < endA
        if (newStart < existEnd && existStart < newEnd) {
          throw new Error(
            `Jam ini sudah ditempati jadwal: "${existing.title}" (${existing.startTime} - ${existing.endTime}). Pilih waktu lain.`
          );
        }
      }
    }
  }

  const event = await prisma.event.create({
    data: {
      title: validated.title,
      date: validated.date,
      startTime: validated.startTime,
      endTime: validated.endTime,
      description: validated.description,
      userId: user.id,
    },
  });

  revalidatePath("/app/schedule");
  revalidatePath("/app");
  return event;
}

export async function deleteEvent(id: string) {
  const user = await requireAuth();

  await prisma.event.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/app/schedule");
  revalidatePath("/app");
}

export async function autoScheduleStudy(targetDateStr?: string) {
  const user = await requireAuth();

  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Check existing events for this day
  const existingEvents = await prisma.event.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // 2. Check if an AI study session already exists on this day (idempotent protection)
  const alreadyScheduled = existingEvents.some(
    (ev) => ev.title.includes("Sesi Belajar") || ev.title.includes("Focus Study")
  );

  if (alreadyScheduled) {
    return {
      success: true,
      count: 0,
      message: "Sesi belajar untuk hari ini sudah dijadwalkan sebelumnya.",
    };
  }

  // 3. Find non-conflicting time slot (prefer 19:00 - 21:00 or 21:00 - 22:30 or 16:00 - 18:00)
  const candidateSlots = [
    { startTime: "19:00", endTime: "21:00" },
    { startTime: "21:00", endTime: "22:30" },
    { startTime: "16:00", endTime: "18:00" },
    { startTime: "08:00", endTime: "10:00" },
  ];

  let selectedSlot = candidateSlots[0];
  for (const slot of candidateSlots) {
    const hasConflict = existingEvents.some((ev) => {
      if (!ev.startTime || !ev.endTime) return false;
      // Overlap condition: startA < endB && startB < endA
      return ev.startTime < slot.endTime && slot.startTime < ev.endTime;
    });

    if (!hasConflict) {
      selectedSlot = slot;
      break;
    }
  }

  const created = await prisma.event.create({
    data: {
      title: "Sesi Belajar Mandiri (AI Scheduled)",
      date: startOfDay,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      description: "Blok waktu belajar fokus yang dijadwalkan otomatis oleh NeLK AI.",
      userId: user.id,
    },
  });

  revalidatePath("/app/schedule");
  revalidatePath("/app");
  return {
    success: true,
    count: 1,
    event: created,
    message: `Berhasil menambahkan sesi belajar pukul ${selectedSlot.startTime} - ${selectedSlot.endTime}.`,
  };
}

// ----------------------------------------------------------------------
// DOCUMENT ACTIONS (P0 #1)
// ----------------------------------------------------------------------

export async function uploadDocument(formData: FormData) {
  const user = await requireAuth();
  enforceRateLimit(`doc:upload:${user.id}`, 10, 60 * 1000, "Upload Dokumen");

  const file = formData.get("file") as File;
  if (!file || !(file instanceof File)) {
    throw new Error("File dokumen tidak ditemukan dalam permintaan.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 1. Secure storage (Try Google Drive first, fallback to local)
  let storageKey = "";
  let sizeBytes = 0;
  let storedMimeType = file.type;

  try {
    const { uploadToUserDrive } = await import("./gdrive-storage");
    const gdriveResult = await uploadToUserDrive(user.id, buffer, file.name, file.type);
    storageKey = gdriveResult.storageKey;
    sizeBytes = gdriveResult.sizeBytes;
    storedMimeType = gdriveResult.mimeType;
  } catch (e: any) {
    logger.info("Falling back to local storage", { reason: e.message });
    const stored = await storageService.saveFile(buffer, file.name, file.type);
    storageKey = stored.storageKey;
    sizeBytes = stored.sizeBytes;
    storedMimeType = stored.mimeType;
  }

  // 2. Extract text content if applicable
  let content = "";
  if (file.type === "application/pdf") {
    try {
      const pdfParse =
        (await import("pdf-parse") as any).default || (await import("pdf-parse"));
      const data = await pdfParse(buffer);
      content = data.text ? data.text.slice(0, 30000) : "";
    } catch (e) {
      logger.warn("PDF parsing non-critical failure", { filename: file.name });
    }
  } else if (file.type.startsWith("text/")) {
    content = buffer.toString("utf-8").slice(0, 30000);
  }

  const doc = await prisma.document.create({
    data: {
      title: file.name,
      fileUrl: `/api/documents/download`, // placeholder, actual download route is dynamic
      storageKey: storageKey,
      fileSize: sizeBytes,
      mimeType: storedMimeType,
      content,
      userId: user.id,
    },
  });

  revalidatePath("/app/files");
  return { success: true, document: doc };
}

export async function deleteDocument(id: string) {
  const user = await requireAuth();

  const doc = await prisma.document.findUnique({
    where: { id, userId: user.id },
  });

  if (!doc) throw new Error("Dokumen tidak ditemukan.");

  if (doc.storageKey) {
    if (doc.storageKey.startsWith("gdrive:")) {
      const { deleteFromUserDrive } = await import("./gdrive-storage");
      await deleteFromUserDrive(user.id, doc.storageKey.replace("gdrive:", ""));
    } else {
      await storageService.deleteFile(doc.storageKey);
    }
  } else if (doc.fileUrl && doc.fileUrl.startsWith("/uploads/")) {
    // Legacy cleanup
    await storageService.deleteFile(doc.fileUrl.replace("/uploads/", ""));
  }

  await prisma.document.delete({
    where: { id },
  });

  revalidatePath("/app/files");
}

// ----------------------------------------------------------------------
// AI ACTIONS (P0 #2 & P2 #10)
// ----------------------------------------------------------------------

export async function summarizeContent(content: string) {
  const user = await requireAuth();
  enforceRateLimit(`ai:summarize:${user.id}`, 15, 60 * 1000, "Ringkasan AI");

  if (!hasGroqConfigured() && !hasGeminiConfigured()) {
    return "Fitur AI Summary belum aktif. Tambahkan GROQ_API_KEY atau GEMINI_API_KEY di environment.";
  }

  const sanitizedContent = (content || "").slice(0, 8000);
  if (!sanitizedContent.trim()) {
    return "Konten kosong tidak dapat diringkas.";
  }

  try {
    // Uses Groq GPT-OSS 120B for complex content tasks
    return await generateComplexTaskAI(
      "Kamu adalah asisten akademik NeLK yang ahli merangkum materi kuliah.",
      `Buatkan ringkasan ringkas dan jelas dalam Bahasa Indonesia berpoin-poin penting dari materi berikut:\n\n${sanitizedContent}`
    );
  } catch (e) {
    logger.error("AI Summarize error", e);
    if (e instanceof Error) {
      if (e.message.includes("429") || e.message.includes("quota")) {
        return "Batas penggunaan AI tercapai. Coba lagi beberapa saat.";
      }
      if (e.message.includes("timeout") || e.message.includes("fetch failed")) {
        return "Timeout koneksi AI. Coba lagi dalam 30 detik.";
      }
    }
    return "Terjadi kesalahan saat memproses permintaan AI. Coba lagi beberapa saat lagi.";
  }
}

export async function getAIModelsList() {
  return getAvailableAIModels();
}

export async function askAI(query: string, modelId?: AIModelId) {
  const user = await requireAuth();
  enforceRateLimit(`ai:chat:${user.id}`, 25, 60 * 1000, "AI Chat");

  const cleanQuery = (query || "").slice(0, 2000);
  if (!cleanQuery.trim()) return "Pertanyaan tidak boleh kosong.";

  // 1. Fetch user context safely
  const [tasks, notes] = await Promise.all([
    prisma.task.findMany({
      where: { userId: user.id, status: { not: "DONE" } },
      select: { title: true, status: true, priority: true, dueDate: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.note.findMany({
      where: { userId: user.id },
      select: { title: true, content: true },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const contextText = `
Data Tugas Aktif:
${tasks.map((t) => `- ${t.title} [Status: ${t.status}, Prioritas: ${t.priority || "MEDIUM"}, Tenggat: ${t.dueDate ? t.dueDate.toLocaleDateString("id-ID") : "Tidak ada"}]`).join("\n")}

Data Catatan Terbaru:
${notes.map((n) => `Judul: ${n.title}\nRingkasan: ${n.content?.slice(0, 150)}...`).join("\n\n")}
`;

  // Route to multi-model AI system
  try {
    return await generateAIChatResponse({
      prompt: cleanQuery,
      context: contextText,
      modelId: modelId || "groq-gpt-oss-20b",
    });
  } catch (e: any) {
    logger.error("AI Multi-model error", e);
    if (e instanceof Error) {
      if (e.message.includes("429") || e.message.includes("quota")) {
        return "Batas penggunaan AI tercapai. Silakan coba kembali dalam beberapa saat.";
      }
      if (e.message.includes("timeout") || e.message.includes("fetch failed")) {
        return "Timeout koneksi ke server AI. Coba lagi dalam beberapa detik.";
      }
      return `Layanan AI mengalami kendala: ${e.message.slice(0, 150)}`;
    }
    return "Terjadi kendala koneksi ke server AI. Silakan coba lagi dalam beberapa saat.";
  }
}

export async function getProactiveInsight() {
  const user = await requireAuth();

  if (!hasGroqConfigured() && !hasGeminiConfigured()) {
    return "Tetap semangat belajar hari ini! Selesaikan tugas prioritasmu tepat waktu.";
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: user.id, status: { not: "DONE" } },
      select: { title: true, dueDate: true, priority: true },
      take: 5,
    });

    if (tasks.length === 0) {
      return "Semua tugas sudah beres! Waktunya beristirahat atau mengeksplorasi minat barumu.";
    }

    const contextText = tasks
      .map(
        (t) =>
          `- ${t.title} (Prioritas: ${t.priority}, Due: ${t.dueDate ? t.dueDate.toLocaleDateString("id-ID") : "Fleksibel"})`
      )
      .join("\n");

    return await generateComplexTaskAI(
      "Kamu adalah motivator akademik NeLK yang ramah dan singkat.",
      `Berikan 1 kalimat motivasi / insight singkat dan ramah (maksimal 140 karakter) dalam Bahasa Indonesia untuk menyemangati mahasiswa menyelesaikan tugas-tugas ini:\n${contextText}`
    );
  } catch (e) {
    logger.error("AI Insight error", e);
    return "Fokus selesaikan tugas terdekat untuk hasil maksimal hari ini!";
  }
}

export async function getRandomNoteSummary() {
  const user = await requireAuth();

  const count = await prisma.note.count({
    where: { userId: user.id },
  });

  if (count === 0) {
    return {
      title: "Insight Catatan",
      summary: "Belum ada catatan. Buat catatan materi pertamamu agar AI dapat memberikan ulasan ringkas!",
    };
  }

  const skip = Math.floor(Math.random() * count);
  const randomNote = await prisma.note.findFirst({
    where: { userId: user.id },
    skip,
  });

  if (!randomNote) return null;

  if ((!hasGroqConfigured() && !hasGeminiConfigured()) || !randomNote.content) {
    return {
      title: randomNote.title,
      summary: randomNote.content
        ? `${randomNote.content.slice(0, 180)}...`
        : "Catatan ini belum memiliki isi konten.",
    };
  }

  try {
    const summary = await generateComplexTaskAI(
      "Kamu adalah asisten akademik NeLK yang merangkum catatan kuliah.",
      `Buat 2-3 poin pengingat kunci ringkas dalam Bahasa Indonesia dari materi catatan ini:\nJudul: ${randomNote.title}\nKonten: ${randomNote.content.slice(0, 3000)}`
    );
    return {
      title: randomNote.title,
      summary,
    };
  } catch (e) {
    return {
      title: randomNote.title,
      summary: randomNote.content ? `${randomNote.content.slice(0, 180)}...` : "Tetap semangat belajar!",
    };
  }
}

// ----------------------------------------------------------------------
// GAMIFICATION ACTIONS (P0 #3)
// ----------------------------------------------------------------------

export async function recordFocusSessionXP(durationMinutes: number) {
  const user = await requireAuth();
  enforceRateLimit(`gamification:focus:${user.id}`, 6, 60 * 1000, "Klaim Sesi Fokus");

  // Validate duration between 5 and 180 minutes
  const validDuration = Math.min(180, Math.max(5, Math.floor(durationMinutes || 0)));
  const gainedXp = Math.min(50, Math.floor(validDuration / 2)); // 1 XP per 2 mins, max 50 XP per session

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { xp: { increment: gainedXp } },
  });

  const newLevel = Math.floor(updatedUser.xp / 1000) + 1;
  if (newLevel !== updatedUser.level) {
    await prisma.user.update({
      where: { id: user.id },
      data: { level: newLevel },
    });
  }

  revalidatePath("/app/gamification");
  revalidatePath("/app");
  return { xp: updatedUser.xp, level: newLevel, gainedXp };
}

export async function getUserProfile() {
  const user = await requireAuth();

  return await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      xp: true,
      level: true,
      contextMode: true,
      university: true,
      major: true,
      subscriptionPlan: true,
    },
  });
}

// ----------------------------------------------------------------------
// INTEGRATION AUDIT: GOOGLE CLASSROOM & STRAVA (P1 #8)
// ----------------------------------------------------------------------

export async function syncGoogleClassroom() {
  const user = await requireAuth();

  // Find linked Google account
  const googleAccount = await prisma.account.findFirst({
    where: { userId: user.id, provider: "google" },
  });

  if (!googleAccount || !googleAccount.access_token) {
    return {
      success: false,
      connected: false,
      count: 0,
      message: "Akun Google belum terhubung atau belum memberikan izin akses Google Classroom.",
    };
  }

  try {
    // Real Classroom API fetch using token
    const res = await fetch("https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE", {
      headers: { Authorization: `Bearer ${googleAccount.access_token}` },
    });

    if (!res.ok) {
      return {
        success: false,
        connected: true,
        count: 0,
        message: "Token Google Classroom kedaluwarsa. Silakan hubungkan ulang akun Google Anda.",
      };
    }

    const data = await res.json();
    const courses = data.courses || [];
    let syncedCount = 0;

    for (const course of courses.slice(0, 5)) {
      const courseWorkRes = await fetch(
        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`,
        { headers: { Authorization: `Bearer ${googleAccount.access_token}` } }
      );

      if (courseWorkRes.ok) {
        const cwData = await courseWorkRes.json();
        for (const item of (cwData.courseWork || []).slice(0, 5)) {
          const existing = await prisma.task.findFirst({
            where: { userId: user.id, title: item.title },
          });

          if (!existing) {
            let dueDate: Date | null = null;
            if (item.dueDate) {
              dueDate = new Date(item.dueDate.year, (item.dueDate.month || 1) - 1, item.dueDate.day || 1);
            }

            await prisma.task.create({
              data: {
                title: item.title,
                description: item.description?.slice(0, 1000),
                subject: course.name,
                status: "TODO",
                priority: "MEDIUM",
                dueDate,
                userId: user.id,
              },
            });
            syncedCount++;
          }
        }
      }
    }

    revalidatePath("/app/tasks");
    return {
      success: true,
      connected: true,
      count: syncedCount,
      message: `Berhasil menyinkronkan ${syncedCount} tugas dari Google Classroom.`,
    };
  } catch (err) {
    logger.error("Classroom sync error", err);
    return {
      success: false,
      connected: true,
      count: 0,
      message: "Gagal menyinkronkan tugas Google Classroom.",
    };
  }
}

export async function syncStrava() {
  const user = await requireAuth();

  const stravaAccount = await prisma.account.findFirst({
    where: { userId: user.id, provider: "strava" },
  });

  if (!stravaAccount || !stravaAccount.access_token) {
    return {
      success: false,
      connected: false,
      count: 0,
      message: "Akun Strava belum terhubung. Silakan hubungkan akun Strava terlebih dahulu.",
    };
  }

  try {
    const res = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=20", {
      headers: {
        Authorization: `Bearer ${stravaAccount.access_token}`,
      },
    });

    if (!res.ok) {
      return {
        success: false,
        connected: true,
        count: 0,
        message: "Gagal mengambil data dari Strava. Sesi Strava Anda mungkin telah kedaluwarsa.",
      };
    }

    const activities = await res.json();
    let newCount = 0;

    for (const act of activities) {
      const actDate = new Date(act.start_date);
      const existing = await prisma.activity.findFirst({
        where: {
          userId: user.id,
          title: act.name,
          date: actDate,
        },
      });

      if (!existing) {
        await prisma.activity.create({
          data: {
            title: act.name,
            type: act.type || "Workout",
            duration: Math.round((act.moving_time || 0) / 60),
            calories: act.kilojoules ? Math.round(act.kilojoules * 0.239) : 0,
            date: actDate,
            userId: user.id,
          },
        });
        newCount++;
      }
    }

    revalidatePath("/app/fitness");
    return {
      success: true,
      connected: true,
      count: newCount,
      message: `Berhasil menyinkronkan ${newCount} aktivitas baru dari Strava.`,
    };
  } catch (error) {
    logger.error("Strava sync error", error);
    return {
      success: false,
      connected: true,
      count: 0,
      message: "Gagal menghubungkan ke Strava API.",
    };
  }
}

// ----------------------------------------------------------------------
// COMMUNITY ACTIONS (P2 #11)
// ----------------------------------------------------------------------

export async function createCommunityPost(title: string, content: string, category: string) {
  const user = await requireAuth();
  const validated = validateCommunityPostInput({ title, content, category });
  enforceRateLimit(`community:post:${user.id}`, 10, 60 * 1000, "Posting Komunitas");

  const post = await prisma.communityPost.create({
    data: {
      title: validated.title,
      content: validated.content,
      category: validated.category,
      userId: user.id,
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  revalidatePath("/app/community");
  return post;
}

export async function deleteCommunityPost(id: string) {
  const user = await requireAuth();

  await prisma.communityPost.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/app/community");
}

// ----------------------------------------------------------------------
// PROFILE & CONTEXT ACTIONS
// ----------------------------------------------------------------------

export async function updateContextMode(mode: string) {
  const user = await requireAuth();
  const validated = validateProfileInput({ contextMode: mode });

  if (validated.contextMode) {
    await prisma.user.update({
      where: { id: user.id },
      data: { contextMode: validated.contextMode },
    });
    revalidatePath("/app");
  }
}

export async function updateUserProfile(data: { university?: string; major?: string }) {
  const user = await requireAuth();
  const validated = validateProfileInput(data);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      university: validated.university,
      major: validated.major,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/settings");
}

export async function updateUserSettings(data: {
  language?: string;
  timeFormat?: string;
  timezone?: string;
  privacyProfile?: string;
  notificationSettings?: any;
  name?: string;
}) {
  const user = await requireAuth();

  const updateData: any = {};
  if (data.language) updateData.language = data.language;
  if (data.timeFormat) updateData.timeFormat = data.timeFormat;
  if (data.timezone) updateData.timezone = data.timezone;
  if (data.privacyProfile) updateData.privacyProfile = data.privacyProfile;
  if (data.notificationSettings) updateData.notificationSettings = data.notificationSettings;
  if (data.name) updateData.name = data.name.trim().slice(0, 100);

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { success: true };
}

export async function getIntegrationStatus() {
  const user = await requireAuth();

  const googleAccount = await prisma.account.findFirst({
    where: { userId: user.id, provider: "google" },
    select: { provider: true, access_token: true },
  });

  const stravaAccount = await prisma.account.findFirst({
    where: { userId: user.id, provider: "strava" },
    select: { provider: true, access_token: true },
  });

  return {
    googleClassroom: !!googleAccount?.access_token,
    googleDrive: !!googleAccount?.access_token,
    strava: !!stravaAccount?.access_token,
  };
}

// ----------------------------------------------------------------------
// DASHBOARD & QUERY HELPERS (P1 #7)
// ----------------------------------------------------------------------

export async function getUpcomingTasks() {
  const user = await requireAuth();
  return await prisma.task.findMany({
    where: { userId: user.id, status: { not: "DONE" } },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    take: 5,
  });
}

export async function getTodaySchedule() {
  const user = await requireAuth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await prisma.event.findMany({
    where: {
      userId: user.id,
      date: { gte: today, lt: tomorrow },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getRecentNotes() {
  const user = await requireAuth();
  return await prisma.note.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 4,
  });
}

export async function getNotifications() {
  const user = await requireAuth();
  return await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function markNotificationsRead() {
  const user = await requireAuth();
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
}

export async function generateTaskReminders() {
  const user = await requireAuth();

  // Completed tasks must NOT receive reminders!
  const upcomingTasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      status: { not: "DONE" },
      dueDate: {
        lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    },
  });

  for (const task of upcomingTasks) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        message: { contains: task.title },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          message: `Pengingat: Tugas "${task.title}" mendekati batas tenggat waktu!`,
          type: "reminder",
        },
      });
    }
  }
}

// ----------------------------------------------------------------------
// COURSE ACTIONS
// ----------------------------------------------------------------------

export async function generateQuizFromContent(content: string) {
  const user = await requireAuth();
  enforceRateLimit(`ai:quiz:${user.id}`, 10, 60 * 1000, "AI Quiz Generation");

  if (!hasGroqConfigured() && !hasGeminiConfigured()) {
    return { success: false, message: "Layanan AI belum aktif. Tambahkan GROQ_API_KEY atau GEMINI_API_KEY." };
  }

  const sanitized = (content || "").slice(0, 6000);
  if (!sanitized.trim()) {
    return { success: false, message: "Konten kosong tidak dapat dijadikan kuis." };
  }

  try {
    // Uses Groq GPT-OSS 120B for complex quiz generation
    const text = await generateComplexTaskAI(
      "Kamu adalah generator soal kuis akademik NeLK. Kamu harus menghasilkan soal pilihan ganda yang akurat.",
      `Buatkan 5 soal kuis pilihan ganda dari materi berikut. Setiap soal harus memiliki 4 opsi (A, B, C, D) dan jawaban yang benar.
Return dalam format JSON array: [{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correctAnswer":"A"}]
Tanpa markdown atau penjelasan lain.

Materi:\n${sanitized}`
    );
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return { success: true, questions: JSON.parse(jsonMatch[0]) };
    }
    return { success: false, message: "Gagal menghasilkan soal kuis." };
  } catch (e) {
    logger.error("AI Quiz generation error", e);
    return { success: false, message: "Terjadi kesalahan saat menghasilkan kuis." };
  }
}

export async function getDailyQuiz() {
  const user = await requireAuth();

  // Get today's date range (UTC)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if user already answered today
  const existingAttempt = await prisma.userQuizAttempt.findFirst({
    where: {
      userId: user.id,
      answeredAt: { gte: today, lt: tomorrow },
    },
    include: { dailyQuiz: true },
  });

  if (existingAttempt) {
    return {
      alreadyAttempted: true,
      quiz: existingAttempt.dailyQuiz,
      isCorrect: existingAttempt.isCorrect,
      timeTaken: existingAttempt.timeTaken,
    };
  }

  // Get or create today's quiz
  let dailyQuiz = await prisma.dailyQuiz.findFirst({
    where: {
      date: { gte: today, lt: tomorrow },
    },
  });

  if (!dailyQuiz) {
    // Generate a new daily quiz from predefined questions
    const topics = ["matematika", "sejarah", "umum", "sains", "bahasa"];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    const questions = [
      // Matematika
      { q: "Berapa hasil dari 15 × 12?", opts: ["A. 180", "B. 170", "C. 190", "D. 160"], a: "A", t: "matematika" },
      { q: "Akar kuadrat dari 144 adalah...", opts: ["A. 14", "B. 12", "C. 11", "D. 13"], a: "B", t: "matematika" },
      { q: "Berapa hasil dari 2⁸?", opts: ["A. 128", "B. 256", "C. 64", "D. 512"], a: "B", t: "matematika" },
      { q: "Jika x + 15 = 30, maka x = ...", opts: ["A. 20", "B. 15", "C. 25", "D. 10"], a: "B", t: "matematika" },
      // Sejarah
      { q: "Tahun berapa Indonesia merdeka?", opts: ["A. 1945", "B. 1950", "C. 1943", "D. 1947"], a: "A", t: "sejarah" },
      { q: "Siapa proklamator kemerdekaan Indonesia?", opts: ["A. Soekarno & Hatta", "B. Soekarno & Sjahrir", "C. Hatta & Sjahrir", "D. Soekarno & Yamin"], a: "A", t: "sejarah" },
      { q: "Apa nama perjanjian yang mengakhiri penjajahan Belanda?", opts: ["A. Perjanjian Renville", "B. Perjanjian Linggarjati", "C. Perjanjian Roem-Royen", "D. Perjanjian KMB"], a: "B", t: "sejarah" },
      // Sains
      { q: "Apa simbol kimia untuk air?", opts: ["A. H2O", "B. CO2", "C. NaCl", "D. O2"], a: "A", t: "sains" },
      { q: "Planet terbesar di tata surya adalah...", opts: ["A. Saturnus", "B. Jupiter", "C. Uranus", "D. Neptunus"], a: "B", t: "sains" },
      { q: "Satuan SI untuk gaya adalah...", opts: ["A. Watt", "B. Joule", "C. Newton", "D. Pascal"], a: "C", t: "sains" },
      // Umum
      { q: "Ibu kota Jepang adalah...", opts: ["A. Osaka", "B. Kyoto", "C. Tokyo", "D. Hiroshima"], a: "C", t: "umum" },
      { q: "Bahasa pemrograman yang dibuat oleh Brendan Eich adalah...", opts: ["A. Python", "B. Java", "C. JavaScript", "D. C++"], a: "C", t: "umum" },
      { q: "Lambang kimia untuk emas adalah...", opts: ["A. Ag", "B. Au", "C. Fe", "D. Cu"], a: "B", t: "umum" },
      // Bahasa
      { q: "Antonim dari 'rajin' adalah...", opts: ["A. Malas", "B. Pintar", "C. Cepat", "D. Kuat"], a: "A", t: "bahasa" },
      { q: "Sinonim dari 'gembira' adalah...", opts: ["A. Sedih", "B. Senang", "C. Marah", "D. Takut"], a: "B", t: "bahasa" },
      { q: "Kata 'MGMB' merupakan singkatan dari...", opts: ["A. Maka Gue莫 Begitu", "B. Maka Gue Mulai Belajar", "C. Makin Gue Mau Belajar", "D. Masa Gue Mau Buru"], a: "A", t: "bahasa" },
    ];

    // Pick a random question
    const randomIdx = Math.floor(Math.random() * questions.length);
    const picked = questions[randomIdx];

    dailyQuiz = await prisma.dailyQuiz.create({
      data: {
        question: picked.q,
        topic: picked.t,
        correctAnswer: picked.a,
        options: picked.opts,
      },
    });
  }

  return {
    alreadyAttempted: false,
    quiz: dailyQuiz,
    isCorrect: null,
    timeTaken: null,
  };
}

export async function answerDailyQuiz(quizId: string, answer: string, timeTaken: number) {
  const user = await requireAuth();

  // Check if already answered
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await prisma.userQuizAttempt.findFirst({
    where: {
      userId: user.id,
      dailyQuizId: quizId,
      answeredAt: { gte: today, lt: tomorrow },
    },
  });

  if (existing) {
    throw new Error("Anda sudah menjawab kuis hari ini.");
  }

  const quiz = await prisma.dailyQuiz.findUnique({ where: { id: quizId } });
  if (!quiz) throw new Error("Kuis tidak ditemukan.");

  const isCorrect = quiz.correctAnswer.toUpperCase() === answer.toUpperCase();

  await prisma.userQuizAttempt.create({
    data: {
      userId: user.id,
      dailyQuizId: quizId,
      isCorrect,
      timeTaken: Math.min(timeTaken, 300),
    },
  });

  // Update quiz attempt count
  await prisma.dailyQuiz.update({
    where: { id: quizId },
    data: { attempts: { increment: 1 } },
  });

  // Award XP if correct
  let gainedXp = 0;
  if (isCorrect) {
    gainedXp = 10;
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { xp: { increment: gainedXp } },
    });

    const newLevel = Math.floor(updatedUser.xp / 1000) + 1;
    if (newLevel !== updatedUser.level) {
      await prisma.user.update({
        where: { id: user.id },
        data: { level: newLevel },
      });
    }
  }

  revalidatePath("/app/gamification");
  return { isCorrect, gainedXp, correctAnswer: quiz.correctAnswer };
}

export async function getDailyQuizHistory() {
  const user = await requireAuth();

  const attempts = await prisma.userQuizAttempt.findMany({
    where: { userId: user.id },
    orderBy: { answeredAt: "desc" },
    take: 10,
    include: { dailyQuiz: true },
  });

  return attempts.map((a) => ({
    question: a.dailyQuiz.question,
    topic: a.dailyQuiz.topic,
    isCorrect: a.isCorrect,
    answeredAt: a.answeredAt,
    timeTaken: a.timeTaken,
  }));
}

export async function createCourse(title: string, description?: string) {
  const user = await requireAuth();
  const cleanTitle = (title || "").trim().slice(0, 200);
  if (!cleanTitle) throw new Error("Nama mata kuliah / topik wajib diisi.");

  const course = await prisma.course.create({
    data: {
      title: cleanTitle,
      description: description?.trim().slice(0, 1000) || null,
      userId: user.id,
    },
  });

  revalidatePath("/app/courses");
  return course;
}

export async function deleteCourse(id: string) {
  const user = await requireAuth();

  await prisma.course.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/app/courses");
}


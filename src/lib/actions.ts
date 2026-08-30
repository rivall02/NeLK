"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";


export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut();
}

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return "Missing required fields";
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return "Email already exists";
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    
    // Automatically log in after registration
    await signIn("credentials", { email, password, redirect: false });
    return "Success";
  } catch (error) {
    console.error("Failed to register:", error);
    return "Failed to register";
  }
}

// ----------------------------------------------------------------------
// TASK ACTIONS
// ----------------------------------------------------------------------
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createTask(data: { title: string; priority: string; status: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const task = await prisma.task.create({
    data: {
      title: data.title,
      status: data.status,
      userId: session.user.id,
      // Note: priority and subject aren't in prisma yet, but we'll adapt or use description
    },
  });
  revalidatePath("/app/tasks");
  return task;
}

export async function updateTaskStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const task = await prisma.task.update({
    where: { id, userId: session.user.id },
    data: { status },
  });

  if (status === "done") {
    await awardXP(10); // Award 10 XP for completing a task
  }

  revalidatePath("/app/tasks");
  return task;
}

export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.task.delete({
    where: { id, userId: session.user.id },
  });
  revalidatePath("/app/tasks");
}

// ----------------------------------------------------------------------
// NOTE ACTIONS
// ----------------------------------------------------------------------
export async function createNote(data: { title: string; content?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const note = await prisma.note.create({
    data: {
      title: data.title,
      content: data.content || "",
      userId: session.user.id,
    },
  });
  revalidatePath("/app/notes");
  return note;
}

export async function updateNote(id: string, data: { title?: string; content?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const note = await prisma.note.update({
    where: { id, userId: session.user.id },
    data,
  });
  revalidatePath("/app/notes");
  return note;
}

export async function deleteNote(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.note.delete({
    where: { id, userId: session.user.id },
  });
  revalidatePath("/app/notes");
}

// ----------------------------------------------------------------------
// EVENT (SCHEDULE) ACTIONS
// ----------------------------------------------------------------------
export async function createEvent(data: { title: string; date: Date; startTime?: string; endTime?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const event = await prisma.event.create({
    data: {
      title: data.title,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      userId: session.user.id,
    },
  });
  revalidatePath("/app/schedule");
  return event;
}

export async function deleteEvent(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.event.delete({
    where: { id, userId: session.user.id },
  });
  revalidatePath("/app/schedule");
}

// ----------------------------------------------------------------------
// DOCUMENT (FILES) ACTIONS
// ----------------------------------------------------------------------
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

export async function uploadDocument(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate safe filename
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  const filepath = join(uploadDir, filename);

  // Ensure dir exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  await writeFile(filepath, buffer);

  let content = "";
  if (file.type === "application/pdf") {
    try {
      const pdfParse = (await import('pdf-parse') as any).default || (await import('pdf-parse'));
      const data = await pdfParse(buffer);
      content = data.text;
    } catch (e) {
      console.error("PDF Parsing failed", e);
    }
  } else if (file.type.startsWith("text/")) {
    content = buffer.toString('utf-8');
  }

  const doc = await prisma.document.create({
    data: {
      title: file.name,
      fileUrl: `/uploads/${filename}`,
      content: content,
      userId: session.user.id
    }
  });

  revalidatePath("/app/files");
  return { success: true, document: doc };
}

export async function deleteDocument(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const doc = await prisma.document.findUnique({
    where: { id, userId: session.user.id }
  });

  if (!doc) throw new Error("Not found");

  if (doc.fileUrl) {
    const filepath = join(process.cwd(), 'public', doc.fileUrl);
    if (fs.existsSync(filepath)) {
      await unlink(filepath);
    }
  }

  await prisma.document.delete({
    where: { id }
  });

  revalidatePath("/app/files");
}

// ----------------------------------------------------------------------
// AI ACTIONS
// ----------------------------------------------------------------------
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export async function summarizeContent(content: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "AI Summary requires GEMINI_API_KEY in environment variables.";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Tolong buatkan ringkasan (summary) dalam bahasa Indonesia yang padat dan jelas dari teks atau catatan berikut:\n\n${content}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("AI Summarize error", e);
    return "Maaf, gagal membuat ringkasan. Silakan periksa koneksi atau coba lagi nanti.";
  }
}

// ----------------------------------------------------------------------
// COURSE ACTIONS
// ----------------------------------------------------------------------
export async function createCourse(title: string, description: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const course = await prisma.course.create({
    data: {
      title,
      description,
      userId: session.user.id
    }
  });

  revalidatePath("/app/courses");
  return course;
}

export async function deleteCourse(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.course.delete({
    where: { id, userId: session.user.id }
  });

  revalidatePath("/app/courses");
}

// ----------------------------------------------------------------------
// CLASSROOM MOCK INTEGRATION (V3)
// ----------------------------------------------------------------------
export async function syncGoogleClassroom() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Create 3 mock tasks
  const mockTasks = [
    { title: "Tugas Akhir Semester - Matematika", status: "inbox" },
    { title: "Review Makalah Sejarah", status: "inbox" },
    { title: "Baca Jurnal PBO Bab 4", status: "inbox" },
  ];

  for (const t of mockTasks) {
    await prisma.task.create({
      data: {
        title: t.title,
        status: t.status,
        userId: session.user.id
      }
    });
  }

  revalidatePath("/app/tasks");
  return { success: true, count: mockTasks.length };
}

// ----------------------------------------------------------------------
// SMART SCHEDULING (V4)
// ----------------------------------------------------------------------
export async function autoScheduleStudy() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get today's events to find an empty slot
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingEvents = await prisma.event.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  // Simple heuristic: Schedule study at 19:00 - 21:00 if it doesn't conflict
  let startTime = "19:00";
  let endTime = "21:00";

  const conflict = existingEvents.some(ev => {
    return ev.startTime === startTime || ev.endTime === endTime;
  });

  if (conflict) {
    startTime = "21:00";
    endTime = "23:00";
  }

  const created = await prisma.event.create({
    data: {
      title: "Sesi Belajar Fokus (AI Auto-Scheduled)",
      date: new Date(),
      startTime,
      endTime,
      userId: session.user.id
    }
  });

  revalidatePath("/app/schedule");
  return { success: true, count: 1 };
}

// ----------------------------------------------------------------------
// COMMUNITY ACTIONS (V5)
// ----------------------------------------------------------------------
export async function createCommunityPost(title: string, content: string, category: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const post = await prisma.communityPost.create({
    data: {
      title,
      content,
      category,
      userId: session.user.id
    }
  });

  revalidatePath("/app/community");
  return post;
}

export async function deleteCommunityPost(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.communityPost.delete({
    where: { id, userId: session.user.id }
  });

  revalidatePath("/app/community");
}

// ----------------------------------------------------------------------
// FITNESS ACTIONS (V6)
// ----------------------------------------------------------------------
export async function syncStrava() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const stravaAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "strava" }
  });

  if (!stravaAccount || !stravaAccount.access_token) {
    throw new Error("Strava not connected");
  }

  try {
    const res = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=30", {
      headers: {
        Authorization: `Bearer ${stravaAccount.access_token}`
      }
    });

    if (!res.ok) {
      console.error("Strava error", await res.text());
      throw new Error("Failed to fetch from Strava API");
    }

    const activities = await res.json();
    let newCount = 0;

    for (const act of activities) {
      // Prevent duplicates by checking name and date
      const existing = await prisma.activity.findFirst({
        where: {
          userId: session.user.id,
          title: act.name,
          date: new Date(act.start_date)
        }
      });

      if (!existing) {
        await prisma.activity.create({
          data: {
            title: act.name,
            type: act.type,
            duration: Math.round(act.moving_time / 60), // moving_time is in seconds
            calories: act.kilojoules ? Math.round(act.kilojoules * 0.239006) : 0, // rough conversion kJ to kcal if calories not present directly
            date: new Date(act.start_date),
            userId: session.user.id
          }
        });
        newCount++;
      }
    }

    revalidatePath("/app/fitness");
    return { success: true, count: newCount };
  } catch (error) {
    console.error("Error syncing Strava", error);
    return { success: false, count: 0 };
  }
}

// ----------------------------------------------------------------------
// AI CHAT ACTIONS (V7)
// ----------------------------------------------------------------------
export async function askAI(query: string) {
  const session = await auth();
  if (!session?.user?.id) return "Maaf, Anda harus login untuk menggunakan AI.";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "AI Chat requires GEMINI_API_KEY in environment variables.";

  try {
    // 1. Context Retrieval (RAG)
    const [tasks, notes] = await Promise.all([
      prisma.task.findMany({
        where: { userId: session.user.id },
        select: { title: true, status: true, dueDate: true }
      }),
      prisma.note.findMany({
        where: { userId: session.user.id },
        select: { title: true, content: true },
        take: 10,
        orderBy: { updatedAt: "desc" }
      })
    ]);

    const contextText = `
Data Tugas User:
${tasks.map(t => `- ${t.title} (Status: ${t.status}, Due: ${t.dueDate ? t.dueDate.toLocaleDateString() : 'None'})`).join('\n')}

Data Catatan Terbaru User:
${notes.map(n => `Judul: ${n.title}\nKonten Singkat: ${n.content?.substring(0, 200)}...`).join('\n\n')}
`;

    // 2. Generate with Function Calling
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      tools: [{
        functionDeclarations: [
          {
            name: "create_task",
            description: "Buat tugas (task) baru untuk pengguna.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING, description: "Judul tugas" },
                priority: { type: SchemaType.STRING, description: "Prioritas: high, medium, low" }
              },
              required: ["title"]
            }
          },
          {
            name: "create_event",
            description: "Buat jadwal/event di kalender pengguna.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING, description: "Judul kegiatan" },
                startTime: { type: SchemaType.STRING, description: "Waktu mulai (format HH:MM)" },
                endTime: { type: SchemaType.STRING, description: "Waktu selesai (format HH:MM)" }
              },
              required: ["title", "startTime", "endTime"]
            }
          }
        ]
      }]
    });
    
    const prompt = `Sebagai asisten AI NeLK (Personal Academic Assistant), jawablah pertanyaan berikut dengan singkat, informatif, dan membantu.
    
Berikut adalah konteks data pengguna yang relevan:
${contextText}

Pertanyaan User: ${query}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    // Check if AI wants to call a function
    const functionCalls = response.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      
      if (call.name === "create_task") {
        const args = call.args as any;
        await prisma.task.create({
          data: {
            title: args.title,
            status: "todo",
            userId: session.user.id
          }
        });
        revalidatePath("/app/tasks");
        return `Tugas "${args.title}" telah berhasil ditambahkan ke daftarmu!`;
      }
      
      if (call.name === "create_event") {
        const args = call.args as any;
        await prisma.event.create({
          data: {
            title: args.title,
            date: new Date(),
            startTime: args.startTime,
            endTime: args.endTime,
            userId: session.user.id
          }
        });
        revalidatePath("/app/schedule");
        return `Jadwal "${args.title}" dari jam ${args.startTime} hingga ${args.endTime} telah ditambahkan ke kalendermu!`;
      }
    }

    return response.text();
  } catch (e) {
    console.error("AI Chat error", e);
    return "Maaf, gagal memproses permintaan. Silakan periksa koneksi atau coba lagi nanti.";
  }
}

export async function getProactiveInsight() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "Insight AI belum dikonfigurasi.";

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id, status: { not: "done" } },
      select: { title: true, dueDate: true }
    });

    if (tasks.length === 0) return "Semua tugas sudah selesai! Kamu bisa bersantai atau mulai mempelajari hal baru.";

    const contextText = tasks.map(t => `- ${t.title} (Due: ${t.dueDate ? t.dueDate.toLocaleDateString() : 'None'})`).join('\n');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Berikan 1 kalimat singkat (maksimal 150 karakter) berupa insight proaktif atau peringatan halus untuk memotivasi user menyelesaikan tugas-tugas ini:\n${contextText}`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("AI Insight error", e);
    return "Tetap semangat belajar hari ini!";
  }
}

export async function getRandomNoteSummary() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { title: "Insight AI", summary: "Insight AI belum dikonfigurasi dengan API Key." };

  try {
    // Get total count of user's notes
    const count = await prisma.note.count({
      where: { userId: session.user.id }
    });

    if (count === 0) {
      return { 
        title: "Insight AI", 
        summary: "Sepertinya kamu belum memiliki catatan. Mulai buat catatan agar AI bisa memberikan ringkasan materi untukmu!" 
      };
    }

    // Pick a random skip index
    const skip = Math.floor(Math.random() * count);
    const randomNote = await prisma.note.findFirst({
      where: { userId: session.user.id },
      skip: skip
    });

    if (!randomNote) return null;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Berikan 3-4 poin ringkasan yang menarik dan mudah diingat dari materi ini:
    
Judul: ${randomNote.title}
Konten: ${randomNote.content}

Buatlah ringkasan dalam bentuk bullet points pendek.`;

    const result = await model.generateContent(prompt);
    
    return {
      title: randomNote.title,
      summary: result.response.text()
    };
  } catch (e) {
    console.error("Random Note Insight error", e);
    return { title: "Insight AI", summary: "Gagal memuat ringkasan materi. Tetap semangat belajar!" };
  }
}

// ----------------------------------------------------------------------
// GAMIFICATION ACTIONS (V8)
// ----------------------------------------------------------------------
export async function awardXP(amount: number) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { xp: true, level: true }
  });
  
  if (!user) return null;

  const newXp = user.xp + amount;
  // Calculate level (1 level per 1000 XP)
  const newLevel = Math.floor(newXp / 1000) + 1;

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { xp: newXp, level: newLevel }
  });

  return { xp: updatedUser.xp, level: updatedUser.level };
}

export async function getUserProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { xp: true, level: true, contextMode: true, university: true, major: true }
  });
}

// ----------------------------------------------------------------------
// NOTIFICATION & BACKGROUND JOBS (V9)
// ----------------------------------------------------------------------
export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10
  });
}

export async function markNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true }
  });
}

export async function generateTaskReminders() {
  const session = await auth();
  if (!session?.user?.id) return;

  const upcomingTasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      status: { not: "done" },
      dueDate: {
        lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Within 24 hours
      }
    }
  });

  for (const task of upcomingTasks) {
    // Check if notification already exists for this task recently (basic check by message content)
    const existing = await prisma.notification.findFirst({
      where: {
        userId: session.user.id,
        message: { contains: task.title },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          message: `Pengingat: Tugas "${task.title}" sudah dekat tenggat waktunya!`,
          type: "reminder"
        }
      });
    }
  }
}

// ----------------------------------------------------------------------
// CONTEXT & PROFILE ACTIONS (V10)
// ----------------------------------------------------------------------
export async function updateContextMode(mode: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { contextMode: mode }
  });

  revalidatePath("/app");
}

export async function updateUserProfile(data: { university?: string, major?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await prisma.user.update({
    where: { id: session.user.id },
    data
  });
  revalidatePath("/app");
}

export async function getUpcomingTasks() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return await prisma.task.findMany({
    where: { userId: session.user.id, status: { not: "done" } },
    orderBy: { dueDate: 'asc' },
    take: 3
  });
}

export async function getTodaySchedule() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await prisma.event.findMany({
    where: { 
      userId: session.user.id,
      date: { gte: today, lt: tomorrow }
    },
    orderBy: { startTime: 'asc' }
  });
}

export async function getRecentNotes() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    take: 2
  });
}


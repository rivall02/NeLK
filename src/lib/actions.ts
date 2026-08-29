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
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function summarizeContent(content: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "AI Summary requires GEMINI_API_KEY in environment variables.";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

  // Mock auto-schedule based on AI
  const autoEvents = [
    { title: "Review Matematika Bab 3", startTime: "16:00", endTime: "17:30" },
    { title: "Kerjakan Makalah Sejarah", startTime: "19:00", endTime: "21:00" },
  ];

  const createdEvents = [];
  for (const ev of autoEvents) {
    const created = await prisma.event.create({
      data: {
        title: ev.title,
        date: new Date(),
        startTime: ev.startTime,
        endTime: ev.endTime,
        userId: session.user.id
      }
    });
    createdEvents.push(created);
  }

  revalidatePath("/app/schedule");
  return { success: true, count: createdEvents.length };
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

    // 2. Generate
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Sebagai asisten AI NeLK (Personal Academic Assistant), jawablah pertanyaan berikut dengan singkat, informatif, dan membantu.
    
Berikut adalah konteks data pengguna yang relevan:
${contextText}

Pertanyaan User: ${query}`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Berikan 1 kalimat singkat (maksimal 150 karakter) berupa insight proaktif atau peringatan halus untuk memotivasi user menyelesaikan tugas-tugas ini:\n${contextText}`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("AI Insight error", e);
    return "Tetap semangat belajar hari ini!";
  }
}

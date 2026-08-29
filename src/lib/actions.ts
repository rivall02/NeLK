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

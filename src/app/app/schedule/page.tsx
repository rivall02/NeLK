import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ScheduleClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Jadwal - NeLK",
};

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch events from DB
  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
  });

  // Since the existing mock UI uses string dates (like "2026-08-30"), 
  // we'll format the ISO Date to YYYY-MM-DD
  const mappedEvents = events.map((e) => {
    // Format YYYY-MM-DD
    const dateStr = e.date.toISOString().split("T")[0];
    return {
      id: e.id,
      title: e.title,
      time: e.startTime && e.endTime ? `${e.startTime} - ${e.endTime}` : e.startTime || "",
      type: "class" as const, // Default for now
      date: dateStr,
    };
  });

  return <ScheduleClient initialEvents={mappedEvents} />;
}

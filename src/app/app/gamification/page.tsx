import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import GamificationClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Gamifikasi - NeLK",
};

export default async function GamificationPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get current user's profile
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { xp: true, level: true, university: true }
  });

  if (!currentUser) redirect("/login");

  // Get leaderboard (Top 10 users in the same university, or globally if no university)
  const whereClause = currentUser.university ? { university: currentUser.university } : {};
  
  const topUsers = await prisma.user.findMany({
    where: whereClause,
    orderBy: [
      { level: "desc" },
      { xp: "desc" }
    ],
    take: 10,
    select: {
      id: true,
      name: true,
      xp: true,
      level: true,
    }
  });

  return (
    <GamificationClient 
      initialUsers={topUsers} 
      currentUserXp={currentUser.xp} 
      currentUserLevel={currentUser.level} 
    />
  );
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import FitnessClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Kesehatan - NeLK",
};

export default async function FitnessPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const activities = await prisma.activity.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return <FitnessClient initialActivities={activities} />;
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings - NeLK",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      university: true,
      major: true,
    }
  });

  return <SettingsClient initialProfile={profile} />;
}

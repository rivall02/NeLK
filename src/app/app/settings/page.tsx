import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Pengaturan - NeLK",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      university: true,
      major: true,
      language: true,
      timeFormat: true,
      timezone: true,
      privacyProfile: true,
      notificationSettings: true,
      profileImageUrl: true,
      role: true,
      subscriptionPlan: true,
    },
  });

  // Get integration status
  const [googleAccount, stravaAccount] = await Promise.all([
    prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
      select: { access_token: true },
    }),
    prisma.account.findFirst({
      where: { userId: session.user.id, provider: "strava" },
      select: { access_token: true },
    }),
  ]);

  const integrations = {
    googleClassroom: !!googleAccount?.access_token,
    googleDrive: !!googleAccount?.access_token,
    strava: !!stravaAccount?.access_token,
  };

  if (!profile) redirect("/login");

  return (
    <SettingsClient
      initialProfile={profile as any}
      integrations={integrations}
    />
  );
}

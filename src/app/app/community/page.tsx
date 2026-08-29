import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CommunityClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Komunitas - NeLK",
};

export default async function CommunityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch posts from all users (since it's a community)
  const posts = await prisma.communityPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      }
    }
  });

  return <CommunityClient initialPosts={posts} currentUserId={session.user.id} />;
}

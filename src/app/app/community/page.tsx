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

  // Get current user's university and major
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { university: true, major: true }
  });

  // Base filter for community
  const whereClause: any = {};
  if (currentUser?.university) {
    whereClause.user = { university: currentUser.university };
    
    // If we want it to be major-specific as well, uncomment this:
    // if (currentUser?.major) {
    //   whereClause.user.major = currentUser.major;
    // }
  }

  const posts = await prisma.communityPost.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          university: true,
          major: true,
        }
      }
    }
  });

  return <CommunityClient initialPosts={posts} currentUserId={session.user.id} university={currentUser?.university} major={currentUser?.major} />;
}

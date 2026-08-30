import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Webhook verification endpoint (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  // Verify token matches our env variable (or a hardcoded one for now)
  const verifyToken = "NELK_STRAVA_VERIFY";
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK_VERIFIED');
    return NextResponse.json({ "hub.challenge": challenge }, { status: 200 });
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

// Webhook event endpoint (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Strava webhook event received!", body);
    
    // Example body format:
    // {
    //   object_type: 'activity',
    //   object_id: 123456789,
    //   aspect_type: 'create',
    //   owner_id: 9876543,
    //   ...
    // }

    // If it's a new activity creation
    if (body.object_type === 'activity' && body.aspect_type === 'create') {
      const ownerId = body.owner_id; // This is the Strava Athlete ID
      
      // We would normally find the user with this Strava Account ID in Prisma
      // const account = await prisma.account.findFirst({ where: { providerAccountId: String(ownerId) }});
      // if (account) { 
      //   // Award XP for creating an activity!
      //   const user = await prisma.user.update({
      //     where: { id: account.userId },
      //     data: { xp: { increment: 50 } } // 50 XP per Strava Activity!
      //   });
      // }
      console.log(`Will process activity ${body.object_id} for athlete ${ownerId}`);
    }
    
    return NextResponse.json({ message: "EVENT_RECEIVED" }, { status: 200 });
  } catch (e) {
    console.error("Error processing Strava webhook", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

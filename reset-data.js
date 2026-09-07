const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reset() {
  await prisma.task.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.flashcard.deleteMany({});
  await prisma.communityPost.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.studySession.deleteMany({});

  console.log('All data reset except users and accounts');
  await prisma.$disconnect();
}

reset().catch(e => { console.error(e); process.exit(1); });
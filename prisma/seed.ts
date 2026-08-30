import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Bersihkan database (karena User memiliki onDelete: Cascade, data terkait akan ikut terhapus)
  await prisma.user.deleteMany({
    where: { email: 'rhys@test.com' }
  });

  // 2. Buat password rahasia
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. Buat User utama
  const user = await prisma.user.create({
    data: {
      name: 'Rhys',
      email: 'rhys@test.com',
      password: hashedPassword,
      xp: 450,
      level: 4,
      contextMode: 'NORMAL',
    }
  });
  console.log(`👤 Created user: ${user.name} (${user.email})`);

  // 4. Buat Jadwal (Events) untuk Hari Ini
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of today

  await prisma.event.createMany({
    data: [
      { title: 'Basis Data', description: 'Kelas rutin', date: today, startTime: '08:00', endTime: '09:40', userId: user.id },
      { title: 'Kalkulus II', description: 'Kelas rutin', date: today, startTime: '10:00', endTime: '11:40', userId: user.id },
      { title: 'Sesi Belajar — Sorting', description: 'Belajar bareng di perpus', date: today, startTime: '13:00', endTime: '14:30', userId: user.id },
      { title: 'Pemrograman Web', description: 'Kelas rutin', date: today, startTime: '15:00', endTime: '17:00', userId: user.id },
    ]
  });
  console.log('📅 Created todays schedule (Events)');

  // 5. Buat Tugas (Tasks)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 0, 0);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(10, 0, 0, 0);

  await prisma.task.createMany({
    data: [
      { title: 'Tugas Basis Data — ERD Perpustakaan', description: 'Buat desain ERD lengkap', dueDate: tomorrow, status: 'todo', userId: user.id },
      { title: 'Baca Bab 5 — Kalkulus II', description: 'Persiapan kuis', dueDate: dayAfterTomorrow, status: 'in_progress', userId: user.id },
      { title: 'Quiz Pemrograman Web', description: 'Quiz materi Javascript', dueDate: tomorrow, status: 'todo', userId: user.id },
    ]
  });
  console.log('✅ Created upcoming Tasks');

  // 6. Buat Catatan (Notes)
  await prisma.note.createMany({
    data: [
      { title: 'Normalisasi Database', content: 'Normalisasi adalah proses... 1NF, 2NF, 3NF.', userId: user.id },
      { title: 'Quick Sort vs Merge Sort', content: 'Quick sort menggunakan pivot, merge sort menggunakan divide and conquer. Kompleksitas keduanya rata-rata O(n log n).', userId: user.id },
    ]
  });
  console.log('📝 Created Notes');

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

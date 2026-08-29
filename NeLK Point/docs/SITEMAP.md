---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# Sitemap: NeLK

Dokumen ini merupakan satu-satunya sumber acuan kebenaran (Single Source of Truth) untuk rute (routes), halaman (pages), hierarki, dan navigasi produk NeLK. 

*Catatan: Struktur sitemap ini bisa disesuaikan dengan bahasa tampilan (Language Toggle) tanpa mengubah URL slug yang mendasarinya.*

## 1. Area Navigasi Utama (Primary Navigation)
Navigasi utama tidak boleh diganti dengan *motto* produk. Area utama terdiri dari:

- `/home` (Beranda / Command Center)
- `/knowledge` (Pengetahuan & Basis Data Personal)
- `/courses` (Mata Kuliah)
- `/study` (Area Belajar & Kuis)
- `/tasks` (Tugas)
- `/schedule` (Jadwal)
- `/community` (Komunitas Akademik)
- `/growth` (Tujuan, Kebiasaan, Kebugaran)
- `/ai` (Sistem AI Global)
- `/settings` (Pengaturan)

## 2. Struktur Sub-Halaman (Sub-pages Structure)

### `/home`
Dasbor utama personalisasi. Konten berubah secara dinamis (Now, Next, Today).

### `/knowledge`
- `/knowledge/notes` (Catatan)
  - `/knowledge/notes/[id]` (Halaman Editor Catatan)
- `/knowledge/documents` (Dokumen & File)
- `/knowledge/collections` (Koleksi Tersimpan)

### `/courses`
- `/courses/[id]` (Detail Mata Kuliah)
  - `/courses/[id]/materials` (Materi)
  - `/courses/[id]/assignments` (Tugas Kuliah)
  - `/courses/[id]/exams` (Ujian)

### `/study`
- `/study/sessions` (Sesi Belajar)
- `/study/flashcards` (Kartu Flash)
- `/study/quizzes` (Kuis)
- `/study/progress` (Progres Belajar & Weak Topics)

### `/tasks`
- `/tasks/inbox` (Kotak Masuk Tugas)
- `/tasks/planned` (Tugas Direncanakan)
- `/tasks/completed` (Tugas Selesai)
- `/tasks/archive` (Arsip)

### `/schedule`
- Menampilkan pandangan kalender (Harian, Mingguan, Bulanan) untuk *classes, exams, events, study sessions, workouts.*

### `/community`
- `/community/campus` (Lingkup Kampus)
- `/community/faculty` (Lingkup Fakultas)
- `/community/department` (Lingkup Jurusan)
- `/community/course` (Lingkup Kelas)

### `/growth`
- `/growth/goals` (Target Akademik & Personal)
- `/growth/habits` (Kebiasaan)
- `/growth/fitness` (Aktivitas Fisik / Sinkronisasi Strava)

### `/settings`
- `/settings/profile` (Profil Pengguna)
- `/settings/preferences` (Tampilan Tema Gelap/Terang, Bahasa)
- `/settings/integrations` (Hubungkan Google Classroom, Strava, dll)
- `/settings/notifications` (Pengaturan Notifikasi)
- `/settings/ai` (Preferensi Memori AI & Privasi)
- `/settings/security` (Keamanan Akun)

## 3. Ketentuan Mobile
Untuk perangkat *Mobile*, navigasi tidak sekadar memperkecil versi desktop. Menu bawah (*Bottom Tab Bar*) diprioritaskan untuk:
1. Home
2. Study
3. Schedule
4. Notes
5. AI
Modul lainnya dapat diakses melalui tombol menu tambahan.

## 4. Ketentuan Modul Tersembunyi / Komponen Global
- **Command Center:** Dapat dipanggil di mana saja dengan `Ctrl+K` atau `Cmd+K`.
- **Global Search:** Terhubung dengan bar atas atau *Command Center*.
- **Floating AI Assistant:** Komponen asisten cerdas yang muncul di atas konteks (*Contextual AI*).

---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# PRD: Product Requirements Document

Dokumen ini memuat detail fungsional dan non-fungsional untuk proyek NeLK (NextLink).

## 1. Kebutuhan Umum Sistem (General Requirements)
- **Multi-Bahasa (Language Toggle):** Seluruh antarmuka harus mendukung bahasa Indonesia sebagai default, dengan fitur tombol ubah ke bahasa Inggris.
- **Tema Tampilan:** Mendukung kustomisasi *Light Mode*, *Dark Mode*, dan *System Default*.
- **Aksesibilitas (Accessibility):** Mendukung navigasi keyboard, state fokus, screen reader, kontras yang memadai, dan animasi terbatas (reduced motion).
- **Notifikasi Terkendali:** Tidak menghasilkan spam. Notifikasi dibagi menjadi: Critical (misal: Ujian mulai dalam 1 jam), Important, Useful, dan Optional.
- **Transparansi Otomatisasi:** Setiap perubahan yang dilakukan sistem/AI harus jelas bagi pengguna (apa yang berubah, mengapa, dan cara membatalkannya jika diperlukan).

## 2. Area Fitur Utama (Feature Domains)

### A. Home (Command Center)
- **Fungsi:** Dashboard personal pengguna yang merangkum NOW (sekarang), NEXT (selanjutnya), TODAY (hari ini), IMPORTANT (penting), UPCOMING (akan datang), saran AI, dan snapshot progres.
- **Perilaku Sistem:** Menyesuaikan secara kontekstual. Misalnya, saat minggu ujian, blok *study* dan *exam* lebih dominan dibandingkan minggu liburan.

### B. Knowledge & Notes
- **Fungsi:** Sistem manajemen pengetahuan personal (Personal Knowledge System).
- **Jenis Data:** Notes, Documents (PDF, DOCX, PPTX, TXT, Gambar, Link eksternal), Collections, Highlights, Flashcards.
- **Perilaku AI:** AI dapat menjelaskan (Explain), merangkum (Summarize), membuat kuis, atau membuat rangkuman materi dari dokumen. Identitas sumber dokumen asli harus tetap terjaga (Source Provenance).

### C. Courses & Exams
- **Fungsi:** Menyediakan wadah konteks akademik (Mata Kuliah) tempat tersimpannya tugas, materi, dan progres ujian.
- **Exam System:** Menyimpan data waktu, topik, lokasi, materi terkait, dan rencana persiapan (contoh: H-7 Planning, H-1 Final Review).

### D. Study & Adaptive Learning
- **Fungsi:** Area pemanfaatan *Knowledge* untuk sesi belajar (Study Sessions, Quizzes, Flashcards).
- **Adaptive Learning:** AI merekomendasikan bahan ulasan atau latihan berdasarkan riwayat kuis, kesalahan (weak topics), dan ketersediaan waktu. Tidak ada jaminan edukasional mutlak, hanya berdasarkan ketersediaan data.

### E. Task & Schedule (Jadwal & Tugas)
- **Aturan Bisnis Utama:** **Task ≠ Schedule**. Task adalah *apa yang harus dikerjakan*, Schedule adalah *kapan harus dikerjakan*.
- **Task System:** Mencakup prioritas, status (Inbox, Planned, In Progress, Completed), dan tenggat waktu. Dapat bersumber manual, otomatis dari integrasi, atau AI.
- **Scheduling Engine:** Menjadwalkan tugas dengan memperhatikan event *Fixed* (contoh: jadwal kelas baku) dan *Flexible* (contoh: sesi belajar mandiri).
- **Smart Rescheduling:** Jika jadwal fleksibel terlewat, sistem AI mengusulkan waktu alternatif, namun tidak merombak seluruh jadwal secara agresif tanpa konfirmasi.

### F. Community
- **Fungsi:** Jaringan Pengetahuan Akademik berbasis struktur kampus (Fakultas, Jurusan, Kelas), **bukan media sosial**.
- **Perilaku Sistem:** Visibilitas konten *default* adalah **Privat**. Konten dibagikan harus eksplisit dengan perizinan yang jelas (Only Me, Course, Public, dll). Harus mendukung moderasi, pelaporan, dan kepemilikan.

### G. Growth & Fitness (Strava)
- **Fungsi:** Area pendukung gaya hidup sehat dan pembentukan kebiasaan (goals & habits) agar sejalan dengan jadwal akademik.
- **Integrasi Strava:** Menghubungkan jadwal olahraga ke kalender NeLK dengan izin akses minimal.

### H. Fitur Pencarian & Command Center (Ctrl+K / Cmd+K)
- **Global Search:** Melakukan pencarian di Notes, Docs, Tasks, Schedule, Community (pencarian semantik di versi lanjut).
- **Command Action:** Pengguna bisa memerintah aksi pembuatan tugas, catatan, atau meminta analisis dari AI. Aksi destruktif wajib ada konfirmasi.

## 3. Integrasi Eksternal (External Integrations)
Integrasi tidak boleh menjadi navigasi utama, tetapi masuk dalam ranah fungsionalitas pendukung (via Settings > Integrations).
- **Google Classroom:** Autentikasi OAuth dengan hak akses minimal yang didukung API resmi (Course Sync, Material Sync, Assignment Sync).
- **Strava:** Autentikasi dan sinkronisasi aktivitas dengan batas limitasi (Rate limits) API yang resmi.
- Sistem lokal TIDAK menimpa paksa data (source of truth) dari penyedia eksternal tanpa validasi.

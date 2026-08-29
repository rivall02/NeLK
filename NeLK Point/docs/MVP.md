---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# Minimum Viable Product (MVP): NeLK

Dokumen ini mendefinisikan batas lingkup awal perilisan Minimum Viable Product (MVP) dari NeLK. Tujuan MVP adalah **membuktikan nilai inti (core value)**, yakni menyajikan ruang kerja pembelajaran cerdas (AI-powered personal learning workspace), sebelum berekspansi ke modul dan integrasi yang kompleks.

## 1. Objektif & Kriteria Keluar (Exit Criteria)
MVP tidak dirancang untuk memuaskan semua daftar fitur di *Master Prompt*.
**Sasaran Rilis:** 
Aplikasi dasar yang fungsional di mana seorang mahasiswa dapat mendaftar, menulis catatan, mengunggah dokumen, merencanakan tugas ke jadwal, dan mendapatkan bantuan AI untuk memahami catatan/tugasnya.

## 2. Fitur Inti yang Masuk Lingkup (In-Scope for V0 & V0.1)

### A. Fondasi (Foundation - V0)
- **Autentikasi (Auth):** Pendaftaran, Login standar, dan Pengaturan Profil Dasar.
- **Basis Data:** Pembentukan fondasi skema dasar (Pengguna, Tugas, Jadwal, Catatan).
- **Antarmuka Utama (Core UI):** Navigasi responsif berbasis tema *Playful Neo-Editorial* dengan dukungan beralih *Light/Dark Mode* dan pergantian Bahasa (Indonesia/Inggris).
- **Sistem Pengaturan (Settings):** Halaman bagi pengguna untuk mengelola preferensi UI.

### B. Workspace Pembelajaran Awal (Initial Learning Workspace)
- **Notes (Catatan):** Editor dasar yang mendukung penyimpanan (*autosave*) dan pengorganisasian judul catatan.
- **Files/Documents:** Sistem unggah dasar (*basic upload*) untuk dokumen teks atau PDF.
- **Tasks & Basic Schedule:** Fitur untuk mencatat tugas yang akan dikerjakan, menetapkan durasi dan tenggat waktu (*deadline*), serta menempatkannya ke kalender secara manual.

### C. Kecerdasan Dasar (Basic AI)
- AI Text Summarizer (Merangkum Teks) pada catatan.
- Ask AI (Perintah Chat sederhana yang membaca satu konteks dokumen pada satu waktu).

### D. Stabilisasi Sistem (V0.1 Stabilization)
- **Hak Akses & Privasi:** Pematangan fondasi kepemilikan sehingga tidak ada data yang bocor antar pengguna.
- **Search (Pencarian Dasar):** Modul pencarian berbasis kata kunci (*keyword search*).
- **Accessibility & Responsiveness:** Memastikan akses UI nyaman digunakan di Desktop, Tablet, dan Mobile (lewat peramban).

## 3. Fitur yang Tidak Termasuk di MVP (Out of Scope for Initial Release)
Berikut adalah daftar fitur yang ditunda pelaksanaannya untuk versi selanjutnya (Roadmap V1 hingga V10):
- Integrasi Google Classroom & Sinkronisasi API secara real-time (Masuk V3).
- Integrasi Strava / Aktivitas Fisik (Masuk V6).
- Smart Scheduling oleh AI (AI Agent yang memindahkan dan menghitung slot waktu fleksibel) (Masuk V4).
- Fitur Jaringan Komunitas Kampus (Masuk V5).
- Ujian (Exams) & Adaptif Learning yang kompleks (Flashcards otomatis, Weak Topic Detection) (Masuk V2).
- Proactive AI (Notifikasi AI yang tiba-tiba berintervensi saat tugas melenceng).

Dengan batasan ini, tim pengembangan (Framer & Engineering) bisa berfokus menjamin produk stabil, aman, dan berdesain matang sebelum diperluas kecerdasannya.

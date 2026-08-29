---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# Architecture: NeLK

Dokumen ini menjelaskan arsitektur perangkat lunak skala tinggi (*high-level*) dari platform NeLK (NextLink). Tujuan utamanya adalah memastikan skalabilitas, keamanan data pengguna, dan pemisahan logika yang jelas (*separation of concerns*).

## 1. Arsitektur Sistem Umum (System Architecture)
NeLK dirancang menggunakan arsitektur *Client-Server* modern (berbasis web/cloud-native).
Sistem ini dipecah ke dalam beberapa lapisan (Layers):

1. **Presentation Layer (Frontend):** Bertugas mengelola interaksi visual (UI/UX), *Routing*, navigasi (*Language/Theme Toggles*), status komponen (*React State*), dan merender respons AI.
2. **Gateway / API Layer:** Titik masuk utama aplikasi klien. Menangani *Rate Limiting*, validasi token autentikasi, perlindungan titik akhir (endpoint protection), dan pelalaian (*Routing*) lalu lintas data.
3. **Application & Business Logic Layer (Backend):** Mesin utama yang menangani aturan bisnis (misalnya kalkulasi *Smart Scheduling*), sinkronisasi (*Sync Engine*), manajemen pengguna, serta orkestrasi akses ke basis data.
4. **Data & Storage Layer:** Menyimpan data relasional (PostgreSQL), data antrean/*caching* (Redis), data vektor spasial untuk pencarian cerdas (pgvector), serta penyimpanan fisik (Objek S3) untuk dokumen yang diunggah pengguna.

## 2. Arsitektur Kecerdasan Buatan (AI Architecture)
AI pada NeLK didesain secara tertanam (*integrated*), bukan sebagai pembungkus obrolan sederhana (*generic chatbot wrapper*).

**Komponen Engine AI:**
- **Context Engine:** Mesin pemroses yang merangkai pemahaman dari hubungan entitas. Membantu LLM mengerti bahwa istilah "Normalisasi", misalnya, berelasi dengan mata kuliah "Database", "Ujian", dan "Tugas".
- **Global AI:** Lapisan AI pada *Command Center* yang memiliki cakupan izin untuk membaca seluruh konteks yang diperbolehkan (Tugas, Jadwal, Pengetahuan).
- **Contextual AI:** AI "Saku" yang merespons secara spesifik di satu modul, misalnya AI untuk meringkas sebuah dokumen di dalam fitur `Knowledge`.
- **Memory & Retrieval System:** AI dapat memilah data ( Retrieval-Augmented Generation / RAG ) secara privat per pengguna. Fitur Memory yang merekam preferensi jangka panjang dapat dimatikan, dilihat, dan dihapus oleh pengguna.

**Alur Kerja Agen AI (AI Agent Workflow):**
`Understand → Retrieve → Reason → Plan → Ask Permission (jika berisiko/merusak) → Execute → Verify → Report`

## 3. Sinkronisasi Data (Sync Engine)
Infrastruktur sinkronisasi (Google Classroom / Strava) berjalan terpisah dari *thread* utama pengguna:
- **Metode:** Sistem penarikan (*Polling*) berskala menggunakan Background Job Queue (contoh: BullMQ). Menggunakan batas rate (rate limits) yang cerdas dan mencoba ulang otomatis (retries) saat koneksi terputus.
- **Konsep Kebenaran (Source of Truth):** Data pihak ketiga tidak ditimpa oleh data lokal. Jika tugas Google Classroom bergeser tenggat waktunya dari platform asli, sistem lokal hanya menyesuaikan tenggat tersebut di *Task Inbox* pengguna.

## 4. Sistem Notifikasi & Peringatan (Notification Engine)
- Arsitektur berbasis *Event-Driven* (*Pub/Sub*).
- Sebuah "Event" (contoh: *Assignment Due in 12 Hours*) dipancarkan, disaring berdasarkan preferensi jadwal pemberitahuan pengguna, sebelum didorong ke Frontend.
- Menjamin tidak ada notifikasi yang *spam* atau tidak masuk akal (misalnya membunyikan notifikasi tengah malam jika pengguna tidak memintanya).

## 5. Keamanan & Batasan Modul (Security & Boundaries)
- **Zero Cross-User Leakage:** Kueri ke basis data wajib dan mutlak menyertakan pembatasan ID Kepemilikan (*Owner ID*). 
- **AI Data Boundary:** LLM tidak memiliki akses langsung ke *database SQL*. AI hanya berkomunikasi lewat *Tool Calling* yang dibatasi perizinannya sesuai peran pengguna yang sedang berinteraksi.
- **Role-Based Access Control (RBAC):** Struktur izin (Permissions) diterapkan dari level API untuk melindungi akses modul (misalnya Komunitas Privat vs Publik).

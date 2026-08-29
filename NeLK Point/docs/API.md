---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# API Architecture & Endpoints: NeLK

Dokumen ini menjelaskan struktur Application Programming Interface (API) yang mendasari NeLK. Format utama komunikasi menggunakan standar RESTful API dengan JSON.

## 1. Konvensi Umum API
- **Base URL:** `/api/v1/`
- **Autentikasi (Auth):** Menggunakan token Bearer (JWT atau *Session Cookies* yang diamankan).
- **Format Respons Sukses:**
  ```json
  {
    "status": "success",
    "data": { ... }
  }
  ```
- **Format Respons Error:**
  ```json
  {
    "status": "error",
    "code": "ERROR_CODE",
    "message": "Deskripsi masalah yang jelas."
  }
  ```
- **Paginasi:** Diwajibkan pada pengumpulan data besar (misal: Community Posts, daftar Task) menggunakan parameter `?page=1&limit=20` atau sistem *Cursor-based pagination*.

## 2. Struktur Endpoint Utama (Core Endpoints)

### A. Pengguna & Pengaturan (User & Preferences)
- `GET /api/v1/users/me` - Mengambil profil dan preferensi pengguna (termasuk toggle bahasa).
- `PATCH /api/v1/users/preferences` - Memperbarui status tema (Light/Dark mode) dan bahasa (ID/EN).
- `GET /api/v1/integrations` - Melihat status koneksi Google Classroom & Strava.

### B. Manajemen Knowledge & Courses
- `GET /api/v1/courses` - Mendapatkan daftar mata kuliah.
- `POST /api/v1/knowledge/notes` - Membuat catatan baru.
- `POST /api/v1/knowledge/upload` - Endpoint multipart untuk unggah dokumen. Merespons segera (*async*) sementara dokumen di-parsing di latar belakang.

### C. Manajemen Tugas & Jadwal (Task & Schedule)
- `GET /api/v1/tasks` - Menarik daftar tugas yang tertunda. Parameter `?course_id=` dapat digunakan.
- `POST /api/v1/tasks` - Membuat Task (Apa yang dikerjakan).
- `POST /api/v1/schedule/events` - Membuat atau menjadwalkan ke Kalender (Kapan dikerjakan).
- `POST /api/v1/schedule/optimize` - **[AI Endpoint]** Mengirim daftar Task ke AI untuk menghasilkan rekomendasi slot waktu (*Smart Scheduling*).

### D. Interaksi AI (AI Agent & Intelligence)
- `POST /api/v1/ai/ask` - Endpoint obrolan kontekstual. Menerima *prompt* dan ID entitas konteks (misal: `note_id`).
- `POST /api/v1/ai/action` - Eksekusi perintah (Command Center). Jika memicu aksi merusak (contoh: "Hapus jadwal besok"), merespons dengan perlunya konfirmasi (*Require User Confirmation*).
- `POST /api/v1/ai/summarize` - Meminta ringkasan otomatis pada dokumen atau catatan tertentu.

### E. Komunitas & Berbagi (Community)
- `GET /api/v1/community/posts` - Menampilkan catatan/materi yang dipublikasikan (terikat izin/visibilitas fakultas/kampus pengguna).
- `POST /api/v1/community/posts/:id/report` - Endpoint moderasi untuk melaporkan postingan bermasalah.

## 3. Limitasi (Rate Limits)
Setiap endpoint API publik wajib dijaga oleh mekanisme pencegahan *abuse* (Rate Limiting).
- Endpoint Autentikasi: Sangat ketat (contoh: 5 hit/menit).
- Endpoint Standar: Moderat (100 hit/menit).
- Endpoint AI (`/api/v1/ai/*`): Ketat, karena memakan biaya komputasi yang tinggi. Harus mempertimbangkan batasan harian per pengguna (kuota AI).

## 4. Efek Samping (Side Effects)
Setiap aksi API bisa memicu *event* latar belakang. Contoh:
- Memanggil `POST /api/v1/integrations/google-classroom/sync` akan mengembalikan kode status 202 (Accepted). Pemrosesan sinkronisasi (*fetching, mapping, deduplication*) terjadi asinkron di antrean (*background queue*).

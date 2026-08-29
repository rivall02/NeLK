---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# Database Schema & Data Models: NeLK

Dokumen ini mendeskripsikan secara konseptual entitas inti, relasinya, dan pengaturan kepemilikan data pada database operasional (RDBMS) NeLK. Skema teknis (DDL/SQL) akan diturunkan dari struktur ini.

## 1. Prinsip Utama (Core Principles)
- **Kepemilikan Mutlak (User Ownership):** Hampir semua entitas esensial harus memiliki kolom `owner_id`. Data pengguna A tidak boleh bocor ke pengguna B.
- **Keterlacakan Sumber (Source Tracking & Provenance):** Sistem perlu mencatat apakah sebuah data (misal: Task) dibuat secara manual oleh pengguna, dihasilkan oleh AI, atau ditarik dari integrasi eksternal (Classroom/Strava). Harus ada pelacakan `source_id` dan `source_type`.
- **Soft Delete & Lifecycle:** Data penting yang dihapus tidak boleh langsung hilang dari database fisik (hard delete), melainkan menggunakan status `deleted_at` (soft delete) untuk menghindari kehilangan riwayat jika AI tak sengaja terpicu melakukan penghapusan atau integrasi bermasalah.

## 2. Entitas Utama (Core Entities)

### A. Pengguna & Akses (User & Access)
- **Users:** Entitas fundamental (ID, Email, Password Hash, Provider Auth).
- **Profiles:** Metadata pengguna (Nama, Preferensi Bahasa [ID/EN], Preferensi Tampilan [Light/Dark]).
- **Integrations:** Melacak status OAuth Google Classroom, Strava, (Tokens, Scopes, Expiry).

### B. Konteks Akademik (Academic Context)
- **Institutions, Faculties, Departments, Programs:** Metadata dasar hierarki pendidikan untuk fitur "Komunitas".
- **Courses (Mata Kuliah):** `id`, `name`, `owner_id`. Menjadi pusat wadah konteks (*Context Container*).
- **Exams (Ujian):** Bertaut (*Foreign Key*) ke `course_id`. Menyimpan waktu, topik terkait, dan status persiapan.

### C. Pengetahuan & Dokumen (Knowledge System)
- **Notes:** Catatan berbasis teks/blok. Mengandung judul, konten, tag, `course_id`.
- **Documents & Files:** Representasi berkas (PDF, DOCX) dan URL S3. AI akan mengekstrak isinya.
- **Materials:** Penggabungan catatan dan dokumen di bawah payung *Course*.

### D. Manajemen Tugas & Waktu (Task & Schedule)
Sesuai aturan bisnis, **Task ≠ Schedule**.
- **Tasks:** Entitas berisiko daftar pekerjaan (Apa yang harus dilakukan).
  - Kolom: `title`, `deadline`, `status` (Inbox/Planned/Done), `priority`, `duration_estimate`, `course_id` (opsional), `source` (misal: "Classroom").
- **Schedules / Events:** Entitas pemosisian di kalender (Kapan akan dilakukan).
  - Kolom: `start_time`, `end_time`, `event_type` (Fixed vs Flexible).
  - Hubungan: `schedule.task_id` dapat me-referensikan tabel `tasks` (tidak harus, misalnya untuk kelas/kuliah biasa).

### E. Pembelajaran Aktif (Active Learning)
- **Study Sessions:** Aktivitas belajar yang tercatat (Durasi aktual, topik).
- **Quizzes & Flashcards:** Di-generate oleh AI maupun user. Terhubung dengan *Knowledge*.
- **Quiz Attempts:** Riwayat tes untuk dianalisis oleh modul adaptif menjadi penentu kelemahan topik (*Weak Topics*).

### F. Growth, Goals & Community
- **Goals & Habits:** Menyimpan target personal.
- **Fitness Activities (Strava):** Metadata aktivitas lari/olahraga yang terhubung dengan kalender (*Schedule*).
- **Community Posts:** Catatan atau Materi yang secara eksplisit status `visibility`-nya diubah menjadi selain Privat. Wajib menyertakan fitur audit/pelaporan (Reports).

## 3. Relasi Penting (Key Data Relationships)
Konsep mesin pencarian AI pada NeLK sangat bergantung pada grafik relasi ini:
- **Exam** berhubungan erat dengan **Course** -> **Materials** -> **Notes** -> **Quiz History** -> **Study Plan**.
- Jika pengguna meminta AI "Siapkan saya untuk ujian Database", AI menarik kueri relasional dari **Exam** "Database", melacak ke seluruh cabangnya (**Materials** dan histori **Quizzes**), lalu merekomendasikan **Tasks** dan menjadwalkannya di **Schedule**.

## 4. Indeks & Audit Log
- **Indexing:** Pencarian (Teks atau Vektor) diterapkan pada `Notes.content` dan `Documents.extracted_text`.
- **Audit Logs:** Seluruh operasi destruktif (DELETE/UPDATE) yang digerakkan oleh AI harus terekam pada tabel *Audit Log* (Apa yang berubah, berdasarkan persetujuan siapa, dan kapan).

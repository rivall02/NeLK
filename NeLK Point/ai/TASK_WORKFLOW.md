---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# Siklus Kerja Agen AI (Task Workflow): NeLK

Dokumen ini adalah rutinitas wajib (Workflow) bagi Agen Pengembang AI ketika menerima tugas (Tasks) baru pada proyek NeLK. Setiap langkah didesain untuk mencegah kerusakan ekosistem produk yang ada.

## Alur Implementasi Pengembangan (The Development Loop)

Pekerjaan pemrograman signifikan apa pun yang ditugaskan harus melewati alur ini (bukan sekadar menebak dan mengimplementasikan langsung):

### 1. UNDERSTAND (Pahami Prompt)
- Baca master instruksi (`prompt.md`).
- Baca dokumentasi terkait di `/docs/` yang bersinggungan dengan modul target. Jangan memulai apapun sebelum membaca referensi.

### 2. INSPECT (Inspeksi & Teliti)
- Periksa status kode, arsitektur, dan implementasi yang sudah ada di dalam sistem.
- Pahami dependensi yang sedang aktif.

### 3. PLAN (Perencanaan)
- Identifikasi risiko dari permintaan (Apakah ini merusak fitur lain? Apakah ini memaksa sinkronisasi dengan *Google Classroom* untuk berhenti?).
- Cek tabrakan/konflik fungsionalitas.
- Susun rincian *Implementation Plan*.

### 4. VERIFY (Persetujuan & Stop Condition)
- Tinjau apakah instruksi ini melanggar *Business Rules* atau *Security*? Jika iya, **Berhenti dan minta klarifikasi.**
- Berhenti dan minta keputusan jika:
  - Terdapat benturan antara instruksi baru dan arsitektur awal (Arsitektur NeLK).
  - Ketidakpastian koneksi dengan API pihak ketiga.
  - Permintaan mengubah tipe kolom database esensial secara paksa (*Destructive Migration*).

### 5. IMPLEMENT (Implementasi)
- Laksanakan pengerjaan sesuai dengan yang direncanakan di dalam *Scope* batas cakupan.

### 6. TEST (Pengujian)
- Jalankan pengecekan/linting (*Run Tests*) lokal sebelum melapor. Pastikan fungsi dasar tidak tercederai.

### 7. REVIEW (Tinjauan Mandiri)
- Periksa kelengkapan aksesibilitas (Warna *Light/Dark mode*, dan bahasa pada tag antarmuka - pastikan `Toggle Bahasa` berlaku ke komponen baru ini).

### 8. DOCUMENT (Dokumentasikan)
- Mutakhirkan file di dalam `/docs/` dan `/ai/` jika diperlukan sinkronisasi. (*Document Synchronization* wajib dijalankan. Misalnya merubah struktur database maka update juga `DATABASE.md`).

### 9. REPORT (Laporkan Hasil)
- Akhiri dengan merangkum pengerjaan, memberi tahu pengguna tentang pencapaian, serta mendata risiko/keterbatasan yang mungkin tersisa dari iterasi tersebut.

*Ingat prinsip utama pengembangan AI:*
**Do not optimize for fastest code generation.** (Jangan sekadar berlomba menulis *code* secepat-cepatnya tanpa arah. Utamakan kualitas dan keamanan sistem).

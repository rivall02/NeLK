---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# Aturan Penulisan Kode (Coding Rules): NeLK

Dokumen ini merupakan panduan keras yang harus dipatuhi oleh **Agen Pengembang AI (Engineering Agent - seperti Antigravity)** dan kolaborator manusia dalam siklus pengembangan (*software engineering*) proyek NeLK.

## 1. Aturan Modifikasi File (File Boundaries)
- **Jangan memodifikasi file yang tidak relevan.** Pahami batasan lingkup (*Scope*) setiap modul fitur (misal: Jangan menyentuh `Community.tsx` jika tugas yang diberikan adalah perbaikan UI pada `TaskScheduler.ts`).
- Hormati arsitektur yang sudah ada. Jika arsitektur berfungsi baik, **jangan pernah menulis ulang secara diam-diam (Silent Rewrite)** menjadi bentuk *Design Pattern* baru tanpa diskusi.

## 2. Praktik Keamanan Kode (Security Patterns)
- **Zero Secrets Hardcoding:** Dilarang meng-hardcode nilai *API Key*, kata sandi basis data, kunci JWT, dan konfigurasi OAuth dalam bentuk *plain text*. Semua rahasia wajib merujuk ke Variabel Lingkungan (`.env` / *Environment Variables*).
- **Zero Cross-User Access:** Semua *query* basis data harus menyertakan pemeriksaan `owner_id` untuk mencegah eskalasi kebocoran hak istimewa (IDOR).
- **Validasi Ketat:** Validasi setiap parameter input (*Payloads*) pada tingkat API *Controller* sebelum menyentuh lapisan *Business Logic*. Gunakan pustaka validasi (contoh: Zod, Joi) di backend.

## 3. Tipe Antarmuka (Type Safety)
- Gunakan *Type Interfaces* secara disiplin (TypeScript). Tidak diperkenankan menggunakan *fallback type* seperti `any` kecuali pada kasus ekstrem integrasi *library* luar yang sudah sangat usang.

## 4. Penanganan Kesalahan & Pencatatan (Error & Logging)
- Jangan gunakan penanganan kosong (`try { ... } catch (e) {}`). Semua jenis kegagalan *(Errors)* harus direkam dan dikelola (dimasukkan log server / Sentry).
- Jangan memaparkan struktur *Error Stacktrace* dari server ke layar antarmuka (*client-side*).

## 5. Tata Tertib Ketergantungan (Dependencies)
- Jangan mengunduh paket eksternal atau dependensi baru secara acak hanya untuk memecahkan sebuah tugas yang sifatnya *one-liner logic* (misalnya menggunakan pustaka `is-even` daripada mengecek `% 2 === 0`).
- Usahakan sesedikit mungkin beban eksternal demi mempertahankan kecepatan pemuatan antarmuka (*Performance Load*).

## 6. Sinkronisasi Desain (Framer → Code)
- Jika agen membangun aplikasi produksi berdasarkan referensi visual prototipe dari Framer, agen diwajibkan mempertahankan DNA visual (Warna, Tipografi, Spasi, Animasi).
- Namun, agen memiliki tugas melampaui desain visual: Desain Framer tidak boleh direplikasi begitu saja jika itu membahayakan *Responsive Layout*, *Accessibility (WCAG)*, maupun performa pengaliran data produksi. Pastikan implementasinya efisien, logis, dan aksesibel (misal: Tambahkan properti `aria-label` yang mungkin absen dari prototipe visual Framer).

## 7. Komitmen Perubahan (Change Management)
- Tulis komentar deskriptif untuk kode-kode abstrak, dan catat keputusan perubahan teknis (ADR - *Architecture Decision Records*) apabila merombak logika inti dari NeLK (misalnya mengganti alur Scheduler).
- Setiap *pull request* fitur harus melewati pengecekan tes *(Unit & Integration Tests)* sebagaimana didefinisikan dalam `TESTING.md`.

---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# Deployment & Operations: NeLK

Dokumen ini mendeskripsikan siklus rilis dan operasi penggelaran (*deployment*) agar pembaruan perangkat lunak tidak mengganggu akses basis pengguna mahasiswa yang aktif.

## 1. Lingkungan Rilis (Environments)
Manajemen lingkungan dipisahkan secara ketat untuk mencegah manipulasi data yang tidak sengaja.
- **Development (Dev):** Lingkungan uji coba pengembang dengan basis data palsu (*mock data*).
- **Staging:** Lingkungan mirip produksi yang ditujukan untuk proses QA (Quality Assurance) dan pemeriksaan akhir *Version Gates* (Keamanan, UI/UX, Kinerja).
- **Production (Prod):** Lingkungan hidup untuk pengguna. Akses ke lingkungan ini sangat dibatasi secara operasional (Hanya melalui jalur CI/CD resmi).

## 2. CI/CD & Pipeline
- Menggunakan Continuous Integration (CI) untuk secara otomatis menjalankan Unit Test, API Test, dan Linting setiap kali kode disumbangkan ke repositori.
- Continuous Deployment (CD) dengan penggelaran berbasis strategi *Blue-Green* atau *Canary Releases* (meluncurkan versi terbaru hanya ke sebagian kecil pengguna untuk menghindari *downtime* fatal).

## 3. Rahasia Sistem & Variabel Lingkungan (Secrets Management)
- Rahasia krusial (Kredensial API OpenAI, Client Secret Google OAuth, Kunci Database) tidak boleh ditulis langsung ke dalam *source code* (Never Hardcode Secrets).
- Harus menggunakan manajer rahasia yang aman (contoh: *AWS Secrets Manager / Vercel Environment Variables*) dan dienkripsi saat *rest*.

## 4. Manajemen Basis Data & Migrasi
- Migrasi struktur basis data (Schema Migrations) selalu dilakukan dari kode dan bisa ditarik kembali (Rollback) jika menyebabkan *error*.
- Dilarang membuat proses migrasi destruktif (mengubah tipe data secara paksa yang menghilangkan nilai tabel sebelumnya) tanpa mekanisme pencadangan ganda.

## 5. Pemantauan & Tanggap Insiden (Monitoring & Incident Handling)
- **Logs:** Seluruh interaksi fatal API dan aktivitas Agent AI dicatat secara agregat dan tanpa membongkar data sensitif pengguna. Log disimpan selama masa kepatuhan data.
- **Monitoring:** Penggunaan *dashboard* metrik sistem (contoh: Datadog/Sentry) untuk memantau kelambatan akses API (Latency) atau kesalahan di sistem frontend (Browser Crashes).
- **Incident Response:** Jika terdeteksi kebocoran API atau malfungsi Agent AI yang merusak kalender (Level 3 - Act error), ada pedoman penyetopan modul fitur (*kill-switch*) per area fitur untuk memperbaiki cacat tanpa harus mematikan total NeLK.

## 6. Backups & Disaster Recovery
- Salinan cadangan (*Database Backups*) terpusat dieksekusi secara periodik (otomatis setiap malam hari).
- Pemulihan sistem (*Disaster Recovery*) diuji minimal setiap enam bulan untuk memastikan bahwa waktu penyelesaian sistem pulih (*Recovery Time Objective*) memenuhi standar platform tingkat layanan yang diatur pada SLA (Service Level Agreement).

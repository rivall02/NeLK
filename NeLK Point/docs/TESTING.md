---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# Testing Strategy: NeLK

Dokumen ini menggarisbawahi strategi pengujian (*Testing Layers*) yang diterapkan untuk menjamin keandalan platform NeLK, terutama pada bagian-bagian kritis seperti sinkronisasi jadwal, dan respons evaluasi berbasis AI.

## 1. Lingkup Pengujian Standar (Standard Testing Layers)
- **Unit Testing:** Menguji pilar logika kecil yang terisolasi. (Contoh: Menguji fungsi pengubah zona waktu *(timezone converter)* untuk jadwal acara).
- **Integration Testing:** Menguji interaksi antara modul atau dengan API luar yang di-*mock*. (Contoh: Menyimulasikan penerimaan payload *Google Classroom API* dan memastikan tugas tersimpan di tabel lokal).
- **API Testing:** Validasi ketat terhadap input JSON (*Schema Validation*) untuk memastikan tidak ada payload merusak yang diloloskan.
- **Database Testing:** Memeriksa bahwa kendala (*Constraints*) basis data, seperti `ON DELETE CASCADE` atau pengaturan `owner_id`, bekerja dan mencegah tindakan merusak antar pengguna (*cross-user leakage*).

## 2. Pengujian Antarmuka & Interaksi (E2E & UI Testing)
- **End-to-End (E2E) Testing:** Mensimulasikan perjalanan persona pengguna dari pendaftaran (Login), pembuatan Catatan, interaksi Command Center (AI), hingga pengaturan jadwal menggunakan *framework* seperti Cypress atau Playwright.
- **Accessibility Testing:** Memverifikasi UI bisa dioperasikan lewat Screen Reader, mengukur rasio kontras sesuai standar WCAG (khususnya untuk *Light/Dark Mode*), dan keabsahan penggunaan tombol bantu navigasi (Keyboard-only navigation).
- **Performance Testing:** Memastikan sinkronisasi data yang asinkron tidak membuat tab browser melambat (Blocking UI Thread).

## 3. Pengujian Kualitas Kecerdasan Buatan (AI Evaluation)
Ini adalah jenis pengujian yang dikhususkan bagi orkestrasi "AI Agent".
- **Grounding & Source Correctness:** Memvalidasi bahwa saat AI diminta membuat ringkasan dari Dokumen PDF, ia merujuk (*cite*) hanya dokumen tersebut tanpa menyisipkan asumsi tak berdasar.
- **Hallucination Detection:** Uji skenario dengan menyuntikkan dokumen palsu dan pertanyaan menipu. AI dilarang memberikan klaim absolut jika datanya tidak mencukupi (misalnya klaim kelulusan ujian).
- **Context Relevance:** Apakah saran dari *Scheduling Engine* masuk akal? (Contoh uji gagal: AI merekomendasikan sesi belajar di tengah malam padahal preferensi tidur pengguna adalah jam 10 malam).
- **Action Correctness & Permissions:** Pengujian *Red Teaming* ringan untuk mencoba menyuruh AI menghapus kalender tanpa persetujuan (Level 3 - Act). AI **harus** gagal mengeksekusi operasi tersebut dan meminta konfirmasi.

## 4. Pengujian Regresi (Regression Testing)
Mekanisme pengujian ulang setiap ada perilisan fitur baru (contoh dari MVP menuju V1) untuk memastikan perombakan UI atau perubahan skema database tidak merusak fungsionalitas dasar yang sudah stabil. Pengujian ini diotomatiskan dalam siklus CI/CD.

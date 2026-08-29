---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# Security & Privacy Requirements: NeLK

Dokumen ini menjelaskan lapisan pertahanan dan aturan keamanan untuk memastikan data pengguna, sistem, dan pengoperasian AI pada platform NeLK aman dari akses yang tidak sah.

## 1. Lapisan Akses & Autentikasi
- **Autentikasi (Authentication):** Seluruh titik masuk (*endpoints*) kecuali halaman pendaratan (landing) dilindungi oleh protokol autentikasi berbasis JWT (JSON Web Tokens) atau sesi aman (*secure cookies*). Password harus melalui proses hashing yang kuat (misal: bcrypt/Argon2).
- **Keamanan OAuth:** Koneksi Integrasi Google Classroom dan Strava wajib menggunakan protokol OAuth 2.0. Sistem hanya boleh meminta "Izin Akses Minimal" (Least Privilege Scopes) yang dibutuhkan (tidak lebih dari apa yang disetujui pengguna). Token harus disimpan secara terenkripsi dan disegarkan (Token Refresh) sesuai standar platform tersebut.

## 2. Otorisasi & Kepemilikan (Authorization & Ownership)
- **Zero Cross-User Leakage:** Basis data (Database) memberlakukan pemeriksaan ketat berbasis *Row-Level Security* atau pengecekan *Owner ID* di tingkat layanan (Service Layer). Seorang pengguna tidak boleh memiliki rute untuk melihat dokumen, jadwal, atau catatan pengguna lain.
- **RBAC (Role-Based Access Control):** Untuk ranah "Komunitas", pengguna dipisahkan perannya, misal: Pemilik Konten (Content Owner), Anggota Komunitas, Moderator, Administrator. Hanya yang berhak (seperti *Owner*) yang bisa menghapus konten yang sudah di-publish.

## 3. Keamanan File & Data (File & Data Security)
- **Validasi Input:** Seluruh input formulir dan *Command Center* harus divalidasi dan dibersihkan (*sanitized*) dari skrip jahat (XSS, SQL Injection).
- **Pengamanan Unggah Berkas (Secure File Upload):** Mengunggah dokumen (Uploads) harus dibatasi ukurannya. Sistem hanya menerima tipe berkas aman (PDF, DOCX, TXT). Berkas berbahaya (seperti `.exe` atau skrip makro) harus ditolak langsung dari sisi klien maupun server.
- **Enkripsi:** Informasi sensitif di dalam basis data (seperti Access Token Strava/Google) wajib dienkripsi (Encrypted at rest).

## 4. Pertahanan Integrasi Artificial Intelligence (AI Security)
Keberadaan "LLM" dan "Agen AI" memperkenalkan lapisan serangan baru (*Prompt Injection*) yang harus dimitigasi.
- **Data Boundary Enforcement:** AI tidak memiliki akses langsung untuk menimpa aturan hak istimewa (bypassing permissions). Akses baca/tulis AI diisolasi berdasarkan konteks login pengguna yang bersangkutan.
- **Proteksi Prompt Injection:** Harus ada metode di tingkat *System Prompt* atau lapisan tambahan untuk menolak arahan pengguna yang mencoba memaksa AI menghapus seluruh data sistem atau mencoba mengakses rahasia sistem (*System Secrets*).
- **Isolasi Konteks (Context Isolation):** Dokumen eksternal yang diunggah pengguna (misalnya PDF bajakan yang berisi perintah peretasan sembunyi-sembunyi) harus diperlakukan sebagai **Input Tak Terpercaya** (*Untrusted Input*). AI tidak boleh menjalankan perintah apa pun yang ada di dalam berkas dokumen tanpa memisahkan bahwa itu hanyalah referensi untuk dirangkum.

## 5. Audit dan Pemulihan (Audit & Recovery)
- **Tingkat Penghapusan (Deletion):** Pengguna berhak meminta penghapusan akun beserta semua datanya, sesuai aturan kepatuhan privasi (GDPR/setara). Penghapusan harus tuntas (Data Export/Deletion).
- **Rate Limiting & Anti-Spam:** Mencegah serangan *Brute Force* login atau *DDoS* sederhana dengan membatasi percobaan panggilan API berlebihan dari IP yang sama.
- **Audit Logs:** Transaksi level tinggi (perubahan *Visibility* konten komunitas, modifikasi jadwal esensial secara masif oleh AI) direkam log-nya untuk mempermudah deteksi insiden (*Incident Response*).

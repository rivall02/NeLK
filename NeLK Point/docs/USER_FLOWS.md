---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# User Flows: NeLK

Dokumen ini mendeskripsikan alur interaksi pengguna dengan sistem NeLK. Model utama yang digunakan adalah: `User → Action → System → Decision → Result`.

## 1. Autentikasi dan Onboarding
**Tujuan:** Memperkenalkan konsep dan mengonfigurasi pengaturan awal pengguna.
- **User:** Membuka aplikasi web.
- **System:** Menampilkan layar Login/Register (mendukung SSO / Google Auth).
- **User:** Melakukan autentikasi dan masuk pertama kali.
- **System:** Menampilkan flow Onboarding (preferensi bahasa: Indonesia/Inggris, preferensi tema, sinkronisasi awal integrasi jika diinginkan).
- **Result:** Dashboard (Home) disiapkan sesuai profil pengguna.

## 2. Integrasi Google Classroom
**Tujuan:** Menarik data akademik ke dalam NeLK.
- **User:** Menuju menu `Settings > Integrations > Google Classroom` lalu klik "Connect".
- **System:** Mengarahkan ke Google OAuth Consent Screen dengan izin akses minimal.
- **User:** Mengizinkan (*Authorize*).
- **System:** Menarik data (Course Sync, Assignment Sync, Material Sync) dan memetakannya (*mapping*) ke struktur lokal (Courses, Tasks, Knowledge).
- **Result:** Tugas dari Classroom kini masuk ke *Inbox* Task pengguna, dan bahan bacaan masuk ke Knowledge Base.

## 3. AI Document Intelligence & Study
**Tujuan:** Mengolah dokumen mentah menjadi sesi belajar cerdas.
- **User:** Mengunggah file (PDF/DOCX) ke folder `Knowledge` di dalam suatu `Course`.
- **System:** Memvalidasi, menyimpan, lalu AI memproses (ekstraksi poin, indexing) sambil mempertahankan informasi sumber asli (*Source Provenance*).
- **User:** Menggunakan perintah "Generate Quiz" atau "Explain This" pada dokumen tersebut.
- **System:** AI membuat konteks berdasarkan isi dokumen dan menghasilkan *Flashcards* atau ringkasan materi.
- **Result:** Pengguna dapat memulai *Study Session* (Sesi Belajar) berdasarkan rekomendasi AI.

## 4. Smart Scheduling (Manajemen Tugas vs Jadwal)
**Tujuan:** Memindahkan *Task* (Apa yang dikerjakan) ke *Schedule* (Kapan dikerjakan).
- **User:** Memiliki tugas "Tugas Database" (Durasi estimasi: 90 menit, Tenggat: Jumat).
- **System:** Mendeteksi tugas tersebut belum memiliki jadwal eksekusi.
- **System (AI Scheduler):** Mengecek jadwal kelas (Fixed Event), kebiasaan rutinitas, waktu luang (Tersedia hari Selasa 19:00, Rabu 20:00).
- **System:** Mengusulkan alokasi jadwal: Selasa 19:00 - 20:30.
- **User:** Menyetujui (*Accept*), menolak (*Reject*), atau mengedit.
- **Result:** Jika disetujui, event masuk ke jadwal dan pengingat (Reminder) diaktifkan. 

## 5. Rescheduling Otomatis (Smart Rescheduling)
**Tujuan:** Menangani aktivitas terjadwal yang terlewat.
- **System:** Mendeteksi pengguna melewatkan sesi belajar yang dijadwalkan secara fleksibel (missed event).
- **System:** Mencari celah waktu berikutnya yang masih memenuhi tenggat waktu (*deadline*).
- **System:** Memberikan notifikasi proaktif: "Anda melewatkan 2 sesi belajar Database. Saya menemukan jadwal kosong selama 60 menit besok pagi. Jadwalkan ulang?"
- **User:** Menerima usulan.
- **Result:** Jadwal baru diperbarui.

## 6. Berbagi di Komunitas (Community Sharing)
**Tujuan:** Membagi catatan atau materi ke lingkungan institusi/fakultas.
- **User:** Memilih sebuah catatan kuliah dan mengubah properti *Visibility*.
- **System:** Menampilkan opsi (Hanya Saya, Publik, Jurusan, Kelas). Default selalu Privat.
- **User:** Memilih "Kelas".
- **System:** Mengubah status akses. Orang lain di jurusan dan kelas yang sama dapat menemukannya di tab Komunitas.
- **Result:** Catatan dapat dilihat, dikomentari, (atau dilaporkan jika melanggar ketentuan moderasi).

## 7. Global Search & Command Center (Ctrl+K)
**Tujuan:** Menavigasi dan mengeksekusi dengan cepat.
- **User:** Menekan `Ctrl + K` (atau `Cmd + K`).
- **System:** Memunculkan modal pencarian.
- **User:** Mengetik "Buat catatan Normalisasi".
- **System:** Menafsirkan perintah (*natural-language command*), menawarkan aksi pembuatan *Note* dengan judul tersebut dan terhubung dengan *Course* Database jika AI menemukan konteks.
- **Result:** Catatan baru dibuat.

## 8. Penanganan Error & Sinkronisasi Gagal
**Tujuan:** Alur pemulihan jika integrasi terputus.
- **System:** Gagal memperbarui data dari Strava atau Google Classroom karena token kedaluwarsa.
- **System:** Menampilkan notifikasi "Peringatan Penting" kepada pengguna, meminta *Re-authorize*.
- **User:** Melakukan koneksi ulang melalui Settings.
- **Result:** Sinkronisasi inkremental berjalan, data terbaru masuk.

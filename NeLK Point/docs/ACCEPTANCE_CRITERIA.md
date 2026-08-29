---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# Acceptance Criteria: NeLK

Dokumen ini mendefinisikan standar Kriteria Penerimaan (*Acceptance Criteria*) berbasis format "Given-When-Then" untuk membantu QA (Quality Assurance) mengukur keberhasilan fitur, sekaligus mengatur standar minimal perilaku aksesibilitas dan responsivitas.

## 1. Standar Penulisan Kriteria
Format Kriteria:
- **Given:** (Diberikan) Kondisi awal atau status pengguna/sistem saat ini.
- **When:** (Ketika) Sebuah aksi spesifik atau pemicu dijalankan oleh pengguna/sistem.
- **Then:** (Maka) Hasil yang terobservasi dan diharapkan.

## 2. Contoh: Multi-Language & Theme Toggle
- **Given** Pengguna berada di halaman Home dalam mode bahasa Indonesia.
- **When** Pengguna mengklik tombol "Toggle Bahasa Inggris".
- **Then** Seluruh elemen teks statis di UI berubah menjadi Bahasa Inggris dan tata letak tidak terpotong (rusak) karena perbedaan panjang kata. Preferensi bahasa ini tersimpan di sesi (*cookies/localstorage/DB*).

- **Given** Pengguna berada di mode *Light Mode*.
- **When** Pengguna mengubah pengaturan ke *Dark Mode*.
- **Then** Palet warna latar belakang berubah dari `#F7F9FC` menjadi varian *Deep Navy*, dan warna teks menyesuaikan rasio kontras yang nyaman untuk dibaca.

## 3. Contoh: Smart Scheduling & Task
- **Given** Sebuah tugas "Bikin Makalah" masuk dengan tenggat waktu hari Jumat jam 23.59 dan durasi 120 menit.
- **When** Pengguna meminta AI menjadwalkan tugas.
- **Then** AI memeriksa ketersediaan slot 120 menit sebelum batas waktu Jumat. AI memunculkan usulan *"Rabu, 15:00 - 17:00"*. (Hanya usulan, belum ditulis ke kalender).
- **Given** AI telah mengusulkan jadwal "Rabu, 15:00 - 17:00".
- **When** Pengguna menekan tombol "Setujui" (Accept).
- **Then** Event jadwal dibuat ke *Schedule* dan antrean pengingat (*reminder queue*) diaktifkan.

## 4. Kriteria Kelulusan Perilaku AI (AI Behavior)
- **Batasan Izin (Permissioning):** 
  - *Given* pengguna A bukan admin atau pemilik konten.
  - *When* AI menerima perintah alami: "Hapus jadwal Budi".
  - *Then* AI merespons dengan kesalahan otorisasi, "Anda tidak memiliki izin".
- **Integritas Sumber Dokumen:**
  - *Given* pengguna mengunggah dokumen referensi (PDF) berjudul "Sejarah Indonesia".
  - *When* pengguna bertanya kepada AI: "Apa kesimpulan dari dokumen ini?"
  - *Then* AI menjawab dengan mengambil konteks *hanya* dari dokumen yang diunggah, serta menyematkan sumber ("Dikutip dari: Sejarah Indonesia, Hal. 4").

## 5. Aksesibilitas (Accessibility) & Edge Cases
- **Akses Keyboard (Accessibility):** Semua aksi tombol (*button*), tautan (*link*), dan kolom input (*input field*) dapat difokuskan (highlighted) hanya menggunakan tombol [TAB], dan dapat diklik dengan tombol [ENTER].
- **Responsivitas (Responsiveness):** UI *Command Center* tetap terbaca saat dipanggil menggunakan peramban telepon pintar berukuran layar 320px.
- **Penanganan Kesalahan (Failure):** Jika server API eksternal (Strava/Classroom) terputus saat Sinkronisasi, UI memberikan pesan kesalahan ramah "Sedang tidak dapat menyinkronkan data, mencoba kembali nanti" tanpa membuat aplikasi *crash*.

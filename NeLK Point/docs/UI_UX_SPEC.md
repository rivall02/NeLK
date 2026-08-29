---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# UI/UX Specifications: NeLK

Dokumen ini mendefinisikan prinsip-prinsip User Experience (UX), perilaku interaksi pengguna, navigasi, dan tata letak untuk pengembangan visual NeLK.

## 1. Prinsip UX & Pengalaman Produk
- **Sederhana Namun Berdaya (Simple yet Powerful):** UX harus sederhana meskipun sistem di baliknya sangat kompleks. Sembunyikan kerumitan fitur dari lapisan pertama UI.
- **Terkendali (User Control):** Sistem atau AI tidak boleh mengambil alih keputusan tanpa persetujuan, terutama yang bersifat merusak (hapus/ubah paksa jadwal penting).
- **Menenangkan namun Hidup (Calm but Alive):** Produk harus merespons (*responsive*), memukau saat digunakan, namun tidak membanjiri pengguna dengan informasi atau gerakan yang membingungkan.
- **Transisi Antar Bahasa (Language Toggle):** Perubahan bahasa (Indonesia/Inggris) harus ter-handle dengan luwes tanpa merusak tata letak elemen (button/padding memanjang atau memendek).
- **Tema Bebas Gangguan:** Transisi antara *Light Mode* dan *Dark Mode* harus terasa halus.

## 2. Ketentuan Navigasi (Navigational Behavior)
- **Desktop:** Sidebar kiri untuk navigasi modul, konten luas di tengah, dan (opsional) side-panel tambahan di kanan untuk interaksi Contextual AI.
- **Tablet:** Menggunakan Sidebar yang dapat ditarik (*collapsible*) atau navigasi bawah (*bottom bar*) bergantung pada orientasi (Portrait/Landscape).
- **Mobile:** Prioritas utama aksesibilitas. Tab bawah menampung rute inti: Home, Study, Schedule, Notes, AI. Fitur lainnya bisa diakses via sub-menu. Fokus interaksi mobile pada: akses cepat, penjadwalan, belajar, dan AI.

## 3. UI States & Feedback Interaksi
Setiap aksi penting harus disertai dengan umpan balik visual (*feedback*):
- **Menyimpan (Save):** Indikator "Menyimpan..." (Saving...) kemudian menjadi "Tersimpan" (Saved).
- **Sinkronisasi (Sync):** Indikator *Loading Spinner* kecil saat menarik data dari luar. Menampilkan notifikasi sukses atau error jika gagal.
- **Perilaku AI:**
  - *Idle* (Diam menunggu).
  - *Thinking* (Memikirkan respons).
  - *Analyzing/Retrieving* (Mencari konteks di latar belakang).
  - *Planning* (Mengusulkan tindakan untuk disetujui).
  - *Completed* (Tugas AI selesai).
  - Jangan gunakan animasi "Loading..." generik. Gunakan teks deskriptif yang sesuai konteks.
- **Tugas (Tasks):** Efek silang/centang yang memuaskan ketika tugas ditandai selesai.

## 4. Aksesibilitas (Accessibility)
Fitur aksesibilitas adalah keharusan, bukan opsional:
- **Navigasi Keyboard:** Dapat mengoperasikan elemen interaktif tanpa mouse. Mendukung status *Fokus* (Focus rings) pada tombol atau input.
- **Hierarki Semantik:** Penggunaan Tag H1, H2, hingga paragraf secara tepat untuk Screen Reader.
- **Pengurangan Gerak (Reduced Motion):** Jika sistem mendeteksi pengaturan sistem operasi meminta pengurangan gerakan, matikan animasi *parallax* dan *staggered*, ubah menjadi transisi *fade-in* yang halus.
- **Kontras (Contrast):** Memastikan warna *font* dengan warna latar belakang mematuhi rasio standar yang nyaman, terutama di *Dark Mode*.

## 5. Produktivitas Tanpa Ketergantungan (Anti-Manipulation UX)
- **Hindari Pola Adiksi:** Sistem didesain untuk membiarkan pengguna menyelesaikan pekerjaan mereka lalu pergi. Tidak ada mekanisme "gulir tanpa batas" (infinite scroll) bergaya media sosial di ranah Komunitas.
- **Gamifikasi Halus:** Gunakan metrik penguatan positif seperti kemajuan (progress), penguasaan (mastery), atau capaian harian (streak). Hindari lootbox, hadiah mata uang virtual yang rumit, atau paksaan yang manipulatif.

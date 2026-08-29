---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# Business Rules: NeLK

Dokumen ini menjabarkan aturan bisnis wajib (*strict business rules*) yang menentukan bagaimana logika internal platform NeLK berjalan. Aturan ini sangat penting agar tidak ada kebingungan fungsional, terutama pada otomatisasi AI.

## 1. Aturan Manajemen Tugas & Jadwal (Task vs Schedule)
Ketentuan paling fundamental dalam NeLK: **Tugas tidak sama dengan Jadwal.**
- **Task (Tugas):** Adalah daftar pekerjaan (Apa yang harus dilakukan). Boleh tidak memiliki slot waktu (*unscheduled*).
- **Schedule (Jadwal):** Adalah representasi pada dimensi waktu (Kapan pekerjaan itu dilakukan).
- Tugas bisa memiliki properti `estimasi_waktu` (misal: 60 menit) dan `deadline` (tenggat). *Schedule* lah yang menempatkan 60 menit tersebut ke dalam hari Selasa pukul 19.00.

## 2. Aturan Fixed vs Flexible Schedule
- **Fixed Event (Tetap):** Acara yang waktunya kaku, seperti jam masuk kuliah atau ujian. *AI Scheduler* dan *Smart Rescheduling* **TIDAK BOLEH** memindahkan atau memodifikasi jadwal ini secara otomatis.
- **Flexible Event (Fleksibel):** Acara seperti sesi belajar mandiri atau jadwal mengerjakan PR. Jika pengguna melewatkan acara ini, AI boleh merekomendasikan penjadwalan ulang (*Reschedule*) ke waktu lain sebelum batas *deadline*.

## 3. Aturan Kebenaran Sumber (Source of Truth)
- **Prioritas Integrasi Eksternal:** Untuk data yang diimpor (Google Classroom, Strava), *platform eksternal tetap menjadi Source of Truth.*
- Jika tugas di Google Classroom diundur tenggat waktunya oleh dosen dari platform asli, sistem NeLK harus memperbaruinya sesuai sistem asal (setelah sinkronisasi). Data lokal tidak boleh memaksa menimpa (*overwrite*) data eksternal, kecuali ada integrasi dua arah yang disepakati.

## 4. Aturan Otomatisasi & Persetujuan AI (AI Permissions)
Sistem NeLK memiliki 3 Level Aksi AI:
1. **Level 1 (Inform - Menginformasikan):** AI sekadar memberi informasi. (Otomatis tanpa konfirmasi).
2. **Level 2 (Suggest - Merekomendasikan):** AI menyusun rencana belajar. (Butuh Persetujuan Pengguna untuk merubahnya menjadi kenyataan di kalender).
3. **Level 3 (Act - Bertindak):** Tindakan yang mengubah data. Untuk penghapusan data penting (Destructive Operations), **wajib meminta konfirmasi eksplisit dari pengguna.** Tidak boleh ada pembatalan diam-diam tanpa riwayat.

## 5. Aturan Berbagi dan Privasi Komunitas (Community Sharing)
- Status bawaan (*default*) untuk semua *Notes*, *Documents*, dan *Tasks* yang dibuat oleh pengguna adalah **PRIVAT**.
- Konten tidak boleh secara tak sengaja atau otomatis dibagikan ke publik atau komunitas, sekecil apapun ruang lingkupnya, kecuali pengguna yang melakukan aksi pengubahan opsi (Visibility) ke publik/institusi.
- Konten privat milik pengguna **TIDAK BOLEH** dilatih atau dimanfaatkan sebagai memori pelatihan global untuk pengguna lain (Zero Cross-User Leakage).

## 6. Aturan Evaluasi Ujian & Kemajuan Belajar (Progress)
- AI tidak diperkenankan memberikan klaim validitas edukasi yang absolut (contoh: "Pasti keluar di ujian" atau "Anda dijamin lulus 100%").
- AI berfungsi memandu berdasarkan data yang ada (contoh: "Berdasarkan riwayat kuis, Anda lemah di topik Normalisasi. Sebaiknya ulas kembali catatan ini").

## 7. Aturan Gamifikasi
- Gamifikasi harus sebatas umpan balik (feedback) positif untuk penguatan kebiasaan yang baik (misal: "Streak belajar terjaga selama 5 hari", "Anda berhasil memenuhi target").
- Dilarang keras menggunakan metode manipulatif gaya media sosial (tidak ada lootbox, desain "tarik untuk perbarui/infinite scroll", atau membanjiri notifikasi buatan agar pengguna membuka aplikasi tanpa tujuan).

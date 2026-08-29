---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# Design System: NeLK

Dokumen ini memuat panduan gaya visual, tipografi, palet warna, gerak (motion), serta prinsip desain (design direction) untuk platform NeLK.

## 1. Arahan Visual (Design Direction)
- **Tema Utama:** Playful Neo-Editorial + Interactive Motion.
- **Kesan Produk:** Moderen, berjiwa muda (*youthful*), cerdas, tenang (*calm*), dan premium.
- **Karakter Antarmuka (Core UI):** Soft Modern. Bersih, mudah dibaca, dan tidak penuh sesak (hindari *excessive density*).
- **Halaman Pendaratan (Landing Page):** Boleh lebih eksperimental dan ekspresif. Menggunakan tipografi besar bergaya majalah (*editorial layout*), ilustrasi kreatif/doodles, komposisi dinamis, serta efek 3D terbatas.

## 2. Palet Warna (Color Direction)

### Mode Terang (Light Mode)
- **Base Background:** `#F7F9FC` (Biru kelabu sangat muda).
- **Surface (Komponen/Card):** `#FFFFFF` (Putih murni).
- **Text (Teks Utama):** `#172033` (Navy pekat kehitaman).
- **Primary Color:** Soft / Electric Blue.
- **AI Identity Color:** Ungu (Purple) dengan semburat *soft glow*.
- **Aksen (Selective Accents):** Lime, Pink, Yellow. Digunakan sangat jarang (hanya untuk penanda status, tag, atau label). Jangan menumpuk warna aksen dalam satu tampilan antarmuka.

### Mode Gelap (Dark Mode)
Wajib dirancang dengan intensionalitas, bukan kebalikan (invert) sederhana.
- **Base Background:** Deep Navy (Biru tua pekat).
- **Surface:** Dark Surfaces.
- **Primary & AI:** Tetap menggunakan Electric Blue dan Purple agar konsisten.

## 3. Tipografi (Typography)
- **Antarmuka Utama (UI Fonts):** Direkomendasikan menggunakan *Plus Jakarta Sans* atau *Geist*. Mengutamakan tingkat keterbacaan (readability) pada layar berbagai ukuran.
- **Display Typography:** Boleh menggunakan *font display* serif atau neo-brutalist secara eksklusif untuk kampanye pemasaran atau bagian *hero* di halaman Landing, bukan pada antarmuka aplikasi.

## 4. Skala Ruang (Spacing) & Sudut (Radius)
Sistem menggunakan skala berbasis kelipatan 4px: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`.
Gunakan *whitespace* atau ruang kosong secara berlimpah.

**Radius (Pembulatan Sudut):**
- Small: `8px`
- Medium: `12px` (Standar tombol/input)
- Large: `16px` (Card)
- XL: `20px` (Modal besar)
- Pill: `999px` (Jangan gunakan secara berlebihan, hanya untuk chip/badge).

## 5. Efek Bayangan (Shadows) & Elevasi
Hindari bayangan tebal (heavy shadows). Gunakan perbedaan latar belakang atau garis tepi (*border*) ringan untuk memisahkan konten. 
Elevasi bayangan halus (subtle drop shadow) hanya digunakan untuk komponen yang "melayang" (floating): *Dropdowns, Modals, Popovers, Floating AI Assistant, dan Command Center*.

## 6. Sistem Gerak (Motion System)
Animasi dan transisi adalah elemen *first-class* namun dengan pendekatan terukur.
- **Micro (Feedback Instan):** 100 - 150ms (Contoh: hover tombol).
- **Standard (Transisi Elemen):** 200 - 300ms (Contoh: buka modal).
- **Feature (Interaksi Kompleks):** 300 - 450ms (Contoh: membuka panel AI).
- **Celebration (Perayaan):** 500 - 800ms (Contoh: Task tuntas).

**Teknik Transisi yang Diperbolehkan:**
- Fade (Muncul bertahap)
- Slide (Pergeseran sumbu X/Y halus)
- Small Scale (Pembesaran/pengecilan ringan seperti efek per (*spring*))
- Stagger (Elemen muncul berurutan)
- Blur transition

**Hindari:** Efek memantul berlebihan, parallax ekstrim, zoom mencolok, dan *spinning* yang terus-menerus.

## 7. Identitas Visual AI (AI Visual Language)
AI bukanlah karakter "Robot Kartun" generik. Representasi visual AI harus terasa membumi, cerdas, abstrak namun bisa diraih (approachable).
Gunakan kombinasi warna Biru dan Ungu, gradien halus (*soft gradients*), serta efek *pulse* (denyut) ringan sebagai tanda sistem sedang bekerja (*Thinking/Processing*).

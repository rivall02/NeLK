---
Status: FINAL
Version: 1.0
Last Updated: 2026-08-29
---

# Tech Stack: Rekomendasi Teknologi NeLK

Dokumen ini mendeskripsikan usulan dan aturan pemilihan teknologi untuk platform NeLK. Teknologi tidak boleh dikunci secara absolut tanpa alasan. Keputusan teknis harus mengikuti arahan produk dan kebutuhan arsitektur.

## 1. Frontend & Client Application
- **Stack Utama:** Next.js (React) atau setara (misal: SvelteKit / Vue Nuxt.js) jika kecepatan dan modularitas lebih baik. Next.js direkomendasikan untuk Server-Side Rendering (SSR) demi SEO di Halaman Pendaratan (Landing) dan keandalan sistem perutean (Routing).
- **Styling:** CSS Modular / TailwindCSS (atau sistem *utility-first* sejenis) dipasangkan dengan librari UI *headless* (seperti Radix UI atau Framer Motion) untuk mencapai standar animasi (Motion System) yang presisi.
- **Tujuan Pemilihan:** Ekosistem kuat, dukungan multi-bahasa (i18n) dan *theme provider* (*Dark/Light Mode*) mudah diimplementasikan, serta kapabilitas performa yang tinggi.

## 2. Backend & API Layer
- **Bahasa/Framework Utama:** Node.js (Express / NestJS) atau Go / Python jika dibutuhkan skalabilitas pengolahan dokumen secara konkuren.
- **Format Komunikasi API:** RESTful API untuk endpoint standar. Penggunaan GraphQL opsional jika ada kebutuhan pengambilan relasi data yang sangat spesifik dan kompleks dari klien (contoh: memanggil Exam yang merelasikan Course, Tasks, dan Study).
- **Pertimbangan Integrasi:** Backend harus kuat menangani siklus sinkronisasi latar belakang (*background sync engine*) untuk melayani API eksternal (Google Classroom & Strava) dengan sistem manajemen *Rate Limit*.

## 3. Database & Caching
- **Basis Data Utama (Relasional):** PostgreSQL direkomendasikan karena integritas transaksionalnya kuat dan kapabilitas dukungan *Vector Extension (pgvector)*. Sangat cocok untuk mengelola relasi kompleks (Entitas User, Course, Exam, Task).
- **Caching & Antrean (Queues):** Redis. Digunakan untuk sistem *rate-limiting*, pengelolaan sesi (*session management*), antrean pekerjaan (*job queues* untuk notifikasi atau pengolahan dokumen berat oleh AI).
- **Penyimpanan Dokumen (File Storage):** AWS S3 atau alternatif setara (Google Cloud Storage / Cloudflare R2) untuk menyimpan berkas PDF, DOCX, dsb, yang diunggah pengguna, dengan mekanisme pembatasan akses (*Pre-signed URLs*).

## 4. Artificial Intelligence (AI) & Intelligence Layer
- **Large Language Model (LLM):** Integrasi API dari provider unggulan (misal: OpenAI GPT-4o / Anthropic Claude / Google Gemini Pro).
- **Embeddings & Vector Store:** Menggunakan PostgreSQL (pgvector) atau milvus/pinecone jika volume teks untuk diindeks sangat besar, mendukung *Semantic Search* dan *Context Engine*.
- **Agent Framework:** LangChain atau LlamaIndex (atau solusi in-house spesifik) untuk membangun orkestrasi "AI Agent" yang harus melalui langkah *Retrieve -> Reason -> Plan -> Execute*.
- **Batasan:** AI tidak memegang peran sebagai basis data produksi atau backend logik primer. AI adalah lapisan pemahaman (*intelligence layer*).

## 5. Sinkronisasi (Sync Engine) & Cron Jobs
- **Worker / Background Jobs:** Membutuhkan sistem eksekusi antrean yang reliabel (misalnya BullMQ di Node.js atau Celery di Python). Hal ini penting untuk menarik data Google Classroom dan Strava tanpa mengganggu performa respons permintaan HTTP pengguna.

## 6. Observabilitas & Keamanan
- **Monitoring & Error Tracking:** Sentry (atau Datadog) untuk mendeteksi anomali di sisi klien dan server.
- **Keamanan (Security):** Autentikasi direkomendasikan memakai standar industri yang tangguh (NextAuth.js / Supabase Auth / Auth0) yang mendukung OAuth secara bawaan. Proteksi DDoS dan enkripsi rahasia (Secret Management) harus standar produksi (Environment Variables tertutup).

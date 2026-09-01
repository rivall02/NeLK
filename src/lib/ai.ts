import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { env, hasGeminiConfigured, hasGroqConfigured, hasMimoConfigured } from "./env";
import { logger } from "./logger";

export type AIModelId = "groq-gpt-oss-20b" | "mimo-v2.5" | "gemini-2.5-flash";

export interface AIModelOption {
  id: AIModelId;
  name: string;
  provider: "Groq" | "Mimo" | "Google";
  description: string;
  badge: string;
  isAvailable: boolean;
}

export function getAvailableAIModels(): AIModelOption[] {
  return [
    {
      id: "groq-gpt-oss-20b",
      name: "GPT-OSS 20B (Groq)",
      provider: "Groq",
      description: "Kecepatan inferensi super instan untuk tanya jawab tugas, ide, dan diskusi.",
      badge: "⚡ GPT-OSS 20B",
      isAvailable: hasGroqConfigured(),
    },
    {
      id: "gemini-2.5-flash",
      name: "Gemini 2.5 Flash (Google)",
      provider: "Google",
      description: "Asisten cerdas multimodal Google untuk analisis perkuliahan komprehensif.",
      badge: "📚 Gemini 2.5",
      isAvailable: hasGeminiConfigured(),
    },
    {
      id: "mimo-v2.5",
      name: "Mimo v2.5 (Mimo AI)",
      provider: "Mimo",
      description: "Penalaran cerdas untuk konsep matematika, sains, dan logika pemrograman.",
      badge: "🧠 Mimo v2.5",
      isAvailable: hasMimoConfigured(),
    },
  ];
}

/**
 * Helper to get fresh API keys dynamically from process.env or env object.
 */
function getKeys() {
  return {
    groq: process.env.GROQ_API_KEY || env.GROQ_API_KEY || "",
    gemini: process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || "",
    mimo: process.env.MIMO_API_KEY || env.MIMO_API_KEY || "",
    mimoBaseUrl: process.env.MIMO_BASE_URL || env.MIMO_BASE_URL || "https://api.xiaomimimo.com/v1",
  };
}

/**
 * 1. General Chat Assistant (Groq GPT-OSS 20B / Mimo v2.5 / Gemini 2.5 Flash)
 */
export async function generateAIChatResponse({
  prompt,
  context,
  modelId = "groq-gpt-oss-20b",
}: {
  prompt: string;
  context?: string;
  modelId?: AIModelId;
}): Promise<string> {
  const fullSystemPrompt = `Kamu adalah asisten akademik pribadi NeLK (NextLink). Bantu mahasiswa mengatur tugas, memahami jadwal kuliah, dan merangkum materi secara ramah, ringkas, dan jelas dalam Bahasa Indonesia.

${context ? `Konteks Akademik Mahasiswa:\n${context}\n` : ""}`;

  const keys = getKeys();

  // Try chosen model
  if (modelId === "groq-gpt-oss-20b" && keys.groq) {
    try {
      return await callGroqChat(fullSystemPrompt, prompt, "openai/gpt-oss-20b");
    } catch (e: any) {
      logger.warn("Groq GPT-OSS 20B error:", e.message);
    }
  }

  if (modelId === "mimo-v2.5" && keys.mimo) {
    try {
      return await callMimoChat(fullSystemPrompt, prompt, "mimo-v2.5");
    } catch (e: any) {
      logger.warn("Mimo v2.5 error:", e.message);
    }
  }

  if (modelId === "gemini-2.5-flash" && keys.gemini) {
    try {
      return await callGeminiChat(fullSystemPrompt, prompt);
    } catch (e: any) {
      logger.warn("Gemini 2.5 Flash error:", e.message);
    }
  }

  // Fallback Cascade: Groq -> Gemini -> Mimo
  if (keys.groq) {
    try {
      return await callGroqChat(fullSystemPrompt, prompt, "openai/gpt-oss-20b");
    } catch (e: any) {
      logger.warn("Fallback Groq error:", e.message);
    }
  }

  if (keys.gemini) {
    try {
      return await callGeminiChat(fullSystemPrompt, prompt);
    } catch (e: any) {
      logger.warn("Fallback Gemini error:", e.message);
    }
  }

  if (keys.mimo) {
    try {
      return await callMimoChat(fullSystemPrompt, prompt, "mimo-v2.5");
    } catch (e: any) {
      logger.warn("Fallback Mimo error:", e.message);
    }
  }

  throw new Error("Layanan AI sedang tidak tersedia atau kredensial API belum dikonfigurasi.");
}

/**
 * 2. Complex Task AI: Rangkum materi, generate soal kuis, & mini games
 * Model: Groq Complex Task → openai/gpt-oss-120b
 */
export async function generateComplexTaskAI(systemPrompt: string, userContent: string): Promise<string> {
  const keys = getKeys();

  if (keys.groq) {
    try {
      return await callGroqChat(systemPrompt, userContent, "openai/gpt-oss-120b");
    } catch (e: any) {
      logger.warn("Groq GPT-OSS 120B error, fallback to Gemini:", e.message);
    }
  }

  if (keys.gemini) {
    try {
      return await callGeminiChat(systemPrompt, userContent);
    } catch (e: any) {
      logger.warn("Gemini fallback error:", e.message);
    }
  }

  if (keys.groq) {
    return await callGroqChat(systemPrompt, userContent, "openai/gpt-oss-20b");
  }

  throw new Error("Layanan AI untuk pemrosesan materi sedang tidak tersedia.");
}

/**
 * 3. Multimodal Schedule Extraction (Gemini Vision-to-JSON)
 * Sends raw file bytes (PDF/Image) directly to Gemini 2.5 Flash as inlineData.
 * No intermediate text parsing needed — Gemini reads the visual structure natively.
 */
export interface ScheduleExtractionInput {
  base64: string;       // Raw file content as base64
  mimeType: string;     // e.g. "application/pdf", "image/jpeg"
  textFallback?: string; // For text files, plain text content
}

const EXTRACTION_SYSTEM_PROMPT = `Anda adalah sistem ekstraksi data akademik yang presisi. Tugas Anda adalah menganalisis dokumen kalender akademik atau jadwal perkuliahan yang dilampirkan, lalu mengekstrak semua kegiatan ke dalam format array JSON.

Terapkan aturan ekstraksi berikut secara ketat:
1. Normalisasi Tanggal: Format wajib "YYYY-MM-DD". Jika tahun tidak ditulis pada tanggal tertentu, ambil tahun dari judul dokumen atau konteks semester.
2. Pemisahan Rentang Hari: Jika sebuah kegiatan memiliki rentang (contoh: "16 - 18 Januari"), Anda wajib membuat entri objek JSON terpisah untuk setiap tanggal (16 Januari, 17 Januari, dan 18 Januari).
3. Normalisasi Waktu: Gunakan format 24-jam "HH:MM". Jika kegiatan bersifat seharian atau waktu tidak tertera, tetapkan "startTime": "00:00" dan "endTime": "23:59".
4. Penggabungan Deskripsi: Jika terdapat keterangan tambahan seperti ruang kelas, jenis kegiatan (misal: "Drop Mata Kuliah"), atau instruksi khusus, masukkan ke dalam properti "description".
5. Jangan mengada-ada data. Jika informasi tidak ada di dokumen, jangan membuat asumsi.
6. Baca struktur visual dokumen (tabel, baris, kolom, hierarki teks) secara menyeluruh.`;

export async function extractScheduleWithAI(input: ScheduleExtractionInput | string): Promise<any[]> {
  const keys = getKeys();

  // Legacy string support for backward compatibility
  if (typeof input === "string") {
    input = {
      base64: "",
      mimeType: "",
      textFallback: input,
    };
  }

  const { base64, mimeType, textFallback } = input;

  // Define schema for structured output
  const geminiSchema = {
    type: SchemaType.ARRAY,
    description: "Daftar mata kuliah atau kegiatan dari jadwal",
    items: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: "Nama Mata Kuliah / Kegiatan" },
        day: { type: SchemaType.STRING, description: "Hari (e.g. Monday, Tuesday)", nullable: true },
        date: { type: SchemaType.STRING, description: "Tanggal format YYYY-MM-DD" },
        startTime: { type: SchemaType.STRING, description: "Waktu mulai format HH:MM (default 00:00 jika seharian)" },
        endTime: { type: SchemaType.STRING, description: "Waktu selesai format HH:MM (default 23:59 jika seharian)" },
        description: { type: SchemaType.STRING, description: "Ruang / Dosen / Keterangan", nullable: true }
      },
      required: ["title", "date", "startTime", "endTime"]
    }
  } as any;

  // Primary: Gemini Vision with inlineData (works for PDF, images, etc.)
  if (keys.gemini && base64) {
    let attempt = 0;
    const maxAttempts = 3;
    // Models that support vision - use gemini-2.0-flash which is widely available
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash"];
    
    while (attempt < maxAttempts) {
      try {
        const modelName = modelsToTry[attempt] || "gemini-2.0-flash";
        logger.info(`Attempting Gemini Vision extraction with model: ${modelName} (attempt ${attempt + 1}/${maxAttempts})`);
        
        const genAI = new GoogleGenerativeAI(keys.gemini);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: geminiSchema,
          },
        });

        const result = await model.generateContent([
          EXTRACTION_SYSTEM_PROMPT,
          "Analisis dokumen yang dilampirkan dan ekstrak semua kegiatan/jadwal ke dalam JSON array.",
          { inlineData: { data: base64, mimeType } },
        ]);

        const responseText = result.response.text();
        logger.info("Gemini Vision raw response:", { responseLength: responseText.length, first200: responseText.slice(0, 200) });
        
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
        logger.warn(`Gemini returned empty/invalid result for schedule extraction with ${modelName}`);
        break;
      } catch (e: any) {
        attempt++;
        logger.warn(`Gemini Vision extraction error on attempt ${attempt}:`, e.message);
        
        if (attempt >= maxAttempts) {
          if (!textFallback || textFallback.trim().length <= 10) {
            throw new Error(`Gemini Vision Error after ${maxAttempts} attempts: ${e.message}`);
          }
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }
    }
  }

  // Fallback: text-based extraction (for plain text files or if vision fails)
  if (textFallback && textFallback.trim().length > 10) {
    if (keys.gemini) {
      try {
        const genAI = new GoogleGenerativeAI(keys.gemini);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: geminiSchema,
          },
        });
        const result = await model.generateContent([
          EXTRACTION_SYSTEM_PROMPT,
          `Analisis teks jadwal berikut:\n\n${textFallback.slice(0, 10000)}`,
        ]);
        return JSON.parse(result.response.text());
      } catch (e: any) {
        logger.warn("Gemini text extraction fallback error:", e.message);
      }
    }

    // Last resort: Groq text-based
    if (keys.groq) {
      try {
        const rawResponse = await callGroqChat(
          EXTRACTION_SYSTEM_PROMPT,
          `Analisis teks jadwal berikut dan kembalikan JSON array:\n\n${textFallback.slice(0, 10000)}`,
          "qwen/qwen3.8-27b"
        );
        const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } catch (e: any) {
        logger.warn("Groq text extraction fallback error:", e.message);
      }
    }
  }

  throw new Error("Tidak dapat mengekstrak jadwal dari dokumen.");
}

// ----------------------------------------------------
// Low-level Provider Callers
// ----------------------------------------------------

async function callGroqChat(systemPrompt: string, userMessage: string, modelName: string): Promise<string> {
  const keys = getKeys();
  if (!keys.groq) throw new Error("Kunci API Groq belum dikonfigurasi.");

  // Check if userMessage is a data URL (image)
  let userContent: any = userMessage;
  if (userMessage.startsWith("data:image/")) {
    if (modelName.includes("vision")) {
      userContent = [
        { type: "text", text: "Tolong ekstrak informasi dari gambar jadwal ini." },
        { type: "image_url", image_url: { url: userMessage } }
      ];
    } else {
      throw new Error("Model ini tidak mendukung pemrosesan gambar.");
    }
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${keys.groq}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Tidak ada respons.";
}

async function callMimoChat(systemPrompt: string, userMessage: string, modelName: string): Promise<string> {
  const keys = getKeys();
  if (!keys.mimo) throw new Error("Kunci API Mimo belum dikonfigurasi.");

  const res = await fetch(`${keys.mimoBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${keys.mimo}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Mimo API error (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Tidak ada respons.";
}

async function callGeminiChat(
  systemPrompt: string,
  userMessage: string,
  options?: { responseMimeType?: string; responseSchema?: any }
): Promise<string> {
  const keys = getKeys();
  if (!keys.gemini) throw new Error("Kunci API Gemini belum dikonfigurasi.");

  const genAI = new GoogleGenerativeAI(keys.gemini);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: options ? {
      responseMimeType: options.responseMimeType,
      responseSchema: options.responseSchema,
    } : undefined,
  });
  
  if (userMessage.startsWith("data:image/")) {
    const match = userMessage.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      const mimeType = match[1];
      const data = match[2];
      const result = await model.generateContent([
        systemPrompt,
        "Tolong ekstrak informasi dari gambar jadwal ini sesuai dengan format JSON yang diminta.",
        { inlineData: { data, mimeType } }
      ]);
      return result.response.text();
    }
  }

  const result = await model.generateContent(`${systemPrompt}\n\n${userMessage}`);
  return result.response.text();
}

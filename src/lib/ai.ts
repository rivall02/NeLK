import { GoogleGenerativeAI } from "@google/generative-ai";
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
 * 3. Image/Document Schedule Extraction Task
 * Model: Groq Image/Document Task → qwen/qwen3.8-27b
 */
export async function extractScheduleWithAI(documentText: string): Promise<any[]> {
  const keys = getKeys();
  const isImage = documentText.startsWith("data:image/");
  const prompt = isImage ? documentText : `Analisis dokumen jadwal perkuliahan berikut dan ekstrak semua mata kuliah/kegiatan.
Untuk setiap item, berikan JSON array objek dengan format:
[
  {
    "title": "Nama Mata Kuliah / Kegiatan",
    "date": "YYYY-MM-DD",
    "startTime": "HH:mm",
    "endTime": "HH:mm",
    "description": "Ruang / Dosen / Keterangan"
  }
]
Hanya return JSON murni tanpa markdown atau teks pengantar.

Dokumen:\n${documentText.slice(0, 10000)}`;

  const systemContext = "Kamu adalah parser jadwal akademik cerdas yang mengekstrak informasi ke format JSON array valid dengan properti: title, date (YYYY-MM-DD), startTime (HH:mm), endTime (HH:mm), description. Pastikan hanya mereturn JSON murni, tanpa teks lain.";

  let rawResponse = "";

  if (keys.groq) {
    try {
      rawResponse = await callGroqChat(
        systemContext,
        prompt,
        isImage ? "llama-3.2-11b-vision-preview" : "qwen/qwen3.8-27b" // Use vision model if image, else qwen
      );
    } catch (e: any) {
      logger.warn("Groq Qwen 3.8 27B error, fallback to Gemini:", e.message);
    }
  }

  if (!rawResponse && keys.gemini) {
    try {
      rawResponse = await callGeminiChat(
        "Kamu adalah parser jadwal akademik cerdas yang mengekstrak informasi ke format JSON array valid.",
        prompt
      );
    } catch (e: any) {
      logger.warn("Gemini schedule extraction error:", e.message);
    }
  }

  if (!rawResponse && keys.groq) {
    rawResponse = await callGroqChat(
      "Kamu adalah parser jadwal akademik cerdas yang mengekstrak informasi ke format JSON array valid.",
      prompt,
      "openai/gpt-oss-120b"
    );
  }

  if (!rawResponse) {
    throw new Error("Tidak dapat mengekstrak jadwal dari dokumen.");
  }

  const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Format jadwal tidak dapat dikenali secara otomatis.");
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

async function callGeminiChat(systemPrompt: string, userMessage: string): Promise<string> {
  const keys = getKeys();
  if (!keys.gemini) throw new Error("Kunci API Gemini belum dikonfigurasi.");

  const genAI = new GoogleGenerativeAI(keys.gemini);
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  
  if (userMessage.startsWith("data:image/")) {
    const match = userMessage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      const mimeType = match[1];
      const data = match[2];
      const result = await model.generateContent([
        systemPrompt,
        "Tolong ekstrak informasi dari gambar jadwal ini.",
        { inlineData: { data, mimeType } }
      ]);
      return result.response.text();
    }
  }

  const result = await model.generateContent(`${systemPrompt}\n\n${userMessage}`);
  return result.response.text();
}

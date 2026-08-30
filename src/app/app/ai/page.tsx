"use client";

import { motion } from "motion/react";
import { Sparkle, FileText, CheckSquare, CalendarDots, User, Lightning, Brain } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { askAI, getAIModelsList } from "@/lib/actions";
import type { AIModelId, AIModelOption } from "@/lib/ai";

type Message = { role: "user" | "ai"; content: string; modelName?: string };

export default function AIPage() {
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<AIModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModelId>("groq-gpt-oss-20b");

  useEffect(() => {
    async function loadModels() {
      try {
        const available = await getAIModelsList();
        setModels(available);
      } catch {
        // Fallback default models
      }
    }
    loadModels();
  }, []);

  const suggestions = [
    { text: "Rangkum materi Struktur Data & Algoritma", icon: <FileText size={18} /> },
    { text: "Bantu breakdown tugas proyek pemrograman ke to-do list", icon: <CheckSquare size={18} /> },
    { text: "Carikan jadwal belajar 2 jam fokus hari ini", icon: <CalendarDots size={18} /> },
  ];

  const modelTabs = [
    {
      id: "groq-gpt-oss-20b" as AIModelId,
      name: "GPT-OSS 20B",
      badge: "⚡ Super Cepat",
      icon: Lightning,
    },
    {
      id: "gemini-2.5-flash" as AIModelId,
      name: "Gemini 2.5 Flash",
      badge: "📚 Multimodal",
      icon: FileText,
    },
    {
      id: "mimo-v2.5" as AIModelId,
      name: "Mimo v2.5",
      badge: "🧠 Deep Reasoning",
      icon: Brain,
    },
  ];

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 min-h-[calc(100vh-80px)] flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <header className="mb-6 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-ai)] text-white flex items-center justify-center mb-3 shadow-[var(--shadow-md)]"
          >
            <Sparkle weight="fill" className="text-2xl" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)] tracking-tight"
          >
            NeLK Multi-Model AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--color-text-muted)] mt-1 max-w-md text-xs sm:text-sm"
          >
            Asisten cerdas akademik multi-engine. Pilih model AI yang paling cocok dengan kebutuhan belajarmu.
          </motion.p>

          {/* Model Selector Bar */}
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            {modelTabs.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)] scale-[1.02]"
                      : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  <Icon size={14} weight={isSelected ? "fill" : "regular"} />
                  <span>{m.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                      isSelected ? "bg-white/20 text-white" : "bg-[var(--color-bg)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {m.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto mb-6 space-y-4 px-2 max-h-[55vh]">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-ai)]/20 text-[var(--color-ai)]"
                  }`}
                >
                  {msg.role === "user" ? <User weight="fill" /> : <Sparkle weight="fill" />}
                </div>
                <div
                  className={`p-4 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.role === "user"
                      ? "bg-[var(--color-primary)] text-white rounded-tr-none"
                      : "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-tl-none text-[var(--color-text)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.modelName && (
                    <span className="text-[9px] opacity-60 mt-2 block font-mono">Model: {msg.modelName}</span>
                  )}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-ai)]/20 text-[var(--color-ai)] flex items-center justify-center shrink-0">
                  <Sparkle weight="fill" />
                </div>
                <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-tl-none">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-ai)] animate-bounce" />
                    <span
                      className="w-2 h-2 rounded-full bg-[var(--color-ai)] animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-[var(--color-ai)] animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Footer Input & Suggestions */}
      <div className="w-full pt-4">
        {messages.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {suggestions.map((item, idx) => (
              <motion.button
                key={item.text}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.08 }}
                onClick={() => handleSend(item.text)}
                className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-hover)] transition-all text-left group shadow-xs"
              >
                <div className="text-[var(--color-primary)] mb-1.5">{item.icon}</div>
                <span className="text-xs font-semibold text-[var(--color-text)] leading-snug">{item.text}</span>
              </motion.button>
            ))}
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/20 via-[var(--color-ai)]/20 to-pink-500/20 blur-xl opacity-40 rounded-full" />
          <div className="relative bg-[var(--color-surface)] rounded-2xl p-1.5 border border-[var(--color-border)] shadow-[var(--shadow-md)] flex items-center pr-2">
            <div className="pl-3 pr-2 text-[var(--color-primary)]">
              <Sparkle weight="fill" size={18} />
            </div>
            <input
              type="text"
              placeholder={`Tanya tugas, jadwal, atau minta penjelasan konsep (${
                selectedModel === "groq-gpt-oss-20b"
                  ? "GPT-OSS 20B"
                  : selectedModel === "gemini-2.5-flash"
                  ? "Gemini 2.5 Flash"
                  : "Mimo v2.5"
              })...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(query)}
              className="flex-1 bg-transparent border-none outline-none py-2.5 text-xs sm:text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
            />
            <button
              onClick={() => handleSend(query)}
              disabled={!query.trim() || isTyping}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                query.trim() && !isTyping
                  ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-95"
                  : "bg-[var(--color-bg)] text-[var(--color-text-muted)] cursor-not-allowed"
              }`}
            >
              Kirim
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  async function handleSend(text: string) {
    if (!text.trim() || isTyping) return;
    if (text.trim().length < 2) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Silakan masukkan pertanyaan yang lebih spesifik (minimal 2 karakter)." },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setQuery("");
    setIsTyping(true);

    try {
      const response = await askAI(text, selectedModel);
      const activeModelLabel =
        selectedModel === "groq-gpt-oss-20b"
          ? "Groq / GPT-OSS 20B"
          : selectedModel === "gemini-2.5-flash"
          ? "Google Gemini 2.5 Flash"
          : "Mimo v2.5";

      setMessages((prev) => [...prev, { role: "ai", content: response, modelName: activeModelLabel }]);
    } catch (e: any) {
      const errorMsg = e?.message || "Terjadi kendala koneksi AI.";
      setMessages((prev) => [...prev, { role: "ai", content: `Pemberitahuan: ${errorMsg}` }]);
    } finally {
      setIsTyping(false);
    }
  }
}

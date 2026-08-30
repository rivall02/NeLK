"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkle, X, PaperPlaneRight, SpinnerGap } from "@phosphor-icons/react";
import { askAI } from "@/lib/actions";
import { toast } from "sonner";

interface Message {
  role: "assistant" | "user";
  content: string;
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya asisten akademik NeLK. Ada yang bisa saya bantu terkait tugas, ringkasan materi, atau jadwal belajarmu?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", content: cleanQuery }]);
    setQuery("");
    setIsTyping(true);

    try {
      const responseText = await askAI(cleanQuery);
      setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
    } catch (err: any) {
      toast.error(err.message || "Gagal menghubungi AI.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, terjadi kendala saat memproses pertanyaanmu. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 bg-[#8B5CF6] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30 hover:shadow-xl hover:shadow-[#8B5CF6]/40 transition-all group"
              aria-label="Buka Chat AI"
            >
              <Sparkle weight="fill" className="text-2xl group-hover:rotate-12 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute bottom-0 right-0 w-[calc(100vw-2rem)] md:w-[400px] h-[520px] max-h-[calc(100vh-6rem)] bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border)] flex flex-col overflow-hidden origin-bottom-right"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[#8B5CF6]/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center">
                    <Sparkle weight="fill" size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-text)]">NeLK AI Assistant</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Online
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  aria-label="Tutup Chat"
                >
                  <X weight="bold" size={18} />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scroll-smooth">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-[var(--color-primary)] text-white rounded-tr-sm"
                          : "bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center text-xs text-[var(--color-text-muted)]">
                      <SpinnerGap size={16} className="animate-spin text-[#8B5CF6]" />
                      <span>NeLK AI sedang berpikir...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tanya tugas, jadwal, atau materi..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isTyping}
                    className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[#8B5CF6]"
                  />
                  <button
                    type="submit"
                    disabled={!query.trim() || isTyping}
                    className="w-10 h-10 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-[#7c4dff] transition-colors"
                    aria-label="Kirim Pesan"
                  >
                    <PaperPlaneRight weight="fill" size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

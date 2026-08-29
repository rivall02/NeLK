"use client";

import { motion } from "motion/react";
import { Sparkle, FileText, CheckSquare, CalendarDots, User } from "@phosphor-icons/react";
import { useState } from "react";
import { askAI } from "@/lib/actions";

type Message = { role: "user" | "ai", content: string };

export default function AIPage() {
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const suggestions = [
    { text: "Summarize my notes on Data Structures", icon: <FileText /> },
    { text: "Help me break down the Software Eng project", icon: <CheckSquare /> },
    { text: "Find time for 2 hours of study today", icon: <CalendarDots /> },
  ];

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 pt-20 md:pt-8 min-h-[calc(100vh-80px)] flex flex-col">
      <header className="mb-8 text-center flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center mb-4"
        >
          <Sparkle weight="fill" className="text-3xl" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-nelk-text-light dark:text-nelk-text-dark tracking-tight"
        >
          NeLK AI
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-nelk-text-light/60 dark:text-nelk-text-dark/60 mt-2 max-w-lg"
        >
          Your personal academic assistant. Ask questions, generate study plans, or summarize your notes.
        </motion.p>
      </header>

      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto mb-6 space-y-4 px-2">
          {messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-nelk-primary text-white" : "bg-[#8B5CF6]/20 text-[#8B5CF6]"
              }`}>
                {msg.role === "user" ? <User weight="fill" /> : <Sparkle weight="fill" />}
              </div>
              <div className={`p-4 rounded-2xl max-w-[80%] ${
                msg.role === "user" ? "bg-nelk-primary text-white rounded-tr-none" : "bg-nelk-surface-light dark:bg-nelk-surface-dark border border-black/10 dark:border-white/10 rounded-tl-none"
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center shrink-0">
                <Sparkle weight="fill" />
              </div>
              <div className="p-4 rounded-2xl bg-nelk-surface-light dark:bg-nelk-surface-dark border border-black/10 dark:border-white/10 rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      <div className={`flex flex-col justify-end pb-12 ${messages.length > 0 ? "" : "flex-1"}`}>
        {messages.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {suggestions.map((item, idx) => (
            <motion.button
              key={item.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              onClick={() => handleSend(item.text)}
              className="p-4 rounded-2xl bg-nelk-surface-light dark:bg-nelk-surface-dark border border-black/5 dark:border-white/10 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 transition-colors text-left group"
            >
              <div className="text-[#8B5CF6] mb-2">{item.icon}</div>
              <span className="text-sm font-medium">{item.text}</span>
            </motion.button>
          ))}
        </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-[#8B5CF6]/20 to-pink-500/20 blur-xl opacity-50 rounded-full" />
          <div className="relative bg-nelk-surface-light dark:bg-nelk-surface-dark rounded-full p-2 border border-black/10 dark:border-white/10 shadow-lg flex items-center pr-4">
            <div className="pl-4 pr-2 text-nelk-text-light/40 dark:text-nelk-text-dark/40">
              <Sparkle weight="fill" className="text-xl" />
            </div>
            <input 
              type="text" 
              placeholder="Ask anything about your tasks, schedule, or notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(query)}
              className="flex-1 bg-transparent border-none outline-none py-3 text-base placeholder:text-nelk-text-light/40 dark:placeholder:text-nelk-text-dark/40"
            />
            <button 
              onClick={() => handleSend(query)}
              disabled={isTyping}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                query.trim() && !isTyping
                  ? "bg-[#8B5CF6] text-white hover:bg-[#7c4dff]" 
                  : "bg-black/5 dark:bg-white/5 text-nelk-text-light/40 dark:text-nelk-text-dark/40 cursor-not-allowed"
              }`}
            >
              Send
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  async function handleSend(text: string) {
    if (!text.trim() || isTyping) return;
    
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setQuery("");
    setIsTyping(true);

    try {
      const response = await askAI(text);
      setMessages(prev => [...prev, { role: "ai", content: response }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "ai", content: "Error communicating with AI." }]);
    } finally {
      setIsTyping(false);
    }
  }
}

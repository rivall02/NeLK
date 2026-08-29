"use client";

import { motion } from "motion/react";
import { Sparkle, FileText, CheckSquare, CalendarDots } from "@phosphor-icons/react";
import { useState } from "react";

export default function AIPage() {
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

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

      <div className="flex-1 flex flex-col justify-end pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {suggestions.map((item, idx) => (
            <motion.button
              key={item.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              onClick={() => setQuery(item.text)}
              className="p-4 rounded-2xl bg-nelk-surface-light dark:bg-nelk-surface-dark border border-black/5 dark:border-white/10 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 transition-colors text-left group"
            >
              <div className="text-[#8B5CF6] mb-2">{item.icon}</div>
              <span className="text-sm font-medium">{item.text}</span>
            </motion.button>
          ))}
        </div>

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
              className="flex-1 bg-transparent border-none outline-none py-3 text-base placeholder:text-nelk-text-light/40 dark:placeholder:text-nelk-text-dark/40"
            />
            <button 
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                query.trim() 
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
}

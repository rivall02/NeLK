"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkle, X, PaperPlaneRight, StopCircle } from "@phosphor-icons/react";

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi there! I'm your NeLK assistant. Need help organizing your study schedule or generating ideas?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const userMsg = query;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setQuery("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: `I can help with that! Here's a suggestion based on your prompt: "${userMsg}". (This is a simulated response for MVP V0)` }]);
      setIsTyping(false);
    }, 1500);
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
              className="w-14 h-14 bg-[#8B5CF6] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30 hover:shadow-xl hover:shadow-[#8B5CF6]/40 transition-shadow group"
            >
              <Sparkle weight="fill" className="text-2xl group-hover:animate-spin-slow" />
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
              className="absolute bottom-0 right-0 w-[calc(100vw-2rem)] md:w-[380px] h-[500px] max-h-[calc(100vh-6rem)] bg-nelk-surface-light dark:bg-nelk-surface-dark rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 flex flex-col overflow-hidden origin-bottom-right"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#8B5CF6]/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center">
                    <Sparkle weight="fill" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">NeLK AI</h3>
                    <div className="flex items-center gap-1.5 text-xs text-nelk-text-light/60 dark:text-nelk-text-dark/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Online
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X weight="bold" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scroll-smooth">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user" 
                        ? "bg-[#8B5CF6] text-white rounded-tr-sm" 
                        : "bg-black/5 dark:bg-white/10 rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-black/5 dark:bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                      <motion.div className="w-1.5 h-1.5 bg-nelk-text-light/40 dark:bg-nelk-text-dark/40 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                      <motion.div className="w-1.5 h-1.5 bg-nelk-text-light/40 dark:bg-nelk-text-dark/40 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} />
                      <motion.div className="w-1.5 h-1.5 bg-nelk-text-light/40 dark:bg-nelk-text-dark/40 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-black/5 dark:border-white/5 bg-nelk-surface-light dark:bg-nelk-surface-dark">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                  <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-2xl rounded-br-sm border border-black/5 dark:border-white/5 focus-within:border-[#8B5CF6]/50 transition-colors px-4 py-1.5">
                    <textarea 
                      placeholder="Ask me anything..."
                      rows={1}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      className="w-full bg-transparent border-none outline-none resize-none py-2 text-sm max-h-32 min-h-[40px] scrollbar-hide"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!query.trim()}
                    className="w-12 h-12 rounded-2xl rounded-bl-sm bg-[#8B5CF6] text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7c4dff] transition-colors"
                  >
                    {isTyping ? <StopCircle weight="fill" className="text-xl" /> : <PaperPlaneRight weight="fill" className="text-xl" />}
                  </button>
                </form>
                <div className="text-center mt-2">
                  <p className="text-[10px] text-nelk-text-light/40 dark:text-nelk-text-dark/40">
                    AI can make mistakes. Consider verifying important information.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

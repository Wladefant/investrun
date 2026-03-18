"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Send, GraduationCap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Rank } from "@/lib/academy-state";

interface ChatMessage {
  id: string;
  role: "professor" | "student";
  content: string;
  timestamp: Date;
}

export function ProfessorChat({
  isOpen,
  onClose,
  playerName,
  rank,
}: {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  rank: Rank;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "professor",
      content: `Welcome to my office, ${playerName}. I'm Professor Fortuna. As a ${rank.label}, you're progressing well through the Academy. Ask me anything about investing — I'm here to guide you.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const studentMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "student",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, studentMsg]);
    setInput("");
    setIsTyping(true);

    // Call AI API
    try {
      const response = await fetch("/api/ai/professor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, studentMsg].map((m) => ({
            role: m.role === "professor" ? "assistant" : "user",
            content: m.content,
          })),
          playerName,
          rank: rank.label,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "_prof",
            role: "professor",
            content: data.response,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error("API error");
      }
    } catch {
      // Fallback response
      const fallbacks = [
        `Good question, ${playerName}. The key to investing is patience. Markets reward those who stay the course.`,
        "Remember what you learned in the crash simulation — emotional discipline is your most valuable skill.",
        "Diversification is the only free lunch in investing. Spread your risk across asset classes and geographies.",
        "Start early, invest regularly, and don't panic when markets drop. That's the formula that has worked for over a century.",
        "The biggest risk isn't market volatility — it's not investing at all. Inflation erodes cash over time.",
      ];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_prof",
          role: "professor",
          content: fallbacks[Math.floor(Math.random() * fallbacks.length)],
          timestamp: new Date(),
        },
      ]);
    }
    setIsTyping(false);
  };

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col bg-background rounded-[50px] overflow-hidden"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A2332] to-[#243044] px-5 pt-14 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FFC800] to-[#E6B400] rounded-full flex items-center justify-center">
            <GraduationCap size={20} className="text-[#1A2332]" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">Professor Fortuna</p>
            <p className="text-gray-400 text-[10px]">Investment Coach · AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "student" ? "justify-end" : "justify-start"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {msg.role === "professor" && (
              <div className="w-7 h-7 bg-gradient-to-br from-[#FFC800] to-[#E6B400] rounded-full flex items-center justify-center shrink-0 mr-2 mt-1">
                <GraduationCap size={12} className="text-[#1A2332]" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                msg.role === "student"
                  ? "bg-[#FFC800] text-[#1A2332] rounded-br-md"
                  : "bg-white border border-border shadow-sm rounded-bl-md"
              )}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-[#FFC800] to-[#E6B400] rounded-full flex items-center justify-center shrink-0">
              <GraduationCap size={12} className="text-[#1A2332]" />
            </div>
            <div className="bg-white border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin text-[#FFC800]" />
                <span className="text-xs text-muted-foreground">Professor is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-8 pt-3 bg-background border-t border-border shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask Professor Fortuna..."
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFC800] transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 bg-gradient-to-br from-[#FFC800] to-[#E6B400] rounded-xl flex items-center justify-center text-[#1A2332] disabled:opacity-40 active:scale-95 transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";

import { X, Send, GraduationCap } from "lucide-react";
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
    <div
      className="absolute inset-0 z-50 flex flex-col bg-background rounded-[50px] overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-popover to-[#243044] px-5 pt-14 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <GraduationCap size={20} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">Professor Fortuna</p>
            <p className="text-muted-foreground text-[10px]">Investment Coach</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-card/10 rounded-full flex items-center justify-center text-white hover:bg-card/20 transition-colors active:scale-[0.98]"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "student" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "professor" && (
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0 mr-2 mt-1">
                <GraduationCap size={12} className="text-primary-foreground" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] px-4 py-3",
                msg.role === "student"
                  ? "bg-primary text-foreground rounded-2xl rounded-br-sm"
                  : "bg-card shadow-sm border border-border rounded-2xl rounded-bl-sm"
              )}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0">
              <GraduationCap size={12} className="text-primary-foreground" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-8 pt-3 bg-card border-t border-border shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask Professor Fortuna..."
            className="flex-1 bg-background rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-foreground disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

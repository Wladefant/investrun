"use client";

import { useState } from "react";
import { GraduationCap, Sparkles, ChevronRight } from "lucide-react";

export function EnrollmentScreen({ onEnroll }: { onEnroll: (name: string) => void }) {
  const [step, setStep] = useState<"welcome" | "name">("welcome");
  const [name, setName] = useState("");

  if (step === "welcome") {
    return (
      <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
        {/* Yellow gradient header area */}
        <div className="bg-gradient-to-b from-primary/20 to-transparent pt-12 pb-4">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/90 rounded-3xl flex items-center justify-center pf-glow-sm">
              <GraduationCap size={48} className="text-foreground" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center px-8 text-center">
          <div className="mb-4">
            <h1 className="text-foregroundxl font-bold text-foreground mb-1 tracking-tight">
              Wealth Manager
            </h1>
            <h2 className="text-xl font-bold text-primary">Academy</h2>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-[280px]">
            Master the art of investing through guided missions.
            Learn by doing. Graduate with your Investment DNA.
          </p>

          {/* Feature badges */}
          <div className="flex items-center gap-2 mb-10 flex-wrap justify-center">
            {["🪞 Risk Profiling", "📉 Crash Survival", "🧬 DNA Report"].map(
              (item, i) => (
                <div
                  key={i}
                  className="bg-card border border-border px-3 py-1.5 rounded-full text-[10px] text-foreground font-medium shadow-sm"
                >
                  {item}
                </div>
              )
            )}
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={() => setStep("name")}
              className="w-full py-3.5 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98] bg-primary text-foreground hover:brightness-95 shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Enroll Now
            </button>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-[10px] pb-6">
          Powered by PostFinance
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background px-8 pt-16">
      <div>
        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/90 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
          <GraduationCap size={28} className="text-foreground" />
        </div>

        <h1 className="text-primary-foregroundxl font-bold text-foreground mb-2">
          Welcome, future investor.
        </h1>
        <p className="text-muted-foreground text-sm mb-10">
          What should Professor Fortuna call you?
        </p>

        <div className="relative mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={20}
            autoFocus
            className="w-full bg-card border border-border rounded-xl px-4 py-4 text-foreground text-lg placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all shadow-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) onEnroll(name.trim());
            }}
          />
        </div>

        <button
          onClick={() => name.trim() && onEnroll(name.trim())}
          disabled={!name.trim()}
          className="w-full py-3.5 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98] bg-secondary text-white hover:brightness-125 shadow-sm disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          Begin Your Journey
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

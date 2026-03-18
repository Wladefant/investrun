"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EnrollmentScreen({ onEnroll }: { onEnroll: (name: string) => void }) {
  const [step, setStep] = useState<"welcome" | "name">("welcome");
  const [name, setName] = useState("");

  if (step === "welcome") {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-b from-[#1A2332] via-[#1A2332] to-[#243044] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 -right-10 w-40 h-40 bg-[#FFC800]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 -left-10 w-32 h-32 bg-[#FFC800]/5 rounded-full blur-2xl" />

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          {/* Academy Crest */}
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-[#FFC800] to-[#E6B400] rounded-3xl flex items-center justify-center mb-8 pf-glow"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          >
            <GraduationCap size={48} className="text-[#1A2332]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Wealth Manager
            </h1>
            <h2 className="text-xl font-bold text-[#FFC800] mb-6">Academy</h2>
          </motion.div>

          <motion.p
            className="text-gray-400 text-sm leading-relaxed mb-10 max-w-[280px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Master the art of investing through guided missions.
            Learn by doing. Graduate with your Investment DNA.
          </motion.p>

          <motion.div
            className="flex items-center gap-3 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {["🪞 Risk Profiling", "📉 Crash Survival", "🧬 DNA Report"].map(
              (item, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[10px] text-gray-300"
                >
                  {item}
                </div>
              )
            )}
          </motion.div>

          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Button
              onClick={() => setStep("name")}
              className="w-full text-base"
              size="lg"
            >
              <Sparkles size={18} />
              Enroll Now
            </Button>
          </motion.div>
        </div>

        <motion.p
          className="text-center text-gray-600 text-[10px] pb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          Powered by PostFinance
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#1A2332] to-[#243044] px-8 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-14 h-14 bg-gradient-to-br from-[#FFC800] to-[#E6B400] rounded-2xl flex items-center justify-center mb-8">
          <GraduationCap size={28} className="text-[#1A2332]" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome, future investor.
        </h1>
        <p className="text-gray-400 text-sm mb-10">
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
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white text-lg placeholder-gray-500 outline-none focus:border-[#FFC800] focus:ring-1 focus:ring-[#FFC800] transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) onEnroll(name.trim());
            }}
          />
        </div>

        <Button
          onClick={() => name.trim() && onEnroll(name.trim())}
          disabled={!name.trim()}
          className="w-full"
          size="lg"
        >
          Begin Your Journey
          <ChevronRight size={18} />
        </Button>
      </motion.div>
    </div>
  );
}

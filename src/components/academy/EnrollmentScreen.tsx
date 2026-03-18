"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles, ChevronRight } from "lucide-react";

export function EnrollmentScreen({ onEnroll }: { onEnroll: (name: string) => void }) {
  const [step, setStep] = useState<"welcome" | "name">("welcome");
  const [name, setName] = useState("");

  if (step === "welcome") {
    return (
      <div className="flex-1 flex flex-col bg-[#F3F3F3] relative overflow-hidden">
        {/* Yellow gradient header area */}
        <div className="bg-gradient-to-b from-[#FFC800]/20 to-transparent pt-12 pb-4">
          <div className="flex justify-center">
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-[#FFC800] to-[#E6B400] rounded-3xl flex items-center justify-center shadow-[0_4px_12px_rgba(255,200,0,0.3)]"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            >
              <GraduationCap size={48} className="text-[#333333]" />
            </motion.div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-4"
          >
            <h1 className="text-3xl font-bold text-[#333333] mb-1 tracking-tight">
              Wealth Manager
            </h1>
            <h2 className="text-xl font-bold text-[#FFC800]">Academy</h2>
          </motion.div>

          <motion.p
            className="text-[#767676] text-sm leading-relaxed mb-8 max-w-[280px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Master the art of investing through guided missions.
            Learn by doing. Graduate with your Investment DNA.
          </motion.p>

          {/* Feature badges in a row */}
          <motion.div
            className="flex items-center gap-2 mb-10 flex-wrap justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {["Risk Profiling", "Crash Survival", "DNA Report"].map(
              (item, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-[10px] text-[#333333] font-medium shadow-sm"
                >
                  {item}
                </div>
              )
            )}
          </motion.div>

          <motion.div
            className="w-full space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <button
              onClick={() => setStep("name")}
              className="w-full py-3.5 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98] bg-[#FFC800] text-[#333333] hover:bg-[#E6B400] shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Enroll Now
            </button>
          </motion.div>
        </div>

        <motion.p
          className="text-center text-[#767676] text-[10px] pb-6"
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
    <div className="flex-1 flex flex-col bg-[#F3F3F3] px-8 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-14 h-14 bg-gradient-to-br from-[#FFC800] to-[#E6B400] rounded-2xl flex items-center justify-center mb-8 shadow-sm">
          <GraduationCap size={28} className="text-[#333333]" />
        </div>

        <h1 className="text-2xl font-bold text-[#333333] mb-2">
          Welcome, future investor.
        </h1>
        <p className="text-[#767676] text-sm mb-10">
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
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-[#333333] text-lg placeholder-gray-400 outline-none focus:border-[#FFC800] focus:ring-2 focus:ring-[#FFC800]/30 transition-all shadow-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) onEnroll(name.trim());
            }}
          />
        </div>

        <button
          onClick={() => name.trim() && onEnroll(name.trim())}
          disabled={!name.trim()}
          className="w-full py-3.5 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98] bg-[#33307E] text-white hover:bg-[#282668] shadow-sm disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          Begin Your Journey
          <ChevronRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}

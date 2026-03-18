"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Rank } from "@/lib/academy-state";

export function MissionResultScreen({
  missionId,
  grade,
  score,
  xpEarned,
  debrief,
  rankInfo,
  onContinue,
  onViewDNA,
}: {
  missionId: number;
  grade: string;
  score: number;
  xpEarned: number;
  debrief: string;
  rankInfo: Rank;
  onContinue: () => void;
  onViewDNA?: () => void;
}) {
  const gradeColors: Record<string, string> = {
    A: "border-[#FFC800]",
    B: "border-emerald-400",
    C: "border-blue-400",
    D: "border-orange-400",
    F: "border-red-400",
  };

  const gradeTextColors: Record<string, string> = {
    A: "text-[#FFC800]",
    B: "text-emerald-500",
    C: "text-blue-500",
    D: "text-orange-500",
    F: "text-red-500",
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 overflow-y-auto bg-[#F3F3F3]">
      {/* Grade reveal */}
      <div className="text-center mb-6">
        <motion.p
          className="text-[#767676] text-xs font-medium tracking-wide mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          MISSION {missionId} COMPLETE
        </motion.p>

        <motion.div
          className={`w-28 h-28 bg-white rounded-2xl shadow-sm border-2 ${gradeColors[grade] || gradeColors.C} flex items-center justify-center mx-auto mb-4`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 80, delay: 0.3 }}
        >
          <span className={`text-5xl font-black ${gradeTextColors[grade] || gradeTextColors.C}`}>
            {grade}
          </span>
        </motion.div>

        <motion.p
          className="text-2xl font-bold text-[#333333]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Score: {score}/100
        </motion.p>
      </div>

      {/* XP earned */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 mb-3 border-l-4 border-l-[#FFC800]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="w-11 h-11 bg-[#FFC800]/10 rounded-xl flex items-center justify-center">
          <Sparkles size={20} className="text-[#FFC800]" />
        </div>
        <div>
          <p className="text-lg font-bold text-[#333333]">+{xpEarned} XP</p>
          <p className="text-xs text-[#767676]">Experience earned</p>
        </div>
      </motion.div>

      {/* Rank */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 mb-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="w-11 h-11 bg-[#33307E]/10 rounded-xl flex items-center justify-center">
          <Award size={20} className="text-[#33307E]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#333333]">
            Rank: {rankInfo.icon} {rankInfo.label}
          </p>
          <p className="text-xs text-[#767676]">Keep going to rank up</p>
        </div>
      </motion.div>

      {/* Professor debrief */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 border-l-4 border-l-[#FFC800]/40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <p className="text-sm text-[#333333] leading-relaxed">
          <span className="font-bold text-[#33307E]">Professor Fortuna:</span> {debrief}
        </p>
      </motion.div>

      {/* Actions */}
      <div className="mt-auto space-y-3">
        {onViewDNA && (
          <Button onClick={onViewDNA} variant="outline" size="lg" className="w-full">
            View Investment DNA
          </Button>
        )}
        <Button onClick={onContinue} size="lg" className="w-full">
          Continue
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}

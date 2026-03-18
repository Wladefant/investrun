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
    A: "from-[#FFC800] to-[#E6B400]",
    B: "from-emerald-400 to-green-500",
    C: "from-blue-400 to-indigo-500",
    D: "from-orange-400 to-amber-500",
    F: "from-red-400 to-rose-500",
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
      {/* Grade reveal */}
      <div className="text-center mb-8">
        <motion.p
          className="text-muted-foreground text-xs font-medium mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          MISSION {missionId} COMPLETE
        </motion.p>

        <motion.div
          className={`w-28 h-28 bg-gradient-to-br ${gradeColors[grade] || gradeColors.C} rounded-3xl flex items-center justify-center mx-auto mb-4 pf-glow`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 80, delay: 0.3 }}
        >
          <span className="text-5xl font-black text-white drop-shadow-lg">{grade}</span>
        </motion.div>

        <motion.p
          className="text-2xl font-bold text-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Score: {score}/100
        </motion.p>
      </div>

      {/* XP earned */}
      <motion.div
        className="bg-gradient-to-r from-[#FFC800]/10 to-[#FFC800]/5 border border-[#FFC800]/20 rounded-2xl p-4 flex items-center gap-3 mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="w-12 h-12 bg-gradient-to-br from-[#FFC800] to-[#E6B400] rounded-xl flex items-center justify-center">
          <Sparkles size={20} className="text-[#1A2332]" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">+{xpEarned} XP</p>
          <p className="text-xs text-muted-foreground">Experience earned</p>
        </div>
      </motion.div>

      {/* Rank */}
      <motion.div
        className="bg-white rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3 mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
          <Award size={20} className="text-[#FFC800]" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Rank: {rankInfo.icon} {rankInfo.label}</p>
          <p className="text-xs text-muted-foreground">Keep going to rank up</p>
        </div>
      </motion.div>

      {/* Professor debrief */}
      <motion.div
        className="bg-white rounded-2xl p-5 border border-border shadow-sm mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <p className="text-sm text-foreground leading-relaxed">
          <span className="font-bold text-[#FFC800]">Professor Fortuna:</span> {debrief}
        </p>
      </motion.div>

      {/* Actions */}
      <div className="mt-auto space-y-3">
        {onViewDNA && (
          <Button onClick={onViewDNA} variant="outline" size="lg" className="w-full">
            🧬 View Investment DNA
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

"use client";


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
        <p
          className="text-[#767676] text-xs font-medium tracking-wide mb-4"
        >
          MISSION {missionId} COMPLETE
        </p>

        <div
          className={`w-28 h-28 bg-white rounded-2xl shadow-sm border-2 ${gradeColors[grade] || gradeColors.C} flex items-center justify-center mx-auto mb-4`}
        >
          <span className={`text-5xl font-black ${gradeTextColors[grade] || gradeTextColors.C}`}>
            {grade}
          </span>
        </div>

        <p
          className="text-2xl font-bold text-[#333333]"
        >
          Score: {score}/100
        </p>
      </div>

      {/* XP earned */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 mb-3 border-l-4 border-l-[#FFC800]"
      >
        <div className="w-11 h-11 bg-[#FFC800]/10 rounded-xl flex items-center justify-center">
          <Sparkles size={20} className="text-[#FFC800]" />
        </div>
        <div>
          <p className="text-lg font-bold text-[#333333]">+{xpEarned} XP</p>
          <p className="text-xs text-[#767676]">Experience earned</p>
        </div>
      </div>

      {/* Rank */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 mb-3"
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
      </div>

      {/* Professor debrief */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 border-l-4 border-l-[#FFC800]/40"
      >
        <p className="text-sm text-[#333333] leading-relaxed">
          <span className="font-bold text-[#33307E]">Professor Fortuna:</span> {debrief}
        </p>
      </div>

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

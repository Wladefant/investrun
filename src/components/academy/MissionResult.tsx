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
    A: "border-primary",
    B: "border-emerald-400",
    C: "border-blue-400",
    D: "border-orange-400",
    F: "border-red-400",
  };

  const gradeTextColors: Record<string, string> = {
    A: "text-primary",
    B: "text-emerald-500",
    C: "text-blue-500",
    D: "text-orange-500",
    F: "text-red-500",
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 overflow-y-auto bg-background">
      {/* Grade reveal */}
      <div className="text-center mb-6">
        <p
          className="text-muted-foreground text-xs font-medium tracking-wide mb-4"
        >
          MISSION {missionId} COMPLETE
        </p>

        <div
          className={`w-28 h-28 bg-card rounded-2xl shadow-sm border-2 ${gradeColors[grade] || gradeColors.C} flex items-center justify-center mx-auto mb-4`}
        >
          <span className={`text-5xl font-black ${gradeTextColors[grade] || gradeTextColors.C}`}>
            {grade}
          </span>
        </div>

        <p
          className="text-primary-foregroundxl font-bold text-foreground"
        >
          Score: {score}/100
        </p>
      </div>

      {/* XP earned */}
      <div
        className="bg-card rounded-2xl shadow-sm border border-border p-4 flex items-center gap-3 mb-3 border-l-4 border-l-primary"
      >
        <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
          <Sparkles size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">+{xpEarned} XP</p>
          <p className="text-xs text-muted-foreground">Experience earned</p>
        </div>
      </div>

      {/* Rank */}
      <div
        className="bg-card rounded-2xl shadow-sm border border-border p-4 flex items-center gap-3 mb-3"
      >
        <div className="w-11 h-11 bg-secondary/10 rounded-xl flex items-center justify-center">
          <Award size={20} className="text-secondary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">
            Rank: {rankInfo.icon} {rankInfo.label}
          </p>
          <p className="text-xs text-muted-foreground">Keep going to rank up</p>
        </div>
      </div>

      {/* Professor debrief */}
      <div
        className="bg-card rounded-2xl shadow-sm border border-border p-5 mb-6 border-l-4 border-l-primary/40"
      >
        <p className="text-sm text-foreground leading-relaxed">
          <span className="font-bold text-secondary">Professor Fortuna:</span> {debrief}
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

"use client";

import { ScreenHeader } from "@/components/academy/MobileLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { MISSIONS } from "@/lib/academy-state";

export function MissionPlaceholderScreen({
  missionId,
  onComplete,
  onBack,
}: {
  missionId: number;
  onComplete: (score: number) => void;
  onBack: () => void;
}) {
  const mission = MISSIONS.find((m) => m.id === missionId);
  if (!mission) return null;

  // Auto-complete with a decent score for demo purposes
  const handleQuickComplete = () => {
    const score = 70 + Math.floor(Math.random() * 20);
    onComplete(score);
  };

  return (
    <>
      <ScreenHeader title={`Mission ${missionId}`} onBack={onBack} />
      <div className="flex-1 flex flex-col px-5 py-6">
        <div className="flex-1">
          <div
            className={`w-16 h-16 bg-gradient-to-br ${mission.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg`}
          >
            {mission.icon}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {mission.title}
          </h1>
          <p className="text-muted-foreground text-sm mb-4">
            {mission.subtitle}
          </p>

          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm mb-6">
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-bold text-[#FFC800]">
                Professor Fortuna:
              </span>{" "}
              {mission.concept}. This mission will teach you one of the most
              important principles in investing. Pay close attention.
            </p>
          </div>

          <div className="bg-[#FFC800]/10 border border-[#FFC800]/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-[#FFC800]" />
              <span className="text-sm font-bold text-foreground">
                Demo Mode
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              This mission is being expanded with full interactive content. For
              now, complete it to unlock the next mission and see your
              Investment DNA.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="bg-muted px-2.5 py-1 rounded-full">
              ⏱ {mission.duration}
            </span>
            <span className="bg-muted px-2.5 py-1 rounded-full">
              +{50 + missionId * 20} XP
            </span>
          </div>
        </div>

        <Button onClick={handleQuickComplete} size="lg" className="w-full">
          Complete Mission
          <ChevronRight size={18} />
        </Button>
      </div>
    </>
  );
}

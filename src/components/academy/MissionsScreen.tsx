"use client";

import { motion } from "framer-motion";
import { Lock, CheckCircle2, Play, Clock } from "lucide-react";
import { ScreenHeader } from "@/components/academy/MobileLayout";
import { cn } from "@/lib/utils";
import { type AcademyProgress, MISSIONS, getMissionStatus } from "@/lib/academy-state";

export function MissionsScreen({
  progress,
  onStartMission,
  onBack,
}: {
  progress: AcademyProgress;
  onStartMission: (id: number) => void;
  onBack: () => void;
}) {
  return (
    <>
      <ScreenHeader title="Missions" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {MISSIONS.map((mission, i) => {
          const status = getMissionStatus(mission.id, progress.completedMissions);
          const score = progress.missionScores[mission.id];

          return (
            <motion.button
              key={mission.id}
              onClick={() => status !== "locked" && onStartMission(mission.id)}
              disabled={status === "locked"}
              className={cn(
                "w-full bg-white rounded-2xl p-4 text-left transition-all border",
                status === "locked"
                  ? "opacity-40 grayscale border-border"
                  : status === "completed"
                    ? "border-[#FFC800]/30 shadow-sm"
                    : "border-border shadow-sm active:scale-[0.98]"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl",
                    status === "completed"
                      ? "bg-[#FFC800]/10"
                      : status === "locked"
                        ? "bg-gray-100"
                        : "bg-gradient-to-br " + mission.color
                  )}
                >
                  {status === "locked" ? (
                    <Lock size={18} className="text-gray-400" />
                  ) : status === "completed" ? (
                    <CheckCircle2 size={22} className="text-[#FFC800]" fill="currentColor" />
                  ) : (
                    <span>{mission.icon}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{mission.title}</p>
                  <p className="text-xs text-muted-foreground mb-1">{mission.subtitle}</p>
                  <p className="text-[11px] text-muted-foreground">{mission.description}</p>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock size={10} /> {mission.duration}
                    </span>
                    {score && (
                      <span className="text-[10px] font-bold text-[#FFC800] bg-[#FFC800]/10 px-2 py-0.5 rounded-full">
                        Grade: {score.grade} · {score.xpEarned} XP
                      </span>
                    )}
                  </div>
                </div>

                {status === "available" && (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FFC800] to-[#E6B400] rounded-full flex items-center justify-center shrink-0">
                    <Play size={16} className="text-[#1A2332] ml-0.5" fill="currentColor" />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </>
  );
}

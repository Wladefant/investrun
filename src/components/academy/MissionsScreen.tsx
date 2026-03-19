"use client";


import { Lock, CheckCircle2, Play, Clock } from "lucide-react";
import { ScreenHeader } from "@/components/academy/MobileLayout";
import { cn } from "@/lib/utils";
import { type AcademyProgress, MISSIONS, getMissionStatus } from "@/lib/academy-state";

/* Color map for the left indicator bar per mission */
const missionBarColors: Record<number, string> = {
  1: "bg-[#FFC800]",
  2: "bg-[#33307E]",
  3: "bg-emerald-500",
  4: "bg-blue-500",
  5: "bg-orange-500",
  6: "bg-rose-500",
  7: "bg-purple-500",
};

const missionIconBgColors: Record<number, string> = {
  1: "bg-[#FFC800]/15",
  2: "bg-[#33307E]/15",
  3: "bg-emerald-500/15",
  4: "bg-blue-500/15",
  5: "bg-orange-500/15",
  6: "bg-rose-500/15",
  7: "bg-purple-500/15",
};

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
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#F3F3F3]">
        {MISSIONS.map((mission, i) => {
          const status = getMissionStatus(mission.id, progress.completedMissions);
          const score = progress.missionScores[mission.id];
          const barColor = missionBarColors[mission.id] || "bg-gray-400";
          const iconBg = missionIconBgColors[mission.id] || "bg-gray-100";

          return (
            <button
              key={mission.id}
              onClick={() => status !== "locked" && onStartMission(mission.id)}
              disabled={status === "locked"}
              className={cn(
                "w-full bg-card rounded-2xl shadow-sm border border-border text-left transition-all overflow-hidden",
                status === "locked" && "opacity-50 grayscale",
                status === "available" && "active:scale-[0.98]"
              )}
            >
              <div className="flex">
                {/* Left indicator bar */}
                <div
                  className={cn(
                    "w-1 shrink-0 rounded-l-2xl",
                    status === "completed" ? "bg-emerald-500" : status === "locked" ? "bg-gray-300" : barColor
                  )}
                />

                <div className="flex items-center gap-3 p-4 flex-1 min-w-0">
                  {/* Icon circle */}
                  <div
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-lg",
                      status === "completed"
                        ? "bg-emerald-50"
                        : status === "locked"
                          ? "bg-gray-100"
                          : iconBg
                    )}
                  >
                    {status === "locked" ? (
                      <Lock size={16} className="text-gray-400" />
                    ) : status === "completed" ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : (
                      <span>{mission.icon}</span>
                    )}
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#333333]">{mission.title}</p>
                    <p className="text-xs text-[#767676] mb-0.5">{mission.subtitle}</p>

                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-[#767676] flex items-center gap-1">
                        <Clock size={10} /> {mission.duration}
                      </span>
                      {score && (
                        <span className="text-[10px] font-bold text-[#FFC800] bg-[#FFC800]/10 px-2 py-0.5 rounded-full">
                          {score.grade} · {score.xpEarned} XP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Play button for available missions */}
                  {status === "available" && (
                    <div className="w-9 h-9 bg-[#FFC800] rounded-full flex items-center justify-center shrink-0">
                      <Play size={14} className="text-[#333333] ml-0.5" fill="currentColor" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

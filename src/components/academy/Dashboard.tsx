"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Lock, CheckCircle2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type AcademyProgress,
  MISSIONS,
  getCurrentRank,
  getNextRank,
  getXpProgress,
  getMissionStatus,
} from "@/lib/academy-state";

export function AcademyDashboard({
  progress,
  onStartMission,
}: {
  progress: AcademyProgress;
  onStartMission: (id: number) => void;
}) {
  const rank = getCurrentRank(progress.xp);
  const nextRank = getNextRank(progress.xp);
  const xpInfo = getXpProgress(progress.xp);
  const completedCount = progress.completedMissions.length;
  const remaining = MISSIONS.length - completedCount;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header with rank */}
      <div className="bg-gradient-to-br from-[#1A2332] via-[#1F2B3D] to-[#243044] px-5 pt-2 pb-6 rounded-b-[28px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-xs">Welcome back,</p>
            <h1 className="text-white text-xl font-bold">{progress.playerName}</h1>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
            <span className="text-lg">{rank.icon}</span>
            <span className="text-white text-xs font-bold">{rank.label}</span>
          </div>
        </div>

        {/* XP Progress */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#FFC800]" />
              <span className="text-white text-sm font-bold">{progress.xp} XP</span>
            </div>
            {nextRank && (
              <span className="text-gray-400 text-xs">
                {xpInfo.required - xpInfo.current} XP to {nextRank.label}
              </span>
            )}
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FFC800] to-[#FFD633] rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${xpInfo.percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Progress card */}
        <motion.div
          className="bg-white rounded-2xl p-4 shadow-sm border border-border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFC800]/20 to-[#FFC800]/5 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">
                {remaining > 0
                  ? `${remaining} mission${remaining !== 1 ? "s" : ""} to graduation!`
                  : "Ready to graduate! 🎓"}
              </p>
              <p className="text-xs text-muted-foreground">
                {completedCount} of {MISSIONS.length} completed
              </p>
            </div>
            <div className="flex gap-1">
              {MISSIONS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    progress.completedMissions.includes(i + 1)
                      ? "bg-[#FFC800]"
                      : "bg-gray-200"
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Next Mission CTA */}
        {remaining > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {(() => {
              const nextMission = MISSIONS.find(
                (m) => !progress.completedMissions.includes(m.id)
              );
              if (!nextMission) return null;
              return (
                <button
                  onClick={() => onStartMission(nextMission.id)}
                  className={cn(
                    "w-full bg-gradient-to-r rounded-2xl p-5 text-left active:scale-[0.98] transition-transform shadow-sm",
                    nextMission.color
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-xs font-medium mb-1">
                        NEXT MISSION
                      </p>
                      <p className="text-white text-lg font-bold">
                        {nextMission.icon} {nextMission.title}
                      </p>
                      <p className="text-white/80 text-xs mt-1">
                        {nextMission.description}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 ml-3">
                      <Play size={20} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </button>
              );
            })()}
          </motion.div>
        )}

        {/* Mission list */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3">All Missions</h2>
          <div className="space-y-2.5">
            {MISSIONS.map((mission, i) => {
              const status = getMissionStatus(
                mission.id,
                progress.completedMissions
              );
              const score = progress.missionScores[mission.id];

              return (
                <motion.button
                  key={mission.id}
                  onClick={() =>
                    status !== "locked" && onStartMission(mission.id)
                  }
                  disabled={status === "locked"}
                  className={cn(
                    "w-full bg-white rounded-xl p-3.5 flex items-center gap-3 text-left transition-all border",
                    status === "locked"
                      ? "opacity-50 grayscale border-border"
                      : status === "completed"
                        ? "border-[#FFC800]/30 shadow-sm"
                        : "border-border shadow-sm hover:border-[#FFC800]/50 active:scale-[0.98]"
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.3 }}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg",
                      status === "completed"
                        ? "bg-[#FFC800]/10"
                        : status === "locked"
                          ? "bg-gray-100"
                          : "bg-gradient-to-br " + mission.color + " text-white"
                    )}
                  >
                    {status === "locked" ? (
                      <Lock size={16} className="text-gray-400" />
                    ) : status === "completed" ? (
                      <CheckCircle2
                        size={20}
                        className="text-[#FFC800]"
                        fill="currentColor"
                      />
                    ) : (
                      <span className="text-base">{mission.icon}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {mission.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {mission.subtitle} · {mission.duration}
                    </p>
                  </div>

                  {score && (
                    <div className="bg-[#FFC800]/10 px-2 py-1 rounded-lg">
                      <span className="text-xs font-bold text-[#FFC800]">
                        {score.grade}
                      </span>
                    </div>
                  )}

                  {status === "available" && (
                    <ChevronRight size={16} className="text-gray-400 shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

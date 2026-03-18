"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  Lock,
  CheckCircle2,
  Play,
  Trophy,
  Target,
} from "lucide-react";
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
    <div className="flex-1 overflow-y-auto bg-[#F3F3F3]">
      {/* Header section - white with rounded bottom like ing-app */}
      <div className="bg-white px-4 py-4 pb-6 rounded-b-[30px] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
              className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center text-2xl shadow-sm"
            >
              {rank.icon}
            </motion.div>
            <div>
              <div className="text-xs text-[#767676] font-bold uppercase tracking-wider">
                {rank.label}
              </div>
              <div className="font-bold text-[#333333]">{progress.playerName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
            <Sparkles size={16} className="text-[#FFC800]" />
            <span className="font-bold text-amber-600 text-sm">{progress.xp} XP</span>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="bg-gray-100 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#333333]">Progress</span>
            {nextRank && (
              <span className="text-xs text-[#767676]">
                {xpInfo.required - xpInfo.current} XP to {nextRank.label}
              </span>
            )}
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FFC800] to-[#E6B400] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpInfo.percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick stats grid - 3 columns like ing-app */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="bg-white p-3 rounded-xl shadow-sm text-center"
          >
            <div className="text-2xl mb-1">
              <Trophy size={22} className="text-[#FFC800] mx-auto" />
            </div>
            <div className="text-lg font-bold text-[#333333]">{rank.label}</div>
            <div className="text-[10px] text-[#767676]">Rank</div>
          </motion.div>
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="bg-white p-3 rounded-xl shadow-sm text-center"
          >
            <div className="text-2xl mb-1">
              <Sparkles size={22} className="text-[#FFC800] mx-auto" />
            </div>
            <div className="text-lg font-bold text-[#333333]">{progress.xp}</div>
            <div className="text-[10px] text-[#767676]">XP</div>
          </motion.div>
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="bg-white p-3 rounded-xl shadow-sm text-center"
          >
            <div className="text-2xl mb-1">
              <Target size={22} className="text-[#FFC800] mx-auto" />
            </div>
            <div className="text-lg font-bold text-[#333333]">
              {completedCount}/{MISSIONS.length}
            </div>
            <div className="text-[10px] text-[#767676]">Missions</div>
          </motion.div>
        </div>

        {/* Next Mission CTA - gradient card like ing-app daily challenge */}
        {remaining > 0 &&
          (() => {
            const nextMission = MISSIONS.find(
              (m) => !progress.completedMissions.includes(m.id)
            );
            if (!nextMission) return null;
            return (
              <motion.button
                onClick={() => onStartMission(nextMission.id)}
                className="w-full bg-gradient-to-br from-[#FFC800] to-[#E6B400] p-4 rounded-2xl shadow-lg text-left active:scale-[0.98] transition-transform relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 font-bold text-[#333333]">
                      <Target size={20} />
                      <span>Next Mission</span>
                    </div>
                    <span className="text-xs font-bold bg-white/30 text-[#333333] px-2 py-1 rounded-md">
                      +{50 + nextMission.id * 20} XP
                    </span>
                  </div>
                  <p className="text-[15px] font-bold text-[#333333] mb-1">
                    {nextMission.icon} {nextMission.title}
                  </p>
                  <p className="text-sm text-[#333333]/70 mb-2">
                    {nextMission.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#333333]">
                    <span>Start now</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </motion.button>
            );
          })()}

        {/* Mission list - white cards with colored left indicators */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-[#333333]">All Missions</h2>
            <span className="text-xs text-[#767676]">
              {completedCount} of {MISSIONS.length} completed
            </span>
          </div>
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
                    "w-full rounded-xl p-3.5 flex items-center gap-3 text-left transition-all",
                    status === "locked"
                      ? "bg-gray-50 opacity-60 grayscale border border-gray-100"
                      : status === "completed"
                        ? "bg-green-50 border border-green-100 shadow-sm"
                        : "bg-white border border-gray-100 shadow-sm hover:border-[#FFC800]/50 active:scale-[0.98]"
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.2 }}
                >
                  {/* Icon with colored indicator */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg",
                      status === "completed"
                        ? "bg-green-100"
                        : status === "locked"
                          ? "bg-gray-100"
                          : "bg-yellow-50"
                    )}
                  >
                    {status === "locked" ? (
                      <Lock size={16} className="text-gray-400" />
                    ) : status === "completed" ? (
                      <CheckCircle2
                        size={20}
                        className="text-green-500"
                        fill="currentColor"
                      />
                    ) : (
                      <span className="text-base">{mission.icon}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#333333] truncate">
                      {mission.title}
                    </p>
                    <p className="text-[11px] text-[#767676]">
                      {mission.subtitle} · {mission.duration}
                    </p>
                  </div>

                  {score && (
                    <div className="bg-green-100 px-2 py-1 rounded-lg">
                      <span className="text-xs font-bold text-green-600">
                        {score.grade}
                      </span>
                    </div>
                  )}

                  {status === "available" && (
                    <div className="w-8 h-8 bg-[#FFC800] rounded-full flex items-center justify-center shrink-0">
                      <Play size={12} className="text-[#333333] ml-0.5" fill="currentColor" />
                    </div>
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

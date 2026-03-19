"use client";


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
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Header section - white with rounded bottom like ing-app */}
      <div className="bg-card px-4 py-4 pb-6 rounded-b-[30px] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 bg-gradient-to-br from-primary/15 to-amber-100 rounded-full flex items-center justify-center text-primary-foregroundxl shadow-sm"
            >
              {rank.icon}
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                {rank.label}
              </div>
              <div className="font-bold text-foreground">{progress.playerName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <Sparkles size={16} className="text-primary" />
            <span className="font-bold text-primary text-sm">{progress.xp} XP</span>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="bg-muted rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-foreground">Progress</span>
            {nextRank && (
              <span className="text-xs text-muted-foreground">
                {xpInfo.required - xpInfo.current} XP to {nextRank.label}
              </span>
            )}
          </div>
          <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/90 rounded-full"
              style={{ width: `${xpInfo.percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick stats grid - 3 columns like ing-app */}
        <div className="grid grid-cols-3 gap-3">
          <div
            className="bg-card p-3 rounded-xl shadow-sm text-center"
          >
            <div className="text-primary-foregroundxl mb-1">
              <Trophy size={22} className="text-primary mx-auto" />
            </div>
            <div className="text-lg font-bold text-foreground">{rank.label}</div>
            <div className="text-[10px] text-muted-foreground">Rank</div>
          </div>
          <div
            className="bg-card p-3 rounded-xl shadow-sm text-center"
          >
            <div className="text-primary-foregroundxl mb-1">
              <Sparkles size={22} className="text-primary mx-auto" />
            </div>
            <div className="text-lg font-bold text-foreground">{progress.xp}</div>
            <div className="text-[10px] text-muted-foreground">XP</div>
          </div>
          <div
            className="bg-card p-3 rounded-xl shadow-sm text-center"
          >
            <div className="text-primary-foregroundxl mb-1">
              <Target size={22} className="text-primary mx-auto" />
            </div>
            <div className="text-lg font-bold text-foreground">
              {completedCount}/{MISSIONS.length}
            </div>
            <div className="text-[10px] text-muted-foreground">Missions</div>
          </div>
        </div>

        {/* Next Mission CTA - gradient card like ing-app daily challenge */}
        {remaining > 0 &&
          (() => {
            const nextMission = MISSIONS.find(
              (m) => !progress.completedMissions.includes(m.id)
            );
            if (!nextMission) return null;
            return (
              <button
                onClick={() => onStartMission(nextMission.id)}
                className="w-full bg-gradient-to-br from-primary to-primary/90 p-4 rounded-2xl shadow-lg text-left active:scale-[0.98] transition-transform relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-card/10 rounded-full -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <Target size={20} />
                      <span>Next Mission</span>
                    </div>
                    <span className="text-xs font-bold bg-card/30 text-foreground px-2 py-1 rounded-md">
                      +{50 + nextMission.id * 20} XP
                    </span>
                  </div>
                  <p className="text-[15px] font-bold text-foreground mb-1">
                    {nextMission.icon} {nextMission.title}
                  </p>
                  <p className="text-sm text-foreground/70 mb-2">
                    {nextMission.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                    <span>Start now</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </button>
            );
          })()}

        {/* Mission list - white cards with colored left indicators */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-foreground">All Missions</h2>
            <span className="text-xs text-muted-foreground">
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
                <button
                  key={mission.id}
                  onClick={() =>
                    status !== "locked" && onStartMission(mission.id)
                  }
                  disabled={status === "locked"}
                  className={cn(
                    "w-full rounded-xl p-3.5 flex items-center gap-3 text-left transition-all",
                    status === "locked"
                      ? "bg-muted/50 opacity-60 grayscale border border-border"
                      : status === "completed"
                        ? "bg-green-50 border border-green-100 shadow-sm"
                        : "bg-card border border-border shadow-sm hover:border-primary/50 active:scale-[0.98]"
                  )}
                >
                  {/* Icon with colored indicator */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg",
                      status === "completed"
                        ? "bg-green-100"
                        : status === "locked"
                          ? "bg-muted"
                          : "bg-primary/10"
                    )}
                  >
                    {status === "locked" ? (
                      <Lock size={16} className="text-muted-foreground" />
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
                    <p className="text-sm font-bold text-foreground truncate">
                      {mission.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
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
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
                      <Play size={12} className="text-foreground ml-0.5" fill="currentColor" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MobileLayout, BottomNav, ScreenHeader } from "@/components/academy/MobileLayout";
import { ArenaScreen } from "@/components/academy/arena/ArenaScreen";
import { AcademyDashboard } from "@/components/academy/Dashboard";
import { MissionsScreen } from "@/components/academy/MissionsScreen";
import {
  OnboardingFlow,
  type OnboardingResult,
} from "@/components/academy/OnboardingFlow";
import { Mission1Screen } from "@/components/academy/missions/Mission1";
import { Mission2Screen } from "@/components/academy/missions/Mission2";
import { Mission3Screen } from "@/components/academy/missions/Mission3";
import { Mission4Screen } from "@/components/academy/missions/Mission4";
import { Mission5Screen } from "@/components/academy/missions/Mission5";
import { Mission6Screen } from "@/components/academy/missions/Mission6";
import { MissionPlaceholderScreen } from "@/components/academy/missions/MissionPlaceholder";
import { MissionResultScreen } from "@/components/academy/MissionResult";
import { DNAReportScreen } from "@/components/academy/DNAReport";
import { ProfessorChat } from "@/components/academy/ProfessorChat";
import { FutureEstimationScreen } from "@/components/academy/FutureEstimation";
import { FutureEngineScreen } from "@/components/academy/FutureEngineScreen";
import { HistoricSimulatorScreen } from "@/components/academy/HistoricSimulator";
import { SoloScreen } from "@/components/academy/SoloScreen";
import { TimeMachineScreen } from "@/components/academy/TimeMachineScreen";
import {
  INITIAL_PROGRESS,
  getCurrentRank,
  type AcademyProgress,
  type RiskArchetype,
} from "@/lib/academy-state";

type Screen =
  | "enrollment"
  | "dashboard"
  | "missions"
  | "future_engine"
  | "solo"
  | "profile"
  | "arena"
  | "mission"
  | "mission_result"
  | "dna_report"
  | "simulator"
  | "future"
  | "time_machine";

export default function AcademyApp() {
  const [screen, setScreen] = useState<Screen>("enrollment");
  const [activeMissionId, setActiveMissionId] = useState<number>(0);
  const [progress, setProgress] = useState<AcademyProgress>(INITIAL_PROGRESS);
  const [showProfessor, setShowProfessor] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingResult | null>(null);
  const [lastMissionResult, setLastMissionResult] = useState<{
    missionId: number;
    grade: string;
    score: number;
    xpEarned: number;
    debrief: string;
  } | null>(null);

  const handleOnboardingComplete = (result: OnboardingResult) => {
    const riskMap: Record<string, RiskArchetype> = {
      cautious: "conservative",
      balanced: "balanced",
      growth: "aggressive",
    };
    setProgress((p) => ({
      ...p,
      playerName: result.name,
      ...(result.riskProfileId
        ? { riskProfile: riskMap[result.riskProfileId] ?? "balanced" }
        : {}),
    }));
    setOnboardingData(result);
    setScreen("future_engine");
  };

  const handleStartMission = (id: number) => {
    setActiveMissionId(id);
    setScreen("mission");
  };

  const handleMissionComplete = (
    missionId: number,
    score: number,
    data?: Record<string, unknown>
  ) => {
    const grade =
      score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
    const xpEarned = Math.round(score * 1.5) + (grade === "A" ? 30 : 0);

    setProgress((p) => ({
      ...p,
      xp: p.xp + xpEarned,
      currentRank: getCurrentRank(p.xp + xpEarned).id,
      completedMissions: [...new Set([...p.completedMissions, missionId])],
      missionScores: {
        ...p.missionScores,
        [missionId]: { grade, score, xpEarned },
      },
      ...(data?.riskProfile ? { riskProfile: data.riskProfile as RiskArchetype } : {}),
      ...(data?.crashBehavior
        ? { crashBehavior: data.crashBehavior as AcademyProgress["crashBehavior"] }
        : {}),
    }));

    const debriefs: Record<number, string> = {
      1: "You've completed your aptitude assessment. Understanding your risk tolerance is the foundation of every investment decision.",
      2: "You've learned the power of diversification. Spreading risk across asset classes is the only free lunch in investing.",
      3: "You've survived a market crash. Emotional discipline is the most valuable investing skill you can develop.",
      4: "You've seen the power of compound growth. Time is your greatest advantage — start early, stay invested.",
      5: "You now understand asset classes. Each serves a purpose — growth, stability, insurance, liquidity.",
      6: "You've competed in the Arena. Comparing strategies reveals insights no textbook can teach.",
      7: "You've graduated. Your Investment DNA reveals who you truly are as an investor.",
    };

    setLastMissionResult({
      missionId,
      grade,
      score,
      xpEarned,
      debrief: debriefs[missionId] || "Well done, student. Every mission brings you closer to graduation.",
    });

    // Mission 7 goes straight to DNA report
    if (missionId === 7) {
      setScreen("dna_report");
    } else {
      setScreen("mission_result");
    }
  };

  const activeTab =
    screen === "dashboard" ? "dashboard"
    : screen === "future_engine" ? "future_engine"
    : screen === "missions" ? "missions"
    : screen === "solo" ? "solo"
    : screen === "arena" ? "arena"
    : "dashboard";

  const showNav = ["dashboard", "future_engine", "solo", "arena"].includes(screen);

  const renderMission = () => {
    switch (activeMissionId) {
      case 1:
        return (
          <Mission1Screen
            onComplete={(score, riskProfile) =>
              handleMissionComplete(1, score, { riskProfile })
            }
            onBack={() => setScreen("dashboard")}
          />
        );
      case 2:
        return (
          <Mission2Screen
            onComplete={(score, data) =>
              handleMissionComplete(2, score, data)
            }
            onBack={() => setScreen("dashboard")}
          />
        );
      case 3:
        return (
          <Mission3Screen
            onComplete={(score, crashBehavior) =>
              handleMissionComplete(3, score, { crashBehavior })
            }
            onBack={() => setScreen("dashboard")}
          />
        );
      case 4:
        return (
          <Mission4Screen
            onComplete={(score, data) =>
              handleMissionComplete(4, score, data)
            }
            onBack={() => setScreen("dashboard")}
          />
        );
      case 5:
        return (
          <Mission5Screen
            onComplete={(score, data) =>
              handleMissionComplete(5, score, data)
            }
            onBack={() => setScreen("dashboard")}
          />
        );
      case 6:
        return (
          <Mission6Screen
            onComplete={(score, data) =>
              handleMissionComplete(6, score, data)
            }
            onBack={() => setScreen("dashboard")}
          />
        );
      default:
        return (
          <MissionPlaceholderScreen
            missionId={activeMissionId}
            onComplete={(score) => handleMissionComplete(activeMissionId, score)}
            onBack={() => setScreen("dashboard")}
          />
        );
    }
  };

  return (
    <MobileLayout>
      {screen === "enrollment" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </div>
      )}

      {screen === "dashboard" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <AcademyDashboard
            progress={progress}
            onStartMission={handleStartMission}
            onProfileClick={() => setScreen("profile")}
            onTimeMachine={() => setScreen("time_machine")}
          />
        </div>
      )}

      {screen === "future_engine" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <FutureEngineScreen
            age={onboardingData?.age}
            initialContribution={onboardingData?.monthlyContribution}
            initialGoal={onboardingData?.selectedGoal}
            riskProfileId={onboardingData?.riskProfileId}
          />
        </div>
      )}

      {screen === "missions" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <MissionsScreen
            progress={progress}
            onStartMission={handleStartMission}
            onBack={() => setScreen("dashboard")}
          />
        </div>
      )}

      {screen === "mission" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderMission()}
        </div>
      )}

      {screen === "mission_result" && lastMissionResult && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <MissionResultScreen
            {...lastMissionResult}
            rankInfo={getCurrentRank(progress.xp)}
            onContinue={() => setScreen("dashboard")}
            onViewDNA={
              progress.completedMissions.length >= 2
                ? () => setScreen("dna_report")
                : undefined
            }
          />
        </div>
      )}

      {screen === "dna_report" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <DNAReportScreen
            progress={progress}
            onBack={() => setScreen("dashboard")}
          />
        </div>
      )}

      {screen === "time_machine" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <TimeMachineScreen onBack={() => setScreen("dashboard")} />
        </div>
      )}

      {screen === "solo" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <SoloScreen />
        </div>
      )}

      {screen === "simulator" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <HistoricSimulatorScreen onBack={() => setScreen("dashboard")} />
        </div>
      )}

      {screen === "future" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <FutureEstimationScreen onBack={() => setScreen("dashboard")} />
        </div>
      )}

      {screen === "profile" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScreenHeader title="Profile" onBack={() => setScreen("dashboard")} />
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span className="text-4xl mb-3">👤</span>
            <h2 className="text-lg font-bold text-foreground mb-1">
              {progress.playerName}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {getCurrentRank(progress.xp).icon} {getCurrentRank(progress.xp).label} · {progress.xp} XP
            </p>
            <p className="text-xs text-muted-foreground">
              {progress.completedMissions.length} of 7 missions completed
            </p>
          </div>
        </div>
      )}

      {screen === "arena" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <ArenaScreen
            playerName={progress.playerName}
            playerXp={progress.xp}
            arenaStats={progress.arenaStats || { elo: 1000, wins: 0, losses: 0, draws: 0 }}
            onStatsUpdate={(stats, xpEarned) => {
              setProgress(p => ({
                ...p,
                arenaStats: stats,
                xp: p.xp + xpEarned,
                currentRank: getCurrentRank(p.xp + xpEarned).id,
              }));
            }}
          />
        </div>
      )}

      {showNav && (
        <BottomNav
          activeTab={activeTab}
          onNavigate={(tab) => setScreen(tab as Screen)}
          onProfessorClick={() => setShowProfessor(true)}
        />
      )}

      <AnimatePresence>
        {showProfessor && (
          <ProfessorChat
            isOpen={showProfessor}
            onClose={() => setShowProfessor(false)}
            playerName={progress.playerName}
            rank={getCurrentRank(progress.xp)}
          />
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MobileLayout, BottomNav } from "@/components/academy/MobileLayout";
import { AcademyDashboard } from "@/components/academy/Dashboard";
import { MissionsScreen } from "@/components/academy/MissionsScreen";
import { EnrollmentScreen } from "@/components/academy/EnrollmentScreen";
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
  | "learn"
  | "profile"
  | "mission"
  | "mission_result"
  | "dna_report";

export default function AcademyApp() {
  const [screen, setScreen] = useState<Screen>("enrollment");
  const [activeMissionId, setActiveMissionId] = useState<number>(0);
  const [progress, setProgress] = useState<AcademyProgress>(INITIAL_PROGRESS);
  const [showProfessor, setShowProfessor] = useState(false);
  const [lastMissionResult, setLastMissionResult] = useState<{
    missionId: number;
    grade: string;
    score: number;
    xpEarned: number;
    debrief: string;
  } | null>(null);

  const handleEnroll = (name: string) => {
    setProgress((p) => ({ ...p, playerName: name }));
    setScreen("dashboard");
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
    screen === "dashboard"
      ? "dashboard"
      : screen === "missions"
        ? "missions"
        : screen === "learn"
          ? "learn"
          : screen === "profile"
            ? "profile"
            : "dashboard";

  const showNav = ["dashboard", "missions", "learn", "profile"].includes(screen);

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
          <EnrollmentScreen onEnroll={handleEnroll} />
        </div>
      )}

      {screen === "dashboard" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <AcademyDashboard
            progress={progress}
            onStartMission={handleStartMission}
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

      {screen === "learn" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <FutureEstimationScreen onBack={() => setScreen("dashboard")} />
        </div>
      )}

      {screen === "profile" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span className="text-4xl mb-3">👤</span>
            <h2 className="text-lg font-bold text-[#333333] mb-1">
              {progress.playerName}
            </h2>
            <p className="text-sm text-[#767676] mb-4">
              {getCurrentRank(progress.xp).icon} {getCurrentRank(progress.xp).label} · {progress.xp} XP
            </p>
            <p className="text-xs text-[#767676]">
              {progress.completedMissions.length} of 7 missions completed
            </p>
          </div>
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

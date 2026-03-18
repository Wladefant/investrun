"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, BottomNav } from "@/components/academy/MobileLayout";
import { AcademyDashboard } from "@/components/academy/Dashboard";
import { MissionsScreen } from "@/components/academy/MissionsScreen";
import { EnrollmentScreen } from "@/components/academy/EnrollmentScreen";
import { Mission1Screen } from "@/components/academy/missions/Mission1";
import { Mission3Screen } from "@/components/academy/missions/Mission3";
import { MissionResultScreen } from "@/components/academy/MissionResult";
import { DNAReportScreen } from "@/components/academy/DNAReport";
import { ProfessorChat } from "@/components/academy/ProfessorChat";
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
  | "mission_1"
  | "mission_3"
  | "mission_result"
  | "dna_report";

export default function AcademyApp() {
  const [screen, setScreen] = useState<Screen>("enrollment");
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
      1: "You've completed your aptitude assessment. Understanding your risk tolerance is the foundation of every investment decision. Remember: there are no wrong answers — only self-knowledge.",
      3: "You've survived a market crash. The lesson isn't about what the market did — it's about what YOU did. Emotional discipline is the most valuable investing skill you can develop.",
    };

    setLastMissionResult({
      missionId,
      grade,
      score,
      xpEarned,
      debrief: debriefs[missionId] || "Well done, student. Every mission brings you closer to graduation.",
    });
    setScreen("mission_result");
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

  return (
    <MobileLayout>
      <AnimatePresence mode="wait">
        {screen === "enrollment" && (
          <motion.div key="enrollment" className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EnrollmentScreen onEnroll={handleEnroll} />
          </motion.div>
        )}

        {screen === "dashboard" && (
          <motion.div key="dashboard" className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AcademyDashboard
              progress={progress}
              onStartMission={(id) => {
                if (id === 1) setScreen("mission_1");
                else if (id === 3) setScreen("mission_3");
                else setScreen("missions");
              }}
            />
          </motion.div>
        )}

        {screen === "missions" && (
          <motion.div key="missions" className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <MissionsScreen
              progress={progress}
              onStartMission={(id) => {
                if (id === 1) setScreen("mission_1");
                else if (id === 3) setScreen("mission_3");
                else setScreen("missions");
              }}
              onBack={() => setScreen("dashboard")}
            />
          </motion.div>
        )}

        {screen === "mission_1" && (
          <motion.div key="m1" className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Mission1Screen
              onComplete={(score, riskProfile) =>
                handleMissionComplete(1, score, { riskProfile })
              }
              onBack={() => setScreen("dashboard")}
            />
          </motion.div>
        )}

        {screen === "mission_3" && (
          <motion.div key="m3" className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Mission3Screen
              onComplete={(score, crashBehavior) =>
                handleMissionComplete(3, score, { crashBehavior })
              }
              onBack={() => setScreen("dashboard")}
            />
          </motion.div>
        )}

        {screen === "mission_result" && lastMissionResult && (
          <motion.div key="result" className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
          </motion.div>
        )}

        {screen === "dna_report" && (
          <motion.div key="dna" className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DNAReportScreen
              progress={progress}
              onBack={() => setScreen("dashboard")}
            />
          </motion.div>
        )}

        {(screen === "learn" || screen === "profile") && (
          <motion.div key={screen} className="flex-1 flex flex-col items-center justify-center p-8 text-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <span className="text-4xl mb-3">{screen === "learn" ? "📚" : "👤"}</span>
            <h2 className="text-lg font-bold text-foreground mb-1">
              {screen === "learn" ? "Learning Resources" : "Your Profile"}
            </h2>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </motion.div>
        )}
      </AnimatePresence>

      {showNav && (
        <BottomNav
          activeTab={activeTab}
          onNavigate={(tab) => setScreen(tab as Screen)}
          onProfessorClick={() => setShowProfessor(true)}
        />
      )}

      {/* Professor Chat Overlay */}
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

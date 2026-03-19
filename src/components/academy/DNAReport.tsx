"use client";


import { ScreenHeader } from "@/components/academy/MobileLayout";
import { Button } from "@/components/ui/button";
import { Share2, GraduationCap } from "lucide-react";
import type { AcademyProgress } from "@/lib/academy-state";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface PersonalityType {
  name: string;
  icon: string;
  tagline: string;
  strengths: string[];
  blindSpot: string;
}

function getPersonality(progress: AcademyProgress): PersonalityType {
  const profile = progress.riskProfile || "balanced";
  const held = progress.crashBehavior === "held" || progress.crashBehavior === "bought_more";

  if (profile === "conservative" || profile === "balanced_conservative") {
    return {
      name: "The Steady Guardian",
      icon: "🛡️",
      tagline: "Protect first. Grow always.",
      strengths: ["Capital preservation", "Emotional composure", "Low-risk consistency"],
      blindSpot: "May miss growth opportunities by being too cautious",
    };
  }
  if (profile === "aggressive" || profile === "balanced_growth") {
    return held
      ? {
          name: "The Bold Pioneer",
          icon: "🚀",
          tagline: "Fortune favors the brave — and the disciplined.",
          strengths: ["Growth conviction", "Crash resilience", "Contrarian thinking"],
          blindSpot: "May underestimate risks in euphoric markets",
        }
      : {
          name: "The Thrill Seeker",
          icon: "⚡",
          tagline: "High ambition, learning composure.",
          strengths: ["Growth mindset", "Quick decision-making", "Opportunity recognition"],
          blindSpot: "Panic selling undermines your aggressive strategy",
        };
  }
  return held
    ? {
        name: "The Steady Builder",
        icon: "🧱",
        tagline: "Boring is beautiful. Consistency is wealth.",
        strengths: ["Balanced allocation", "Emotional discipline", "Long-term vision"],
        blindSpot: "Could take slightly more risk given your discipline",
      }
    : {
        name: "The Learning Investor",
        icon: "📚",
        tagline: "Every mistake is a lesson. You're getting there.",
        strengths: ["Self-awareness", "Willingness to learn", "Balanced instincts"],
        blindSpot: "Need to build confidence to hold through volatility",
      };
}

export function DNAReportScreen({
  progress,
  onBack,
}: {
  progress: AcademyProgress;
  onBack: () => void;
}) {
  const personality = getPersonality(progress);
  const completedCount = progress.completedMissions.length;

  const radarData = [
    { trait: "Discipline", value: progress.crashBehavior === "held" || progress.crashBehavior === "bought_more" ? 85 : 40 },
    { trait: "Risk\nAwareness", value: progress.riskProfile === "conservative" ? 90 : progress.riskProfile === "balanced" ? 70 : 50 },
    { trait: "Growth\nMindset", value: progress.riskProfile === "aggressive" ? 90 : progress.riskProfile === "balanced" ? 65 : 40 },
    { trait: "Diversi-\nfication", value: progress.diversificationScore || 65 },
    { trait: "Long-term\nVision", value: progress.longTermScore || 70 },
  ];

  return (
    <>
      <ScreenHeader title="Investment DNA" onBack={onBack} />
      <div className="flex-1 overflow-y-auto bg-background">
        {/* DNA Card — intentionally dark for contrast */}
        <div className="mx-5 my-4">
          <div
            className="bg-gradient-to-br from-[#1A2332] via-[#1F2B3D] to-[#243044] rounded-3xl p-6 relative overflow-hidden"
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 shimmer rounded-3xl" />

            {/* Academy crest */}
            <div className="flex items-center justify-between mb-6 relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap size={16} className="text-primary-foreground" />
                </div>
                <span className="text-white/60 text-[10px] font-medium">WEALTH MANAGER ACADEMY</span>
              </div>
              <span className="text-white/40 text-[10px]">2026</span>
            </div>

            {/* Personality */}
            <div
              className="text-center mb-6 relative"
            >
              <div className="text-5xl mb-3">{personality.icon}</div>
              <h2 className="text-white text-xl font-bold">{personality.name}</h2>
              <p className="text-primary text-xs font-medium mt-1">{personality.tagline}</p>
              <p className="text-white/50 text-[10px] mt-1">{progress.playerName}</p>
            </div>

            {/* Radar chart */}
            <div
              className="h-48 mb-4 relative"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="trait"
                    tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#FFC800"
                    fill="#FFC800"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Strengths */}
            <div
              className="relative"
            >
              <p className="text-white/40 text-[10px] font-medium mb-2">STRENGTHS</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {personality.strengths.map((s) => (
                  <span
                    key={s}
                    className="bg-primary/15 text-primary text-[10px] font-medium px-2.5 py-1 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <p className="text-white/40 text-[10px] font-medium mb-1">BLIND SPOT</p>
              <p className="text-white/60 text-xs">{personality.blindSpot}</p>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 relative"
            >
              <div>
                <p className="text-white/40 text-[10px]">Missions completed</p>
                <p className="text-white font-bold text-sm">{completedCount} / 7</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px]">Total XP</p>
                <p className="text-primary font-bold text-sm">{progress.xp}</p>
              </div>
              <div className="text-right">
                <p className="text-white/30 text-[8px]">Powered by</p>
                <p className="text-white/50 text-[10px] font-bold">PostFinance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-6 space-y-3">
          <Button variant="default" size="lg" className="w-full">
            <Share2 size={16} />
            Share Your DNA
          </Button>
          <Button variant="ghost" size="lg" className="w-full text-muted-foreground" onClick={onBack}>
            Back to Academy
          </Button>
        </div>
      </div>
    </>
  );
}

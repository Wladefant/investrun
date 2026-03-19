"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout } from "@/components/academy/MobileLayout";
import {
  OnboardingFlow,
  type OnboardingResult,
} from "@/components/academy/OnboardingFlow";
import { ArenaMultiplayer } from "@/components/academy/arena/ArenaMultiplayer";
import { AcademyAppInner } from "@/components/academy/AcademyAppInner";
import {
  Loader2,
  Users,
  Swords,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAllocationFromRisk,
  calculateRoundReturn,
  applyRoundReturn,
  getVolatilityScale,
  getRiskLabel,
  formatCHF,
  getReturnPercentage,
} from "@/lib/arena-engine";
import type { ArenaRoom } from "@/lib/arena-rooms";

type PitchPhase = "onboarding" | "matchmaking" | "countdown" | "match" | "waiting" | "reveal" | "results" | "full_app";

const STARTING_CAPITAL = 10000;
const TOTAL_ROUNDS = 5;
const ROUND_TIMER = 15;

function getEventStyle(type: string) {
  if (type === "crash" || type === "crisis") return { border: "border-red-500/30", bg: "bg-red-500/5", dotColor: "bg-red-500", icon: "text-red-500" };
  if (type === "bull" || type === "boom") return { border: "border-emerald-500/30", bg: "bg-emerald-500/5", dotColor: "bg-emerald-500", icon: "text-emerald-500" };
  return { border: "border-amber-500/30", bg: "bg-amber-500/5", dotColor: "bg-amber-500", icon: "text-amber-500" };
}

export default function PitchPage() {
  const [phase, setPhase] = useState<PitchPhase>("onboarding");
  const [playerName, setPlayerName] = useState("Player");
  const [roomId, setRoomId] = useState("");
  const [role, setRole] = useState<"host" | "guest">("host");
  const [room, setRoom] = useState<ArenaRoom | null>(null);
  const [matchToken, setMatchToken] = useState("");

  // Match state
  const [timer, setTimer] = useState(ROUND_TIMER);
  const [playerRisk, setPlayerRisk] = useState(50);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [countdownNum, setCountdownNum] = useState(3);

  // Polling
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const startPolling = useCallback((id: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/arena/rooms/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRoom(data.room);
        }
      } catch { /* ignore */ }
    }, 600);
  }, [stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // Sync phase from room status
  useEffect(() => {
    if (!room) return;
    if (room.status === "playing" && (phase === "matchmaking" || phase === "countdown" || phase === "reveal")) {
      if (phase === "matchmaking") {
        setPhase("countdown");
        setCountdownNum(3);
      } else if (phase === "reveal") {
        setHasSubmitted(false);
        setPlayerRisk(50);
        setTimer(ROUND_TIMER);
        setPhase("match");
      }
    }
    if (room.status === "reveal" && phase !== "reveal" && phase !== "results") {
      setPhase("reveal");
    }
    if (room.status === "finished" && phase !== "results") {
      setPhase("results");
    }
  }, [room, phase]);

  // Countdown
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdownNum <= 0) {
      setPhase("match");
      setTimer(ROUND_TIMER);
      return;
    }
    const t = setTimeout(() => setCountdownNum((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdownNum]);

  // Match timer
  useEffect(() => {
    if (phase !== "match" || hasSubmitted) return;
    if (timer <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timer, hasSubmitted]);

  // Onboarding complete → enter matchmaking
  const handleOnboardingComplete = async (result: OnboardingResult) => {
    setPlayerName(result.name);
    setPhase("matchmaking");

    try {
      const res = await fetch("/api/arena/matchmake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: result.name }),
      });
      const data = await res.json();
      setMatchToken(data.token);
      setRoomId(data.roomId);
      setRole(data.role);
      startPolling(data.roomId);

      if (data.matched) {
        // Already matched — start countdown
        setPhase("countdown");
        setCountdownNum(3);
      }
      // Otherwise, polling will detect when the room status changes
    } catch {
      // Retry after a bit
      setTimeout(() => handleOnboardingComplete(result), 2000);
    }
  };

  const handleSubmit = async () => {
    if (hasSubmitted || !room) return;
    setHasSubmitted(true);

    try {
      const res = await fetch(`/api/arena/rooms/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decide", player: role, risk: playerRisk }),
      });
      const data = await res.json();

      if (data.bothReady) {
        const event = room.rounds[room.currentRound - 1];
        const volScale = getVolatilityScale(room.timeHorizon);
        const hostAlloc = getAllocationFromRisk(data.room.hostCurrentDecision);
        const guestAlloc = getAllocationFromRisk(data.room.guestCurrentDecision);
        const hostReturn = calculateRoundReturn(hostAlloc, event.assetImpacts, volScale);
        const guestReturn = calculateRoundReturn(guestAlloc, event.assetImpacts, volScale);
        const hostPrev = data.room.hostPortfolio[data.room.hostPortfolio.length - 1];
        const guestPrev = data.room.guestPortfolio[data.room.guestPortfolio.length - 1];
        const hostValue = applyRoundReturn(hostPrev, hostReturn);
        const guestValue = applyRoundReturn(guestPrev, guestReturn);

        await fetch(`/api/arena/rooms/${roomId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "advance", hostValue, guestValue }),
        });
      } else {
        setPhase("waiting");
      }
    } catch { /* polling will catch up */ }
  };

  const handleNextRound = async () => {
    if (role !== "host") return;
    try {
      await fetch(`/api/arena/rooms/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "next_round" }),
      });
    } catch { /* polling */ }
  };

  // Derived data
  const myPortfolio = role === "host" ? room?.hostPortfolio : room?.guestPortfolio;
  const oppPortfolio = role === "host" ? room?.guestPortfolio : room?.hostPortfolio;
  const myDecisions = role === "host" ? room?.hostDecisions : room?.guestDecisions;
  const oppDecisions = role === "host" ? room?.guestDecisions : room?.hostDecisions;
  const opponentName = role === "host" ? room?.guestName : room?.hostName;
  const currentEvent = room?.rounds[(room?.currentRound ?? 1) - 1];

  // After match, redirect to main app with name in URL
  if (phase === "full_app") {
    if (typeof window !== "undefined") {
      window.location.href = `/?name=${encodeURIComponent(playerName)}`;
    }
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </MobileLayout>
    );
  }


  // Onboarding renders directly without AnimatePresence wrapper to avoid flex layout issues
  if (phase === "onboarding") {
    return (
      <MobileLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <AnimatePresence mode="wait">

          {/* Matchmaking */}
          {phase === "matchmaking" && (
            <motion.div key="matchmaking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center"
              >
                <Users size={36} className="text-primary" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Finding an opponent...</h2>
                <p className="text-sm text-muted-foreground">Waiting for another player to join</p>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2.5 h-2.5 bg-primary rounded-full" />
                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2.5 h-2.5 bg-primary rounded-full" />
                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2.5 h-2.5 bg-primary rounded-full" />
              </div>
            </motion.div>
          )}

          {/* Countdown */}
          {phase === "countdown" && (
            <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center">
              {opponentName && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground mb-8">
                  {playerName} vs {opponentName}
                </motion.p>
              )}
              <motion.span
                key={countdownNum}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-8xl font-bold text-primary"
              >
                {countdownNum > 0 ? countdownNum : "GO!"}
              </motion.span>
            </motion.div>
          )}

          {/* Match */}
          {phase === "match" && room && currentEvent && (
            <motion.div key={`match-${room.currentRound}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">Round {room.currentRound}/{TOTAL_ROUNDS}</span>
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2", timer > 5 ? "border-emerald-500 text-emerald-500" : "border-red-500 text-red-500")}>{timer}</div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground truncate">{playerName}</p>
                    <p className="text-lg font-bold text-primary">{formatCHF(myPortfolio?.[myPortfolio.length - 1] ?? STARTING_CAPITAL)}</p>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground px-2">VS</div>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground truncate">{opponentName || "Opponent"}</p>
                    <p className="text-lg text-muted-foreground">???</p>
                  </div>
                </div>
              </div>

              {(() => {
                const s = getEventStyle(currentEvent.type);
                return (
                  <div className={cn("rounded-2xl border p-3", s.border, s.bg)}>
                    <p className="font-bold text-foreground text-sm">{currentEvent.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{currentEvent.description}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={cn("w-2 h-2 rounded-full", i < currentEvent.severity ? s.dotColor : "bg-muted")} />
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-foreground">Your Strategy</span>
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", playerRisk <= 30 ? "bg-emerald-500/10 text-emerald-600" : playerRisk <= 70 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600")}>
                    {getRiskLabel(playerRisk)}
                  </span>
                </div>
                <input type="range" min={0} max={100} step={5} value={playerRisk} disabled={hasSubmitted} onChange={(e) => setPlayerRisk(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-50" style={{ background: "linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)" }} />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">Conservative</span>
                  <span className="text-[10px] text-muted-foreground">Balanced</span>
                  <span className="text-[10px] text-muted-foreground">Aggressive</span>
                </div>
              </div>

              <button onClick={handleSubmit} disabled={hasSubmitted} className={cn("w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-primary text-primary-foreground", hasSubmitted && "opacity-50 cursor-not-allowed")}>
                {hasSubmitted ? "Locked In" : "Lock In Decision"}
              </button>
            </motion.div>
          )}

          {/* Waiting */}
          {phase === "waiting" && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-4">
              <p className="text-sm font-semibold text-foreground">Decision locked in!</p>
              <p className="text-sm text-muted-foreground">Waiting for {opponentName || "opponent"}...</p>
              <div className="flex items-center gap-1.5">
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-2 h-2 bg-primary rounded-full" />
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
              </div>
            </motion.div>
          )}

          {/* Reveal */}
          {phase === "reveal" && room && myDecisions && oppDecisions && myPortfolio && oppPortfolio && (
            <motion.div key={`reveal-${room.currentRound}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-4 space-y-4">
              <h2 className="text-xl font-bold text-foreground text-center">Round {room.currentRound} Results</h2>
              {(() => {
                const myRisk = myDecisions[myDecisions.length - 1] ?? 50;
                const oppRisk = oppDecisions[oppDecisions.length - 1] ?? 50;
                const myVal = myPortfolio[myPortfolio.length - 1];
                const myPrev = myPortfolio[myPortfolio.length - 2] ?? STARTING_CAPITAL;
                const oppVal = oppPortfolio[oppPortfolio.length - 1];
                const oppPrev = oppPortfolio[oppPortfolio.length - 2] ?? STARTING_CAPITAL;
                const myChange = myVal - myPrev;
                const oppChange = oppVal - oppPrev;
                const fmt = (c: number) => `${c >= 0 ? "+" : "-"}CHF ${Math.round(Math.abs(c)).toLocaleString("de-CH")}`;
                const iWon = myChange > oppChange;
                const theyWon = oppChange > myChange;
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={cn("bg-card rounded-2xl border border-border p-3 text-center", iWon && "ring-2 ring-primary/30 bg-primary/10")}>
                        <p className="text-xs text-muted-foreground mb-1">You ({getRiskLabel(myRisk)})</p>
                        <span className={cn("text-sm font-bold", myChange >= 0 ? "text-emerald-500" : "text-red-500")}>{fmt(myChange)}</span>
                      </div>
                      <div className={cn("bg-card rounded-2xl border border-border p-3 text-center", theyWon && "ring-2 ring-red-500/30 bg-red-500/5")}>
                        <p className="text-xs text-muted-foreground mb-1">{opponentName} ({getRiskLabel(oppRisk)})</p>
                        <span className={cn("text-sm font-bold", oppChange >= 0 ? "text-emerald-500" : "text-red-500")}>{fmt(oppChange)}</span>
                      </div>
                    </div>
                    <div className={cn("flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold", iWon ? "bg-primary/20 text-primary" : theyWon ? "bg-red-500/10 text-red-500" : "bg-muted text-foreground")}>
                      {iWon ? "You won this round!" : theyWon ? `${opponentName} takes this round` : "Tie!"}
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4 grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Your Total</p>
                        <p className="text-lg font-bold text-foreground">{formatCHF(myVal)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{opponentName}</p>
                        <p className="text-lg font-bold text-foreground">{formatCHF(oppVal)}</p>
                      </div>
                    </div>
                  </>
                );
              })()}
              {role === "host" ? (
                <button onClick={handleNextRound} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold">
                  {room.currentRound >= TOTAL_ROUNDS ? "See Results" : "Next Round →"}
                </button>
              ) : (
                <p className="text-center text-sm text-muted-foreground">Waiting for host to continue...</p>
              )}
            </motion.div>
          )}

          {/* Results */}
          {phase === "results" && room && myPortfolio && oppPortfolio && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 overflow-y-auto p-4 space-y-4">
              {(() => {
                const myFinal = myPortfolio[myPortfolio.length - 1];
                const oppFinal = oppPortfolio[oppPortfolio.length - 1];
                const result = myFinal > oppFinal ? "win" : myFinal < oppFinal ? "loss" : "draw";
                const margin = Math.abs(myFinal - oppFinal);
                return (
                  <>
                    <div className={cn("bg-card rounded-2xl border-2 p-8 flex flex-col items-center gap-3 text-center", result === "win" ? "border-primary bg-primary/5" : result === "loss" ? "border-red-500 bg-red-500/5" : "border-muted")}>
                      <span className="text-6xl">{result === "win" ? "🏆" : result === "loss" ? "🛡️" : "⚔️"}</span>
                      <p className={cn("text-3xl font-bold", result === "win" ? "text-primary" : result === "loss" ? "text-red-500" : "text-foreground")}>
                        {result === "win" ? "Victory!" : result === "loss" ? "Defeat" : "Draw!"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result === "win" ? `You beat ${opponentName} by ${formatCHF(margin)}` : result === "loss" ? `${opponentName} won by ${formatCHF(margin)}` : "Evenly matched!"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card rounded-2xl border border-border p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Your Final</p>
                        <p className="text-2xl font-bold text-foreground">{formatCHF(myFinal)}</p>
                        <p className={cn("text-sm font-semibold mt-1", getReturnPercentage(STARTING_CAPITAL, myFinal) >= 0 ? "text-emerald-500" : "text-red-500")}>
                          {getReturnPercentage(STARTING_CAPITAL, myFinal) >= 0 ? "+" : ""}{getReturnPercentage(STARTING_CAPITAL, myFinal).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-card rounded-2xl border border-border p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">{opponentName}</p>
                        <p className="text-2xl font-bold text-foreground">{formatCHF(oppFinal)}</p>
                        <p className={cn("text-sm font-semibold mt-1", getReturnPercentage(STARTING_CAPITAL, oppFinal) >= 0 ? "text-emerald-500" : "text-red-500")}>
                          {getReturnPercentage(STARTING_CAPITAL, oppFinal) >= 0 ? "+" : ""}{getReturnPercentage(STARTING_CAPITAL, oppFinal).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <button onClick={() => { stopPolling(); setPhase("full_app"); }} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm">
                      Continue
                    </button>
                  </>
                );
              })()}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </MobileLayout>
  );
}

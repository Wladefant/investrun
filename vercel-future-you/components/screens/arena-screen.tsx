"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Trophy,
  Swords,
  Crown,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Zap,
  Medal,
  Users,
  Globe,
  Star,
  Clock,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MOCK_LEADERBOARD, TIER_COLORS } from "@/data/mock-data";
import { MARKET_SCENARIOS, getRandomScenario, getScenarioById } from "@/data/scenarios";
import { formatCurrency, getAllocationFromStrategy } from "@/lib/calculations";

type ArenaPhase = "lobby" | "setup" | "countdown" | "decision" | "reveal" | "complete";

// Opponent personality types
const OPPONENT_PERSONALITIES = {
  cautious: { name: "The Turtle", emoji: "Cautious", bias: -15, description: "Prefers safety over growth" },
  balanced: { name: "The Owl", emoji: "Balanced", bias: 0, description: "Thoughtful and measured" },
  greedy: { name: "The Bull", emoji: "Aggressive", bias: 20, description: "Chases maximum returns" },
  opportunistic: { name: "The Fox", emoji: "Adaptive", bias: 10, description: "Adapts to market conditions" },
};

interface RoundResult {
  round: number;
  event: { id?: string; title: string; description: string; type: string };
  playerStrategy: number;
  opponentStrategy: number;
  playerChange: number;
  opponentChange: number;
  playerTotal: number;
  opponentTotal: number;
}

interface ArenaMatchState {
  scenarioId: string;
  opponentPersonality: keyof typeof OPPONENT_PERSONALITIES;
  currentRound: number;
  totalRounds: number;
  timeHorizon: number;
  playerPortfolio: number;
  opponentPortfolio: number;
  playerStrategy: number;
  opponentStrategy: number;
  currentEvent: (typeof MARKET_SCENARIOS)[0]["events"][0] | null;
  decisionTimeLeft: number;
  roundHistory: RoundResult[];
  hasPlayerDecided: boolean;
}

export function ArenaScreen() {
  const { user, arenaState: persistedArenaState, updateArenaState, resetArenaState } = useAppStore();
  const [phase, setPhase] = useState<ArenaPhase>("lobby");
  const [opponent, setOpponent] = useState<(typeof MOCK_LEADERBOARD)[0] | null>(null);
  const [matchState, setMatchState] = useState<ArenaMatchState | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [showResult, setShowResult] = useState(false);
  const [playerStrategyInput, setPlayerStrategyInput] = useState(50);

  // Restore state on mount
  useEffect(() => {
    if (persistedArenaState.matchId && persistedArenaState.phase !== 'setup' && persistedArenaState.phase !== 'complete') {
      // Could restore match state here if needed
    }
  }, []);

  const selectRandomOpponent = useCallback(() => {
    const randomOpponent = MOCK_LEADERBOARD[Math.floor(Math.random() * MOCK_LEADERBOARD.length)];
    setOpponent(randomOpponent);
    return randomOpponent;
  }, []);

  const getOpponentPersonality = useCallback((): keyof typeof OPPONENT_PERSONALITIES => {
    const personalities = Object.keys(OPPONENT_PERSONALITIES) as (keyof typeof OPPONENT_PERSONALITIES)[];
    return personalities[Math.floor(Math.random() * personalities.length)];
  }, []);

  const startSetup = () => {
    selectRandomOpponent();
    setPhase("setup");
  };

  const startMatch = (timeHorizon: number) => {
    const scenario = getRandomScenario(timeHorizon);
    const personality = getOpponentPersonality();
    
    const initialState: ArenaMatchState = {
      scenarioId: scenario.id,
      opponentPersonality: personality,
      currentRound: 0,
      totalRounds: Math.min(8, scenario.events.length),
      timeHorizon,
      playerPortfolio: 10000,
      opponentPortfolio: 10000,
      playerStrategy: 50,
      opponentStrategy: 50 + OPPONENT_PERSONALITIES[personality].bias,
      currentEvent: null,
      decisionTimeLeft: 15,
      roundHistory: [],
      hasPlayerDecided: false,
    };
    
    setMatchState(initialState);
    updateArenaState({
      matchId: `arena-${Date.now()}`,
      opponentPersonality: personality,
      currentRound: 0,
      totalRounds: initialState.totalRounds,
      timeHorizon,
      phase: 'countdown',
    });
    
    setPhase("countdown");
    setCountdown(3);
  };

  // Countdown effect
  useEffect(() => {
    if (phase !== "countdown") return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      startNextRound();
    }
  }, [phase, countdown]);

  const startNextRound = () => {
    if (!matchState) return;
    
    const scenario = getScenarioById(matchState.scenarioId);
    if (!scenario) return;
    
    const nextRound = matchState.currentRound + 1;
    if (nextRound > matchState.totalRounds) {
      setPhase("complete");
      updateArenaState({ phase: 'complete' });
      return;
    }
    
    const event = scenario.events[nextRound - 1];
    
    setMatchState(prev => prev ? {
      ...prev,
      currentRound: nextRound,
      currentEvent: event,
      decisionTimeLeft: 15,
      hasPlayerDecided: false,
    } : null);
    
    setPlayerStrategyInput(matchState.playerStrategy);
    setPhase("decision");
    setShowResult(false);
  };

  // Decision timer
  useEffect(() => {
    if (phase !== "decision" || !matchState) return;
    
    if (matchState.decisionTimeLeft > 0) {
      const timer = setTimeout(() => {
        setMatchState(prev => prev ? { ...prev, decisionTimeLeft: prev.decisionTimeLeft - 1 } : null);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto-submit with current strategy
      submitDecision();
    }
  }, [phase, matchState?.decisionTimeLeft]);

  const submitDecision = () => {
    if (!matchState || !matchState.currentEvent) return;
    
    const event = matchState.currentEvent;
    const personality = OPPONENT_PERSONALITIES[matchState.opponentPersonality];
    
    // Calculate opponent strategy based on personality and event
    let opponentStrategy = 50 + personality.bias;
    if (event.type === "crash" || event.type === "crisis") {
      // Cautious gets more conservative, greedy stays aggressive
      opponentStrategy = matchState.opponentPersonality === "cautious" 
        ? 20 
        : matchState.opponentPersonality === "greedy" 
          ? 60 
          : 40;
    } else if (event.type === "bull" || event.type === "boom") {
      opponentStrategy = matchState.opponentPersonality === "greedy" 
        ? 85 
        : matchState.opponentPersonality === "cautious" 
          ? 50 
          : 65;
    }
    
    // Apply some randomness
    opponentStrategy = Math.max(10, Math.min(90, opponentStrategy + (Math.random() - 0.5) * 20));
    
    // Calculate returns based on event asset impacts and strategy allocation
    const playerAllocation = getAllocationFromStrategy(playerStrategyInput);
    const opponentAllocation = getAllocationFromStrategy(opponentStrategy);
    
    // Calculate weighted return based on allocation and event impacts
    const calculateWeightedReturn = (allocations: { assetClass: string; percentage: number }[]) => {
      let totalReturn = 0;
      for (const alloc of allocations) {
        const impact = event.assetImpacts?.[alloc.assetClass as keyof typeof event.assetImpacts] || 0;
        totalReturn += (alloc.percentage / 100) * impact;
      }
      // Add a small base return for assets not directly impacted
      return totalReturn || (event.severity > 3 ? -0.05 : 0.03);
    };
    
    const playerReturn = calculateWeightedReturn(playerAllocation.allocations);
    const opponentReturn = calculateWeightedReturn(opponentAllocation.allocations);
    
    const playerChange = matchState.playerPortfolio * playerReturn;
    const opponentChange = matchState.opponentPortfolio * opponentReturn;
    
    const newPlayerPortfolio = matchState.playerPortfolio + playerChange;
    const newOpponentPortfolio = matchState.opponentPortfolio + opponentChange;
    
    const roundResult: RoundResult = {
      round: matchState.currentRound,
      event: { title: event.title, description: event.description, type: event.type },
      playerStrategy: playerStrategyInput,
      opponentStrategy: Math.round(opponentStrategy),
      playerChange,
      opponentChange,
      playerTotal: newPlayerPortfolio,
      opponentTotal: newOpponentPortfolio,
    };
    
    setMatchState(prev => prev ? {
      ...prev,
      playerPortfolio: newPlayerPortfolio,
      opponentPortfolio: newOpponentPortfolio,
      playerStrategy: playerStrategyInput,
      opponentStrategy: Math.round(opponentStrategy),
      roundHistory: [...prev.roundHistory, roundResult],
      hasPlayerDecided: true,
    } : null);
    
    updateArenaState({
      currentRound: matchState.currentRound,
      playerScore: newPlayerPortfolio,
      opponentScore: newOpponentPortfolio,
    });
    
    setPhase("reveal");
  };

  // Auto-advance from reveal after delay
  useEffect(() => {
    if (phase !== "reveal") return;
    
    const timer = setTimeout(() => {
      if (matchState && matchState.currentRound >= matchState.totalRounds) {
        setPhase("complete");
        updateArenaState({ phase: 'complete' });
      } else {
        setShowResult(false);
        setPhase("countdown");
        setCountdown(2);
      }
    }, 3500);
    
    return () => clearTimeout(timer);
  }, [phase, matchState?.currentRound, matchState?.totalRounds]);

  const resetArena = () => {
    setPhase("lobby");
    setOpponent(null);
    setMatchState(null);
    setCountdown(3);
    setShowResult(false);
    resetArenaState();
  };

  const TierIcon = ({ tier }: { tier: string }) => {
    const tierIcons: Record<string, React.ReactNode> = {
      diamond: <Crown className="h-4 w-4" />,
      platinum: <Trophy className="h-4 w-4" />,
      gold: <Star className="h-4 w-4" />,
      silver: <Medal className="h-4 w-4" />,
      bronze: <Target className="h-4 w-4" />,
    };
    return <>{tierIcons[tier] || <Medal className="h-4 w-4" />}</>;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "crash":
      case "bear":
        return <TrendingDown className="h-5 w-5 text-red-400" />;
      case "bull":
      case "boom":
        return <TrendingUp className="h-5 w-5 text-emerald-400" />;
      case "recovery":
        return <RefreshCw className="h-5 w-5 text-blue-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-4">
      <AnimatePresence mode="wait">
        {/* LOBBY */}
        {phase === "lobby" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-4"
          >
            {/* Header */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
                    <Swords className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-2xl font-bold text-balance">Investment Arena</h2>
                    <p className="text-sm text-muted-foreground">
                      Turn-based strategy battles under real market conditions
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{user?.rank || "#--"}</p>
                    <p className="text-xs text-muted-foreground">Your Rank</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{user?.eloScore || 1000}</p>
                    <p className="text-xs text-muted-foreground">ELO Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold capitalize text-chart-3">{user?.tier || "bronze"}</p>
                    <p className="text-xs text-muted-foreground">Tier</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Match */}
            <Card>
              <CardContent className="p-6">
                <Button
                  onClick={startSetup}
                  className="h-16 w-full text-lg font-semibold"
                  size="lg"
                >
                  <Zap className="mr-2 h-6 w-6" />
                  Start Battle
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  8 rounds | Same market events for both players | Make strategic decisions
                </p>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="border-chart-2/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">How Arena Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">1</div>
                  <div>
                    <p className="font-medium text-sm">Same Events, Different Choices</p>
                    <p className="text-xs text-muted-foreground">Both players face identical market scenarios</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">2</div>
                  <div>
                    <p className="font-medium text-sm">15 Seconds to Decide</p>
                    <p className="text-xs text-muted-foreground">Adjust your risk slider before time runs out</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">3</div>
                  <div>
                    <p className="font-medium text-sm">See the Results</p>
                    <p className="text-xs text-muted-foreground">Compare strategies and learn from each round</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-chart-3" />
                    Leaderboard
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Tabs defaultValue="global" className="w-full">
                  <TabsList className="mb-4 grid w-full grid-cols-2">
                    <TabsTrigger value="global" className="text-sm">
                      <Globe className="mr-1.5 h-4 w-4" />
                      Global
                    </TabsTrigger>
                    <TabsTrigger value="friends" className="text-sm">
                      <Users className="mr-1.5 h-4 w-4" />
                      Friends
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="global" className="space-y-2">
                    {MOCK_LEADERBOARD.slice(0, 7).map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-3 rounded-xl p-3 ${
                          index < 3 ? "bg-primary/5" : "bg-secondary/50"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                            index === 0
                              ? "bg-chart-3 text-background"
                              : index === 1
                                ? "bg-muted-foreground/50 text-foreground"
                                : index === 2
                                  ? "bg-chart-5 text-background"
                                  : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {player.rank}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{player.username}</span>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: TIER_COLORS[player.tier as keyof typeof TIER_COLORS],
                                color: TIER_COLORS[player.tier as keyof typeof TIER_COLORS],
                              }}
                            >
                              <TierIcon tier={player.tier} />
                              <span className="ml-1 capitalize">{player.tier}</span>
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {player.wins}W - {player.losses}L
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold">{player.eloScore}</p>
                        </div>
                      </motion.div>
                    ))}
                  </TabsContent>

                  <TabsContent value="friends" className="py-8 text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-muted-foreground">Invite friends to compete!</p>
                    <Button variant="outline" className="mt-4" size="sm">
                      Share Invite Link
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* SETUP */}
        {phase === "setup" && opponent && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-4"
          >
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-center flex-1">
                    <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-2xl mb-2">
                      {user?.username?.[0]?.toUpperCase() || "Y"}
                    </div>
                    <p className="font-medium">You</p>
                    <p className="text-xs text-muted-foreground">{user?.eloScore || 1000} ELO</p>
                  </div>
                  
                  <div className="flex flex-col items-center px-4">
                    <Swords className="h-8 w-8 text-primary mb-2" />
                    <span className="text-lg font-bold text-muted-foreground">VS</span>
                  </div>
                  
                  <div className="text-center flex-1">
                    <div className="h-16 w-16 mx-auto rounded-full bg-chart-4/20 flex items-center justify-center text-2xl mb-2">
                      {opponent?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <p className="font-medium">{opponent?.username || "Opponent"}</p>
                    <p className="text-xs text-muted-foreground">{opponent?.eloScore || 1000} ELO</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Investment Horizon</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[20, 30, 40].map((years) => (
                        <Button
                          key={years}
                          variant="outline"
                          className="h-12"
                          onClick={() => startMatch(years)}
                        >
                          {years} Years
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button variant="ghost" onClick={resetArena} className="text-muted-foreground">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </motion.div>
        )}

        {/* COUNTDOWN */}
        {phase === "countdown" && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="flex min-h-[50vh] flex-col items-center justify-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-8xl font-bold text-primary"
            >
              {countdown > 0 ? countdown : "GO!"}
            </motion.div>
            <p className="mt-4 text-muted-foreground">
              {matchState && matchState.currentRound === 0 
                ? "Get ready..." 
                : `Round ${(matchState?.currentRound || 0) + 1} starting...`}
            </p>
          </motion.div>
        )}

        {/* DECISION PHASE */}
        {phase === "decision" && matchState && matchState.currentEvent && (
          <motion.div
            key="decision"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-4"
          >
            {/* Timer & Round */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-sm">
                Round {matchState.currentRound} / {matchState.totalRounds}
              </Badge>
              <div className={`flex items-center gap-2 font-mono text-lg font-bold ${
                matchState.decisionTimeLeft <= 5 ? "text-red-400" : "text-primary"
              }`}>
                <Clock className="h-5 w-5" />
                {matchState.decisionTimeLeft}s
              </div>
            </div>

            {/* Scores */}
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">You</p>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(matchState.playerPortfolio)}
                    </p>
                  </div>
                  <div className="text-muted-foreground">VS</div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{opponent?.username}</p>
                    <p className="text-xl font-bold text-chart-4">
                      {formatCurrency(matchState.opponentPortfolio)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Event */}
            <Card className={`${
              matchState.currentEvent.type === "crash" || matchState.currentEvent.type === "crisis"
                ? "border-red-500/30 bg-red-500/5" 
                : "border-emerald-500/30 bg-emerald-500/5"
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getEventIcon(matchState.currentEvent.type)}
                  <div>
                    <h3 className="font-bold">{matchState.currentEvent.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {matchState.currentEvent.description}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`mt-2 ${
                        matchState.currentEvent.type === "crash" || matchState.currentEvent.type === "crisis"
                          ? "border-red-500/50 text-red-400" 
                          : "border-emerald-500/50 text-emerald-400"
                      }`}
                    >
                      Severity: {matchState.currentEvent.severity}/5 - {matchState.currentEvent.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Slider */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Your Strategy</span>
                  <Badge variant={
                    playerStrategyInput <= 30 ? "secondary" : 
                    playerStrategyInput <= 60 ? "default" : 
                    "destructive"
                  }>
                    {getAllocationFromStrategy(playerStrategyInput).label}
                  </Badge>
                </div>
                
                <Slider
                  value={[playerStrategyInput]}
                  onValueChange={([val]) => setPlayerStrategyInput(val)}
                  min={0}
                  max={100}
                  step={5}
                  className="mb-4"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservative</span>
                  <span>Balanced</span>
                  <span>Aggressive</span>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={submitDecision}
              className="h-14 text-lg"
              disabled={matchState.hasPlayerDecided}
            >
              <Check className="mr-2 h-5 w-5" />
              Lock In Decision
            </Button>
          </motion.div>
        )}

        {/* REVEAL PHASE */}
        {phase === "reveal" && matchState && matchState.roundHistory.length > 0 && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col gap-4"
          >
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-bold text-center mb-6">
                  Round {matchState.currentRound} Results
                </h3>
                
                {(() => {
                  const lastRound = matchState.roundHistory[matchState.roundHistory.length - 1];
                  const playerWon = lastRound.playerChange > lastRound.opponentChange;
                  const tie = lastRound.playerChange === lastRound.opponentChange;
                  
                  return (
                    <div className="space-y-6">
                      {/* Strategies Comparison */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl text-center ${playerWon ? "bg-primary/10 ring-2 ring-primary/30" : "bg-secondary/50"}`}>
                          <p className="text-sm text-muted-foreground mb-1">Your Strategy</p>
                          <p className="text-lg font-bold">{getAllocationFromStrategy(lastRound.playerStrategy).label}</p>
                          <p className={`text-2xl font-bold mt-2 ${lastRound.playerChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {lastRound.playerChange >= 0 ? "+" : ""}{formatCurrency(lastRound.playerChange)}
                          </p>
                        </div>
                        <div className={`p-4 rounded-xl text-center ${!playerWon && !tie ? "bg-chart-4/10 ring-2 ring-chart-4/30" : "bg-secondary/50"}`}>
                          <p className="text-sm text-muted-foreground mb-1">Opponent&apos;s Strategy</p>
                          <p className="text-lg font-bold">{getAllocationFromStrategy(lastRound.opponentStrategy).label}</p>
                          <p className={`text-2xl font-bold mt-2 ${lastRound.opponentChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {lastRound.opponentChange >= 0 ? "+" : ""}{formatCurrency(lastRound.opponentChange)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Winner Banner */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`p-4 rounded-xl text-center ${
                          playerWon 
                            ? "bg-primary/20 text-primary" 
                            : tie 
                              ? "bg-secondary text-foreground"
                              : "bg-chart-4/20 text-chart-4"
                        }`}
                      >
                        {playerWon ? (
                          <>
                            <Sparkles className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-bold text-lg">You won this round!</p>
                          </>
                        ) : tie ? (
                          <>
                            <Shield className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-bold text-lg">It&apos;s a tie!</p>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-bold text-lg">Opponent takes this round</p>
                          </>
                        )}
                      </motion.div>
                      
                      {/* Current Totals */}
                      <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Your Total</p>
                          <p className="text-xl font-bold">{formatCurrency(lastRound.playerTotal)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Opponent Total</p>
                          <p className="text-xl font-bold">{formatCurrency(lastRound.opponentTotal)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
            
            <p className="text-center text-sm text-muted-foreground">
              {matchState.currentRound < matchState.totalRounds 
                ? "Next round starting soon..." 
                : "Final results coming..."}
            </p>
          </motion.div>
        )}

        {/* COMPLETE */}
        {phase === "complete" && matchState && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <Card className={`border-2 ${
              matchState.playerPortfolio > matchState.opponentPortfolio
                ? "border-primary bg-primary/5"
                : matchState.playerPortfolio < matchState.opponentPortfolio
                  ? "border-chart-4 bg-chart-4/5"
                  : "border-muted bg-secondary/50"
            }`}>
              <CardContent className="p-6 text-center">
                {matchState.playerPortfolio > matchState.opponentPortfolio ? (
                  <>
                    <Trophy className="h-16 w-16 mx-auto text-primary mb-4" />
                    <h2 className="font-display text-3xl font-bold text-primary">Victory!</h2>
                    <p className="text-muted-foreground mt-2">
                      You outperformed {opponent?.username} by {formatCurrency(matchState.playerPortfolio - matchState.opponentPortfolio)}
                    </p>
                  </>
                ) : matchState.playerPortfolio < matchState.opponentPortfolio ? (
                  <>
                    <Shield className="h-16 w-16 mx-auto text-chart-4 mb-4" />
                    <h2 className="font-display text-3xl font-bold text-chart-4">Defeat</h2>
                    <p className="text-muted-foreground mt-2">
                      {opponent?.username} won by {formatCurrency(matchState.opponentPortfolio - matchState.playerPortfolio)}
                    </p>
                  </>
                ) : (
                  <>
                    <Swords className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="font-display text-3xl font-bold">Draw!</h2>
                    <p className="text-muted-foreground mt-2">An evenly matched battle</p>
                  </>
                )}
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-background/50 rounded-xl">
                    <p className="text-xs text-muted-foreground">Your Final</p>
                    <p className="text-2xl font-bold">{formatCurrency(matchState.playerPortfolio)}</p>
                    <p className={`text-sm ${matchState.playerPortfolio >= 10000 ? "text-emerald-400" : "text-red-400"}`}>
                      {matchState.playerPortfolio >= 10000 ? "+" : ""}
                      {((matchState.playerPortfolio - 10000) / 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 bg-background/50 rounded-xl">
                    <p className="text-xs text-muted-foreground">Opponent Final</p>
                    <p className="text-2xl font-bold">{formatCurrency(matchState.opponentPortfolio)}</p>
                    <p className={`text-sm ${matchState.opponentPortfolio >= 10000 ? "text-emerald-400" : "text-red-400"}`}>
                      {matchState.opponentPortfolio >= 10000 ? "+" : ""}
                      {((matchState.opponentPortfolio - 10000) / 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Round History */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Round History</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {matchState.roundHistory.map((round, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg text-sm">
                    <span className="text-muted-foreground">R{round.round}</span>
                    <span className="truncate flex-1 mx-2 text-xs">{round.event.name}</span>
                    <div className="flex gap-2">
                      <span className={round.playerChange >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {round.playerChange >= 0 ? "+" : ""}{(round.playerChange / 100).toFixed(0)}%
                      </span>
                      <span className="text-muted-foreground">vs</span>
                      <span className={round.opponentChange >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {round.opponentChange >= 0 ? "+" : ""}{(round.opponentChange / 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={resetArena}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Back to Lobby
              </Button>
              <Button className="flex-1" onClick={startSetup}>
                <Zap className="mr-2 h-4 w-4" />
                Rematch
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

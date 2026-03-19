'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Users,
  Copy,
  Check,
  ArrowLeft,
  Zap,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Shield,
  Sparkles,
  Trophy,
  Swords,
  ArrowRight,
  RotateCcw,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getAllocationFromRisk,
  calculateRoundReturn,
  applyRoundReturn,
  getVolatilityScale,
  getRiskLabel,
  formatCHF,
  getReturnPercentage,
} from '@/lib/arena-engine';
import { MARKET_SCENARIOS, getArenaRounds, getRandomScenario } from '@/data/arena-scenarios';
import type { ArenaRoom } from '@/lib/arena-rooms';
import type { ScenarioEvent } from '@/data/arena-scenarios';
import { fetchArenaAI, buildMultiplayerRoundContext, buildMultiplayerMatchContext } from '@/lib/arena-ai';
import { useTypewriter } from '@/hooks/useTypewriter';

// --- Types ---

type Phase = 'choose' | 'hosting' | 'joining' | 'setup' | 'countdown' | 'match' | 'waiting' | 'reveal' | 'results';

interface ArenaMultiplayerProps {
  playerName: string;
  onBack: () => void;
}

// --- Helpers ---

const STARTING_CAPITAL = 10000;
const TOTAL_ROUNDS = 8;
const ROUND_TIMER = 15;

function getEventStyle(type: string) {
  if (type === 'crash' || type === 'crisis') return { border: 'border-red-500/30', bg: 'bg-red-500/5', dotColor: 'bg-red-500', icon: <TrendingDown size={18} className="text-red-500" /> };
  if (type === 'bull' || type === 'boom') return { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', dotColor: 'bg-emerald-500', icon: <TrendingUp size={18} className="text-emerald-500" /> };
  if (type === 'recovery') return { border: 'border-amber-500/30', bg: 'bg-amber-500/5', dotColor: 'bg-amber-500', icon: <RefreshCw size={18} className="text-amber-500" /> };
  return { border: 'border-amber-500/30', bg: 'bg-amber-500/5', dotColor: 'bg-amber-500', icon: <AlertTriangle size={18} className="text-amber-500" /> };
}

// --- Main Component ---

export function ArenaMultiplayer({ playerName, onBack }: ArenaMultiplayerProps) {
  const [phase, setPhase] = useState<Phase>('choose');
  const [roomId, setRoomId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [room, setRoom] = useState<ArenaRoom | null>(null);
  const [role, setRole] = useState<'host' | 'guest'>('host');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Match state
  const [timer, setTimer] = useState(ROUND_TIMER);
  const [playerRisk, setPlayerRisk] = useState(50);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [countdownNum, setCountdownNum] = useState(3);

  // AI analysis state
  const [roundAiText, setRoundAiText] = useState<string | null>(null);
  const [roundAiLoading, setRoundAiLoading] = useState(false);
  const [matchAiText, setMatchAiText] = useState<string | null>(null);
  const [matchAiLoading, setMatchAiLoading] = useState(false);
  const roundAiFetched = useRef(false);
  const matchAiFetched = useRef(false);

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

  // Sync phase from room status changes
  useEffect(() => {
    if (!room) return;

    if (room.status === 'ready' && phase === 'hosting') {
      // Guest joined — if host, move to setup
      if (role === 'host') setPhase('setup');
      else setPhase('setup'); // guest waits for host to set up
    }
    if (room.status === 'playing' && (phase === 'setup' || phase === 'countdown' || phase === 'reveal')) {
      if (phase !== 'countdown') {
        setHasSubmitted(false);
        setPlayerRisk(50);
        setTimer(ROUND_TIMER);
        setPhase('match');
      }
    }
    if (room.status === 'reveal' && phase !== 'reveal' && phase !== 'results') {
      setPhase('reveal');
      // Reset AI for new round reveal
      roundAiFetched.current = false;
      setRoundAiText(null);
      setRoundAiLoading(true);
    }
    if (room.status === 'finished' && phase !== 'results') {
      setPhase('results');
    }
  }, [room, phase, role]);

  // --- Actions ---

  const createRoom = async () => {
    setError('');
    try {
      const res = await fetch('/api/arena/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: playerName }),
      });
      const data = await res.json();
      setRoomId(data.roomId);
      setRoom(data.room);
      setRole('host');
      setPhase('hosting');
      startPolling(data.roomId);
    } catch { setError('Failed to create room'); }
  };

  const handleJoin = async () => {
    if (joinCode.length < 5) { setError('Enter the 5-letter room code'); return; }
    setError('');
    try {
      const res = await fetch(`/api/arena/rooms/${joinCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', guestName: playerName }),
      });
      if (!res.ok) { setError('Room not found or already full'); return; }
      const data = await res.json();
      setRoomId(joinCode.toUpperCase());
      setRoom(data.room);
      setRole('guest');
      setPhase('setup');
      startPolling(joinCode.toUpperCase());
    } catch { setError('Failed to join room'); }
  };

  const handleSetup = async (horizon: 20 | 30 | 40) => {
    if (role !== 'host') return;
    const scenario = getRandomScenario(horizon);
    if (!scenario) return;
    const rounds = getArenaRounds(scenario, TOTAL_ROUNDS).map(e => ({
      title: e.title,
      description: e.description,
      type: e.type,
      severity: e.severity,
      assetImpacts: e.assetImpacts as Record<string, number>,
    }));

    try {
      await fetch(`/api/arena/rooms/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup', scenarioId: scenario.id, timeHorizon: horizon, rounds }),
      });
      // Start countdown
      setPhase('countdown');
      setCountdownNum(3);
    } catch { setError('Failed to start match'); }
  };

  // Countdown effect
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdownNum <= 0) {
      setPhase('match');
      setTimer(ROUND_TIMER);
      return;
    }
    const t = setTimeout(() => setCountdownNum(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdownNum]);

  // Match timer
  useEffect(() => {
    if (phase !== 'match' || hasSubmitted) return;
    if (timer <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timer, hasSubmitted]);

  // Fetch round AI commentary when reveal phase starts
  useEffect(() => {
    if (phase !== 'reveal' || roundAiFetched.current || !room || !myDecisions || !oppDecisions || !myPortfolio || !oppPortfolio) return;
    roundAiFetched.current = true;
    setRoundAiLoading(true);

    const event = room.rounds[room.currentRound - 1];
    if (!event || !opponentName) { setRoundAiLoading(false); return; }

    const ctx = buildMultiplayerRoundContext(
      room.currentRound, room.totalRounds, room.timeHorizon, event,
      myDecisions[myDecisions.length - 1] ?? 50,
      opponentName,
      oppDecisions[oppDecisions.length - 1] ?? 50,
      myPortfolio, oppPortfolio,
    );
    fetchArenaAI('round', ctx).then(t => { setRoundAiText(t); setRoundAiLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, room?.currentRound]);

  // Fetch match AI analysis when results phase starts
  useEffect(() => {
    if (phase !== 'results' || matchAiFetched.current || !room || !myPortfolio || !oppPortfolio || !myDecisions || !oppDecisions) return;
    matchAiFetched.current = true;
    setMatchAiLoading(true);

    const myFinal = myPortfolio[myPortfolio.length - 1];
    const oppFinal = oppPortfolio[oppPortfolio.length - 1];
    const outcome = myFinal > oppFinal ? 'win' as const : myFinal < oppFinal ? 'loss' as const : 'draw' as const;

    const ctx = buildMultiplayerMatchContext(
      room.timeHorizon, outcome, opponentName || 'Opponent',
      myPortfolio, oppPortfolio, myDecisions, oppDecisions, room.rounds,
    );
    fetchArenaAI('match', ctx).then(t => { setMatchAiText(t); setMatchAiLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleSubmit = async () => {
    if (hasSubmitted || !room) return;
    setHasSubmitted(true);

    try {
      const res = await fetch(`/api/arena/rooms/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decide', player: role, risk: playerRisk }),
      });
      const data = await res.json();

      if (data.bothReady) {
        // Calculate returns for both players
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

        // Advance the round on server
        await fetch(`/api/arena/rooms/${roomId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'advance', hostValue, guestValue }),
        });
      } else {
        setPhase('waiting');
      }
    } catch { /* polling will catch up */ }
  };

  const handleNextRound = async () => {
    if (role !== 'host') return;
    try {
      await fetch(`/api/arena/rooms/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'next_round' }),
      });
    } catch { /* polling will catch up */ }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roomUrl = typeof window !== 'undefined' ? `${window.location.origin}?join=${roomId}` : '';

  // Typewriter hooks for AI text
  const { displayed: roundAiDisplayed, done: roundAiDone } = useTypewriter(roundAiText);
  const { displayed: matchAiDisplayed, done: matchAiDone } = useTypewriter(matchAiText);

  // Derive reveal data
  const currentEvent = room?.rounds[(room?.currentRound ?? 1) - 1];
  const myDecisions = role === 'host' ? room?.hostDecisions : room?.guestDecisions;
  const oppDecisions = role === 'host' ? room?.guestDecisions : room?.hostDecisions;
  const myPortfolio = role === 'host' ? room?.hostPortfolio : room?.guestPortfolio;
  const oppPortfolio = role === 'host' ? room?.guestPortfolio : room?.hostPortfolio;
  const opponentName = role === 'host' ? room?.guestName : room?.hostName;

  // --- Render ---

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 space-y-4 pb-8">
        <AnimatePresence mode="wait">

          {/* Phase: Choose host or join */}
          {phase === 'choose' && (
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground">
                <ArrowLeft size={16} /> Back to Lobby
              </button>

              <div className="text-center py-4">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users size={28} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Play vs Friend</h2>
                <p className="text-sm text-muted-foreground mt-1">Challenge a friend in a live investment battle</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={createRoom}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2"
              >
                <Zap size={20} />
                Host a Match
              </motion.button>

              <div className="flex items-center gap-3 px-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
                <p className="text-sm font-semibold text-foreground">Join with code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 5))}
                    placeholder="XXXXX"
                    maxLength={5}
                    className="min-w-0 flex-1 bg-muted rounded-xl px-3 py-3 text-center text-base font-mono font-bold tracking-widest text-foreground outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoin}
                    disabled={joinCode.length < 5}
                    className="shrink-0 px-4 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-40"
                  >
                    Join
                  </motion.button>
                </div>
              </div>

              {error && <p className="text-center text-sm text-red-500">{error}</p>}
            </motion.div>
          )}

          {/* Phase: Hosting — waiting for guest, showing QR */}
          {phase === 'hosting' && (
            <motion.div key="hosting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-center">
              <button onClick={() => { stopPolling(); setPhase('choose'); }} className="flex items-center gap-1 text-sm text-muted-foreground">
                <ArrowLeft size={16} /> Cancel
              </button>

              <h2 className="text-lg font-bold text-foreground">Waiting for opponent...</h2>
              <p className="text-sm text-muted-foreground">Share this QR code or room code</p>

              {/* QR Code */}
              <div className="bg-white rounded-2xl p-6 mx-auto inline-block shadow-sm border border-border">
                <QRCodeSVG value={roomUrl} size={180} level="M" />
              </div>

              {/* Room code */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground mb-2">Room Code</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-mono font-bold tracking-[0.3em] text-foreground">{roomId}</span>
                  <button onClick={copyCode} className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-muted-foreground" />}
                  </button>
                </div>
              </div>

              {/* Pulsing dots */}
              <div className="flex items-center justify-center gap-1.5 py-2">
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-2 h-2 bg-primary rounded-full" />
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
              </div>
            </motion.div>
          )}

          {/* Phase: Setup — host picks time horizon */}
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="bg-card rounded-2xl border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">Match Found!</p>
                <div className="flex items-center justify-center gap-6">
                  <div>
                    <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-lg font-bold text-primary">{playerName.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <p className="text-sm font-bold text-foreground truncate max-w-[80px]">{playerName}</p>
                  </div>
                  <Swords size={24} className="text-muted-foreground" />
                  <div>
                    <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-lg font-bold text-red-500">{(opponentName || '?').slice(0, 2).toUpperCase()}</span>
                    </div>
                    <p className="text-sm font-bold text-foreground truncate max-w-[80px]">{opponentName || 'Waiting...'}</p>
                  </div>
                </div>
              </div>

              {role === 'host' ? (
                <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
                  <p className="text-sm font-bold text-foreground">Investment Horizon</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([20, 30, 40] as const).map((h) => (
                      <motion.button
                        key={h}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSetup(h)}
                        className="bg-muted rounded-xl p-3 text-center hover:ring-2 hover:ring-primary transition-all"
                      >
                        <span className="text-lg font-bold text-foreground">{h}</span>
                        <br />
                        <span className="text-xs text-muted-foreground">Years</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Waiting for host to start the match...</p>
                  <div className="flex items-center justify-center gap-1.5 py-4">
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-2 h-2 bg-primary rounded-full" />
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Phase: Countdown */}
          {phase === 'countdown' && (
            <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center min-h-[400px]">
              <motion.div
                key={countdownNum}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-center"
              >
                <span className="text-8xl font-bold text-primary">{countdownNum > 0 ? countdownNum : 'GO!'}</span>
              </motion.div>
            </motion.div>
          )}

          {/* Phase: Match — playing a round */}
          {phase === 'match' && room && currentEvent && (
            <motion.div key={`match-${room.currentRound}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {/* Top bar */}
              <div className="flex items-center justify-between">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                  Round {room.currentRound}/{TOTAL_ROUNDS}
                </span>
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2', timer > 5 ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500')}>
                  {timer}
                </div>
              </div>

              {/* Score comparison */}
              <div className="bg-card rounded-2xl border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground truncate">{playerName}</p>
                    <p className="text-lg font-bold text-primary">{formatCHF(myPortfolio?.[myPortfolio.length - 1] ?? STARTING_CAPITAL)}</p>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground px-2">VS</div>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground truncate">{opponentName}</p>
                    <p className="text-lg text-muted-foreground">???</p>
                  </div>
                </div>
              </div>

              {/* Event card */}
              {(() => {
                const style = getEventStyle(currentEvent.type);
                return (
                  <div className={cn('rounded-2xl border p-3', style.border, style.bg)}>
                    <div className="flex items-start gap-2 mb-2">
                      <div className="shrink-0 mt-0.5">{style.icon}</div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{currentEvent.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{currentEvent.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={cn('w-2 h-2 rounded-full', i < currentEvent.severity ? style.dotColor : 'bg-muted')} />
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-1">Severity</span>
                    </div>
                  </div>
                );
              })()}

              {/* Risk slider */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-foreground">Your Strategy</span>
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', playerRisk <= 30 ? 'bg-emerald-500/10 text-emerald-600' : playerRisk <= 70 ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600')}>
                    {getRiskLabel(playerRisk)}
                  </span>
                </div>
                <input type="range" min={0} max={100} step={5} value={playerRisk} disabled={hasSubmitted} onChange={(e) => setPlayerRisk(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-50" style={{ background: 'linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)' }} />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">Conservative</span>
                  <span className="text-[10px] text-muted-foreground">Balanced</span>
                  <span className="text-[10px] text-muted-foreground">Aggressive</span>
                </div>
              </div>

              {/* Submit */}
              <button onClick={handleSubmit} disabled={hasSubmitted} className={cn('w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-primary text-primary-foreground', hasSubmitted && 'opacity-50 cursor-not-allowed')}>
                <Check size={18} />
                {hasSubmitted ? 'Locked In' : 'Lock In Decision'}
              </button>
            </motion.div>
          )}

          {/* Phase: Waiting for opponent */}
          {phase === 'waiting' && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16 space-y-4">
              <p className="text-sm font-semibold text-foreground">Decision locked in!</p>
              <p className="text-sm text-muted-foreground">Waiting for {opponentName} to decide...</p>
              <div className="flex items-center justify-center gap-1.5">
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-2 h-2 bg-primary rounded-full" />
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
              </div>
            </motion.div>
          )}

          {/* Phase: Round reveal */}
          {phase === 'reveal' && room && myDecisions && oppDecisions && myPortfolio && oppPortfolio && (
            <motion.div key={`reveal-${room.currentRound}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h2 className="text-xl font-bold text-foreground text-center">Round {room.currentRound} Results</h2>

              {(() => {
                const myRisk = myDecisions[myDecisions.length - 1] ?? 50;
                const oppRisk = oppDecisions[oppDecisions.length - 1] ?? 50;
                const myVal = myPortfolio[myPortfolio.length - 1] ?? STARTING_CAPITAL;
                const myPrev = myPortfolio[myPortfolio.length - 2] ?? STARTING_CAPITAL;
                const oppVal = oppPortfolio[oppPortfolio.length - 1] ?? STARTING_CAPITAL;
                const oppPrev = oppPortfolio[oppPortfolio.length - 2] ?? STARTING_CAPITAL;
                const myChange = myVal - myPrev;
                const oppChange = oppVal - oppPrev;
                const iWon = myChange > oppChange;
                const theyWon = oppChange > myChange;

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={cn('bg-card rounded-2xl border border-border p-3 text-center', iWon && 'ring-2 ring-primary/30 bg-primary/10')}>
                        <p className="text-sm text-muted-foreground mb-1">Your Strategy</p>
                        <p className="font-bold text-lg text-foreground">{getRiskLabel(myRisk)}</p>
                        <span className={cn('text-sm font-semibold', myChange >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                          {myChange >= 0 ? '+' : '-'}CHF {Math.round(Math.abs(myChange)).toLocaleString('de-CH')}
                        </span>
                      </div>
                      <div className={cn('bg-card rounded-2xl border border-border p-3 text-center', theyWon && 'ring-2 ring-red-500/30 bg-red-500/5')}>
                        <p className="text-sm text-muted-foreground mb-1">{opponentName}</p>
                        <p className="font-bold text-lg text-foreground">{getRiskLabel(oppRisk)}</p>
                        <span className={cn('text-sm font-semibold', oppChange >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                          {oppChange >= 0 ? '+' : '-'}CHF {Math.round(Math.abs(oppChange)).toLocaleString('de-CH')}
                        </span>
                      </div>
                    </div>

                    <div className={cn('flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold', iWon && 'bg-primary/20 text-primary', theyWon && 'bg-red-500/10 text-red-500', !iWon && !theyWon && 'bg-muted text-foreground')}>
                      {iWon && <><Sparkles size={16} /> You won this round!</>}
                      {theyWon && <><TrendingDown size={16} /> {opponentName} takes this round</>}
                      {!iWon && !theyWon && <><Shield size={16} /> Tie!</>}
                    </div>

                    <div className="bg-card rounded-xl border border-border p-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Your Total</p>
                          <p className="text-xl font-bold text-foreground">{formatCHF(myVal)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{opponentName}</p>
                          <p className="text-xl font-bold text-foreground">{formatCHF(oppVal)}</p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* AI Round Analysis */}
              <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={16} className="text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">AI Analysis</span>
                </div>
                {roundAiLoading ? (
                  <div className="flex items-center gap-1 py-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:300ms]" />
                  </div>
                ) : (
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {roundAiDisplayed}
                    {!roundAiDone && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />}
                  </p>
                )}
              </div>

              {role === 'host' ? (
                <button onClick={handleNextRound} disabled={roundAiLoading || !roundAiDone} className={cn('w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2', (roundAiLoading || !roundAiDone) && 'opacity-50 cursor-not-allowed')}>
                  {room.currentRound >= TOTAL_ROUNDS ? 'See Results' : 'Next Round'}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <p className="text-center text-sm text-muted-foreground">Waiting for host to continue...</p>
              )}
            </motion.div>
          )}

          {/* Phase: Final results */}
          {phase === 'results' && room && myPortfolio && oppPortfolio && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {(() => {
                const myFinal = myPortfolio[myPortfolio.length - 1];
                const oppFinal = oppPortfolio[oppPortfolio.length - 1];
                const result = myFinal > oppFinal ? 'win' : myFinal < oppFinal ? 'loss' : 'draw';
                const margin = Math.abs(myFinal - oppFinal);

                return (
                  <>
                    <div className={cn('relative bg-card rounded-2xl border-2 p-6 flex flex-col items-center gap-2 text-center overflow-hidden', result === 'win' && 'border-primary bg-primary/5', result === 'loss' && 'border-red-500 bg-red-500/5', result === 'draw' && 'border-muted bg-muted/50')}>
                      {result === 'win' && <Trophy size={64} className="text-primary" />}
                      {result === 'loss' && <Shield size={64} className="text-red-500" />}
                      {result === 'draw' && <Swords size={64} className="text-foreground" />}
                      <p className={cn('text-3xl font-bold', result === 'win' ? 'text-primary' : result === 'loss' ? 'text-red-500' : 'text-foreground')}>
                        {result === 'win' ? 'Victory!' : result === 'loss' ? 'Defeat' : 'Draw!'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result === 'win' ? `You beat ${opponentName} by ${formatCHF(margin)}` : result === 'loss' ? `${opponentName} won by ${formatCHF(margin)}` : 'An evenly matched battle'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card rounded-2xl border border-border p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Your Final</p>
                        <p className="text-2xl font-bold text-foreground">{formatCHF(myFinal)}</p>
                        <p className={cn('text-sm font-semibold mt-1', getReturnPercentage(STARTING_CAPITAL, myFinal) >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                          {getReturnPercentage(STARTING_CAPITAL, myFinal) >= 0 ? '+' : ''}{getReturnPercentage(STARTING_CAPITAL, myFinal).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-card rounded-2xl border border-border p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">{opponentName}</p>
                        <p className="text-2xl font-bold text-foreground">{formatCHF(oppFinal)}</p>
                        <p className={cn('text-sm font-semibold mt-1', getReturnPercentage(STARTING_CAPITAL, oppFinal) >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                          {getReturnPercentage(STARTING_CAPITAL, oppFinal) >= 0 ? '+' : ''}{getReturnPercentage(STARTING_CAPITAL, oppFinal).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* AI Match Analysis */}
                    <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain size={16} className="text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Match Analysis</span>
                      </div>
                      {matchAiLoading ? (
                        <div className="flex items-center gap-1 py-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:300ms]" />
                        </div>
                      ) : (
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {matchAiDisplayed}
                          {!matchAiDone && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />}
                        </p>
                      )}
                    </div>

                    <button onClick={() => { stopPolling(); onBack(); }} className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground">
                      <RotateCcw size={16} /> Back to Lobby
                    </button>
                  </>
                );
              })()}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

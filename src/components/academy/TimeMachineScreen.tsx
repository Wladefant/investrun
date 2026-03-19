'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  Zap,
  TrendingDown,
  TrendingUp,
  Timer,
  Shield,
  X,
  Newspaper,
  BookOpen,
  BarChart3,
  MessageCircle,
  Send,
  Loader2,
} from 'lucide-react';
import { TIME_MACHINE_ERAS, type HistoricalEra } from '@/data/time-machine-eras';

// ── Typewriter hook ─────────────────────────────────────────────────
function useTypewriter(text: string, speed = 25, active = false) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setDisplayed('');
      setDone(false);
      return;
    }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);

  return { displayed, done };
}

// ── Animated counter hook ───────────────────────────────────────────
function useAnimatedNumber(target: number, duration = 1200, active = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) { setValue(0); return; }
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);

  return value;
}

// ── Parse percentage string to number ───────────────────────────────
function parsePercent(s: string): number {
  return parseInt(s.replace(/[^-\d]/g, ''), 10) || 0;
}

// ── Impact sentiment helpers ────────────────────────────────────────
const POSITIVE_KEYWORDS = /(\+|recovery|Recovery|Peak|Full|high|surge|new high|all-time)/i;
const NEGATIVE_KEYWORDS = /(-\d|down|Down|crash|drops|nadir|freefall|bear|panic|loses|lost|halted)/i;

function isPositiveImpact(text: string): boolean {
  return POSITIVE_KEYWORDS.test(text) && !NEGATIVE_KEYWORDS.test(text);
}

function isNegativeImpact(text: string): boolean {
  return NEGATIVE_KEYWORDS.test(text);
}

// ── Main screen ─────────────────────────────────────────────────────
interface TimeMachineScreenProps {
  onBack: () => void;
}

export function TimeMachineScreen({ onBack }: TimeMachineScreenProps) {
  const [selectedEra, setSelectedEra] = useState<HistoricalEra | null>(null);
  const [showNarration, setShowNarration] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [warpIn, setWarpIn] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setWarpIn(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-background">
      {/* Warp-in flash overlay */}
      <AnimatePresence>
        {warpIn && (
          <motion.div
            className="absolute inset-0 z-50 bg-primary"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[40%] bg-primary/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] bg-primary/3 rounded-full blur-[60px]" />
        <div className="absolute left-[28px] top-[140px] bottom-[20px] w-[2px] bg-gradient-to-b from-primary/30 via-primary/15 to-transparent" />
      </div>

      {/* Header */}
      <motion.div
        className="relative z-10 px-4 pt-2 pb-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-primary active:scale-90 transition-transform">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <span className="text-muted-foreground text-xs font-mono tracking-widest uppercase">
              Time Machine
            </span>
          </div>
          <div className="w-6" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        className="relative z-10 px-6 pb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Travel Through
          <span className="text-primary"> History</span>
        </h1>
        <p className="text-muted-foreground text-xs mt-1">
          Select an era to experience real financial crises
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto relative z-10 px-4 pb-6">
        <div className="space-y-3">
          {TIME_MACHINE_ERAS.map((era, i) => (
            <EraCard key={era.id} era={era} index={i} onSelect={() => setSelectedEra(era)} />
          ))}
        </div>
      </div>

      {/* Era detail overlay */}
      <AnimatePresence>
        {selectedEra && (
          <EraDetailOverlay
            era={selectedEra}
            showNarration={showNarration}
            showChat={showChat}
            onStartNarration={() => setShowNarration(true)}
            onToggleChat={() => setShowChat((c) => !c)}
            onClose={() => {
              setSelectedEra(null);
              setShowNarration(false);
              setShowChat(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Era card on the timeline ────────────────────────────────────────
function EraCard({
  era,
  index,
  onSelect,
}: {
  era: HistoricalEra;
  index: number;
  onSelect: () => void;
}) {
  const isFullJourney = era.id === 'full-journey';
  const numericDrop = parsePercent(era.stats.peakDrop);
  const animatedDrop = useAnimatedNumber(numericDrop, 1000);
  const isPositive = era.stats.peakDrop.startsWith('+');

  return (
    <motion.button
      onClick={onSelect}
      className="w-full text-left relative"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 + index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Timeline dot */}
      <div className="absolute left-[22px] top-[22px] z-10">
        <div
          className="w-[14px] h-[14px] rounded-full border-2"
          style={{ background: era.accentHex, borderColor: era.accentHex }}
        />
      </div>

      {/* Card */}
      <div
        className={`ml-[48px] rounded-2xl overflow-hidden border transition-all active:scale-[0.97] ${
          isFullJourney
            ? 'border-primary/40 bg-primary/10'
            : 'border-border bg-card hover:bg-card/80 shadow-sm'
        }`}
      >
        <div className={`h-1 bg-gradient-to-r ${era.color}`} />

        <div className="p-3.5">
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">{era.emoji}</span>
              <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
                {era.dateRange}
              </span>
            </div>
            {isFullJourney && (
              <span className="text-[9px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">
                Ultimate
              </span>
            )}
          </div>

          <h3 className="text-[15px] font-bold text-foreground leading-tight">{era.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 italic">&ldquo;{era.tagline}&rdquo;</p>

          {/* Hero stat: animated peak drop */}
          <div className="flex items-baseline gap-2 mt-2.5 mb-1">
            <span
              className="text-2xl font-black tracking-tight"
              style={{ color: isPositive ? '#059669' : '#dc2626' }}
            >
              {isPositive ? '+' : '-'}{Math.abs(animatedDrop)}%
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">peak drawdown</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Timer size={11} className="text-blue-500" />
              <span className="text-[10px] text-muted-foreground">{era.stats.recoveryTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield size={11} className="text-emerald-500" />
              <span className="text-[10px] text-muted-foreground">{era.stats.keyAsset}</span>
            </div>
            <ChevronRight size={14} className="text-primary/40 ml-auto" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ── Era detail overlay ──────────────────────────────────────────────
function EraDetailOverlay({
  era,
  showNarration,
  showChat,
  onStartNarration,
  onToggleChat,
  onClose,
}: {
  era: HistoricalEra;
  showNarration: boolean;
  showChat: boolean;
  onStartNarration: () => void;
  onToggleChat: () => void;
  onClose: () => void;
}) {
  const { displayed, done } = useTypewriter(era.narratorOpening, 18, showNarration);
  const scrollRef = useRef<HTMLDivElement>(null);
  const numericDrop = parsePercent(era.stats.peakDrop);
  const animatedDrop = useAnimatedNumber(numericDrop, 1500);
  const isPositiveDrop = era.stats.peakDrop.startsWith('+');

  useEffect(() => {
    if (scrollRef.current && showNarration) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayed, showNarration]);

  return (
    <motion.div
      className="absolute inset-0 z-40 bg-background flex flex-col overflow-hidden"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-15%] right-[-15%] w-[60%] h-[40%] rounded-full blur-[100px] opacity-10"
          style={{ background: era.accentHex }}
        />
      </div>

      {/* Top bar — hidden when chat is open (chat has its own header) */}
      {!showChat && (
        <motion.div
          className="relative z-10 px-4 pt-2 pb-1 flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button onClick={onClose} className="text-muted-foreground active:scale-90 transition-transform">
            <X size={22} />
          </button>
          <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
            {era.dateRange}
          </span>
          {/* Chat toggle */}
          <button
            onClick={onToggleChat}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            showChat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <MessageCircle size={16} />
        </button>
      </motion.div>
      )}

      {/* Chat panel — slides in from bottom */}
      <AnimatePresence>
        {showChat && (
          <NarratorChat era={era} onClose={onToggleChat} />
        )}
      </AnimatePresence>

      {/* Scrollable content (hidden when chat is open) */}
      {!showChat && (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Era header */}
          <motion.div
            className="pt-2 pb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{era.emoji}</span>
              <div className={`h-1 flex-1 rounded-full bg-gradient-to-r ${era.color}`} />
            </div>
            <h2 className="text-2xl font-bold text-foreground leading-tight">{era.title}</h2>
            <p className="text-sm text-muted-foreground italic mt-1">&ldquo;{era.tagline}&rdquo;</p>
          </motion.div>

          {/* Hero stat — BIG animated drawdown */}
          <motion.div
            className="mb-5 flex items-center gap-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div
              className="rounded-2xl p-4 flex-1 text-center border"
              style={{
                borderColor: `${era.accentHex}30`,
                background: `${era.accentHex}08`,
              }}
            >
              <div
                className="text-4xl font-black tracking-tight"
                style={{ color: isPositiveDrop ? '#059669' : '#dc2626' }}
              >
                {isPositiveDrop ? '+' : '-'}{Math.abs(animatedDrop)}%
              </div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                Peak Drawdown
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-card rounded-xl p-2.5 text-center border border-border shadow-sm">
                <Timer size={14} className="text-blue-500 mx-auto mb-0.5" />
                <div className="text-xs font-bold text-foreground">{era.stats.recoveryTime}</div>
                <div className="text-[8px] text-muted-foreground">Recovery</div>
              </div>
              <div className="bg-card rounded-xl p-2.5 text-center border border-border shadow-sm">
                <Shield size={14} className="text-emerald-500 mx-auto mb-0.5" />
                <div className="text-xs font-bold text-foreground">{era.stats.keyAsset}</div>
                <div className="text-[8px] text-muted-foreground">Safe Haven</div>
              </div>
            </div>
          </motion.div>

          {/* Headlines — FIRST */}
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Newspaper size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Headlines</h3>
            </div>
            <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
              {era.headlines.map((headline, i) => (
                <div key={i} className="px-3 py-2.5 flex items-start gap-2">
                  <span className="text-primary/50 text-[10px] font-bold mt-0.5 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[11px] text-foreground/80 leading-tight font-semibold">{headline}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Market Breakdown — SECOND */}
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Market Breakdown</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {era.marketBreakdown.map((market, i) => (
                <motion.div
                  key={i}
                  className="bg-card rounded-xl p-3 border border-border shadow-sm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.04, duration: 0.3 }}
                >
                  <div className="text-[10px] text-muted-foreground font-medium mb-1">{market.name}</div>
                  <div className="flex items-center gap-1.5">
                    {market.isPositive ? (
                      <TrendingUp size={14} className="text-emerald-500" />
                    ) : (
                      <TrendingDown size={14} className="text-red-500" />
                    )}
                    <span
                      className="text-lg font-black tracking-tight"
                      style={{ color: market.isPositive ? '#059669' : '#dc2626' }}
                    >
                      {market.change}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Key events — THIRD — with BOLD impact text */}
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Key Events</h3>
            </div>
            <div className="space-y-2">
              {era.events.map((event, i) => (
                <motion.div
                  key={i}
                  className="bg-card rounded-xl p-3 border border-border shadow-sm overflow-hidden"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.05, duration: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <SeverityDots severity={event.severity} color={era.accentHex} />
                    <span className="text-[10px] font-mono text-muted-foreground">{event.date}</span>
                  </div>
                  <div className="text-[13px] font-bold text-foreground leading-tight mb-2">{event.title}</div>
                  {/* Impact badge — below title, full width, big and colored */}
                  <div
                    className="text-sm font-black px-2.5 py-1 rounded-lg inline-block"
                    style={{
                      color: isPositiveImpact(event.impact) ? '#059669' : isNegativeImpact(event.impact) ? '#dc2626' : 'var(--foreground)',
                      background: isPositiveImpact(event.impact) ? '#05966910' : isNegativeImpact(event.impact) ? '#dc262610' : 'var(--muted)',
                    }}
                  >
                    {event.impact}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Narration section */}
          <AnimatePresence>
            {showNarration && (
              <motion.div
                className="mb-5"
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={14} className="text-primary" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    The Narrator
                  </h3>
                </div>
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    borderColor: `${era.accentHex}30`,
                    background: `${era.accentHex}08`,
                  }}
                >
                  <p className="text-[13px] text-foreground leading-relaxed font-medium">
                    {displayed}
                    {!done && (
                      <motion.span
                        className="inline-block w-[2px] h-[14px] bg-primary ml-0.5 align-middle"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                    )}
                  </p>
                  {done && (
                    <motion.div
                      className="mt-4 pt-3 border-t"
                      style={{ borderColor: `${era.accentHex}20` }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <BookOpen size={12} className="text-primary/60" />
                        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
                          Key Lesson
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{era.keyLesson}</p>
                    </motion.div>
                  )}
                </div>

                {/* Ask the Narrator CTA */}
                {done && (
                  <motion.button
                    onClick={onToggleChat}
                    className="w-full mt-3 py-3 rounded-xl font-bold text-sm bg-muted text-foreground border border-border active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <MessageCircle size={16} className="text-primary" />
                    Ask the Narrator about this era
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Begin Journey button */}
          {!showNarration && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <button
                onClick={onStartNarration}
                className="w-full py-4 rounded-2xl font-bold text-[15px] bg-primary text-primary-foreground active:scale-[0.97] transition-transform shadow-lg pf-glow-sm flex items-center justify-center gap-2"
              >
                <Play size={18} fill="currentColor" />
                Begin Journey
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── AI Chat panel ───────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function NarratorChat({ era, onClose }: { era: HistoricalEra; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Welcome, time traveler. You're exploring the ${era.title} (${era.dateRange}). Ask me anything about this period — what happened, why it happened, what investors did wrong, or what you can learn from it.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/narrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          eraTitle: era.title,
          eraDateRange: era.dateRange,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'The time machine encountered interference. Try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'What was the biggest mistake investors made?',
    'How did the Swiss market react?',
    'What would have been the best strategy?',
  ];

  return (
    <motion.div
      className="flex-1 flex flex-col z-20 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Chat header */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-border">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: `${era.accentHex}20` }}
        >
          <BookOpen size={16} style={{ color: era.accentHex }} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground">The Narrator</div>
          <div className="text-[10px] text-muted-foreground">{era.title}</div>
        </div>
        <button onClick={onClose} className="text-muted-foreground active:scale-90 transition-transform">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-card border border-border text-foreground rounded-bl-md shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <Loader2 size={16} className="text-primary animate-spin" />
            </div>
          </div>
        )}

        {/* Suggestion chips — show only when there are few messages */}
        {messages.length <= 2 && !loading && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(s);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="text-[10px] font-medium bg-muted text-muted-foreground px-2.5 py-1.5 rounded-full border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-background">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about this era..."
            className="flex-1 bg-muted rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 active:scale-90 transition-transform disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Severity dots ───────────────────────────────────────────────────
function SeverityDots({ severity, color }: { severity: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-[5px] h-[5px] rounded-full"
          style={{
            background: i < severity ? color : 'var(--border)',
          }}
        />
      ))}
    </div>
  );
}

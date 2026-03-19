"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  GraduationCap,
  ChevronDown,
  Trophy,
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { Rank } from "@/lib/academy-state";

// --- Types ---

interface ChatMessage {
  id: string;
  role: "professor" | "student";
  content: string;
  timestamp: Date;
  widget?: WidgetData;
}

type WidgetData =
  | { type: "quiz"; topic: string; questionCount: number; xp: number }
  | { type: "achievement"; name: string; xp: number; description?: string }
  | { type: "navigation"; label: string; screen: string }
  | { type: "tip"; title: string; content: string };

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizState {
  isActive: boolean;
  isLoading: boolean;
  topic: string;
  questions: QuizQuestion[];
  currentQuestion: number;
  score: number;
  answered: boolean;
  selectedAnswer: number | null;
  showExplanation: boolean;
  completed: boolean;
}

// --- Quiz Question Bank (English, investment-focused) ---

const QUIZ_BANK: Record<string, QuizQuestion[]> = {
  "Risk Management": [
    { question: "What is diversification?", options: ["Buying one stock", "Spreading investments across asset classes", "Only investing in bonds", "Timing the market"], correctAnswer: 1, explanation: "Diversification reduces risk by spreading your investments across different asset classes, sectors, and regions." },
    { question: "What happens to bond prices when interest rates rise?", options: ["They go up", "They go down", "They stay the same", "They become worthless"], correctAnswer: 1, explanation: "Bond prices and interest rates have an inverse relationship. When rates rise, existing bonds with lower rates become less attractive." },
    { question: "What is the risk-return tradeoff?", options: ["Higher risk always means losses", "Higher potential returns come with higher risk", "Low risk means high returns", "Risk and return are unrelated"], correctAnswer: 1, explanation: "Generally, investments with higher potential returns carry higher risk. Understanding this tradeoff is key to smart investing." },
  ],
  "Compound Interest": [
    { question: "What is compound interest?", options: ["Interest only on the original amount", "Interest on both principal and accumulated interest", "A type of tax", "A bank fee"], correctAnswer: 1, explanation: "Compound interest means you earn interest on your interest, creating exponential growth over time." },
    { question: "Using the Rule of 72, how long to double money at 6% annual return?", options: ["6 years", "12 years", "18 years", "72 years"], correctAnswer: 1, explanation: "The Rule of 72: divide 72 by the interest rate. 72 ÷ 6 = 12 years to double your money." },
    { question: "Why is starting to invest early so important?", options: ["You get lower fees", "Compound interest has more time to work", "Banks pay more to young people", "The stock market is easier for beginners"], correctAnswer: 1, explanation: "Time is the most powerful factor in compound growth. Starting 10 years earlier can mean dramatically more wealth." },
  ],
  "ETFs & Funds": [
    { question: "What does ETF stand for?", options: ["Exchange Traded Fund", "Electronic Transfer Fee", "European Trading Framework", "Equity Trust Fund"], correctAnswer: 0, explanation: "An ETF is an Exchange Traded Fund — a basket of securities that trades on an exchange like a stock." },
    { question: "What is the main advantage of an ETF over individual stocks?", options: ["Guaranteed higher returns", "Automatic diversification", "No fees", "Always tax-free"], correctAnswer: 1, explanation: "ETFs invest in many securities at once, giving you instant diversification and reducing single-stock risk." },
    { question: "What is TER in the context of ETFs?", options: ["Trading Exchange Rate", "Total Expense Ratio", "Tax Efficiency Rating", "Tracking Error Rate"], correctAnswer: 1, explanation: "TER (Total Expense Ratio) shows the annual cost of owning an ETF as a percentage of your investment." },
  ],
  "Market Crashes": [
    { question: "What is a bear market?", options: ["A market that only trades animals", "A decline of 20% or more from recent highs", "A market that goes up slowly", "A market with no trading"], correctAnswer: 1, explanation: "A bear market is defined as a 20%+ decline from recent highs. They're a normal part of market cycles." },
    { question: "What should most long-term investors do during a market crash?", options: ["Sell everything immediately", "Stay calm and hold their positions", "Move everything to gold", "Stop investing entirely"], correctAnswer: 1, explanation: "History shows that panic-selling during crashes locks in losses. Patient investors who held through past crashes were rewarded." },
    { question: "How long did it take the S&P 500 to recover from the 2008 crash?", options: ["6 months", "About 4 years", "10 years", "It never recovered"], correctAnswer: 1, explanation: "The S&P 500 took about 4 years to recover its pre-crash highs, then went on to reach record levels." },
  ],
};

function getQuizQuestions(topic: string): QuizQuestion[] {
  const questions = QUIZ_BANK[topic] || QUIZ_BANK["Risk Management"];
  return [...questions].sort(() => Math.random() - 0.5).slice(0, 3);
}

// --- Widget Components ---

function QuizPreviewWidget({
  topic,
  questionCount,
  xp,
  onStart,
}: {
  topic: string;
  questionCount: number;
  xp: number;
  onStart: () => void;
}) {
  return (
    <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={20} fill="currentColor" />
          <span className="font-bold">Quiz Challenge</span>
        </div>
        <div className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
          +{xp} XP
        </div>
      </div>
      <div className="text-lg font-bold mb-1">{topic}</div>
      <div className="text-white/80 text-sm mb-3">{questionCount} questions</div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="w-full bg-white text-violet-600 py-2.5 rounded-lg font-bold hover:bg-white/90 transition-colors"
      >
        Start Quiz
      </motion.button>
    </div>
  );
}

function InteractiveQuiz({
  quizState,
  onAnswer,
  onNext,
  onFinish,
  onExit,
}: {
  quizState: QuizState;
  onAnswer: (i: number) => void;
  onNext: () => void;
  onFinish: () => void;
  onExit: () => void;
}) {
  const { questions, currentQuestion, score, answered, selectedAnswer, showExplanation, completed, topic, isLoading } = quizState;

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-8 text-white text-center flex flex-col items-center justify-center min-h-[250px]">
        <Loader2 size={36} className="animate-spin mb-4" />
        <div className="text-lg font-bold mb-1">Generating quiz...</div>
        <div className="text-white/70 text-sm">Professor Fortuna is preparing questions</div>
      </div>
    );
  }

  if (completed) {
    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    const xpEarned = score * 20 + (pct === 100 ? 50 : 0);

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-5 text-white text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
          {pct >= 70 ? <Trophy size={40} className="text-yellow-300" fill="currentColor" /> : <Sparkles size={40} />}
        </motion.div>
        <h3 className="text-xl font-bold mb-1">Quiz Complete!</h3>
        <p className="text-white/70 mb-4">{topic}</p>
        <div className="bg-white/20 rounded-xl p-4 mb-4">
          <div className="text-4xl font-bold mb-1">{score}/{total}</div>
          <div className="text-sm text-white/70">Correct answers</div>
          <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, delay: 0.3 }} className="h-full bg-emerald-400 rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap size={20} fill="currentColor" className="text-yellow-300" />
          <span className="font-bold text-lg">+{xpEarned} XP earned!</span>
        </div>
        <motion.button whileTap={{ scale: 0.98 }} onClick={onFinish} className="w-full bg-white text-violet-600 py-3 rounded-xl font-bold">
          Done
        </motion.button>
      </motion.div>
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={18} fill="currentColor" />
          <span className="font-bold text-sm">{topic}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
            {currentQuestion + 1}/{questions.length}
          </div>
          <button onClick={onExit} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="h-1.5 bg-white/20 rounded-full mb-4 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${((currentQuestion + (answered ? 1 : 0)) / questions.length) * 100}%` }} className="h-full bg-white rounded-full" />
      </div>

      <div className="text-lg font-bold mb-4 leading-snug">{question.question}</div>

      <div className="space-y-2 mb-4">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = idx === question.correctAnswer;
          let cls = "w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ";
          if (answered) {
            if (isCorrect) cls += "bg-emerald-500 text-white border-2 border-emerald-300";
            else if (isSelected) cls += "bg-red-500/80 text-white border-2 border-red-300";
            else cls += "bg-white/10 text-white/50 border-2 border-transparent";
          } else {
            cls += isSelected ? "bg-white text-violet-600 border-2 border-white" : "bg-white/20 text-white hover:bg-white/30 border-2 border-transparent";
          }
          return (
            <motion.button key={idx} onClick={() => !answered && onAnswer(idx)} disabled={answered} className={cls} whileHover={!answered ? { scale: 1.02 } : {}} whileTap={!answered ? { scale: 0.98 } : {}}>
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">{String.fromCharCode(65 + idx)}</span>
              <span className="flex-1">{option}</span>
              {answered && isCorrect && <CheckCircle2 size={20} className="shrink-0" />}
              {answered && isSelected && !isCorrect && <XCircle size={20} className="shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {showExplanation && question.explanation && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-white/10 rounded-xl p-3 mb-4">
            <div className="text-xs font-bold text-white/70 mb-1">Explanation:</div>
            <div className="text-sm text-white/90">{question.explanation}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-yellow-300" />
          <span className="text-sm font-bold">{score} points</span>
        </div>
        {answered && (
          <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onClick={onNext} className="bg-white text-violet-600 px-5 py-2 rounded-xl font-bold flex items-center gap-2">
            {currentQuestion < questions.length - 1 ? "Next" : "Results"}
            <ArrowRight size={16} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function AchievementWidget({ name, xp, description }: { name: string; xp: number; description?: string }) {
  return (
    <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl p-4 text-white text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-2">
        <Trophy size={32} className="text-yellow-100" fill="currentColor" />
      </motion.div>
      <div className="font-bold text-lg">{name}</div>
      {description && <div className="text-white/80 text-sm">{description}</div>}
      <div className="text-white/90 text-sm mt-1">+{xp} XP earned!</div>
    </div>
  );
}

function NavigationWidget({ label, onNavigate }: { label: string; onNavigate: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onNavigate}
      className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2"
    >
      {label}
      <ArrowRight size={16} />
    </motion.button>
  );
}

function TipWidget({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-primary" />
        <span className="font-bold text-sm text-foreground">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
    </div>
  );
}

// --- Suggestion Chips ---

const SUGGESTION_CHIPS = [
  "What is diversification?",
  "Explain compound interest",
  "Quiz me on investing",
  "How do ETFs work?",
  "Tips for beginners",
];

// --- Main Component ---

export function ProfessorChat({
  isOpen,
  onClose,
  playerName,
  rank,
  onNavigate,
}: {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  rank: Rank;
  onNavigate?: (screen: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "professor",
      content: `Welcome to my office, **${playerName}**! I'm Professor Fortuna, your investment coach.\n\nAs a **${rank.label}**, you're making great progress. Ask me anything about investing, or try a quiz to test your knowledge!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>({
    isActive: false,
    isLoading: false,
    topic: "",
    questions: [],
    currentQuestion: 0,
    score: 0,
    answered: false,
    selectedAnswer: null,
    showExplanation: false,
    completed: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, quizState]);

  // --- Quiz Handlers ---

  const handleStartQuiz = (topic: string) => {
    setQuizState({
      isActive: true,
      isLoading: true,
      topic,
      questions: [],
      currentQuestion: 0,
      score: 0,
      answered: false,
      selectedAnswer: null,
      showExplanation: false,
      completed: false,
    });

    // Simulate loading then load questions
    setTimeout(() => {
      setQuizState((prev) => ({
        ...prev,
        isLoading: false,
        questions: getQuizQuestions(topic),
      }));
    }, 1200);
  };

  const handleQuizAnswer = (idx: number) => {
    const q = quizState.questions[quizState.currentQuestion];
    setQuizState((prev) => ({
      ...prev,
      answered: true,
      selectedAnswer: idx,
      score: idx === q.correctAnswer ? prev.score + 1 : prev.score,
      showExplanation: true,
    }));
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestion < quizState.questions.length - 1) {
      setQuizState((prev) => ({ ...prev, currentQuestion: prev.currentQuestion + 1, answered: false, selectedAnswer: null, showExplanation: false }));
    } else {
      setQuizState((prev) => ({ ...prev, completed: true }));
    }
  };

  const handleFinishQuiz = () => {
    const xpEarned = quizState.score * 20 + (quizState.score === quizState.questions.length ? 50 : 0);
    setQuizState((prev) => ({ ...prev, isActive: false }));
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + "_quiz_result",
        role: "professor",
        content: `Great job on the **${quizState.topic}** quiz! You scored **${quizState.score}/${quizState.questions.length}**. Keep learning and you'll master investing in no time!`,
        timestamp: new Date(),
        widget: { type: "achievement", name: "Quiz Completed", xp: xpEarned, description: `${quizState.topic} — ${quizState.score}/${quizState.questions.length} correct` },
      },
    ]);
  };

  const handleExitQuiz = () => {
    setQuizState((prev) => ({ ...prev, isActive: false }));
  };

  // --- Send Message ---

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isTyping) return;

    const studentMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "student",
      content: msgText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, studentMsg]);
    setInput("");
    setIsTyping(true);

    // Check if user wants a quiz
    const lowerMsg = msgText.toLowerCase();
    if (lowerMsg.includes("quiz") || lowerMsg.includes("test me")) {
      // Determine topic from message
      let topic = "Risk Management";
      if (lowerMsg.includes("compound") || lowerMsg.includes("interest")) topic = "Compound Interest";
      else if (lowerMsg.includes("etf") || lowerMsg.includes("fund")) topic = "ETFs & Funds";
      else if (lowerMsg.includes("crash") || lowerMsg.includes("bear")) topic = "Market Crashes";

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "_prof",
            role: "professor",
            content: `Let's test your knowledge! Here's a quiz on **${topic}**:`,
            timestamp: new Date(),
            widget: { type: "quiz", topic, questionCount: 3, xp: 60 },
          },
        ]);
        setIsTyping(false);
      }, 800);
      return;
    }

    // Call AI API
    try {
      const response = await fetch("/api/ai/professor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, studentMsg].map((m) => ({
            role: m.role === "professor" ? "assistant" : "user",
            content: m.content,
          })),
          playerName,
          rank: rank.label,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "_prof",
            role: "professor",
            content: data.response,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error("API error");
      }
    } catch {
      const fallbacks = [
        `Good question, **${playerName}**. The key to investing is patience. Markets reward those who stay the course.`,
        "Remember: **emotional discipline** is your most valuable investing skill. Don't let fear drive your decisions.",
        "**Diversification** is the only free lunch in investing. Spread your risk across asset classes and geographies.",
        "Start early, invest regularly, and don't panic when markets drop. That's the formula that has worked for over a century.",
        "The biggest risk isn't market volatility — it's **not investing at all**. Inflation erodes cash over time.",
      ];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_prof",
          role: "professor",
          content: fallbacks[Math.floor(Math.random() * fallbacks.length)],
          timestamp: new Date(),
        },
      ]);
    }
    setIsTyping(false);
  };

  // --- Render Widget ---

  const renderWidget = (msg: ChatMessage) => {
    if (!msg.widget) return null;
    switch (msg.widget.type) {
      case "quiz":
        return <QuizPreviewWidget topic={msg.widget.topic} questionCount={msg.widget.questionCount} xp={msg.widget.xp} onStart={() => handleStartQuiz(msg.widget!.type === "quiz" ? (msg.widget as { type: "quiz"; topic: string }).topic : "")} />;
      case "achievement":
        return <AchievementWidget name={msg.widget.name} xp={msg.widget.xp} description={msg.widget.description} />;
      case "navigation":
        return <NavigationWidget label={msg.widget.label} onNavigate={() => onNavigate?.(msg.widget!.type === "navigation" ? (msg.widget as { type: "navigation"; screen: string }).screen : "")} />;
      case "tip":
        return <TipWidget title={msg.widget.title} content={msg.widget.content} />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 z-40"
          />

          {/* Chat Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 h-[92%] bg-background z-50 rounded-t-3xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="bg-card px-4 py-3 flex items-center justify-between border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-md"
                  style={{ boxShadow: "0 4px 14px oklch(0.82 0.17 85 / 0.4)" }}
                >
                  <GraduationCap size={22} className="text-primary-foreground" />
                </motion.div>
                <div>
                  <div className="font-bold text-foreground text-sm">Professor Fortuna</div>
                  <div className="text-xs text-primary font-medium flex items-center gap-1.5">
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"
                    />
                    Online &bull; AI Powered
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
              >
                <ChevronDown size={22} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Active Quiz */}
              {quizState.isActive && (
                <InteractiveQuiz
                  quizState={quizState}
                  onAnswer={handleQuizAnswer}
                  onNext={handleNextQuestion}
                  onFinish={handleFinishQuiz}
                  onExit={handleExitQuiz}
                />
              )}

              {/* Regular chat */}
              {!quizState.isActive && (
                <>
                  {/* Date chip */}
                  <div className="flex justify-center py-1">
                    <span className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      Today
                    </span>
                  </div>

                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex", msg.role === "student" ? "justify-end" : "justify-start")}
                    >
                      <div className={cn("max-w-[85%] flex flex-col gap-1", msg.role === "student" ? "items-end" : "items-start")}>
                        {/* Professor label */}
                        {msg.role === "professor" && (
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                              <GraduationCap size={12} className="text-primary-foreground" />
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">Professor Fortuna</span>
                          </div>
                        )}

                        {/* Bubble */}
                        <div
                          className={cn(
                            "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                            msg.role === "student"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-card text-foreground rounded-tl-sm border border-border"
                          )}
                        >
                          {msg.role === "professor" ? (
                            <div className="prose prose-sm max-w-none prose-p:my-1 prose-strong:text-primary prose-ul:my-1 prose-li:my-0">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="my-1">{children}</p>,
                                  strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
                                  ul: ({ children }) => <ul className="list-disc list-inside my-1 space-y-0.5">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal list-inside my-1 space-y-0.5">{children}</ol>,
                                  li: ({ children }) => <li className="my-0">{children}</li>,
                                  code: ({ children }) => <code className="bg-muted px-1 rounded text-xs">{children}</code>,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>

                        {/* Widget */}
                        {msg.widget && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-2 w-full"
                          >
                            {renderWidget(msg)}
                          </motion.div>
                        )}

                        {/* Timestamp */}
                        <span className="text-[10px] text-muted-foreground px-1">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                            <GraduationCap size={12} className="text-primary-foreground" />
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground">Thinking...</span>
                        </div>
                        <div className="bg-card px-4 py-3 rounded-2xl rounded-tl-sm border border-border shadow-sm flex gap-1.5">
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-primary rounded-full" />
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-2 h-2 bg-primary rounded-full" />
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-2 h-2 bg-primary rounded-full" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            {!quizState.isActive && messages.length <= 3 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                {SUGGESTION_CHIPS.map((chip, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => sendMessage(chip)}
                    className="shrink-0 px-3 py-1.5 bg-card border border-border rounded-full text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {chip}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="bg-card p-3 border-t border-border shrink-0 pb-6">
              <div className="flex items-center gap-2 bg-muted p-2 rounded-2xl focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask anything about investing..."
                  className="flex-1 bg-transparent outline-none text-foreground text-sm placeholder:text-muted-foreground px-2"
                  disabled={quizState.isActive}
                />
                <AnimatePresence>
                  {input.trim() && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => sendMessage()}
                      className="p-2 bg-primary text-primary-foreground rounded-xl"
                    >
                      <Send size={16} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

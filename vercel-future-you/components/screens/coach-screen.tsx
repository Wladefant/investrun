"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  Shield,
  Target,
  HelpCircle,
  Lightbulb,
  BookOpen,
  ChevronRight,
  User,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getChatResponse } from "@/lib/mock-ai";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

const SUGGESTION_CHIPS = [
  { label: "Why did I lose money here?", icon: HelpCircle },
  { label: "Was selling there a mistake?", icon: TrendingUp },
  { label: "How could I reach my goal faster?", icon: Target },
  { label: "What does diversification mean?", icon: BookOpen },
  { label: "What kind of investor am I?", icon: User },
  { label: "Explain compound interest", icon: Lightbulb },
];

const QUICK_TOPICS = [
  {
    title: "Investment Basics",
    description: "Learn the fundamentals",
    icon: BookOpen,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    title: "Risk Management",
    description: "Protect your portfolio",
    icon: Shield,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
  {
    title: "Growth Strategies",
    description: "Maximize returns",
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Market Psychology",
    description: "Master your emotions",
    icon: Sparkles,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
];

export function CoachScreen() {
  const { user } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "ai",
      content: `Hey there! I'm your investment coach. I'm here to help you understand investing better, analyze your simulation results, and answer any questions you have. What would you like to learn about today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));

    const aiResponse = getChatResponse(content);

    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      type: "ai",
      content: aiResponse.message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleChipClick = (chip: (typeof SUGGESTION_CHIPS)[0]) => {
    sendMessage(chip.label);
  };

  const handleTopicClick = (topic: (typeof QUICK_TOPICS)[0]) => {
    const topicQuestions: Record<string, string> = {
      "Investment Basics": "Can you explain the basics of investing for beginners?",
      "Risk Management": "How should I think about risk when investing?",
      "Growth Strategies": "What strategies can help me grow my portfolio over time?",
      "Market Psychology": "How can I control my emotions when markets are volatile?",
    };
    sendMessage(topicQuestions[topic.title] || `Tell me about ${topic.title}`);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col">
      {/* Header */}
      <Card className="mb-4 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Investment Coach</h2>
              <p className="text-sm text-muted-foreground">
                Your personal guide to smarter investing
              </p>
            </div>
            <Badge variant="outline" className="ml-auto border-primary/50 text-primary">
              <Sparkles className="mr-1 h-3 w-3" />
              Online
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {message.type === "ai" && (
                      <div className="mb-2 flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-primary">Coach</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="rounded-2xl bg-secondary px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="h-2 w-2 rounded-full bg-primary"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="h-2 w-2 rounded-full bg-primary"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="h-2 w-2 rounded-full bg-primary"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Topics (shown when chat is fresh) */}
            {messages.length <= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 pt-4"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  Quick Topics
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_TOPICS.map((topic) => (
                    <button
                      key={topic.title}
                      onClick={() => handleTopicClick(topic)}
                      className={`flex items-start gap-3 rounded-xl ${topic.bgColor} p-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      <topic.icon className={`h-5 w-5 ${topic.color}`} />
                      <div>
                        <p className="text-sm font-medium">{topic.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {topic.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Suggestion Chips */}
        <div className="border-t border-border/50 p-3">
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="flex gap-2 pb-1">
              {SUGGESTION_CHIPS.map((chip) => (
                <Button
                  key={chip.label}
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => handleChipClick(chip)}
                >
                  <chip.icon className="mr-1.5 h-3 w-3" />
                  {chip.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputValue);
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about investing..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* Educational Disclaimer */}
      <p className="mt-2 text-center text-xs text-muted-foreground">
        For educational purposes only. Not financial advice.
      </p>
    </div>
  );
}

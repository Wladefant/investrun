"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IPhoneFrame from "@/components/IPhoneFrame";
import Link from "next/link";

export default function Home() {
  const [entered, setEntered] = useState(false);

  return (
    <IPhoneFrame>
      <AnimatePresence mode="wait">
        {!entered ? (
          <SplashScreen onEnter={() => setEntered(true)} key="splash" />
        ) : (
          <ModeSelection key="modes" />
        )}
      </AnimatePresence>
    </IPhoneFrame>
  );
}

function SplashScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo glow */}
      <motion.div
        className="w-20 h-20 rounded-full bg-pf-yellow mb-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
        style={{ boxShadow: "0 0 60px rgba(255, 200, 0, 0.4)" }}
      />

      <motion.h1
        className="text-3xl font-extrabold tracking-tight mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        FUTURE YOU
      </motion.h1>
      <motion.h2
        className="text-lg font-bold text-pf-yellow mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        SIMULATOR
      </motion.h2>

      <motion.p
        className="text-pf-gray-300 text-sm leading-relaxed mb-10 max-w-[280px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        See what investing does to your life. Simulate decades in minutes.
        Learn by doing — not by reading.
      </motion.p>

      <motion.button
        onClick={onEnter}
        className="bg-pf-yellow text-pf-black font-bold text-lg px-10 py-4 rounded-2xl active:scale-95 transition-transform"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        whileTap={{ scale: 0.95 }}
      >
        START YOUR FUTURE
      </motion.button>

      <motion.p
        className="text-pf-gray-500 text-xs mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Powered by PostFinance
      </motion.p>
    </motion.div>
  );
}

function ModeSelection() {
  const modes = [
    {
      title: "MY FUTURE",
      subtitle: "See what investing does for you",
      description: "Pick a goal. Set your budget. Watch your future unfold.",
      href: "/estimate",
      icon: "✨",
      color: "from-pf-yellow/20 to-transparent",
      primary: true,
    },
    {
      title: "SIMULATE",
      subtitle: "20 years in 5 minutes",
      description: "Build a portfolio. Survive crashes. Learn by doing.",
      href: "/simulate",
      icon: "📈",
      color: "from-pf-green/10 to-transparent",
      primary: false,
    },
    {
      title: "COMPETE",
      subtitle: "Challenge friends & AI rivals",
      description: "Same market. Same conditions. Who invests best?",
      href: "/compete",
      icon: "⚔️",
      color: "from-pf-red/10 to-transparent",
      primary: false,
    },
  ];

  return (
    <motion.div
      className="flex flex-col h-full px-6 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-xl font-extrabold mb-1">Choose Your Mode</h1>
      <p className="text-pf-gray-500 text-sm mb-6">
        Start with My Future — it only takes 30 seconds.
      </p>

      <div className="flex flex-col gap-4 flex-1">
        {modes.map((mode, i) => (
          <Link href={mode.href} key={mode.title}>
            <motion.div
              className={`relative rounded-2xl p-5 border transition-all active:scale-[0.98] ${
                mode.primary
                  ? "border-pf-yellow bg-gradient-to-br " + mode.color
                  : "border-pf-gray-800 bg-gradient-to-br " + mode.color
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{mode.icon}</span>
                <div className="flex-1">
                  <h2
                    className={`font-bold text-base ${
                      mode.primary ? "text-pf-yellow" : "text-pf-white"
                    }`}
                  >
                    {mode.title}
                  </h2>
                  <p className="text-pf-gray-300 text-sm mt-0.5">
                    {mode.subtitle}
                  </p>
                  <p className="text-pf-gray-500 text-xs mt-2">
                    {mode.description}
                  </p>
                </div>
                <span className="text-pf-gray-500 text-lg">→</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <p className="text-center text-pf-gray-700 text-[10px] mt-4">
        PostFinance · Future You Simulator
      </p>
    </motion.div>
  );
}

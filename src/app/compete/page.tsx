"use client";

import IPhoneFrame from "@/components/IPhoneFrame";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CompetePage() {
  return (
    <IPhoneFrame>
      <motion.div
        className="flex flex-col h-full px-6 py-4 items-center justify-center text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-5xl mb-4">⚔️</span>
        <h1 className="text-2xl font-extrabold mb-2">Competitive Mode</h1>
        <p className="text-pf-gray-500 text-sm mb-4 max-w-[280px]">
          Challenge friends and AI rivals. Same market. Same conditions.
          Who invests best?
        </p>
        <p className="text-pf-yellow text-xs font-bold mb-8">Coming soon</p>
        <Link href="/">
          <button className="bg-pf-gray-800 text-pf-gray-300 font-bold px-8 py-3 rounded-xl">
            ← Back to menu
          </button>
        </Link>
      </motion.div>
    </IPhoneFrame>
  );
}

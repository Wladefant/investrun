'use client';

import { useAppStore } from '@/lib/store';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { HomeScreen } from '@/components/screens/home-screen';
import { FutureScreen } from '@/components/screens/future-screen';
import { SoloScreen } from '@/components/screens/solo-screen';
import { ArenaScreen } from '@/components/screens/arena-screen';
import { CoachScreen } from '@/components/screens/coach-screen';
import { AnimatePresence, motion } from 'framer-motion';

export function AppShell() {
  const { onboarding, activeTab } = useAppStore();
  
  if (!onboarding.isComplete) {
    return <OnboardingFlow />;
  }
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'future' && <FutureScreen />}
          {activeTab === 'solo' && <SoloScreen />}
          {activeTab === 'arena' && <ArenaScreen />}
          {activeTab === 'coach' && <CoachScreen />}
        </motion.div>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}

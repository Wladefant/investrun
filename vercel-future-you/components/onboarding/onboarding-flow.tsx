'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAppStore } from '@/lib/store';
import { PRESET_GOALS } from '@/types';
import type { Goal, RiskProfile } from '@/types';
import { TrendingUp, Target, Trophy, ChevronRight, Sparkles } from 'lucide-react';

const ONBOARDING_SLIDES = [
  {
    icon: TrendingUp,
    title: 'See your financial future',
    subtitle: 'Visualize how small investments today can grow into life-changing wealth.',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
  },
  {
    icon: Target,
    title: 'Train with real market scenarios',
    subtitle: 'Experience decades of market history in minutes. Learn to stay calm when others panic.',
    gradient: 'from-blue-500/20 to-blue-500/5',
  },
  {
    icon: Trophy,
    title: 'Compete and learn smarter',
    subtitle: 'Challenge friends, climb leaderboards, and prove your investment instincts.',
    gradient: 'from-amber-500/20 to-amber-500/5',
  },
];

export function OnboardingFlow() {
  const { 
    onboarding, 
    setOnboardingStep, 
    setOnboardingAge,
    setOnboardingContribution,
    setOnboardingGoal,
    setOnboardingRisk,
    completeOnboarding 
  } = useAppStore();
  
  const [localAge, setLocalAge] = useState(22);
  const [localContribution, setLocalContribution] = useState(300);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskProfile | null>(null);
  
  const step = onboarding.currentStep;
  
  const handleNext = () => {
    if (step < 4) {
      // Steps 0-3: splash and intro slides, just increment
      setOnboardingStep(step + 1);
    } else if (step === 4) {
      // Age input
      setOnboardingAge(localAge);
      setOnboardingStep(5);
    } else if (step === 5) {
      // Contribution input
      setOnboardingContribution(localContribution);
      setOnboardingStep(6);
    } else if (step === 6 && selectedGoal) {
      // Goal selection
      setOnboardingGoal(selectedGoal);
      setOnboardingStep(7);
    } else if (step === 7) {
      // Risk preference - complete onboarding
      if (selectedRisk) {
        setOnboardingRisk(selectedRisk);
      }
      completeOnboarding();
    }
  };
  
  const canProceed = () => {
    if (step <= 4) return true; // splash, intro slides, age
    if (step === 5) return localContribution >= 50; // contribution
    if (step === 6) return selectedGoal !== null; // goal
    return true; // risk (can skip)
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="px-6 pt-4">
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / 8) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {/* Splash (step 0) */}
        {step === 0 && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col items-center justify-center px-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mb-8 shadow-lg shadow-primary/30"
            >
              <Sparkles className="w-12 h-12 text-primary-foreground" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-3 text-balance"
            >
              Future You Simulator
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg mb-12"
            >
              See what your money could become.
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button size="lg" onClick={handleNext} className="px-8">
                Get Started <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
        
        {/* Intro slides (steps 1-3) */}
        {step >= 1 && step <= 3 && (
          <motion.div
            key={`slide-${step}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col px-6 pt-12"
          >
            <div className={`flex-1 flex flex-col items-center justify-center text-center bg-gradient-to-b ${ONBOARDING_SLIDES[step - 1].gradient} rounded-3xl mx-0 p-8`}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8"
              >
                {(() => {
                  const Icon = ONBOARDING_SLIDES[step - 1].icon;
                  return <Icon className="w-10 h-10 text-primary" />;
                })()}
              </motion.div>
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-4 text-balance"
              >
                {ONBOARDING_SLIDES[step - 1].title}
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-balance"
              >
                {ONBOARDING_SLIDES[step - 1].subtitle}
              </motion.p>
            </div>
            
            {/* Dots */}
            <div className="flex justify-center gap-2 py-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === step ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
            
            <div className="pb-8">
              <Button onClick={handleNext} className="w-full" size="lg">
                {step === 3 ? "Let's personalize" : 'Continue'}
              </Button>
            </div>
          </motion.div>
        )}
        
        {/* Age input (step 4) */}
        {step === 4 && (
          <motion.div
            key="age"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col px-6 pt-12"
          >
            <h2 className="text-2xl font-bold mb-2">How old are you?</h2>
            <p className="text-muted-foreground mb-8">
              Your age helps us show realistic projections.
            </p>
            
            <div className="flex-1 flex flex-col justify-center">
              <motion.div 
                className="text-center mb-8"
                key={localAge}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <span className="text-7xl font-bold text-primary">{localAge}</span>
                <span className="text-2xl text-muted-foreground ml-2">years</span>
              </motion.div>
              
              <Slider
                value={[localAge]}
                onValueChange={([v]) => setLocalAge(v)}
                min={16}
                max={65}
                step={1}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>16</span>
                <span>65</span>
              </div>
            </div>
            
            <div className="pb-8">
              <Button onClick={handleNext} className="w-full" size="lg">
                Continue
              </Button>
            </div>
          </motion.div>
        )}
        
        {/* Contribution input (step 5) */}
        {step === 5 && (
          <motion.div
            key="contribution"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col px-6 pt-12"
          >
            <h2 className="text-2xl font-bold mb-2">How much can you invest monthly?</h2>
            <p className="text-muted-foreground mb-8">
              Start small. Consistency beats perfection.
            </p>
            
            <div className="flex-1 flex flex-col justify-center">
              <motion.div 
                className="text-center mb-8"
                key={localContribution}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <span className="text-6xl font-bold text-primary">€{localContribution}</span>
                <span className="text-xl text-muted-foreground">/month</span>
              </motion.div>
              
              <Slider
                value={[localContribution]}
                onValueChange={([v]) => setLocalContribution(v)}
                min={50}
                max={2000}
                step={50}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>€50</span>
                <span>€2,000</span>
              </div>
              
              <p className="text-center text-sm text-muted-foreground mt-6">
                {localContribution < 200 
                  ? "Every euro counts. Small starts lead to big futures."
                  : localContribution < 500
                  ? "Great start! You're building real momentum."
                  : "Impressive commitment. Your future self will thank you."}
              </p>
            </div>
            
            <div className="pb-8">
              <Button onClick={handleNext} className="w-full" size="lg" disabled={!canProceed()}>
                Continue
              </Button>
            </div>
          </motion.div>
        )}
        
        {/* Goal selection (step 6) */}
        {step === 6 && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col px-6 pt-12"
          >
            <h2 className="text-2xl font-bold mb-2">What are you saving for?</h2>
            <p className="text-muted-foreground mb-6">
              Pick a goal to visualize your journey.
            </p>
            
            <div className="flex-1 overflow-y-auto">
              <div className="grid gap-3">
                {PRESET_GOALS.map((goal) => (
                  <motion.button
                    key={goal.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGoal(goal)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedGoal?.id === goal.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{goal.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{goal.name}</p>
                        <p className="text-sm text-muted-foreground">€{goal.targetAmount.toLocaleString()}</p>
                      </div>
                      {selectedGoal?.id === goal.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                        >
                          <ChevronRight className="w-4 h-4 text-primary-foreground" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div className="py-8">
              <Button onClick={handleNext} className="w-full" size="lg" disabled={!canProceed()}>
                Continue
              </Button>
            </div>
          </motion.div>
        )}
        
        {/* Risk preference (step 7) */}
        {step === 7 && (
          <motion.div
            key="risk"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col px-6 pt-12"
          >
            <h2 className="text-2xl font-bold mb-2">How do you feel about risk?</h2>
            <p className="text-muted-foreground mb-8">
              This helps us personalize your experience.
            </p>
            
            <div className="flex-1 flex flex-col gap-4">
              {[
                { 
                  id: 'conservative' as RiskProfile, 
                  title: 'Conservative', 
                  desc: 'Prefer stability over high returns',
                  icon: '🛡️'
                },
                { 
                  id: 'balanced' as RiskProfile, 
                  title: 'Balanced', 
                  desc: 'Mix of growth and stability',
                  icon: '⚖️'
                },
                { 
                  id: 'aggressive' as RiskProfile, 
                  title: 'Aggressive', 
                  desc: 'Comfortable with volatility for higher potential',
                  icon: '🚀'
                },
              ].map((risk) => (
                <motion.button
                  key={risk.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRisk(risk.id)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    selectedRisk === risk.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{risk.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{risk.title}</p>
                      <p className="text-sm text-muted-foreground">{risk.desc}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            
            <div className="pb-8">
              <Button onClick={handleNext} className="w-full" size="lg">
                {selectedRisk ? 'Start my journey' : 'Skip for now'}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3">
                You can always change this later
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

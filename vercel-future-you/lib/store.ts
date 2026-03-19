'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  UserProfile, 
  Goal, 
  OnboardingState, 
  RiskProfile,
  TabId,
  SimulationState,
  CoachMessage,
  Allocation,
  ArenaMatch,
  ArenaMatchState,
} from '@/types';
import { PRESET_GOALS, ACHIEVEMENTS } from '@/types';
import { DEFAULT_USER } from '@/data/mock-data';
import { ALLOCATION_PRESETS, initializeSimulation } from './simulation';

// Solo simulation persistent state
interface SoloSimulationPersist {
  scenarioId: string | null;
  timeHorizon: number;
  strategyValue: number;
  currentYear: number;
  chartData: { year: number; value: number }[];
  newsFeed: { year: number; text: string; type: string }[];
  phase: 'setup' | 'running' | 'paused' | 'checkpoint' | 'complete';
  quarterRef: number;
}

// Arena match persistent state
interface ArenaMatchPersist {
  matchId: string | null;
  opponentPersonality: string | null;
  currentRound: number;
  totalRounds: number;
  playerScore: number;
  opponentScore: number;
  timeHorizon: number;
  phase: 'setup' | 'countdown' | 'decision' | 'reveal' | 'complete';
}

interface AppState {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  
  // Custom Goals
  customGoals: Goal[];
  addCustomGoal: (goal: Goal) => void;
  updateCustomGoal: (goalId: string, updates: Partial<Goal>) => void;
  removeCustomGoal: (goalId: string) => void;
  
  // Onboarding
  onboarding: OnboardingState;
  setOnboardingStep: (step: number) => void;
  setOnboardingAge: (age: number) => void;
  setOnboardingContribution: (contribution: number) => void;
  setOnboardingGoal: (goal: Goal) => void;
  setOnboardingRisk: (risk: RiskProfile) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  
  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  
  // Future projection
  selectedGoal: Goal;
  setSelectedGoal: (goal: Goal) => void;
  monthlyContribution: number;
  setMonthlyContribution: (amount: number) => void;
  expectedReturn: number;
  setExpectedReturn: (rate: number) => void;
  
  // Simulation
  simulation: SimulationState | null;
  startSimulation: (duration: number, allocations: Allocation[]) => void;
  updateSimulation: (state: SimulationState) => void;
  endSimulation: () => void;
  
  // Solo simulation persistence
  soloState: SoloSimulationPersist;
  updateSoloState: (updates: Partial<SoloSimulationPersist>) => void;
  resetSoloState: () => void;
  
  // Arena
  arenaMatch: ArenaMatch | null;
  setArenaMatch: (match: ArenaMatch | null) => void;
  arenaState: ArenaMatchPersist;
  updateArenaState: (updates: Partial<ArenaMatchPersist>) => void;
  resetArenaState: () => void;
  
  // Coach
  coachMessages: CoachMessage[];
  addCoachMessage: (message: CoachMessage) => void;
  clearCoachMessages: () => void;
  
  // Gamification
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  unlockAchievement: (achievementId: string) => void;
}

const DEFAULT_SOLO_STATE: SoloSimulationPersist = {
  scenarioId: null,
  timeHorizon: 30,
  strategyValue: 50,
  currentYear: 0,
  chartData: [],
  newsFeed: [],
  phase: 'setup',
  quarterRef: 1,
};

const DEFAULT_ARENA_STATE: ArenaMatchPersist = {
  matchId: null,
  opponentPersonality: null,
  currentRound: 0,
  totalRounds: 8,
  playerScore: 0,
  opponentScore: 0,
  timeHorizon: 30,
  phase: 'setup',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
      
      // Custom Goals
      customGoals: [],
      addCustomGoal: (goal) => set((state) => ({
        customGoals: [...state.customGoals, goal],
      })),
      updateCustomGoal: (goalId, updates) => set((state) => ({
        customGoals: state.customGoals.map(g => 
          g.id === goalId ? { ...g, ...updates } : g
        ),
      })),
      removeCustomGoal: (goalId) => set((state) => ({
        customGoals: state.customGoals.filter(g => g.id !== goalId),
      })),
      
      // Onboarding
      onboarding: {
        currentStep: 0,
        age: null,
        monthlyContribution: null,
        selectedGoal: null,
        riskPreference: null,
        isComplete: false,
      },
      setOnboardingStep: (step) => set((state) => ({
        onboarding: { ...state.onboarding, currentStep: step },
      })),
      setOnboardingAge: (age) => set((state) => ({
        onboarding: { ...state.onboarding, age },
      })),
      setOnboardingContribution: (contribution) => set((state) => ({
        onboarding: { ...state.onboarding, monthlyContribution: contribution },
      })),
      setOnboardingGoal: (goal) => set((state) => ({
        onboarding: { ...state.onboarding, selectedGoal: goal },
      })),
      setOnboardingRisk: (risk) => set((state) => ({
        onboarding: { ...state.onboarding, riskPreference: risk },
      })),
      completeOnboarding: () => set((state) => {
        const { age, monthlyContribution, selectedGoal, riskPreference } = state.onboarding;
        const newUser: UserProfile = {
          ...DEFAULT_USER,
          age: age || 22,
          monthlyContribution: monthlyContribution || 300,
          riskProfile: riskPreference || 'balanced',
          achievements: [{ ...ACHIEVEMENTS[0], unlockedAt: new Date() }],
          xp: 100,
          currentStreak: 1,
          createdAt: new Date(),
        };
        return {
          onboarding: { ...state.onboarding, isComplete: true },
          user: newUser,
          selectedGoal: selectedGoal || PRESET_GOALS[0],
          monthlyContribution: monthlyContribution || 300,
        };
      }),
      resetOnboarding: () => set({
        onboarding: {
          currentStep: 0,
          age: null,
          monthlyContribution: null,
          selectedGoal: null,
          riskPreference: null,
          isComplete: false,
        },
        user: null,
      }),
      
      // Navigation
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      // Future projection
      selectedGoal: PRESET_GOALS[3], // Lamborghini as default demo
      setSelectedGoal: (goal) => set({ selectedGoal: goal }),
      monthlyContribution: 300,
      setMonthlyContribution: (amount) => set({ monthlyContribution: amount }),
      expectedReturn: 0.07,
      setExpectedReturn: (rate) => set({ expectedReturn: rate }),
      
      // Simulation
      simulation: null,
      startSimulation: (duration, allocations) => {
        const user = get().user;
        const contribution = user?.monthlyContribution || 300;
        const initialBalance = 1000;
        set({
          simulation: initializeSimulation(initialBalance, contribution, duration, allocations),
        });
      },
      updateSimulation: (state) => set({ simulation: state }),
      endSimulation: () => set({ simulation: null }),
      
      // Solo simulation persistence
      soloState: DEFAULT_SOLO_STATE,
      updateSoloState: (updates) => set((state) => ({
        soloState: { ...state.soloState, ...updates },
      })),
      resetSoloState: () => set({ soloState: DEFAULT_SOLO_STATE }),
      
      // Arena
      arenaMatch: null,
      setArenaMatch: (match) => set({ arenaMatch: match }),
      arenaState: DEFAULT_ARENA_STATE,
      updateArenaState: (updates) => set((state) => ({
        arenaState: { ...state.arenaState, ...updates },
      })),
      resetArenaState: () => set({ arenaState: DEFAULT_ARENA_STATE }),
      
      // Coach
      coachMessages: [],
      addCoachMessage: (message) => set((state) => ({
        coachMessages: [...state.coachMessages, message],
      })),
      clearCoachMessages: () => set({ coachMessages: [] }),
      
      // Gamification
      addXP: (amount) => set((state) => ({
        user: state.user ? { ...state.user, xp: state.user.xp + amount } : null,
      })),
      incrementStreak: () => set((state) => ({
        user: state.user ? { ...state.user, currentStreak: state.user.currentStreak + 1 } : null,
      })),
      unlockAchievement: (achievementId) => set((state) => {
        if (!state.user) return {};
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) return {};
        if (state.user.achievements.some(a => a.id === achievementId)) return {};
        return {
          user: {
            ...state.user,
            achievements: [...state.user.achievements, { ...achievement, unlockedAt: new Date() }],
            xp: state.user.xp + 200, // Bonus XP for achievements
          },
        };
      }),
    }),
    {
      name: 'future-you-storage',
      partialize: (state) => ({
        user: state.user,
        onboarding: state.onboarding,
        selectedGoal: state.selectedGoal,
        monthlyContribution: state.monthlyContribution,
        expectedReturn: state.expectedReturn,
        customGoals: state.customGoals,
        soloState: state.soloState,
        arenaState: state.arenaState,
        simulation: state.simulation,
      }),
    }
  )
);

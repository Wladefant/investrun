import { create } from 'zustand';
import type { OpponentPersonalityId } from './arena-opponents';
import type { ScenarioEvent } from '@/data/arena-scenarios';

// Constants
export const TOTAL_ROUNDS = 8;
export const STARTING_CAPITAL = 10_000;
export const DEFAULT_RISK = 50;
export const ROUND_TIMER_SECONDS = 15;
export const STARTING_ELO = 1000;
export const ELO_K_FACTOR = 32;

export type ArenaPhase = 'lobby' | 'matchmaking' | 'setup' | 'match' | 'reveal' | 'results';

export interface ArenaState {
  phase: ArenaPhase;
  opponent: OpponentPersonalityId | null;
  timeHorizon: 20 | 30 | 40;
  currentRound: number;
  timer: number;
  scenarioId: string | null;
  currentEvent: ScenarioEvent | null;

  playerRisk: number;
  playerPortfolio: number[];  // value after each round
  playerDecisions: number[];  // risk choice per round

  opponentPortfolio: number[];
  opponentDecisions: number[];

  // Persistent stats
  stats: {
    elo: number;
    wins: number;
    losses: number;
    draws: number;
  };

  // Actions
  startMatchmaking: () => void;
  setOpponent: (id: OpponentPersonalityId) => void;
  setTimeHorizon: (years: 20 | 30 | 40) => void;
  setScenario: (scenarioId: string) => void;
  startMatch: () => void;
  setPhase: (phase: ArenaPhase) => void;
  setCurrentEvent: (event: ScenarioEvent) => void;
  setTimer: (seconds: number) => void;
  setPlayerRisk: (risk: number) => void;
  submitRound: (playerRisk: number, opponentRisk: number, playerValue: number, opponentValue: number) => void;
  nextRound: () => void;
  finishMatch: () => void;
  updateStats: (result: 'win' | 'loss' | 'draw', opponentElo: number) => void;
  rematch: () => void;
  returnToLobby: () => void;
  initStats: (stats: { elo: number; wins: number; losses: number; draws: number }) => void;
}

export const useArenaStore = create<ArenaState>()((set) => ({
  // Initial state
  phase: 'lobby',
  opponent: null,
  timeHorizon: 30,
  currentRound: 0,
  timer: ROUND_TIMER_SECONDS,
  scenarioId: null,
  currentEvent: null,

  playerRisk: DEFAULT_RISK,
  playerPortfolio: [],
  playerDecisions: [],

  opponentPortfolio: [],
  opponentDecisions: [],

  stats: {
    elo: STARTING_ELO,
    wins: 0,
    losses: 0,
    draws: 0,
  },

  // Actions
  startMatchmaking: () => set({ phase: 'matchmaking' }),

  setOpponent: (id) => set({ opponent: id }),

  setTimeHorizon: (years) => set({ timeHorizon: years }),

  setScenario: (scenarioId) => set({ scenarioId }),

  startMatch: () =>
    set({
      phase: 'match',
      currentRound: 1,
      playerPortfolio: [STARTING_CAPITAL],
      opponentPortfolio: [STARTING_CAPITAL],
      playerDecisions: [],
      opponentDecisions: [],
      playerRisk: DEFAULT_RISK,
      timer: ROUND_TIMER_SECONDS,
    }),

  setPhase: (phase) => set({ phase }),

  setCurrentEvent: (event) => set({ currentEvent: event }),

  setTimer: (seconds) => set({ timer: seconds }),

  setPlayerRisk: (risk) => set({ playerRisk: risk }),

  submitRound: (playerRisk, opponentRisk, playerValue, opponentValue) =>
    set((state) => ({
      playerDecisions: [...state.playerDecisions, playerRisk],
      opponentDecisions: [...state.opponentDecisions, opponentRisk],
      playerPortfolio: [...state.playerPortfolio, playerValue],
      opponentPortfolio: [...state.opponentPortfolio, opponentValue],
    })),

  nextRound: () =>
    set((state) => ({
      currentRound: state.currentRound + 1,
      timer: ROUND_TIMER_SECONDS,
      currentEvent: null,
    })),

  finishMatch: () => set({ phase: 'results' }),

  updateStats: (result, opponentElo) =>
    set((state) => {
      const actualScore = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
      const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - state.stats.elo) / 400));
      const newElo = Math.round(state.stats.elo + ELO_K_FACTOR * (actualScore - expectedScore));

      return {
        stats: {
          elo: newElo,
          wins: state.stats.wins + (result === 'win' ? 1 : 0),
          losses: state.stats.losses + (result === 'loss' ? 1 : 0),
          draws: state.stats.draws + (result === 'draw' ? 1 : 0),
        },
      };
    }),

  rematch: () =>
    set({
      currentRound: 0,
      playerPortfolio: [],
      opponentPortfolio: [],
      playerDecisions: [],
      opponentDecisions: [],
      timer: ROUND_TIMER_SECONDS,
      phase: 'setup',
    }),

  returnToLobby: () =>
    set({
      phase: 'lobby',
      opponent: null,
      currentRound: 0,
      timer: ROUND_TIMER_SECONDS,
      scenarioId: null,
      currentEvent: null,
      playerRisk: DEFAULT_RISK,
      playerPortfolio: [],
      opponentPortfolio: [],
      playerDecisions: [],
      opponentDecisions: [],
    }),

  initStats: (stats) => set({ stats }),
}));

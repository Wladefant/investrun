# Arena Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full competitive Arena mode to the investrun academy app — replacing the Profile bottom nav tab with Arena, moving profile access to a Dashboard avatar, and building a polished pitch-ready experience with AI opponents, ELO ranking, and leaderboard.

**Architecture:** Modular rebuild inspired by the vercel-future-you arena. Zustand store for arena state. 7 new component files + 3 lib/data files. Integration into existing page.tsx routing and MobileLayout nav. Market scenarios ported from vercel with all 15 scenarios and 7 asset classes.

**Tech Stack:** Next.js 15, React 19, Zustand (new dep), Framer Motion, Recharts, Lucide React, Tailwind CSS 4 with oklch design tokens.

**Spec:** `docs/superpowers/specs/2026-03-19-arena-mode-design.md`

---

### Task 1: Install Zustand and update academy-state types

**Files:**
- Modify: `package.json` — add zustand dependency
- Modify: `src/lib/academy-state.ts:120-140` — replace `arenaScore` with `arenaStats`, update `INITIAL_PROGRESS`
- Modify: `src/components/academy/missions/Mission6.tsx` — update `arenaScore` reference to use new `arenaStats`

- [ ] **Step 1: Install zustand**

```bash
npm install zustand
```

- [ ] **Step 2: Update AcademyProgress interface**

In `src/lib/academy-state.ts`, replace:
```typescript
arenaScore?: number;
```
with:
```typescript
arenaStats?: {
  elo: number;
  wins: number;
  losses: number;
  draws: number;
};
```

- [ ] **Step 3: Update INITIAL_PROGRESS**

Add default arena stats:
```typescript
export const INITIAL_PROGRESS: AcademyProgress = {
  playerName: "Academy Student",
  xp: 0,
  currentRank: "cadet",
  completedMissions: [],
  missionScores: {},
  arenaStats: { elo: 1000, wins: 0, losses: 0, draws: 0 },
};
```

- [ ] **Step 4: Update Mission6.tsx arenaScore reference**

In `src/components/academy/missions/Mission6.tsx`, find where `arenaScore` is passed to `onComplete` (around line 931). Replace `arenaScore: finalScore` with removal of that property, or map it: the arena score from Mission 6 is a simple tutorial score, not the full arena stats. Just remove the `arenaScore` key from the data object passed to `onComplete`. The mission's score is already tracked via the standard `score` parameter.

- [ ] **Step 5: Verify build**

```bash
npm run build
```
Expected: Build succeeds with no type errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/academy-state.ts src/components/academy/missions/Mission6.tsx
git commit -m "feat(arena): add zustand dependency and arena stats to academy state"
```

---

### Task 2: Create arena data layer (scenarios + opponents + leaderboard)

**Files:**
- Create: `src/data/arena-scenarios.ts` — port all 15 market scenarios from vercel + helper functions
- Create: `src/lib/arena-opponents.ts` — 4 AI personality definitions + decision algorithm
- Create: `src/data/arena-leaderboard.ts` — mock leaderboard data (15-20 players)

- [ ] **Step 1: Create arena-scenarios.ts**

Port from `vercel-future-you/data/scenarios.ts`. Keep the same `MarketScenario`, `ScenarioEvent` interfaces and all 15 scenarios. Use the 7 asset classes from vercel: `'global-equity' | 'swiss-equity' | 'bonds' | 'gold' | 'cash' | 'bitcoin' | 'tech-growth'`. Include helper functions: `getRandomScenario`, `getScenarioById`, `getScenariosForHorizon`.

Type the asset classes locally in this file (don't import from vercel):
```typescript
export type ArenaAssetClass = 'global-equity' | 'swiss-equity' | 'bonds' | 'gold' | 'cash' | 'bitcoin' | 'tech-growth';
```

**IMPORTANT — Round extraction logic:** Each scenario has 5-6 events, but arena needs 8 rounds. Add a `getArenaRounds(scenario: MarketScenario, count: number)` function that:
1. Takes all scenario events as base rounds
2. If fewer than `count`, generates filler rounds by:
   - Creating "Market Steady" sideways events with small random impacts (±2% on equity, ±1% on others)
   - Inserting them between existing events to maintain narrative flow
3. If more than `count`, takes the first `count` events
4. Shuffles the combined list for variety (but keeps crash events roughly in their original relative position)
This ensures every match always has exactly 8 playable rounds regardless of scenario.

- [ ] **Step 2: Create arena-opponents.ts**

Define 4 AI personalities matching the spec:

```typescript
export type OpponentPersonalityId = 'turtle' | 'owl' | 'bull' | 'fox';

export interface OpponentPersonality {
  id: OpponentPersonalityId;
  name: string;
  emoji: string;
  description: string;
  baseRiskMin: number;
  baseRiskMax: number;
}

export const OPPONENTS: Record<OpponentPersonalityId, OpponentPersonality> = {
  turtle: { id: 'turtle', name: 'The Turtle', emoji: '🐢', description: 'Prefers safety over growth. Never risks above 50.', baseRiskMin: 20, baseRiskMax: 35 },
  owl:    { id: 'owl',    name: 'The Owl',    emoji: '🦉', description: 'Reads markets rationally. Adjusts proportionally.', baseRiskMin: 40, baseRiskMax: 55 },
  bull:   { id: 'bull',   name: 'The Bull',   emoji: '🐂', description: 'Buys every dip. Chases maximum returns.', baseRiskMin: 65, baseRiskMax: 85 },
  fox:    { id: 'fox',    name: 'The Fox',     emoji: '🦊', description: 'Mirrors your moves. The mind-game player.', baseRiskMin: 45, baseRiskMax: 65 },
};
```

Implement `calculateOpponentRisk(personality, eventType, severity, playerPreviousRisk, round)`:
- Round 1 Fox fallback: use base risk 55
- Fox subsequent rounds: blend 60% mirror of player's previous + 40% base, offset ±10
- Turtle: drops 20 on crash, never above 50, slow recovery (+5 per non-negative round)
- Bull: +10 on crash ("buy the dip"), +15 on bull, rarely below 50
- Owl: adjusts proportionally to severity. Crash severity 5 → -25, severity 1 → -5. Bull → +proportional
- All: add `Math.random() * 10 - 5` noise, clamp 0-100

- [ ] **Step 3: Create arena-leaderboard.ts**

```typescript
export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string; // initials
  elo: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  wins: number;
  losses: number;
  avgReturn: number;
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  // 18 entries with varied stats, ELOs from 800-1600
  // Top 3: diamond/platinum tier
  // Middle: gold/silver
  // Bottom: bronze
];
```

Include `getEloBadgeTier(elo)` function:
```typescript
export function getEloBadgeTier(elo: number): LeaderboardEntry['tier'] {
  if (elo >= 1600) return 'diamond';
  if (elo >= 1400) return 'platinum';
  if (elo >= 1200) return 'gold';
  if (elo >= 1000) return 'silver';
  return 'bronze';
}
```

Include `TIER_COLORS` mapping for badge colors (use oklch CSS vars or fallback hex).

- [ ] **Step 4: Verify build**

```bash
npm run build
```
Expected: Build succeeds. Files compile with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/data/arena-scenarios.ts src/lib/arena-opponents.ts src/data/arena-leaderboard.ts
git commit -m "feat(arena): add market scenarios, AI opponents, and leaderboard data"
```

---

### Task 3: Create Zustand arena store

**Files:**
- Create: `src/lib/arena-store.ts`

- [ ] **Step 1: Create the store**

```typescript
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
  playerPortfolio: number[];
  playerDecisions: number[];

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
  setCurrentEvent: (event: ScenarioEvent) => void;
  setTimer: (seconds: number) => void;
  submitRound: (playerRisk: number, opponentRisk: number, playerValue: number, opponentValue: number) => void;
  nextRound: () => void;
  finishMatch: () => void;
  updateStats: (result: 'win' | 'loss' | 'draw', opponentElo: number) => void;
  rematch: () => void;
  returnToLobby: () => void;
}
```

Implement all actions. Key logic:
- `startMatchmaking`: set phase to 'matchmaking'
- `submitRound`: push to playerDecisions/opponentDecisions/playerPortfolio/opponentPortfolio arrays
- `updateStats`: calculate ELO change using standard formula with K=32
- `returnToLobby`: reset match state but keep stats
- `rematch`: reset match state, keep opponent, go to 'setup'

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/arena-store.ts
git commit -m "feat(arena): create Zustand arena store with match state and ELO logic"
```

---

### Task 4: Create arena engine (portfolio calculation)

**Files:**
- Create: `src/lib/arena-engine.ts`

- [ ] **Step 1: Create the engine**

Functions needed:

```typescript
// Risk level (0-100) → allocation percentages for 7 asset classes
export function getAllocationFromRisk(risk: number): Record<ArenaAssetClass, number>

// Calculate round return given allocation and event impacts
export function calculateRoundReturn(
  allocation: Record<ArenaAssetClass, number>,
  eventImpacts: Partial<Record<ArenaAssetClass, number>>,
  volatilityScale: number
): number

// Get volatility scale for time horizon
export function getVolatilityScale(timeHorizon: 20 | 30 | 40): number
// 20 → 1.0, 30 → 0.85, 40 → 0.7

// Calculate new portfolio value after a round
export function applyRoundReturn(currentValue: number, roundReturn: number): number
// currentValue * (1 + roundReturn)

// Calculate XP reward for match result
export function calculateMatchXP(result: 'win' | 'loss' | 'draw', returnPct: number): number
// Win: 50, Draw: 25, Loss: 10. Bonus: +10 if >20%, +20 if >50%

// Calculate new ELO
export function calculateNewElo(playerElo: number, opponentElo: number, result: 0 | 0.5 | 1): number
// Standard ELO formula with K=32

// Format currency for display
export function formatCHF(value: number): string
// "CHF 10,234" format
```

`getAllocationFromRisk` uses linear interpolation between 3 anchor points (risk 0, 50, 100) per the spec table:

| Asset | Risk 0 | Risk 50 | Risk 100 |
|---|---|---|---|
| global-equity | 10% | 40% | 50% |
| swiss-equity | 0% | 0% | 0% |
| bonds | 50% | 25% | 0% |
| cash | 30% | 5% | 0% |
| gold | 10% | 15% | 5% |
| bitcoin | 0% | 5% | 20% |
| tech-growth | 0% | 10% | 25% |

Note: swiss-equity allocation is 0% at all risk levels in this simplified model. However, all 7 asset classes must be present in the `Record<ArenaAssetClass, number>` return type (swiss-equity = 0). Scenario event impacts for swiss-equity still exist in the data but have no effect on returns since the player has 0% allocated. This keeps the type system consistent with the scenario data which uses all 7 asset classes.

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/arena-engine.ts
git commit -m "feat(arena): add portfolio calculation engine with allocation interpolation"
```

---

### Task 5: Build ArenaScreen orchestrator + ArenaLobby

**Files:**
- Create: `src/components/academy/arena/ArenaScreen.tsx` — phase router
- Create: `src/components/academy/arena/ArenaLobby.tsx` — lobby UI

- [ ] **Step 1: Create ArenaScreen.tsx**

Phase router component that renders the correct sub-component based on `useArenaStore().phase`:

```typescript
'use client';

import { useArenaStore } from '@/lib/arena-store';
import { ArenaLobby } from './ArenaLobby';
import { ArenaMatchSetup } from './ArenaMatchSetup';
import { ArenaMatch } from './ArenaMatch';
import { ArenaRoundReveal } from './ArenaRoundReveal';
import { ArenaResults } from './ArenaResults';
import { ArenaLeaderboard } from './ArenaLeaderboard';
// Note: ArenaLeaderboard is a sub-view within ArenaLobby (via "View All"), managed by local state in ArenaScreen

interface ArenaScreenProps {
  playerName: string;
  playerXp: number;
  arenaStats: { elo: number; wins: number; losses: number; draws: number };
  onStatsUpdate: (stats: { elo: number; wins: number; losses: number; draws: number }, xpEarned: number) => void;
}

export function ArenaScreen({ playerName, playerXp, arenaStats, onStatsUpdate }: ArenaScreenProps) {
  const phase = useArenaStore(s => s.phase);
  // ... AnimatePresence wrapping phase-based rendering
}
```

Props flow: `page.tsx` passes player info down, `ArenaScreen` orchestrates phases. `onStatsUpdate` callback pushes arena results back to main app state.

- [ ] **Step 2: Create ArenaLobby.tsx**

Lobby UI following the spec and inspired by vercel's lobby (lines 328-503) but adapted to academy design system. Key sections:

1. **Header card**: Swords icon + "Investment Arena" title + description
2. **Player stats row**: 3 columns — ELO badge, W/L record, Tier badge
3. **"Find Match" button**: Large, prominent, with animated pulse glow using `pf-glow-sm` class
4. **How It Works**: 3-step collapsible section (same content as vercel lines 389-416)
5. **Mini Leaderboard**: Top 5 entries from mock data with "View All" link

Use the academy's design patterns:
- `bg-card rounded-2xl shadow-sm border border-border` for cards
- `text-primary`, `bg-primary/10` for accents
- `text-foreground`, `text-muted-foreground` for text hierarchy
- Framer Motion for entry animations

"Find Match" triggers `startMatchmaking()` → 2-3 second fake search → auto-selects random opponent → transitions to setup.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/academy/arena/ArenaScreen.tsx src/components/academy/arena/ArenaLobby.tsx
git commit -m "feat(arena): add ArenaScreen orchestrator and ArenaLobby with player stats"
```

---

### Task 6: Build ArenaMatchSetup + countdown

**Files:**
- Create: `src/components/academy/arena/ArenaMatchSetup.tsx`

- [ ] **Step 1: Create ArenaMatchSetup.tsx**

Two sub-phases in one component:

**Matchmaking animation** (phase === 'matchmaking'):
- Pulsing radar/search animation (use Framer Motion scale + opacity loop)
- "Finding opponent..." text
- After 2-3 seconds, auto-select random opponent personality, transition to setup

**Setup** (phase === 'setup'):
- VS screen: Player avatar (left) vs Opponent avatar (right) with Swords icon between
- Player side: initials circle, name, ELO
- Opponent side: personality emoji, name, description, personality-appropriate ELO (Turtle=900, Owl=1100, Bull=1000, Fox=1200)
- Time horizon picker: 3 large tap-to-select cards (20/30/40 years) with descriptive labels
- Selecting time horizon → 3-2-1 countdown → start match

**Countdown**:
- Large centered number (3-2-1-GO!) with scale animation per the vercel implementation (lines 567-589)
- On "GO!", transition to match phase with first round loaded

Reference vercel lines 506-589 for layout inspiration but use academy card/button patterns.

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/academy/arena/ArenaMatchSetup.tsx
git commit -m "feat(arena): add match setup with opponent reveal, time horizon picker, and countdown"
```

---

### Task 7: Build ArenaMatch (core gameplay)

**Files:**
- Create: `src/components/academy/arena/ArenaMatch.tsx`

- [ ] **Step 1: Create ArenaMatch.tsx**

The core gameplay screen shown during each of the 8 rounds. Layout (top to bottom):

1. **Top bar**: "Round X/8" badge (left), circular countdown timer (right)
   - Timer: 15 seconds, circular progress ring using SVG circle with `stroke-dasharray`
   - Color transition: green (>10s) → yellow (5-10s) → red (<5s)
   - Urgency pulse animation when <5s

2. **Score comparison**: Player portfolio vs Opponent portfolio side by side
   - Use `formatCHF()` from arena-engine
   - Opponent value shows "???" until reveal (just show current total without round impact)

3. **Market event card**:
   - Icon (TrendingUp/TrendingDown/AlertTriangle based on event type)
   - Title + description
   - Severity indicator: colored dots (1-5)
   - Card border color: red for crash/crisis, green for bull/boom, amber for others

4. **Risk slider**:
   - Range 0-100, step 5
   - Color zones on track: green (0-30) → yellow (30-70) → red (70-100) using gradient
   - Live allocation preview bar below slider showing asset split
   - Current label: "Conservative" / "Balanced" / "Aggressive"

5. **"Lock In Decision" button**: Full width, primary color
   - Disabled after submission
   - On submit OR timer expiry: calculate opponent risk, calculate returns, transition to reveal

**Timer logic**: Use `useEffect` with `setInterval` counting down from 15. On expiry, auto-submit with current slider value. Default slider value: 50 on round 1, previous round's value on subsequent rounds.

**Round calculation on submit**:
1. Get player allocation from risk via `getAllocationFromRisk(playerRisk)`
2. Calculate opponent risk via `calculateOpponentRisk()` from arena-opponents.ts
3. Get volatility scale from `getVolatilityScale(timeHorizon)`
4. Calculate both returns via `calculateRoundReturn()`
5. Apply to portfolios via `applyRoundReturn()`
6. Push results to store via `submitRound()`
7. Transition to reveal phase

Reference vercel lines 592-704 for structure but rebuild UI to academy design.

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/academy/arena/ArenaMatch.tsx
git commit -m "feat(arena): add core match gameplay with timer, risk slider, and portfolio calculation"
```

---

### Task 8: Build ArenaRoundReveal

**Files:**
- Create: `src/components/academy/arena/ArenaRoundReveal.tsx`

- [ ] **Step 1: Create ArenaRoundReveal.tsx**

Animated round results screen. Layout:

1. **"Round X Results" heading**

2. **Split comparison** (grid-cols-2):
   - Player side: risk label, portfolio change (animated count-up, green/red)
   - Opponent side: risk label, portfolio change (animated count-up)
   - Winner side gets subtle ring highlight

3. **Round winner banner**:
   - "You won this round!" / "Opponent takes this round" / "Tie!"
   - With appropriate icon (Sparkles/TrendingDown/Shield)
   - Scale-in animation with delay

4. **Running totals**: Both portfolio values in a bar

5. **Auto-advance**: After 3.5 seconds, if more rounds → countdown → next round. If round 8 → results phase.

Use Framer Motion for:
- Flip animation on risk reveal
- Count-up animation on numbers (animate from 0 to actual value)
- Scale-in on winner banner with 0.3s delay

Reference vercel lines 707-801 for structure.

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/academy/arena/ArenaRoundReveal.tsx
git commit -m "feat(arena): add animated round reveal with split comparison and auto-advance"
```

---

### Task 9: Build ArenaResults

**Files:**
- Create: `src/components/academy/arena/ArenaResults.tsx`

- [ ] **Step 1: Create ArenaResults.tsx**

Final match results screen. Layout:

1. **Winner/Loser banner**:
   - Victory: Trophy icon, "Victory!" text, confetti-like sparkle particles (use framer-motion random positioned dots)
   - Defeat: Shield icon, "Defeat" text, respectful tone ("Close match — you'll get them next time")
   - Draw: Swords icon, "Draw!" text
   - Border color matches result

2. **Final portfolios** (grid-cols-2):
   - Player final value + return percentage
   - Opponent final value + return percentage
   - Animated count-up on values

3. **Round-by-round chart**:
   - Recharts `LineChart` with two lines (player vs opponent)
   - X-axis: Round 1-8
   - Y-axis: Portfolio value
   - Player line: primary color, Opponent line: muted/chart-4 color

4. **XP & ELO earned**:
   - XP badge with count-up animation
   - ELO change badge: "+32" or "-16" with up/down arrow
   - Tier badge if tier changed

5. **CTAs** (flex row):
   - "Back to Lobby" (outline button)
   - "Rematch" (primary button)

On mount: calculate and push XP + ELO changes to parent via `onStatsUpdate` callback.

Reference vercel lines 803-898 for structure.

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/academy/arena/ArenaResults.tsx
git commit -m "feat(arena): add match results with chart, XP/ELO rewards, and rematch"
```

---

### Task 10: Build ArenaLeaderboard

**Files:**
- Create: `src/components/academy/arena/ArenaLeaderboard.tsx`

- [ ] **Step 1: Create ArenaLeaderboard.tsx**

Full leaderboard view (navigated from "View All" in lobby). Layout:

1. **Header**: ScreenHeader with "Leaderboard" title and back button
2. **Player's rank card**: Highlighted row showing player's position
3. **Full list**: All 18 mock entries + player entry inserted at correct rank position
   - Each row: rank number, avatar (initials circle), name, tier badge, W/L record, avg return
   - Top 3: gold/silver/bronze badge styling on rank number
   - Staggered entry animation (50ms delay per row)

Use `getEloBadgeTier()` and `TIER_COLORS` from leaderboard data.

Props: `onBack: () => void`, `playerStats` for insertion.

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/academy/arena/ArenaLeaderboard.tsx
git commit -m "feat(arena): add full leaderboard with player rank insertion and tier badges"
```

---

### Task 11: Integrate arena into main app routing

**Files:**
- Modify: `src/app/page.tsx:28-38` — add "arena" to Screen type
- Modify: `src/app/page.tsx:113-124` — add arena to activeTab mapping
- Modify: `src/app/page.tsx:124` — add arena to showNav list
- Modify: `src/app/page.tsx:299-314` — keep profile rendering (now navigated from Dashboard)
- Add: Arena screen rendering block after profile block
- Add: Import for ArenaScreen

- [ ] **Step 1: Add arena to Screen type**

```typescript
type Screen =
  | "enrollment"
  | "dashboard"
  | "missions"
  | "learn"
  | "profile"
  | "arena"        // NEW
  | "mission"
  | "mission_result"
  | "dna_report"
  | "simulator"
  | "future";
```

- [ ] **Step 2: Add import**

```typescript
import { ArenaScreen } from "@/components/academy/arena/ArenaScreen";
```

- [ ] **Step 3: Update activeTab mapping**

Add arena case:
```typescript
const activeTab =
  screen === "dashboard" ? "dashboard"
  : screen === "missions" ? "missions"
  : screen === "learn" ? "learn"
  : screen === "profile" ? "profile"
  : screen === "arena" ? "arena"      // NEW
  : "dashboard";
```

- [ ] **Step 4: Update showNav list**

```typescript
const showNav = ["dashboard", "missions", "learn", "arena"].includes(screen);
```

Note: "profile" removed from showNav — it's now accessed from Dashboard avatar, not bottom nav. Profile still renders as a screen but without bottom nav (back button to return).

- [ ] **Step 5: Add arena screen rendering**

After the profile block (line 314), add:

```tsx
{screen === "arena" && (
  <div className="flex-1 flex flex-col overflow-hidden">
    <ArenaScreen
      playerName={progress.playerName}
      playerXp={progress.xp}
      arenaStats={progress.arenaStats || { elo: 1000, wins: 0, losses: 0, draws: 0 }}
      onStatsUpdate={(stats, xpEarned) => {
        setProgress(p => ({
          ...p,
          arenaStats: stats,
          xp: p.xp + xpEarned,
          currentRank: getCurrentRank(p.xp + xpEarned).id,
        }));
      }}
    />
  </div>
)}
```

- [ ] **Step 6: Update profile screen to have back navigation**

Replace the profile block (lines 299-314) to include a ScreenHeader with back button:

```tsx
{screen === "profile" && (
  <div className="flex-1 flex flex-col overflow-hidden">
    <ScreenHeader title="Profile" onBack={() => setScreen("dashboard")} />
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      {/* ... existing profile content ... */}
    </div>
  </div>
)}
```

Update the import from MobileLayout in `page.tsx` line 5 to include `ScreenHeader`:
```typescript
import { MobileLayout, BottomNav, ScreenHeader } from "@/components/academy/MobileLayout";
```

- [ ] **Step 7: Verify build**

```bash
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(arena): integrate arena screen into main app routing"
```

---

### Task 12: Update bottom nav and Dashboard avatar

**Files:**
- Modify: `src/components/academy/MobileLayout.tsx:5` — add Swords import, remove User if unused
- Modify: `src/components/academy/MobileLayout.tsx:137` — replace Profile nav item with Arena
- Modify: `src/components/academy/Dashboard.tsx:40-57` — add avatar icon to header

- [ ] **Step 1: Update MobileLayout imports**

```typescript
import { Home, Target, GraduationCap, Swords, BookOpen, Sun, Moon } from "lucide-react";
```

Remove `User` from imports (no longer needed in nav).

- [ ] **Step 2: Replace Profile nav with Arena**

Line 137, change:
```tsx
<NavItem icon={<User size={24} />} label="Profile" active={activeTab === "profile"} onClick={() => onNavigate("profile")} />
```
to:
```tsx
<NavItem icon={<Swords size={24} />} label="Arena" active={activeTab === "arena"} onClick={() => onNavigate("arena")} />
```

- [ ] **Step 3: Update Dashboard props to accept profile navigation**

In `Dashboard.tsx`, add `onProfileClick` prop:

```typescript
export function AcademyDashboard({
  progress,
  onStartMission,
  onProfileClick,
}: {
  progress: AcademyProgress;
  onStartMission: (id: number) => void;
  onProfileClick?: () => void;
}) {
```

- [ ] **Step 4: Add avatar icon to Dashboard header**

In the Dashboard header section (line 40-57), add avatar button to the `justify-between` flex container, next to the XP badge:

```tsx
<div className="flex items-center gap-2">
  <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
    <Sparkles size={16} className="text-primary" />
    <span className="font-bold text-primary text-sm">{progress.xp} XP</span>
  </div>
  {onProfileClick && (
    <button
      onClick={onProfileClick}
      className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-xs font-bold text-primary hover:bg-primary/20 transition-colors active:scale-95"
      title="View Profile"
    >
      {progress.playerName.charAt(0).toUpperCase()}
    </button>
  )}
</div>
```

Add `User` to Dashboard's lucide imports if needed for profile icon (or just use initials as above).

- [ ] **Step 5: Update page.tsx to pass onProfileClick**

In page.tsx, update the Dashboard rendering:
```tsx
<AcademyDashboard
  progress={progress}
  onStartMission={handleStartMission}
  onProfileClick={() => setScreen("profile")}
/>
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/components/academy/MobileLayout.tsx src/components/academy/Dashboard.tsx src/app/page.tsx
git commit -m "feat(arena): replace Profile nav with Arena, add profile avatar to Dashboard header"
```

---

### Task 13: Visual polish pass with frontend-design skill

**Files:**
- All arena component files in `src/components/academy/arena/`

- [ ] **Step 1: Invoke frontend-design skill**

Use the `frontend-design` skill to review and polish all arena components for pitch-readiness. Focus areas:
- Consistent oklch color usage (CSS variables, not hardcoded hex)
- Dark mode correctness (all backgrounds, text, borders adapt)
- Animation polish (spring physics, timing, easing curves)
- Micro-interactions (slider grab, button press, score counting)
- Confetti/particle effects on win
- Timer urgency animations
- Typography hierarchy
- Touch targets (min 44px for mobile)
- Empty states and loading states

- [ ] **Step 2: Verify light + dark mode**

Start dev server, test both themes:
```bash
npm run dev
```

Navigate through full arena flow in both light and dark mode. Verify:
- All text is readable
- All borders/backgrounds use semantic CSS vars
- Animations are smooth
- No color contrast issues

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/academy/arena/
git commit -m "feat(arena): visual polish pass — animations, dark mode, micro-interactions"
```

---

### Task 14: End-to-end flow verification

**Files:** None (testing only)

- [ ] **Step 1: Start dev server and test complete flow**

```bash
npm run dev
```

Test the following flow in Chrome:
1. Enroll → Dashboard appears with avatar icon (top-right)
2. Tap avatar → Profile screen with back button → back to Dashboard
3. Bottom nav shows: Home, Missions, [Professor], Learn, **Arena**
4. Tap Arena → Lobby with player stats, leaderboard, Find Match
5. Tap Find Match → Matchmaking animation → Opponent reveal
6. Select time horizon → Countdown (3-2-1-GO!)
7. Play 8 rounds: adjust slider, submit or let timer expire
8. Round reveals show animated comparison
9. Final results: chart, XP, ELO change
10. Rematch works, Back to Lobby works
11. XP from arena reflects on Dashboard
12. Test in both light and dark mode

- [ ] **Step 2: Fix any issues found**

Address bugs, visual glitches, or flow problems.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(arena): complete arena mode — full competitive gameplay with AI opponents"
```

# Arena Mode — Design Spec

**Date:** 2026-03-19
**Status:** Approved
**Scope:** Add full Arena competitive mode to the main investrun app, replacing the Profile bottom nav tab. Move profile access to an avatar icon on Dashboard.

---

## 1. Overview

Arena Mode is a turn-based, competitive investment simulation where the player faces AI opponents under identical market conditions. 8 rounds per match, 15-second decision timer, risk-based portfolio allocation, ELO ranking system.

This is a pitch-ready implementation — polished UI, real AI decision logic, smooth animations, full dark mode support.

## 2. Architecture

### New Files

```
src/components/academy/arena/
├── ArenaScreen.tsx          — Phase router/orchestrator
├── ArenaLobby.tsx           — Stats, leaderboard preview, Find Match CTA
├── ArenaMatchSetup.tsx      — Opponent reveal + time horizon selection
├── ArenaMatch.tsx           — Core gameplay: rounds, timer, risk slider
├── ArenaRoundReveal.tsx     — Animated round result comparison
├── ArenaResults.tsx         — Final score, breakdown, rematch option
├── ArenaLeaderboard.tsx     — Full leaderboard (global tab only for MVP)
└── ArenaOpponentCard.tsx    — Reusable opponent display

src/lib/
├── arena-store.ts           — Zustand store for arena state
├── arena-engine.ts          — Scoring, market events, portfolio calculation
└── arena-opponents.ts       — AI personality definitions & decision algorithms

src/data/
└── arena-scenarios.ts       — 20+ market event library
```

### Integration Points

- `page.tsx` — add `"arena"` to Screen type, render `<ArenaScreen />`
- `MobileLayout.tsx` — replace Profile nav item with Arena (`Swords` icon from lucide-react)
- `Dashboard.tsx` — add 32px avatar icon (top-right of header) → navigates to Profile
- `academy-state.ts` — replace existing `arenaScore?: number` with `arenaStats` object
- `package.json` — add `zustand` dependency

### Mission 6 Relationship

Mission 6 ("The Arena") in `academy-state.ts` is a **tutorial mission** that introduces arena concepts. It remains as-is — completing Mission 6 unlocks the full Arena tab experience. The mission serves as onboarding; the Arena tab is the real competitive mode. Mission 6 completion grants a "first arena access" achievement.

## 3. Game Flow

### Phase 1: Lobby
- Player card: avatar, name, ELO badge, W/L record
- Animated "Find Match" button with subtle pulse glow
- Mini leaderboard (top 5) with "View All" link
- Collapsible how-to-play section

### Phase 2: Matchmaking (fake)
- 2-3 second animated search ("Finding opponent...")
- Randomly selects one of 4 AI personalities

### Phase 3: Setup
- Opponent card slides in with personality icon + name + description
- Time horizon picker: 3 large tap-to-select cards (20/30/40 years). Time horizon determines the **volatility scaling** of market events — longer horizons smooth out volatility (multipliers closer to 1.0), shorter horizons amplify it. This simulates realistic compounding behavior.
- "Battle Start" countdown (3-2-1)

### Phase 4: Match (8 rounds)
Each round:
1. Market event card appears (title, description, severity dots)
2. 15-second circular countdown timer
3. Risk slider (0-100) with live allocation bar preview
4. Slider color zones: green (conservative) → yellow (balanced) → red (aggressive)
5. Timer expiry → keeps previous round's setting (default: 50 for round 1)
6. Opponent's move hidden ("?" thinking animation)

**Default risk value:** Player starts at 50 (balanced). If timer expires on any round, the previous round's value is kept. On round 1 timeout, 50 is used.

### Phase 5: Round Reveal
- Split screen: player left, opponent right
- Risk choices revealed with flip animation
- Portfolio impact animates (counting numbers, green up / red down)
- Running total bar chart grows

### Phase 6: Results
- Winner/loser banner (confetti for win, "close match" for loss)
- Final portfolio values + percentage return
- Round-by-round line chart comparing both portfolios
- XP earned (counting animation)
- ELO change badge (+/- with arrow)
- CTAs: "Rematch" / "Back to Lobby"

## 4. AI Opponent System

### 4 Personalities

| Personality | Icon | Base Risk | Behavior |
|---|---|---|---|
| The Turtle | 🐢 | 20-35 | Drops risk on negatives, never above 50, slow recovery |
| The Owl | 🦉 | 40-55 | Reads severity correctly, adjusts proportionally. Most rational |
| The Bull | 🐂 | 65-85 | Increases on dips ("buy the dip"), rarely reduces. Burned in crashes |
| The Fox | 🦊 | 45-65 | Mirrors player's previous move with offset. Mind-game tension |

### Decision Algorithm

```
finalRisk = clamp(0, 100,
  baseRisk + personalityBias + eventReaction(severity, personality) + random(±5)
)
```

- `eventReaction` varies per personality (Bull: crash = +10 opportunity, Turtle: crash = -20 danger)
- Fox behavior: On round 1, Fox uses its base risk (55). On subsequent rounds, Fox reads `playerDecisions[currentRound - 1]` and offsets by random(±10), blended 60/40 with its own base strategy.

## 5. Portfolio Calculation

### Starting Capital
- CHF 10,000 for both player and opponent

### Asset Classes (6 total)
All scenarios define impact multipliers for all 6 asset classes: **equity, bonds, cash, gold, tech, crypto**.

### Risk-to-Allocation Mapping
Risk level (0-100) maps to allocation percentages across all 6 assets:

| Asset | Risk 0 | Risk 50 | Risk 100 |
|---|---|---|---|
| Equity | 10% | 40% | 50% |
| Bonds | 50% | 25% | 0% |
| Cash | 30% | 5% | 0% |
| Gold | 10% | 15% | 5% |
| Tech | 0% | 10% | 25% |
| Crypto | 0% | 5% | 20% |

Intermediate risk values interpolate linearly between these anchor points.

### Return Calculation
- Round return = Σ(allocation_% × asset_multiplier) for all 6 assets
- Portfolio compounds: `portfolio[round] = portfolio[round-1] × (1 + roundReturn)`

### Time Horizon Effect
- Volatility scaling factor: `20yr → 1.0×`, `30yr → 0.85×`, `40yr → 0.7×`
- Applied to each scenario's asset multipliers: `effectiveMultiplier = baseMultiplier × volatilityScale`
- Longer horizons = less extreme swings per round, rewarding steady strategy

## 6. State Management

### Constants (outside store)

```typescript
const TOTAL_ROUNDS = 8
const STARTING_CAPITAL = 10_000
const DEFAULT_RISK = 50
const ROUND_TIMER_SECONDS = 15
const STARTING_ELO = 1000
```

### Zustand Store (`arena-store.ts`)

```typescript
interface ArenaState {
  phase: 'lobby' | 'matchmaking' | 'setup' | 'match' | 'reveal' | 'results'
  opponent: OpponentPersonality | null
  timeHorizon: 20 | 30 | 40
  currentRound: number
  timer: number

  playerRisk: number           // current slider value, default 50
  playerPortfolio: number[]    // value after each round
  playerDecisions: number[]    // risk choice per round

  opponentPortfolio: number[]
  opponentDecisions: number[]

  stats: ArenaStats

  leaderboard: LeaderboardEntry[]

  // Actions
  startMatchmaking: () => void
  setTimeHorizon: (years: 20 | 30 | 40) => void
  submitRisk: (value: number) => void
  advanceRound: () => void
  calculateResults: () => void
  rematch: () => void
  returnToLobby: () => void
}
```

Note: Opponent is randomly assigned during matchmaking phase — no manual selection action needed.

### XP & ELO System

**XP rewards per match:**
- Win: 50 XP
- Draw: 25 XP
- Loss: 10 XP (participation)
- Bonus: +10 XP if return > 20%, +20 XP if return > 50%

**ELO calculation (simplified for demo):**
- Starting ELO: 1000
- K-factor: 32
- Expected score: `1 / (1 + 10^((opponentElo - playerElo) / 400))`
- New ELO: `currentElo + K × (actualScore - expectedScore)`
- AI opponent ELOs: Turtle=900, Owl=1100, Bull=1000, Fox=1200

### Integration with Main App
- `AcademyProgress.arenaScore` is replaced with `arenaStats: ArenaStats`
- `ArenaStats = { elo: number, wins: number, losses: number, draws: number }`
- Arena store reads playerName/rank from main app's progress state
- Match completion pushes updated stats + XP back to AcademyProgress
- Arena XP contributes to main rank progression via existing `addXP` logic

### ELO Badge Tiers

| Tier | ELO Range | Color | Label |
|---|---|---|---|
| Bronze | 0-999 | amber | Bronze |
| Silver | 1000-1199 | slate | Silver |
| Gold | 1200-1399 | yellow | Gold |
| Platinum | 1400-1599 | cyan | Platinum |
| Diamond | 1600+ | violet | Diamond |

## 7. Leaderboard

- 15-20 pre-populated realistic mock players
- Varied ELOs (800-1600), win rates, tier badges
- Player's entry dynamically inserted at correct rank
- Updates after each match
- Single "Global" tab (no Friends tab — no friend system exists)

## 8. Market Scenarios

20+ unique events across categories. Each event defines multipliers for all 6 asset classes.

### Example Scenarios

| Event | Severity | Equity | Bonds | Cash | Gold | Tech | Crypto |
|---|---|---|---|---|---|---|---|
| Bull Market Rally | 2 | +8% | +1% | 0% | -2% | +12% | +15% |
| Interest Rate Hike | 3 | -4% | -6% | +2% | +1% | -5% | -8% |
| Global Recession | 5 | -15% | +4% | +1% | +8% | -20% | -25% |
| Tech Boom | 3 | +5% | 0% | 0% | -1% | +18% | +10% |
| Pandemic Crash | 5 | -12% | +3% | +1% | +6% | -8% | -15% |
| Post-Crisis Recovery | 2 | +10% | -2% | 0% | -3% | +14% | +20% |
| Inflation Surge | 4 | -3% | -5% | -1% | +10% | -4% | +5% |
| Crypto Winter | 4 | +1% | +2% | +1% | +3% | -2% | -40% |

Full list of 20+ scenarios implemented in `arena-scenarios.ts` following this pattern.

- 8 random non-repeating events drawn per match

## 9. UI / Visual Design

### Design System Compliance
- All colors via CSS custom properties (oklch)
- Full dark mode support via `.dark` class
- DM Sans typography
- Framer Motion for all transitions and animations

### Micro-interactions
- Slider thumb: scale on grab, color shift with zone
- Timer: circular progress, color shifts (green → yellow → red) as time runs out
- Score reveals: counting number animation
- Phase transitions: slide/fade with spring physics
- Matchmaking: pulsing radar/search animation
- Win: confetti particles
- Portfolio changes: green flash (gain) / red flash (loss)

### Profile Avatar (Dashboard only)
- 32px circle with player initials
- Ring color matches rank tier
- Top-right of Dashboard header
- Tap → navigates to Profile screen

## 10. Dependencies

- `zustand` — state management for arena
- All other deps already in project (framer-motion, recharts, lucide-react)

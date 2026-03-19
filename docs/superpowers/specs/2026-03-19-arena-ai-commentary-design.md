# Arena AI Commentary — Design Spec

**Date**: 2026-03-19
**Status**: Approved
**Parent**: Arena Mode (`2026-03-19-arena-mode-design.md`)

## Overview

Add AI-powered commentary to Arena mode in two places:

1. **Round Commentary** — after each round, AI explains what just happened (extends the existing Round Reveal screen)
2. **Post-Match Analysis** — after the final round, AI explains the overall match outcome

Uses the same OpenAI `gpt-4o` integration pattern as Professor Fortuna and Time Machine Narrator.

## Round Commentary

### Flow Change

Current Round Reveal (`ArenaRoundReveal.tsx`):
- Shows both strategies, portfolio change, round winner banner
- Auto-advances after 3.5 seconds

New Round Reveal:
1. Round stats render immediately (unchanged)
2. Below stats, an AI commentary section fades in with pulsing dots loading indicator
3. AI text appears with simulated typewriter effect (~2-3 sentences) — **not SSE streaming**, full response fetched then revealed character-by-character client-side (same pattern as Time Machine narrator)
4. Auto-advance timer is **removed**; replaced by a "Next Round →" button
5. Button enables once AI text finishes loading **or after an 8-second timeout** (whichever comes first)
6. On timeout or API error: show fallback message "The markets moved too fast for analysis" and enable the button immediately
7. Player reads at their own pace, taps to continue

### AI Context (per round)

```typescript
interface RoundCommentaryContext {
  roundNumber: number;
  totalRounds: number;
  timeHorizon: number; // Used in system prompt: longer horizons mean short-term losses matter less
  event: {
    title: string;
    description: string;
    type: string;       // "crash" | "bull" | "crisis" | "recovery" | "boom" | "sideways" | "inflation"
    severity: number;
  };
  player: {
    risk: number;
    // Derived at call time via getAllocationFromRisk(risk) — NOT stored in the arena store
    allocation: Record<string, number>;
    portfolioBefore: number;
    portfolioAfter: number;
    returnPct: number; // Derived: (portfolioAfter - portfolioBefore) / portfolioBefore
  };
  opponent: {
    name: string;        // Display name from OPPONENTS[id].name (e.g., "The Owl")
    personality: string; // Store id: "turtle" | "owl" | "bull" | "fox"
    risk: number;
    // Derived at call time via getAllocationFromRisk(risk) — NOT stored in the arena store
    allocation: Record<string, number>;
    portfolioBefore: number;
    portfolioAfter: number;
    returnPct: number; // Derived: (portfolioAfter - portfolioBefore) / portfolioBefore
  };
}
```

**Derivation notes**:
- `allocation` fields: call `getAllocationFromRisk(risk)` from `arena-engine.ts` at context-building time. Do NOT add allocations to the store.
- `returnPct` fields: compute from consecutive portfolio values: `(after - before) / before`. Do NOT store per-round returns.
- `opponent.name`: read from `OPPONENTS[store.opponent!].name`. The `opponent` field in the store is `OpponentPersonalityId | null`, but it is guaranteed non-null during the reveal phase — use non-null assertion.
- `portfolioBefore` / `portfolioAfter`: read from `playerPortfolio[roundIndex-1]` and `playerPortfolio[roundIndex]` (same for opponent).

### AI Persona (Round)

Short, punchy financial sports commentator. Not academic — more like a match analyst calling the action live.

- 2-3 sentences max
- References specific decisions and their consequences
- Compares player vs opponent strategy when relevant
- Occasionally foreshadows ("if the market recovers, that aggressive bet could pay off")

### Example Outputs

> "Bold move going 75% risk during a market crash — you're betting on a quick recovery while Owl played it safe at 30%. It cost you 8% this round, but if the market bounces back, you'll be positioned to gain."

> "Both of you went conservative this round. Smart — during a sideways market, preserving capital is the play. Owl edges ahead by 0.3% thanks to slightly more bond exposure."

> "Fox just mirrored your aggressive strategy and it backfired for both of you. That tech crash hit hard — you're both down 12%. The difference? Fox had a tiny gold hedge that saved 2%."

## Post-Match Analysis

### Placement

In `ArenaResults.tsx`, a new section inserted **between the portfolio chart and the XP/ELO section**.

### AI Context (full match)

```typescript
interface MatchAnalysisContext {
  timeHorizon: number; // Used in system prompt: "With a 40-year horizon, short-term dips matter less"
  outcome: "win" | "loss" | "draw";
  opponent: {
    name: string;        // OPPONENTS[store.opponent!].name
    personality: string; // store.opponent (the id)
  };
  finalPortfolios: {
    player: number;
    opponent: number;
  };
  rounds: Array<{
    roundNumber: number;
    event: { title: string; type: string; severity: number };
    playerRisk: number;
    opponentRisk: number;
    playerReturn: number;   // Derived: (playerPortfolio[i] - playerPortfolio[i-1]) / playerPortfolio[i-1]
    opponentReturn: number; // Derived: same formula for opponent
    playerPortfolio: number;
    opponentPortfolio: number;
  }>;
}
```

**Derivation notes**:
- Per-round returns are NOT stored. Derive from consecutive portfolio values at context-building time.
- `playerRisk` / `opponentRisk` come from `store.playerDecisions[i]` / `store.opponentDecisions[i]`.
- `playerPortfolio` / `opponentPortfolio` come from `store.playerPortfolio[i+1]` / `store.opponentPortfolio[i+1]` (index 0 is starting capital).

### AI Persona (Post-Match)

Same commentator voice but slightly more reflective. 4-6 sentences covering:

- **Why the outcome happened** (the core narrative)
- **The pivotal round(s)** — where the match was won or lost
- **What the player did well** — positive reinforcement
- **What could improve** — constructive, specific, not generic

### Example Output

> "You won this one in Round 4. When the tech crash hit, you pulled risk down to 20% while Bull doubled down at 80% — that single round swung the match by CHF 1,200. Your overall strategy was solid: conservative during crashes, aggressive during recoveries. One thing to watch: you stayed at 50% risk during the boom in Round 6. Going higher there could've padded your lead even more. Final verdict: smart, disciplined play against an opponent who was always going to bet against you."

## API Route

### Endpoint

`POST /api/ai/arena`

### Request Body

```typescript
interface ArenaAIRequest {
  type: "round" | "match";
  context: RoundCommentaryContext | MatchAnalysisContext;
}
```

### Response

```typescript
interface ArenaAIResponse {
  response: string;
}
```

### Implementation

- Same pattern as `/api/ai/professor/route.ts` and `/api/ai/narrator/route.ts`
- Model: `gpt-4o`
- `max_tokens`: 250 (round), 400 (match)
- `temperature`: 0.7
- System prompt varies by `type`:
  - **Round**: Sports commentator persona, 2-3 sentences, reference specific numbers. Include guidance: "The investment horizon is {timeHorizon} years. Longer horizons mean short-term volatility matters less — factor this into your commentary."
  - **Match**: Same voice but reflective, 4-6 sentences, cover outcome/pivots/advice. Same timeHorizon guidance.

### Error Handling

- **Timeout**: 8 seconds. If no response within 8s, abort the fetch and show the fallback.
- On API failure or timeout: show fallback message "The markets moved too fast for analysis" — never block the game flow
- Loading state: pulsing dots animation while waiting for response
- The "Next Round →" button must ALWAYS become enabled after timeout/error — the game must never get stuck

### Streaming

This does NOT use SSE/streaming. The API returns the full response as a single JSON string. The typewriter effect is simulated client-side by revealing characters incrementally (same approach as Time Machine narrator).

## Files to Create / Modify

| Action | File | What Changes |
|--------|------|-------------|
| Create | `src/app/api/ai/arena/route.ts` | New API route with round + match system prompts |
| Create | `src/lib/arena-ai.ts` | Pure helper functions: `buildRoundContext()`, `buildMatchContext()`, `fetchArenaAI()` |
| Create | `src/hooks/useTypewriter.ts` | React hook for simulated typewriter effect (reusable) |
| Modify | `src/components/academy/arena/ArenaRoundReveal.tsx` | Add AI commentary section below stats, replace auto-advance with button |
| Modify | `src/components/academy/arena/ArenaResults.tsx` | Add post-match analysis section between chart and XP/ELO |

## UI Details

### Round Reveal — Commentary Section

- Appears below the existing round stats with a fade-in animation
- Small "AI Analysis" label with a sparkle/brain icon
- Text container with typewriter animation
- "Next Round →" button at the bottom, disabled while loading, primary style
- On final round (round 8): button reads "See Results →"

### Results — Match Analysis Section

- Card-style container matching the existing results screen styling
- "Match Analysis" header with the same icon
- Pulsing dots loading state while waiting for API response (same as round reveal)
- Text loads with typewriter animation once response arrives
- **Timing**: The AI fetch must happen AFTER the outcome calculation in `ArenaResults` — trigger it inside the same `useEffect` that computes `matchResult`, after `updateStats()` completes, not in a separate independent effect
- No interaction needed — it's informational content above the action buttons

## Non-Goals

- No chat/conversation with the AI during Arena (future consideration)
- No AI coaching during the round decision phase (would change the gameplay balance)
- No persistent history of AI commentary across matches

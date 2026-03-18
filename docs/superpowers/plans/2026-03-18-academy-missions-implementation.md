# Wealth Manager Academy - Complete Missions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build all 4 remaining missions (2, 4, 5, 6), enhance Mission 7 graduation, and polish the frontend so every screen works perfectly for the hackathon demo.

**Architecture:** Each mission is a self-contained React component following the Mission1/Mission3 pattern (briefing → interactive challenge → debrief). All missions use the same `onComplete(score, data?)` callback. Market data is loaded from the existing API. No new backend routes needed.

**Tech Stack:** Next.js 15, React 19, TypeScript, Framer Motion, Recharts, Tailwind CSS v4, Lucide icons

---

## Task 1: Mission 2 - "Don't Put All Your Eggs" (Diversification)

**Files:**
- Create: `src/components/academy/missions/Mission2.tsx`
- Modify: `src/app/page.tsx` (add case 2 to renderMission switch)

**Implementation:**
- Phase 1: Briefing with Professor explaining diversification
- Phase 2: Portfolio builder with 6 sliders (same categories as Mission 3)
- Phase 3: Mini-simulation - run 3 years of data, show result vs diversified benchmark
- Phase 4: Rebalance opportunity
- Phase 5: Run another 3 years, show improvement
- Phase 6: Debrief with score based on HHI diversification metric
- Professor comments dynamically on concentration risk

---

## Task 2: Mission 4 - "The Long Game" (Compound Growth)

**Files:**
- Create: `src/components/academy/missions/Mission4.tsx`
- Modify: `src/app/page.tsx` (add case 4 to renderMission switch)

**Implementation:**
- Phase 1: Briefing about compound growth
- Phase 2: Animated side-by-side comparison (Investor A vs B)
  - Investor A: CHF 200/mo, age 25-35 (10 years, CHF 24k total)
  - Investor B: CHF 200/mo, age 35-65 (30 years, CHF 72k total)
  - Animated counters showing both growing, A wins despite less invested
- Phase 3: Interactive planner - sliders for monthly amount, horizon, risk level
  - Show projected outcome with the estimation engine from src/lib/estimation.ts
- Phase 4: Professor explains compound growth, "hockey stick" moment
- Score based on whether player demonstrates understanding (quiz question)

---

## Task 3: Mission 5 - "Asset Classes 101" (Understanding Assets)

**Files:**
- Create: `src/components/academy/missions/Mission5.tsx`
- Modify: `src/app/page.tsx` (add case 5 to renderMission switch)

**Implementation:**
- Phase 1: Professor presents client brief (Maria, 35, wants house in 5 years + retirement savings)
- Phase 2: Asset class fact cards (tap to expand) - Stocks, Bonds, Gold, Cash, each with description + historical stats
- Phase 3: Player builds portfolio for Maria using sliders
- Phase 4: AI evaluates: Does house fund have appropriate risk? Does retirement allocation use growth? Emergency buffer?
- Score: Weighted check of 3 criteria (house fund safety, retirement growth, cash buffer)

---

## Task 4: Mission 6 - "The Arena" (Competitive Challenge)

**Files:**
- Create: `src/components/academy/missions/Mission6.tsx`
- Modify: `src/app/page.tsx` (add case 6 to renderMission switch)

**Implementation:**
- Phase 1: Professor announces class challenge with 4 AI bot classmates
- Phase 2: Player builds portfolio, bots have preset strategies:
  - Aggressive Alice: 100% equities
  - Cautious Carlos: 80% bonds/cash
  - Trendy Tanya: Chases last year's winner
  - Steady Stefan: 60/40, rebalances yearly
- Phase 3: 10-year simulation with live leaderboard (player + 4 bots)
  - 3 decision points (year 3, 6, 8) where player can rebalance
  - Bot dialogue at each decision point
- Phase 4: Final rankings with behavioral scoring
- Score: Weighted composite (returns 25%, risk-adj 25%, diversification 20%, behavioral 20%, consistency 10%)

---

## Task 5: Mission 7 Enhancement + DNA Report Polish

**Files:**
- Modify: `src/components/academy/DNAReport.tsx`
- Modify: `src/app/page.tsx` (Mission 7 graduation flow)
- Modify: `src/lib/academy-state.ts` (add more tracked data)

**Implementation:**
- Add graduation ceremony: Professor speech before DNA reveal
- Enhance personality engine: use all mission data (diversification score from M2, compound growth understanding from M4, client portfolio quality from M5, arena ranking from M6)
- Add more personality types (6 total)
- Polish the DNA card: better radar chart data, gradient backgrounds, share button
- Add QR code to the DNA card using qrcode.react

---

## Task 6: Frontend Polish & Integration

**Files:**
- Modify: `src/app/page.tsx` (wire all missions)
- Modify: `src/components/academy/Dashboard.tsx` (polish)
- Modify: `src/components/academy/MissionResult.tsx` (polish)
- Modify: `src/app/globals.css` (any theme fixes)

**Implementation:**
- Wire all missions into renderMission switch in page.tsx
- Ensure XP/rank progression displays correctly after each mission
- Fix any remaining animation issues
- Verify contrast/readability on all screens
- Test full flow: enrollment → M1 → M2 → M3 → M4 → M5 → M6 → M7 → DNA
- Commit and push

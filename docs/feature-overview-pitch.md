# Wealth Manager Academy — Complete Feature Overview & Pitch Guide

> **PostFinance START Hack 2026** | Gamified Investment Education Platform
> Currency: CHF | Target: Investment beginners | Platform: Mobile-first web app (iPhone frame)

---

## Table of Contents

1. [App Overview](#app-overview)
2. [Feature Inventory](#feature-inventory)
   - [Onboarding & Personalization](#1-onboarding--personalization)
   - [Academy Dashboard & Progression](#2-academy-dashboard--progression)
   - [Missions (6 Playable)](#3-missions-6-playable)
   - [Future Engine (Financial Planning)](#4-future-engine-financial-planning)
   - [Time Machine (Historical Documentary Mode)](#5-time-machine-historical-documentary-mode)
   - [Solo Simulation Mode](#6-solo-simulation-mode)
   - [Historic Simulator](#7-historic-simulator)
   - [Arena Mode (Competitive PvP)](#8-arena-mode-competitive-pvp)
   - [Professor Fortuna (AI Chat)](#9-professor-fortuna-ai-chat--gpt-4o)
   - [Investment DNA Report](#10-investment-dna-report)
3. [Gamification System](#gamification-system)
4. [Design & Technical Stack](#design--technical-stack)
5. [Data Layer](#data-layer)
6. [Demo-Worthy Highlights](#demo-worthy-highlights)
7. [Feature Comparison Matrix](#feature-comparison-matrix)
8. [Improvement Suggestions for Pitch / Demo](#improvement-suggestions-for-pitch--demo)

---

## App Overview

**Wealth Manager Academy** is a gamified investment education web app that teaches beginners core investing principles — risk profiling, diversification, long-term thinking, emotional discipline during volatility — without using real money.

The app is designed to look and feel like a **mobile banking app** rendered inside an iPhone frame (375×812px) in a desktop browser. It uses **real historical market data** (SMI, Dow Jones, Euro Stoxx 50, bonds, gold) provided by PostFinance, alongside synthetic scenario data for practice modes.

**Core thesis**: Nobody learns to invest from a lecture. They learn by living through a crisis and surviving it. The app scores **behavioral discipline, not returns** — rewarding emotional control, diversification, and long-term thinking over chasing performance.

---

## Feature Inventory

### 1. Onboarding & Personalization

**Location**: `src/components/academy/OnboardingFlow.tsx`

A 9-step onboarding flow that feels like opening a real banking app:

| Step | What It Collects |
|------|-----------------|
| 1 | Splash screen (PostFinance branding) |
| 2–4 | Three intro slides explaining the academy concept |
| 5 | Player name |
| 6 | Player age |
| 7 | Monthly contribution amount (CHF) |
| 8 | Investment goal (e.g., retirement, house, education) |
| 9 | Risk profile assessment |

**Why it matters for the pitch**: Every subsequent screen is personalized — the Future Engine uses real contribution amounts, Professor Fortuna addresses the player by name, the DNA Report reflects actual behavior. This isn't a generic quiz; it's a tailored financial education journey.

**Output**: `OnboardingResult` object containing all collected data, passed to the parent app state and used throughout the experience.

---

### 2. Academy Dashboard & Progression

**Location**: `src/components/academy/Dashboard.tsx`

The main hub screen after onboarding. Displays:

- **Rank & XP**: Current rank title with progress bar toward next rank
- **3-column stat grid**: Rank badge, total XP, missions completed
- **"Next Mission" CTA card**: Highlights the next uncompleted mission with its concept and difficulty
- **Full mission list**: All 6 missions with completion status, letter grades, and lock indicators
- **Time Machine CTA** (when merged): Dark navy gradient card with Clock icon, labeled "New" with a gold badge — entry point to the Time Machine experience

**Navigation**: Bottom nav with 5 tabs:
1. **Home** — Dashboard
2. **Future** — Future Engine
3. **Professor** (center, graduation cap icon) — AI Chat
4. **Solo** — Solo Simulation
5. **Arena** — Competitive PvP

---

### 3. Missions (6 Playable)

**Location**: `src/components/academy/missions/`

Each mission teaches one core investing concept through an interactive scenario. Missions earn XP, receive letter grades (A–F), and feed data into the Investment DNA Report.

#### Mission 1: "Know Thyself" — Risk Profiling
**File**: `Mission1.tsx`

- **Mechanic**: 4 crisis scenarios (2008 crash, 20-year inheritance, portfolio up 25%, bank collapse), each presenting 4 choices scored 0–3 points
- **Visualization**: Radar chart reveals the player's risk archetype after all scenarios
- **Output**: `RiskArchetype` — used to personalize all subsequent experiences
- **Educational goal**: Self-awareness about risk tolerance before investing

#### Mission 2: "Don't Put All Your Eggs" — Diversification
**File**: `Mission2.tsx`

- **Mechanic**: Portfolio building exercise — player allocates capital across asset classes
- **Visualization**: Watch simulated market movement impact the portfolio in real-time
- **Scoring**: Uses **Herfindahl-Hirschman Index (HHI)** to measure concentration — lower concentration = higher score
- **Output**: Diversification score
- **Educational goal**: Understanding why spreading investments across assets reduces risk

#### Mission 3: "When Markets Bleed" — Volatility & Crashes
**File**: `Mission3.tsx`

- **Mechanic**: COVID crash scenario — the market is plummeting, and the player must choose: hold or panic sell
- **Scoring**: Panic selling = -25 points, holding through the crash = bonus points
- **Output**: `crashBehavior` — records the player's emotional response to market stress
- **Educational goal**: Emotional discipline is more important than timing the market
- **Why it's demo-worthy**: Creates a visceral "what would you do?" moment with real consequences shown in CHF

#### Mission 4: "The Long Game" — Compound Growth
**File**: `Mission4.tsx`

- **Mechanic**: Interactive comparison — starting early with small amounts vs. investing more later
- **Visualization**: Side-by-side growth curves showing compound interest's exponential effect
- **Educational goal**: Time in the market beats timing the market

#### Mission 5: "Asset Classes 101" — Portfolio Building
**File**: `Mission5.tsx`

- **Mechanic**: Player receives a "client brief" with a target risk profile and must build a matching portfolio
- **Scoring**: How closely the player's allocation matches the optimal allocation for the client
- **Educational goal**: Understanding different asset classes and their roles in a portfolio

#### Mission 6: "The Arena" — Competition
**File**: `Mission6.tsx`

- **Mechanic**: Launches the full Arena experience (see [Arena Mode](#8-arena-mode-competitive-pvp))
- **Educational goal**: Applying all learned concepts under competitive pressure

---

### 4. Future Engine (Financial Planning)

**Location**: `src/components/academy/FutureEngineScreen.tsx` + `src/lib/future-engine.ts` + `src/lib/future-ai.ts`

The second main tab — a personalized financial projection calculator that makes long-term investing feel tangible and urgent.

#### Core Functionality

| Feature | Details |
|---------|---------|
| **Goal projection** | Compound interest + regular contribution FV formula |
| **Time-to-goal** | Binary search algorithm to find years needed to reach target |
| **Year-by-year balances** | Full table generated for AreaChart visualization |
| **4-milestone progress bar** | 25% / 50% / 75% / 100% of goal with estimated years |
| **Goal picker dropdown** | Pre-defined goals from onboarding |
| **Monthly contribution slider** | CHF 50 – 2,000 |
| **Expected return slider** | 3% – 10% annual |

#### Scenario Comparison (3 scenarios)

1. **Base**: Current contribution + return rate
2. **Boost After 5 Years**: Double contribution at year 5
3. **Double Boost Strategy**: 2× at year 5, 3.33× at year 8

All three are plotted on the same AreaChart so the player can see the compounding effect of increasing contributions.

#### Cost-of-Waiting Alert

Calculates and displays in CHF how much 3 years of delay costs. Example: "Waiting 3 years costs you CHF 47,000 in lost growth." This creates urgency and is emotionally compelling in a demo.

#### AI Coach Insights (3 contextual messages)

Generated by `src/lib/future-ai.ts` — NOT live API calls, but computed contextual messages based on the player's inputs:
- `getProjectionExplanation()` — explains what the numbers mean
- `getCostOfWaitingInsight()` — reinforces the cost of delay
- `getFutureSelfMessage()` — a fictional letter from the player's older self thanking them for starting to invest

#### Optimize My Plan Modal

Shows 4 actionable optimization suggestions:
1. Boost contribution by 25%
2. Wait 2 extra years (extend horizon)
3. Step-up plan (gradual increase)
4. Lower target by 20%

**Why it matters for the pitch**: This is where education meets action. The Future Engine answers "what does investing actually mean for MY life?" with personalized numbers. The "Future Self Message" is emotionally resonant and unique. The cost-of-waiting metric gives PostFinance a natural conversion hook.

---

### 5. Time Machine (Historical Documentary Mode)

**Location**: `src/components/academy/TimeMachineScreen.tsx` + `src/data/time-machine-eras.ts`
**Status**: Merged to main and accessible from dashboard

The Time Machine is the app's **signature feature** — a cinematic, documentary-style journey through real financial history. Instead of abstract lessons, players *live through* the most dramatic market crises of the past two decades.

**Tagline**: *"Nobody learns to invest from a lecture. They learn by living through a crisis and surviving it."*

#### The 6 Historical Eras

| Era | ID | Date Range | Peak Drop | Recovery Time | Safe Haven | Accent Color |
|-----|-----|-----------|-----------|--------------|------------|--------------|
| Great Financial Crisis | `gfc-2008` | 2007–2009 | **-57%** | 4 years | Gold | Red `#dc2626` |
| European Debt Crisis | `euro-debt` | 2010–2012 | **-22%** | 2 years | Swiss Franc | Blue `#2563eb` |
| The Long Bull Run | `bull-run` | 2013–2019 | **-15%** | Weeks | Diversification | Green `#059669` |
| COVID Crash | `covid-2020` | 2020 | **-34%** | 5 months | Government Bonds | Purple `#7c3aed` |
| Inflation & Rate Shock | `inflation-2022` | 2021–2023 | **-33%** | 1 year | Commodities | Orange `#ea580c` |
| The Full Journey | `full-journey` | 2007–2024 | **-57%** | 20 years | Time & Patience | Gold `#FFC800` |

#### User Experience Flow

**Phase 1 — Era Selection (The Timeline)**
- Vertical scrollable timeline with 6 `EraCard` components
- Each card shows: emoji, date range, era title, tagline in italics, hero stat (peak drawdown in large bold type), recovery time, safe-haven asset
- Gradient color accent bar at the top of each card (era-specific color)
- Timeline dot with era accent color on the left side

**Phase 2 — Era Detail Overlay**
When tapping an era, an animated overlay slides in showing:
1. **Era header** — emoji + gradient bar + title + tagline
2. **3 stat cards** — big drawdown, recovery time, safe-haven asset
3. **Headlines section** — 4 real newspaper-style headlines from that era (e.g., "Lehman Brothers Files for Bankruptcy", "Markets Crash as Pandemic Declared")
4. **Market Breakdown grid** — 6 asset/market performance figures (e.g., S&P 500 -57%, Gold +25%, Swiss Bonds +8%)
5. **Key Events list** — 4–5 events with severity dots (5-dot system filled with era accent color), date, title, and impact description

**Phase 3 — "Begin Journey" (Narration Mode)**
- Pressing "Begin Journey" triggers a **typewriter animation** of the `narratorOpening` text — a documentary-style narration of what was about to happen in that era
- Typing speed: 18ms per character with a blinking cursor animation
- After the text finishes, a "Key Lesson" section fades in below
- Example narration (GFC): *"It's October 2007. The Dow Jones has just hit an all-time high. Real estate agents are buying second homes. Banks are lending to anyone with a pulse..."*

**Warp-In Animation**: When entering TimeMachineScreen, a yellow (`#FFC800`) flash overlay fades out over 800ms — simulating the time machine arrival effect.

#### Planned Full Game Loop (Design Spec — not yet implemented as active simulation)

The spec describes "Chronicle Mode":
1. Select era → time machine warp animation
2. View AI-generated front-page headlines + build portfolio (CHF 100,000 across SMI, DJIA, EuroStoxx, bonds, gold, cash)
3. Time accelerates (1 week per 3 seconds → 18-month era plays out in ~3.5 minutes)
4. At 4–6 **decision points** (mapped to real historical events), time pauses and the AI narrator intervenes with a dramatic description
5. Player chooses: **Hold / Rebalance / Panic Sell**
6. After each decision, narrator reveals what actually happened next + educational insight
7. End of era: "Return to Present" animation → results screen with score breakdown
8. AI "exit interview" — 3–4 paragraphs directly addressing the player's specific decisions

#### Planned AI Archetype Bots (Design Spec)

Three AI opponents with distinct behavioral personalities:
- **The Panic Seller** — anxious, sells on every 5% dip, GPT-generated worried dialogue
- **The Diamond Hands** — Buffett-quoting stoic, never trades regardless of conditions
- **The Contrarian** — buys when everyone else is selling, sells when everyone is euphoric

Each has deterministic strategy algorithms and GPT-generated dialogue. Educational purpose: show the *cost* of each behavioral archetype vs. the player's actual decisions.

#### What Makes Time Machine Unique

1. **"You vs. History" framing** — no other investment education app lets you re-live the 2008 crash
2. **Documentary narration** — typewriter text creates dramatic pacing, like a Netflix financial documentary
3. **Severity dot system** — 5 colored dots for event intensity, instantly scannable
4. **Era-specific ambient glow** — blurred circle of accent color in the overlay background (GFC glows red, COVID glows purple)
5. **Real data, real events, real headlines** — not synthetic or hypothetical scenarios
6. **Planned: Async Challenge Links** — "I scored 78/100 navigating the 2008 crisis. Can you do better?" — viral sharing mechanic with encoded era, score, and decisions

---

### 6. Solo Simulation Mode

**Location**: `src/components/academy/SoloScreen.tsx` + `src/lib/solo-simulation.ts` + `src/lib/solo-calculations.ts` + `src/lib/solo-analysis.ts` + `src/data/solo-scenarios.ts`

A self-contained synthetic market simulation for practice and experimentation. Recently upgraded with a **5-turn game loop**, improved chart axes with readable currency labels, and realistic portfolio math where assets can lose value.

#### Setup Phase
- **Time horizon slider**: 10–50 years
- **Risk strategy slider**: Conservative → Aggressive with 4 named presets
- **Pie chart preview**: Shows allocation breakdown before starting
- **Starting capital**: CHF 1,000 initial + CHF 300/quarter regular contributions

#### Running Phase (5-Turn Game Loop)
- **5 turns per game** with checkpoint pauses between each turn
- **Real-time quarterly ticks** with portfolio AreaChart updating live (readable CHF labels on Y-axis)
- **Live news feed** showing market events with event titles and year
- **Pause/Resume controls** + 3-speed toggle (slow/normal/fast)
- **Checkpoint events** pause the simulation for player decisions (hold/sell/buy)
- **Realistic portfolio math** — assets can lose value, not just grow at different rates

#### Completion Phase
- Final portfolio value and annualized return
- **Smart moves vs. mistakes** — itemized list of good and bad decisions
- **AI analysis** — rule-based text generation analyzing the player's strategy
- **Coaching takeaways** — personalized lessons based on performance

#### 7 Market Scenarios
Synthetic scenario templates covering: Tech Boom, Inflation Decade, Golden Age, Commodity Supercycle, and more. Each defines quarterly market conditions, event triggers, and asset class returns.

#### How Solo Differs from Time Machine / Historic Simulator

| Dimension | Solo Mode | Time Machine | Historic Simulator |
|-----------|-----------|-------------|-------------------|
| Data | Synthetic/probabilistic | Real historical (static) | Real CSV market data |
| Duration | 10–50 years (player choice) | Fixed eras (1.5–7 years) | Full 2006–present |
| Contributions | CHF 300/quarter recurring | CHF 100,000 lump sum | Player-defined |
| Customization | High (duration, risk, speed) | Era selection only | Risk profile only |
| Narrative | Generic market news feed | Documentary narration | Market event annotations |
| Tone | Clean fintech card UI | Cinematic/documentary | Dark terminal aesthetic |

---

### 7. Historic Simulator

**Location**: `src/components/academy/HistoricSimulator.tsx` + `src/lib/simulation-engine.ts` + `src/lib/scoring.ts` + `src/lib/market-data.ts`

The data-driven simulation engine that uses **real PostFinance CSV market data**.

#### How It Works
1. Player chooses a risk profile
2. Simulation loads real market data (2006–present) and pre-computes all ticks via `buildSimulation()`
3. **Time-accelerated playback** at 150ms per tick — portfolio vs. SMI benchmark chart updates live
4. At annotated **market events** (COVID crash, 2008 financial crisis, Swiss Franc shock, etc.), simulation pauses
5. Player chooses: **Hold / Buy More / Rebalance / Panic Sell**
6. `applyRebalance()` recalculates all subsequent ticks based on the decision
7. End: **4-dimensional behavioral score** (100-point scale)

#### Behavioral Scoring System (4 dimensions)

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Emotional Discipline | 30% | -25 per panic sell, +bonus for holding through decision points |
| Diversification | 25% | HHI concentration index — lower concentration = higher score |
| Long-term Thinking | 25% | Time in market vs. cash, penalizes overtrading |
| Risk Appropriateness | 20% | Deviation from stated risk profile |

Plus: `estimatePanicCost()` — calculates CHF lost vs. a "never sold" counterfactual. Shows players exactly how much their panic cost them.

#### 12 Annotated Market Events (2007–2022)
Each event includes: date, title, description, severity (`info`/`major`/`critical`), educational lesson tag, optional `mentorLine` and `beatLine` for narrative context.

Key events: Lehman collapse, The Bottom (Mar 2009), European Debt Crisis, Swiss Franc Shock, COVID Crash, Post-COVID Boom, Inflation Shock.

**Not in the main bottom nav** — accessible via `screen === "simulator"`. The Time Machine is designed as its spiritual successor with better UX and narrative framing.

---

### 8. Arena Mode (Competitive PvP)

**Location**: `src/components/academy/arena/` (6 components) + `src/lib/arena-store.ts` + `src/lib/arena-engine.ts` + `src/lib/arena-opponents.ts` + `src/data/arena-scenarios.ts` + `src/data/arena-leaderboard.ts`

The competitive multiplayer simulation — Mission 6 in the academy and a standalone bottom nav tab.

#### Architecture
- State managed by **Zustand** (`arena-store.ts`)
- Phase state machine: `lobby → matchmaking → setup → match → reveal → results`
- Starting capital: **CHF 10,000**
- **8 rounds per match**

#### Match Flow

**1. Lobby** (`ArenaLobby.tsx`)
- Player stats display: ELO rating, wins/losses/draws
- Opponent selection
- Leaderboard access button

**2. Matchmaking** (`ArenaMatchSetup.tsx`)
- Animated search animation
- Opponent reveal with personality details and avatar
- Time horizon selection: 20 / 30 / 40 years (affects volatility scaling)
- Scenario selection from 15 available scenarios

**3. Active Match** (`ArenaMatch.tsx`)
- 8 rounds, each showing a `ScenarioEvent` with type, title, description, and severity level
- **15-second countdown timer** (animated SVG circle) — creates real tension
- Player sets risk level 0–100 via slider
- Risk level → 7-asset-class allocation via `getAllocationFromRisk()`:
  - Global Equity, Swiss Equity, Bonds, Cash, Gold, Bitcoin, Tech Growth
  - Linear interpolation between conservative/balanced/aggressive anchor allocations
- Round return = weighted sum of asset impacts × volatility scale × player allocation
- AI opponent risk computed by `calculateOpponentRisk()` based on personality
- Live portfolio mini-chart and allocation breakdown visible during match

**4. Round Reveal + AI Commentary** (`ArenaRoundReveal.tsx`)
- Side-by-side comparison: player vs. opponent risk choices
- Round return animation
- Portfolio value comparison with running totals
- **NEW: GPT-5.2 AI Commentary** — after each round, a live AI sports-commentator-style analysis explains what happened, referencing specific CHF amounts, risk levels, and strategy comparisons
- Typewriter animation for commentary text (character-by-character reveal)
- "Next Round" button replaces auto-advance — player reads at their own pace

**5. Results + Post-Match AI Analysis** (`ArenaResults.tsx`)
- Final portfolio value comparison
- Win / Loss / Draw determination
- ELO change calculation (standard K=32 formula)
- XP earned (Win: ~50 XP, Draw: ~25 XP, Loss: 10 XP, bonus for >20% or >50% return)
- **Round-by-round portfolio chart** (green = player, red = opponent, with Y-axis labels)
- **NEW: GPT-5.2 Post-Match Analysis** — 4-6 sentence AI breakdown covering: why the outcome happened, the pivotal round(s), what the player did well, and what could improve
- Typewriter animation for analysis text
- Match statistics breakdown

#### 4 AI Opponent Personalities

| Personality | ELO | Behavior | Demo Value |
|-------------|-----|----------|-----------|
| **Turtle** | 900 | Max risk 50, panics on crashes, slow recovery | Easy opponent for beginners |
| **Owl** | 1,100 | Balanced, adjusts proportionally to event severity | "Smart" baseline opponent |
| **Bull** | 1,000 | Risk 65–85, contrarian (buys dips), euphoric in bull markets | Teaches contrarian thinking |
| **Fox** | 1,200 | Mirrors player's previous round risk ±10 | Mind-game mechanic, most engaging |

#### 15 Arena Scenarios
Rich market scenario templates including:
Tech Boom & Bust, The Inflation Decade, Golden Age of Growth, Commodity Supercycle, Rollercoaster Recovery, Safe Haven Era, Great Bull Run, Stagflation Trap, Flight to Gold, Crypto Winter & Summer, The Lost Decade, Great Rebound, The Income Age, World in Flux, **The AI Revolution**

#### Leaderboard (`ArenaLeaderboard.tsx`)
- 18 mock entries with Swiss/European names
- **5 ELO tiers**: Bronze / Silver / Gold / Platinum / Diamond
- ELO range: 821–1,648
- Player's row highlighted in the table

#### AI-Powered Arena Commentary (NEW)

**Location**: `src/app/api/ai/arena/route.ts` + `src/lib/arena-ai.ts` + `src/hooks/useTypewriter.ts`

The Arena now features **deep AI integration** powered by OpenAI GPT-5.2:

| Feature | Details |
|---------|---------|
| **Round Commentary** | After every round, AI delivers a 2-3 sentence sports-commentator-style analysis referencing specific numbers (risk levels, CHF amounts, percentages) |
| **Post-Match Analysis** | 4-6 sentence breakdown of the entire match: why you won/lost, pivotal rounds, strengths, areas to improve |
| **Typewriter Effect** | Commentary streams in character-by-character for dramatic effect |
| **Context-Aware** | AI receives full round context: event details, both players' risk/allocation/returns, time horizon, portfolio history |
| **Graceful Fallback** | 8-second timeout ensures the game never gets stuck — fallback message shown if API is slow |

**Example AI Round Commentary**:
> "Bang—severity 4/5 crash lands and Player's risk-50 stance takes the heavier hit: CHF 10,000 → CHF 8,680 (-13.2%), while The Owl's risk-30 defense holds tighter at CHF 10,000 → CHF 9,276 (-7.2%). Over a 20-year match this is just the opening body blow, but if the market bounces back, that higher-risk setup could swing harder on the rebound."

**Why it matters for the pitch**: The 15-second countdown timer creates genuine tension in a room. The Fox opponent's mirroring mechanic makes players think strategically. The AI commentary after each round turns every decision into a learning moment — the player understands *why* their strategy worked or failed, not just that it did. The ELO system + leaderboard makes it workshop-ready — put 20 people in a room, give them 10 minutes, and you have a natural competitive event with AI-powered coaching built in.

---

### 9. Professor Fortuna (AI Chat)

**Location**: `src/components/academy/ProfessorChat.tsx` + `src/app/api/ai/professor/route.ts`

A **live AI-powered tutor** accessible from any screen via the center graduation cap button in the bottom nav.

#### Implementation Details
- **Model**: OpenAI `gpt-4o` (Professor & Narrator), `gpt-5.2` (Arena commentary)
- **API endpoint**: `POST /api/ai/professor`
- **Input**: `{ messages, playerName, rank }` — last 10 messages for context
- **System prompt personality**: Warm but demanding, Socratic method, 2–4 sentence responses, never gives specific stock advice
- **Personalization**: Addresses the player by name, references their current rank
- **Fallback**: 5 hardcoded educational messages if the API fails (no error shown to user)
- **UI**: Full-screen chat interface with typing indicator animation

#### Why It's Demo-Worthy
This is a real AI conversation, not canned responses. During a demo, you can ask Professor Fortuna anything about investing and get a thoughtful, personalized answer. It's the "wow moment" that shows the app isn't just a quiz — it's an adaptive learning companion.

**Demo script suggestion**: Ask "Professor, I just panic-sold during the COVID crash in Mission 3. Was that a mistake?" and watch the AI give a nuanced, educational response referencing the player's specific situation.

---

### 10. Investment DNA Report

**Location**: `src/components/academy/DNAReport.tsx`

A personalized "diploma" card that synthesizes all of the player's behavior across missions into a single visual identity.

#### What It Shows
- **Personality archetype** (one of 5): Steady Guardian, Bold Pioneer, Thrill Seeker, Steady Builder, Learning Investor
- **Radar chart** with 5 dimensions:
  - Discipline
  - Risk Awareness
  - Growth Mindset
  - Diversification
  - Long-term Vision
- **Strengths** — what the player does well
- **Blind spots** — areas for improvement
- **Share button** — for social proof / viral mechanics

#### Visual Design
- Dark gradient card with the app's signature glow effect (`pf-glow-sm`)
- `shimmer` CSS animation on the card surface
- Radar chart uses Recharts `RadarChart` component

#### Unlock Condition
Available after completing 2+ missions. Acts as a "graduation certificate" from the academy.

**Why it matters for the pitch**: This is the shareable artifact. Every player leaves with a personalized result they can screenshot or share. For PostFinance, it's also a data goldmine — understanding their customer base's behavioral tendencies before they even open an account.

---

## Gamification System

### XP & Ranks

| Rank | XP Required | Title |
|------|------------|-------|
| 1 | 0 | Cadet |
| 2 | 100 | Analyst |
| 3 | 350 | Strategist |
| 4 | 700 | Portfolio Manager |
| 5 | 1,000 | Graduate |

**XP sources**:
- Missions: score × 1.5 + 30 bonus for A grade
- Arena wins: ~50 XP
- Arena draws: ~25 XP
- Arena losses: 10 XP
- Arena bonuses: extra XP for >20% or >50% return

### Letter Grades
Every mission receives an A–F grade displayed on the dashboard. Grades are calculated from the mission's specific scoring criteria (e.g., diversification HHI, emotional discipline, risk matching).

### ELO Rating (Arena)
Standard chess-style ELO with K=32. Starting rating: 1,000. Displayed in the Arena lobby and leaderboard.

### Behavioral Scoring Philosophy
The entire gamification system rewards **discipline over returns**:
- Panic selling = point penalty
- Holding through a crash = bonus
- Diversification measured by HHI (mathematical, not subjective)
- Cost-of-panic-selling shown in CHF

This directly addresses PostFinance's brief requirement to "discourage gambling behavior."

---

## Design & Technical Stack

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS v4, CSS custom properties for theming |
| AI | OpenAI GPT-4o (Professor, Narrator) + GPT-5.2 (Arena commentary) — 3 live API endpoints |
| State | Zustand (Arena), React useState (everything else) |
| Animations | Framer Motion (all transitions, card reveals, button interactions) |
| Charts | Recharts (AreaChart, LineChart, RadarChart, PieChart) |
| UI Primitives | Radix UI (Dialog, Progress, Tabs, Slot) |
| Utilities | class-variance-authority, tailwind-merge |
| QR Code | qrcode.react (installed, not yet used) |

### Design System

- **Primary color**: PostFinance yellow — `oklch(0.82 0.17 85)` ≈ `#FFC800`
- **Secondary color**: Deep purple — `oklch(0.35 0.12 290)` ≈ `#33307E`
- **Font**: DM Sans (Google Fonts, 300–800 weight)
- **Border radius**: `0.75rem`
- **Dark/Light mode**: Full CSS variable swap, persisted to `localStorage`
- **Mobile-first**: 375×812px iPhone frame (`rounded-[30px]`) with 8px primary color border
- **Custom CSS**: `pf-slider` (styled range input), `pf-glow-sm` (yellow shadow), `shimmer` animation

---

## Data Layer

### No Database / No Auth
All state is in-memory (React useState / Zustand). No authentication, no user accounts, no sessions. Progress resets on page refresh. `localStorage` used only for theme preference.

### Real Market Data (PostFinance CSV files in `/data/`)

| File | Contents |
|------|----------|
| `Market_Data - Equity Indices.csv` | SMI, Euro Stoxx 50, DJIA daily prices |
| `Market_Data - Gold.csv` | Gold price in CHF |
| `Market_Data - Bonds.csv` | Swiss Bond AAA-BBB Total Return Index |
| `Market_Data - DJIA_Single Stocks.csv` | Individual DJIA stock data |
| `Market_Data - SMI_Single Stocks.csv` | Individual SMI stock data |
| `Market_Data - FX.csv` | Foreign exchange rates |

**API route** `GET /api/market-data` loads, parses (European number/date formats), forward-fills gaps, samples weekly, and serves as JSON.

### Static TypeScript Data

| File | Contents |
|------|----------|
| `src/data/time-machine-eras.ts` | 6 historical eras with events, headlines, stats |
| `src/data/arena-scenarios.ts` | 15 market scenario templates for Arena |
| `src/data/arena-leaderboard.ts` | 18 mock leaderboard entries |
| `src/data/solo-scenarios.ts` | 7 scenario templates for Solo mode |
| `src/data/market-events.json` | 12 annotated events (2007–2022) for Historic Simulator |

---

## Demo-Worthy Highlights

Ranked by impact during a live pitch:

### Tier 1 — "Show These First"

1. **Time Machine Era Selection + Narration** — The warp-in animation, the timeline of crises, and the typewriter narration create an immediate "this is different" reaction. Open with the GFC era: *"It's October 2007. The Dow Jones has just hit an all-time high..."*

2. **Professor Fortuna AI Chat** — Live GPT-4o. Ask it a question about the player's specific situation. This is the "it's actually smart" moment that separates this from every other quiz app.

3. **Arena Mode with AI Commentary** — Put two audience members on stage. Give them phones. The 15-second countdown creates genuine tension. After each round, GPT-5.2 delivers a live sports-commentary breakdown: *"Bang—severity 4/5 crash lands and Player's risk-50 stance takes the heavier hit: CHF 10,000 → CHF 8,680..."* The crowd learns while they watch.

### Tier 2 — "Show If You Have Time"

4. **Mission 3: COVID Crash Decision** — "Hold or panic sell?" with CHF consequences. Emotionally resonant, universally relatable (everyone remembers COVID).

5. **Future Engine: Cost of Waiting** — "Waiting 3 years costs you CHF 47,000." The Future Self Message adds emotional weight.

6. **DNA Report Reveal** — The radar chart, the archetype name, the dark gradient card with shimmer animation. It's the "graduation moment."

### Tier 3 — "Reference During Q&A"

7. **Behavioral scoring (not returns)** — "We score discipline, not performance. This discourages gambling."
8. **Real PostFinance data** — "We used your actual market data, not simulations."
9. **ELO rating system** — "Drop this in a workshop with 50 people and you have instant engagement."
10. **iPhone frame** — "It's a web app that feels like a mobile product. Ready for deployment."

---

## Feature Comparison Matrix

| Capability | Time Machine | Solo | Historic Sim | Arena |
|-----------|:---:|:---:|:---:|:---:|
| Real market data | Planned | No | Yes | No |
| Synthetic scenarios | No | Yes | No | Yes |
| Player decisions | Planned | Yes | Yes | Yes (risk slider) |
| AI narration | Typewriter | No | No | **Yes (GPT-5.2 commentary)** |
| Competitive | Planned | No | No | Yes (ELO) |
| Timer pressure | No | No | No | Yes (15s) |
| Behavioral scoring | Planned | Rule-based | Yes (4-dim) | XP-based |
| Customizable duration | No | Yes (10-50y) | No (full history) | No (20/30/40y) |
| News feed | Headlines | Live feed | Event annotations | Event cards |
| Portfolio building | Planned | Risk slider | Risk profile | Risk slider |
| Speed control | No | Yes (3 speeds) | Fixed 150ms | Fixed |
| Share/viral | Planned | No | No | No |

---

## Recent Improvements (This Session)

### Completed

| # | Improvement | Status |
|---|------------|--------|
| 1 | **Arena AI Commentary (GPT-5.2)** — Live round-by-round AI analysis + post-match breakdown | Done |
| 2 | **Time Machine merged to main** — Accessible from dashboard | Done |
| 3 | **Solo 5-turn game loop** — Chart axes with readable CHF labels, realistic portfolio math | Done |
| 4 | **Arena chart fix** — Portfolio comparison chart now renders correctly with green/red colors and Y-axis | Done |
| 5 | **Arena "Record" label** — Replaced confusing "W/L" with colored "0W 0L" + "Record" label | Done |
| 6 | **Typewriter hook** — Reusable `useTypewriter` hook for animated text reveal | Done |

---

## Improvement Suggestions for Pitch / Demo

### Quick Wins (1–2 hours each)

#### 1. Demo Mode / Skip Button
Add a hidden "demo mode" that pre-fills onboarding, completes 3 missions, and drops on the Dashboard with XP/rank already populated. Avoids 2 minutes of onboarding during a time-constrained pitch.

**Implementation**: Add a `?demo=true` URL parameter that triggers `setOnboardingComplete(true)` with preset data.

#### 2. Persist State to localStorage
Currently all progress resets on refresh. Basic `localStorage` persistence would let you pause a demo, show something else, and return without starting over.

**Implementation**: Serialize the page-level state (`completedMissions`, `xp`, `rank`, `playerName`) to localStorage on change, restore on mount.

#### 3. QR Code Landing Page
`qrcode.react` is already installed but unused. Add a QR code on a splash/landing page so audience members can scan and play along on their phones during the pitch.

#### 4. Sound Effects on Arena Countdown
The 15-second timer is tense visually but silent. A ticking sound + buzzer would amplify the competitive feel in a room. Use the Web Audio API — no dependencies needed.

#### 5. Upgrade Professor & Narrator to GPT-5.2
Arena already uses GPT-5.2. Upgrading the other two AI routes would improve response quality and consistency. Just swap the model name and change `max_tokens` to `max_completion_tokens`.

### Medium Effort (half day each)

#### 6. PostFinance Product Tie-In Screen
After the DNA Report or Future Engine, show a mock "Ready to start for real?" CTA linking to PostFinance's actual investment products. This is the bridge from education to conversion — **what judges/the bank want to see most**.

#### 7. DNA Report Image Export
The share button exists but doesn't generate a shareable image. Use `html2canvas` or `<canvas>` to generate a PNG of the DNA card. Shareable artifacts = viral potential.

#### 8. "Before vs. After" Learning Journey
Show the player's risk behavior in Mission 1 (emotional, uninformed) vs. Mission 5 (data-driven, diversified). Visualize the learning arc on the DNA Report. **This is the narrative arc judges love**: "We measurably changed behavior."

#### 9. Time Machine Active Simulation
Connect the Time Machine's era selection to the existing `simulation-engine.ts`. Filter market data by era date range, use the existing `buildSimulation()` and `applyRebalance()` functions, and wrap it with the documentary narration. The engine already exists — it just needs era-scoped data and the Time Machine UI.

#### 10. Arena AI Coaching During Match
Currently AI only speaks after rounds. Add an optional "hint" button during the round decision phase that asks GPT-5.2 for a quick strategic tip based on the current event. This deepens the educational value without changing gameplay balance (player chooses to ask).

### Strategic (1–2 days, high impact)

#### 11. Live Multiplayer Arena
Currently PvP is against AI opponents. A simple WebSocket-based "two players on two phones" mode would be incredibly compelling for a live demo. Use Supabase Realtime or Pusher for quick implementation.

#### 12. Professor Fortuna Voice
Use OpenAI's TTS API or browser `speechSynthesis` to let Professor Fortuna speak responses. Turns "another chatbot" into a memorable character. Particularly impactful in a demo room.

#### 13. Analytics Dashboard (Judge View)
A hidden `/admin` route showing aggregate stats: users completed onboarding, average risk archetype distribution, most common panic-sell moments, average Arena ELO. Shows PostFinance the **data goldmine** this creates for understanding their customer base.

#### 14. Language Toggle (DE/FR)
PostFinance's market is Swiss (DE/FR/IT). Even partial German/French translations would show market readiness beyond the hackathon.

#### 15. Cost-of-NOT-Using Metric
The Future Engine already calculates cost of waiting. Surface this prominently as a headline number: *"The average user discovers they're leaving CHF 47,000 on the table."* Concrete numbers win pitches.

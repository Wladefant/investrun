# Future You Simulator

**Wealth Manager Arena: The Investing Game (Bull vs Bear Edition)**
PostFinance START Hack 2026 | Design Spec | 2026-03-18

**Target: Behavioral Finance** — change how people *feel* about investing, not just what they know.

---

## 1. Executive Summary

Future You Simulator is a mobile-first gamified investment education platform that makes investing emotionally real. The core insight: people don't avoid investing because they lack information — they avoid it because they lack *emotional experience* with long-term growth.

Three core features work together:

1. **Future Estimation Engine** — the emotional hook. "How long until your monthly investments buy you a Tesla?" Instant, personal, motivating.
2. **Solo Simulation** — the learning engine. Accelerated time-travel through real market history with AI coaching. Only major events (2008 crisis, COVID, inflation shock) — no noise.
3. **Competitive Mode** — the engagement engine. Same market, same conditions, scored on *behavior* not returns. Leaderboards, challenges, viral sharing.

An **AI Mentor** threads through everything — coaching, warning, explaining, and scoring. Not a chatbot you talk to — a coach that watches what you do and reacts.

**Why it wins on judging criteria:**
- **Creativity (25%)**: The Future Estimation Engine is a hook no other team will have. "Show me my future" is more compelling than "learn about stocks."
- **Visual Design (20%)**: PostFinance yellow (#FFC800), bold Duolingo-style UI, iPhone frame. Charts that tell stories, not display data.
- **Feasibility (20%)**: Three features sharing one engine. Historical data pre-loaded. AI adds flavor but the game works without it.
- **Reachability (15%)**: QR join, zero signup, 5-minute sessions. The estimation engine alone is shareable — "I need 4 years to buy a Porsche if I invest CHF 500/month."
- **Learning Impact (20%)**: Behavioral finance focus — teaches *why people fail at investing* (panic, greed, inaction), not just what to buy. AI scoring rewards discipline over returns.

---

## 2. Creative Vision

### The Core Idea

Most finance apps answer: "What should I invest in?"

Future You Simulator answers: **"What happens to your life if you start investing today?"**

The shift is from abstract education to personal projection. You're not learning about diversification in theory — you're watching your future self either afford a house or not, depending on whether you panic-sell during a crash.

### Visual Identity

- **PostFinance Yellow (#FFC800)** — primary accent on black backgrounds
- **Bold, rounded UI** — Duolingo energy. Big buttons, chunky cards, satisfying animations
- **iPhone frame** wrapping the entire app for presentation
- **Charts as storytelling** — portfolio growth shown as a journey toward your goal, not a stock ticker
- **Only big news** — no daily noise. When a news card appears, it matters. 2008 crisis. COVID. Rate shock. That's it.

### Tone

Motivating, personal, never condescending. The app talks about YOUR future, YOUR money, YOUR goals. Not abstract market theory.

> "You said you want a Tesla Model 3. At CHF 300/month invested in a balanced portfolio, you're looking at about 7 years. But bump that to CHF 500 and you could be driving in under 5. Let's see what happens."

---

## 3. Core Features — Detailed Design

### 3.1 Future Estimation Engine

**Purpose**: The entry point and emotional hook. Before any simulation or game, you see what investing could do for YOUR life.

**User Flow:**

1. **"What's your goal?"** — Pick from visual cards:
   - 🚗 New car (CHF 45,000)
   - 🏠 Down payment (CHF 100,000)
   - 💻 MacBook Pro (CHF 3,500)
   - 🌴 Dream vacation (CHF 8,000)
   - 🎓 Education fund (CHF 50,000)
   - ✏️ Custom amount

2. **"How much can you invest monthly?"** — Slider from CHF 50 to CHF 2,000. Default: CHF 300.

3. **The Reveal** — Animated timeline showing:
   ```
   YOUR GOAL: Tesla Model 3 (CHF 45,000)
   YOUR INVESTMENT: CHF 300/month

   💵 Just saving (0% return):     12.5 years
   📊 Cautious portfolio (3%/yr):   10.2 years
   ⚖️ Balanced portfolio (5%/yr):    8.4 years
   🚀 Growth portfolio (7%/yr):      7.1 years

   "Investing doesn't just grow your money.
    It buys you 5 years of your life back."
   ```

4. **Dynamic Scenario Analysis** — Interactive sliders let you adjust:
   - Monthly amount → timeline updates in real-time
   - Risk level → shows trade-off between speed and volatility
   - "What if you increase CHF 50/month each year?" → compound effect visualization

5. **The Bridge** — After the estimation:
   > "Looks good on paper. But markets don't go in straight lines. Want to see what really happens when you invest through 20 years of crashes, recoveries, and booms? Let's simulate it."

   → Links directly to Solo Simulation with your chosen portfolio.

**Why this feature wins the pitch:**
- It's instantly personal. Every person in the room has a financial goal.
- The "5 years of your life back" framing is emotional, not analytical.
- It takes 30 seconds. Perfect for a live demo.
- It's shareable: "I need 7 years to buy a Porsche" is a sentence people text to friends.

**Calculation Engine:**
```
FV = PMT × [((1 + r)^n - 1) / r]

Where:
- PMT = monthly investment
- r = monthly return rate (annual / 12)
- n = number of months
- Solve for n given target FV

Growth assumptions (conservative, based on historical averages):
- Cautious: 3% annual (heavy bonds/gold)
- Balanced: 5% annual (60/40 stocks/bonds)
- Growth: 7% annual (heavy equities)
```

These are presented as scenarios, not predictions. The AI Mentor adds: *"These are based on 20 years of historical averages. Real markets are bumpier. That's why we simulate."*

---

### 3.2 Solo Simulation Mode

**Purpose**: The learning engine. Experience 20 years of real market history in 5 minutes. Only big, long-term-impact events — no daily noise.

**User Flow:**

1. **Risk Profile** (15 sec) — 3 quick questions:
   - "A crash hits. Your portfolio drops 25%. You:" → sell / hold / buy more
   - "When do you need this money?" → under 3 years / 3-10 / 10+
   - "What matters more?" → protect what I have / grow what I have
   → Result: Cautious / Balanced / Growth

2. **Portfolio Building** (30 sec) — Allocation sliders across 6 categories:

   | Category | Underlying Data | Display |
   |----------|----------------|---------|
   | Swiss Stocks | SMI Index | 🇨🇭 Swiss Market |
   | US Stocks | DJIA Index | 🇺🇸 US Market |
   | European Stocks | EuroStoxx 50 | 🇪🇺 European Market |
   | Bonds | Swiss Bond Index | 🛡️ Bonds |
   | Gold | Gold in CHF | 🥇 Gold |
   | Cash | Fixed 0.5%/yr | 💵 Cash |

   AI Mentor suggests allocation based on risk profile. Player can override.

3. **Simulation** (3-4 min) — Historical data plays at ~5 years per minute.

   **Only major events trigger interruptions:**

   | Year | Event | What the AI Shows |
   |------|-------|-------------------|
   | 2008 | Global Financial Crisis | "Lehman Brothers just collapsed. Markets down 40%. This is the moment 92% of investors make their worst mistake. What do you do?" |
   | 2011 | European Debt Crisis | "Greece might go bankrupt. European markets are shaking. Your bonds are holding steady — that's diversification working." |
   | 2015 | SNB removes EUR/CHF floor | "The Swiss franc just surged 30% in minutes. Swiss exporters are in shock. If you hold foreign assets, you just took a hit." |
   | 2020 | COVID pandemic | "Global pandemic. Fastest crash in market history — 30% in 3 weeks. But here's what nobody expected: the fastest recovery too." |
   | 2022 | Inflation & rate hikes | "Inflation at 40-year highs. Central banks hiking rates. For the first time in decades, bonds AND stocks are falling together." |

   **Between major events**: the chart moves, your portfolio grows or shrinks, but no interruptions. No daily news noise. The player sees the long arc — years of boring growth punctuated by dramatic moments. This itself teaches: **investing is mostly waiting.**

4. **Decision Points** — At each major event, the player can:
   - **Hold** — do nothing (often the right move)
   - **Rebalance** — adjust allocation
   - **Panic sell** — move to cash
   - **Buy more** — increase equity allocation

   Every action is logged. The AI watches silently during the simulation, then evaluates everything at the end.

5. **AI Evaluation** — The AI Mentor delivers a holistic score:

   ```
   YOUR FUTURE SCORE: 76/100

   Diversification: ★★★★☆ (80)
   "Good spread. Adding gold would have cushioned the 2008
   crash by 8%."

   Emotional Discipline: ★★★☆☆ (68)
   "You sold stocks during COVID. If you'd held 3 more months,
   you'd have recovered everything. Panic selling is the #1
   wealth destroyer."

   Long-term Thinking: ★★★★★ (85)
   "You stayed invested through most of the 20 years. That
   single habit is worth more than any strategy."

   Risk Management: ★★★★☆ (72)
   "Your allocation was more aggressive than your risk profile
   suggested. That worked out, but it could have gone badly."

   THE MENTOR'S TAKE:
   "You have the instincts of a real investor. The COVID
   panic-sell cost you about CHF 12,000 in recovery gains.
   Next time a crash hits, remember this: in 20 years of
   market history, every single crash recovered. Every one."
   ```

6. **Future Projection** — The results screen connects back to the Estimation Engine:
   ```
   WITH YOUR STRATEGY:
   CHF 300/month → CHF 145,200 after 20 years

   WITHOUT PANIC-SELLING:
   CHF 300/month → CHF 157,400 after 20 years

   That one panic sell cost you CHF 12,200.
   That's 3 months of your salary.
   ```

   This closes the loop: your behavior in the simulation has concrete impact on your future goals.

---

### 3.3 Competitive Mode

**Purpose**: Social engagement, retention, and event activation.

**Synchronous (Event Mode):**

1. Host creates room → **QR code + 4-digit room code**
2. Players join on their phones (zero signup — just enter a name)
3. Everyone gets the same risk profile quiz, builds their portfolio
4. Same 20-year market scenario plays for everyone simultaneously
5. **Live leaderboard** updates every simulated year:
   ```
   YEAR 2014 — THE ARENA
   ═══════════════════════
   1. Sarah      CHF 142,300  (+42%)   Score: 81
   2. Marcus     CHF 138,900  (+39%)   Score: 76
   3. You        CHF 131,500  (+32%)   Score: 74  <<<
   4. Alex       CHF 128,000  (+28%)   Score: 71
   ```

   **Rankings are by behavior score, not returns.** This is deliberate — it rewards good investing, not lucky gambling.

6. End-of-match: AI evaluates everyone, highlights best/worst decisions, announces winner.

**Asynchronous (Challenge Mode):**

1. Complete a simulation → get your score
2. Tap **"Challenge a Friend"** → generates a share link
3. Friend plays the exact same market scenario
4. Head-to-head comparison: your decisions vs theirs, explained by AI
5. Shareable result: *"I scored 81 navigating the 2008 crisis. Beat me."*

**Scoring Philosophy:**

Performance is evaluated on **four behavioral dimensions**, not raw returns:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Diversification | 25% | Spread across asset classes, no concentration >40% |
| Emotional Discipline | 30% | Holding through crashes, not panic-selling, low trade frequency |
| Long-term Thinking | 25% | Time in market, consistent strategy, not chasing trends |
| Risk Appropriateness | 20% | Allocation matches stated risk profile |

The AI explains each dimension in plain language. The scoring system itself teaches behavioral finance.

---

## 4. AI System Design

### The AI Mentor

One AI personality threads through all three features. Not three separate bots — one consistent coach.

**Personality**: Warm, direct, motivating. Like a smart friend who happens to be a financial advisor. Uses simple language. Celebrates good decisions more than good outcomes.

**System prompt core:**
```
You are the AI Mentor in Future You Simulator, an investment education
game for complete beginners. Your role:

1. MOTIVATE — connect investing to the player's personal goals
2. COACH — explain what's happening in 1-2 simple sentences
3. WARN — flag emotional mistakes (panic selling, FOMO) before they happen
4. EVALUATE — at the end, score behavior holistically and explain WHY

Rules:
- Never use jargon without explaining it
- Never say "you should have" — say "next time, consider..."
- Celebrate the DECISION, not the OUTCOME ("You held through the crash —
  that took courage, regardless of what happened next")
- Keep messages under 2 sentences during gameplay
- Be specific: reference actual events and numbers

Tone: Motivating coach, not professor. Think personal trainer for money.
```

**When the Mentor speaks:**

| Trigger | Example Message |
|---------|----------------|
| Estimation Engine result | "7 years to your goal. That's less than most people expect. And if you bump it CHF 100/month, you shave off 2 years." |
| Portfolio too concentrated | "80% in one market? Bold. Let's see if the data agrees with that confidence." |
| Major crash hits | "Markets just dropped 35%. This is the moment that separates investors from speculators. What you do RIGHT NOW matters more than anything else." |
| Player panic-sells | "You just sold at the bottom. That locks in the loss. In every crash in this dataset, markets recovered within 3 years." |
| Player holds through crash | "You held. That takes nerve. 92% of real investors didn't. That discipline is worth more than any stock pick." |
| End of simulation | Full evaluation with score and specific decision references |

**Token budget per session:**
- Estimation Engine: ~200 tokens (one response)
- Simulation: ~5 major events × 100 tokens = ~500 tokens
- Final evaluation: ~400 tokens
- Total: ~1,100 tokens output per session. Very lean.

### AI-Generated Scoring

The end-of-game evaluation is the AI's most important job. It receives:
- Player's trade history (every hold/sell/buy decision with timestamps)
- Portfolio composition at each major event
- Pre-computed metrics (diversification HHI, trade frequency, drawdown behavior)
- Player's risk profile

It produces a structured score (0-100) with plain-language explanation per dimension. The scoring metrics are pre-computed algorithmically; the AI's job is to *explain* them in human language, not calculate them.

---

## 5. Data Architecture

### Historical Data
- 6 CSV files already available (indices, stocks, bonds, FX, gold)
- Range: Feb 2006 – present (~20 years daily)
- Parsed at build time → static JSON served from `/public/data/`
- Players see 6 simplified categories (not 50 individual stocks)

### Time Acceleration
- Default: 1 simulated year ≈ 12 seconds
- 20 years ≈ 4 minutes of gameplay
- Only 5-6 major events interrupt the flow. Between events, the chart animates smoothly.

### Major Events File
Pre-curated `market-events.json`:
```json
[
  {
    "date": "2008-09-15",
    "title": "Global Financial Crisis",
    "description": "Lehman Brothers collapses. Largest bankruptcy in history.",
    "severity": "critical",
    "lesson": "staying_invested"
  },
  {
    "date": "2020-03-11",
    "title": "COVID-19 Pandemic",
    "description": "WHO declares pandemic. Fastest crash in market history.",
    "severity": "critical",
    "lesson": "crash_recovery"
  }
]
```

Only 5-6 events total. This is intentional — **filtering out noise IS the design.**

### Live Market Data (stretch goal)
- Yahoo Finance API for real-time prices
- Same 6 asset categories
- AI Mentor comments on real moves, connecting them to historical lessons

---

## 6. Technical Architecture

```
Next.js App (App Router)
├── app/
│   ├── page.tsx                — Splash / iPhone frame wrapper
│   ├── estimate/               — Future Estimation Engine
│   ├── simulate/               — Solo Simulation
│   ├── compete/                — Competitive Mode (lobby + game)
│   ├── results/[id]/           — Scoring & evaluation
│   └── api/
│       ├── estimate/           — Calculation engine
│       ├── market-data/        — Historical data serving
│       ├── rooms/              — Multiplayer room CRUD
│       ├── ai/mentor/          — OpenAI proxy for Mentor
│       └── ai/evaluate/        — OpenAI proxy for scoring
├── components/
│   ├── IPhoneFrame.tsx         — iPhone bezel wrapper
│   ├── GoalSelector.tsx        — Visual goal cards
│   ├── FutureTimeline.tsx      — Animated estimation result
│   ├── PortfolioBuilder.tsx    — Allocation sliders
│   ├── SimulationChart.tsx     — Animated portfolio chart
│   ├── EventCard.tsx           — Major event interruption
│   ├── MentorBubble.tsx        — AI message display
│   ├── Leaderboard.tsx         — Live rankings
│   └── ScoreCard.tsx           — End-of-game evaluation
├── lib/
│   ├── estimation.ts           — Future value calculations
│   ├── simulation-engine.ts    — Time acceleration + event triggers
│   ├── scoring.ts              — Behavioral score computation
│   ├── market-data.ts          — CSV data loading
│   └── openai.ts               — AI client wrapper with fallbacks
├── data/
│   └── market-events.json      — 5-6 curated major events
└── public/
    └── data/                   — Pre-processed market data JSON
```

**Tech choices:**
- **Database**: SQLite (or in-memory for hackathon) — rooms, scores, challenges
- **Real-time**: Server-Sent Events for multiplayer sync
- **Charts**: Recharts (lightweight, React-native)
- **AI**: OpenAI GPT-5.2 via server-side API routes
- **Deployment**: Vercel (free tier, instant)

---

## 7. Pitch Strategy (5-minute demo)

| Time | What You Show | What Judges Feel |
|------|---------------|------------------|
| 0:00-0:30 | "50% of Swiss adults don't invest. Not because they can't — because they don't see the point." | Problem resonance |
| 0:30-1:30 | **Future Estimation Engine**: Pick "Tesla." Set CHF 300/month. Watch the reveal animate. "Investing buys you 5 years of your life back." | **Emotional hook** — every judge has a goal |
| 1:30-2:00 | "But markets don't go in straight lines. Let's see what really happens." → Start simulation | Transition to game |
| 2:00-3:30 | **2008 crash hits**. Portfolio drops. AI Mentor: "This is the moment 92% of investors fail." Judge decides to hold or sell. | **Peak tension** — behavioral finance in action |
| 3:30-4:00 | **AI evaluation**: Score breakdown. "Your panic-sell cost you CHF 12,200. That's 3 months of salary." | "This actually teaches" |
| 4:00-4:30 | **QR code** → everyone joins competitive mode → live leaderboard | "This works for events" |
| 4:30-5:00 | "We don't teach people about investing. We show them their future — and let them practice getting there." → PostFinance branding | Business case landing |

**The moment judges remember**: The estimation engine showing "investing buys you 5 years" — then the simulation proving it's not that simple — then the AI explaining what your behavior cost you in real money.

**The narrative arc**: Hope (estimation) → Reality (simulation) → Learning (evaluation) → Motivation (try again, do better).

---

## 8. What Makes This Extraordinary

### 1. The Estimation Engine is a hook nobody else has
Every other team will start with "here's a portfolio builder." We start with "how long until you can buy a Tesla?" That's not a finance question — it's a life question. It's personal, emotional, and shareable.

### 2. Behavioral finance, not financial literacy
We don't teach what a bond is. We teach why people panic-sell and how much it costs them. The scoring system rewards **discipline, diversification, and patience** — the three things that actually determine investing success. This aligns directly with the case brief's emphasis on "discouraging gambling behavior."

### 3. Only big news — no noise
Most stock games show every daily fluctuation. We show 5-6 events in 20 years. This IS the lesson: investing is 99% waiting and 1% critical decisions. The quiet periods are not boring — they demonstrate that doing nothing is usually the correct strategy.

### 4. The cost-of-behavior feedback loop
"Your panic-sell cost you CHF 12,200" is more powerful than any textbook. It connects behavior to consequence in concrete, personal terms. The estimation engine makes it even more personal: "That CHF 12,200 is 2 extra years before you can buy your car."

### 5. Three features, one emotional journey
Estimation → Simulation → Competition is a natural funnel:
- **Estimation** answers "why should I invest?" (motivation)
- **Simulation** answers "what happens when I do?" (experience)
- **Competition** answers "how good am I at it?" (engagement)

Each feature is useful standalone. Together, they create a complete behavioral change journey — which is exactly what PostFinance wants.

---

## 9. PostFinance Business Value

- **Event activation**: QR join, 5-minute sessions, leaderboards = perfect for workshops, school visits, public events
- **Lead generation**: The estimation engine naturally leads to "ready to start for real? Open a PostFinance investment account"
- **Brand association**: Every screen is PostFinance yellow. Every share link carries the brand.
- **Customer insight**: The behavioral scoring data shows PostFinance what kind of investor each user is — cautious, balanced, or growth — a natural segmentation for product recommendations
- **Retention**: Competitive mode and challenge links keep users coming back. The estimation engine gives them a reason to check progress.

---

*End of design document.*

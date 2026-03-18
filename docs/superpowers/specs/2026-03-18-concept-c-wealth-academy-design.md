# Concept C: Wealth Manager Academy

## Complete Creative & Technical Design Document

**Project**: Wealth Manager Arena — PostFinance START Hack 2026
**Concept**: Wealth Manager Academy (Wildcard — Optimized for Winning)
**Date**: 2026-03-18
**Status**: Design Specification

---

## 1. Executive Summary

Wealth Manager Academy is not a stock market game. It is a personalized AI-driven investment education experience disguised as enrollment in an elite financial academy. Where other teams will build portfolio simulators with charts and leaderboards, we build a **narrative journey** — one that teaches, tests, adapts, and ultimately produces a shareable artifact (the Investment DNA Report) that makes PostFinance's brand unforgettable.

This concept is engineered against the five judging criteria:

| Criterion | Weight | Why We Score Highest |
|---|---|---|
| **Creativity** | 25% | No other team will build an adaptive AI academy with personalized curriculum, voice coaching, and a DNA report. Every other team builds "pick stocks, watch chart go up." We build an identity experience. |
| **Visual Design** | 20% | The academy metaphor gives us a clear visual language: enrollment cards, mission briefings, rank badges, progress maps, and a polished DNA report card. Every screen has a purpose and a personality. |
| **Feasibility** | 20% | Seven missions, each self-contained. The AI backbone is GPT-5.2 via API — no custom model training. Historical data feeds directly into scenario generation. Next.js + Vercel = deploy in minutes. |
| **Reachability** | 15% | "Enroll in the Academy" is a one-tap onboarding. QR code join for events. The DNA report is inherently shareable — it IS the viral loop. Schools and workshops get a structured curriculum, not a sandbox they have to figure out. |
| **Learning Impact** | 20% | Every mission teaches exactly one concept. The AI adapts to mistakes. The DNA report synthesizes learning into self-knowledge. This is not "hope they learn from the chart" — it is explicit, scaffolded, personalized financial education. |

**The pitch arc in one sentence**: You enroll, you learn through increasingly difficult missions, you survive a market crash, you graduate, and you receive a personalized Investment DNA report that reveals who you really are as an investor — and the judge holding a phone on stage gets theirs too.

---

## 2. Creative Vision

### The Academy Metaphor

The player is not "using an app." They are being admitted to an exclusive, AI-run investment academy. This single framing decision transforms every interaction:

- Onboarding becomes **enrollment**
- Tutorials become **missions assigned by the Headmaster**
- Scoring becomes **grades and rank advancement**
- Failure becomes **a lesson from the Professor, not a game over**
- Completion becomes **graduation with honors**
- The final report becomes **your diploma — your Investment DNA**

This metaphor works because it creates emotional stakes without financial stakes. Nobody wants to fail out of an academy. Nobody wants a bad grade. The competitive drive is intrinsic, not bolted on.

### Visual Identity: Hogwarts Meets Bloomberg, Wrapped in PostFinance Yellow

The visual language blends three worlds:

**1. Elite Academy Aesthetic**
- Dark backgrounds (PostFinance black #1A1A1A) with warm accents
- Parchment-textured mission briefing cards
- Wax-seal-style completion badges
- A crest/shield for the Wealth Manager Academy logo incorporating PostFinance's angular design language
- Rank insignia that evolve as the player progresses

**2. Duolingo Energy**
- Bold, rounded UI elements
- Satisfying micro-animations on completion (confetti, shield glow, rank-up fanfare)
- Progress bars that feel alive — pulsing, filling, celebrating
- Streak counters and XP displays
- Encouraging copy: "3 missions to graduation!" not "67% complete"

**3. Financial Data Clarity**
- Clean, minimal charts using PostFinance yellow (#FFC800) as the primary data color
- Black and white for axes, labels, gridlines
- No chartjunk — every data point earns its pixels
- Tooltips that explain what the player is seeing in plain language

**Color Palette**:
- Primary: #FFC800 (PostFinance Yellow) — progress, success, highlights
- Secondary: #1A1A1A (Deep Black) — backgrounds, authority
- Tertiary: #FFFFFF (White) — text, cards, breathing room
- Accent: #FF4444 (Alert Red) — crashes, warnings, danger zones
- Accent: #44BB66 (Growth Green) — gains, success states
- Neutral: #888888 (Slate) — secondary text, inactive states

### The Progression System

```
ENROLLMENT → CADET → ANALYST → STRATEGIST → PORTFOLIO MANAGER → GRADUATE
   (Join)     (M1)     (M2)       (M3-4)         (M5-6)          (M7)
```

Each rank unlocks:
- A new badge on the player's academy profile
- A new visual element on the eventual DNA report
- Access to the next mission tier
- A brief "rank-up ceremony" — the AI Headmaster acknowledges the promotion with a personalized comment

**Why missions beat free-form modes**: A sandbox says "here are tools, figure it out." An academy says "I will teach you, step by step, and prove you learned." For judges evaluating Learning Impact (20%), structured missions with clear learning objectives and success criteria are objectively superior to an open sandbox. For judges evaluating Creativity (25%), the academy narrative arc is more memorable than "here's a stock picker."

**What makes this feel different from anything that exists**: Finance apps teach through articles. Games teach through trial and error. Wealth Manager Academy teaches through an AI relationship. The Professor knows your name, remembers your mistakes, adapts the next challenge, and eventually tells you who you are. No finance app does this. No stock market game does this. This is a category of one.

---

## 3. The Mission System — Detailed Design

Each mission follows a consistent structure:
1. **Briefing** — The Professor explains the mission objective and the concept being taught
2. **Challenge** — The player makes decisions in a simulated scenario
3. **AI Coaching** — Real-time guidance, hints, and Socratic questioning during the challenge
4. **Debrief** — The Professor explains what happened, why, and what the player should remember
5. **Grade** — Performance assessment that feeds into the DNA report

---

### Mission 1: "Know Thyself" (Risk Profiling)

**Duration**: 2-3 minutes
**Rank unlock**: Cadet → Analyst
**Concept taught**: Your risk tolerance is personal, valid, and the foundation of every investment decision.

**What the player does**:
The Professor presents five rapid-fire scenarios — not boring survey questions, but visceral "what would you do" moments using real historical events:

1. **"It's October 2008. Your portfolio just dropped 35% in six weeks. Your friend says sell everything. What do you do?"** → Options: Sell all / Sell half / Hold / Buy more
2. **"You inherited CHF 50,000. You don't need it for 20 years. How do you invest it?"** → Slider between 100% savings account and 100% global stocks
3. **"Your portfolio is up 25% this year. A colleague says it's time to lock in gains. What do you do?"** → Options: Sell all / Sell half / Hold / Add more
4. **"Breaking news: a major European bank is collapsing. Markets are down 8% today. You check your portfolio..."** → Options: Panic sell / Do nothing / Don't even check / Buy the dip
5. **"You can choose one: Option A gives you CHF 5,000 guaranteed. Option B gives you a 50% chance of CHF 15,000 and 50% chance of CHF 0."** → Binary choice

**How the AI adapts**: After each answer, the Professor reacts in character:

> *"Interesting. You held through the crash but sold when you were up. That's more common than you think — it's called loss aversion meeting the disposition effect. Let's see if that pattern holds..."*

The AI builds a risk profile in real-time and shows the player where they fall on a spectrum: Conservative ←→ Balanced ←→ Aggressive. But it does NOT judge — it explains that all positions are valid.

**What is taught**:
- Risk tolerance is personal, not a right/wrong answer
- Common behavioral biases (loss aversion, disposition effect, herd behavior)
- Your risk profile should guide your investment strategy
- Self-awareness is the first step

**Success criteria**: Complete all five scenarios. There is no fail state — every answer reveals something about the player. The AI assigns one of five risk archetypes (see Section 5: DNA Report). This data becomes the foundation of the DNA report.

**Example AI dialogue (post-mission debrief)**:
> *"Cadet, you've completed your aptitude assessment. You showed strong composure under pressure — you didn't panic sell during the 2008 scenario. But I noticed you were quick to take profits when things were going well. That's a pattern we call 'asymmetric risk tolerance,' and it's something we'll work on. Your provisional risk profile: Balanced-Growth. Now, let's put that to the test. Proceed to Mission 2."*

---

### Mission 2: "Don't Put All Your Eggs" (Diversification)

**Duration**: 3-4 minutes
**Rank**: Analyst
**Concept taught**: Diversification reduces risk without proportionally reducing returns. Concentration is the enemy of the beginner.

**Scenario design**:
The player is given CHF 100,000 and must allocate it across 5-8 asset classes:
- Swiss stocks (SMI)
- European stocks (EuroStoxx 50)
- US stocks (DJIA)
- Swiss bonds
- Global bonds
- Gold
- Cash (CHF savings)
- Optional: Japanese stocks (Nikkei)

The interface shows a simple pie chart that updates in real-time as the player drags sliders. Each asset class has a one-line description and a historical risk/return badge (e.g., "High growth, high volatility").

**Phase 1 — Free allocation**: The player builds their first portfolio however they want. Many beginners will go 100% stocks or 100% one country.

**Phase 2 — Time simulation**: The portfolio runs through a 3-year historical period (randomly selected). The player watches their portfolio value change month by month, with the AI commenting:

> *"Month 4: European markets just dropped 12% on a debt crisis. Your portfolio is down 11.5% because 90% of it was in European stocks. Had you spread across regions, the damage would have been... let me show you."*

The AI overlays a "diversified benchmark" portfolio on the same chart — showing how a 60/30/10 split would have performed.

**Phase 3 — Rebalance opportunity**: After seeing the damage (or luck) of their first allocation, the player can rebalance. The AI then runs the next 3-year period.

**AI coaching during mission**:

If the player goes 100% into one asset:
> *"Bold move, Analyst. You've put everything into Swiss stocks. That's called concentration risk. If the Swiss market sneezes, your entire portfolio catches pneumonia. Want to reconsider, or are you testing a theory?"*

If the player builds a diversified portfolio:
> *"Now that's what I like to see. You've spread across equities, bonds, and gold. These don't all move together — when stocks fall, bonds and gold often hold or rise. That's the magic of correlation."*

**What is taught**:
- Diversification across asset classes reduces portfolio volatility
- Correlation — assets that don't move together protect each other
- Geographic diversification matters (not just "all stocks")
- Rebalancing is a discipline, not a one-time event
- The free lunch of diversification: lower risk without equally lower returns

**Success criteria**: The player's rebalanced portfolio (Phase 3) must have a lower maximum drawdown than their initial portfolio (Phase 2), OR the AI must confirm the player understood diversification even if markets were unusually calm. Graded on: number of asset classes used, geographic spread, bonds/gold inclusion.

---

### Mission 3: "When Markets Bleed" (Volatility & Crashes)

**Duration**: 4-5 minutes
**Rank**: Strategist
**Concept taught**: Market crashes are normal, recoveries follow, and the worst thing you can do is panic sell at the bottom.

**The crash scenario**:
The player starts with a diversified portfolio (carried over from Mission 2 or assigned if they skipped). The AI runs them through the **2020 COVID crash** using real historical data — but the player does not know which crisis it is yet.

**Week 1-2**: Markets are normal. Small gains. The Professor is calm:
> *"Markets are steady. Your portfolio is up 2.3%. A quiet start."*

**Week 3**: A news alert appears: *"BREAKING: A novel respiratory virus is spreading rapidly across Asia. WHO monitoring closely."* Markets dip 3%.

**Week 4-6**: Accelerated decline. Markets drop 15%, then 25%, then 34%. News cards flash: *"Global lockdowns announced." "Oil prices collapse." "Circuit breakers triggered on major exchanges."*

At each stage, the player is prompted: **"What do you do?"**
- Sell everything and go to cash
- Sell half
- Hold and do nothing
- Buy more (rebalance into the dip)

**How the AI tests emotional discipline**:

The AI deliberately applies psychological pressure:

> *"Your portfolio is down 31%. You've lost CHF 31,000 in three weeks. The news says this could get worse. Other academy students are selling. What do you do?"*

If the player sells:
> *"You sold. Let me show you what happens next."*

The simulation continues — showing the V-shaped recovery. The AI overlays the player's actual return (locked in losses by selling) against the "hold" scenario.

> *"If you'd held through the crash, you'd have recovered everything within 5 months and been up 22% by year's end. By selling at the bottom, you locked in a 31% loss. This is the single most expensive mistake in investing: panic selling. You just experienced it firsthand. You won't forget this."*

If the player holds:
> *"You held. That took discipline. Let me show you why that was the right call."*

The recovery plays out. The AI celebrates the result.

If the player buys more:
> *"You bought into a falling market. That's contrarian — and historically, it's one of the best things you can do. Warren Buffett calls it being greedy when others are fearful. Let me show you the result..."*

**What is taught**:
- Market crashes happen roughly every 7-10 years — they are normal, not exceptional
- Recoveries always follow crashes (with historical evidence)
- Panic selling locks in losses; holding preserves the ability to recover
- "Time in the market beats timing the market"
- Volatility is the price of admission for higher returns
- Emotional discipline is the most valuable investor skill

**Success criteria**: Graded on whether the player held or sold, and whether their post-mission reflection (a quick AI-asked question) demonstrates understanding. Even "failing" (panic selling) teaches — the AI debrief makes the lesson visceral.

---

### Mission 4: "The Long Game" (Long-term Investing)

**Duration**: 3-4 minutes
**Rank**: Strategist
**Concept taught**: Compound growth is the most powerful force in investing, and time is the beginner's greatest advantage.

**Time-accelerated simulation**:
The player is shown two scenarios side by side:

- **Investor A**: Invests CHF 200/month starting at age 25, stops at 35 (10 years, CHF 24,000 total invested)
- **Investor B**: Invests CHF 200/month starting at age 35, continues until 65 (30 years, CHF 72,000 total invested)

The simulation runs at 2x speed, year by year, showing both portfolios growing. The AI narrates:

> *"Watch carefully. Investor A put in a third of the money but started 10 years earlier. Investor B put in three times as much but started later. Who ends up with more?"*

The answer (Investor A, due to compound growth on early contributions) consistently surprises beginners. The AI pauses for effect:

> *"Investor A: CHF 24,000 invested → CHF 338,000 at retirement. Investor B: CHF 72,000 invested → CHF 295,000. Starting early beat investing three times as much. That's the power of compound growth. Einstein reportedly called it the eighth wonder of the world. Whether he said it or not, the math is real."*

**Interactive element**: The player then builds their own long-term plan:
- Monthly investment amount (slider: CHF 50 - CHF 1,000)
- Investment horizon (slider: 5 - 40 years)
- Risk profile (from Mission 1, pre-set but adjustable)

The AI shows projected outcomes with a fan chart (optimistic/expected/pessimistic scenarios based on historical returns for the chosen risk level).

**How the AI demonstrates compound growth**:
- Year-by-year breakdown showing how much is contributions vs. growth
- The "hockey stick" moment where growth exceeds contributions
- Comparison: same total amount invested as lump sum at different ages
- The cost of waiting: "Every year you delay costs you approximately X in retirement wealth"

**What is taught**:
- Compound growth rewards early starters disproportionately
- Time is the most important variable in investing — more important than amount or returns
- Regular investing (dollar-cost averaging) smooths out market volatility
- The cost of procrastination is concrete and calculable
- Even small amounts grow into significant wealth over decades

**Success criteria**: The player demonstrates understanding by answering a Socratic question from the AI: *"If you could give one piece of investing advice to your 18-year-old self, what would it be?"* The AI evaluates the response and grades based on whether it reflects long-term thinking.

---

### Mission 5: "Asset Classes 101" (Understanding Different Assets)

**Duration**: 3-4 minutes
**Rank**: Portfolio Manager
**Concept taught**: Different asset classes serve different purposes in a portfolio, and understanding their characteristics is essential.

**Portfolio building challenge**:
The Professor presents a "client brief" — a fictional person with specific goals:

> *"Your client is Maria, age 35. She earns CHF 95,000/year, has CHF 40,000 saved, and wants to buy a house in 5 years while also starting retirement savings. She describes herself as 'cautious but open to learning.' Build her a portfolio."*

The player must allocate across asset classes, but this time each asset class comes with an AI-generated "fact card" that appears when tapped:

**Stocks (Equities)**:
> *"Ownership in companies. Historically the highest-returning asset class (~7-9% annually after inflation), but also the most volatile. Best for long time horizons (10+ years). During the 2008 crisis, the SMI fell 34%. It recovered in 3 years."*

**Bonds**:
> *"Loans to governments or companies. Lower returns (~1-3% after inflation) but much more stable. They often rise when stocks fall — your portfolio's shock absorber. Swiss government bonds have never defaulted."*

**Gold**:
> *"A store of value for 5,000 years. No dividends, no interest, but it tends to hold value during crises and inflation. It's insurance, not growth."*

**Cash/Savings**:
> *"The safest option. Currently earns ~1% in Swiss savings accounts. Inflation erodes its purchasing power over time. Essential for emergencies, costly for long-term goals."*

**Real Estate** (represented by index):
> *"Physical property or REITs. Provides rental income and long-term appreciation. Less liquid than stocks — you can't sell half a house. Swiss real estate has been remarkably stable."*

**AI explains each asset class contextually** — not in isolation but in relation to the client's specific needs:

> *"Maria needs money in 5 years for a house. Stocks could drop 30% in that period. For the house fund, bonds and cash are safer. But her retirement is 30 years away — that's where equities earn their place."*

The AI evaluates the player's allocation against the client brief:

> *"You put 80% of Maria's house fund in stocks. In 5 years, there's a meaningful chance that fund could be worth less than today. For short-term goals, that's a problem. Consider: what if the market crashes in year 4, right when she needs the money?"*

**What is taught**:
- Each asset class has a role: growth, stability, insurance, liquidity
- Time horizon determines appropriate asset allocation
- Risk is not abstract — it connects to real goals and real consequences
- A portfolio is not just "pick the one that goes up most"
- Different goals within the same person's life may require different allocations

**Success criteria**: The AI grades the portfolio against three factors: (1) Does the house fund have appropriate time-horizon risk? (2) Does the retirement allocation harness long-term growth? (3) Is there an emergency cash buffer? Players can iterate until the Professor approves.

---

### Mission 6: "The Arena" (Competitive Challenge)

**Duration**: 5-7 minutes
**Rank**: Portfolio Manager
**Concept taught**: Investing is not a competition — but comparing strategies reveals insights. Also satisfies the multiplayer/event requirement.

**Multiplayer mission — sync lobby**:
The Professor announces a "class challenge":

> *"Attention, Portfolio Managers. Your final exam before graduation is a live challenge. You will all face the same market. You will all start with the same capital. But your strategies will differ — and that's the point. Let's see what your classmates do differently."*

**Join flow**:
- Host creates a room → gets a 4-digit code and QR code
- Other players scan QR or enter code → join the "classroom"
- The lobby shows avatars with academy ranks and nicknames
- The host (or a timer) starts the challenge when ready

**The challenge**:
All players simultaneously face a 10-year historical market period (randomly selected, same for everyone). Each player allocates their portfolio and then watches it play out in real-time. At 3 decision points (roughly year 3, year 6, year 8), all players can rebalance.

**AI bots as classmates**:
If fewer than 4 humans are playing, AI bots fill the classroom. Each bot represents a common investor archetype:

- **"Aggressive Alice"** — 100% equities, never rebalances, always buys dips
- **"Cautious Carlos"** — 80% bonds and cash, sells at first sign of trouble
- **"Trendy Tanya"** — chases whatever performed best last year, constant trading
- **"Steady Stefan"** — 60/40 balanced, rebalances annually, never panics

These bots serve a teaching purpose: the player can see how different strategies play out against the same market, with the AI commenting:

> *"Interesting — Trendy Tanya just rotated her entire portfolio into gold because it was last year's top performer. That's called performance chasing. Let's see how that works out for her..."*

**Leaderboard integration**:
A live leaderboard updates after each decision point. But the scoring is NOT just returns — it weighs the same holistic criteria as the DNA report:

| Factor | Weight |
|---|---|
| Total return | 25% |
| Risk-adjusted return (Sharpe-like) | 25% |
| Diversification score | 20% |
| Behavioral score (panic selling penalty) | 20% |
| Consistency (not overtrading) | 10% |

The Professor comments on the leaderboard:

> *"Notice something? The player with the highest raw return is NOT in first place. That's because they achieved it through reckless concentration. In real investing, the goal is the best return for the risk you're taking."*

**Async mode**:
After completing the Arena, players can share a link. Others who open the link play the same market scenario and compare results. The AI generates a comparison:

> *"You scored 78/100 on this scenario. Your friend scored 82/100. They beat you on diversification but you held better during the crash. Here's what you can learn from each other."*

**How this satisfies the competitive/event requirement**:
- QR join makes it event-ready (PostFinance workshops, school classes)
- The "classroom" framing is naturally suited to group events
- The leaderboard is visible and exciting but teaches — it's not just "who made more money"
- AI commentary makes it entertaining even for spectators

---

### Mission 7: "Graduation" (The Investment DNA Report)

**Duration**: 2-3 minutes (reveal ceremony)
**Rank**: Portfolio Manager → Graduate
**Concept taught**: Self-knowledge is the ultimate investing skill.

This is not a "mission" in the gameplay sense. This is the payoff. The climax. The moment the entire experience has been building toward.

**How all prior performance is synthesized**:

Throughout Missions 1-6, the system has been silently accumulating data points:

| Data Point | Source Mission |
|---|---|
| Risk tolerance answers | Mission 1 |
| Risk profile archetype | Mission 1 |
| Diversification behavior | Missions 2, 5, 6 |
| Crash reaction (hold/sell/buy) | Mission 3 |
| Time-horizon understanding | Mission 4 |
| Asset class knowledge | Mission 5 |
| Competitive behavior | Mission 6 |
| Rebalancing frequency | Missions 2, 3, 6 |
| Deviation from AI advice | All missions |
| Learning curve (improvement across missions) | All missions |

**The graduation ceremony**:
The Professor delivers a brief speech:

> *"You have completed all seven missions of the Wealth Manager Academy. You've survived crashes, built portfolios, learned from mistakes, and competed against your classmates. It's time to show you who you really are as an investor. This is your Investment DNA."*

The screen transitions to a dramatic reveal animation — the DNA report card assembles piece by piece, each section appearing with a satisfying sound and visual flourish.

**What the DNA report contains** (see Section 5 for full deep dive):
- Investor personality type (e.g., "The Steady Builder")
- Risk profile visualization
- Strength and blind spot analysis
- Performance summary across all missions
- One personalized AI-generated paragraph about the player
- QR code to share / challenge friends

**The shareable card design**: A vertical card (Instagram-story aspect ratio, 1080x1920) with:
- Academy crest at top
- Player's name and graduation date
- Personality type with icon
- Three strength badges, one blind spot badge
- A radar chart showing five dimensions
- The AI-generated paragraph
- PostFinance branding (subtle, bottom)
- QR code linking to the async challenge

**Why this is the pitch-winning moment**: The DNA report is the thing judges take home. It is the thing they show colleagues. It is the thing that makes them say "this team built something different." Every other team's demo ends with a chart. Ours ends with a mirror — it tells you something about yourself.

---

## 4. AI System Design

### The Professor / Headmaster

**Name**: Professor Fortuna
**Personality**: Warm but demanding. Think a mix of a wise mentor and a sharp-witted tutor. Never condescending, always encouraging, occasionally dry-humored. Uses the player's name. Remembers their mistakes from previous missions and references them.

**Teaching style**:
- **Socratic**: Asks questions before giving answers. "What do you think happened? Why did your portfolio recover faster than Cautious Carlos's?"
- **Contextual**: Never explains a concept in isolation. Always ties it to what the player just experienced. "You just saw diversification work. Now let me explain WHY it works."
- **Adaptive**: Adjusts difficulty based on performance. If a player aces Mission 2, Mission 3 gets a harder crash scenario. If they struggle, the AI slows down and adds more scaffolding.
- **Celebratory**: Genuinely praises good decisions. "That rebalance was textbook. You sold high and bought low without even being told to. Natural instinct."

**Implementation**: A persistent system prompt that includes:
- The Professor's personality and teaching philosophy
- The player's accumulated profile (updated after each mission)
- The current mission's learning objectives and success criteria
- Instructions to reference prior missions when relevant

### AI Classmate Bots

Four persistent bot personalities that appear in multiplayer and are referenced in solo missions:

**Aggressive Alice** (The Thrill Seeker):
- Always maximizes equity exposure
- Buys aggressively during dips
- Never holds bonds or cash
- Teaching purpose: shows high-risk/high-reward tradeoff

**Cautious Carlos** (The Safety-First Investor):
- Overweights bonds and cash
- Sells at the first sign of decline
- Never goes above 30% equities
- Teaching purpose: shows the cost of excessive caution

**Trendy Tanya** (The Chaser):
- Rotates into last year's best performer
- Trades frequently
- Falls for narrative and hype
- Teaching purpose: shows the danger of performance chasing and overtrading

**Steady Stefan** (The Disciplined Investor):
- 60/40 balanced portfolio
- Rebalances once per year
- Never panic sells
- Teaching purpose: shows the power of boring consistency — often wins

These bots are NOT random — they follow behavioral scripts based on their archetype. This makes their outcomes predictable and teachable.

### The Adaptive Curriculum Engine

The AI adjusts the experience based on the player's cumulative profile:

**Difficulty scaling**:
- **Crash severity in Mission 3**: If the player showed high risk tolerance in Mission 1, they get the 2008 crisis (-50%). If they showed caution, they get a milder 2015-style correction (-15%). The lesson is the same; the emotional intensity matches the player.
- **Client complexity in Mission 5**: High-performing players get a more complex client brief (dual goals, conflicting time horizons). Struggling players get a simpler scenario.
- **Arena scenario in Mission 6**: The engine selects a historical period that specifically challenges the player's demonstrated weaknesses. Built too aggressively? Here's a sideways market where bonds outperform.

**Coaching intensity**:
- Players who make good decisions get lighter coaching (brief confirmations, not lectures)
- Players who make mistakes get deeper explanations with examples
- Players who repeat the same mistake get alternative explanations (different analogy, different framing)

### Voice Mode Integration (OpenAI TTS)

Voice is used strategically, not everywhere. It activates during high-impact moments:

1. **Mission briefings** — The Professor's opening monologue for each mission is voiced. This sets the tone and makes the academy feel alive.
2. **Crash narration (Mission 3)** — During the market crash, the Professor's voice adds urgency and emotional weight. "Your portfolio is down 28%. The news is telling you to sell. What do you do?"
3. **Graduation speech (Mission 7)** — The DNA report reveal is narrated. This is the climactic moment and voice makes it ceremonial.
4. **Key coaching moments** — When the AI detects a major mistake or a major insight, it speaks instead of typing. This draws attention.

**Implementation**: OpenAI TTS API with the "nova" or "shimmer" voice. Pre-generate mission briefings. Generate crash narration and graduation speech dynamically based on player data. Fallback: text with optional "play" button if TTS latency is too high.

### The DNA Report Generator

A dedicated GPT-5.2 prompt that takes the player's complete session data and produces:
1. A personality type classification (from a predefined set — see Section 5)
2. A strengths/blind-spots analysis
3. A personalized paragraph (3-4 sentences)
4. A numerical score across five dimensions for the radar chart

The prompt is structured to ensure consistency — it must select from predefined personality types rather than inventing new ones, and it must map strengths/blind spots to specific observed behaviors.

### AI-Generated Scenarios Using Historical Data

Missions use real historical data, but the AI contextualizes it:

- **Mission 2**: Randomly selects two consecutive 3-year periods from the 20-year dataset. Different players in the same session get different periods (or the same, for multiplayer).
- **Mission 3**: Selects from a curated list of crash periods: 2008 GFC, 2011 Euro crisis, 2015 China scare, 2020 COVID, 2022 rate shock. The AI writes contextual "news alerts" that match the real events.
- **Mission 6 (Arena)**: Selects a 10-year period and provides the same data to all players in the session.

Historical data is pre-processed into daily returns, indexed to 100 at mission start, and served via API. The AI never sees raw prices — it sees portfolio performance and generates narrative around it.

### Prompt Engineering Approach

Three distinct prompt personas:

1. **Professor Fortuna (interactive coaching)**: Long system prompt with personality, current mission context, player history. Uses function calling to access player state and historical data. Temperature: 0.7 (warm but not random).

2. **Scenario Narrator (mission events)**: Shorter prompt focused on generating realistic news headlines and market commentary for historical periods. Temperature: 0.5 (factual but engaging).

3. **DNA Analyst (report generation)**: Highly structured prompt with explicit output format. Must select from predefined types. Temperature: 0.3 (consistent, reliable classification).

---

## 5. The Investment DNA Report — Deep Dive

### Personality Types

Six investor personality types, each with a name, icon, description, and associated strengths/blind spots:

**1. The Steady Builder**
- *Icon*: A brick wall, growing course by course
- *Description*: "You build wealth the old-fashioned way: patiently, consistently, and without drama. You understand that investing is a marathon, not a sprint."
- *Strengths*: Discipline, long-term thinking, emotional stability
- *Blind spot*: May be too conservative, potentially missing growth opportunities

**2. The Analyst**
- *Icon*: A magnifying glass over a chart
- *Description*: "You want to understand everything before you act. Data drives your decisions, and you're skeptical of hype. Your portfolios are thoughtful and well-researched."
- *Strengths*: Diversification, risk awareness, knowledge
- *Blind spot*: Analysis paralysis — may overthink and delay action

**3. The Opportunist**
- *Icon*: A lightning bolt
- *Description*: "You see opportunity where others see risk. You bought during the crash while everyone else was selling. Your instincts are strong, but they need guardrails."
- *Strengths*: Contrarian courage, crisis performance, growth orientation
- *Blind spot*: Can mistake recklessness for boldness; needs diversification discipline

**4. The Guardian**
- *Icon*: A shield
- *Description*: "Capital preservation is your priority. You sleep well at night because your portfolio is designed to weather any storm. Your challenge is ensuring your caution doesn't cost you growth."
- *Strengths*: Risk management, capital preservation, emotional stability
- *Blind spot*: Inflation risk — being too safe can erode purchasing power over decades

**5. The Social Investor**
- *Icon*: A network/constellation
- *Description*: "You're influenced by what others do — and that's not always bad. You learn from peers, adapt quickly, and thrive in group settings. Your challenge is knowing when to trust your own analysis over the crowd."
- *Strengths*: Adaptability, learning speed, collaborative instinct
- *Blind spot*: Herd behavior — may follow trends rather than fundamentals

**6. The Maverick**
- *Icon*: A compass pointing off-north
- *Description*: "You go your own way. High conviction, concentrated bets, and a willingness to be wrong. When you're right, you're spectacularly right. When you're wrong..."
- *Strengths*: Conviction, independence, high potential returns
- *Blind spot*: Concentration risk, overconfidence, inadequate diversification

### Metrics That Feed Into the Assessment

| Metric | How It's Measured | Which Type It Indicates |
|---|---|---|
| Risk tolerance score | Mission 1 answers | Guardian (low) ↔ Maverick (high) |
| Crash reaction | Mission 3: hold/sell/buy | Steady Builder (hold), Opportunist (buy), Guardian (sell) |
| Diversification score | Missions 2, 5, 6: number of asset classes, geographic spread | Analyst (high), Maverick (low) |
| Rebalancing frequency | All missions: how often they change allocation | Analyst (moderate, scheduled), Social Investor (reactive) |
| Alignment with AI advice | All missions: did they follow the Professor's hints? | Social Investor (high), Maverick (low) |
| Learning curve | Performance improvement from Mission 2 → Mission 6 | Steady Builder (consistent), Analyst (improving) |
| Time horizon preference | Mission 4: did they gravitate toward long-term? | Steady Builder (long), Opportunist (mixed) |
| Peer comparison behavior | Mission 6: did they change strategy after seeing others? | Social Investor (yes), Maverick (no) |

The classification algorithm: a weighted scoring across all metrics, mapping to the closest archetype. The AI then confirms or overrides based on holistic pattern recognition. This hybrid (rules + AI) approach ensures consistency while allowing nuance.

### Visual Design of the Shareable Card

```
┌──────────────────────────────────────┐
│                                      │
│        [Academy Crest Logo]          │
│     WEALTH MANAGER ACADEMY           │
│        Class of March 2026           │
│                                      │
│  ─────────────────────────────────   │
│                                      │
│         [Player Name]                │
│     has graduated as a               │
│                                      │
│    ★ THE STEADY BUILDER ★            │
│         [Brick Icon]                 │
│                                      │
│  "You build wealth the old-          │
│   fashioned way: patiently,          │
│   consistently, without drama."      │
│                                      │
│  ─────────────────────────────────   │
│                                      │
│       [Radar Chart]                  │
│    Risk Tolerance  ████░░  68%       │
│    Diversification ██████  92%       │
│    Crisis Calm     █████░  84%       │
│    Long-term Focus ██████  95%       │
│    Knowledge       ████░░  71%       │
│                                      │
│  ─────────────────────────────────   │
│                                      │
│  STRENGTHS          BLIND SPOT       │
│  🏆 Discipline     ⚠️ May miss      │
│  🏆 Long-term       growth by        │
│     thinking        being too         │
│  🏆 Emotional       conservative     │
│     stability                        │
│                                      │
│  ─────────────────────────────────   │
│                                      │
│  "You held through the crash when    │
│   78% of players sold. You built     │
│   a portfolio Maria would trust.     │
│   Your investing superpower is       │
│   patience — the rarest skill in     │
│   finance. Start early, stay the     │
│   course, and time will do the       │
│   rest."                             │
│                                      │
│        — Professor Fortuna           │
│                                      │
│  ─────────────────────────────────   │
│                                      │
│  Academy Score: 87/100               │
│  Top 12% of graduates               │
│                                      │
│  [QR Code]  Challenge a friend       │
│                                      │
│     Powered by PostFinance           │
│        [PostFinance Logo]            │
│                                      │
└──────────────────────────────────────┘
```

### What Text the AI Generates

The AI generates three pieces of text for the DNA report:

1. **Personality description** (1 sentence): Selected from predefined descriptions per type, not generated. This ensures consistency and quality.

2. **Personalized paragraph** (3-4 sentences): Generated by GPT-5.2 based on specific player actions. The prompt includes:
   - The player's type
   - Their crash reaction (exact action taken)
   - Their strongest mission and weakest mission
   - Their Arena ranking (if played)
   - Their most notable decision

   Example prompt excerpt:
   ```
   Generate a 3-4 sentence personalized assessment for this academy graduate.
   Type: The Steady Builder. They held through a 34% crash when 78% sold.
   They scored highest on Mission 5 (Asset Classes) and lowest on Mission 2
   (initial diversification was poor but improved after rebalance).
   They ranked 3rd out of 8 in the Arena. Their most notable decision:
   buying gold during the crash, which other players did not do.
   Tone: Warm, professional, slightly proud — like a professor writing
   a letter of recommendation.
   ```

3. **Percentile ranking** (1 line): "Top X% of graduates" — calculated against all players in the database (or estimated if early in the hackathon). This social proof line is critical for shareability.

### Mapping to PostFinance Products (Subtle, Educational)

The DNA report does NOT sell. It educates. But it creates natural entry points:

- **The Steady Builder**: "Your profile aligns with a long-term savings plan approach. Monthly investing in diversified funds could match your style."
- **The Guardian**: "Your preference for stability suggests balanced or conservative investment strategies. Understanding how bonds and mixed funds work could be your next step."
- **The Opportunist**: "Your willingness to invest during downturns is rare. Learning about systematic rebalancing could channel that instinct productively."

These are framed as "next steps in your learning journey," not product pitches. PostFinance gets the brand association without the sales pressure. In a real deployment, each type could link to a relevant PostFinance educational page.

### Example Complete DNA Report Output

**Name**: Alex
**Type**: The Opportunist
**Academy Score**: 82/100
**Percentile**: Top 18% of graduates

**Radar Chart Scores**:
- Risk Tolerance: 88%
- Diversification: 61%
- Crisis Calm: 91%
- Long-term Focus: 72%
- Knowledge: 78%

**Strengths**: Contrarian courage, crisis performance, growth orientation
**Blind Spot**: Diversification discipline — concentrated positions amplify both gains and losses

**Personalized paragraph**:
> *"You bought into the crash when 82% of your classmates were selling. That's not recklessness — your other decisions show you understand risk. It's conviction. Your blind spot showed up in Mission 2, where you put 70% into Swiss stocks alone. The good news: you corrected it after seeing the damage. You learn fast. Your next step is making diversification a habit, not a reaction. Channel your courage into a well-spread portfolio and you'll be formidable."*

**Next step**: "Your instinct to act during volatility is valuable. Learning about systematic rebalancing strategies could help you deploy that instinct consistently."

---

## 6. Multiplayer & Event Mode

### Academy Framing for Events

The academy metaphor is inherently event-friendly. A PostFinance workshop or school visit becomes an "Academy Session":

1. **Facilitator** opens a new "Class" on the platform
2. **Participants** scan a QR code projected on screen → they are "enrolled"
3. **Everyone** plays through Missions 1-3 individually (15-20 minutes)
4. **The Arena** (Mission 6) is played as a group — everyone faces the same market
5. **Graduation** — DNA reports are revealed simultaneously. The facilitator can see a class summary: "This class has 4 Steady Builders, 2 Analysts, 1 Opportunist, and 1 Guardian."

This structure gives PostFinance a plug-and-play workshop format that requires zero preparation beyond "project the QR code."

### Sync Lobby as "Classroom Session"

The sync lobby UI:
- A "classroom" view showing all enrolled students as avatar circles
- Each avatar shows: name, rank (if they've played solo missions), and a status indicator (ready/in-mission)
- A large countdown timer for when the Arena begins
- The Professor welcomes each new student as they join:
  > *"Welcome to the class, Jordan. I see you've already reached Strategist rank. Impressive. Let's see how you perform under competitive pressure."*

### QR Join Flow

1. Host taps "Create Class" → receives a 4-character room code and a QR code
2. The QR encodes a URL: `https://academy.wealtharena.ch/join/ABCD`
3. Scanning or visiting the URL opens the app directly into the enrollment flow for that room
4. No app download required — it is a progressive web app
5. Players enter a nickname (or use a generated one) and join

Time from QR scan to playing: under 15 seconds.

### Live Class Leaderboard

Displayed during Mission 6 (Arena), updated in real-time:

```
┌─────────────────────────────────────────────┐
│  CLASS LEADERBOARD — Year 6 of 10           │
│                                             │
│  1. ★ Alex          Score: 84   ↑ +12.3%   │
│  2.   Jordan        Score: 81   ↑ +9.7%    │
│  3.   [Bot] Stefan  Score: 79   ↑ +8.2%    │
│  4.   Sam           Score: 74   ↑ +14.1%   │
│  5.   [Bot] Alice   Score: 71   ↑ +18.9%   │
│  6.   Morgan        Score: 68   ↑ +5.3%    │
│  7.   [Bot] Tanya   Score: 62   ↓ -2.1%    │
│  8.   [Bot] Carlos  Score: 58   ↑ +3.4%    │
│                                             │
│  Note: Score ≠ Return. Sam has the highest  │
│  return but ranks 4th due to concentration  │
│  risk. Stefan's boring strategy is winning. │
│                                             │
└─────────────────────────────────────────────┘
```

The AI Professor comments on the leaderboard at each decision point:

> *"Sam, you're up 14% but your score is only 74. Why? Because you're 100% in US stocks. Right now that's working, but one bad quarter and you'll feel it more than anyone. Meanwhile, Jordan is diversified across four asset classes and sleeping soundly. This is exactly why we don't score on returns alone."*

### AI Professor Group Commentary

After the Arena concludes, the Professor delivers a "class assessment":

> *"This was a fascinating class. You faced the 2010-2020 decade — a long bull market with one sharp correction in 2015 and the COVID crash in 2020. Here's what I observed:*
>
> *Alex and Jordan both held through the COVID crash. That discipline put them at the top. Sam had the best raw performance but took excessive risk to get there — in a different decade, that strategy would have been punished. And Morgan — you sold during the crash but bought back in two months later. That's not ideal, but it shows you can override your panic instinct. You're learning.*
>
> *Class dismissed. Your DNA reports await."*

### Async Mode

After completing the Academy (solo or in a class), the player's DNA report includes a "Challenge a Friend" QR code and shareable link.

When a friend opens the link, they see:
- The challenger's DNA report (partially — type and score, not the full text)
- A prompt: "Can you beat Alex's score of 82? Enroll in the Academy and find out."
- They play the full Academy experience, ending with their own DNA report
- A comparison view shows both DNA reports side by side

This creates organic viral distribution: the DNA report is interesting enough to share, and the challenge mechanic gives friends a reason to play.

---

## 7. User Experience Flow

### Screen-by-Screen Walkthrough

**Screen 1: Enrollment**
- Full-screen PostFinance yellow background
- Academy crest animation (builds itself)
- Text: "WEALTH MANAGER ACADEMY — Enrollment Open"
- Single button: "Begin Enrollment"
- Below: "Join a class" link (for event/multiplayer join)

**Screen 2: Name Entry**
- Minimal screen: "What should we call you, recruit?"
- Text input with autocapitalize
- The Professor's first message appears: *"Welcome. I'm Professor Fortuna, your instructor. Let's find out what kind of investor you are."*

**Screen 3: Mission 1 — Risk Profiling**
- Top: Mission title card with wax-seal graphic
- Center: Scenario cards that swipe in, one at a time
- Bottom: Response options as large, tappable buttons
- Professor's avatar and text bubble in upper-left
- After each answer: brief AI response + transition to next scenario

**Screen 4: Rank Up — Cadet → Analyst**
- Full-screen celebration: badge animation, confetti
- Professor: *"You've earned your first rank. Analyst. Now let's put your knowledge to work."*
- "Continue to Mission 2" button

**Screen 5: Mission 2 — Diversification**
- Top: Portfolio allocation interface (draggable sliders or pie chart)
- Center: Asset class cards (tappable for details)
- Bottom: "Lock In Allocation" button
- After locking: time simulation plays as an animated line chart
- Professor commentary appears as text bubbles overlaid on the chart
- Rebalance opportunity appears mid-simulation

**Screen 6: Mission 3 — Crash**
- The most dramatic screen in the app
- Full-screen portfolio value counter (large numbers, ticking down)
- News alert cards slide in from the top (red borders, urgent typography)
- Professor voice plays (if TTS enabled)
- Decision prompt: four large buttons, pulsing gently
- After decision: the simulation continues, showing the aftermath
- Debrief screen with comparison chart (your path vs. "hold" path vs. "buy" path)

**Screen 7: Mission 4 — Long-Term**
- Split-screen: Investor A (left) vs. Investor B (right)
- Animated counters showing portfolio value growing year by year
- The "crossover moment" is highlighted with a flash
- Interactive planning tool: sliders for amount, horizon, risk level
- Fan chart projection with AI commentary

**Screen 8: Mission 5 — Asset Classes**
- Client brief card (photo, name, goals, constraints)
- Portfolio builder (same interface as Mission 2 but with the client brief visible)
- Asset class fact cards (expandable/collapsible)
- AI feedback in real-time as allocation changes
- "Submit to Professor" button → grading animation → feedback

**Screen 9: Academy Dashboard / Mission Select**
- Visible between missions and accessible via menu
- A vertical "academy path" — missions as nodes on a winding road
- Completed missions show grade (A/B/C) and a gold checkmark
- Current mission pulses
- Locked missions are grayed with a lock icon
- Player's rank and XP bar at top
- "Join a Class" button for multiplayer

**Screen 10: Mission 6 — Arena Lobby**
- Classroom view with player avatars in a grid
- Room code and QR displayed prominently (for host)
- "Ready" toggle for each player
- Start button (host only) or countdown timer
- Professor: *"Waiting for all students to arrive..."*

**Screen 11: Mission 6 — Arena In-Game**
- Top: Live leaderboard (collapsible)
- Center: Portfolio chart (same as Mission 2 simulation)
- Bottom: Rebalance controls (appear at decision points)
- Professor commentary scrolls in a ticker at the top
- Timer showing current year of the 10-year simulation

**Screen 12: Mission 7 — Graduation Ceremony**
- Dark background, spotlight effect
- Professor's graduation speech (text + optional voice)
- "Reveal Your Investment DNA" button (large, pulsing, golden)

**Screen 13: DNA Report Reveal**
- Animated card assembly (each section builds in with a 0.3s delay)
- Personality type appears first with icon and title
- Radar chart draws itself
- Strengths/blind spots fade in
- Personalized paragraph types itself (typewriter effect)
- Score and percentile appear last
- Bottom buttons: "Share" (generates image) and "Challenge a Friend"
- Background: subtle confetti, academy crest watermark

**Screen 14: Share/Leaderboard**
- DNA report as a shareable image (pre-rendered)
- Share options: copy link, download image, QR code
- Global leaderboard (if connected to backend)
- "Play Again" to try a different strategy and see if your DNA changes

---

## 8. Data Architecture

### Historical Data → Mission Scenarios

The 20-year dataset (2006-present) is pre-processed into mission-ready formats:

**Index data** (SMI, EuroStoxx 50, DJIA, Nikkei, DAX):
- Daily returns, rebased to 100
- Pre-calculated rolling volatility (20-day, 60-day)
- Annotated with major events (crash start/end dates, crisis labels)

**Stock data** (30 DJIA + 20 SMI stocks):
- Available for future missions or advanced mode
- Not used in MVP missions (indices are simpler for beginners)

**Bonds, FX, Gold**:
- Daily returns, rebased to 100
- Used in portfolio simulation alongside equity indices

**Pre-computed mission scenarios**:
Each mission uses a curated slice of the historical data:

| Mission | Data Used | Period Selection |
|---|---|---|
| Mission 2 | All indices + bonds + gold + cash | Random 3+3 year window |
| Mission 3 | Player's portfolio through a crash period | Selected from: 2008, 2011, 2015, 2020, 2022 |
| Mission 4 | Long-term equity index (SMI or DJIA) | Full 20-year dataset, annualized |
| Mission 5 | All asset classes | Random 5-year window |
| Mission 6 | All asset classes | Random 10-year window (same for all players) |

### Player Progress & Decision Storage

**Session state** (in-memory + database):
```
PlayerSession {
  id: uuid
  name: string
  createdAt: timestamp
  currentMission: 1-7
  rank: enum(CADET, ANALYST, STRATEGIST, PORTFOLIO_MANAGER, GRADUATE)

  // Mission 1 data
  riskProfileAnswers: [5 answers]
  riskArchetype: string
  riskScore: number (0-100)

  // Mission 2 data
  initialAllocation: { assetClass: percentage }
  rebalancedAllocation: { assetClass: percentage }
  diversificationScore: number
  mission2Period: { start: date, end: date }

  // Mission 3 data
  crashScenario: string (e.g., "2020-COVID")
  crashReaction: enum(SELL_ALL, SELL_HALF, HOLD, BUY_MORE)
  crashTiming: timestamp (how long they deliberated)
  portfolioDrawdown: number
  recoveryReturn: number

  // Mission 4 data
  longTermPlanAmount: number
  longTermPlanHorizon: number
  longTermPlanRisk: string
  socraticAnswer: string

  // Mission 5 data
  clientPortfolio: { assetClass: percentage }
  clientPortfolioGrade: string
  assetClassQuizScore: number

  // Mission 6 data
  arenaRoomId: string
  arenaAllocations: [{ timestamp, allocation }]
  arenaFinalReturn: number
  arenaFinalScore: number
  arenaRank: number

  // DNA Report data
  personalityType: string
  radarScores: { riskTolerance, diversification, crisisCalm, longTermFocus, knowledge }
  strengths: [string]
  blindSpot: string
  personalizedParagraph: string
  overallScore: number
  percentile: number
}
```

### DNA Report Accumulation

Each mission writes to specific fields in the player session. The DNA report generator reads all fields at once and produces the final classification. No mission needs data from a later mission — the data flows forward only.

### Live/Real-Time Elements

- **Arena (Mission 6)**: WebSocket connection for real-time leaderboard updates and synchronized market progression. All players in a room receive the same market data at the same time.
- **Lobby**: WebSocket for player join/leave/ready status.
- **Everything else**: Standard request/response. No real-time needed for solo missions.

---

## 9. Technical Architecture

### Next.js App Structure

```
/app
  /page.tsx                    — Enrollment screen
  /enroll/page.tsx             — Name entry
  /academy/page.tsx            — Dashboard / mission select
  /mission/[id]/page.tsx       — Mission gameplay (dynamic route, id = 1-7)
  /arena/page.tsx              — Arena lobby
  /arena/[roomId]/page.tsx     — Arena gameplay
  /dna/page.tsx                — DNA report reveal
  /dna/[playerId]/page.tsx     — Shareable DNA report (public)
  /join/[code]/page.tsx        — QR join redirect

/components
  /ui                          — Reusable UI (buttons, cards, charts, sliders)
  /academy                     — Academy-specific (crest, rank badge, progress path)
  /missions                    — Mission-specific components
  /charts                      — Portfolio chart, radar chart, fan chart
  /professor                   — AI chat bubble, voice overlay
  /arena                       — Leaderboard, lobby, player avatars
  /dna                         — DNA report card, shareable image generator

/lib
  /ai                          — OpenAI API integration (chat, TTS, DNA generation)
  /data                        — Historical data loading and scenario generation
  /scoring                     — Score calculation, percentile, DNA classification
  /multiplayer                 — WebSocket client, room management
  /state                       — Zustand stores for player session, mission state

/api
  /session/route.ts            — Create/update player sessions
  /ai/chat/route.ts            — Professor AI streaming endpoint
  /ai/tts/route.ts             — TTS generation endpoint
  /ai/dna/route.ts             — DNA report generation endpoint
  /arena/route.ts              — Arena room creation
  /arena/[roomId]/route.ts     — Arena state management
  /leaderboard/route.ts        — Global leaderboard
  /data/scenario/route.ts      — Historical data scenario endpoint

/data
  /historical                  — Pre-processed CSV/JSON files
  /scenarios                   — Pre-built mission scenario configurations
```

### Backend: API Routes & Database

**Database**: SQLite via Drizzle ORM (or Turso for edge deployment). Lightweight, zero-config, sufficient for hackathon scale.

**Tables**:
- `players` — id, name, created_at, current_mission, rank, dna_type, overall_score
- `mission_results` — player_id, mission_id, data (JSON), score, completed_at
- `arena_rooms` — id, code, host_player_id, scenario_config, status, created_at
- `arena_participants` — room_id, player_id, allocations (JSON), final_score, final_rank

**API Routes**:
- `POST /api/session` — Create new player session
- `PATCH /api/session` — Update mission results
- `POST /api/ai/chat` — Stream Professor responses (SSE)
- `POST /api/ai/tts` — Generate voice audio (returns audio URL)
- `POST /api/ai/dna` — Generate DNA report
- `POST /api/arena` — Create arena room
- `GET /api/arena/[roomId]` — Get room state
- `WebSocket /api/arena/[roomId]/ws` — Real-time arena communication
- `GET /api/leaderboard` — Global leaderboard

### OpenAI API Integration

**Chat (Professor Fortuna)**:
- Model: GPT-5.2
- Streaming: Yes (SSE for responsive feel)
- System prompt: ~800 tokens (personality + current context)
- Player context injected per request: ~200 tokens
- Expected latency: 500-1500ms for first token

**TTS (Voice Mode)**:
- Model: tts-1 (or tts-1-hd for graduation speech)
- Voice: "nova" (warm, professional, gender-neutral)
- Pre-generate mission briefings at build time (6 audio files)
- Dynamic generation for crash narration and graduation speech
- Fallback: text-only with "play" button if latency >3s

**DNA Report Generation**:
- Model: GPT-5.2
- Not streaming (full response needed for structured output)
- JSON mode for consistent output format
- Expected latency: 2-4s (acceptable — masked by reveal animation)

### State Management

**Zustand** for client-side state:
- `usePlayerStore` — player identity, rank, current mission
- `useMissionStore` — current mission state, decisions, AI messages
- `useArenaStore` — room state, leaderboard, WebSocket connection

State is persisted to `localStorage` for session recovery (if the player refreshes or loses connection) and synced to the database at mission completion.

### Real-Time for Multiplayer

**WebSocket** via Next.js API route (or Partykit for simpler setup):
- Room creation: HTTP POST → returns room ID and WebSocket URL
- Player join: WebSocket connect with room ID and player ID
- Market ticks: Server broadcasts market data to all clients simultaneously
- Decision points: Server pauses market, waits for all players to submit, then resumes
- Leaderboard: Server calculates and broadcasts after each decision point

**Fallback if WebSocket setup is slow**: Polling every 2 seconds. Less smooth but functional.

### Deployment Strategy

**Primary**: Vercel (Next.js native deployment)
- Edge functions for API routes
- Static generation for the enrollment and DNA share pages
- WebSocket via Vercel's edge runtime or a separate Partykit deployment

**Database**: Turso (SQLite at the edge) or Vercel KV for key-value storage

**Assets**: Vercel Blob storage for generated TTS audio files

**Domain**: Custom subdomain if available (e.g., `academy.wealtharena.ch`), otherwise Vercel's default URL

**Build time**: Under 60 seconds. Deploy time: under 90 seconds. Total time from `git push` to live: under 3 minutes.

---

## 10. Pitch Strategy — Engineered to Win

### The 5-Minute Demo Arc

Every second counts. Here is the exact script:

**0:00-0:30 — The Problem (30 seconds)**
"50% of Swiss adults don't invest. Not because they can't — because they're scared. They don't understand risk. They don't know what diversification means. And every existing tool either bores them with articles or terrifies them with real money. We built something different."

**0:30-1:00 — The Solution (30 seconds)**
"Wealth Manager Academy. An AI-powered investment school that teaches you by making you experience investing — not read about it. You enroll. You face missions. You survive crashes. You graduate. And at the end, you discover who you really are as an investor."

Show: the enrollment screen, the academy dashboard with the mission path.

**1:00-2:30 — Live Demo: Mission 3 — The Crash (90 seconds)**
This is the heart of the demo. Skip to Mission 3 (pre-loaded with completed Missions 1-2).

"Let me show you what happens when markets crash."

Start the crash simulation. The portfolio drops. News alerts flash. The Professor speaks (TTS):
> *"Your portfolio is down 28%. Other students are selling. What do you do?"*

Make the decision live. Show the aftermath. Show the comparison chart. The Professor's debrief:
> *"If you'd sold, you would have locked in a 28% loss. By holding, you recovered in 5 months and ended up 15% higher. This is the most expensive mistake in investing — and you just learned it without losing a single franc."*

**2:30-3:30 — The DNA Report Reveal (60 seconds)**
"After all seven missions, every player receives this."

Tap "Reveal Your Investment DNA." The card assembles on screen. Read the personalized paragraph aloud. Show the radar chart. Show the shareable card.

"This is what players take home. This is what they share. This is what makes them remember PostFinance."

**3:30-4:15 — Multiplayer & Event Mode (45 seconds)**
"For events, it works like a classroom." Show the QR join flow. Show the lobby filling up. Show the live leaderboard with the Professor's commentary.

"PostFinance can run this at any workshop, any school visit, any public event. Project the QR code, everyone enrolls, everyone plays, everyone graduates."

**4:15-5:00 — Why This Wins + Close (45 seconds)**
"This is not a stock market simulator. This is a personal investing education experience that adapts to you, teaches through experience, and gives you an identity — your Investment DNA. It's built on Next.js, powered by GPT-5.2, and it works right now on any phone."

"One more thing — I'd like to invite [judge name] to enroll. Scan this QR code. In three minutes, you'll have your own Investment DNA. Let's find out what kind of investor you are."

### Involving a Judge

This is the power move. Have a judge (or audience member) scan the QR code during the Q&A. They play through an abbreviated version (Mission 1 only — 2 minutes). Their DNA report is generated live.

Nothing is more convincing than experiencing the product yourself. And nothing is more memorable than a judge seeing their own personality type revealed on stage.

### Scoring Against Each Criterion

**Creativity (25%) — Why we score highest**:
- No other team will build an AI-adaptive curriculum
- No other team will have voice coaching
- No other team will produce a personalized DNA report
- The academy metaphor is a narrative wrapper that transforms a simulator into an experience
- The AI classmate bots add personality and teaching contrast
- Every team will build "pick stocks, watch chart." We built "discover who you are"

**Visual Design (20%) — Why we score highest**:
- The academy theme provides a consistent, rich visual language (crests, badges, ranks, certificates)
- The DNA report card is a designed artifact — not a chart dump
- PostFinance's brand colors are used purposefully (yellow = progress and achievement, black = authority and premium feel)
- Phone-optimized from the start — every screen designed for thumb-reach
- The crash mission has cinematic pacing (news alerts, voice, urgency)

**Feasibility (20%) — Why this is buildable in 36 hours**:
- Seven missions, but each is self-contained and independently buildable. The team can parallelize: one person per mission, one person on AI/backend, one person on UI/design.
- The AI backbone is GPT-5.2 via API — no training, no fine-tuning, just prompt engineering
- Historical data is pre-processed — load CSV, index to 100, serve via API
- Next.js + Vercel = zero DevOps
- WebSocket for multiplayer is the only complex piece, and it can be simplified to polling as a fallback
- The DNA report is the most impressive feature and it is "just" a well-designed prompt + a styled card component

**Reachability (15%) — Why this has real adoption potential**:
- One-tap enrollment. QR join for events. No app download.
- The academy format is inherently workshop-ready — schools, events, corporate training
- The DNA report is the viral loop — players share it because it says something about THEM
- The structured mission format means PostFinance can add new missions post-hackathon (sector analysis, ESG investing, retirement planning)
- The "class challenge" format gives PostFinance a repeatable event activation

**Learning Impact & Realism (20%) — Why this teaches better than any other concept**:
- Each mission teaches exactly one concept with explicit learning objectives
- The AI adapts to mistakes — struggling players get more scaffolding
- The crash mission creates visceral emotional learning (not just "the chart went down")
- The DNA report synthesizes learning into self-knowledge ("I'm a Guardian who needs more growth exposure")
- The scoring system rewards good behavior (diversification, discipline) and penalizes gambling (concentration, overtrading)
- The Professor explains WHY, not just WHAT — every outcome gets a plain-language debrief

### What Judges Will Talk About After the Pitch

1. "Did you see the DNA report? That's actually clever — it's like a personality test for investing."
2. "The crash mission was intense. When the voice said 'your portfolio is down 28%' I actually felt the pressure."
3. "They had a judge play live and it actually worked. Bold."
4. "The academy framing makes it so much more structured than the other teams' sandboxes."
5. "PostFinance could actually use this at events. The QR thing is ready to go."
6. "The AI coaching was surprisingly good. It remembered what you did in the previous mission."

---

## 11. Why This Wins

### What Other Teams Will Build

Based on the challenge brief, most teams will build some variation of:
- A stock picker with time-accelerated simulation and a chart
- A multiplayer trading floor where you compete on returns
- A quiz-based learning app with a simulator attached

These are fine. They are expected. They are forgettable.

### What We Build Instead

We build an **identity experience**. The player does not leave with a score — they leave with a self-image. "I'm a Steady Builder." "I'm an Opportunist." That sticks. That gets shared. That gets talked about.

### The Emotional Journey

The arc of the Academy is not "learn stuff, get score." It is:

1. **Enrollment** — Curiosity. "What is this? An investment academy?"
2. **Mission 1** — Self-discovery. "Interesting, I didn't know I was loss-averse."
3. **Mission 2** — First lesson. "Oh, concentration really does hurt."
4. **Mission 3** — Emotional peak. "My portfolio crashed and I held. I actually held."
5. **Mission 4** — Perspective shift. "Starting early matters more than I thought."
6. **Mission 5** — Applied knowledge. "I can actually build a portfolio for someone."
7. **Mission 6** — Competition and validation. "I ranked 3rd. My strategy worked."
8. **Mission 7** — Identity. "I'm The Steady Builder. That's... actually who I am."

This is a hero's journey. Enrollment → trials → transformation → identity. Every good game uses this arc. We're using it to teach investing.

### The Take-Home Artifact

Every other team's demo ends when the pitch ends. Our demo produces an artifact that the judge keeps on their phone. The DNA report is:

- **Shareable**: It's an image card designed for Instagram stories, WhatsApp, LinkedIn
- **Personal**: It says something specific about YOU, not about the app
- **Branded**: PostFinance's identity is baked into the card design
- **Viral**: "Challenge a friend" creates a loop — each share generates a new player

Two weeks after the hackathon, when the judges are writing their report, they will still have our DNA report saved on their phones. No other team will achieve that level of persistence.

### The PostFinance Business Case

For the judges from PostFinance, this concept directly addresses their business needs:

1. **Customer profiling**: Every DNA report is a risk profile. In a real deployment, this data helps PostFinance understand potential customers before they ever walk into a branch.
2. **Lead generation**: "You're a Steady Builder. Learn about PostFinance's long-term investment plans." The DNA report creates a natural, non-pushy entry point to products.
3. **Event activation**: The Academy is a turnkey workshop format. Project a QR code, play for 20 minutes, everyone graduates. It works at schools, corporate events, public activations, and financial literacy days.
4. **Brand positioning**: PostFinance becomes "the bank that helped me understand investing" instead of "the bank that sent me a brochure." The AI Professor is a brand character that people associate with learning and trust.
5. **Content expansion**: Post-hackathon, new missions can teach: retirement planning, ESG investing, Swiss tax-advantaged accounts, sector analysis, currency risk. The academy framework is infinitely extensible.

### Why the Academy Framing Is Inherently More Memorable

A "stock market game" competes with every other stock market game ever built. A "trading simulator" competes with Robinhood's practice mode, Investopedia's simulator, and a hundred others.

An "AI Investment Academy that gives you a personalized Investment DNA report" competes with nothing. It is a category of one. When judges compare submissions, ours is the only one that cannot be described as "like X but with Y." It is simply: "the academy with the DNA report."

That uniqueness is the single strongest predictor of winning a hackathon creativity category — and creativity is worth 25% of the total score.

---

*This document is a complete creative and technical blueprint for the Wealth Manager Academy concept. Every section is designed to be actionable by a development team and persuasive to a judging panel. The concept is engineered not just to be built, but to be unbeatable.*

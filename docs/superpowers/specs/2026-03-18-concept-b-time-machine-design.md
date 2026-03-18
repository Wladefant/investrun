# Concept B: "Time Machine" -- Creative & Technical Design Document

**Project**: Wealth Manager Arena -- PostFinance START Hack 2026
**Date**: 2026-03-18
**Status**: Design Concept
**Authors**: Team Superpowers

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Creative Vision](#2-creative-vision)
3. [The Three Game Modes -- Detailed Design](#3-the-three-game-modes--detailed-design)
4. [AI System Design](#4-ai-system-design)
5. [Historical Eras -- Detailed Scenarios](#5-historical-eras--detailed-scenarios)
6. [User Experience Flow](#6-user-experience-flow)
7. [Data Architecture](#7-data-architecture)
8. [Technical Architecture](#8-technical-architecture)
9. [Pitch Strategy](#9-pitch-strategy)
10. [What Makes This Extraordinary](#10-what-makes-this-extraordinary)

---

## 1. Executive Summary

**Time Machine** is a gamified investment education experience disguised as a time-travel documentary. Instead of abstract tutorials or passive charts, players literally travel through the most dramatic financial crises of the last two decades -- the 2008 meltdown, the COVID crash, the European debt spiral -- building and managing portfolios while an AI documentary narrator walks them through what happened, why it happened, and how their decisions compare to what real investors actually did.

The core insight: **nobody learns to invest from a lecture. They learn by living through a crisis and surviving it.** Time Machine compresses years of market experience into five-minute sessions, wrapping hard financial lessons in storytelling that feels like playing through a Netflix documentary.

This concept directly addresses every judging criterion:

- **Creativity (25%)**: The time-travel documentary metaphor is unlike anything in the fintech education space. AI narration turns data into drama.
- **Visual Design (20%)**: A cinematic time machine interface with Duolingo-bold energy -- yellow (#FFC800) as the dominant accent, bold type, animated transitions between eras.
- **Feasibility (20%)**: Built on Next.js with 20 years of real historical data already available. GPT-5.2 handles narration and scoring. No exotic infrastructure required.
- **Reachability (15%)**: QR code joins for events, async challenge links for viral spread, phone-first design. A workshop facilitator scans, players are in a game within 10 seconds.
- **Learning Impact (20%)**: Every lesson is anchored to real history. "You held through the crash -- 92% of real investors didn't." The AI Judge evaluates diversification, risk management, and behavioral discipline -- not just returns.

---

## 2. Creative Vision

### The Time Travel Metaphor and World-Building

The entire app is framed as a time machine. The home screen is a control panel with dials, a date display, and a large yellow lever. When you pull the lever, the screen does a visual "warp" transition -- the date spins backward, static flickers across the interface, and you land in a historical moment with a flash.

This is not a gimmick layered on top of a spreadsheet. The metaphor drives every interaction:

- **Selecting an era** = setting the time machine's destination
- **Building a portfolio** = preparing your supplies before the journey
- **Playing through history** = traveling through time, watching events unfold
- **The AI narrator** = your guide, explaining what you're seeing as you travel
- **End-of-era scoring** = returning to the present and reviewing what you learned

The metaphor gives beginners a frame of reference. "Invest wisely" is abstract. "You're about to live through the 2008 financial crisis -- what do you want in your portfolio when Lehman Brothers collapses?" is visceral.

### Visual Identity and Tone

The visual design bridges two aesthetics:

**Documentary cinematic**: Muted backgrounds, period-appropriate imagery (grainy financial news screenshots from 2008, masked crowds from 2020), dramatic typography for era titles. Think Ken Burns meets Bloomberg Terminal.

**Duolingo-bold gamification**: PostFinance yellow (#FFC800) as the primary accent color -- used for buttons, progress bars, score highlights, the time machine lever. Black backgrounds with white text for readability. Bold sans-serif fonts. Playful micro-animations (portfolio value counter ticking up/down, confetti on good decisions, screen shake on crashes).

The tension between "serious history" and "playful game" is intentional. It says: investing is real and important, but learning about it should be fun.

### The "Living History" Narrative Approach

Every era is narrated like a documentary episode. The AI narrator does not simply state facts -- it builds tension, creates dramatic beats, and makes the player feel the emotional weight of historical moments.

Traditional finance app: "The S&P 500 declined 38.5% in 2008."

Time Machine: "It's September 15th, 2008. Lehman Brothers has just filed for bankruptcy. The largest bankruptcy in American history. Your colleagues are calling their brokers in a panic. Your portfolio is down 22% in three weeks. The question isn't whether the market will fall further -- it's whether you have the nerve to stay in. What do you do?"

This is the difference between reading about history and experiencing it.

### What Makes This Feel Different

Every other finance education app starts from the same place: "Here's what a stock is. Here's what a bond is. Now practice." Time Machine starts from the opposite end: "You're in the middle of a crisis. Figure it out. We'll explain along the way."

This inversion -- experience first, explanation second -- is how humans actually learn. A child doesn't study the physics of bicycles before riding one. They get on, fall, and develop intuition. Time Machine is the financial equivalent: you develop intuition by surviving crises, then the AI explains the principles that made your intuition right or wrong.

---

## 3. The Three Game Modes -- Detailed Design

### Mode 1: Solo Time Travel ("Chronicle Mode")

Chronicle Mode is the core single-player experience. The player selects a historical era, builds a portfolio, and travels through that period with AI narration guiding them.

#### Era Selection Screen

The screen presents a horizontal timeline spanning 2006-2026. Key eras are marked with dramatic thumbnails and titles:

| Era | Years | Thumbnail | Tagline |
|-----|-------|-----------|---------|
| The Great Financial Crisis | Sep 2007 -- Mar 2009 | Lehman Brothers building | "The day the banks broke" |
| European Debt Crisis | Apr 2010 -- Jul 2012 | Greek protest imagery | "When nations go bankrupt" |
| The Long Bull Run | Jan 2013 -- Jan 2020 | Bull statue, Wall Street | "Seven years of easy money" |
| COVID Crash & Recovery | Jan 2020 -- Dec 2020 | Empty trading floor | "The fastest crash in history" |
| Inflation & Rate Shock | Jan 2021 -- Dec 2022 | Central bank building | "When free money ends" |
| Full Journey | Jan 2006 -- Dec 2025 | Montage | "Two decades. One portfolio. Every crisis." |

The player taps an era. The time machine animation plays. They arrive.

#### Dropping Into an Era

When the player lands in an era, three things happen simultaneously:

1. **The AI narrator sets the scene** with a 3-4 sentence documentary-style opening (displayed as text with a subtle typewriter animation, optionally with TTS).
2. **A "front page" of AI-generated headlines** appears, reflecting real events from the start date.
3. **The portfolio builder opens**, showing the asset universe available in that era.

**Example: Landing in September 2007 (Pre-crisis)**

> **AI Narrator**: "The year is 2007. The Dow Jones just hit an all-time high of 14,164. Housing prices haven't stopped climbing in a decade. Everyone you know says the market can only go up. Nobody is talking about something called 'subprime mortgages' -- yet. You have CHF 100,000 to invest. The next 18 months will test every instinct you have."

**Headlines ticker**:
- "DOW HITS RECORD HIGH -- Analysts predict 16,000 by year-end"
- "Housing market 'fundamentally sound,' says Fed Chair Bernanke"
- "Goldman Sachs posts record quarterly profit"
- "Swiss franc weakens as investors chase risk assets"

The player then allocates their CHF 100,000 across available assets: SMI stocks, US equities (DJIA), European equities (EuroStoxx 50), bonds (Swiss Bond Index, Global Aggregate), gold, and cash.

#### Time Acceleration Through Historical Events

Once the portfolio is built, time begins moving. Each "tick" represents one week of real historical data. The player watches their portfolio value change in real time (accelerated: roughly 1 week per 3 seconds, so an 18-month era plays out in about 3.5 minutes).

At key historical moments, time pauses and the AI narrator intervenes:

**March 2008 -- Bear Stearns collapses:**
> "Bear Stearns, one of the largest investment banks in the world, just collapsed overnight. JPMorgan bought it for $2 a share -- it was worth $170 a year ago. The market is down 8% this month. Some of your friends just sold everything. This is the moment where most investors make their biggest mistake. Do you want to adjust your portfolio?"

The player can:
- **Hold** (do nothing -- the AI notes this)
- **Rebalance** (shift allocations)
- **Panic sell** (move to cash -- the AI will note this too)

**September 2008 -- Lehman Brothers bankruptcy:**
> "It's over. Lehman Brothers filed for bankruptcy this morning. 158 years of history, gone. The Dow dropped 504 points today -- the largest single-day drop since 9/11. Credit markets are frozen. Nobody knows who's next. Your portfolio is down 31% from where you started. This is the hardest moment. What do you do?"

Between 4 and 6 decision points are embedded in each era, aligned with real historical events.

#### AI-Generated News Headlines

At each decision point, a news ticker shows 3-4 headlines that reflect the actual sentiment of that moment. These are generated by GPT-5.2 with a system prompt that constrains them to be historically accurate and emotionally evocative. They are not fabricated events -- they reflect real headlines with period-appropriate tone.

#### Educational Moments

After each decision point, the AI provides a brief educational insight tied to what actually happened next:

> "Here's what actually happened: the market fell another 25% over the next four months. But investors who held through the bottom and stayed invested recovered their losses within 3 years -- and doubled their money within 5. The lesson: **time in the market beats timing the market**. Almost nobody gets the timing right."

These moments are the educational core. They are not abstract principles -- they are principles anchored to specific historical events the player just experienced.

#### Historical Comparison Scoring

At the end of an era, the player's performance is compared to:

1. **Historical benchmarks** -- "Your portfolio returned +34% during this period. The SMI returned +18%. A 60/40 balanced fund returned +22%."
2. **Behavioral benchmarks** -- "You made 3 trades during the crisis. The average retail investor made 11. You stayed invested through the worst month -- 73% of real investors didn't."
3. **AI archetype bots** -- "You beat The Panic Seller by 41%. You underperformed The Diamond Hands by 3%."

#### End-of-Era AI Interview

The final screen is the AI's evaluation, presented as a documentary "exit interview":

> "Let's talk about your journey through the 2008 financial crisis. You started with CHF 100,000 and ended with CHF 87,400 -- a loss of 12.6%. That sounds bad, but here's the context: the average Swiss retail investor lost 28% during this period. Why? Because they panic-sold in October 2008 when things looked worst, locking in their losses. You held. That single decision -- doing nothing when every instinct screamed 'sell' -- saved you CHF 15,400 compared to the average."
>
> "Your diversification was strong: 30% bonds cushioned the equity drawdown. But I noticed you had zero gold allocation. Gold rose 25% during this crisis as a safe haven. Next time, consider a 5-10% gold position as insurance."
>
> **Your Time Traveler Score: 78/100**
> - Risk Management: 82/100
> - Diversification: 71/100
> - Emotional Discipline: 88/100
> - Long-term Thinking: 70/100

---

### Mode 2: Multiplayer Time Travel ("History Battle")

History Battle takes the Chronicle Mode experience and makes it competitive. Multiple players travel through the same era simultaneously, competing to achieve the best risk-adjusted, behavior-weighted score.

#### Synchronous Lobby Flow

1. **Host creates a room**: Selects an era, sets game parameters (starting capital, allowed assets, time compression speed). Gets a 6-character room code and a QR code.
2. **Players join**: Scan QR or enter room code on their phones. They see a lobby screen showing all connected players with randomly assigned time-traveler avatars.
3. **Countdown**: Host starts the game. A 10-second countdown syncs all players. The time machine animation plays on every screen simultaneously.
4. **Synchronized play**: All players experience the same era at the same speed. Decision points appear for everyone at the same time. A live leaderboard shows relative positions (portfolio value, updated every tick).

#### AI Archetype Bots

Three AI bots compete alongside human players. Each has a distinct personality, strategy, and dialogue style. They appear in the leaderboard and their trades are visible.

**The Panic Seller**
- **Personality**: Anxious, reactive, always sees the worst case. Uses lots of exclamation marks and rhetorical questions.
- **Strategy**: Sells equities whenever the portfolio drops more than 5% in a week. Moves to cash and bonds. Buys back in only after the market has recovered 15% from the bottom (always late).
- **Example dialogue (2008 crisis)**: "Did you SEE that drop?! I'm out. I'm moving everything to cash. I don't care if it recovers -- I can't watch my money disappear. Anyone still holding stocks right now is insane."
- **Educational purpose**: Demonstrates the real cost of panic selling -- the Panic Seller always locks in losses and misses the recovery.

**The Diamond Hands**
- **Personality**: Zen-like calm. Speaks in short, measured sentences. References Warren Buffett constantly. Slightly smug.
- **Strategy**: Buys a diversified portfolio at the start and never trades. Zero transactions regardless of what happens.
- **Example dialogue (2008 crisis)**: "Market's down 30%. So what? Buffett says be greedy when others are fearful. I haven't touched a thing. See you at the recovery."
- **Educational purpose**: Shows the power of staying invested -- but also the limitation of zero risk management. Diamond Hands does well over long periods but can underperform a rebalancer.

**The Contrarian**
- **Personality**: Bold, contrarian, slightly mischievous. Enjoys going against the crowd. Uses data to back up counterintuitive moves.
- **Strategy**: Monitors market sentiment (approximated by recent price momentum). When the market drops sharply, increases equity allocation. When the market has risen sharply, takes profits and shifts to bonds/gold.
- **Example dialogue (2008 crisis)**: "Everyone's selling? Perfect. I just doubled my equity position. The market is on sale -- 40% off! When has buying things at a massive discount ever been a bad idea? Oh right... never."
- **Educational purpose**: Demonstrates contrarian investing, which historically outperforms -- but requires nerve and discipline that most real investors lack.

#### Live Leaderboard

During gameplay, a compact leaderboard overlay shows:
- Player name / avatar
- Current portfolio value
- % change from start
- A small sparkline chart of their portfolio over time

The leaderboard updates every tick. Position changes are highlighted with animations (arrows up/down, color flashes).

#### Async Challenge ("Can You Beat My 2008 Crisis Run?")

After completing any era, a player can generate a **challenge link**. This link encodes:
- The era played
- The player's final score
- Their portfolio decisions at each decision point

When someone opens the link, they play the exact same era with the same decision points. At the end, they see a head-to-head comparison: their decisions vs. the challenger's decisions, with the AI explaining whose approach was better and why.

The share screen shows:
> "I scored 78/100 navigating the 2008 financial crisis. Think you can do better? [CHALLENGE LINK]"

This is designed for viral spread -- it's a dare with educational content baked in.

#### End-of-Match AI Evaluation

After a multiplayer round, the AI Judge evaluates all players (human and bot) together:

> "Let's review how everyone navigated the COVID crash of 2020."
>
> "**Sarah** stayed fully invested and rebalanced once -- strong discipline. **The Panic Seller** sold everything on March 12th and missed the fastest recovery in market history. **Marcus** tried to time the bottom and got it almost right -- bought back in on March 25th, just 2 days after the actual bottom. Impressive instinct, but risky strategy."
>
> "The winner is **Sarah** with 84/100 -- not because she had the highest return (that was **The Contrarian** at +47%), but because her approach was the most repeatable, diversified, and disciplined. In real life, Sarah's approach would work 9 times out of 10. The Contrarian's approach would only work if you have nerves of steel and perfect timing."

This evaluation reinforces the hackathon's core educational goal: **good investing behavior beats raw returns**.

---

### Mode 3: Real-Time Trading ("Present Day")

Present Day mode completes the narrative arc: you have traveled through history, learned from the past, and now you are here -- in the real market, in real time.

#### Live Market Data

Real-time (or 15-minute delayed) market data is fetched from a public API (Yahoo Finance, Alpha Vantage, or Finnhub). The same asset universe is available:
- SMI, EuroStoxx 50, DJIA, Nikkei 225, DAX
- Individual stocks from DJIA and SMI
- Bond indices, gold, FX pairs

Prices update every 60 seconds during market hours. Charts show intraday movement with the same visual style as the historical modes.

#### AI Live Commentator

The AI narrator shifts personality from "documentary host" to "live sports commentator":

> "Markets are open. The SMI is up 0.3% in early trading -- European futures were positive overnight after strong earnings from Nestle. Gold is flat. Your portfolio is tracking the benchmark closely. No drama today... but stay alert."

When significant moves happen:

> "Breaking: US inflation data just came in hotter than expected -- 3.8% vs. 3.5% forecast. Markets are selling off. The SMI just dropped 1.2% in 15 minutes. This is exactly the kind of moment we trained for in the 2022 inflation era. Remember what you learned: short-term volatility is noise. Your allocation is solid. Don't flinch."

#### Paper Trading Mechanics

Players start with CHF 100,000 in virtual capital. They can:
- Buy/sell any asset in the universe
- Set simple limit orders ("buy SMI if it drops below X")
- View their portfolio performance vs. benchmarks

The AI tracks their behavior and provides real-time coaching:
- "You've made 4 trades today. That's more than most professional fund managers make in a week. Are you investing or gambling?"
- "Your portfolio is 85% equities. Based on your risk profile, that's aggressive. Consider adding some bonds as a cushion."

#### Outside Market Hours

When markets are closed, the AI tells stories:

> "Markets are closed for the weekend. Let me tell you about a time just like this week. In March 2015, the Swiss National Bank shocked the world by removing the EUR/CHF floor. The franc surged 30% in minutes. Investors who were over-exposed to Euro-denominated assets lost a fortune overnight. The lesson? Currency risk is real, even in Switzerland. How's your currency exposure looking?"

This keeps the app engaging 24/7 and reinforces the connection between historical knowledge and present-day decisions.

#### Thematic Connection

The transition to Present Day mode is explicitly narrated:

> "You've traveled through 20 years of financial history. You've survived the 2008 crisis, the COVID crash, and the inflation shock. You've seen what happens when people panic, when they hold, and when they think long-term. Now it's time to apply everything you've learned. Welcome to today."

---

## 4. AI System Design

### The Narrator

The AI narrator is the soul of Time Machine. It is powered by GPT-5.2 and operates with a carefully crafted system prompt.

**Personality traits**:
- Authoritative but warm -- like a trusted documentary host (think David Attenborough narrating financial history)
- Uses concrete analogies and vivid language -- never dry or technical
- Builds tension before reveals ("The market was about to do something nobody expected...")
- Empathetic about mistakes -- never mocks the player, always explains why a mistake is common
- Historically grounded -- always ties lessons to real events and real data

**System prompt concept** (high-level):

```
You are the narrator of "Time Machine," a financial history documentary that the
player is living through. Your role is to:

1. Set the scene for each historical era with vivid, emotionally resonant
   descriptions of what was happening in the world.
2. Present decision points by describing real events and their emotional weight
   -- not just price movements, but what it FELT like to be an investor.
3. After each decision, reveal what actually happened and explain the underlying
   financial principle in simple, jargon-free language.
4. At the end of each era, evaluate the player holistically -- not just returns,
   but diversification, risk management, emotional discipline, and learning.
5. Compare the player to historical benchmarks and real investor behavior.

Tone: Documentary host. Authoritative, empathetic, occasionally dramatic.
Never condescending. Use short sentences for impact. Use analogies a
beginner would understand. Refer to real historical events by name and date.

Constraints: Never give specific real-world investment advice. Always frame
lessons as historical education. Never recommend specific securities.
```

### Historical Archetype Bots

Each bot runs a simple rule-based strategy with AI-generated dialogue.

**Implementation**:
- Bot strategies are deterministic algorithms (e.g., "sell if portfolio drops > 5% in one tick")
- Bot dialogue is generated by GPT-5.2 with a per-bot system prompt that defines personality and speaking style
- Bots react to the same market data and decision points as the player
- Bot performance is calculated in real time and shown on the leaderboard

**Bot dialogue generation prompt** (example for Panic Seller):

```
You are "The Panic Seller," an AI bot in a financial history game. You are
nervous, reactive, and always assume the worst. You sell stocks at every
significant dip and regret it later. Your speech is anxious -- lots of
exclamation marks, rhetorical questions, catastrophizing. You represent the
common investor mistake of emotional selling. Keep responses to 1-2 sentences.
```

### The Judge

The AI Judge evaluates players at the end of each era using a holistic scoring framework. This is the educational core -- the score rewards good investing behavior, not just high returns.

**Scoring dimensions**:

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Risk Management | 25% | Appropriate allocation for risk profile, use of defensive assets |
| Diversification | 25% | Spread across asset classes, avoidance of concentration risk |
| Emotional Discipline | 25% | Frequency of trades (fewer is generally better), holding through drawdowns, not panic-selling |
| Long-term Thinking | 25% | Staying invested, rebalancing rather than speculating, consistent strategy |

**Example score breakdown**:

```
FINAL SCORE: 78/100

Risk Management: 82/100
  You allocated 30% to bonds -- smart defensive positioning.
  You had no gold -- a missed opportunity for crisis insurance.
  Deduction: -8 for zero gold allocation, -10 for no adjustment
  after risk profile changed.

Diversification: 71/100
  You held 4 asset classes -- good breadth.
  But 45% was in a single equity index (SMI).
  Deduction: -15 for concentration in SMI, -14 for no international
  equity exposure outside Switzerland.

Emotional Discipline: 88/100
  You made only 2 trades during the entire crisis -- excellent restraint.
  You held through the October 2008 drawdown when most investors sold.
  Bonus: +8 for holding through the worst month.
  Deduction: -12 for one poorly-timed rebalance in December 2008.

Long-term Thinking: 70/100
  You stayed invested throughout -- strong.
  But you shifted to a more aggressive allocation AFTER the recovery,
  not during the downturn when assets were cheap.
  Deduction: -20 for pro-cyclical behavior, -10 for not rebalancing
  during the opportunity window.
```

### AI-Generated Historical News/Context

GPT-5.2 generates period-accurate news headlines at each decision point. The prompt includes:
- The exact date
- The actual price movements of all assets in the universe on that date
- A brief factual summary of the key real-world event (pulled from a curated event annotation dataset)

The AI then generates 3-4 headlines that capture the tone and sentiment of that moment. These are stylized as newspaper headlines, not actual reproductions of real headlines (to avoid copyright issues).

### The "Interview" Mechanic

At the end of each era, the AI conducts a brief "exit interview" -- 3-4 paragraphs that directly address the player's specific decisions:

1. **The narrative**: What happened during this era, told as a story with the player as protagonist
2. **The key decision**: The most important choice the player made (or didn't make) and its consequences
3. **The comparison**: How the player performed vs. historical benchmarks and real investor behavior
4. **The lesson**: One clear, actionable takeaway the player can apply to real investing

This is displayed as a scrollable text screen with the player's portfolio chart as a backdrop. The tone is reflective and constructive -- celebrating good decisions, gently explaining bad ones.

### Prompt Engineering Approach

All AI interactions use a layered prompt architecture:

1. **Base system prompt**: Defines the narrator's personality and constraints (shared across all modes)
2. **Era context injection**: Adds era-specific historical facts, key events, and educational goals
3. **Player context injection**: Includes the player's portfolio, recent decisions, risk profile, and score trajectory
4. **Output format instructions**: Specifies response length, tone, and structure for each interaction type (scene-setting, decision point, evaluation, interview)

Token management strategy:
- Scene-setting and decision point narrations: 150-250 tokens each
- News headlines: 50-80 tokens per set
- End-of-era evaluation: 400-600 tokens
- Bot dialogue: 30-50 tokens per response
- Total per era: approximately 2,000-3,000 tokens of AI-generated content

---

## 5. Historical Eras -- Detailed Scenarios

### Era 1: The Great Financial Crisis (September 2007 -- March 2009)

**Data range**: Sep 1, 2007 -- Mar 31, 2009 (approximately 80 weeks)

**Key events and decision points**:

| Date | Event | Market Impact | Decision Point |
|------|-------|--------------|----------------|
| Oct 2007 | DJIA hits all-time high (14,164) | Peak euphoria | Initial portfolio allocation |
| Mar 2008 | Bear Stearns collapses | -10% from peak | First rebalance opportunity |
| Sep 15, 2008 | Lehman Brothers bankruptcy | -25% from peak | Hold, rebalance, or sell? |
| Oct 2008 | Global panic, markets in freefall | -40% from peak | The hardest hold |
| Mar 2009 | Market bottom (DJIA 6,547) | -54% from peak | Buy the dip or stay in cash? |

**AI Narrator -- Opening**:
> "October 2007. The world has never been richer. The Dow Jones just broke 14,000 for the first time in history. Swiss banks are posting record profits. Real estate prices are so high that people are taking out mortgages they can't afford -- but nobody's worried, because house prices never go down. At least, that's what everyone believes. You have CHF 100,000. Let's see how you invest it."

**AI Narrator -- Lehman Moment**:
> "September 15th, 2008. A date that will be remembered for generations. Lehman Brothers, a 158-year-old investment bank, has filed for bankruptcy. It's the largest bankruptcy in American history. The President of the United States goes on television tonight to tell the nation the financial system is in danger. Your portfolio is down 25%. Everyone around you is selling. The financial advisors are saying 'stay calm,' but their voices are shaking. This is the moment that separates investors from gamblers. What do you do?"

**Educational lesson**: The power of staying invested through a crisis. Investors who held from the peak to the bottom and stayed invested recovered fully by 2012 and doubled their money by 2014. Investors who sold at the bottom locked in a 50%+ loss.

---

### Era 2: European Debt Crisis (April 2010 -- July 2012)

**Data range**: Apr 1, 2010 -- Jul 31, 2012 (approximately 120 weeks)

**Key events and decision points**:

| Date | Event | Market Impact | Decision Point |
|------|-------|--------------|----------------|
| Apr 2010 | Greece requests EU/IMF bailout | Eurozone fear begins | Initial allocation -- how much Euro exposure? |
| May 2010 | Flash crash, Greek debt downgraded to junk | EUR/CHF drops sharply | Currency risk management |
| Aug 2011 | US debt ceiling crisis + European contagion | -20% drawdown | Rebalance or flee to safety? |
| Sep 2011 | SNB sets EUR/CHF floor at 1.20 | CHF intervention | Swiss-specific currency lesson |
| Jul 2012 | Draghi: "Whatever it takes" | Recovery begins | Stay defensive or lean in? |

**AI Narrator -- Opening**:
> "April 2010. The financial crisis is over -- or so everyone thinks. But something is rotting in Europe. Greece has been spending money it doesn't have for decades, and the bill just came due. The Greek government admits its deficit is twice what it reported. Bond markets are in shock. The word 'contagion' starts appearing in every headline. Could an entire country go bankrupt? Could it spread to Italy, Spain, Portugal? Your CHF 100,000 is about to face a very different kind of crisis -- not a bank collapse, but a sovereign debt spiral."

**AI Narrator -- "Whatever It Takes"**:
> "July 26th, 2012. Mario Draghi, President of the European Central Bank, steps up to a microphone in London and says three words that will save the Euro: 'Whatever it takes.' That's it. Three words. The bond markets reverse. Stock markets surge. Two years of crisis, ended by a sentence. The lesson here is profound: markets are driven by confidence, not just numbers. Draghi didn't announce a specific policy -- he announced a commitment. And the market believed him."

**Educational lesson**: Currency risk, sovereign debt, the power of central bank intervention, and the difference between a liquidity crisis and a solvency crisis.

---

### Era 3: The Long Bull Run (January 2013 -- January 2020)

**Data range**: Jan 1, 2013 -- Jan 31, 2020 (approximately 370 weeks)

**Key events and decision points**:

| Date | Event | Market Impact | Decision Point |
|------|-------|--------------|----------------|
| Jan 2013 | Recovery momentum building | Steady growth | Initial allocation -- risk on or cautious? |
| Jan 2015 | SNB removes EUR/CHF floor | CHF surges 30% | Swiss currency shock |
| Jun 2016 | Brexit vote | Brief sell-off, quick recovery | Hold through political uncertainty? |
| Jan 2018 | "Volmageddon" -- volatility spike | Sharp short-term drop | Rebalance opportunity |
| Dec 2019 | Market at all-time highs | Euphoria building | Take profits or ride the wave? |

**AI Narrator -- Opening**:
> "January 2013. The crises are behind you. The market is about to begin the longest bull run in history -- seven years of almost uninterrupted growth. Sounds easy, right? Just buy and hold. But here's what nobody tells you about bull markets: they're psychologically harder than you think. Every small dip makes you wonder if the next crash is starting. Every new high makes you wonder if you should take profits. The hardest part of investing isn't surviving crashes -- it's staying invested during the good times without getting greedy or getting scared."

**Educational lesson**: The difficulty of staying invested during a bull market, the cost of trying to time the market, and the power of compound returns over long periods.

---

### Era 4: COVID Crash & Recovery (January 2020 -- December 2020)

**Data range**: Jan 1, 2020 -- Dec 31, 2020 (52 weeks)

**Key events and decision points**:

| Date | Event | Market Impact | Decision Point |
|------|-------|--------------|----------------|
| Jan 2020 | Reports of mysterious virus in China | Markets at highs | Initial allocation -- any defensive positioning? |
| Feb 2020 | COVID spreads to Europe | First sell-off begins | Early warning signs |
| Mar 12, 2020 | WHO declares pandemic, markets crash | -30% in 3 weeks | The fastest crash in history |
| Mar 23, 2020 | Market bottom | -34% from peak | Buy the dip? |
| Nov 2020 | Vaccine announced, markets surge | Full recovery + new highs | Rebalance after recovery? |

**AI Narrator -- Opening**:
> "January 2020. The markets are at all-time highs. Unemployment is at historic lows. Life is good. But in a city called Wuhan, in central China, something is happening. A new virus. Hospitals are overwhelmed. The Chinese government is building emergency hospitals in 10 days. The rest of the world is watching, but nobody thinks it will affect them. Your portfolio looks great right now. Enjoy it. You have about six weeks before everything changes."

**AI Narrator -- The Crash**:
> "March 12th, 2020. The World Health Organization just declared COVID-19 a global pandemic. The Dow Jones dropped 2,352 points today -- the largest single-day point drop in history. That's 10% in one day. Trading was halted twice because the sell-off was too fast. Airports are closing. Borders are closing. The world is shutting down. Your portfolio has lost 28% of its value in three weeks. Three. Weeks. This is the fastest market crash in the history of financial markets. Nothing in the history books prepared you for this speed. What do you do?"

**Educational lesson**: Black swan events, the importance of having a plan before a crisis hits, the relationship between crisis severity and recovery speed (the fastest crash led to the fastest recovery).

---

### Era 5: Inflation & Rate Shock (January 2021 -- December 2022)

**Data range**: Jan 1, 2021 -- Dec 31, 2022 (104 weeks)

**Key events and decision points**:

| Date | Event | Market Impact | Decision Point |
|------|-------|--------------|----------------|
| Jan 2021 | Post-COVID stimulus, markets euphoric | Strong growth | Initial allocation -- growth or value? |
| Nov 2021 | Market peak, inflation rising | Equity highs, bond yields rising | Take profits? |
| Jan 2022 | Fed signals aggressive rate hikes | Sell-off begins | Rotate to defensive? |
| Jun 2022 | Bear market officially declared | -20% from peak | Hold, rebalance, or sell? |
| Oct 2022 | Inflation peaks, market bottoms | Recovery begins | Opportunity recognition |

**AI Narrator -- Opening**:
> "January 2021. The pandemic is still raging, but the vaccines are rolling out. Governments have printed trillions of dollars to keep economies alive. Money is essentially free -- interest rates are at zero. The stock market is booming. Everyone is an investor now. Your neighbor is trading meme stocks. Your colleague just made CHF 50,000 on a cryptocurrency you've never heard of. Everything is going up. But there's a number that nobody is paying attention to yet: inflation. It's about to change everything."

**Educational lesson**: The relationship between interest rates, inflation, and asset prices. Why bonds can lose money when rates rise. The difference between nominal and real returns.

---

## 6. User Experience Flow

### Onboarding (First-Time User)

**Screen 1 -- Welcome**:
A dark screen. A small point of yellow light grows into the Time Machine logo. Text fades in:
> "Welcome, Time Traveler."
> "You're about to experience 20 years of financial history. Crashes, recoveries, bubbles, and breakthroughs. You'll make decisions that real investors faced -- and learn whether you would have survived."
> [BEGIN YOUR JOURNEY] -- large yellow button

**Screen 2 -- Time Traveler Aptitude Test (Risk Profile)**:
Instead of a boring risk questionnaire, the app presents 4 quick scenario questions framed as time-travel dilemmas:

1. "Your time machine lands in a market crash. Your portfolio is down 25%. You:" -- (a) Sell everything and wait, (b) Hold and do nothing, (c) Buy more while prices are low
2. "You've been investing for 5 years and your portfolio is up 80%. You:" -- (a) Cash out and celebrate, (b) Stay invested, (c) Invest even more
3. "A friend tells you about a 'guaranteed' investment opportunity. You:" -- (a) Invest heavily, (b) Put in a small amount, (c) Ignore it -- nothing is guaranteed
4. "How would you describe your relationship with money?" -- (a) I never want to lose any of it, (b) I'm okay with some ups and downs, (c) I'm comfortable with big swings for bigger potential gains

Results map to three profiles: **Cautious Navigator** (conservative), **Balanced Explorer** (moderate), **Bold Adventurer** (aggressive). The profile influences the AI's coaching (e.g., a Cautious Navigator who goes all-in on equities gets warned; a Bold Adventurer who's too conservative gets encouraged to take measured risks).

**Screen 3 -- The Time Machine**:
The main interface appears -- the time machine control panel with era destinations.

### In-Game HUD Layout

The phone screen (rendered inside the iPhone frame) is divided into clear zones:

```
+----------------------------------+
|  ERA: 2008 Crisis    Week 34/78  |  <- Era header + progress
|  [===========>-------] 43%      |
+----------------------------------+
|                                  |
|   CHF 78,400  (-21.6%)          |  <- Portfolio value + change
|   [Portfolio sparkline chart]    |
|                                  |
+----------------------------------+
| HEADLINES                        |  <- News ticker (scrolling)
| "Lehman Brothers files..."       |
| "Fed announces emergency rate.." |
+----------------------------------+
|                                  |
| YOUR PORTFOLIO                   |  <- Asset allocation bars
| SMI      ████████░░  35%        |
| Bonds    ██████░░░░  25%        |
| DJIA     ████░░░░░░  18%        |
| Gold     ███░░░░░░░  12%        |
| Cash     ██░░░░░░░░  10%        |
|                                  |
| [REBALANCE]  [HOLD]             |  <- Action buttons
+----------------------------------+
|                                  |
| AI NARRATOR                      |  <- Narrator message area
| "The market just dropped 8%      |
|  this week. Bear Stearns is in   |
|  trouble. Stay focused."         |
|                                  |
+----------------------------------+
| LEADERBOARD (multiplayer only)   |  <- Compact leaderboard
| 1. You       CHF 78,400         |
| 2. Contrarian CHF 81,200        |
| 3. Diamond   CHF 76,900         |
| 4. Panic     CHF 64,100         |
+----------------------------------+
```

### Results / Scoring Screen

After an era completes, the screen transitions to the "Return to Present" animation (time machine spinning forward). The results screen shows:

1. **Hero stat**: Final portfolio value with large animated counter
2. **Score wheel**: Animated circular progress bar showing the overall score (0-100) with the four dimension scores around it
3. **Historical comparison**: "You outperformed X% of real investors during this period"
4. **AI Interview**: Scrollable narrative evaluation (the "exit interview")
5. **Action buttons**: [SHARE CHALLENGE] [PLAY ANOTHER ERA] [VIEW LEADERBOARD]

### Leaderboard

The global leaderboard shows:
- Top scores per era (filterable by era)
- Player's best scores across all eras
- A "Time Traveler Rank" based on cumulative performance (Bronze, Silver, Gold, Platinum, Diamond)
- Friends/room-specific leaderboards for multiplayer sessions

---

## 7. Data Architecture

### Historical CSV Data Mapping

The provided dataset covers daily prices from 2006-present for:
- **5 equity indices**: SMI, EuroStoxx 50, DJIA, Nikkei 225, DAX
- **30 DJIA stocks**: Individual daily prices
- **20 SMI stocks**: Individual daily prices
- **Bonds**: Swiss Bond Index, Global Aggregate Bond Index, 10Y yield
- **FX**: USD/CHF, EUR/CHF
- **Gold**: USD-denominated and CHF-denominated

**Data processing pipeline**:
1. Daily CSV data is loaded into a PostgreSQL database (or SQLite for the hackathon MVP)
2. Daily data is aggregated to weekly data points for game ticks (reducing data volume and smoothing noise)
3. Each era is a defined date range with pre-computed weekly returns for all assets
4. Portfolio value is calculated as: sum of (allocation_weight * asset_return) for each tick

### Historical Event Annotations

A curated JSON file maps dates to historical events:

```json
{
  "2008-09-15": {
    "event": "Lehman Brothers bankruptcy",
    "category": "crisis",
    "severity": 5,
    "assets_affected": ["DJIA", "SMI", "EuroStoxx50", "DAX", "Nikkei"],
    "educational_topic": "systemic_risk",
    "narrator_prompt_hint": "Largest bankruptcy in US history. Global financial system in danger."
  },
  "2020-03-11": {
    "event": "WHO declares COVID-19 pandemic",
    "category": "crisis",
    "severity": 5,
    "assets_affected": ["all"],
    "educational_topic": "black_swan",
    "narrator_prompt_hint": "Fastest market crash in history. Global lockdowns begin."
  }
}
```

Approximately 30-50 annotated events span the full 2006-2026 range. These events serve as decision point triggers and AI narrator context.

### Live Market Data

For Present Day mode, real-time data is sourced from:
- **Primary**: Yahoo Finance API (free, 15-minute delay, sufficient for paper trading)
- **Fallback**: Alpha Vantage (free tier, 5 calls/minute)
- **Stretch goal**: Finnhub WebSocket for true real-time data

Data is fetched server-side (Next.js API routes) and cached for 60 seconds to avoid rate limiting.

### Asset Universe Per Era

Not all assets existed or were relevant in all eras. The asset universe is adjusted per era:

| Asset | 2007-2009 | 2010-2012 | 2013-2020 | 2020 | 2021-2022 |
|-------|-----------|-----------|-----------|------|-----------|
| SMI | Yes | Yes | Yes | Yes | Yes |
| DJIA | Yes | Yes | Yes | Yes | Yes |
| EuroStoxx 50 | Yes | Yes | Yes | Yes | Yes |
| Nikkei 225 | Yes | Yes | Yes | Yes | Yes |
| DAX | Yes | Yes | Yes | Yes | Yes |
| SMI stocks (20) | Yes | Yes | Yes | Yes | Yes |
| DJIA stocks (30) | Yes | Yes | Yes | Yes | Yes |
| Swiss Bond Index | Yes | Yes | Yes | Yes | Yes |
| Global Agg Bond | Yes | Yes | Yes | Yes | Yes |
| Gold (CHF) | Yes | Yes | Yes | Yes | Yes |
| USD/CHF | Yes | Yes | Yes | Yes | Yes |
| EUR/CHF | Yes | Yes | Yes | Yes | Yes |
| Cash (0% return) | Yes | Yes | Yes | Yes | Yes |

For simplicity in the MVP, players choose from asset classes (indices and categories) rather than individual stocks. Advanced mode unlocks individual stock selection.

---

## 8. Technical Architecture

### Next.js App Structure

```
/app
  /page.tsx                    -- Landing / time machine home
  /onboarding
    /page.tsx                  -- Risk profile quiz
  /chronicle
    /[era]/page.tsx            -- Solo gameplay for a specific era
  /battle
    /create/page.tsx           -- Create multiplayer room
    /[roomId]/page.tsx         -- Multiplayer gameplay
    /challenge/[id]/page.tsx   -- Async challenge playthrough
  /present-day
    /page.tsx                  -- Real-time trading mode
  /results
    /[sessionId]/page.tsx      -- End-of-era scoring & evaluation
  /leaderboard
    /page.tsx                  -- Global leaderboard
  /api
    /game
      /create-session.ts       -- Initialize a new game session
      /tick.ts                 -- Advance game state by one tick
      /rebalance.ts            -- Process portfolio rebalance
      /evaluate.ts             -- Trigger AI evaluation
    /multiplayer
      /create-room.ts          -- Create lobby room
      /join-room.ts            -- Join existing room
      /sync.ts                 -- WebSocket handler for sync
    /ai
      /narrate.ts              -- Generate narrator text
      /headlines.ts            -- Generate news headlines
      /evaluate.ts             -- Generate end-of-era evaluation
      /bot-dialogue.ts         -- Generate bot personality dialogue
    /market
      /live.ts                 -- Fetch live market data
      /historical.ts           -- Fetch historical data for an era
    /challenge
      /create.ts               -- Generate shareable challenge link
      /load.ts                 -- Load challenge data
/lib
  /data
    /historical.ts             -- Historical data loader and processor
    /events.json               -- Annotated historical events
    /eras.ts                   -- Era definitions and configuration
  /game
    /engine.ts                 -- Core game loop logic
    /portfolio.ts              -- Portfolio calculation and tracking
    /scoring.ts                -- Score calculation (4 dimensions)
    /bots.ts                   -- Bot strategy implementations
  /ai
    /prompts.ts                -- System prompts for all AI roles
    /narrator.ts               -- Narrator API wrapper
    /judge.ts                  -- Judge evaluation logic
  /multiplayer
    /room.ts                   -- Room state management
    /sync.ts                   -- Real-time sync logic
/components
  /time-machine                -- Time machine UI components
  /portfolio                   -- Portfolio display and management
  /narrator                    -- AI narrator message display
  /leaderboard                 -- Leaderboard components
  /charts                      -- Price charts and sparklines
  /headlines                   -- News ticker component
```

### Backend: API Routes and Database

**Database**: PostgreSQL via Prisma ORM (or SQLite for hackathon speed).

**Key tables**:
- `users` -- Player profiles and risk profiles
- `game_sessions` -- Active and completed game sessions (era, start time, current tick, portfolio state)
- `portfolio_snapshots` -- Portfolio state at each tick (for replay and scoring)
- `trades` -- Every trade/rebalance the player made (for behavioral analysis)
- `rooms` -- Multiplayer room state
- `scores` -- Final scores per session (for leaderboards)
- `challenges` -- Async challenge definitions (era, score, decisions)

For the hackathon MVP, SQLite with Prisma is sufficient. No need for a hosted database -- everything runs locally or on Vercel's edge.

### Real-Time: WebSocket for Multiplayer Sync

Multiplayer synchronization uses **Pusher** or **Ably** (managed WebSocket services that work with serverless deployments):

- Host creates a room, gets a channel ID
- All players subscribe to the channel
- The host's client drives the game clock and broadcasts tick events
- Each tick event includes: current date, asset prices, whether a decision point is active
- Player actions (rebalance, hold) are sent back to the channel for leaderboard updates

For the hackathon, **Pusher's free tier** (200 concurrent connections, 100,000 messages/day) is more than sufficient.

### OpenAI API Integration Pattern

All AI calls go through a central wrapper (`/lib/ai/narrator.ts`) that handles:
- Rate limiting (queue requests, max 3 concurrent)
- Caching (identical prompts return cached responses)
- Error handling (graceful fallback to pre-written text if API is down)
- Token tracking (monitor usage, warn if approaching limits)

**API call pattern**:
```typescript
async function generateNarration(context: NarrationContext): Promise<string> {
  const systemPrompt = buildSystemPrompt(context.role, context.era);
  const userPrompt = buildUserPrompt(context.event, context.portfolio, context.playerHistory);

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    max_tokens: context.maxTokens || 250,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}
```

### State Management

**Client-side**: Zustand for lightweight global state:
- `gameStore` -- Current game session state (era, tick, portfolio, score)
- `playerStore` -- Player profile, risk profile, settings
- `multiplayerStore` -- Room state, connected players, sync status

**Server-side**: Game state is persisted to the database after every decision point (not every tick -- that would be too many writes). Portfolio value at each tick is computed client-side from the historical data.

### Deployment Strategy

- **Vercel** for Next.js hosting (free tier for hackathon)
- **Vercel Postgres** or **Turso** (SQLite on the edge) for database
- **Pusher** free tier for WebSocket
- **OpenAI API** with team API key
- **Domain**: Custom subdomain or Vercel default URL

Build and deploy in under 2 minutes via Vercel Git integration.

---

## 9. Pitch Strategy

### How to Demo This in 5 Minutes

The demo follows a narrative arc that mirrors the product itself:

**Minute 0:00 -- 0:30: The Problem**
"50% of adults never invest. Not because they can't -- because they're afraid. They've never experienced a market crash and survived it. They've never felt what it's like to hold through a crisis and come out the other side. Until now."

**Minute 0:30 -- 1:00: The Solution**
"Time Machine lets you travel through financial history. You don't read about the 2008 crisis -- you live through it. An AI narrator guides you like a documentary host. You make real decisions with real historical data. And at the end, an AI judge tells you how you did compared to what real investors actually did."

**Minute 1:00 -- 3:30: Live Demo -- The 2008 Crisis**
Walk through a compressed version of the 2008 era:
- Show the time machine interface, select the 2008 crisis
- Show the AI narrator setting the scene (read the opening narration aloud)
- Show the portfolio builder, make allocations
- Fast-forward to the Lehman moment -- show the headlines, the portfolio drop, the AI narrator's dramatic description
- Make a decision (hold) -- show the AI's response
- Skip to the end -- show the scoring screen, the AI's evaluation
- Show the score breakdown: "You outperformed 87% of real investors"

**Minute 3:30 -- 4:15: Multiplayer Demo**
- Show the QR code lobby
- Show 3 players + 3 AI bots on the leaderboard
- Show the Panic Seller's dialogue during a crash ("I'm OUT!")
- Show the async challenge share link

**Minute 4:15 -- 5:00: Why This Wins**
"We didn't build a stock market simulator. We built a time machine that teaches you to invest by making you feel what real investors felt. The AI doesn't just give tips -- it tells the story of financial history and makes you the protagonist. Every lesson is anchored to a real event. Every score is compared to real investor behavior. This is how you turn 50% of non-investors into confident beginners."

### Key Emotional Moments to Highlight

1. **The Lehman moment**: When the AI describes the collapse and your portfolio drops 25% in real time. The player feels the fear. This is the educational core -- experiencing the emotion that causes bad decisions.
2. **The exit interview**: When the AI tells you "You held through the worst month. 92% of real investors didn't." This is the reward -- the player learns they have better instincts than they thought.
3. **The Panic Seller losing**: Seeing the AI bot that represents the most common investor mistake consistently finish last is visceral proof that panic selling is wrong.

### How This Scores Against Each Judging Criterion

| Criterion | Weight | Why We Score High |
|-----------|--------|------------------|
| **Creativity** | 25% | Time-travel documentary metaphor is completely unique. AI narrator as documentary host. Historical archetype bots. Exit interview mechanic. None of this exists in any finance app. |
| **Visual Design** | 20% | Cinematic time machine interface + Duolingo-bold gamification. PostFinance yellow as accent. Clear HUD layout. Dramatic era selection screen. |
| **Feasibility** | 20% | Next.js + OpenAI API + 20 years of provided data. No exotic infrastructure. Core gameplay loop (select era, build portfolio, play through ticks, score) is straightforward to implement. |
| **Reachability** | 15% | QR code joins for events. Async challenge links for viral sharing. Phone-first design. Onboarding in 30 seconds. Perfect for workshops, school visits, bank events. |
| **Learning Impact** | 20% | Every lesson is tied to real history. Scoring rewards behavior, not returns. AI explains WHY. Historical comparison makes lessons concrete. Discourages gambling by scoring against discipline metrics. |

---

## 10. What Makes This Extraordinary

### Learning Through Lived Experience, Not Lectures

The fundamental problem with financial education is that it's abstract. "Diversification reduces risk" is a sentence. Watching your diversified portfolio lose only 15% while the SMI loses 35% during the 2008 crisis is an experience. Time Machine converts sentences into experiences.

The educational research is clear: experiential learning produces deeper, longer-lasting understanding than passive instruction. Time Machine is experiential learning applied to finance.

### Historical Empathy

One of the most powerful outcomes of Time Machine is historical empathy -- understanding why people panic-sold in 2008, why they overinvested in 2021, why they froze during COVID. When you experience the same emotions (even in a compressed, gamified form), you develop compassion for past mistakes and awareness of your own biases.

This is not just education -- it is behavioral training. The player doesn't just learn that panic selling is bad. They experience the urge to panic sell, resist it (or don't), and see the consequences. That visceral experience is worth more than a hundred lectures.

### "You vs. History" as a Unique Mechanic

The scoring comparison to real historical investor behavior is a mechanic that does not exist in any other finance app. It transforms the game from "did I make money?" to "did I behave better than most people?" This reframing is critical because it teaches the right lesson: **good investing is about behavior, not brilliance**.

When the AI tells you "You held through the crash -- 73% of real investors didn't," it does two things:
1. It validates the player's decision (positive reinforcement)
2. It teaches a statistical truth about investor behavior (education)

This dual function -- validation and education in a single sentence -- is the secret weapon of the Time Machine design.

### Documentary Production Quality

The AI narrator transforms raw data into compelling storytelling. This is not a chatbot giving tips. This is a documentary host guiding you through history with dramatic pacing, vivid descriptions, and emotional resonance.

The quality of the narration is what separates Time Machine from every other gamified finance tool. Duolingo made language learning feel like a game. Time Machine makes investment education feel like a documentary you play through. That shift in framing -- from "educational tool" to "interactive documentary" -- is what makes this concept extraordinary.

The combination of real historical data, AI-powered storytelling, behavioral scoring, and multiplayer competition creates something that is genuinely new in the intersection of education and fintech. It is not just a better stock market game. It is a new category: **playable financial history**.

---

*End of Design Document*

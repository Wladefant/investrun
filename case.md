# Wealth Manager Arena: The Investing Game

**PostFinance**

PostFinance is one of Switzerland's leading financial institutions and a fully owned subsidiary of Swiss Post. It serves around 2.4 million private and business customers, with a strong focus on making everyday banking simple and accessible.

PostFinance offers payments, savings, investments, retirement planning, and financing solutions, and operates as a FINMA-regulated bank with a Swiss banking licence.

---

## Description

Too many adults never start investing even though long-term investing is one of the most important paths to building wealth. The challenge is to create "Wealth Manager Arena: The Investing Game (Bull vs Bear Edition)": a playable, gamified investment education prototype that helps beginners learn core principles (risk profiling, diversification, long-term thinking, asset classes, and handling volatility) without risking real money.

Your goal is to make investing feel safe to try, engaging to learn, and realistic enough to correct common misconceptions (e.g., investing = short-term gambling).

---

## Deep Dive

### What you're building (MVP expectations)

#### Self-learning Sandbox (must-have)

- Users create a portfolio from a predefined, realistic asset universe (selected by your team).
- Users choose asset allocation (e.g., equities vs bonds vs gold vs cash), ideally tied to a simple risk profile (e.g., cautious/balanced/growth).
- The game simulates performance through accelerated time (e.g., "years in minutes") so users experience long-term effects quickly.
- The user must experience at least one market phase change (e.g., bull → crash → recovery) and see what it does to their portfolio and emotions/decisions.

#### Learning feedback + scoring (must-have)

- The game explains outcomes in simple language (why diversification helped/hurt, what drawdowns are, why long-term matters).
- Scoring should reward good investing behavior (risk-appropriate allocation, diversification, staying invested, avoiding panic moves) and discourage gambling (overtrading, all-in bets).

#### Battle Mode / Multiplayer (nice-to-have, but "ideal")

- Same mechanics as sandbox, but competitive: person vs person or team vs team.
- Include a leaderboard and an event-friendly join flow (e.g., code/QR).

---

### Data (keep it lightweight)

You may use either:

#### Small historical dataset (subset is enough), e.g.

- equity indices (SMI, Euro Stoxx 50, Dow Jones)
- a few single stocks
- bonds (bond index or 10Y yield proxy)
- currencies (USD/CHF, EUR/CHF)
- gold
- optional: BTC/ETH

-> A corresponding dataset covering the past 20 years can be provided by PostFinance.

#### OR

#### A synthetic/simulated market dataset (recommended if it saves time)

- random walk / regime switching / Monte Carlo with realistic volatility and crash phases

Add short educational snippets and optional "news/event cards" (rate shock, crisis, inflation spike) that trigger phase changes and explain what's happening.

---

### Tech (suggested, not required)

- Any web/mobile stack is fine as long as it's demoable with UI + charts.
- A lightweight backend/database is recommended for game state + scoring + leaderboards.
- For multiplayer, consider Firebase / WebSockets.
- Optional: LLM-based "investment coach" and/or QR onboarding for events.

---

### Demo/pitch expectations (what you should show)

- The beginner problem → your solution
- Portfolio building + time-accelerated simulation
- At least one market phase change and the learning outcome
- Scoring/feedback loop
- Optional: Battle Mode + leaderboard

---

## Contact Persons / Mentors

- philipp.merkt@postfinance.ch

---

## Judging Criteria

- **Creativity (25%):** original concept, engaging mechanics, smart learning design
- **Visual design (20%):** clear beginner-friendly UI/UX, strong visuals and charts
- **Feasibility (20%):** MVP completeness, robustness, works live within hackathon scope
- **Reachability (15%):** easy onboarding, suitable for workshops/events, realistic adoption
- **Learning impact & realism (20%):** teaches core principles (risk profile, diversification, long-term), explains volatility simply, discourages gambling behavior

---

## Prize

**1. Prize**

THE WINNING TEAM RECEIVES REAL SWISS GOLD: EACH TEAM MEMBER GETS AN EXCLUSIVE 20 CHF "GOLDVRENELI" GOLD COIN (NON-CASH PRIZE; VALUE APPROX. CHF 720 PER PERSON AS OF 23.01.2026)

---

## Links

**GitHub Repository with Data**
https://github.com/adriank71/PostFinance-START-Hack-202...

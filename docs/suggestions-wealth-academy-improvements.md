# Wealth Academy: Gap Analysis & Improvement Suggestions

> Cross-referencing `case.md` and `Challenge.md` requirements against the current implementation.
> Goal: identify every gap that could cost us points across the 5 judging criteria.

---

## Executive Summary

The Wealth Academy has strong bones: 6 playable missions, a clear progression, polished UI in several missions, and a compelling narrative (Professor Fortuna). But it currently falls short of the case requirements in several critical areas:

1. **Mission 7 (Graduation / DNA Report) is a stub** — the climactic payoff is missing
2. **No data continuity between missions** — risk profile from Mission 1 is never reused
3. **All market data is hardcoded** — no randomness, no real market data, no Monte Carlo
4. **No multiplayer / Battle Mode** — the "ideal" feature from the case is absent
5. **No event-friendly onboarding** (QR join, quick-start flow)
6. **Feedback is shallow** — outcomes aren't explained in "simple language" as required

---

## Judging Criteria Alignment

### 1. Creativity (25%) — Current: Strong | Risk: Medium

**What we do well:**
- Professor Fortuna AI coach concept is distinctive
- 7-mission narrative arc is original
- Investment DNA personality system is creative
- Arena with named AI bot opponents is engaging

**Gaps to close:**
- [ ] **Wire up Mission 7 + DNA Report.** The `DNAReport.tsx` component exists on disk but is orphaned — never imported or rendered. This is the single most creative element (shareable personality card with radar chart) and it's literally not connected. **Priority: CRITICAL.**
- [ ] **Make the DNA Report actually aggregate all mission data.** Currently Mission 1 produces a `riskArchetype` but nothing else reads it. The DNA Report should synthesize: risk profile (M1), diversification skill (M2), emotional discipline (M3), long-term thinking (M4), client advisory skill (M5), competitive performance (M6). This transforms it from a gimmick to genuine personalized insight.
- [ ] **News/event cards during simulations.** The case specifically mentions "news/event cards (rate shock, crisis, inflation spike) that trigger phase changes and explain what's happening." Mission 3 has a news ticker but Missions 2 and 6 run silently with no narrative context for why markets move.

### 2. Visual Design (20%) — Current: Strong | Risk: Low

**What we do well:**
- Mission 3 (COVID crash) has excellent emotional design with dark theme, red gradients, animated charts
- Mission 6 (Arena) has a polished leaderboard with rank-change indicators and podium
- Framer Motion animations throughout

**Gaps to close:**
- [ ] **Add a chart to Mission 4's personal planner phase.** The planner shows numbers but no visualization — a missed opportunity since every other mission has charts. A simple projected growth area chart keyed to the slider values would make this much stronger.
- [ ] **Mission 5 needs outcome visualization.** Currently it's pure allocation-matching against hidden "correct" bands. Show what Maria's House Fund and Retirement Fund would actually be worth with the player's allocation over 5 and 30 years respectively. A simple projected outcome bar or growth line makes the feedback tangible.
- [ ] **Consistent dark/light theming.** Missions 3 and 6 use a dark theme (`#0F1419`) while others use the default light theme. Consider standardizing or making the theme shift feel intentional (dark = high-stakes moments).

### 3. Feasibility (20%) — Current: Medium | Risk: High

**What we do well:**
- 6 of 7 missions are playable end-to-end
- No backend dependency — runs entirely client-side
- Clean component architecture

**Gaps to close:**
- [ ] **Fix Mission 6 stale-closure bugs.** `startArena` and `resumeArena` capture `participants` and `currentYear` state at call time, creating a stale-closure problem. If the component re-renders between setup and simulation tick, the arena may run with wrong initial state or reset to an earlier year. Fix: use `useRef` for mutable simulation state, or move simulation logic into a `useReducer`.
- [ ] **Fix Mission 3's `getAdjustedValue()` bug.** The sell logic only checks the first decision point's value for the "sold" case, ignoring which decision point the player actually sold at. A judge who sells at decision 2 but not decision 1 will see incorrect portfolio values.
- [ ] **Fix Mission 4's random scoring.** `base + Math.random() * 16` means getting the quiz right can produce a lower score than getting it wrong. Replace with deterministic scoring.
- [ ] **Fix Mission 5's slider normalization.** Integer rounding in the proportional redistribution can produce allocations summing to 99 or 101. Use a largest-remainder method or keep floating point until display.
- [ ] **Complete Mission 7.** A stub with "Demo Mode" text and a random score generator will immediately undermine feasibility perception. Even a simplified version of the DNA Report is better than a placeholder.

### 4. Reachability (15%) — Current: Weak | Risk: Very High

**What we do well:**
- Web-based, no install needed
- Linear mission flow is easy to follow

**Gaps to close:**
- [ ] **QR code / event join flow.** The case explicitly mentions "event-friendly join flow (e.g., code/QR)" and Challenge.md lists "easy onboarding (e.g. quick start / QR join)" as a judging sub-criterion. We have zero onboarding. Add: a simple landing screen with a "Start Learning" button and a QR code that links to the app URL. Even if it's just a deep-link, the QR visual in the demo signals "event-ready."
- [ ] **Quick-start path.** Currently the user must go through enrollment and then missions sequentially. For an event/workshop context, add a "Quick Demo" mode that drops the user into Mission 6 (The Arena) or Mission 3 (Crash Simulator) directly — the two most visually impressive and self-contained experiences.
- [ ] **Mobile responsiveness.** Verify that all missions work on mobile viewports. Sliders and charts are notoriously tricky on mobile. If the demo is meant for "schools and youth programs" and "public events," people will use phones.
- [ ] **Workshop/event mode.** Challenge.md emphasizes "event-ready usability" and "works for beginners." Consider a facilitator view or at minimum a way for multiple people to play simultaneously (even just independent sessions) with a shared leaderboard.

### 5. Learning Impact & Realism (20%) — Current: Medium | Risk: High

**What we do well:**
- Covers all 5 required concepts: risk profiling (M1), diversification (M2), dealing with volatility (M3), long-term investing (M4), asset classes (M5)
- Professor Fortuna provides contextual commentary
- Scoring rewards good behavior in most missions

**Gaps to close:**
- [ ] **Explain outcomes in simple language.** This is a must-have from case.md: "The game explains outcomes in simple language (why diversification helped/hurt, what drawdowns are, why long-term matters)." Current debrief screens show scores and brief Professor comments, but don't actually explain the financial concepts. After Mission 2, explain: "Your portfolio dropped 15% instead of 25% because bonds and gold held steady while stocks fell — that's diversification working." After Mission 3, explain what a drawdown is and why recovery takes longer than the crash.
- [ ] **Connect risk profile to portfolio advice.** Mission 1 produces a risk archetype but it's never referenced again. In Mission 2, default the allocation sliders based on the player's risk profile. In Mission 4, set planner defaults to match their profile. In Mission 5, note when the player's advice to Maria conflicts with their own risk style. This creates a coherent learning journey.
- [ ] **Discourage gambling behavior explicitly.** Case.md requires scoring that "discourages gambling (overtrading, all-in bets)." Mission 6 penalizes panic selling but doesn't penalize going 100% into one asset class on initial allocation. Mission 2 checks HHI but the consequence is just a lower score — add explicit Professor commentary: "Going all-in on stocks is speculation, not investing. Let's see what happens..."
- [ ] **Add market phase changes to the sandbox.** Case.md must-have: "The user must experience at least one market phase change (e.g., bull → crash → recovery) and see what it does to their portfolio." Mission 3 does this for COVID specifically, but the general sandbox experience (Mission 2) runs a single crash-then-recovery with no explanation of market phases. Label the phases explicitly: "Year 1: Bull Market," "Year 2: Market Crash," "Year 3: Recovery" with brief explanations of each.
- [ ] **Use more realistic/varied market data.** Everything is hardcoded constants. Even simple Monte Carlo (random walk with regime switching) would make each playthrough feel different and more realistic. The case suggests this: "random walk / regime switching / Monte Carlo with realistic volatility and crash phases." At minimum, add some randomness to the return values so two playthroughs don't produce identical charts.

---

## Priority Tiers

### Tier 1: Must Fix (blocks winning)
| Item | Mission | Effort | Impact |
|------|---------|--------|--------|
| Wire up Mission 7 + DNAReport.tsx | M7 | Small | Huge — completes the arc |
| Aggregate all mission data into DNA Report | M7 | Medium | Huge — proves learning journey |
| Add simple financial concept explanations to debriefs | All | Medium | High — directly scored |
| Fix stale-closure bugs in Arena | M6 | Small | High — demo could break |
| Fix getAdjustedValue() sell logic | M3 | Small | Medium — incorrect numbers |
| QR code for event onboarding (even just a URL QR) | Global | Small | High — directly scored criterion |

### Tier 2: Should Fix (significant point improvement)
| Item | Mission | Effort | Impact |
|------|---------|--------|--------|
| Connect risk profile across missions | M1→All | Medium | High — coherent journey |
| News/event cards during simulations | M2, M6 | Medium | Medium — creativity + realism |
| Add randomness to market simulations | M2, M6 | Medium | Medium — realism |
| Explicit market phase labels | M2, M6 | Small | Medium — learning impact |
| Add chart to M4 planner | M4 | Small | Medium — visual design |
| Fix random scoring in M4 quiz | M4 | Tiny | Small — but embarrassing if noticed |
| Anti-gambling commentary for concentrated portfolios | M2, M6 | Small | Medium — directly required |

### Tier 3: Nice to Have (polish for judges)
| Item | Mission | Effort | Impact |
|------|---------|--------|--------|
| Quick Demo mode for events | Global | Medium | Medium — reachability |
| Mobile responsiveness audit | All | Medium | Medium — reachability |
| Outcome visualization for Mission 5 (Maria) | M5 | Medium | Medium — visual + learning |
| Consistent theming across missions | All | Medium | Low — aesthetic |
| Workshop/facilitator mode | Global | Large | Medium — reachability |
| Fix M5 slider normalization rounding | M5 | Small | Low — edge case |

---

## Top 5 Highest-ROI Changes

If time is limited, these 5 changes maximize score improvement per hour of effort:

1. **Wire up DNAReport.tsx as Mission 7** — It exists, it just needs to be imported and connected. Aggregate scores from all missions. This completes the entire narrative arc and is the most memorable demo moment. (~1-2 hours)

2. **Add 2-3 sentence concept explanations to every mission debrief** — After each mission, explain the financial concept in plain English. "Here's what you just learned and why it matters." This directly hits 20% of the judging criteria. (~1-2 hours)

3. **Fix the Arena closure bugs** — A simulation that produces wrong numbers during a live demo is catastrophic. Use `useRef` for mutable simulation state. (~30 min)

4. **Add a QR code to the landing page** — Generate a QR code that links to the deployed URL. Display it prominently. In the pitch, say "anyone can join by scanning this." Instant reachability points. (~15 min)

5. **Connect the risk profile forward** — After Mission 1, use the archetype to set default allocations in Mission 2 and default planner settings in Mission 4. Add a "Based on your risk profile..." line. This makes the whole thing feel like a coherent personalized journey rather than 7 disconnected mini-games. (~1-2 hours)

---

## What the Case Asks For vs. What We Have

| Case Requirement | Status | Notes |
|-----------------|--------|-------|
| Portfolio building from predefined assets | Done | M2, M5, M6 |
| Asset allocation tied to risk profile | Partial | M1 produces profile but M2/M5/M6 don't use it |
| Time-accelerated simulation | Done | M2, M4, M6 |
| At least one market phase change | Done | M3 (COVID), M6 (crash at year 3) |
| Learning feedback in simple language | Weak | Professor comments exist but don't explain concepts |
| Scoring rewards good behavior | Done | All missions score appropriately |
| Scoring discourages gambling | Partial | HHI in M2/M6, but no explicit anti-gambling feedback |
| Battle Mode / multiplayer | Missing | M6 has AI bots but no human-vs-human |
| Leaderboard | Partial | M6 has leaderboard vs bots, not persistent/shared |
| Event-friendly join flow (QR) | Missing | No QR, no quick-start |
| News/event cards | Partial | M3 has news ticker, others don't |
| Educational text snippets | Partial | Professor comments, but no standalone concept explanations |
| LLM-based investment coach | Conceptual | Professor Fortuna exists as UI but is not LLM-powered |
| Playable demo | Yes | 6 of 7 missions work, M7 is stub |

---

## Multiplayer: Realistic Options

The case lists multiplayer as "nice-to-have, but ideal." Building real-time multiplayer in a hackathon is hard. Pragmatic options ranked by effort:

1. **Fake it with shared Arena (lowest effort):** Pre-populate the Arena leaderboard with "other players" (actually the AI bots, renamed to human-sounding names). Visually indistinguishable from multiplayer.

2. **Async multiplayer (medium effort):** After a player completes the Arena, save their final score + allocation to a shared leaderboard (localStorage for demo, or a simple API). Next player sees previous scores. No real-time sync needed.

3. **QR-join lobby with synchronized start (high effort):** Use WebSockets (Partykit, as in the design doc) for a lobby where 2-4 players join via QR, then run Mission 6 simultaneously with a shared leaderboard. High impact but likely 4-6 hours of work.

Recommendation: Option 2 gives 80% of the visual impact for 20% of the effort. A persistent leaderboard that shows "other players who completed the Academy" is sufficient for the demo and pitch.

---

## Professor Fortuna: From Static to Dynamic

Currently Professor Fortuna is hardcoded strings. The case mentions "LLM-based investment coach" as optional. Options:

1. **Keep static but improve quality (0 effort, high ROI):** The current commentary is decent but generic. Rewrite key lines to reference the player's actual numbers: "Your portfolio dropped 18% — but a 100% stocks portfolio would have dropped 32%. Your bond allocation saved you CHF 1,400."

2. **Add OpenAI API calls for debrief summaries (medium effort):** After each mission, send the player's decisions + scores to GPT with a system prompt and display a personalized paragraph. This is the "wow" moment in the pitch. Even a single API call at Mission 7 for the DNA Report narrative would be impactful.

3. **Voice TTS (low-medium effort):** The design doc mentions TTS. Even a single voiced line at enrollment ("Welcome to the Academy, cadet") using the Web Speech API would be memorable.

Recommendation: Option 1 is free and makes every mission feel more personalized. Option 2 for the DNA Report narrative alone is high-impact and scoped.

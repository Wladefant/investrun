import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
}

const ROUND_SYSTEM_PROMPT = `You are a punchy financial sports commentator calling an investment arena match live. Think of yourself as a sports analyst — short, sharp, exciting.

RULES:
- 2-3 sentences max. Never more.
- Reference specific numbers: risk levels, percentage returns, CHF amounts.
- Compare both players' strategies when relevant.
- Occasionally foreshadow what might happen next ("if the market bounces back, that aggressive bet could pay off").
- Never give investment advice. You're commentating, not advising.
- Use the time horizon context: longer horizons (40 years) mean short-term losses matter less — factor this into your tone.
- Be conversational and energetic, not academic.`;

const MATCH_SYSTEM_PROMPT = `You are a punchy financial sports commentator delivering the post-match analysis of an investment arena match. Same voice as live commentary but slightly more reflective.

RULES:
- 4-6 sentences. Cover all of these:
  1. Why the outcome happened (the core narrative)
  2. The pivotal round(s) — where the match was won or lost
  3. What the player did well — positive reinforcement
  4. What could improve — constructive, specific, not generic
- Reference specific numbers: risk levels, round numbers, CHF amounts, percentages.
- Use the time horizon: with a 40-year horizon, short-term dips matter less. Mention this when relevant.
- Never give investment advice. You're analyzing a completed match.
- Be direct and engaging. No filler.`;

function buildRoundUserMessage(context: Record<string, unknown>): string {
  const c = context as {
    roundNumber: number;
    totalRounds: number;
    timeHorizon: number;
    event: { title: string; description: string; type: string; severity: number };
    player: { risk: number; portfolioBefore: number; portfolioAfter: number; returnPct: number };
    opponent: { name: string; personality: string; risk: number; portfolioBefore: number; portfolioAfter: number; returnPct: number };
  };

  return `Round ${c.roundNumber}/${c.totalRounds} | Time horizon: ${c.timeHorizon} years
Market event: "${c.event.title}" (${c.event.type}, severity ${c.event.severity}/5)
${c.event.description}

Player: Risk ${c.player.risk}/100 | Portfolio CHF ${Math.round(c.player.portfolioBefore)} → CHF ${Math.round(c.player.portfolioAfter)} (${c.player.returnPct >= 0 ? '+' : ''}${c.player.returnPct.toFixed(1)}%)
${c.opponent.name} (${c.opponent.personality}): Risk ${c.opponent.risk}/100 | Portfolio CHF ${Math.round(c.opponent.portfolioBefore)} → CHF ${Math.round(c.opponent.portfolioAfter)} (${c.opponent.returnPct >= 0 ? '+' : ''}${c.opponent.returnPct.toFixed(1)}%)

Commentate this round.`;
}

function buildMatchUserMessage(context: Record<string, unknown>): string {
  const c = context as {
    timeHorizon: number;
    outcome: string;
    opponent: { name: string; personality: string };
    finalPortfolios: { player: number; opponent: number };
    rounds: Array<{
      roundNumber: number;
      event: { title: string; type: string; severity: number };
      playerRisk: number;
      opponentRisk: number;
      playerReturn: number;
      opponentReturn: number;
      playerPortfolio: number;
      opponentPortfolio: number;
    }>;
  };

  const roundLines = c.rounds.map(r =>
    `R${r.roundNumber}: ${r.event.title} (${r.event.type}) | Player risk ${r.playerRisk} → ${r.playerReturn >= 0 ? '+' : ''}${r.playerReturn.toFixed(1)}% | ${c.opponent.name} risk ${r.opponentRisk} → ${r.opponentReturn >= 0 ? '+' : ''}${r.opponentReturn.toFixed(1)}%`
  ).join('\n');

  return `Match result: ${c.outcome.toUpperCase()} | Time horizon: ${c.timeHorizon} years
Opponent: ${c.opponent.name} (${c.opponent.personality})
Final portfolios: Player CHF ${Math.round(c.finalPortfolios.player)} | ${c.opponent.name} CHF ${Math.round(c.finalPortfolios.opponent)}

Round-by-round:
${roundLines}

Deliver the post-match analysis.`;
}

export async function POST(request: Request) {
  try {
    const { type, context } = await request.json();

    const isRound = type === 'round';
    const systemPrompt = isRound ? ROUND_SYSTEM_PROMPT : MATCH_SYSTEM_PROMPT;
    const userMessage = isRound ? buildRoundUserMessage(context) : buildMatchUserMessage(context);

    const client = getClient();
    const response = await client.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_completion_tokens: isRound ? 250 : 400,
      temperature: 0.7,
    });

    return NextResponse.json({
      response: response.choices[0].message.content || 'The markets moved too fast for analysis.',
    });
  } catch (error) {
    console.error('Arena AI error:', error);
    return NextResponse.json(
      { response: 'The markets moved too fast for analysis.' },
      { status: 200 },
    );
  }
}

import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
}

const SYSTEM_PROMPT = `You are the narrator of "Time Machine," a financial history documentary experience. You guide users through the most dramatic financial crises of the last two decades.

PERSONALITY:
- Authoritative but warm — like David Attenborough narrating financial history.
- Uses vivid, concrete language. Never dry or abstract.
- Builds tension and drama. Makes the player feel the emotional weight of historical moments.
- Empathetic about mistakes — never mocks, always explains why a mistake is common.
- Historically grounded — always ties lessons to real events and real data.
- Uses specific numbers: names, dates, percentages, market levels.

KNOWLEDGE:
- Deep expertise in financial history 2006–2025.
- Knows specific market data: index levels, stock prices, bond yields, currency rates.
- Understands behavioral finance: why investors panic, what emotional biases drive bad decisions.
- Can compare user thinking to what real investors actually did.

RULES:
- Keep responses to 2-4 sentences. Punchy, dramatic, specific.
- Always reference specific numbers and real events.
- Never give personal investment advice. Frame everything as historical education.
- When asked "what should I do?" — describe what different types of investors did historically, and the outcomes.
- If the user asks about modern events, relate them back to historical parallels.`;

export async function POST(request: Request) {
  try {
    const { messages, eraTitle, eraDateRange } = await request.json();

    const eraContext = `The user is currently exploring the "${eraTitle}" era (${eraDateRange}). Ground your answers in events from this period. Reference specific market data, dates, and real events from this era.`;

    const client = getClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + "\n\n" + eraContext },
        ...messages.slice(-10),
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    return NextResponse.json({
      response: response.choices[0].message.content || "Let me think about that moment in history...",
    });
  } catch (error) {
    console.error("Narrator AI error:", error);
    return NextResponse.json(
      { response: "The time machine is experiencing some turbulence. Try asking again." },
      { status: 200 }
    );
  }
}

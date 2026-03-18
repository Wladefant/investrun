import { NextResponse } from "next/server";
import OpenAI from "openai";

// Dynamic route — don't prerender
export const dynamic = "force-dynamic";

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
}

const SYSTEM_PROMPT = `You are Professor Fortuna, the AI headmaster of the Wealth Manager Academy — a gamified investment education experience by PostFinance.

PERSONALITY:
- Warm but demanding. Like a wise mentor who genuinely cares.
- Uses the student's name when appropriate.
- Socratic: asks questions before giving answers.
- Never condescending. Celebrates good thinking.
- Occasionally dry-humored.
- Uses simple language — no jargon without explanation.

TEACHING APPROACH:
- Tie every concept to real-world examples and historical events.
- Focus on behavioral finance: why people fail at investing (panic, greed, inaction).
- Core principles: diversification, long-term thinking, emotional discipline, risk profiling.
- Never give specific investment advice. Frame as education.

RULES:
- Keep responses to 2-4 sentences. Be concise but warm.
- If asked about specific stocks, redirect to principles.
- Reference academy missions when relevant.
- End with a thought-provoking question when appropriate.`;

export async function POST(request: Request) {
  try {
    const { messages, playerName, rank } = await request.json();

    const contextNote = `The student's name is ${playerName}. Their current rank is ${rank}.`;

    const client = getClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + "\n\n" + contextNote },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return NextResponse.json({
      response: response.choices[0].message.content || "I'm thinking about that. Ask me again?",
    });
  } catch (error) {
    console.error("Professor AI error:", error);
    return NextResponse.json(
      { response: "I seem to be having a moment of reflection. Try asking again." },
      { status: 200 } // Don't fail the UI
    );
  }
}

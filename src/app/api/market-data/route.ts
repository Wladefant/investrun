import { NextResponse } from "next/server";
import { loadMarketData, sampleWeekly } from "@/lib/market-data";
import path from "path";

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    const daily = await loadMarketData(dataDir);
    const weekly = sampleWeekly(daily);

    return NextResponse.json({
      totalDays: daily.length,
      totalWeeks: weekly.length,
      startDate: weekly[0]?.date,
      endDate: weekly[weekly.length - 1]?.date,
      data: weekly,
    });
  } catch (error) {
    console.error("Failed to load market data:", error);
    return NextResponse.json(
      { error: "Failed to load market data" },
      { status: 500 }
    );
  }
}

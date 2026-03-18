/** Load and process historical market data from CSV files */

export interface AssetCategory {
  id: string;
  label: string;
  icon: string;
  dataKey: string; // column name in CSV
  source: string; // CSV filename
}

export const ASSET_CATEGORIES: AssetCategory[] = [
  {
    id: "swiss_stocks",
    label: "Swiss Market",
    icon: "🇨🇭",
    dataKey: "SMI (Price Return)",
    source: "Market_Data - Equity Indices.csv",
  },
  {
    id: "us_stocks",
    label: "US Market",
    icon: "🇺🇸",
    dataKey: "Dow Jones Industrial Average Index  (Price Return)",
    source: "Market_Data - Equity Indices.csv",
  },
  {
    id: "eu_stocks",
    label: "European Market",
    icon: "🇪🇺",
    dataKey: "EuroStoxx 50  (Price Return)",
    source: "Market_Data - Equity Indices.csv",
  },
  {
    id: "bonds",
    label: "Bonds",
    icon: "🛡️",
    dataKey: "Swiss Bond AAA-BBB (Total Return Index)",
    source: "Market_Data - Bonds.csv",
  },
  {
    id: "gold",
    label: "Gold",
    icon: "🥇",
    dataKey: "in CHF",
    source: "Market_Data - Gold.csv",
  },
  {
    id: "cash",
    label: "Cash",
    icon: "💵",
    dataKey: "__cash__",
    source: "__none__",
  },
];

export interface DailyPrice {
  date: string; // ISO format
  values: Record<string, number>; // assetId -> price
}

/**
 * Parse a European-formatted number like "  7,917.1 " into a float.
 * Handles both "7,917.1" (comma = thousands) and "7917.1" formats.
 */
function parseEuropeanNumber(raw: string): number {
  const cleaned = raw.trim().replace(/"/g, "").trim();
  if (!cleaned || cleaned === "#N/A" || cleaned === "N/A") return NaN;
  // Remove spaces, then handle comma as thousands separator
  const normalized = cleaned.replace(/\s/g, "").replace(/,/g, "");
  return parseFloat(normalized);
}

/**
 * Parse a date string like "17/2/2006" into ISO format.
 */
function parseDate(raw: string): string {
  const parts = raw.trim().split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * Load all market data and return unified daily prices.
 * This runs on the server side (API route or build time).
 */
export async function loadMarketData(
  dataDir: string
): Promise<DailyPrice[]> {
  const fs = await import("fs");
  const path = await import("path");

  // We'll build a map: date -> { assetId: price }
  const dateMap = new Map<string, Record<string, number>>();

  // Load equity indices
  const equityPath = path.join(dataDir, "Market_Data - Equity Indices.csv");
  const equityContent = fs.readFileSync(equityPath, "utf-8");
  const equityLines = equityContent.split("\n");
  const equityHeaders = equityLines[0].split(",").map((h) => h.trim());

  for (let i = 1; i < equityLines.length; i++) {
    const line = equityLines[i];
    if (!line.trim()) continue;
    // Split by comma, but respect quoted values
    const values = splitCSVLine(line);
    const date = parseDate(values[0]);
    if (!date) continue;

    if (!dateMap.has(date)) dateMap.set(date, {});
    const row = dateMap.get(date)!;

    // SMI
    const smi = parseEuropeanNumber(values[1]);
    if (!isNaN(smi)) row.swiss_stocks = smi;

    // EuroStoxx 50
    const euro = parseEuropeanNumber(values[2]);
    if (!isNaN(euro)) row.eu_stocks = euro;

    // DJIA
    const djia = parseEuropeanNumber(values[3]);
    if (!isNaN(djia)) row.us_stocks = djia;
  }

  // Load gold
  const goldPath = path.join(dataDir, "Market_Data - Gold.csv");
  const goldContent = fs.readFileSync(goldPath, "utf-8");
  const goldLines = goldContent.split("\n");

  for (let i = 1; i < goldLines.length; i++) {
    const line = goldLines[i];
    if (!line.trim()) continue;
    const values = splitCSVLine(line);
    const date = parseDate(values[0]);
    if (!date) continue;

    if (!dateMap.has(date)) dateMap.set(date, {});
    const row = dateMap.get(date)!;

    const goldChf = parseEuropeanNumber(values[2]);
    if (!isNaN(goldChf)) row.gold = goldChf;
  }

  // Load bonds
  const bondPath = path.join(dataDir, "Market_Data - Bonds.csv");
  const bondContent = fs.readFileSync(bondPath, "utf-8");
  const bondLines = bondContent.split("\n");

  for (let i = 1; i < bondLines.length; i++) {
    const line = bondLines[i];
    if (!line.trim()) continue;
    const values = splitCSVLine(line);
    const date = parseDate(values[0]);
    if (!date) continue;

    if (!dateMap.has(date)) dateMap.set(date, {});
    const row = dateMap.get(date)!;

    const bondIdx = parseEuropeanNumber(values[1]);
    if (!isNaN(bondIdx)) row.bonds = bondIdx;
  }

  // Sort by date and fill forward missing values
  const sortedDates = Array.from(dateMap.keys()).sort();
  const result: DailyPrice[] = [];
  let lastValues: Record<string, number> = {};

  for (const date of sortedDates) {
    const raw = dateMap.get(date)!;
    const filled: Record<string, number> = { ...lastValues, ...raw };
    // Cash grows at 0.5% annually = ~0.00137% daily
    filled.cash = (lastValues.cash ?? 100) * 1.0000137;
    lastValues = filled;

    // Only include dates where we have at least SMI and DJIA
    if (filled.swiss_stocks && filled.us_stocks) {
      result.push({ date, values: { ...filled } });
    }
  }

  return result;
}

/**
 * Split a CSV line respecting quoted fields with commas inside.
 */
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Sample daily data down to weekly for simulation ticks.
 * Takes every 5th trading day.
 */
export function sampleWeekly(daily: DailyPrice[]): DailyPrice[] {
  return daily.filter((_, i) => i % 5 === 0);
}

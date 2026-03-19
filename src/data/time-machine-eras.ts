// Time Machine historical eras — based on the Time Machine design spec
// Each era represents a key period in financial history (2006–2026)

export interface TimelineEvent {
  date: string;
  title: string;
  impact: string;
  severity: 1 | 2 | 3 | 4 | 5;
}

export interface MarketImpact {
  name: string;
  change: string;
  isPositive: boolean;
}

export interface HistoricalEra {
  id: string;
  title: string;
  tagline: string;
  dateRange: string;
  startYear: number;
  endYear: number;
  emoji: string;
  color: string; // tailwind gradient from color
  accentHex: string; // for inline styles
  narratorOpening: string;
  keyLesson: string;
  events: TimelineEvent[];
  headlines: string[];
  marketBreakdown: MarketImpact[];
  stats: {
    peakDrop: string;
    recoveryTime: string;
    keyAsset: string;
  };
}

export const TIME_MACHINE_ERAS: HistoricalEra[] = [
  {
    id: 'gfc-2008',
    title: 'The Great Financial Crisis',
    tagline: 'The day the banks broke',
    dateRange: 'Sep 2007 – Mar 2009',
    startYear: 2007,
    endYear: 2009,
    emoji: '🏦',
    color: 'from-red-900 to-red-600',
    accentHex: '#dc2626',
    narratorOpening:
      "October 2007. The Dow Jones just broke 14,000. Swiss banks are posting record profits. Then Bear Stearns collapses — bought by JPMorgan for $2 a share, down from $170. Lehman Brothers follows: the largest bankruptcy in American history. The S&P 500 plunges 57% from peak to trough. The SMI crashes 53%. Bank stocks are obliterated — UBS loses 75% of its value, Citigroup drops 95%. Only bonds (+8%) and gold (+25%) survive. Credit markets freeze. The Fed slashes rates to zero. CHF 100,000 is on the line.",
    keyLesson:
      'The power of staying invested through a crisis. Investors who held from the peak to the bottom and stayed invested recovered fully by 2012 and doubled their money by 2014. Panic sellers locked in losses of 50%+.',
    events: [
      { date: 'Oct 2007', title: 'DJIA hits all-time high (14,164)', impact: 'Peak euphoria', severity: 1 },
      { date: 'Mar 2008', title: 'Bear Stearns collapses — JPMorgan buys at $2/share', impact: 'S&P 500 down 10%', severity: 3 },
      { date: 'Sep 15, 2008', title: 'Lehman Brothers files for bankruptcy', impact: 'DJIA drops 504 pts in one day', severity: 5 },
      { date: 'Oct 2008', title: 'Global panic — circuit breakers triggered', impact: 'S&P 500 down 40% from peak', severity: 5 },
      { date: 'Mar 2009', title: 'Market bottom — DJIA hits 6,547', impact: 'Down 54% — the nadir', severity: 4 },
    ],
    headlines: [
      'LEHMAN BROTHERS FILES FOR BANKRUPTCY — Largest in US history',
      'DOW PLUNGES 777 POINTS — Biggest single-day drop since 9/11',
      "Fed slashes rates to ZERO — 'Extraordinary times call for extraordinary measures'",
      'UBS reports CHF 21 billion loss — Swiss banking in crisis',
    ],
    marketBreakdown: [
      { name: 'S&P 500', change: '-57%', isPositive: false },
      { name: 'SMI', change: '-53%', isPositive: false },
      { name: 'Bank stocks', change: '-85%', isPositive: false },
      { name: 'Gold', change: '+25%', isPositive: true },
      { name: 'US Treasuries', change: '+14%', isPositive: true },
      { name: 'EUR/CHF', change: '-10%', isPositive: false },
    ],
    stats: { peakDrop: '-57%', recoveryTime: '4 years', keyAsset: 'Bonds & Gold' },
  },
  {
    id: 'euro-debt',
    title: 'European Debt Crisis',
    tagline: 'When nations go bankrupt',
    dateRange: 'Apr 2010 – Jul 2012',
    startYear: 2010,
    endYear: 2012,
    emoji: '🇪🇺',
    color: 'from-blue-900 to-blue-600',
    accentHex: '#2563eb',
    narratorOpening:
      "April 2010. Greece admits its deficit is double what it reported. Greek 10-year bond yields spike from 4% to 35%. The EuroStoxx 50 drops 22%. Italian and Spanish bank stocks collapse 40–60%. The Swiss franc surges — EUR/CHF falls from 1.50 to near parity, forcing the SNB to set a floor at 1.20. German bunds rally as safe haven capital floods in. Only when Draghi says 'whatever it takes' in July 2012 do markets stabilize. Your CHF 100,000 faces a sovereign debt storm.",
    keyLesson:
      'Currency risk, sovereign debt, and the power of central bank intervention. Three words from Mario Draghi ended a two-year crisis. Markets are driven by confidence, not just numbers.',
    events: [
      { date: 'Apr 2010', title: 'Greece requests EU/IMF bailout', impact: 'Greek bonds crash to junk', severity: 3 },
      { date: 'May 2010', title: 'Flash crash — Dow drops 1,000 pts in minutes', impact: 'EUR/CHF falls sharply', severity: 4 },
      { date: 'Aug 2011', title: 'US debt ceiling crisis + European contagion', impact: 'S&P 500 drops 19%', severity: 4 },
      { date: 'Sep 2011', title: 'SNB sets EUR/CHF floor at 1.20', impact: 'CHF pegged to Euro', severity: 3 },
      { date: 'Jul 2012', title: 'Draghi: "Whatever it takes"', impact: 'Bond spreads collapse, recovery starts', severity: 2 },
    ],
    headlines: [
      'GREEK 10-YEAR YIELDS HIT 35% — Bankruptcy imminent',
      'FLASH CRASH: Dow plunges 1,000 points in 5 minutes, recovers',
      'SNB INTERVENES — Swiss franc pegged at 1.20 to Euro',
      'DRAGHI: "Whatever it takes" — Three words that saved the Euro',
    ],
    marketBreakdown: [
      { name: 'EuroStoxx 50', change: '-22%', isPositive: false },
      { name: 'Greek stocks', change: '-72%', isPositive: false },
      { name: 'Italian banks', change: '-60%', isPositive: false },
      { name: 'German bunds', change: '+12%', isPositive: true },
      { name: 'Gold', change: '+30%', isPositive: true },
      { name: 'EUR/CHF', change: '-20%', isPositive: false },
    ],
    stats: { peakDrop: '-22%', recoveryTime: '2 years', keyAsset: 'Swiss Franc' },
  },
  {
    id: 'bull-run',
    title: 'The Long Bull Run',
    tagline: 'Seven years of easy money',
    dateRange: 'Jan 2013 – Jan 2020',
    startYear: 2013,
    endYear: 2020,
    emoji: '🐂',
    color: 'from-emerald-900 to-emerald-600',
    accentHex: '#059669',
    narratorOpening:
      "January 2013. The longest bull run in history begins. Over seven years, the S&P 500 gains 230%. The Nasdaq surges 320%, powered by Apple, Amazon, Google, and Facebook — each crossing $1 trillion market cap. The SMI gains 55%. But it's not smooth: in January 2015, the SNB shocks the world by removing the EUR/CHF floor — the franc surges 30% in minutes, wiping out Swiss exporters. Brexit causes a brief 8% drop. 'Volmageddon' in 2018 destroys volatility-selling funds overnight. Easy money — but only if you stay in.",
    keyLesson:
      'The cost of trying to time the market. An investor who stayed in the S&P 500 from 2013–2020 tripled their money. Missing just the 10 best days would have cut returns by 50%.',
    events: [
      { date: 'Jan 2013', title: 'S&P 500 breaks above pre-crisis highs', impact: 'Full recovery confirmed', severity: 1 },
      { date: 'Jan 2015', title: 'SNB removes EUR/CHF floor', impact: 'CHF surges 30% in minutes', severity: 5 },
      { date: 'Jun 2016', title: 'Brexit vote shocks markets', impact: 'FTSE drops 8%, recovers in 3 days', severity: 3 },
      { date: 'Jan 2018', title: '"Volmageddon" — VIX spikes 115% in 1 day', impact: 'XIV ETN loses 96% overnight', severity: 3 },
      { date: 'Dec 2019', title: 'S&P 500 hits record high at 3,230', impact: 'Market up 230% since 2013', severity: 1 },
    ],
    headlines: [
      'S&P 500 TRIPLES since crisis low — longest bull run in history',
      'SNB SHOCKS WORLD — Franc surges 30%, brokers wiped out',
      'APPLE HITS $1 TRILLION — First US company to reach milestone',
      'VOLMAGEDDON: Volatility ETN loses 96% in a single session',
    ],
    marketBreakdown: [
      { name: 'S&P 500', change: '+230%', isPositive: true },
      { name: 'Nasdaq', change: '+320%', isPositive: true },
      { name: 'SMI', change: '+55%', isPositive: true },
      { name: 'FAANG stocks', change: '+500%', isPositive: true },
      { name: 'Gold', change: '+18%', isPositive: true },
      { name: 'Bonds', change: '+15%', isPositive: true },
    ],
    stats: { peakDrop: '-15%', recoveryTime: 'Weeks', keyAsset: 'US Tech' },
  },
  {
    id: 'covid-2020',
    title: 'COVID Crash & Recovery',
    tagline: 'The fastest crash in history',
    dateRange: 'Jan 2020 – Dec 2020',
    startYear: 2020,
    endYear: 2020,
    emoji: '🦠',
    color: 'from-purple-900 to-purple-600',
    accentHex: '#7c3aed',
    narratorOpening:
      "March 12, 2020. The WHO declares COVID-19 a pandemic. The Dow drops 2,352 points — the largest single-day point drop ever. Trading halted twice. In just 23 trading days, the S&P 500 falls 34%. Airlines crash 65%. Cruise lines lose 80%. Oil goes NEGATIVE — futures hit -$37. But tech stocks tell a different story: Zoom surges 400%, Amazon gains 76%. The Fed injects $3 trillion. By August, the Nasdaq hits a new all-time high. The fastest crash leads to the fastest recovery. In 12 months, the market is up 75% from the bottom.",
    keyLesson:
      'Black swan events are impossible to predict but possible to survive. The fastest crash in history produced the fastest recovery. Airlines lost 65% while Zoom gained 400% — diversification was the difference between ruin and opportunity.',
    events: [
      { date: 'Jan 2020', title: 'Virus reports from China — markets shrug', impact: 'S&P 500 at all-time high', severity: 1 },
      { date: 'Feb 24, 2020', title: 'Italy locks down — panic begins', impact: 'S&P 500 drops 12% in 4 days', severity: 3 },
      { date: 'Mar 12, 2020', title: 'WHO declares pandemic', impact: 'Dow drops 2,352 pts, trading halted', severity: 5 },
      { date: 'Mar 23, 2020', title: 'Market bottom — S&P 500 at 2,237', impact: 'Down 34% from peak in 23 days', severity: 5 },
      { date: 'Aug 2020', title: 'Nasdaq hits new all-time high', impact: 'Tech-led recovery, up 60% from low', severity: 1 },
    ],
    headlines: [
      'DOW DROPS 2,352 POINTS — Largest single-day point drop in history',
      'OIL GOES NEGATIVE — Crude futures hit minus $37 per barrel',
      'ZOOM STOCK UP 400% — Video calls replace the office',
      'FED INJECTS $3 TRILLION — Most aggressive stimulus ever',
    ],
    marketBreakdown: [
      { name: 'S&P 500', change: '-34%', isPositive: false },
      { name: 'Airlines', change: '-65%', isPositive: false },
      { name: 'Cruise lines', change: '-80%', isPositive: false },
      { name: 'Oil (WTI)', change: '-305%', isPositive: false },
      { name: 'Zoom Video', change: '+400%', isPositive: true },
      { name: 'Amazon', change: '+76%', isPositive: true },
    ],
    stats: { peakDrop: '-34%', recoveryTime: '5 months', keyAsset: 'Tech stocks' },
  },
  {
    id: 'inflation-2022',
    title: 'Inflation & Rate Shock',
    tagline: 'When free money ends',
    dateRange: 'Jan 2021 – Dec 2022',
    startYear: 2021,
    endYear: 2022,
    emoji: '📈',
    color: 'from-orange-900 to-orange-600',
    accentHex: '#ea580c',
    narratorOpening:
      "January 2021. Meme stocks explode — GameStop surges 1,700% in two weeks. Bitcoin hits $69,000. ARK Innovation ETF doubles. Then inflation arrives: US CPI hits 9.1%, the highest in 40 years. The Fed raises rates by 0.75% — most aggressive hike since 1994. The Nasdaq crashes 33%. Growth stocks are decimated: Peloton drops 92%, Meta loses 75%, Zoom falls 88%. Bitcoin collapses 65%. Long-duration bonds — supposed to be safe — lose 18%, their worst year since 1788. Only energy (+59%) and the US dollar survive.",
    keyLesson:
      'When interest rates rise, everything priced on future growth collapses. Bonds can lose money. Crypto is not a hedge. Energy and commodities protect against inflation. The difference between nominal and real returns matters enormously.',
    events: [
      { date: 'Jan 2021', title: 'GameStop mania — Reddit vs. Wall Street', impact: 'GME up 1,700% in 2 weeks', severity: 2 },
      { date: 'Nov 2021', title: 'S&P 500 peaks at 4,797, Bitcoin at $69K', impact: 'Maximum euphoria', severity: 1 },
      { date: 'Jun 2022', title: 'CPI hits 9.1% — Fed hikes 0.75%', impact: 'Nasdaq enters bear market (-33%)', severity: 4 },
      { date: 'Sep 2022', title: 'UK pension crisis — gilts crash', impact: 'Global bond market in freefall', severity: 4 },
      { date: 'Nov 2022', title: 'FTX collapses — crypto contagion', impact: 'Bitcoin hits $15,500 (-77%)', severity: 3 },
    ],
    headlines: [
      'GAMESTOP UP 1,700% — Reddit army squeezes Wall Street short sellers',
      'US INFLATION HITS 9.1% — Highest in 40 years, Fed goes nuclear',
      'NASDAQ CRASHES 33% — Worst year for tech since dot-com bust',
      'FTX COLLAPSES — $32 billion crypto exchange evaporates overnight',
    ],
    marketBreakdown: [
      { name: 'Nasdaq', change: '-33%', isPositive: false },
      { name: 'ARK Innovation', change: '-75%', isPositive: false },
      { name: 'Bitcoin', change: '-65%', isPositive: false },
      { name: 'Long bonds', change: '-18%', isPositive: false },
      { name: 'Energy sector', change: '+59%', isPositive: true },
      { name: 'US Dollar', change: '+15%', isPositive: true },
    ],
    stats: { peakDrop: '-33%', recoveryTime: '1 year', keyAsset: 'Energy & Cash' },
  },
  {
    id: 'full-journey',
    title: 'The Full Journey',
    tagline: 'Two decades. One portfolio. Every crisis.',
    dateRange: 'Jan 2006 – Dec 2025',
    startYear: 2006,
    endYear: 2025,
    emoji: '🌍',
    color: 'from-amber-800 to-yellow-500',
    accentHex: '#FFC800',
    narratorOpening:
      "January 2006. You have CHF 100,000 and twenty years ahead of you. In that time, the S&P 500 will fall 57% and then rise 600%. The Swiss franc will surge 30% in a single day. A pandemic will crash markets 34% in 23 days. Oil will go negative. A meme stock will rise 1,700%. Bitcoin will go from $0 to $69,000 to $15,500 and back to $100,000. Through it all, a diversified portfolio held for the full period would have turned CHF 100,000 into CHF 340,000. The question is: can you hold through the chaos?",
    keyLesson:
      'Long-term thinking beats short-term panic. Through every crisis, the market recovered. A 60/40 portfolio held for 20 years returned ~240%. The investors who succeeded were those who stayed invested, stayed diversified, and stayed disciplined.',
    events: [
      { date: '2007–2009', title: 'Global Financial Crisis', impact: 'S&P 500 loses 57%', severity: 5 },
      { date: '2010–2012', title: 'European Debt Crisis', impact: 'EuroStoxx 50 loses 22%', severity: 4 },
      { date: '2013–2019', title: 'The Great Bull Run', impact: 'S&P 500 gains 230%', severity: 1 },
      { date: '2020', title: 'COVID Pandemic', impact: 'Fastest crash & recovery ever', severity: 5 },
      { date: '2021–2022', title: 'Inflation & Rate Shock', impact: 'Nasdaq loses 33%', severity: 4 },
    ],
    headlines: [
      'TWO DECADES: From Lehman collapse to AI revolution',
      'THROUGH 5 CRISES: -57%, -22%, -34%, -33% — and full recovery every time',
      'THE ULTIMATE TEST: Would you have stayed invested for 20 years?',
      '$100K → $340K: The reward for discipline through chaos',
    ],
    marketBreakdown: [
      { name: 'S&P 500 (total)', change: '+340%', isPositive: true },
      { name: 'SMI (total)', change: '+120%', isPositive: true },
      { name: 'Gold (total)', change: '+280%', isPositive: true },
      { name: 'Bonds (total)', change: '+45%', isPositive: true },
      { name: 'Worst single year', change: '-57%', isPositive: false },
      { name: 'Best single year', change: '+75%', isPositive: true },
    ],
    stats: { peakDrop: '-57%', recoveryTime: '20 years', keyAsset: 'Diversification' },
  },
];

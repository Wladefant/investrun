// Arena leaderboard — mock data with realistic Swiss/European names

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string; // 2-letter initials
  elo: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  wins: number;
  losses: number;
  avgReturn: number; // percentage like 12.5
}

export function getEloBadgeTier(elo: number): LeaderboardEntry['tier'] {
  if (elo >= 1600) return 'diamond';
  if (elo >= 1400) return 'platinum';
  if (elo >= 1200) return 'gold';
  if (elo >= 1000) return 'silver';
  return 'bronze';
}

export const TIER_COLORS: Record<LeaderboardEntry['tier'], string> = {
  bronze:   'hsl(30, 60%, 50%)',
  silver:   'hsl(210, 10%, 60%)',
  gold:     'hsl(45, 90%, 50%)',
  platinum: 'hsl(190, 60%, 55%)',
  diamond:  'hsl(270, 60%, 60%)',
};

// 18 mock entries spanning ELO ~800 to ~1650
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1,  name: 'Natalie Kessler',   avatar: 'NK', elo: 1648, tier: 'diamond',  wins: 142, losses: 28,  avgReturn: 21.4 },
  { rank: 2,  name: 'Finn Holmqvist',    avatar: 'FH', elo: 1621, tier: 'diamond',  wins: 138, losses: 34,  avgReturn: 19.8 },
  { rank: 3,  name: 'Amélie Rousseau',   avatar: 'AR', elo: 1607, tier: 'diamond',  wins: 131, losses: 39,  avgReturn: 18.3 },
  { rank: 4,  name: 'Marco Bernasconi',  avatar: 'MB', elo: 1489, tier: 'platinum', wins: 117, losses: 43,  avgReturn: 16.7 },
  { rank: 5,  name: 'Lea Zimmermann',    avatar: 'LZ', elo: 1453, tier: 'platinum', wins: 109, losses: 51,  avgReturn: 15.2 },
  { rank: 6,  name: 'Stefan Kowalski',   avatar: 'SK', elo: 1412, tier: 'platinum', wins: 103, losses: 58,  avgReturn: 14.1 },
  { rank: 7,  name: 'Chiara Ferretti',   avatar: 'CF', elo: 1378, tier: 'gold',     wins:  96, losses: 62,  avgReturn: 13.5 },
  { rank: 8,  name: 'Jan Veltman',       avatar: 'JV', elo: 1341, tier: 'gold',     wins:  89, losses: 67,  avgReturn: 12.9 },
  { rank: 9,  name: 'Sophie Baumann',    avatar: 'SB', elo: 1304, tier: 'gold',     wins:  82, losses: 74,  avgReturn: 12.0 },
  { rank: 10, name: 'Lukas Meier',       avatar: 'LM', elo: 1267, tier: 'gold',     wins:  78, losses: 80,  avgReturn: 11.3 },
  { rank: 11, name: 'Priya Nair',        avatar: 'PN', elo: 1231, tier: 'gold',     wins:  74, losses: 85,  avgReturn: 10.8 },
  { rank: 12, name: 'David Schmid',      avatar: 'DS', elo: 1198, tier: 'silver',   wins:  68, losses: 91,  avgReturn: 10.1 },
  { rank: 13, name: 'Ines Wüthrich',     avatar: 'IW', elo: 1147, tier: 'silver',   wins:  61, losses: 99,  avgReturn:  9.4 },
  { rank: 14, name: 'Tobias Gruber',     avatar: 'TG', elo: 1089, tier: 'silver',   wins:  55, losses: 108, avgReturn:  8.7 },
  { rank: 15, name: 'Miriam Frei',       avatar: 'MF', elo: 1024, tier: 'silver',   wins:  48, losses: 116, avgReturn:  7.9 },
  { rank: 16, name: 'Reto Blaser',       avatar: 'RB', elo:  964,  tier: 'bronze',  wins:  38, losses: 128, avgReturn:  6.5 },
  { rank: 17, name: 'Hannah Müller',     avatar: 'HM', elo:  892,  tier: 'bronze',  wins:  29, losses: 141, avgReturn:  5.2 },
  { rank: 18, name: 'Cedric Fontaine',   avatar: 'CF', elo:  821,  tier: 'bronze',  wins:  18, losses: 157, avgReturn:  3.8 },
];

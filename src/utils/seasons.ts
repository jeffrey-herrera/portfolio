export type Season = 'spring' | 'summer' | 'fall' | 'winter';

// Meteorological seasons — month abbreviation → season
const MONTH_TO_SEASON: Record<string, Season> = {
  Mar: 'spring', Apr: 'spring', May: 'spring',
  Jun: 'summer', Jul: 'summer', Aug: 'summer',
  Sep: 'fall',   Oct: 'fall',   Nov: 'fall',
  Dec: 'winter', Jan: 'winter', Feb: 'winter',
};

export function getSeason(month: string): Season | null {
  return MONTH_TO_SEASON[month] ?? null;
}

export const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring',
  summer: 'Summer',
  fall:   'Fall',
  winter: 'Winter',
};

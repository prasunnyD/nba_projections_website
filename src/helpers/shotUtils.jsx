// All helpers related to shot normalization, filtering, and aggregation

export const getTeamAbbrFromShot = (shot) => {
  const mu = shot.matchup || shot.MATCHUP || shot.game_matchup || shot.GAME_MATCHUP;
  if (typeof mu === "string") {
    const first = mu.trim().split(/\s+/)[0];
    if (first?.length === 3) return first.toUpperCase();
  }
  const ab = shot.team_abbreviation || shot.TEAM_ABBREVIATION;
  return ab ? String(ab).toUpperCase() : null;
};

export const getOpponentFromShot = (shot) => {
  const mu = shot.matchup || shot.MATCHUP || shot.game_matchup || shot.GAME_MATCHUP;
  const muOpp = typeof mu === "string" ? mu.trim().split(/\s+/).slice(-1)[0] : null;
  return shot.opponent_abbr || shot.OPPONENT_ABBR || shot.opponent || shot.OPPONENT || muOpp || null;
};

export const normalizePct = (v) => {
  if (v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n > 1.0000001 ? n / 100 : n < 0 ? 0 : n;
};

export const filterShots = (allShots, opponent, numGames) => {
  if (!allShots) return [];
  let filtered = [...allShots];
  if (opponent) filtered = filtered.filter((s) => s.opponent === opponent);
  if (numGames !== "All") {
    const n = parseInt(numGames, 10);
    const hasDates = filtered.every((s) => !!s.gameDate);
    filtered = hasDates
      ? [...filtered].sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate)).slice(-n)
      : filtered.slice(-n);
  }
  return filtered;
};

export function formatPct(v) {
  if (v == null || isNaN(v)) return "—";
  return (v * 100).toFixed(1) + "%";
}




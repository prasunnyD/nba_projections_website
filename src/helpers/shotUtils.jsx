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
  // Only filter by opponent if opponent is a non-empty string
  if (opponent && opponent.trim() !== "" && opponent !== "All Opponents") {
    // Try exact match first
    let matched = filtered.filter((s) => s.opponent === opponent);
    
    // If no exact match, try case-insensitive and partial matching
    if (matched.length === 0) {
      const oppLower = opponent.toLowerCase();
      matched = filtered.filter((s) => {
        if (!s.opponent) return false;
        const shotOppLower = s.opponent.toLowerCase();
        // Exact case-insensitive match
        if (shotOppLower === oppLower) return true;
        // Check if opponent name contains the shot opponent (e.g., "Phoenix Suns" contains "Phoenix")
        if (oppLower.includes(shotOppLower) || shotOppLower.includes(oppLower)) return true;
        // Check last word match (e.g., "Phoenix Suns" matches "Suns")
        const oppWords = oppLower.split(/\s+/);
        const shotWords = shotOppLower.split(/\s+/);
        if (oppWords.some(w => shotWords.includes(w)) || shotWords.some(w => oppWords.includes(w))) return true;
        return false;
      });
    }
    
    // Use matched shots (even if empty - this shows "no data" when opponent doesn't match)
    filtered = matched;
  }
  // If opponent is empty or "All Opponents", filtered remains as all shots
  
  if (numGames !== "All") {
    const n = parseInt(numGames, 10);
    const hasDates = filtered.every((s) => !!s.gameDate);
    
    if (hasDates) {
      // Group shots by game date to get unique games
      const gamesMap = new Map();
      filtered.forEach((shot) => {
        const dateKey = shot.gameDate;
        if (!gamesMap.has(dateKey)) {
          gamesMap.set(dateKey, []);
        }
        gamesMap.get(dateKey).push(shot);
      });
      
      // Sort games by date and get last N games
      const sortedGames = Array.from(gamesMap.entries())
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .slice(-n);
      
      // Flatten shots from the last N games
      filtered = sortedGames.flatMap(([_, shots]) => shots);
    } else {
      // Fallback: if no dates, just take last N shots
      filtered = filtered.slice(-n);
    }
  }
  return filtered;
};

export function formatPct(v) {
  if (v == null || isNaN(v)) return "—";
  return (v * 100).toFixed(1) + "%";
}




/**
 * NFL Team Logo Utilities
 * Maps team names to NFL team abbreviations for logo URLs
 */

// NFL Team abbreviation mapping
// Format: { city: abbreviation } or { "City Team": abbreviation }
const nflTeamAbbreviations = {
    // Standard city mappings
    'Arizona': 'ARI',              // Cardinals
    'Atlanta': 'ATL',              // Falcons
    'Baltimore': 'BAL',            // Ravens
    'Buffalo': 'BUF',              // Bills
    'Carolina': 'CAR',             // Panthers
    'Chicago': 'CHI',              // Bears
    'Cincinnati': 'CIN',           // Bengals
    'Cleveland': 'CLE',            // Browns
    'Dallas': 'DAL',               // Cowboys
    'Denver': 'DEN',               // Broncos
    'Detroit': 'DET',              // Lions
    'Houston': 'HOU',              // Texans
    'Indianapolis': 'IND',         // Colts
    'Jacksonville': 'JAX',         // Jaguars
    'Miami': 'MIA',                // Dolphins
    'Minnesota': 'MIN',            // Vikings
    'Pittsburgh': 'PIT',           // Steelers
    'Seattle': 'SEA',              // Seahawks
    'Tennessee': 'TEN',            // Titans
    
    // Special cases - multi-word cities or teams with same city
    'Green Bay': 'GB',             // Packers
    'Kansas City': 'KC',           // Chiefs
    'Las Vegas': 'LV',             // Raiders
    'New England': 'NE',           // Patriots
    'New Orleans': 'NO',          // Saints
    'San Francisco': 'SF',        // 49ers
    'Tampa Bay': 'TB',            // Buccaneers
    'Washington': 'WAS',           // Commanders
    
    // Teams with same city - need full team name
    'Los Angeles Chargers': 'LAC',
    'Los Angeles Rams': 'LAR',
    'New York Giants': 'NYG',
    'New York Jets': 'NYJ',
    
    // Team name mappings (for cases where team name is used)
    'Cardinals': 'ARI',
    'Falcons': 'ATL',
    'Ravens': 'BAL',
    'Bills': 'BUF',
    'Panthers': 'CAR',
    'Bears': 'CHI',
    'Bengals': 'CIN',
    'Browns': 'CLE',
    'Cowboys': 'DAL',
    'Broncos': 'DEN',
    'Lions': 'DET',
    'Packers': 'GB',
    'Texans': 'HOU',
    'Colts': 'IND',
    'Jaguars': 'JAX',
    'Chiefs': 'KC',
    'Raiders': 'LV',
    'Chargers': 'LAC',
    'Rams': 'LAR',
    'Dolphins': 'MIA',
    'Vikings': 'MIN',
    'Patriots': 'NE',
    'Saints': 'NO',
    'Giants': 'NYG',
    'Jets': 'NYJ',
    'Eagles': 'PHI',
    'Steelers': 'PIT',
    '49ers': 'SF',
    'Seahawks': 'SEA',
    'Buccaneers': 'TB',
    'Titans': 'TEN',
    'Commanders': 'WAS'
};

/**
 * Get NFL team abbreviation from team city/name
 * @param {string} teamCity - The team city or name (e.g., "Philadelphia", "Eagles", "Philadelphia Eagles")
 * @returns {string|null} - The NFL team abbreviation or null if not found
 */
export const getTeamAbbreviation = (teamCity) => {
    if (!teamCity) return null;
    
    // Handle LA teams specifically
    if (teamCity.includes('Los Angeles Chargers') || teamCity.includes('Chargers')) {
        return nflTeamAbbreviations['Los Angeles Chargers'];
    }
    if (teamCity.includes('Los Angeles Rams') || (teamCity.includes('Rams') && !teamCity.includes('Chargers'))) {
        return nflTeamAbbreviations['Los Angeles Rams'];
    }
    
    // Handle New York teams specifically
    if (teamCity.includes('New York Giants') || (teamCity.includes('Giants') && !teamCity.includes('Jets'))) {
        return nflTeamAbbreviations['New York Giants'];
    }
    if (teamCity.includes('New York Jets') || (teamCity.includes('Jets') && !teamCity.includes('Giants'))) {
        return nflTeamAbbreviations['New York Jets'];
    }
    
    // Direct lookup
    if (nflTeamAbbreviations[teamCity]) {
        return nflTeamAbbreviations[teamCity];
    }
    
    // Try to match by city name (for cases where teamCity might be "City Team")
    const parts = teamCity.split(' ');
    if (parts.length > 1) {
        // Handle multi-word cities
        if (parts[0] === 'New' && parts[1] === 'York') {
            // Default to Giants if ambiguous
            return nflTeamAbbreviations['New York Giants'];
        }
        if (parts[0] === 'New' && parts[1] === 'England') return nflTeamAbbreviations['New England'];
        if (parts[0] === 'New' && parts[1] === 'Orleans') return nflTeamAbbreviations['New Orleans'];
        if (parts[0] === 'Kansas' && parts[1] === 'City') return nflTeamAbbreviations['Kansas City'];
        if (parts[0] === 'San' && parts[1] === 'Francisco') return nflTeamAbbreviations['San Francisco'];
        if (parts[0] === 'Tampa' && parts[1] === 'Bay') return nflTeamAbbreviations['Tampa Bay'];
        if (parts[0] === 'Green' && parts[1] === 'Bay') return nflTeamAbbreviations['Green Bay'];
        if (parts[0] === 'Las' && parts[1] === 'Vegas') return nflTeamAbbreviations['Las Vegas'];
        if (parts[0] === 'Los' && parts[1] === 'Angeles') {
            // Default to Rams if ambiguous
            return nflTeamAbbreviations['Los Angeles Rams'];
        }
        // For most teams, city is the first word
        const cityName = parts[0];
        if (nflTeamAbbreviations[cityName]) {
            return nflTeamAbbreviations[cityName];
        }
    }
    
    return null;
};

/**
 * Get NFL logo URL for a team
 * @param {string} teamCity - The team city or name (e.g., "Philadelphia", "Eagles", "Philadelphia Eagles")
 * @returns {string|null} - The logo URL or null if team not found
 */
export const getNFLTeamLogoUrl = (teamCity) => {
    const abbreviation = getTeamAbbreviation(teamCity);
    if (!abbreviation) return null;
    
    // NFL CDN logo URL format: https://static.www.nfl.com/t_headshot_tablet_2x/f_auto/league/api/clubs/logos/{ABBREV}
    return `https://static.www.nfl.com/t_headshot_tablet_2x/f_auto/league/api/clubs/logos/${abbreviation}`;
};

/**
 * Get all NFL team abbreviations
 * @returns {Object} - Object mapping city/team names to abbreviations
 */
export const getAllTeamAbbreviations = () => {
    return { ...nflTeamAbbreviations };
};

/**
 * Extract city name from team name for logo lookup
 * Handles various team name formats like "City Team", "Philadelphia Eagles", etc.
 * @param {string} teamName - The team name (e.g., "Philadelphia Eagles", "New York Giants")
 * @returns {string} - The city name for logo lookup
 */
export const getCityForNFLLogo = (teamName) => {
    if (!teamName) return '';
    
    // Handle LA teams
    if (teamName.includes('Los Angeles Chargers') || teamName.includes('Chargers')) {
        return 'Los Angeles Chargers';
    }
    if (teamName.includes('Los Angeles Rams') || (teamName.includes('Rams') && !teamName.includes('Chargers'))) {
        return 'Los Angeles Rams';
    }
    
    // Handle New York teams
    if (teamName.includes('New York Giants') || (teamName.includes('Giants') && !teamName.includes('Jets'))) {
        return 'New York Giants';
    }
    if (teamName.includes('New York Jets') || (teamName.includes('Jets') && !teamName.includes('Giants'))) {
        return 'New York Jets';
    }
    
    // Extract city name (first part before space)
    const parts = teamName.split(' ');
    if (parts.length > 1) {
        // Handle multi-word cities
        if (parts[0] === 'New' && parts[1] === 'York') return 'New York Giants'; // Default
        if (parts[0] === 'New' && parts[1] === 'England') return 'New England';
        if (parts[0] === 'New' && parts[1] === 'Orleans') return 'New Orleans';
        if (parts[0] === 'Kansas' && parts[1] === 'City') return 'Kansas City';
        if (parts[0] === 'San' && parts[1] === 'Francisco') return 'San Francisco';
        if (parts[0] === 'Tampa' && parts[1] === 'Bay') return 'Tampa Bay';
        if (parts[0] === 'Green' && parts[1] === 'Bay') return 'Green Bay';
        if (parts[0] === 'Las' && parts[1] === 'Vegas') return 'Las Vegas';
        if (parts[0] === 'Los' && parts[1] === 'Angeles') return 'Los Angeles Rams'; // Default
        // For most teams, city is the first word
        return parts[0];
    }
    return teamName;
};

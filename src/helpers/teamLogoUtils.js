/**
 * NBA Team Logo Utilities
 * Maps team names to NBA team IDs for logo URLs
 */

// NBA Team ID mapping
// Format: { city: teamId }
const nbaTeamIds = {
    'Atlanta': 1610612737,           // Hawks
    'Boston': 1610612738,            // Celtics
    'Brooklyn': 1610612751,          // Nets
    'Charlotte': 1610612766,         // Hornets
    'Chicago': 1610612741,           // Bulls
    'Cleveland': 1610612739,         // Cavaliers
    'Dallas': 1610612742,            // Mavericks
    'Denver': 1610612743,            // Nuggets
    'Detroit': 1610612765,           // Pistons
    'Golden State': 1610612744,      // Warriors
    'Houston': 1610612745,           // Rockets
    'Indiana': 1610612754,           // Pacers
    'Los Angeles Clippers': 1610612746,  // Clippers
    'Los Angeles Lakers': 1610612747,    // Lakers
    'Memphis': 1610612763,           // Grizzlies
    'Miami': 1610612748,             // Heat
    'Milwaukee': 1610612749,         // Bucks
    'Minnesota': 1610612750,         // Timberwolves
    'New Orleans': 1610612740,       // Pelicans
    'New York': 1610612752,          // Knicks
    'Oklahoma City': 1610612760,     // Thunder
    'Orlando': 1610612753,           // Magic
    'Philadelphia': 1610612755,      // 76ers
    'Phoenix': 1610612756,           // Suns
    'Portland': 1610612757,          // Trail Blazers
    'Sacramento': 1610612758,        // Kings
    'San Antonio': 1610612759,       // Spurs
    'Toronto': 1610612761,           // Raptors
    'Utah': 1610612762,              // Jazz
    'Washington': 1610612764         // Wizards
};

/**
 * Get NBA team ID from team city/name
 * @param {string} teamCity - The team city (e.g., "Atlanta", "Los Angeles Lakers")
 * @returns {number|null} - The NBA team ID or null if not found
 */
export const getTeamId = (teamCity) => {
    if (!teamCity) return null;
    
    // Handle LA teams specifically
    if (teamCity === 'Los Angeles Lakers' || teamCity.includes('Lakers')) {
        return nbaTeamIds['Los Angeles Lakers'];
    }
    if (teamCity === 'Los Angeles Clippers' || teamCity === 'LA Clippers' || teamCity.includes('Clippers')) {
        return nbaTeamIds['Los Angeles Clippers'];
    }
    
    // Direct lookup
    if (nbaTeamIds[teamCity]) {
        return nbaTeamIds[teamCity];
    }
    
    // Try to match by city name (for cases where teamCity might be "City Team")
    const cityName = teamCity.split(' ')[0];
    if (nbaTeamIds[cityName]) {
        return nbaTeamIds[cityName];
    }
    
    return null;
};

/**
 * Get NBA logo URL for a team
 * @param {string} teamCity - The team city (e.g., "Atlanta", "Los Angeles Lakers")
 * @param {string} size - Logo size: 'S' (small), 'M' (medium), 'L' (large). Default: 'L'
 * @returns {string|null} - The logo URL or null if team not found
 */
export const getTeamLogoUrl = (teamCity, size = 'L') => {
    const teamId = getTeamId(teamCity);
    if (!teamId) return null;
    
    // NBA CDN logo URL format: https://cdn.nba.com/logos/nba/{TEAM_ID}/primary/{SIZE}/logo.svg
    return `https://cdn.nba.com/logos/nba/${teamId}/primary/${size}/logo.svg`;
};

/**
 * Get all NBA team IDs
 * @returns {Object} - Object mapping city names to team IDs
 */
export const getAllTeamIds = () => {
    return { ...nbaTeamIds };
};


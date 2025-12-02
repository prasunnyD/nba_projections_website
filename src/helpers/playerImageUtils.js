/**
 * NBA Player Image Utilities
 * Functions to get player headshot URLs from NBA CDN
 */

/**
 * Get NBA player headshot URL
 * @param {number|string} playerId - The NBA player ID
 * @param {string} size - Image size: '260x190' (default), '1040x760', etc.
 * @returns {string|null} - The player headshot URL or null if playerId is invalid
 */
export const getPlayerImageUrl = (playerId, size = '260x190') => {
    if (!playerId) return null;
    
    // NBA CDN headshot URL format: https://cdn.nba.com/headshots/nba/latest/{SIZE}/{PLAYER_ID}.png
    return `https://cdn.nba.com/headshots/nba/latest/${size}/${playerId}.png`;
};

/**
 * Get player ID from roster data by player name
 * @param {string} playerName - The player's name
 * @param {Array} rosterData - The roster data array
 * @returns {number|string|null} - The player ID or null if not found
 */
export const getPlayerIdFromRoster = (playerName, rosterData) => {
    if (!playerName || !rosterData || !Array.isArray(rosterData)) return null;
    
    const player = rosterData.find(p => p.PLAYER === playerName);
    if (player) {
        // Check common field names for player ID
        return player.PLAYER_ID || player.PLAYERID || player.ID || player.player_id || null;
    }
    
    return null;
};

/**
 * Get player image URL from player name and roster data
 * @param {string} playerName - The player's name
 * @param {Array} rosterData - The roster data array
 * @param {string} size - Image size: '260x190' (default)
 * @returns {string|null} - The player headshot URL or null if not found
 */
export const getPlayerImageUrlByName = (playerName, rosterData, size = '260x190') => {
    const playerId = getPlayerIdFromRoster(playerName, rosterData);
    if (!playerId) return null;
    
    return getPlayerImageUrl(playerId, size);
};


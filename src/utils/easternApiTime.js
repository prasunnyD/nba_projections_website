/**
 * INGESTED_AT is UTC. Convert to US Eastern.
 * "2026-11-17T01:00:00Z" → "Nov 16, 2026, 8:00 PM EST"
 */
export function formatUtcAsEastern(raw) {
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
    }).format(parsed);
}

/**
 * Odds ingested_time is US Eastern wall clock; trailing Z is not UTC.
 * "2026-11-17T00:30:00.167819Z" → "Nov 17, 2026, 12:30 AM ET"
 */
export function formatIngestedTimeEastern(raw) {
    const match = String(raw ?? '').trim().match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
    );
    if (!match) return null;
    const [, year, month, day, hour, minute] = match;
    const stamp = new Date(Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
    ));
    const label = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(stamp);
    return `${label} ET`;
}

/**
 * Scoreboard game_time is an ISO timestamp with offset
 * (e.g. 2026-11-12T14:10:00-05:00). Display the UTC clock of that
 * instant, labeled EST (14:10-05:00 → 7:10 PM EST).
 */
export function formatScoreboardGameTime(iso) {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return String(iso ?? '');
    return `${new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(parsed)} EST`;
}

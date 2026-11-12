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

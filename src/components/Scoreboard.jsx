import React, { useState, useEffect } from 'react';
import { api } from '../utils/apiConfig';
import { getTeamLogoUrl, getCityForLogo } from '../helpers/teamLogoUtils';
import { formatScoreboardGameTime } from '../utils/easternApiTime';

const processLegacyTeamName = (city, team) => {
    if (city === 'LA' && team === 'Lakers') return 'Los Angeles Lakers';
    if (city === 'LA' && team === 'Clippers') return 'Los Angeles Clippers';
    return `${city} ${team}`;
};

const formatAmericanOdds = (value) => {
    if (value == null || value === '') return '—';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    return n > 0 ? `+${n}` : String(n);
};

const formatSpreadLine = (spread, price) => {
    if (spread == null) return '—';
    const n = Number(spread);
    const spreadStr = Number.isFinite(n)
        ? (n > 0 ? `+${n}` : String(n))
        : String(spread);
    if (price == null || price === '') return spreadStr;
    return `${spreadStr} (${formatAmericanOdds(price)})`;
};

const formatGameTimeEST = (gameTime) => formatScoreboardGameTime(gameTime);

const normalizeScoreboardGames = (raw) => {
    if (!raw || typeof raw !== 'object') return [];
    const entries = Array.isArray(raw)
        ? raw.map((game, index) => [String(index), game])
        : Object.entries(raw);

    return entries.map(([id, game]) => {
        if (game?.home_team && game?.away_team) {
            return {
                id,
                homeTeam: game.home_team,
                awayTeam: game.away_team,
                gameTime: game.start_time ?? game.game_time ?? null,
                homeMoneyline: game.home_moneyline,
                awayMoneyline: game.away_moneyline,
                homeSpread: game.home_spread,
                homeSpreadPrice: game.home_spread_price,
                awaySpread: game.away_spread,
                awaySpreadPrice: game.away_spread_price,
            };
        }

        const homeTeam = processLegacyTeamName(game.home_city, game.home_team);
        const awayTeam = processLegacyTeamName(game.away_city, game.away_team);
        return {
            id,
            homeTeam,
            awayTeam,
            gameTime: game.start_time ?? game.game_time ?? null,
            homeMoneyline: game.home_moneyline,
            awayMoneyline: game.away_moneyline,
            homeSpread: game.home_spread,
            homeSpreadPrice: game.home_spread_price,
            awaySpread: game.away_spread,
            awaySpreadPrice: game.away_spread_price,
        };
    });
};

const Scoreboard = ({ onGameSelect, onTeamSelect }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null);
    const client = api;

    useEffect(() => {
        const fetchScoreboard = async () => {
            setLoading(true);
            try {
                const response = await client.get('nba/scoreboard');
                setGames(normalizeScoreboardGames(response.data));
                setError(null);
            } catch (err) {
                console.error('API Error:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchScoreboard();
    }, []);

    const handleGameClick = (game) => {
        if (typeof onGameSelect !== 'function') {
            console.error('onGameSelect is not a function');
            return;
        }
        const label = `${game.awayTeam} vs ${game.homeTeam}`;
        setSelectedGame(label);
        onGameSelect(game.homeTeam, game.awayTeam);
    };

    useEffect(() => {
        if (games.length > 0 && !selectedGame && typeof onGameSelect === 'function') {
            const first = games[0];
            setSelectedGame(`${first.awayTeam} vs ${first.homeTeam}`);
            onGameSelect(first.homeTeam, first.awayTeam);
        }
    }, [games, selectedGame, onGameSelect]);

    const handleTeamClick = (teamName) => {
        onTeamSelect(teamName);
    };

    const renderTeamCell = (teamName) => {
        const logoUrl = getTeamLogoUrl(getCityForLogo(teamName), 'L');
        return (
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    handleTeamClick(teamName);
                }}
                className="flex flex-col items-center gap-1 min-w-0 flex-1 cursor-pointer rounded p-1 transition-colors hover:bg-neutral-700/60"
            >
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt={`${teamName} logo`}
                        className="h-8 w-8 flex-shrink-0 object-contain"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : null}
                <span className="text-center text-xs font-medium leading-tight text-gray-200">
                    {teamName}
                </span>
            </button>
        );
    };

    return (
        <div className="relative">
            <div className="scrollmenu mb-4">
                {loading && <p className="text-white">Loading...</p>}
                {error && <p className="text-red-500">Error: {error.message}</p>}
                {games.map((game) => {
                    const label = `${game.awayTeam} vs ${game.homeTeam}`;
                    const isSelected = selectedGame === label;
                    return (
                        <div
                            key={game.id}
                            className={`game-card min-w-[260px] align-top ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleGameClick(game)}
                        >
                            {game.gameTime && (
                                <p className="mb-2 text-center text-xs font-medium text-neutral-400">
                                    {formatGameTimeEST(game.gameTime)}
                                </p>
                            )}

                            <div className="mb-3 flex items-start justify-between gap-2">
                                {renderTeamCell(game.awayTeam)}
                                <span className="pt-6 text-xs text-neutral-500">@</span>
                                {renderTeamCell(game.homeTeam)}
                            </div>

                            <div className="space-y-1.5 border-t border-neutral-600 pt-2 text-xs">
                                <div className="grid grid-cols-[4.5rem_1fr_1fr] items-center gap-2">
                                    <span className="font-medium text-neutral-500">Moneyline</span>
                                    <span className="text-center font-semibold tabular-nums text-emerald-400/90">
                                        {formatAmericanOdds(game.awayMoneyline)}
                                    </span>
                                    <span className="text-center font-semibold tabular-nums text-emerald-400/90">
                                        {formatAmericanOdds(game.homeMoneyline)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[4.5rem_1fr_1fr] items-center gap-2">
                                    <span className="font-medium text-neutral-500">Spread</span>
                                    <span className="text-center font-semibold tabular-nums text-sky-300/90">
                                        {formatSpreadLine(game.awaySpread, game.awaySpreadPrice)}
                                    </span>
                                    <span className="text-center font-semibold tabular-nums text-sky-300/90">
                                        {formatSpreadLine(game.homeSpread, game.homeSpreadPrice)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Scoreboard;

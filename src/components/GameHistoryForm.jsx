import React, { useState } from 'react';

const GameHistoryForm = ({ onSubmit }) => {
    const [playerName, setPlayerName] = useState('');
    const [gameCount, setGameCount] = useState(10);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(playerName, gameCount);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <label htmlFor="playerName" className="block text-sm font-medium mb-1">
                        Player Name
                    </label>
                    <input
                        type="text"
                        id="playerName"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="gameCount" className="block text-sm font-medium mb-1">
                        Number of Games
                    </label>
                    <select
                        id="gameCount"
                        value={gameCount}
                        onChange={(e) => setGameCount(Number(e.target.value))}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value={5}>5 games</option>
                        <option value={10}>10 games</option>
                        <option value={15}>15 games</option>
                        <option value={20}>20 games</option>
                        <option value={30}>30 games</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Show History
                </button>
            </div>
        </form>
    );
};

export default GameHistoryForm; 
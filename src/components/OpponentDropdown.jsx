import React, { useState, useEffect } from "react";

export default function OpponentDropdown({ data, value, onChange }) {
  const [opponents, setOpponents] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      // Extract unique opponents from data (could be shots or passes)
      // Check for different possible field names
      const opponentField = data[0].opponent || data[0].defteam || data[0].opponent_team || data[0].defense;
      
      if (opponentField) {
        const uniqueOpponents = [...new Set(data.map(item => 
          item.opponent || item.defteam || item.opponent_team || item.defense
        ))].filter(Boolean).sort();
        setOpponents(uniqueOpponents);
      } else {
        setOpponents([]);
      }
    } else {
      setOpponents([]);
    }
  }, [data]);

  if (opponents.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center">
      <label className="text-slate-200 text-sm mr-2">Opponent:</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-700 text-white border border-neutral-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Opponents</option>
        {opponents.map((opponent) => (
          <option key={opponent} value={opponent}>
            {opponent}
          </option>
        ))}
      </select>
    </div>
  );
}

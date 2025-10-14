import React, { useState, useEffect } from "react";

export default function OpponentDropdown({ shots, value, onChange }) {
  const [opponents, setOpponents] = useState([]);

  useEffect(() => {
    if (shots && shots.length > 0) {
      // Extract unique opponents from shots data
      const uniqueOpponents = [...new Set(shots.map(shot => shot.opponent))].sort();
      setOpponents(uniqueOpponents);
    } else {
      setOpponents([]);
    }
  }, [shots]);

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

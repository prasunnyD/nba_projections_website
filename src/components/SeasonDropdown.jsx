import { useEffect, useState } from "react";

export default function SeasonDropdown({ playerName, value, onChange }) {
  const [seasons, setSeasons] = useState([]);

  useEffect(() => {
    if (!playerName) { 
      setSeasons([]); 
      return; 
    }
    // Predefined list of seasons from 2024-25 to 2020-21
    const predefinedSeasons = ["2024-25", "2023-24", "2022-23", "2021-22", "2020-21"];
    setSeasons(predefinedSeasons);
    // If current value isn't in the new list, pick the newest
    if (!predefinedSeasons.includes(value)) {
      onChange(predefinedSeasons[0] ?? "");
    }
  }, [playerName, value, onChange]);

  const disabled = !playerName || seasons.length === 0;

  return (
    <div className="flex items-center">
      <label className="text-slate-200 text-sm mr-2">Season:</label>
    <select
      className="bg-neutral-700 text-white border border-neutral-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      {disabled ? (
        <option value="">No seasons</option>
      ) : (
        seasons.map((s) => <option key={s} value={s}>{s}</option>)
      )}
    </select>
    </div>
  );
}

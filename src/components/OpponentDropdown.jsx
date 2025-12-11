import React from "react";

// All NBA teams - using city names to match shot data format
const ALL_NBA_TEAMS = [
  'Atlanta',
  'Boston',
  'Brooklyn',
  'Charlotte',
  'Chicago',
  'Cleveland',
  'Dallas',
  'Denver',
  'Detroit',
  'Golden State',
  'Houston',
  'Indiana',
  'Los Angeles Clippers',
  'Los Angeles Lakers',
  'Memphis',
  'Miami',
  'Milwaukee',
  'Minnesota',
  'New Orleans',
  'New York',
  'Oklahoma City',
  'Orlando',
  'Philadelphia',
  'Phoenix',
  'Portland',
  'Sacramento',
  'San Antonio',
  'Toronto',
  'Utah',
  'Washington'
].sort();

export default function OpponentDropdown({ data, value, onChange }) {
  // Always show all NBA teams, regardless of data
  const opponents = ALL_NBA_TEAMS;

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

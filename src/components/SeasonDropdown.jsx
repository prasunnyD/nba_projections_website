import React from "react";

export default function SeasonDropdown({ playerName, value, onChange, predefinedSeasons }) {
  const disabled = !playerName || !predefinedSeasons?.length;

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
        predefinedSeasons.map((s) => <option key={s} value={s}>{s}</option>)
      )}
    </select>
    </div>
  );
}

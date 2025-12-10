import React from "react";

export default function SeasonDropdown({ playerName, value, onChange, predefinedSeasons }) {
  const disabled = !playerName || !predefinedSeasons?.length;

  return (
    <div className="flex items-center">
      <label className="text-slate-200 text-sm mr-2">Season:</label>
    <select
      className="bg-neutral-700 text-white border border-neutral-600 rounded px-3 py-2 md:py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] appearance-none cursor-pointer hover:bg-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        backgroundImage: disabled ? 'none' : `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.5rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem'
      }}
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

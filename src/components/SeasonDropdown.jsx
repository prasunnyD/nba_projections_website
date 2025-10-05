import { useEffect, useState } from "react";
import { api } from "../utils/apiConfig";

export default function SeasonDropdown({ playerName, value, onChange }) {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!playerName) { setSeasons([]); return; }
    setLoading(true);
    api.get(`/players/${encodeURIComponent(playerName)}/seasons`, {
      params: { max_seasons: 5 },
    })
      .then(res => {
        const list = (res.data?.seasons ?? []).slice(0, 5);
        setSeasons(list);
        // If current value isn’t in the new list, pick the newest
        if (!list.includes(value)) {
          onChange(list[0] ?? "");
        }
      })
      .catch(() => {
        setSeasons([]);
        onChange("");
      })
      .finally(() => setLoading(false));
  }, [playerName]); // eslint-disable-line react-hooks/exhaustive-deps

  const disabled = loading || !playerName || seasons.length === 0;

  return (
    <select
      className="border rounded px-2 py-1 bg-white/90 text-sm"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      {disabled ? (
        <option value="">{loading ? "Loading…" : "No seasons"}</option>
      ) : (
        seasons.map((s) => <option key={s} value={s}>{s}</option>)
      )}
    </select>
  );
}

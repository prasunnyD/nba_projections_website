import { useEffect, useState } from "react";
import { api } from "../utils/apiConfig";

export default function SeasonDropdown({ playerName, value, onChange }) {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!playerName) { setSeasons([]); return; }
    setLoading(true);
    api.get(`/players/${encodeURIComponent(playerName)}/seasons`)
      .then(res => setSeasons(res.data?.seasons ?? []))
      .catch(() => setSeasons([]))
      .finally(() => setLoading(false));
  }, [playerName]);

  return (
    <select
      className="border rounded px-2 py-1 bg-white/90 text-sm"
      value={value || (seasons[0] ?? "")}
      onChange={(e) => onChange(e.target.value)}
      disabled={!playerName || loading}
    >
      {(loading ? ["Loading…"] : seasons).map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

// src/components/ShotChartContainer.jsx
import { useEffect, useState } from "react";
import { api } from "../utils/apiConfig";
import SeasonDropdown from "./SeasonDropdown";
import PlayerShotHexChart from "./PlayerShotHexChart";

export default function ShotChartContainer({ playerName }) {
  const [seasons, setSeasons] = useState([]);
  const [season, setSeason] = useState("");
  const [shots, setShots] = useState(null);
  const [baselineZones, setBaselineZones] = useState(null);
  const [domains, setDomains] = useState({ x: [-25, 25], y: [-5, 47] }); // FEET
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Load up to last 5 seasons for the player
  useEffect(() => {
    if (!playerName) {
      setSeasons([]); setSeason(""); setShots(null); setBaselineZones(null);
      return;
    }
    api.get(`/players/${encodeURIComponent(playerName)}/seasons`, { params: { max_seasons: 5 } })
      .then(res => {
        const list = (res.data?.seasons ?? []).slice(0, 5);
        setSeasons(list);
        // default to most recent
        setSeason(list[0] ?? "");
      })
      .catch(() => { setSeasons([]); setSeason(""); });
  }, [playerName]);

  // When player or season changes, pull shots + baselines
  useEffect(() => {
    if (!playerName || !season) return;

    setLoading(true);
    setErr(null);

    api.get(`/players/${encodeURIComponent(playerName)}/shots`, { params: { season } })
      .then(res => {
        const raw = res.data?.shots ?? [];
        const feetShots = raw.map(s => ({ x: s.x / 10, y: s.y / 10, made: s.made }));
        setShots(feetShots);

        if (res.data?.x_domain && res.data?.y_domain) {
          setDomains({
            x: [res.data.x_domain[0] / 10, res.data.x_domain[1] / 10],
            y: [res.data.y_domain[0] / 10, res.data.y_domain[1] / 10],
          });
        }
      })
      .catch(() => { setErr("No shot data for this selection."); setShots(null); })
      .finally(() => setLoading(false));

    Promise.allSettled([
      api.get("/league/shot-zones", { params: { season } }),
      api.get(`/players/${encodeURIComponent(playerName)}/shot-zones`, { params: { season } }),
    ]).then(([leagueRes, playerRes]) => {
      let zones = null;
      if (leagueRes.status === "fulfilled") zones = leagueRes.value?.data?.zones ?? null;
      if (!zones && playerRes.status === "fulfilled") zones = playerRes.value?.data?.zones ?? null;
      setBaselineZones(zones);
    });
  }, [playerName, season]);

  if (!playerName) {
    return <div className="p-4 text-gray-500 bg-gray-100 rounded-lg">Select a player to view their shot chart.</div>;
  }

  return (
    <>
      {/* Season selector sits directly above the shot map */}
      <div className="mt-6 mb-2 flex items-center justify-end">
        <label className="text-slate-200 text-sm mr-2">Season:</label>
        <SeasonDropdown
          playerName={playerName}
          value={season}
          onChange={setSeason}
        />
      </div>

      <div className="h-[720px]">
        <PlayerShotHexChart
          shots={shots}
          xDomain={domains.x}
          yDomain={domains.y}
          width={720}
          height={720}
          courtImgSrc="/basketball_court.png"
          playerName={playerName}
          seasonLabel={season}
          baselineZones={baselineZones}
          loading={loading}
          error={err}
        />
      </div>
    </>
  );
}

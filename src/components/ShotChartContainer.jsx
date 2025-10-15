// src/components/ShotChartContainer.jsx
import { useEffect, useState } from "react";
import { api } from "../utils/apiConfig";
import SeasonDropdown from "./SeasonDropdown";
import OpponentDropdown from "./OpponentDropdown";
import PlayerShotHexChart from "./PlayerShotHexChart";

export default function ShotChartContainer({ playerName }) {
  const [seasons, setSeasons] = useState([]);
  const [season, setSeason] = useState("");
  const [opponent, setOpponent] = useState("");
  const [allShots, setAllShots] = useState(null); // Store all shots from API
  const [shots, setShots] = useState(null); // Filtered shots for display
  const [baselineZones, setBaselineZones] = useState(null);
  const [domains, setDomains] = useState({ x: [-25, 25], y: [-5, 47] }); // FEET
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Load predefined seasons list
  useEffect(() => {
    if (!playerName) {
      setSeasons([]); setSeason(""); setOpponent(""); setAllShots(null); setShots(null); setBaselineZones(null);
      return;
    }
    // Predefined list of seasons from 2024-25 to 2020-21
    const predefinedSeasons = ["2024-25", "2023-24", "2022-23", "2021-22", "2020-21"];
    setSeasons(predefinedSeasons);
    // default to most recent
    setSeason(predefinedSeasons[0]);
    setOpponent(""); // Reset opponent when player changes
  }, [playerName]);

  // When player or season changes, pull shots + baselines
  useEffect(() => {
    if (!playerName || !season) return;

    setLoading(true);
    setErr(null);

    api.get(`/nba/players-shotchart/${encodeURIComponent(playerName)}/${encodeURIComponent(season)}`)
      .then(res => {
        const raw = res.data?.shots ?? [];
        const feetShots = raw.map(s => ({ 
          x: s.loc_x / 10, 
          y: s.loc_y / 10, 
          made: s.shot_made_flag === 1,
          opponent: s.opponent
        }));
        setAllShots(feetShots);

        // Use default domains since API doesn't provide them
        setDomains({ x: [-25.0, 25.0], y: [-5.0, 47.0] });
      })
      .catch(() => { setErr("No shot data for this selection."); setAllShots(null); setShots(null); })
      .finally(() => setLoading(false));

    api.get(`/nba/players-shotchart/averages/${encodeURIComponent(playerName)}/${encodeURIComponent(season)}`)
      .then(res => {
        const playerStats = res.data?.stats ?? [];
        // Convert player stats to zone format
        const zones = playerStats.map(stat => ({
          shot_zone_basic: stat.shot_zone_basic,
          shot_zone_area: stat.shot_zone_area
        }));
        setBaselineZones(zones);
      })
      .catch(() => {
        // If player averages fail, set zones to null
        setBaselineZones(null);
      });
  }, [playerName, season]);

  // Filter shots by opponent
  useEffect(() => {
    if (!allShots) {
      setShots(null);
      return;
    }

    if (!opponent) {
      // Show all shots if no opponent selected
      setShots(allShots);
    } else {
      // Filter shots by selected opponent
      const filteredShots = allShots.filter(shot => shot.opponent === opponent);
      setShots(filteredShots);
    }
  }, [allShots, opponent]);

  if (!playerName) {
    return <div className="p-4 text-gray-500 bg-gray-100 rounded-lg">Select a player to view their shot chart.</div>;
  }

  return (
    <>
      {/* Season and Opponent selectors sit directly above the shot map */}
      <div className="mt-6 mb-2 flex items-center justify-between">
        <OpponentDropdown
          data={allShots}
          value={opponent}
          onChange={setOpponent}
        />
        <SeasonDropdown
          predefinedSeasons={seasons}
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

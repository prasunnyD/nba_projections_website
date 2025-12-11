import { useEffect, useState } from "react";
import { api } from "../utils/apiConfig";
import SeasonDropdown from "./SeasonDropdown";
import OpponentDropdown from "./OpponentDropdown";
import PlayerShotHexChart from "./PlayerShotHexChart";

import { getTeamAbbrFromShot, getOpponentFromShot, filterShots } from "../helpers/shotUtils";
import { mapZoneTextToRegionId, makeRegionPredicates } from "../helpers/zoneUtils";

// ----------------------------------------------------
// Helper Functions
// ----------------------------------------------------

// Compute fallback per-zone FG% from shots (player-only)
function computeZonesFromShots(shots) {
  const pred = makeRegionPredicates();
  const zones = {
    left_corner_3: { att: 0, made: 0 },
    right_corner_3: { att: 0, made: 0 },
    left_above_3: { att: 0, made: 0 },
    center_above_3: { att: 0, made: 0 },
    right_above_3: { att: 0, made: 0 },
    mid_left: { att: 0, made: 0 },
    mid_center: { att: 0, made: 0 },
    mid_right: { att: 0, made: 0 },
    paint_non_ra: { att: 0, made: 0 },
    restricted_area: { att: 0, made: 0 },
  };

  for (const s of shots || []) {
    for (const [id, fn] of Object.entries(pred)) {
      if (id === "isThree") continue;
      if (fn(s.x, s.y)) {
        zones[id].att += 1;
        zones[id].made += s.made ? 1 : 0;
        break;
      }
    }
  }

  const out = {};
  for (const [id, v] of Object.entries(zones)) {
    if (v.att > 0) out[id] = { fg_pct: v.made / v.att };
  }
  return Object.keys(out).length ? out : null;
}

// ----------------------------------------------------
// Component: ShotChartContainer
// ----------------------------------------------------
export default function ShotChartContainer({ playerName }) {
  const [seasons, setSeasons] = useState([]);
  const [season, setSeason] = useState("");
  const [opponent, setOpponent] = useState("");
  const [numGames, setNumGames] = useState("All");

  const [allShots, setAllShots] = useState(null);
  const [shots, setShots] = useState([]);
  const [baselineZones, setBaselineZones] = useState(null);
  const [playerSeasonZones, setPlayerSeasonZones] = useState(null);
  const [opponentZones, setOpponentZones] = useState(null);

  const [domains] = useState({ x: [-25, 25], y: [-5, 47] });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // ----------------------------------------------------
  // Initialize seasons when player changes
  // ----------------------------------------------------
  useEffect(() => {
    if (!playerName) {
      setSeasons([]);
      setSeason("");
      setOpponent("");
      setAllShots(null);
      setShots([]);
      setBaselineZones(null);
      setPlayerSeasonZones(null);
      setOpponentZones(null);
      return;
    }
    const predefined = ["2025-26"];
    setSeasons(predefined);
    setSeason(predefined[0]);
    // Always start with "All Opponents" (empty string) to show all shots
    setOpponent("");
  }, [playerName]);

  // ----------------------------------------------------
  // Fetch player shots & baseline (league / player avg)
  // ----------------------------------------------------
  useEffect(() => {
    if (!playerName || !season) return;

    let cancelled = false;
    setLoading(true);
    setErr(null);

    // Player shot chart data
    api
      .get(`/nba/players-shotchart/${encodeURIComponent(playerName)}/${encodeURIComponent(season)}`)
      .then((res) => {
        if (cancelled) return;
        
        // Extract shots array from various possible response structures
        const raw = 
          res.data?.data?.shots || 
          res.data?.shots || 
          (Array.isArray(res.data) ? res.data : res.data?.data) || 
          [];
        
        const mapped = raw.map((shot) => ({
          x: typeof shot.loc_x === "number" ? shot.loc_x / 10 : (typeof shot.LOC_X === "number" ? shot.LOC_X / 10 : 0),
          y: typeof shot.loc_y === "number" ? shot.loc_y / 10 : (typeof shot.LOC_Y === "number" ? shot.LOC_Y / 10 : 0),
          made: (shot.shot_made_flag === 1 || shot.shot_made_flag === true || shot.SHOT_MADE_FLAG === 1),
          opponent: getOpponentFromShot(shot),
          teamAbbr: getTeamAbbrFromShot(shot),
          gameDate: shot.game_date || shot.GAME_DATE || shot.GameDate || null,
          gameId: shot.game_id || shot.GAME_ID || shot.GameId || null,
        }));

        setAllShots(mapped);
        // Fallback for tooltip baseline if league avg missing
        setPlayerSeasonZones(computeZonesFromShots(mapped));
      })
      .catch(() => {
        if (!cancelled) {
          setErr("No shot data for this selection.");
          setAllShots(null);
          setShots([]);
          setPlayerSeasonZones(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Baseline league average zones
    api
      .get(`/nba/players-shotchart/averages/${encodeURIComponent(playerName)}/${encodeURIComponent(season)}`)
      .then((res) => {
        if (cancelled) return;
        const rows = res.data?.stats ?? [];
        const keyed = {};
        rows.forEach((r) => {
          const id = mapZoneTextToRegionId(r.shot_zone_basic || r.SHOT_ZONE_BASIC, r.shot_zone_area || r.SHOT_ZONE_AREA);
          const fg = r.fg_pct ?? r.FG_PCT;
          if (id && typeof fg === "number") keyed[id] = { fg_pct: fg };
        });
        setBaselineZones(Object.keys(keyed).length ? keyed : null);
      })
      .catch(() => {
        if (!cancelled) setBaselineZones(null);
      });

    return () => {
      cancelled = true;
    };
  }, [playerName, season]);

  // ----------------------------------------------------
  // Filter shots when opponent or numGames changes
  // ----------------------------------------------------
  useEffect(() => {
    if (!allShots) {
      setShots([]);
      return;
    }
    
    setShots(filterShots(allShots, opponent, numGames));
  }, [allShots, opponent, numGames]);

  // ----------------------------------------------------
  // Fetch opponent allowed FG% + rank
  // ----------------------------------------------------
  
  // Helper: Normalize percentage values
  const pctNormalize = (x) => {
    if (x == null) return null;
    const n = Number(x);
    if (!isFinite(n)) return null;
    return n > 1 ? +(n / 100).toFixed(4) : +n.toFixed(4);
  };

  // Helper: Convert city name to full team name for API
  const convertOpponentToAPIName = (opponentName) => {
    if (!opponentName) return '';
    
    // NBA teams mapping: city -> full team name
    const teamMap = {
      'Atlanta': 'Atlanta Hawks',
      'Boston': 'Boston Celtics',
      'Brooklyn': 'Brooklyn Nets',
      'Charlotte': 'Charlotte Hornets',
      'Chicago': 'Chicago Bulls',
      'Cleveland': 'Cleveland Cavaliers',
      'Dallas': 'Dallas Mavericks',
      'Denver': 'Denver Nuggets',
      'Detroit': 'Detroit Pistons',
      'Golden State': 'Golden State Warriors',
      'Houston': 'Houston Rockets',
      'Indiana': 'Indiana Pacers',
      'Los Angeles Clippers': 'LA Clippers',
      'Los Angeles Lakers': 'Los Angeles Lakers',
      'Memphis': 'Memphis Grizzlies',
      'Miami': 'Miami Heat',
      'Milwaukee': 'Milwaukee Bucks',
      'Minnesota': 'Minnesota Timberwolves',
      'New Orleans': 'New Orleans Pelicans',
      'New York': 'New York Knicks',
      'Oklahoma City': 'Oklahoma City Thunder',
      'Orlando': 'Orlando Magic',
      'Philadelphia': 'Philadelphia 76ers',
      'Phoenix': 'Phoenix Suns',
      'Portland': 'Portland Trail Blazers',
      'Sacramento': 'Sacramento Kings',
      'San Antonio': 'San Antonio Spurs',
      'Toronto': 'Toronto Raptors',
      'Utah': 'Utah Jazz',
      'Washington': 'Washington Wizards'
    };
    
    // Check if it's already in full format
    if (Object.values(teamMap).includes(opponentName)) {
      return opponentName;
    }
    
    // Convert city name to full team name
    return teamMap[opponentName] || opponentName;
  };

  // Helper: Map zone name from API to region ID
  const regionNameToId = (name) => {
    if (!name) return null;
    const n = String(name).toLowerCase().trim();
    
    // Specific zones first
    if (n.includes("left corner 3")) return "left_corner_3";
    if (n.includes("right corner 3")) return "right_corner_3";
    if (n === "corner 3" || (n.includes("corner 3") && !n.includes("left") && !n.includes("right"))) {
      return "corner_3_generic";
    }
    if (n.includes("restricted area")) return "restricted_area";
    if ((n.includes("in the paint") || n.includes("paint")) && (n.includes("non-ra") || n.includes("non ra") || n.includes("nonra"))) {
      return "paint_non_ra";
    }
    if (n.includes("mid-range") || n.includes("mid range")) return "mid_center";
    if (n.includes("above the break 3") || n.includes("above the break")) return "center_above_3";
    if (n.includes("backcourt")) return "backcourt";
    return null;
  };

  useEffect(() => {
    if (!season || !opponent) {
      setOpponentZones(null);
      return;
    }

    let cancelled = false;

    (async () => {
      const parseZones = (apiData) => {
        const out = {};
        const zonesArray = apiData?.Zones || apiData?.zones || null;
        
        if (Array.isArray(zonesArray)) {
          zonesArray.forEach((zoneData) => {
            const zoneName = zoneData.zone || zoneData.Zone;
            if (!zoneName) return;
            
            const id = regionNameToId(zoneName);
            if (!id) return;
            
            const val = pctNormalize(zoneData.fg_pct || zoneData.FG_PCT);
            if (val == null) return;
            
            out[id] = {
              fg_pct: val,
              fg_rank: Number.isFinite(+zoneData.fg_pct_rank) ? +zoneData.fg_pct_rank : (Number.isFinite(+zoneData.fg_rank) ? +zoneData.fg_rank : null),
              fga: Number.isFinite(+zoneData.fga) ? +zoneData.fga : (Number.isFinite(+zoneData.FGA) ? +zoneData.FGA : null),
              fga_rank: Number.isFinite(+zoneData.fga_pct_rank) ? +zoneData.fga_pct_rank : (Number.isFinite(+zoneData.fga_rank) ? +zoneData.fga_rank : null),
              zone_name: zoneName,
            };
          });
        }

        // Handle generic "Corner 3" - map to both left and right if not already set
        const corner3Generic = out.corner_3_generic;
        if (corner3Generic?.fg_pct != null) {
          if (!out.left_corner_3) out.left_corner_3 = { ...corner3Generic };
          if (!out.right_corner_3) out.right_corner_3 = { ...corner3Generic };
          delete out.corner_3_generic;
        }
        
        // Fan-out ATB3 → left/right
        const atb = out.center_above_3;
        if (atb?.fg_pct != null) {
          if (!out.left_above_3) out.left_above_3 = { ...atb };
          if (!out.right_above_3) out.right_above_3 = { ...atb };
        }

        return Object.keys(out).length ? out : null;
      };

      try {
        const apiOpponentName = convertOpponentToAPIName(opponent);
        const res = await api.get(
          `/nba/opponent-shooting/by-zone/${encodeURIComponent(apiOpponentName)}/${encodeURIComponent(season)}`
        );
        if (cancelled) return;
        
        const zones = parseZones(res?.data);
        setOpponentZones(zones);
      } catch {
        if (!cancelled) setOpponentZones(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [season, opponent]);

  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------
  if (!playerName) {
    return (
      <div className="p-4 text-gray-500 bg-gray-100 rounded-lg">
        Select a player to view their shot chart.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-neutral-900 p-8 shadow-lg">
      <div className="mb-4">
        <h2 className="text-white text-3xl font-extrabold text-center">
          {playerName} Shot Chart {season ? `(${season})` : ""}
        </h2>
        <p className="text-gray-400 text-sm mt-1 text-center">
          Visualizing shot accuracy and volume across the court. Select the Opponent team to overlay their allowed FG% and league rank by zone.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <OpponentDropdown data={allShots} value={opponent} onChange={setOpponent} />
        <SeasonDropdown predefinedSeasons={seasons} playerName={playerName} value={season} onChange={setSeason} />
        <div className="flex items-center gap-2">
          <label htmlFor="numGames" className="text-gray-300 text-sm">
            Recent Games:
          </label>
          <select
            id="numGames"
            value={numGames}
            onChange={(e) => setNumGames(e.target.value)}
            className="bg-neutral-800 text-white text-sm rounded-md px-2 py-1"
          >
            <option value="All">All</option>
            <option value="5">Last 5</option>
            <option value="10">Last 10</option>
            <option value="20">Last 20</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-neutral-950/80 ring-1 ring-neutral-800/80 p-6">
        <PlayerShotHexChart
          shots={shots}
          xDomain={domains.x}
          yDomain={domains.y}
          width={900}
          courtImgSrc="/basketball_court.png"
          playerName={playerName}
          seasonLabel={season}
          baselineZones={baselineZones}
          playerSeasonZones={playerSeasonZones}
          opponentZones={opponentZones}
          loading={loading}
          error={err}
          showHeader={false}
        />
      </div>
    </div>
  );
}
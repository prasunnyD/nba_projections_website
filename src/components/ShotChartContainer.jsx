import { useEffect, useState } from "react";
import { api } from "../utils/apiConfig";
import SeasonDropdown from "./SeasonDropdown";
import OpponentDropdown from "./OpponentDropdown";
import PlayerShotHexChart from "./PlayerShotHexChart";

import { getTeamAbbrFromShot, getOpponentFromShot, filterShots } from "../helpers/shotUtils";
import { mapZoneTextToRegionId, makeRegionPredicates } from "../helpers/zoneUtils";

// ----------------------------------------------------
// Helpers to compute fallback per-zone FG% (player-only)
// ----------------------------------------------------
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
export default function ShotChartContainer({ playerName, opponentTeam }) {
  const [seasons, setSeasons] = useState([]);
  const [season, setSeason] = useState("");
  const [opponent, setOpponent] = useState("");
  const [numGames, setNumGames] = useState("All");

  const [allShots, setAllShots] = useState(null);
  const [shots, setShots] = useState(null);
  const [baselineZones, setBaselineZones] = useState(null);
  const [playerSeasonZones, setPlayerSeasonZones] = useState(null);
  const [opponentZones, setOpponentZones] = useState(null);

  const [domains] = useState({ x: [-25, 25], y: [-5, 47] });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // ----------------------------------------------------
  // Auto-select opponent when opponentTeam prop changes
  // ----------------------------------------------------
  useEffect(() => {
    if (opponentTeam) {
      setOpponent(opponentTeam);
    }
  }, [opponentTeam]);

  // ----------------------------------------------------
  // Initialize seasons when player changes
  // ----------------------------------------------------
  useEffect(() => {
    if (!playerName) {
      setSeasons([]);
      setSeason("");
      setOpponent("");
      setAllShots(null);
      setShots(null);
      setBaselineZones(null);
      setPlayerSeasonZones(null);
      setOpponentZones(null);
      return;
    }
    const predefined = ["2025-26", "2024-25", "2023-24", "2022-23", "2021-22", "2020-21"];
    setSeasons(predefined);
    setSeason(predefined[0]);
    // If opponentTeam is provided, set it as opponent
    if (opponentTeam) {
      setOpponent(opponentTeam);
    }
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
        const raw = res.data?.shots ?? [];
        const mapped = raw.map((shot) => {
          const teamAbbr = getTeamAbbrFromShot(shot);
          const opp = getOpponentFromShot(shot);
          const locX = shot.loc_x ?? shot.LOC_X;
          const locY = shot.loc_y ?? shot.LOC_Y;
          const madeRaw = shot.shot_made_flag ?? shot.SHOT_MADE_FLAG;
          return {
            x: typeof locX === "number" ? locX / 10 : 0,
            y: typeof locY === "number" ? locY / 10 : 0,
            made: madeRaw === 1 || madeRaw === true,
            opponent: opp,
            teamAbbr,
            gameDate: shot.game_date || shot.GAME_DATE || null,
            gameId: shot.game_id || shot.GAME_ID || null,
          };
        });

        setAllShots(mapped);
        // Fallback for tooltip baseline if league avg missing
        setPlayerSeasonZones(computeZonesFromShots(mapped));
      })
      .catch(() => {
        if (!cancelled) {
          setErr("No shot data for this selection.");
          setAllShots(null);
          setShots(null);
          setPlayerSeasonZones(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Baseline league average zones (from your API)
    api
      .get(`/nba/players-shotchart/averages/${encodeURIComponent(playerName)}/${encodeURIComponent(season)}`)
      .then((res) => {
        if (cancelled) return;
        const rows = res.data?.stats ?? [];
        const keyed = {};
        for (const r of rows) {
          const id = mapZoneTextToRegionId(r.shot_zone_basic || r.SHOT_ZONE_BASIC, r.shot_zone_area || r.SHOT_ZONE_AREA);
          const fg = r.fg_pct ?? r.FG_PCT ?? null;
          if (id && typeof fg === "number") keyed[id] = { fg_pct: fg };
        }
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
    if (!allShots) return;
    setShots(filterShots(allShots, opponent, numGames));
  }, [allShots, opponent, numGames]);

  // ----------------------------------------------------
  // Fetch opponent allowed FG% + rank (new backend)
  // ----------------------------------------------------
  const pctNormalize = (x) => {
    if (x == null) return null;
    const n = Number(x);
    if (!isFinite(n)) return null;
    return n > 1 ? +(n / 100).toFixed(4) : +n.toFixed(4);
  };

  const regionNameToId = (name) => {
    if (!name) return null;
    const n = String(name).toLowerCase();
    if (n.includes("restricted area")) return "restricted_area";
    if (n.includes("in the paint") && n.includes("non-ra")) return "paint_non_ra";
    if (n.includes("mid-range")) return "mid_center";
    if (n.includes("left corner 3")) return "left_corner_3";
    if (n.includes("right corner 3")) return "right_corner_3";
    if (n.includes("above the break 3")) return "center_above_3"; // will fan-out below
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
      // helper to parse either new or legacy API shapes
      const parseZones = (apiData) => {
        const out = {};
        const zonesObj = apiData?.data?.zones || null; // NEW shape from your Go endpoint
        const legacyRows = Array.isArray(apiData?.rows) ? apiData.rows : null; // LEGACY (no ranks)

        if (zonesObj && typeof zonesObj === "object") {
          Object.entries(zonesObj).forEach(([regionName, zval]) => {
            const id = regionNameToId(regionName);
            if (!id || !zval) return;
            const val = pctNormalize(zval.fg_pct);
            const rank = Number.isFinite(+zval.fg_rank) ? +zval.fg_rank : null;
            const outOf = Number.isFinite(+zval.out_of) ? +zval.out_of : null;
            if (val != null) out[id] = { fg_pct: val, fg_rank: rank, out_of: outOf };
          });
        } else if (legacyRows) {
          // no rank in legacy rows; still show opponent pct
          legacyRows.forEach((r) => {
            const basic = r.SHOT_ZONE_BASIC ?? r.shot_zone_basic ?? null;
            const area = r.SHOT_ZONE_AREA ?? r.shot_zone_area ?? null;
            const fgRaw = r.FG_PCT ?? r.fg_pct ?? null;
            if (!basic) return;
            const id = mapZoneTextToRegionId(basic, area);
            const val = pctNormalize(fgRaw);
            if (id && val != null) out[id] = { fg_pct: val };
          });
        }

        // Fan-out ATB3 → left/right (carry rank if present)
        const atb = out.center_above_3;
        if (atb && atb.fg_pct != null) {
          if (!out.left_above_3) out.left_above_3 = { ...atb };
          if (!out.right_above_3) out.right_above_3 = { ...atb };
        }

        return Object.keys(out).length ? out : null;
      };

      try {
        // Path-param form
        const r1 = await api.get(
          `/nba/opponent-shooting/by-zone/${encodeURIComponent(opponent)}/${encodeURIComponent(season)}`
        );
        if (cancelled) return;
        let zones = parseZones(r1?.data);

        // Fallback to querystring
        if (!zones || !Object.keys(zones).length) {
          const r2 = await api.get(
            `/nba/opponent-shooting/by-zone?opponent=${encodeURIComponent(opponent)}&season=${encodeURIComponent(season)}`
          );
          if (cancelled) return;
          zones = parseZones(r2?.data);
        }

        if (zones && Object.keys(zones).length) {
          setOpponentZones(zones);
          // console.log("[ShotChart] opponent zones loaded", zones);
        } else {
          setOpponentZones(null);
        }
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
    <div className="rounded-xl bg-neutral-900 p-3 md:p-4 lg:p-8 shadow-lg">
      <div className="mb-2 md:mb-3 lg:mb-4">
        <h2 className="text-white text-lg md:text-xl lg:text-3xl font-extrabold text-center">
          {playerName} Shot Chart {season ? `(${season})` : ""}
        </h2>
        <p className="text-gray-400 text-xs md:text-sm mt-1 text-center px-2">
          Visualizing shot accuracy and volume across the court. Select the Opponent team to overlay their allowed FG% and league rank by zone.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4 lg:mb-6">
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
            className="bg-neutral-800 text-white text-sm rounded-md px-3 py-2 min-h-[44px] appearance-none cursor-pointer hover:bg-neutral-700 transition-colors border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="All">All</option>
            <option value="5">Last 5</option>
            <option value="10">Last 10</option>
            <option value="20">Last 20</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-neutral-950/80 ring-1 ring-neutral-800/80 p-2 md:p-4 lg:p-6 overflow-x-auto">
        <div className="min-w-full">
          <PlayerShotHexChart
            shots={shots}
            xDomain={domains.x}
            yDomain={domains.y}
            width={typeof window !== 'undefined' && window.innerWidth < 640 ? Math.min(window.innerWidth - 40, 600) : 900}
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
    </div>
  );
}
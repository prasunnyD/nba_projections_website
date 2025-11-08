// Enable remote opponent zone API calls only if you really have those endpoints.
// Create .env (or .env.local) and set VITE_ENABLE_OPPONENT_API=true to turn on.
const ENABLE_REMOTE_OPPONENT =
  import.meta?.env?.VITE_ENABLE_OPPONENT_API === "true";

import { useEffect, useState } from "react";
import { api } from "../utils/apiConfig";
import SeasonDropdown from "./SeasonDropdown";
import OpponentDropdown from "./OpponentDropdown";
import PlayerShotHexChart from "./PlayerShotHexChart";

import {getTeamAbbrFromShot, getOpponentFromShot, filterShots,} from "../helpers/shotUtils";

import { mapZoneTextToRegionId, makeRegionPredicates,} from "../helpers/zoneUtils";

// ----------------------------------------------------
// Helpers to compute fallback per-zone FG%
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
export default function ShotChartContainer({ playerName }) {
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

  // Debug: verify Vite env
  console.log("[ShotChart] ENV", {
    VITE_ENABLE_OPPONENT_API: import.meta.env?.VITE_ENABLE_OPPONENT_API,
    mode: import.meta.env?.MODE,
    base: import.meta.env?.BASE_URL,
  });

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
    const predefined = ["2024-25", "2023-24", "2022-23", "2021-22", "2020-21"];
    setSeasons(predefined);
    setSeason(predefined[0]);
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
      .get(
        `/nba/players-shotchart/${encodeURIComponent(
          playerName
        )}/${encodeURIComponent(season)}`
      )
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
        // Compute fallback for tooltip baseline if league avg is missing
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

    // Baseline league average zones
    api
      .get(
        `/nba/players-shotchart/averages/${encodeURIComponent(
          playerName
        )}/${encodeURIComponent(season)}`
      )
      .then((res) => {
        if (cancelled) return;
        const rows = res.data?.stats ?? [];
        const keyed = {};
        for (const r of rows) {
          const id = mapZoneTextToRegionId(
            r.shot_zone_basic || r.SHOT_ZONE_BASIC,
            r.shot_zone_area || r.SHOT_ZONE_AREA
          );
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
  // Fetch opponent allowed FG% (if endpoint enabled)
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
    return null;
  };

  useEffect(() => {
    if (!season || !opponent) {
      setOpponentZones(null);
      return;
    }

    let cancelled = false;

    const fetchOpponentZones = async () => {
      if (!ENABLE_REMOTE_OPPONENT) {
        console.info("[ShotChart] Remote opponent zone API disabled; skipping.");
        setOpponentZones(null);
        return;
      }

      try {
        const res = await api.get(
          `/nba/opponent-shooting/by-zone/${encodeURIComponent(
            opponent
          )}/${encodeURIComponent(season)}`
        );
        if (cancelled) return;

        const apiData = res?.data ?? null;

        // NEW SHAPE: { status, data: { team, season, zones: { [region]: { fg_pct, fgm, fga }}}}
        const zonesObj = apiData && apiData.data ? apiData.data.zones : null;

        // LEGACY SHAPE: { rows: [{SHOT_ZONE_BASIC, SHOT_ZONE_AREA, FG_PCT}, ...] }
        const legacyRows = apiData && Array.isArray(apiData.rows) ? apiData.rows : null;

        const out = {};

        if (zonesObj && typeof zonesObj === "object") {
          Object.entries(zonesObj).forEach(([regionName, zval]) => {
            const id = regionNameToId(regionName);
            const val = pctNormalize(zval && zval.fg_pct);
            if (id && val != null) out[id] = { fg_pct: val };
          });
        } else if (legacyRows) {
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

        // FAN-OUT: if API only gives a single ATB3 value, mirror it to left/right
        const atb =
          out.center_above_3?.fg_pct ??
          out.center_above_3 ??
          null;
        if (atb != null) {
          if (!out.left_above_3) out.left_above_3 = { fg_pct: atb.fg_pct ?? atb };
          if (!out.right_above_3) out.right_above_3 = { fg_pct: atb.fg_pct ?? atb };
        }

        if (Object.keys(out).length) {
          setOpponentZones(out);
          console.log("[ShotChart] opponent zones loaded", out);
        } else {
          console.warn("[ShotChart] API returned no usable zone data for", opponent, season);
          setOpponentZones(null);
        }
      } catch (err) {
        console.warn("[ShotChart] Opponent by-zone API unavailable for", opponent, season, err);
        setOpponentZones(null);
      }
    };

    fetchOpponentZones();
    return () => {
      cancelled = true;
    };
  }, [season, opponent, ENABLE_REMOTE_OPPONENT]);

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
          Visualizing shot accuracy and volume across the court. Select the Opponent team from the dropdown to see their overall FG% stats across zones
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
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
          playerSeasonZones={playerSeasonZones} // fallback ensures tooltips never blank
          opponentZones={opponentZones}
          loading={loading}
          error={err}
          showHeader={false}
        />
      </div>
    </div>
  );
}

import React, { useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import { makeRegionPredicates, REGION_LABELS } from "../helpers/zoneUtils";
import { getAccuracyScale, getVolumeScale } from "../helpers/colorUtils";
import { normalizePct } from "../helpers/shotUtils";
import {DEFAULT_PADDING,FG_THRESHOLDS,REGION_LABEL_FEET,} from "../helpers/chartConfig";
import { RA_R, PAINT_W, PAINT_H, CORNER_X, BREAK_Y, buildThreePtArcPath, WoodPattern,} from "../helpers/courtUtils";
import { makeHexbin, aggregateHexes, nearestHex, hexagonPathString,} from "../helpers/hexUtils";

/**
 * PlayerShotHexChart.jsx
 * Visualizes player shots + opponent defense overlay.
 */
export default function PlayerShotHexChart({
  shots = [],
  xDomain = [-25, 25],
  yDomain = [-5, 47],
  width = 900,
  courtImgSrc,
  playerName,
  seasonLabel,
  baselineZones = null,
  playerSeasonZones = null, // fallback so tooltip never blanks
  opponentZones = null, // opponent FG% overlay by zone
  loading,
  error,
  teamColor = "#2563eb",
  showHeader = false,
}) {
  const containerRef = useRef(null);
  const data = Array.isArray(shots) ? shots : [];

  // ---------------- Geometry & scales ----------------
  const DOMAIN_W = Math.abs(xDomain[1] - xDomain[0]);
  const DOMAIN_H = Math.abs(yDomain[1] - yDomain[0]);
  const targetAspect = DOMAIN_W / DOMAIN_H;

  const padding = DEFAULT_PADDING;
  const innerW = width - padding * 2;
  const innerH = Math.round(innerW / targetAspect);
  const svgH = innerH + padding * 2;

  const x = useMemo(
    () => d3.scaleLinear().domain(xDomain).range([0, innerW]),
    [xDomain, innerW]
  );
  const y = useMemo(
    () => d3.scaleLinear().domain(yDomain).range([innerH, 0]),
    [yDomain, innerH]
  );
  const dxPx = (feet) => Math.abs(x(0) - x(feet));

  // ---------------- Region & per-zone logic ----------------
  const pred = useMemo(() => makeRegionPredicates(), []);
  const regionList = useMemo(
    () =>
      Object.keys(REGION_LABELS).map((id) => ({
        id,
        label: REGION_LABELS[id],
      })),
    []
  );

  // Per-zone stats for selected shots
  const zoneStats = useMemo(() => {
    const stats = {};
    regionList.forEach((r) => (stats[r.id] = { atts: 0, made: 0 }));
    data.forEach((s) => {
      for (const r of regionList) {
        if (pred[r.id](s.x, s.y)) {
          stats[r.id].atts += 1;
          stats[r.id].made += s.made ? 1 : 0;
          break;
        }
      }
    });
    Object.values(stats).forEach(
      (o) => (o.fg = o.atts ? o.made / o.atts : null)
    );
    return stats;
  }, [data, pred, regionList]);

  // ---------------- Summary tiles ----------------
  const quickTiles = useMemo(() => {
    const totalAtt = data.length;
    const totalMade = data.reduce((a, s) => a + (s.made ? 1 : 0), 0);
    const overallFG = totalAtt ? totalMade / totalAtt : null;

    const threes = data.filter((s) => pred.isThree(s.x, s.y));
    const thAtt = threes.length;
    const thMade = threes.reduce((a, s) => a + (s.made ? 1 : 0), 0);
    const threeFG = thAtt ? thMade / thAtt : null;

    const ra = zoneStats.restricted_area;
    const rimFG = ra?.atts ? ra.made / ra.atts : null;

    return { overallFG, threeFG, rimFG, attempts: totalAtt };
  }, [data, pred, zoneStats]);

  // ---------------- Hex aggregation ----------------
  const hexRadius = Math.max(5.5, Math.min(innerW, innerH) * 0.0205);
  const hexbin = useMemo(() => makeHexbin(x, y, hexRadius), [x, y, hexRadius]);
  const hexPathStr = useMemo(() => hexagonPathString(hexbin), [hexbin]);
  const hexes = useMemo(() => aggregateHexes(hexbin, data), [hexbin, data]);

  // ---------------- Color scales ----------------
  const [mode, setMode] = useState("accuracy");
  const [showMisses, setShowMisses] = useState(false);
  const accuracyScale = useMemo(
    () => getAccuracyScale(teamColor, FG_THRESHOLDS),
    [teamColor]
  );
  const volumeColor = useMemo(() => getVolumeScale(hexes), [hexes]);

  // ---------------- Hover logic ----------------
  const [hover, setHover] = useState(null);
  const onMouseMove = (evt) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = evt.clientX - rect.left;
    const relY = evt.clientY - rect.top;

    const scaleX = (padding * 2 + innerW) / rect.width;
    const scaleY = (padding * 2 + innerH) / rect.height;
    const vbX = relX * scaleX;
    const vbY = relY * scaleY;

    const px = vbX - padding;
    const py = vbY - padding;

    const near = nearestHex(hexes, px, py, hexRadius);
    const cx = x.invert(near ? near.px : px);
    const cy = y.invert(near ? near.py : py);

    let regionId = null;
    for (const r of regionList) {
      if (pred[r.id](cx, cy)) {
        regionId = r.id;
        break;
      }
    }
    setHover(regionId ? { regionId, pxCss: relX, pyCss: relY } : null);
  };
  const onMouseLeave = () => setHover(null);
  const hexMatchesHover = (h, regionId) => {
    const cx = x.invert(h.px);
    const cy = y.invert(h.py);
    return pred[regionId](cx, cy);
  };
  const hexOpacity = (h) =>
    !hover ? 0.9 : hexMatchesHover(h, hover.regionId) ? 1.0 : 0.18;
  const hexStroke = (h) =>
    hover && hexMatchesHover(h, hover.regionId) ? 1.25 : 0.6;

  // ---------------- Tooltip Data ----------------
  const tip = useMemo(() => {
    if (!hover) return null;
    const z = zoneStats[hover.regionId];
    if (!z) return null;

    const playerPct = z.fg ?? null;
    // Prefer baseline → fallback to player season → fallback to current
    let seasonPct = baselineZones?.[hover.regionId]?.fg_pct ?? null;
    if (seasonPct == null)
      seasonPct = playerSeasonZones?.[hover.regionId]?.fg_pct ?? playerPct;

    const opponentPct = normalizePct(opponentZones?.[hover.regionId]?.fg_pct);
    const fmt = d3.format(".1%");

    return {
      regionLabel: REGION_LABELS[hover.regionId],
      pct: playerPct == null ? "—" : fmt(playerPct),
      made: z.made,
      atts: z.atts,
      seasonPct:
        seasonPct == null ? "—" : fmt(normalizePct(seasonPct) ?? seasonPct),
      opponentPct: opponentPct == null ? "—" : fmt(opponentPct),
    };
  }, [hover, zoneStats, baselineZones, playerSeasonZones, opponentZones]);

  // ---------------- Court helpers ----------------
  const woodPatternId = useMemo(
    () => `wood-${Math.random().toString(36).slice(2)}`,
    []
  );
  const threePtArcPath = useMemo(() => buildThreePtArcPath(x, y), [x, y]);

  // ---------------- Loading / Error ----------------
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-200">
        Loading shot chart…
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  // ---------------- Render ----------------
  return (
    <div ref={containerRef} className="relative w-full mx-auto">
      {showHeader && (playerName || seasonLabel) && (
        <div className="text-center text-white text-xl font-semibold mb-3">
          {playerName ? `${playerName} Shot Chart` : "Shot Chart"}
          {seasonLabel ? ` (${seasonLabel})` : ""}
        </div>
      )}

      <div className="rounded-xl bg-neutral-900/70 ring-1 ring-neutral-800 overflow-hidden p-4">
        <div className="text-[11px] text-gray-400 text-center mb-1">
          Player stats — respect current filters (opponent & recent games)
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <SummaryTile label="Overall FG%" value={quickTiles.overallFG} />
          <SummaryTile label="3PT FG%" value={quickTiles.threeFG} />
          <SummaryTile label="At Rim FG%" value={quickTiles.rimFG} />
          <div className="bg-neutral-800 rounded-lg p-3 text-center">
            <div className="text-gray-400 text-xs">Attempts</div>
            <div className="text-white text-xl font-bold">
              {quickTiles.attempts ?? 0}
            </div>
          </div>
        </div>

        <svg
          role="img"
          aria-label="NBA half-court shot chart"
          viewBox={`0 0 ${width} ${svgH}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            aspectRatio: `${width}/${svgH}`,
          }}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <defs>
            <WoodPattern id={woodPatternId} height={innerH} />
          </defs>

          <g transform={`translate(${padding},${padding})`}>
            {/* Background */}
            <rect
              x={0}
              y={0}
              width={innerW}
              height={innerH}
              rx={12}
              fill={`url(#${woodPatternId})`}
              stroke="#0f172a"
              opacity={0.98}
            />

            {courtImgSrc && (
              <image
                href={courtImgSrc}
                x={0}
                y={0}
                width={innerW}
                height={innerH}
                preserveAspectRatio="xMidYMid meet"
                style={{ mixBlendMode: "multiply", pointerEvents: "none" }}
                opacity={1}
              />
            )}

            {/* Court lines */}
            <g
              pointerEvents="none"
              stroke="#0b1220"
              strokeOpacity="0.8"
              fill="none"
              strokeWidth={1.6}
            >
              <circle cx={x(0)} cy={y(0)} r={dxPx(RA_R)} />
              <rect
                x={x(-PAINT_W / 2)}
                y={y(PAINT_H)}
                width={dxPx(PAINT_W)}
                height={Math.abs(y(PAINT_H) - y(0))}
                rx={2}
              />
              <line x1={x(-CORNER_X)} y1={y(0)} x2={x(-CORNER_X)} y2={y(BREAK_Y)} />
              <line x1={x(CORNER_X)} y1={y(0)} x2={x(CORNER_X)} y2={y(BREAK_Y)} />
              <path d={threePtArcPath} />
            </g>

            {/* Hexes */}
            <g>
              {hexes.map((h, i) => {
                const fill =
                  mode === "accuracy" ? accuracyScale(h.fg) : volumeColor(h.atts);
                return (
                  <path
                    key={i}
                    d={hexPathStr}
                    transform={`translate(${h.px},${h.py})`}
                    fill={fill}
                    fillOpacity={hexOpacity(h)}
                    stroke="#0f172a"
                    strokeOpacity={0.9}
                    strokeWidth={hexStroke(h)}
                  />
                );
              })}
            </g>

            {/* Miss markers */}
            {showMisses && (
              <g opacity={0.55}>
                {data
                  .filter((s) => !s.made)
                  .map((s, i) => {
                    const cxVal = x(s.x);
                    const cyVal = y(s.y);
                    const r = 4;
                    return (
                      <g
                        key={i}
                        transform={`translate(${cxVal},${cyVal})`}
                        stroke="#ef4444"
                        strokeWidth={1.5}
                      >
                        <line x1={-r} y1={-r} x2={r} y2={r} />
                        <line x1={-r} y1={r} x2={r} y2={-r} />
                      </g>
                    );
                  })}
              </g>
            )}

            {/* Opponent overlay badges - BIGGER & CLEARER */}
            {opponentZones && (
              <g>
                {Object.entries(REGION_LABEL_FEET).map(([rid, [fx, fy]]) => {
                  const val = normalizePct(opponentZones[rid]?.fg_pct ?? null);
                  if (val == null) return null;
                  const px = x(fx);
                  const py = y(fy);
                  return (
                    <g key={rid} transform={`translate(${px},${py})`}>
                      <rect
                        x={-37}
                        y={-18}
                        width={74}
                        height={28}
                        rx={9}
                        fill="#0b1220"
                        opacity="0.97"
                        stroke="#3b4758"
                        strokeWidth="1.1"
                        filter="url(#)"
                      />
                      <text
                        x={0}
                        y={3}
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="800"
                        fill="#e5edf8"
                      >
                        {d3.format(".1%")(val)}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}
          </g>
        </svg>

        <Legend
          mode={mode}
          fgThresholds={FG_THRESHOLDS}
          accuracyScale={accuracyScale}
          hexes={hexes}
          volumeColor={volumeColor}
          onModeChange={setMode}
          showMisses={showMisses}
          setShowMisses={setShowMisses}
          opponentOverlayOn={!!opponentZones}
        />
      </div>

      {hover && tip && <Tooltip containerRef={containerRef} hover={hover} tip={tip} />}
    </div>
  );
}

// ---------------- Subcomponents ----------------
function SummaryTile({ label, value }) {
  return (
    <div className="bg-neutral-800 rounded-lg p-3 text-center">
      <div className="text-gray-400 text-xs">{label}</div>
      <div className="text-white text-xl font-bold">
        {value == null ? "—" : (value * 100).toFixed(1) + "%"}
      </div>
    </div>
  );
}

function Tooltip({ containerRef, hover, tip }) {
  return (
    <div
      className="pointer-events-none absolute rounded-lg bg-white/95 shadow-lg ring-1 ring-black/10"
      style={{
        left: Math.min(
          Math.max(hover.pxCss + 12, 8),
          (containerRef.current?.clientWidth || 900) - 260
        ),
        top: Math.min(
          Math.max(hover.pyCss + 12, 8),
          (containerRef.current?.clientHeight || 500) - 170
        ),
        padding: "12px 14px",
        minWidth: 220,
      }}
    >
      <div className="text-slate-800 text-sm font-semibold">{tip.regionLabel}</div>
      <div className="text-sky-700 text-2xl font-extrabold mt-1">{tip.pct}</div>
      <div className="text-slate-600 text-xs">{`${tip.made} of ${tip.atts}`}</div>

      <div className="text-slate-600 text-xs mt-2">
        Season avg: <span className="font-medium">{tip.seasonPct}</span>
      </div>
      <div className="text-slate-600 text-xs">
        Opponent avg: <span className="font-medium">{tip.opponentPct}</span>
      </div>
    </div>
  );
}

function Legend({
  mode,
  fgThresholds,
  accuracyScale,
  hexes,
  volumeColor,
  onModeChange,
  showMisses,
  setShowMisses,
  opponentOverlayOn,
}) {
  const volumeBins = useMemo(() => {
    const nice = [1, 3, 6, 10, 20];
    const maxAtt = d3.max(hexes, (h) => h.atts) || 0;
    const active = nice.filter((b) => b <= Math.max(1, maxAtt));
    while (active.length < 5) active.push(nice[active.length]);
    const ranges = [];
    for (let i = 0; i < active.length; i++) {
      const start = i === 0 ? 1 : active[i - 1];
      const end = i < active.length - 1 ? active[i] - 1 : null;
      ranges.push({ start, end });
    }
    return ranges;
  }, [hexes]);

  return (
    <>
      <div className="mt-3 px-2">
        {mode === "accuracy" ? (
          <div className="flex items-center justify-center gap-4 flex-wrap text-center">
            <span className="text-xs text-gray-300">FG% scale</span>
            {[-Infinity, ...fgThresholds, Infinity].map((lo, i, arr) => {
              const hi = arr[i + 1];
              if (hi == null) return null;
              const mid =
                lo === -Infinity ? fgThresholds[0] - 0.001 : lo + 0.0001;
              const color = accuracyScale(mid);
              const label =
                lo === -Infinity
                  ? "<35%"
                  : hi === Infinity
                  ? "≥55%"
                  : `${Math.round(lo * 100)}–${Math.round(hi * 100)}%`;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-7 h-3 rounded-sm"
                    style={{ backgroundColor: color, border: "1px solid #0f172a" }}
                  />
                  <span className="text-xs text-gray-200">{label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 flex-wrap text-center">
            <span className="text-xs text-gray-300">Attempts</span>
            {volumeBins.map((r, i) => {
              const sample = r.end ? r.end : r.start + 8;
              const color = volumeColor(sample);
              const label = r.end ? `${r.start}–${r.end}` : `${r.start}+`;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-7 h-3 rounded-sm"
                    style={{ backgroundColor: color, border: "1px solid #0f172a" }}
                  />
                  <span className="text-xs text-gray-200">{label}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-2 text-[11px] text-gray-400 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm border border-[#0f172a]" />
            <span>Court scaled in feet.</span>
          </div>
          {opponentOverlayOn && (
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-[#0b1220] border border-[#334155]" />
              <span>Badges show overall opponent team FG% by zone.</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect
                x="1"
                y="1"
                width="10"
                height="10"
                fill="#ffffff"
                stroke="#ef4444"
                strokeWidth="1.2"
              />
              <line
                x1="3.2"
                y1="3.2"
                x2="8.8"
                y2="8.8"
                stroke="#ef4444"
                strokeWidth="1.2"
              />
              <line
                x1="3.2"
                y1="8.8"
                x2="8.8"
                y2="3.2"
                stroke="#ef4444"
                strokeWidth="1.2"
              />
            </svg>
            <span>Miss markers toggle.</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <button
          className={`stat-button ${mode === "accuracy" ? "active" : "inactive"}`}
          onClick={() => onModeChange("accuracy")}
        >
          FG% View
        </button>
        <button
          className={`stat-button ${mode === "volume" ? "active" : "inactive"}`}
          onClick={() => onModeChange("volume")}
        >
          Shot Volume
        </button>
        <button
          className={`stat-button ${showMisses ? "active" : "inactive"}`}
          onClick={() => setShowMisses((v) => !v)}
        >
          Show Misses
        </button>
      </div>
    </>
  );
}
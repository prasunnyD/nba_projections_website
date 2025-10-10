import React, { useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { hexbin as d3Hexbin } from "d3-hexbin";

/**
 * Props:
 *  - shots: Array<{ x: number, y: number, made: 0|1 }>  // tenths of a foot, hoop at (0,0), y toward court
 *  - xDomain: [min,max] (e.g. [-250, 250])
 *  - yDomain: [min,max] (e.g. [-50, 470])
 *  - width, height: svg size (pixels)
 *  - courtImgSrc?: optional half-court background (png/svg)
 *  - playerName?: string
 *  - seasonLabel?: string e.g. "2024-25"
 *  - baselineZones?: optional object keyed by region id with { fg_pct } to display under hover as "League avg"
 */
export default function PlayerShotHexChart({
  shots = [],
  xDomain = [-25, 25],
  yDomain = [-5, 47],
  width = 720,
  height = 560,
  courtImgSrc,
  playerName,
  seasonLabel,
  baselineZones = {}, // { [regionId]: { fg_pct } }
}) {
  const containerRef = useRef(null);
  const data = Array.isArray(shots) ? shots : [];

  // ---------- scales ----------
  const padding = 16; // small visual breathing room
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const x = useMemo(
    () => d3.scaleLinear().domain(xDomain).range([0, innerW]),
    [xDomain, innerW]
  );
  // SVG y grows downward, but our court y grows upward → flip the range
  const y = useMemo(
    () => d3.scaleLinear().domain(yDomain).range([innerH, 0]),
    [yDomain, innerH]
  );

  // ---------- NBA geometry (feet) ----------
  const RA_R = 4;
  const PAINT_W = 16;
  const PAINT_H = 19;
  const CORNER_X = 22;
  const ARC_R = 23.75;
  const BREAK_Y = Math.sqrt(Math.max(ARC_R ** 2 - CORNER_X ** 2, 0));

  // ---------- region predicates ----------
  const pred = useMemo(() => {
    const inRA = (px, py) => px * px + py * py <= RA_R * RA_R;

    const inPaintNonRA = (px, py) =>
      Math.abs(px) <= PAINT_W / 2 && py >= 0 && py <= PAINT_H && !inRA(px, py);

    const isCorner3 = (px, py) =>
      py >= 0 && py <= BREAK_Y && (px <= -CORNER_X || px >= CORNER_X);

    const beyondArc = (px, py) => px * px + py * py >= ARC_R * ARC_R;
    const isAboveBreak3 = (px, py) => !isCorner3(px, py) && beyondArc(px, py);

    const inThree = (px, py) => isCorner3(px, py) || isAboveBreak3(px, py);

    const inMidrange = (px, py) =>
      !inThree(px, py) && !inPaintNonRA(px, py) && !inRA(px, py) && py >= 0;

    const left = (px) => px < -5;
    const right = (px) => px > 5;
    const center = (px) => px >= -5 && px <= 5;

    return {
      left_corner_3: (px, py) => isCorner3(px, py) && px < 0,
      right_corner_3: (px, py) => isCorner3(px, py) && px > 0,
      left_above_3: (px, py) => isAboveBreak3(px, py) && left(px),
      center_above_3: (px, py) => isAboveBreak3(px, py) && center(px),
      right_above_3: (px, py) => isAboveBreak3(px, py) && right(px),
      mid_left: (px, py) => inMidrange(px, py) && left(px),
      mid_center: (px, py) => inMidrange(px, py) && center(px),
      mid_right: (px, py) => inMidrange(px, py) && right(px),
      paint_non_ra: inPaintNonRA,
      restricted_area: inRA,
    };
  }, []);

  const regionList = useMemo(
    () => [
      { id: "left_corner_3", label: "Left Corner 3" },
      { id: "center_above_3", label: "Above the Break 3 (Center)" },
      { id: "left_above_3", label: "Above the Break 3 (Left)" },
      { id: "right_above_3", label: "Above the Break 3 (Right)" },
      { id: "right_corner_3", label: "Right Corner 3" },
      { id: "mid_left", label: "Mid-range (Left)" },
      { id: "mid_center", label: "Mid-range (Center)" },
      { id: "mid_right", label: "Mid-range (Right)" },
      { id: "paint_non_ra", label: "In the Paint (Non-RA)" },
      { id: "restricted_area", label: "Restricted Area" },
    ],
    []
  );

  // ---------- precompute zone stats from raw shots ----------
  const zoneStats = useMemo(() => {
    const stats = {};
    regionList.forEach((r) => (stats[r.id] = { atts: 0, made: 0 }));

    data.forEach((s) => {
      for (const r of regionList) {
        if (pred[r.id](s.x, s.y)) {
          stats[r.id].atts += 1;
          stats[r.id].made += s.made ? 1 : 0;
          break; // each shot belongs to one region
        }
      }
    });

    Object.values(stats).forEach((o) => {
      o.fg = o.atts ? o.made / o.atts : null;
    });
    return stats;
  }, [data, pred, regionList]);

  // ---------- hexbin ----------
  const hexRadius = Math.max(6, Math.min(innerW, innerH) * 0.022);
  const hexbin = useMemo(
    () => d3Hexbin().x((d) => x(d.x)).y((d) => y(d.y)).radius(hexRadius),
    [x, y, hexRadius]
  );

  const hexes = useMemo(() => {
    const bins = hexbin(data);
    bins.forEach((b) => {
      let made = 0;
      for (const s of b) if (s.made) made++;
      b.atts = b.length;
      b.made = made;
      b.fg = b.atts ? made / b.atts : 0;
      const sample = b[0];
      b.courtX = sample?.x ?? 0;
      b.courtY = sample?.y ?? 0;
    });
    return bins;
  }, [hexbin, shots]);

  // color scale (absolute fg%)
  const color = useMemo(
    () =>
      d3
        .scaleThreshold()
        .domain([0.35, 0.40, 0.45, 0.50, 0.55])
        .range(["#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"]),
    []
  );

  // ---------- interactions ----------
  const [hover, setHover] = useState(null); // { regionId, px, py }
  const onMouseMove = (evt) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = evt.clientX - rect.left - padding;
    const py = evt.clientY - rect.top - padding;

    const cx = x.invert(px);
    const cy = y.invert(py);

    let regionId = null;
    for (const r of regionList) {
      if (pred[r.id](cx, cy)) {
        regionId = r.id;
        break;
      }
    }
    setHover(regionId ? { regionId, px, py } : null);
  };

  const onMouseLeave = () => setHover(null);

  const hexOpacity = (h) => {
    if (!hover) return 0.9;
    const inside = pred[hover.regionId](h.courtX, h.courtY);
    return inside ? 1.0 : 0.18;
  };
  const hexStroke = (h) => (hover && pred[hover.regionId](h.courtX, h.courtY) ? 1.25 : 0.6);

  // tooltip content
  const tip = (() => {
    if (!hover) return null;
    const z = zoneStats[hover.regionId];
    if (!z) return null;
    const fmt = d3.format(".1%");
    const pct = z.fg == null ? "—" : fmt(z.fg);
    const baseline = baselineZones?.[hover.regionId]?.fg_pct ?? null;
    const baselinePct = baseline == null ? "—" : fmt(baseline);
    return {
      regionLabel: regionList.find((r) => r.id === hover.regionId)?.label ?? "",
      pct,
      made: z.made,
      atts: z.atts,
      baselinePct,
    };
  })();

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ width: "100%", height: "100%", maxWidth: width, maxHeight: height, margin: "0 auto" }}
    >
      {(playerName || seasonLabel) && (
        <div className="text-center text-white text-xl font-semibold mb-2">
          {playerName ? `${playerName} Shot Chart` : "Shot Chart"}
          {seasonLabel ? ` (${seasonLabel})` : ""}
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%" }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <g transform={`translate(${padding},${padding})`}>
          <rect x={0} y={0} width={innerW} height={innerH} rx={12} className="fill-neutral-800/60 stroke-neutral-700" />

          {courtImgSrc && (
            <image href={courtImgSrc} x={0} y={0} width={innerW} height={innerH} preserveAspectRatio="xMidYMid meet" opacity={0.85} />
          )}

          <g>
            {hexes.map((h, i) => (
              <path key={i} d={hexbin.hexagon()} transform={`translate(${h.x},${h.y})`} fill={color(h.fg)} fillOpacity={hexOpacity(h)} stroke="#0f172a" strokeOpacity={0.9} strokeWidth={hexStroke(h)} />
            ))}
          </g>

          {/* Legend */}
          <g transform={`translate(${innerW / 2 - 90}, ${innerH - 22})`}>
            <text x={-64} y={10} className="fill-slate-300" style={{ fontSize: 11 }} textAnchor="end">fg%</text>
            {color.range().map((c, i) => (
              <rect key={i} x={i * 24} y={0} width={22} height={12} fill={c} stroke="#0f172a" strokeWidth={0.6} rx={2} />
            ))}
          </g>
        </g>
      </svg>

      {/* Tooltip */}
      {hover && tip && (
        <div className="pointer-events-none absolute rounded-lg bg-white/95 shadow-lg ring-1 ring-black/10" style={{ left: Math.min(Math.max(hover.px + padding + 12, 8), width - 180), top: Math.min(Math.max(hover.py + padding + 12, 8), height - 96), padding: "8px 10px", minWidth: 160 }}>
          <div className="text-slate-800 text-sm font-semibold">{tip.regionLabel}</div>
          <div className="text-sky-700 text-lg font-bold mt-1">{tip.pct}</div>
          <div className="text-slate-600 text-xs">{`${tip.made} of ${tip.atts}`}</div>
          <div className="text-slate-600 text-xs mt-1">League avg: <span className="font-medium">{tip.baselinePct}</span></div>
        </div>
      )}
    </div>
  );
}

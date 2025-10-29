// ---------------------- colorUtils.jsx ----------------------
// Color scales for the shot chart (accuracy + volume)

import * as d3 from "d3";

/**
 * Accuracy color scale (FG%) using a team-tinted palette.
 * @param {string} teamColor - base color (e.g. "#2563eb")
 * @param {number[]} thresholds - ascending FG% thresholds (0–1)
 * @returns {d3.ScaleThreshold<number, string>}
 */
export function getAccuracyScale(
  teamColor,
  thresholds = [0.35, 0.4, 0.45, 0.5, 0.55]
) {
  const base = d3.color(teamColor) || d3.color("#3b82f6");
  // Palette variations around team color
  const light = base.brighter(1.8).formatHex();
  const lighter = base.brighter(3).formatHex();
  const dark = base.darker(0.8).formatHex();
  const darkest = base.darker(1.5).formatHex();

  return d3
    .scaleThreshold()
    .domain(thresholds)
    // 6 buckets: very low → very high
    .range([lighter, light, base.formatHex(), dark, darkest, "#0b214a"]);
}

/**
 * Volume color scale (shot attempts per hex) using sqrt scaling.
 * Pass in the computed hex bins; we derive the max automatically.
 * @param {Array<{atts:number}>} hexes
 * @returns {d3.ScaleSqrt<number, string>}
 */
export function getVolumeScale(hexes = []) {
  const maxAtt = d3.max(hexes, (h) => h.atts) || 1;
  // Light gray → team blue (neutral, since not team-specific)
  return d3.scaleSqrt().domain([0, maxAtt]).range(["#e5e7eb", "#3b82f6"]);
}

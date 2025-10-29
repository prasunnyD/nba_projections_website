import { hexbin as d3Hexbin } from "d3-hexbin";

/**
 * Create a hexbin generator given x/y accessors and a radius.
 */
export function makeHexbin(xScale, yScale, radius) {
  return d3Hexbin().x((d) => xScale(d.x)).y((d) => yScale(d.y)).radius(radius);
}

/**
 * Aggregate hex bins with atts/made/fg and cache pixel centers.
 */
export function aggregateHexes(hexbin, data) {
  const bins = hexbin(data);
  for (const b of bins) {
    let made = 0;
    for (const s of b) if (s.made) made++;
    b.atts = b.length;
    b.made = made;
    b.fg = b.atts ? made / b.atts : 0;
    b.px = b.x;
    b.py = b.y;
  }
  return bins;
}

/**
 * Return nearest hex within ~radius under pointer (px, py); otherwise null.
 */
export function nearestHex(hexes, px, py, radius) {
  if (!hexes?.length) return null;
  let best = null;
  let bestD2 = Infinity;
  for (const h of hexes) {
    const dx = h.px - px;
    const dy = h.py - py;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD2) {
      bestD2 = d2;
      best = h;
    }
  }
  return Math.sqrt(bestD2) <= radius * 1.1 ? best : null;
}

/**
 * Precompute the hexagon path string once per radius (avoid calling hexagon() for every bin).
 */
export function hexagonPathString(hexbin) {
  return hexbin.hexagon();
}

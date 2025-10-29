import * as d3 from "d3";

// Shared court geometry (feet)
export const RA_R = 4;
export const PAINT_W = 16;
export const PAINT_H = 19;
export const CORNER_X = 22;
export const ARC_R = 23.75;
export const BREAK_Y = Math.sqrt(Math.max(ARC_R ** 2 - CORNER_X ** 2, 0));

/**
 * Sample the NBA 3PT arc into a smooth SVG path string using the provided x/y scales.
 */
export function buildThreePtArcPath(x, y) {
  const theta0 = Math.acos(CORNER_X / ARC_R);
  const thetas = d3.range(-theta0, theta0 + 0.0001, (2 * theta0) / 80);
  const pts = thetas
    .map((t) => [ARC_R * Math.cos(t), ARC_R * Math.sin(t)])
    .filter(([, yy]) => yy >= 0);
  const line = d3.line().x((d) => x(d[0])).y((d) => y(d[1]));
  return line(pts);
}

/**
 * Wood pattern definition (JSX). Use inside <defs>.
 */
export function WoodPattern({ id, height }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={48} height={height}>
      <rect width="48" height={height} fill="#E3A060" />
      <rect width="8" height={height} x="6" fill="#C97733" opacity="0.35" />
      <rect width="6" height={height} x="18" fill="#D98F4E" opacity="0.25" />
      <rect width="10" height={height} x="28" fill="#F1B173" opacity="0.22" />
      <rect width="4" height={height} x="40" fill="#C97733" opacity="0.3" />
    </pattern>
  );
}

// Geometry and zone classification helpers

export function makeRegionPredicates() {
  const RA_R = 4;
  const PAINT_W = 16;
  const PAINT_H = 19;
  const CORNER_X = 22;
  const ARC_R = 23.75;
  const BREAK_Y = Math.sqrt(Math.max(ARC_R ** 2 - CORNER_X ** 2, 0));

  const inRA = (px, py) => py >= 0 && px * px + py * py <= RA_R * RA_R;
  const inPaintNonRA = (px, py) => Math.abs(px) <= PAINT_W / 2 && py >= 0 && py <= PAINT_H && !inRA(px, py);
  const isCorner3 = (px, py) => py >= 0 && py <= BREAK_Y && (px <= -CORNER_X || px >= CORNER_X);
  const beyondArc = (px, py) => px * px + py * py >= ARC_R * ARC_R;
  const isAboveBreak3 = (px, py) => !isCorner3(px, py) && beyondArc(px, py);
  const inThree = (px, py) => isCorner3(px, py) || isAboveBreak3(px, py);
  const inMidrange = (px, py) => !inThree(px, py) && !inPaintNonRA(px, py) && !inRA(px, py) && py >= 0;
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
    isThree: inThree,
  };
}

export const REGION_LABELS = {
  left_corner_3: "Left Corner 3",
  right_corner_3: "Right Corner 3",
  left_above_3: "Above the Break 3 (Left)",
  center_above_3: "Above the Break 3 (Center)",
  right_above_3: "Above the Break 3 (Right)",
  mid_left: "Mid-Range (Left)",
  mid_center: "Mid-Range (Center)",
  mid_right: "Mid-Range (Right)",
  paint_non_ra: "In the Paint (Non-RA)",
  restricted_area: "Restricted Area",
};

export const mapZoneTextToRegionId = (basic, area) => {
  const b = (basic || "").toLowerCase();
  const a = (area || "").toLowerCase();

  const isCorner = b.includes("corner 3");
  const isAbove = b.includes("above the break 3");
  const isMid = b.includes("mid");
  const isPaintNonRA = b.includes("in the paint") && !b.includes("restricted");
  const isRA = b.includes("restricted");
  const side = a.includes("left") ? "left" : a.includes("right") ? "right" : "center";

  if (isCorner) return side === "left" ? "left_corner_3" : "right_corner_3";
  if (isAbove) return `center_above_3`;
  if (isMid) return `mid_${side}`;
  if (isPaintNonRA) return "paint_non_ra";
  if (isRA) return "restricted_area";
  return null;
};

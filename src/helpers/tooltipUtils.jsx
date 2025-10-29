import { normalizePct, formatPct } from "./shotUtils";
import { REGION_LABELS } from "./zoneUtils";

/**
 * Build the tooltip payload for a region.
 * Returns null if we can't resolve a valid region or stats.
 */
export function buildZoneTooltip(hover, zoneStats, baselineZones, opponentZones) {
  if (!hover) return null;
  const z = zoneStats[hover.regionId];
  if (!z) return null;

  const pctNum = z.fg == null ? null : z.fg;
  const baseline =
    baselineZones && baselineZones[hover.regionId]
      ? normalizePct(baselineZones[hover.regionId].fg_pct)
      : null;
  const opponent =
    opponentZones && opponentZones[hover.regionId]
      ? normalizePct(opponentZones[hover.regionId].fg_pct)
      : null;

  return {
    regionLabel: REGION_LABELS[hover.regionId],
    pct: pctNum == null ? "—" : formatPct(pctNum),
    made: z.made,
    atts: z.atts,
    baselinePct: baseline == null ? "—" : formatPct(baseline),
    opponentPct: opponent == null ? "—" : formatPct(opponent),
  };
}

// ============================================================
// validator.js — Pure validation engine, no UI code, no imports
// ============================================================

export const ROSTER = [
  { id: 'S01', name: 'Aditi Rao',     position: 'GOALKEEPER', cohort: 'YEAR_2', availability: 'AVAILABLE'   },
  { id: 'S02', name: 'Bilal Khan',    position: 'DEFENDER',   cohort: 'YEAR_2', availability: 'AVAILABLE'   },
  { id: 'S03', name: 'Chitra Nair',   position: 'DEFENDER',   cohort: 'YEAR_3', availability: 'AVAILABLE'   },
  { id: 'S04', name: 'Deepak Shah',   position: 'FORWARD',    cohort: 'YEAR_2', availability: 'AVAILABLE'   },
  { id: 'S05', name: 'Esha Roy',      position: 'FORWARD',    cohort: 'YEAR_3', availability: 'AVAILABLE'   },
  { id: 'S06', name: 'Farhan Das',    position: 'UTILITY',    cohort: 'YEAR_2', availability: 'AVAILABLE'   },
  { id: 'S07', name: 'Gita Menon',    position: 'UTILITY',    cohort: 'YEAR_3', availability: 'AVAILABLE'   },
  { id: 'S08', name: 'Harish Patel',  position: 'FORWARD',    cohort: 'YEAR_2', availability: 'UNAVAILABLE' },
  { id: 'S09', name: 'Imani Joseph',  position: 'GOALKEEPER', cohort: 'YEAR_3', availability: 'AVAILABLE'   },
];

export const DEFAULT_SELECTION = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07'];

/**
 * validateSquad(selectedIds, roster)
 *
 * Pure function — no side effects, no React, no DOM.
 *
 * Returns one of:
 *   { status: 'INVALID_SELECTION_REFERENCE', counts: null, violations: [] }
 *   { status: 'VALID'   | 'INVALID', counts: { ... }, violations: string[] }
 *
 * Rule evaluation order (all independent, all collected):
 *   1. SQUAD_SIZE_MUST_BE_7
 *   2. GOALKEEPER_COUNT_MUST_BE_1
 *   3. MINIMUM_DEFENDERS_NOT_MET
 *   4. MINIMUM_FORWARDS_NOT_MET
 *   5. PLAYER_UNAVAILABLE: <ID>  — one per unavailable player, in roster order
 *   6. COHORT_LIMIT_EXCEEDED: YEAR_2 has <n>, maximum 4  (if YEAR_2 > 4)
 *      COHORT_LIMIT_EXCEEDED: YEAR_3 has <n>, maximum 4  (if YEAR_3 > 4)
 */
export function validateSquad(selectedIds, roster) {
  // ── 0. Reference check: unknown IDs or duplicates ─────────────────────────
  const seen = new Set();
  const rosterMap = new Map(roster.map(p => [p.id, p]));

  for (const id of selectedIds) {
    if (!rosterMap.has(id) || seen.has(id)) {
      return { status: 'INVALID_SELECTION_REFERENCE', counts: null, violations: [] };
    }
    seen.add(id);
  }

  // ── 1. Resolve selected players (preserve roster order for unavailable scan) ─
  const selectedSet = new Set(selectedIds);
  const selectedPlayers = roster.filter(p => selectedSet.has(p.id));

  // ── 2. Compute counts ──────────────────────────────────────────────────────
  const squadSize = selectedPlayers.length;
  const gkCount      = selectedPlayers.filter(p => p.position === 'GOALKEEPER').length;
  const defCount     = selectedPlayers.filter(p => p.position === 'DEFENDER').length;
  const fwdCount     = selectedPlayers.filter(p => p.position === 'FORWARD').length;
  const utilCount    = selectedPlayers.filter(p => p.position === 'UTILITY').length;
  const year2Count   = selectedPlayers.filter(p => p.cohort === 'YEAR_2').length;
  const year3Count   = selectedPlayers.filter(p => p.cohort === 'YEAR_3').length;

  const counts = {
    squadSize,
    goalkeeper: gkCount,
    defender:   defCount,
    forward:    fwdCount,
    utility:    utilCount,
    YEAR_2:     year2Count,
    YEAR_3:     year3Count,
  };

  // ── 3. Collect violations in required order ────────────────────────────────
  const violations = [];

  // Rule 1 — squad size
  if (squadSize !== 7) {
    violations.push('SQUAD_SIZE_MUST_BE_7');
  }

  // Rule 2 — exactly 1 goalkeeper
  if (gkCount !== 1) {
    violations.push('GOALKEEPER_COUNT_MUST_BE_1');
  }

  // Rule 3 — at least 2 defenders
  if (defCount < 2) {
    violations.push('MINIMUM_DEFENDERS_NOT_MET');
  }

  // Rule 4 — at least 2 forwards
  if (fwdCount < 2) {
    violations.push('MINIMUM_FORWARDS_NOT_MET');
  }

  // Rule 5 — unavailable players (iterate roster in order to preserve roster ordering)
  for (const player of roster) {
    if (selectedSet.has(player.id) && player.availability === 'UNAVAILABLE') {
      violations.push(`PLAYER_UNAVAILABLE: ${player.id}`);
    }
  }

  // Rule 6 — cohort limits (YEAR_2 before YEAR_3)
  if (year2Count > 4) {
    violations.push(`COHORT_LIMIT_EXCEEDED: YEAR_2 has ${year2Count}, maximum 4`);
  }
  if (year3Count > 4) {
    violations.push(`COHORT_LIMIT_EXCEEDED: YEAR_3 has ${year3Count}, maximum 4`);
  }

  return {
    status: violations.length === 0 ? 'VALID' : 'INVALID',
    counts,
    violations,
  };
}

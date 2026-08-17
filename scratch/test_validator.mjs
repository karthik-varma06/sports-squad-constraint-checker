// scratch/test_validator.mjs
// Run with: node scratch/test_validator.mjs
// Plain Node ESM — no build step needed.

import { ROSTER, DEFAULT_SELECTION, validateSquad } from '../src/validator.js';

const sep = (label) => {
  console.log('\n' + '─'.repeat(60));
  console.log(`  TEST: ${label}`);
  console.log('─'.repeat(60));
};

const print = (result) => {
  console.log('status    :', result.status);
  if (result.counts) {
    console.log('counts    :', JSON.stringify(result.counts));
  } else {
    console.log('counts    : null');
  }
  console.log('violations:', result.violations.length === 0 ? '(none)' : '');
  for (const v of result.violations) console.log('            •', v);
};

// ── Test 1: Baseline S01–S07 → expect VALID ──────────────────────────────────
sep('Baseline S01–S07 (expect VALID)');
print(validateSquad(DEFAULT_SELECTION, ROSTER));

// ── Test 2: Swap S07 → S08 → expect INVALID with 2 violations ───────────────
sep('S07 replaced by S08 (expect INVALID: PLAYER_UNAVAILABLE + COHORT_LIMIT_EXCEEDED YEAR_2)');
const swapSelection = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S08'];
print(validateSquad(swapSelection, ROSTER));

// ── Test 3: Six players (drop S07) → expect SQUAD_SIZE_MUST_BE_7 only ────────
sep('Six players S01–S06 (expect SQUAD_SIZE_MUST_BE_7 only)');
const sixSelection = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06'];
print(validateSquad(sixSelection, ROSTER));

// ── Test 4: Duplicate ID → expect INVALID_SELECTION_REFERENCE ────────────────
sep('Duplicate ID [S01, S01, S02, S03, S04, S05, S06] (expect INVALID_SELECTION_REFERENCE)');
const dupSelection = ['S01', 'S01', 'S02', 'S03', 'S04', 'S05', 'S06'];
print(validateSquad(dupSelection, ROSTER));

// ── Test 5: Unknown ID → expect INVALID_SELECTION_REFERENCE ─────────────────
sep('Unknown ID [S01, S02, S03, S04, S05, S06, S99] (expect INVALID_SELECTION_REFERENCE)');
const unknownSelection = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S99'];
print(validateSquad(unknownSelection, ROSTER));

// ── Test 6: Exact cohort boundary — YEAR_2 = 4 (no violation) ────────────────
sep('YEAR_2 exactly 4 [S01,S02,S04,S06,S03,S05,S07] (expect VALID — cohort at limit, not over)');
// S01 YEAR_2, S02 YEAR_2, S04 YEAR_2, S06 YEAR_2 = 4; S03 YEAR_3, S05 YEAR_3, S07 YEAR_3 = 3
print(validateSquad(['S01', 'S02', 'S04', 'S06', 'S03', 'S05', 'S07'], ROSTER));

console.log('\n' + '═'.repeat(60));
console.log('  All tests complete.');
console.log('═'.repeat(60) + '\n');

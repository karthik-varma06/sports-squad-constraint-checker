# Testing and Validation

## 1. Test Plan

I tested the validation logic separately using the `test_validator.mjs` file with Node.js. This allowed me to check the main squad rules before relying on the UI.

The test command used was:

```bash
node scratch/test_validator.mjs
```

I tested six cases:

1. Normal valid squad
2. S07 replaced by S08
3. Six-player squad
4. Duplicate player ID
5. Unknown player ID
6. YEAR_2 exactly at the limit of 4

The test script calls `validateSquad()` directly and prints the status, counts, and any violations for each case.

- **`status`**: Overall result of the validation.
- **`counts`**: Shows the squad counts when the player references are valid. Here `null` means validation stops before calculating the squad counts.
- **`violations`**: Shows the rules that were broken. `(none)` means no normal rule was checked because the player ID was invalid.

## 2. Test Results

### Test 1: Baseline S01 to S07

**Expected:** VALID

This is the normal valid squad from the problem statement.

**Result:** VALID

The output showed:

- Squad size: 7
- Goalkeeper: 1
- Defender: 2
- Forward: 2
- Utility: 2
- YEAR_2: 4
- YEAR_3: 3
- Violations: None

This confirms that the default squad passes all the required rules.

### Test 2: Replace S07 with S08

**Expected:** INVALID with two violations

S08 is unavailable and also increases YEAR_2 to 5.

**Result:** INVALID

The output showed:

```text
PLAYER_UNAVAILABLE: S08
COHORT_LIMIT_EXCEEDED: YEAR_2 has 5, maximum 4
```

The squad still has 7 players, so the size rule passes. The goalkeeper, defender, and forward counts also remain valid.

This confirms that the validator reports both violations instead of stopping after the first one.

### Test 3: Six players

**Expected:** INVALID with only `SQUAD_SIZE_MUST_BE_7`

I removed S07 and kept S01 to S06.

**Result:** INVALID

The output showed:

```text
SQUAD_SIZE_MUST_BE_7
```

No other violation was reported.

This confirms that the validator checks the current selection and reports only the rule that is actually broken.

### Test 4: Duplicate player ID

**Expected:** `INVALID_SELECTION_REFERENCE`

I used S01 twice in the selected IDs.

**Result:** `INVALID_SELECTION_REFERENCE`

The output showed:

```text
status: INVALID_SELECTION_REFERENCE
counts: null
violations: (none)
```

This is an edge case because a duplicate ID should not be treated as two different roster players.

### Test 5: Unknown player ID

**Expected:** `INVALID_SELECTION_REFERENCE`

I used S99, which is not part of the fixed roster.

**Result:** `INVALID_SELECTION_REFERENCE`

The output again showed:

```text
status: INVALID_SELECTION_REFERENCE
counts: null
violations: (none)
```

This confirms that an unknown player reference is rejected before normal squad validation.

### Test 6: YEAR_2 exactly at 4

**Expected:** VALID

This test checks the boundary condition. YEAR_2 is exactly 4, which is allowed because the rule says the maximum is 4.

**Result:** VALID

The output showed:

- Squad size: 7
- YEAR_2: 4
- YEAR_3: 3
- Violations: None

This confirms that the validator does not incorrectly reject a squad that is exactly at the cohort limit.

## 3. Edge Case Handling

I also tested cases that could easily cause incorrect results:

- Duplicate player ID
- Unknown player ID
- Exactly 4 YEAR_2 players
- A six-player squad
- A squad containing an unavailable player
- A squad exceeding the cohort limit

These cases were included because they test what happens when the selection is invalid or right at a rule boundary. The test script explicitly includes the duplicate, unknown ID, and exact cohort boundary checks.

## 4. Overall Result

All six tests completed successfully.

The results showed that:

- The valid baseline is accepted.
- The required S07 to S08 invalid case gives both expected violations.
- The six-player case gives only the squad-size violation.
- Duplicate and unknown IDs are rejected as invalid references.
- The exact YEAR_2 limit of 4 is accepted.

The terminal output in the two screenshots is the evidence for these tests.

![Test evidence - screenshot 1](test_1.png)

![Test evidence - screenshot 2](test_2.png)

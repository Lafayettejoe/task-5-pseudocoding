# Part C3 — Ten-Input Comparison (Your B2 Implementation vs. AI's C1 Implementation)

| # | Input (distanceKm, timeOfDay, orderSizeKobo) | Mine (B2) | AI (C1) | Result |
|---|---|---|---|---|
| 1 | (5, 14, 1000000) | 75000 | 75000 | MATCH |
| 2 | (10, 19, 5000000) | 0 | 0 | MATCH |
| 3 | (2, 18, 1000000) | 36000 | 36000 | MATCH |
| 4 | (-3, 12, 500000) | ERROR: distanceKm cannot be negative | ERROR: distanceKm cannot be negative | MATCH |
| 5 | (5, 12, -100) | ERROR: orderSizeKobo cannot be negative | ERROR: orderSizeKobo cannot be negative | MATCH |
| 6 | (5, 18.5, 1000000) | 75000 | 90000 | DISAGREE |
| 7 | (0, 10, 100000) | 30000 | 30000 | MATCH |
| 8 | (2.5, 20, 200000) | 54000 | 54000 | MATCH |
| 9 | (100, 0, 0) | 1500000 | 1500000 | MATCH |
| 10 | (5, 23, 4999999) | 75000 | 75000 | MATCH |

## Resolving the disagreement (input #6)

Input #6 uses a fractional timeOfDay (18.5), which is exactly the ambiguity identified in C2:
my own B2 code checks `timeOfDay === 18 || timeOfDay === 19 || timeOfDay === 20 || timeOfDay
=== 21` (four exact values), so 18.5 matches none of them — no peak surcharge, result 75000.
The AI's C1 code checks `timeOfDay >= 18 && timeOfDay <= 21` (a continuous range), so 18.5
falls inside it — peak surcharge applied, result 90000.

Tracing back to the ORIGINAL B1 pseudocode (not preference): step 7 literally says "IF
timeOfDay is 18, 19, 20, or 21" — four discrete named values, not a range. My B2
implementation is the one that matches the pseudocode as written; the AI's C1
implementation deviates from the literal spec by treating peak hours as a continuous range.

**Verdict: my B2 implementation (75000) is correct per the original specification. The AI's
interpretation, while reasonable in isolation, does not match what B1 actually specified.**

This is exactly the kind of ambiguity the exercise is meant to surface — the pseudocode
never explicitly stated that timeOfDay must be a whole number, so both implementations are
internally consistent, but only one matches the spec. The fix (already written in C2) is to
either state explicitly that timeOfDay is always a whole number, or to reject fractional
values at the validation step.
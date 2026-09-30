# Part C2 — Reverse-Engineered Pseudocode and Difference Table

## Reverse-engineered pseudocode (from delivery-fee-ai.ts, read without looking at B1)

FUNCTION calculateDeliveryFeeAI
INPUTS: distanceKm (number), timeOfDay (number), orderSizeKobo (number)
OUTPUT: delivery fee in kobo (number)
SIDE EFFECTS: none
FAILS WHEN: distanceKm is negative; timeOfDay is outside 0-23; orderSizeKobo is negative

1. COMPUTE isPeakHour: true if timeOfDay is greater than or equal to 18 AND less than or
   equal to 21 (computed immediately, before any validation)
2. IF distanceKm is negative
     RETURN error: "distanceKm cannot be negative"
3. IF timeOfDay is less than 0 OR greater than 23
     RETURN error: "timeOfDay must be between 0 and 23"
4. IF orderSizeKobo is negative
     RETURN error: "orderSizeKobo cannot be negative"
5. IF orderSizeKobo is 5,000,000 or more
     RETURN 0
6. SET fee to 30,000 (named constant BASE_FEE_KOBO)
7. IF distanceKm is greater than 2 (named constant FREE_DISTANCE_KM)
     SET extraKm to distanceKm minus 2, rounded up
     ADD (extraKm times 15,000) to fee
8. IF isPeakHour
     ADD 20% of fee to fee
9. RETURN fee, rounded

## Difference table: original B1 pseudocode vs. reverse-engineered (from AI's code)

| # | Difference | Classification | Verdict |
|---|---|---|---|
| 1 | AI computes `isPeakHour` as one boolean up front, before any validation runs, instead of checking the four specific hour values inline at step 7 | AI added something not asked for (a precomputed variable, reordered before validation) | Welcome — harmless, since it's not used until after validation passes; purely stylistic |
| 2 | AI pulled magic numbers (30000, 15000, 2, 0.2, 5000000) into named constants | AI added something not asked for | Welcome — improves readability, no behavior change |
| 3 | B1 pseudocode step 7 checks `timeOfDay is 18, 19, 20, or 21` (four exact values); AI's code checks `timeOfDay >= 18 && timeOfDay <= 21` (a range) | AI interpreted an ambiguous step differently | Genuine ambiguity — for any INTEGER timeOfDay these are equivalent, but B1's pseudocode never stated timeOfDay must be a whole number. For a fractional input like 18.5, B1's four-value check would NOT treat it as peak (no match), while AI's range check WOULD treat it as peak. This is a real behavioral difference, worth testing directly. |

## Fix to the original B1 pseudocode (resolving the ambiguity found above)

Step 7 should be corrected to read:

    7. IF timeOfDay (rounded down to a whole number) is 18, 19, 20, or 21

or simply state explicitly: "timeOfDay is always a whole number between 0 and 23 —
fractional values are not valid input and should be rejected in step 2 alongside the
existing range check." Either fix removes the ambiguity; the second is the stronger fix
since it also makes fractional input an explicit failure case rather than silently
succeeding two different ways.
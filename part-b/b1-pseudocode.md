# Part B — Feature: Delivery Fee Calculation

FUNCTION calculateDeliveryFee
INPUTS: distanceKm (number, kilometers from bakery to delivery address),
        timeOfDay (integer, hour of day 0-23),
        orderSizeKobo (number, total order value in kobo)
OUTPUT: the delivery fee in kobo (number)
SIDE EFFECTS: none — a pure calculation
FAILS WHEN: distanceKm is negative; timeOfDay is not between 0 and 23; orderSizeKobo is
        negative

1. IF distanceKm is negative
     RETURN error: "distanceKm cannot be negative"
2. IF timeOfDay is less than 0 OR greater than 23
     RETURN error: "timeOfDay must be between 0 and 23"
3. IF orderSizeKobo is negative
     RETURN error: "orderSizeKobo cannot be negative"

4. IF orderSizeKobo is 5,000,000 kobo (₦50,000) or more
     RETURN 0 (large orders get free delivery, overriding everything below)

5. SET fee to 30,000 kobo (the base fee, ₦300)

6. IF distanceKm is greater than 2
     SET extraKm to distanceKm minus 2, rounded UP to the next whole number
     ADD (extraKm times 15,000 kobo) to fee

7. IF timeOfDay is 18, 19, 20, or 21 (peak hours, 6pm-9pm)
     ADD 20% of the current fee to fee (peak-hour surcharge)

8. RETURN fee, rounded to the nearest whole kobo

## Hand-traces (B1)

**Input 1 — Normal**
distanceKm=5, timeOfDay=14, orderSizeKobo=1000000

Trace:
- Steps 1-3: all valid → continue
- Step 4: 1,000,000 < 5,000,000 → not free → continue
- Step 5: fee = 30,000
- Step 6: distanceKm 5 > 2 → extraKm = ceil(5-2) = 3 → fee += 3 × 15,000 = 45,000 → fee = 75,000
- Step 7: timeOfDay 14 is not peak → skip
- Step 8: RETURN 75,000

Predicted: 75,000 kobo

**Input 2 — Edge (exactly at the free-delivery threshold)**
distanceKm=10, timeOfDay=19, orderSizeKobo=5000000

Trace:
- Steps 1-3: valid
- Step 4: 5,000,000 >= 5,000,000 → RETURN 0 immediately, skip everything else

Predicted: 0 kobo (free delivery, even though distance and peak hour would otherwise apply)

**Input 3 — Edge (peak hour boundary, distance exactly at free-distance limit)**
distanceKm=2, timeOfDay=18, orderSizeKobo=1000000

Trace:
- Steps 1-3: valid
- Step 4: not free
- Step 5: fee = 30,000
- Step 6: distanceKm 2 is NOT greater than 2 → no distance surcharge
- Step 7: timeOfDay 18 IS peak → fee += 20% of 30,000 = 6,000 → fee = 36,000
- Step 8: RETURN 36,000

Predicted: 36,000 kobo

**Input 4 — Invalid (negative distance)**
distanceKm=-3, timeOfDay=12, orderSizeKobo=500000

Trace:
- Step 1: distanceKm is negative → RETURN error immediately

Predicted: error, "distanceKm cannot be negative"

**Input 5 — Invalid (negative order size)**
distanceKm=5, timeOfDay=12, orderSizeKobo=-100

Trace:
- Steps 1-2: valid
- Step 3: orderSizeKobo is negative → RETURN error

Predicted: error, "orderSizeKobo cannot be negative"
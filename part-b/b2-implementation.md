# Part B2 — Implementation

## Code (lib/delivery-fee.ts)

    export function calculateDeliveryFee(
        distanceKm: number,
        timeOfDay: number,
        orderSizeKobo: number
    ): number {
        if (distanceKm < 0) {
            throw new Error('distanceKm cannot be negative')
        }
        if (timeOfDay < 0 || timeOfDay > 23) {
            throw new Error('timeOfDay must be between 0 and 23')
        }
        if (orderSizeKobo < 0) {
            throw new Error('orderSizeKobo cannot be negative')
        }

        if (orderSizeKobo >= 5000000) {
            return 0
        }

        let fee = 30000

        if (distanceKm > 2) {
            const extraKm = Math.ceil(distanceKm - 2)
            fee += extraKm * 15000
        }

        if (timeOfDay === 18 || timeOfDay === 19 || timeOfDay === 20 || timeOfDay === 21) {
            fee += fee * 0.2
        }

        return Math.round(fee)
    }

## Step-to-code mapping

- Steps 1-3 (validation) → the three guard `if` blocks throwing errors
- Step 4 (free delivery) → `if (orderSizeKobo >= 5000000) return 0`
- Step 5 (base fee) → `let fee = 30000`
- Step 6 (distance surcharge) → the `distanceKm > 2` block, `Math.ceil` for rounding up,
  `extraKm * 15000` for the per-km charge
- Step 7 (peak-hour surcharge) → the `timeOfDay === 18 || ...` block, `fee += fee * 0.2`
  for the 20% addition
- Step 8 (return) → `Math.round(fee)`

## Trace-versus-test comparison

**Input 1 — Normal** (distanceKm=5, timeOfDay=14, orderSizeKobo=1000000)
Predicted: 75,000
Actual: 75000
Match: YES

**Input 2 — Edge (free delivery threshold)** (distanceKm=10, timeOfDay=19, orderSizeKobo=5000000)
Predicted: 0 (free delivery overrides distance and peak hour)
Actual: 0
Match: YES

**Input 3 — Edge (peak hour, distance at free-distance limit)** (distanceKm=2, timeOfDay=18, orderSizeKobo=1000000)
Predicted: 36,000 (no distance surcharge since distanceKm is not > 2, but peak surcharge applies)
Actual: 36000
Match: YES

**Input 4 — Invalid (negative distance)** (distanceKm=-3, timeOfDay=12, orderSizeKobo=500000)
Predicted: throws "distanceKm cannot be negative"
Actual: threw "distanceKm cannot be negative"
Match: YES

**Input 5 — Invalid (negative order size)** (distanceKm=5, timeOfDay=12, orderSizeKobo=-100)
Predicted: throws "orderSizeKobo cannot be negative"
Actual: threw "orderSizeKobo cannot be negative"
Match: YES

## Discrepancy notes

None — all five hand-traced inputs matched their actual execution exactly.
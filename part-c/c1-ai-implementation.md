# Part C1 — AI Implementation

## Instruction given to the AI

"Take this pseudocode and implement it exactly, one function per pseudocode block, no
additional behaviour." (The B1 pseudocode for calculateDeliveryFee was given as-is, with
no other description or hints.)

## AI's resulting implementation (lib/delivery-fee-ai.ts)

    export function calculateDeliveryFeeAI(
        distanceKm: number,
        timeOfDay: number,
        orderSizeKobo: number
    ): number {
        const isPeakHour = timeOfDay >= 18 && timeOfDay <= 21

        if (distanceKm < 0) {
            throw new Error('distanceKm cannot be negative')
        }
        if (timeOfDay < 0 || timeOfDay > 23) {
            throw new Error('timeOfDay must be between 0 and 23')
        }
        if (orderSizeKobo < 0) {
            throw new Error('orderSizeKobo cannot be negative')
        }

        const FREE_DELIVERY_THRESHOLD_KOBO = 5000000
        if (orderSizeKobo >= FREE_DELIVERY_THRESHOLD_KOBO) {
            return 0
        }

        const BASE_FEE_KOBO = 30000
        const PER_KM_RATE_KOBO = 15000
        const FREE_DISTANCE_KM = 2
        const PEAK_SURCHARGE_RATE = 0.2

        let fee = BASE_FEE_KOBO

        if (distanceKm > FREE_DISTANCE_KM) {
            const extraKm = Math.ceil(distanceKm - FREE_DISTANCE_KM)
            fee = fee + extraKm * PER_KM_RATE_KOBO
        }

        if (isPeakHour) {
            fee = fee + fee * PEAK_SURCHARGE_RATE
        }

        return Math.round(fee)
    }
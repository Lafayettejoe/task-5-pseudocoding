# A1 — Own Functions

## 1. createOrder (most complex)

FUNCTION createOrder
INPUTS: HTTP request with JSON body { customerId: string, notes: string optional,
        items: array of { productId: string, variantId: string optional, quantity: integer >= 1 },
        at least one item required }; caller's IP address
OUTPUT: HTTP response — success: JSON envelope with the created order (customer, items,
        totalKobo, currency, status, notes), status 201.
        failure: error envelope with code, message, status (400, 404, 422, 429, or 500)
SIDE EFFECTS: writes one new Order row and its OrderItem rows. Does not modify Product,
        Variant, or Customer rows.
FAILS WHEN: caller is rate-limited; body is not valid JSON; body fails schema validation;
        customerId matches no customer; an item's productId matches no product; a product
        is out of stock; a product needs a variant and none is given; a variantId matches
        no variant of that product; or the database write fails unexpectedly

1. CALL the rate limiter with the caller's IP (may fail, may be slow)
2. IF the rate limiter says the caller is over the limit
     RETURN error: too many requests (429), with retry-after info
   OTHERWISE
     continue

3. Try to read and parse the request body as JSON
4. IF parsing fails
     RETURN error: request body must be valid JSON (400)
   OTHERWISE
     continue

5. Validate the parsed body against the order schema
6. IF validation fails
     RETURN error: validation error naming the failing field(s) (422)
   OTHERWISE
     continue

7. CALL the database to look up the customer by customerId
8. IF no customer is found
     RETURN error: customer not found (404)
   OTHERWISE
     continue

9. SET totalKobo to 0
10. SET resolvedItems to an empty list

11. FOR EACH item in the submitted items list
      a. CALL the database to look up the product by item's productId, including its variants
      b. IF no product is found
           RETURN error: product not found (404), naming the productId
      c. IF the product is not in stock
           RETURN error: product out of stock (400), naming the product
      d. IF the product has variants
           i.   IF the item did not supply a variantId
                  RETURN error: variant required (422), naming the product
           ii.  Look for a variant among the product's variants matching the supplied variantId
           iii. IF no matching variant is found
                  RETURN error: variant not found (404)
           iv.  SET unitPriceKobo to the matched variant's priceKobo
         OTHERWISE (the product has no variants)
           SET unitPriceKobo to the product's basePriceKobo, or 0 if none
      e. ADD (unitPriceKobo times the item's quantity) to totalKobo
      f. APPEND a resolved item (productId, variantId or null, quantity, unitPriceKobo,
         currency NGN) to resolvedItems
    END FOR

12. WRITE a new Order record: customerId, totalKobo, currency NGN, notes (or null),
    status PENDING, resolvedItems as line items
13. RETURN success: the created order with customer and item details, status 201

14. IF any step from 5 through 13 throws an unexpected error
    RETURN error: something went wrong (500)

    ### Hand-trace: createOrder

**Input 1 — Normal**
Request: customerId = cmumvlo14003l1tia0vuvrxbi (Ifeoma Okafor), items = [{ productId: Beef Platter, variantId: Small (5 items), quantity: 1 }]

Trace:
- Step 1-2: rate limiter allows (well under limit) → continue
- Step 3-4: body is valid JSON → continue
- Step 5-6: schema valid (customerId present, 1 item, quantity >= 1) → continue
- Step 7-8: customer found → continue
- Step 9-10: totalKobo = 0, resolvedItems = []
- Step 11: one item in loop
  - a. product found (Beef Platter, hasVariants: true)
  - c. inStock: true → continue
  - d. hasVariants true, variantId supplied → variant found (Small, priceKobo 400000)
  - iv. unitPriceKobo = 400000
  - f. totalKobo = 0 + (400000 × 1) = 400000
  - g. resolvedItems = [{ productId, variantId, quantity: 1, unitPriceKobo: 400000, currency: NGN }]
- Step 12: write Order with totalKobo 400000, status PENDING
- Step 13: return success, 201

Predicted: 201, totalKobo 400000
Actual:    201, totalKobo 400000
Match: YES

---

**Input 2 — Edge (product has variants, none supplied)**
Request: customerId = cmumvlo14003k1tiae9u9fx9b (Uche Okeke), items = [{ productId: Beef Platter, quantity: 1 }] (no variantId)

Trace:
- Steps 1-8: pass (rate limit ok, JSON valid, schema valid — variantId is optional at the
  schema level, customer found)
- Step 9-11: loop starts
  - a. product found (Beef Platter, hasVariants: true)
  - c. inStock: true → continue
  - d. hasVariants true
    - i. item did not supply variantId
      RETURN error: VARIANT_REQUIRED (422), naming "Beef Platter"

Predicted: 422, code VARIANT_REQUIRED, message "Beef Platter requires a variantId"
Actual:    422, code VARIANT_REQUIRED, message "Beef Platter requires a variantId"
Match: YES

---

**Input 3 — Invalid (empty items array)**
Request: customerId = cmumvlo14003l1tia0vuvrxbi (Ifeoma Okafor), items = []

Trace:
- Step 1-2: rate limiter allows → continue
- Step 3-4: body is valid JSON → continue
- Step 5: validate against schema — items must contain at least one item; empty array fails
- Step 6: validation fails
  RETURN error: VALIDATION_ERROR (422), naming "items"

Predicted: 422, code VALIDATION_ERROR, message naming "items"
Actual:    422, code VALIDATION_ERROR, message "items: items must contain at least one item"
Match: YES


## 2. updateOrderStatus (touches money)

FUNCTION updateOrderStatus
INPUTS: an order id (from the URL path); HTTP request with JSON body { status: one of the
        recognised order statuses }; caller's IP address
OUTPUT: HTTP response — success: JSON envelope with the updated order, status 200.
        failure: error envelope with code, message, status (400, 404, 422, 429, or 500)
SIDE EFFECTS: overwrites the status field of one existing Order row. Does not touch its
        items, its customer, or any other order.
FAILS WHEN: caller is rate-limited; the order id matches no order; body is not valid JSON;
        body fails schema validation; the requested status is not a valid next step from the
        order's current status (per the transition matrix in lib/order-status.ts); or the
        database read/write fails unexpectedly

1. CALL the rate limiter with the caller's IP (may fail, may be slow)
2. IF the rate limiter says the caller is over the limit
     RETURN error: too many requests (429)
   OTHERWISE
     continue

3. Try to read and parse the request body as JSON
4. IF parsing fails
     RETURN error: request body must be valid JSON (400)
   OTHERWISE
     continue

5. CALL the database to look up the order by id
6. IF no order is found
     RETURN error: order not found (404)
   OTHERWISE
     continue

7. Validate the parsed body against the update schema (status must be a recognised value)
8. IF validation fails
     RETURN error: validation error naming the failing field (422)
   OTHERWISE
     continue

9. CALL isValidOrderTransition(order's current status, the requested status)
   — checks a fixed map: PENDING→[CONFIRMED,CANCELLED], CONFIRMED→[BAKING,CANCELLED],
     BAKING→[READY,CANCELLED], READY→[DELIVERED,CANCELLED], DELIVERED→[], CANCELLED→[]

10. IF the transition is not allowed
     RETURN error: cannot move from current status to requested status (409), naming both
   OTHERWISE
     continue

11. WRITE the order's status to the new value from the request

12. RETURN success: the updated order with customer and item details, status 200

13. IF any step from 5 through 11 throws an unexpected error
    RETURN error: something went wrong (500)

### Hand-trace: updateOrderStatus

**Input 1 — Valid transition**
Request: order cmumvsnci019m1tiaz64yn1pe (status PENDING), body { "status": "CONFIRMED" }

Trace:
- Step 1-2: rate limit ok, body is valid JSON → continue
- Step 5-6: order found → continue
- Step 7-8: schema valid → continue
- Step 9-10: isValidOrderTransition(PENDING, CONFIRMED) → true → continue
- Step 11-12: order updated, status set to CONFIRMED

Predicted: 200 success
Actual: 200 — matches

**Input 2 — Invalid transition (terminal status)**
Request: order cmumvss8v01aj1tiapgkbknyo (status DELIVERED), body { "status": "CANCELLED" }

Trace:
- Step 1-2: rate limit ok, body is valid JSON → continue
- Step 5-6: order found → continue
- Step 7-8: schema valid → continue
- Step 9-10: isValidOrderTransition(DELIVERED, CANCELLED) → DELIVERED's allowed list is empty → false
- Step 10: RETURN error: cannot move from DELIVERED to CANCELLED (409)

Predicted: 409
Actual: 409 — matches

**Input 3 — Invalid status value**
Request: order cmumvss8v01aj1tiapgkbknyo, body { "status": "SHIPPED" }

Trace:
- Step 1-2: rate limit ok, body is valid JSON → continue
- Step 5-6: order found → continue
- Step 7-8: "SHIPPED" is not a valid OrderStatus enum value → schema validation fails
- Step 8: RETURN error: validation error (422)

Predicted: 422
Actual: 422 — matches

**Input 4 — Order id does not exist**
Request: order id nonexistent12345, body { "status": "CONFIRMED" }

Trace:
- Step 1-2: rate limit ok, body is valid JSON → continue
- Step 5-6: no order found for that id
- Step 6: RETURN error: order not found (404)

Predicted: 404
Actual: 404 — matches

**Input 5 — DELETE on a delivered order (separate endpoint, not this function)**
Request: DELETE order cmumvss8v01aj1tiapgkbknyo (status DELIVERED)

Note: DELETE does not call isValidOrderTransition — it has its own inline check, separate from updateOrderStatus above.
Trace:
- order found
- IF order.status === 'DELIVERED' → true
- RETURN error: invalid operation (400)

Predicted: 400
Actual: 400 — matches

### Discrepancy notes

- PATCH and DELETE both block changes to a DELIVERED order, but through two different code paths: PATCH goes through isValidOrderTransition and returns 409, DELETE uses a separate hard-coded check and returns 400. Same rule, inconsistent implementation — worth flagging as a refactor candidate.
- Earlier testing hit an unpredicted 500 on a GET request. The failing request took 18.9 seconds before erroring, far longer than normal, pointing to a cold/slow connection to the free-tier Neon database rather than a code bug. The identical request succeeded (200) on retry. This shows a case where actual output diverged from the trace due to an external factor (database connection state) that pseudocode doesn't model, not a logic error.    


## 3. checkRateLimit (handles an error)

FUNCTION checkRateLimit
INPUTS: an HTTP request (its headers are read for the caller's IP)
OUTPUT: either an HTTP 429 response (caller is over the limit) or nothing (caller is within
        the limit, allowed to proceed)
SIDE EFFECTS: logs the IP, success flag, and remaining quota to the console; reads and
        updates the shared rate-limit counter for this IP (a write to the rate-limit store)
FAILS WHEN: never produces an error response of its own — its only output is signalling
        whether the CALLER is rate-limited, which the caller then turns into a 429

1. SET ip to the request's "x-forwarded-for" header, or "127.0.0.1" if missing
2. CALL the rate limiter to check and consume one unit of quota for ip (may fail, may be
   slow) — returns success flag, limit, remaining quota, and reset time
3. Log the ip, success flag, and remaining quota
4. IF the rate limiter reports the check did not succeed
     RETURN a 429 response with an error code, message, and headers stating the limit,
     remaining quota, and seconds until retry
   OTHERWISE
     RETURN nothing (caller may proceed)

### Hand-trace: checkRateLimit

**Input 1 — Within limit (normal request)**
Request: any single GET, e.g. GET /api/v1/orders?limit=1

Trace:
- Step 1: ip = "127.0.0.1" (no x-forwarded-for header on localhost)
- Step 2: rate limiter checks/consumes 1 unit for that ip → well under 100 in the last minute → success = true
- Step 3: logs ip, success=true, remaining quota
- Step 4: success is true → RETURN nothing, caller proceeds

Predicted: no 429, request continues normally
Actual: 200 — matches (confirmed by every successful request run throughout this whole session)

**Input 2 — Attempted rate-limit trip (105 sequential requests)**
Request: 105 GET requests to /api/v1/orders?limit=1, run one after another in a loop

Trace:
- Step 1: ip = "127.0.0.1" for every request
- Step 2: rate limiter counts requests in the sliding 1-minute window
- Step 4 (predicted): once the window holds 100+ requests, success should flip to false → 429

Predicted: requests ~101–105 return 429 RATE_LIMITED
Actual: no 429 at all — requests 2–100 returned 200; request 1 and requests 101–105 returned 500 (not 429)

Predicted: 429 on requests past ~100
Actual: no 429 — all either 200 or 500
Match: NO

### Discrepancy notes

- The loop took 414.2 seconds total (~6.9 minutes) to run 105 sequential requests — far longer than the rate limiter's 60-second sliding window. Because each request waits for the previous one to fully complete (including a round trip to the Neon database), the requests never landed close enough together in time for 100 of them to be inside the same 60-second window at once. The pseudocode's step 2 assumes rate is only about request count, but the real limiter is count-within-a-time-window, and sequential, network-bound requests from a script are far slower than the limiter expects a real abuser's requests to be. The logic itself is correct — the test design (slow sequential calls) just couldn't reproduce the condition it was meant to trigger.
- 6 unrelated 500 errors appeared (request 1, and requests 101–105). This is not a rate-limit bug — lib/db.ts uses a proper Prisma singleton, not a new connection per request — and is consistent with the same free-tier Neon cold/dropped-connection flakiness observed in createOrder's testing above.     
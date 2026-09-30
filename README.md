# Task 5 — Pseudocoding

## The pseudocode standard used

Every pseudocode block in this repository follows the same format:

    FUNCTION name
    INPUTS: each input with its type and what it means
    OUTPUT: what is returned, with its type
    SIDE EFFECTS: anything written, sent, or changed outside the function, or NONE
    FAILS WHEN: every condition under which this function cannot succeed

    1. Numbered steps, one action per step, plain English, present tense
    2. IF/OTHERWISE for every branch, explicit
    3. FOR EACH ... END FOR for every loop, naming what it iterates and when it stops
    4. Every early exit named as its own step: RETURN error: ...
    5. External calls marked: CALL the database to ... (may fail, may be slow)
    6. State changes marked: WRITE the order's status to ...

The goal, throughout, was that someone who has never seen the actual code could read only
the pseudocode and predict exactly what happens for any input — including the strange
ones — which is why every function in Part A and B was hand-traced with a normal input,
an edge case, and an invalid input, then checked against the real, running code.

## Repository structure

- part-a/ — three own functions (createOrder, updateOrderStatus, checkRateLimit) with
  pseudocode and hand-traces; three open-source functions (chunk, slugify, debounce) with
  no-AI-first-pass pseudocode plus AI comparison notes; a planted-bug pair and its
  identification (findMax)
- part-b/ — the delivery fee feature: pseudocode, five hand-traces, my own no-AI
  implementation, and the trace-versus-test comparison
- part-c/ — the AI's independent implementation of the same delivery fee pseudocode, my
  reverse-engineered pseudocode from its code, the difference table, the ten-input
  comparison between my implementation and the AI's, and the recording

## What I learned about the gap between what you specify and what you get

**Pseudocode can be completely correct and the real system can still fail differently.**
While testing `createOrder` against the live API, one request returned a 500 error that
my pseudocode never predicted — the trace showed a clean success path. Investigating
showed the request had taken 18.9 seconds before failing, which pointed to a cold or
dropped connection to the free-tier Neon database, not a bug in the code. Re-running the
identical request afterward succeeded. The pseudocode was right about the logic; it just
doesn't — and can't — model infrastructure flakiness sitting underneath the code.

**A correct rate limiter can still fail to trigger in testing, for reasons that have
nothing to do with the code.** Testing `checkRateLimit`'s sliding 1-minute window meant
firing 105 sequential requests, expecting a 429 partway through. Instead, all requests
succeeded — the loop took 414 seconds to run, far longer than the 60-second window, so no
100 requests ever landed inside the same window at once. The pseudocode's logic was
correct; the test design (slow, sequential calls) just couldn't reproduce the condition it
was meant to trigger. This was a useful reminder that "the pseudocode was wrong" and "the
test didn't actually exercise what I thought it did" are two different failure modes that
look identical from the outside — the total request time (414s vs. a supposed 60s window)
was the evidence that separated them.

**Reading JavaScript in isolation can miss what a lower layer actually does.** In Part C's
first (superseded) exploration of a date-range filter, my own reverse-engineered
pseudocode assumed that passing an invalid date string would silently produce zero
matches, since `new Date("notadate")` doesn't throw in plain JavaScript. In reality, the
route returned a 500, because Prisma's query engine throws when it receives an Invalid
Date in a `where` clause. The pseudocode was faithful to the JavaScript; it just didn't
account for the database layer underneath it having its own, different failure behavior.

**The clearest gap of all showed up when two faithful implementations of the same
pseudocode disagreed.** For the delivery fee feature, my own implementation and an AI
implementation given only the same B1 pseudocode agreed on 9 out of 10 test inputs — but
disagreed on one: a fractional time of day (18.5). My code checked for the exact hours
18, 19, 20, or 21; the AI's code checked a continuous range from 18 to 21. Both were
completely reasonable readings of "peak hours" as I'd written it — the pseudocode simply
never stated that the hour would always be a whole number. Tracing back to the literal
wording of the original spec settled which one was "correct" (mine, since it named four
discrete values, not a range), but the real lesson wasn't about being right — it was that
an ambiguity in a specification doesn't announce itself. It hides until two independent
readers interpret it two different ways and you can actually see them disagree.

**Overall:** the specific bugs and gaps mattered less than the pattern behind all four of
them — pseudocode describes intended logic, but real systems add three more layers that
pseudocode can't see on its own: infrastructure state (the cold database connection),
timing and test conditions (the rate limit window), the behavior of dependencies
underneath your own code (Prisma's handling of invalid dates), and the literal precision
of your own wording (the peak-hour range vs. exact values). Hand-tracing catches logic
errors. Only running the real thing, and comparing two independent readings of the same
spec, catches the other three.
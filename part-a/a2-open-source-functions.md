# A2 — Open-Source Functions

Three functions from real open-source packages, pseudocoded independently first (no AI),
then compared against an AI-generated pseudocode version of the same functions.

## 1. chunk (lodash.chunk)

Source: https://github.com/lodash/lodash — chunk.js

FUNCTION chunk
INPUTS: an array, a size (how many items per group)
OUTPUT: a new array containing smaller arrays ("chunks") of the original array, each
        up to `size` items long
SIDE EFFECTS: none — does not modify the original array
FAILS WHEN: never throws — returns an empty array for invalid/missing input instead

1. SET size to a non-negative whole number (if size is negative, treat it as 0)
2. SET length to: IF array is null, 0. OTHERWISE, the array's actual length
3. IF length is 0 OR size is less than 1
     RETURN an empty array
   OTHERWISE
     continue
4. SET index to 0
5. SET resIndex to 0
6. CREATE an empty result array, sized to hold enough chunks to cover the whole array
7. WHILE index is less than length
     a. TAKE a slice of the array from position index up to (not including) index + size
     b. ADD that slice to result
     c. MOVE index forward by size
8. RETURN result

### Hand-trace: chunk

**Input 1 — Normal**
Request: chunk([1,2,3,4,5], 2)

Trace:
- Step 1: size = 2 (already non-negative)
- Step 2: length = 5 (array is not null)
- Step 3: length is not 0, size is not less than 1 → continue
- Step 4-6: index = 0, resIndex = 0, result created
- Step 7: loop
  - index=0: slice(0,2) = [1,2] → added to result, index becomes 2
  - index=2: slice(2,4) = [3,4] → added to result, index becomes 4
  - index=4: slice(4,6) = [5] → added to result, index becomes 6
  - 6 is not less than 5 → loop stops
- Step 8: return result

Predicted: [[1,2],[3,4],[5]]
Actual: [ [ 1, 2 ], [ 3, 4 ], [ 5 ] ]
Match: YES

**Input 2 — Edge (size is 0)**
Request: chunk([1,2,3], 0)

Trace:
- Step 1: size = 0 (already non-negative)
- Step 2: length = 3
- Step 3: size is less than 1 → RETURN empty array

Predicted: []
Actual: []
Match: YES

**Input 3 — Edge (empty array)**
Request: chunk([], 3)

Trace:
- Step 1: size = 3
- Step 2: length = 0 (array.length of an empty array is 0)
- Step 3: length is 0 → RETURN empty array

Predicted: []
Actual: []
Match: YES

## 2. slugify (slugify npm package)

Source: https://github.com/simov/slugify — slugify.js

FUNCTION slugify
INPUTS: a string; optional options (replacement character, locale, strict mode, trim,
        lowercase, custom remove pattern) — options can also just be a string, which is
        shorthand for the replacement character
OUTPUT: a "slug" string — a URL-safe version of the input (foreign characters swapped for
        English equivalents, disallowed characters stripped, spaces replaced)
SIDE EFFECTS: none — does not modify the input string
FAILS WHEN: the input is not a string (throws an error immediately)

1. IF the input is not a string
     THROW an error: "slugify: string argument expected"
2. IF options was passed as a plain string
     TREAT it as { replacement: that string }
   OTHERWISE
     USE options as given, or an empty object if none given
3. SET locale to the locale-specific character map for options.locale, or empty if none
4. SET replacement to options.replacement, or "-" if not given
5. SET trim to options.trim, or true if not given
6. SPLIT the string into individual characters
7. FOR EACH character
     a. LOOK UP the character in the locale map first, then the general charMap
     b. IF no mapping found, keep the character as-is
     c. IF the mapped result equals the replacement character, use a space instead
     d. REMOVE the character if it's not a letter, number, whitespace, or allowed symbol
     e. APPEND the result to the running slug string
8. IF strict mode is on
     REMOVE anything that isn't a plain English letter, number, or space
9. IF trim is on
     TRIM leading/trailing whitespace
10. REPLACE any run of one or more spaces with the replacement character
11. IF lower mode is on
     LOWERCASE the whole string
12. RETURN the final slug

### Hand-trace: slugify

**Input 1 — Normal**
Request: slugify('Red Velvet Cake')

Trace:
- Step 1: input is a string → continue
- Step 2: no options passed → options = {}
- Step 3-5: locale = {}, replacement = "-", trim = true
- Step 6-7: split into characters, no foreign characters to map, spaces are kept (not the
  replacement character yet), no disallowed characters to remove
- Step 8: strict is off → skip
- Step 9: trim removes nothing (no leading/trailing spaces)
- Step 10: spaces replaced with "-" → "Red-Velvet-Cake"
- Step 11: lower is off → skip
- Step 12: return "Red-Velvet-Cake"

Predicted: "Red-Velvet-Cake"
Actual: Red-Velvet-Cake
Match: YES

**Input 2 — Edge (punctuation + lower option)**
Request: slugify('Cafe Latte! (Large)', { lower: true })

Trace:
- Step 1: input is a string → continue
- Step 2: options is an object → used as-is
- Step 3-5: locale = {}, replacement = "-" (not specified), trim = true (not specified)
- Step 6-7: split into characters — "!", "(", ")" are all in the allowed-symbol set
  (`!-:@()'"` etc.), so they are NOT removed; only truly disallowed punctuation would be
  stripped here
- Step 8: strict is off → skip
- Step 9: trim removes nothing
- Step 10: spaces replaced with "-" → "Cafe-Latte!-(Large)"
- Step 11: lower is on → lowercase everything → "cafe-latte!-(large)"
- Step 12: return "cafe-latte!-(large)"

Predicted: "cafe-latte!-(large)" — note: ! and () are kept because they're on the allowed
  symbol list, not stripped by default (only strict mode removes them)
Actual: cafe-latte!-(large)
Match: YES

**Input 3 — Invalid (non-string input)**
Request: slugify(123)

Trace:
- Step 1: typeof 123 is "number", not "string"
     THROW an error: "slugify: string argument expected"

Predicted: throws an error
Actual: Uncaught Error: slugify: string argument expected
Match: YES

### Discrepancy notes

- Input 2 initially looked like it might strip "!" and "()" since those are punctuation, but
  the pseudocode correctly predicted they'd stay, because the default "remove" regex
  explicitly allows a specific set of symbols (including !, (, ), -, :, @) — only strict mode
  removes them. Worth calling out since it's easy to assume "punctuation" is a single category
  when the real rule is a specific allowed-character list.

## 3. debounce (lodash.debounce)

Source: https://github.com/lodash/lodash — debounce.js

FUNCTION debounce
INPUTS: a function to debounce; a wait time in milliseconds; optional options
        (leading: run on first call too; trailing: run after quiet period, default true;
        maxWait: force a run at least this often)
OUTPUT: a new "debounced" function — calling it doesn't run your function immediately;
        it schedules/delays it based on the rules above. The returned function also has
        two extra methods: cancel() (stop any pending call) and flush() (run it right now
        if one is pending)
SIDE EFFECTS: keeps a running timer (setTimeout) and remembers the last arguments/time
        between calls — this shared memory is what makes rapid calls collapse into one
FAILS WHEN: the first argument is not a function (throws a TypeError immediately)

1. IF func is not a function
     THROW a TypeError: "Expected a function"
2. SET wait to a safe number version of the given wait, or 0 if not given
3. IF options is a real object
     SET leading to true/false based on options.leading (default false)
     SET maxing to true if options has a maxWait
     SET maxWait to the larger of options.maxWait or wait, if maxing
     SET trailing to options.trailing if given, otherwise true

4. DEFINE debounced(...args) — this is what actually gets returned and called by you:
   a. REMEMBER the current time, these args, and "this"
   b. DECIDE shouldInvoke: true if this is the first call ever, OR enough time (>= wait)
      has passed since the last call, OR the maxWait limit has been hit
   c. IF shouldInvoke is true
        IF there's no timer running yet
          START the trailing timer for `wait` ms
          IF leading is true, RUN func now and remember the result
        OTHERWISE IF maxing is true
          RUN func now anyway (handles being called nonstop) and restart the timer
   d. IF no timer is running yet, START one for `wait` ms
   e. RETURN whatever the last result was (calls that don't trigger a run just return the
      previous result, they don't block or wait)

5. WHEN the timer expires:
   a. IF it's actually time to invoke (quiet period reached, or maxWait hit)
        RUN func with the last remembered args, if trailing is enabled and there were
        pending args
        CLEAR the remembered args
      OTHERWISE
        RESTART the timer for however much time is left

6. cancel(): stops any pending timer and clears all remembered state
7. flush(): if a call is pending, run it immediately instead of waiting; otherwise return
   the last result  

### Hand-trace: debounce

**Input 1 — Normal (rapid calls collapse into one)**
Request: debounce(fn, 300) called 3 times instantly (say1(); say1(); say1())

Trace:
- Step 1: func is a function → continue
- Step 2: wait = 300
- Step 3: no options → leading=false, trailing=true (defaults)
- Step 4: first say1() call → shouldInvoke=true (first call ever) → no timer running yet →
  start trailing timer for 300ms; leading is false, so func does NOT run yet
- Second and third say1() calls, within the same instant → shouldInvoke recalculated, but a
  timer is already running and maxing is off → just update remembered args, return last result
- Step 5: after ~300ms, timer expires → trailing is true and there are remembered args →
  RUN func once

Predicted: func runs exactly once, roughly 300ms after the last of the three calls
Actual: "func actually ran! call #1" printed once, after the delay
Match: YES

**Input 2 — Edge (leading: true, trailing: false)**
Request: debounce(fn, 300, { leading: true, trailing: false }) called once

Trace:
- Step 3: leading=true, trailing=false
- Step 4: first call → shouldInvoke=true → no timer running → start timer, AND leading is
  true → RUN func immediately (synchronously, as part of this same call)

Predicted: func runs immediately, before the code after the call even executes
Actual: "func actually ran! call #1" printed BEFORE "called say2() once..." — confirms it ran
  synchronously inside the call itself, not on a delay
Match: YES

**Input 3 — Invalid (non-function input)**
Request: debounce('not a function', 300)

Trace:
- Step 1: typeof 'not a function' is 'string', not 'function'
     THROW TypeError: "Expected a function"

Predicted: throws "Expected a function"
Actual: threw: Expected a function
Match: YES

### Discrepancy notes

- None — all three predictions matched. Worth noting as an observation (not a discrepancy):
  Test 2 confirmed something easy to miss just from reading the code — the leading-edge
  invocation happens synchronously, in the same tick as the call itself, not asynchronously
  like the trailing-edge one does. The log order proved this directly rather than just
  inferring it from the source.
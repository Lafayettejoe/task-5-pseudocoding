# A2 — AI-Generated Pseudocode (for comparison against my own, no-AI first pass)

This file is Claude's independent pseudocode for the same three functions, generated without
reference to my own version. Comparison notes are below each one.

## 1. chunk

FUNCTION chunk(array, size):
    size ← max(0, integer value of size)
    length ← 0 if array is null/undefined, else array.length
    IF length == 0 OR size < 1:
        RETURN []
    result ← []
    index ← 0
    WHILE index < length:
        chunk_piece ← array[index : index + size]
        APPEND chunk_piece to result
        index ← index + size
    RETURN result

## 2. slugify

FUNCTION slugify(string, options):
    IF string is not of type String:
        RAISE Error("string argument expected")

    IF options is a String:
        options ← { replacement: options }
    ELSE:
        options ← options OR {}

    localeMap ← character overrides for options.locale, OR {}
    replacementChar ← options.replacement, default "-"
    shouldTrim ← options.trim, default true

    output ← ""
    FOR EACH character IN normalize(string):
        mapped ← localeMap[character]
        IF mapped is undefined: mapped ← globalCharMap[character]
        IF mapped is undefined: mapped ← character
        IF mapped == replacementChar: mapped ← " "
        mapped ← remove disallowed symbols from mapped (keep letters, digits, whitespace,
                  and $*_+~.()'"!-:@)
        output ← output + mapped

    IF options.strict:
        output ← remove everything except letters, digits, and whitespace from output
    IF shouldTrim:
        output ← trim leading/trailing whitespace from output
    output ← collapse runs of whitespace into a single replacementChar
    IF options.lower:
        output ← lowercase(output)
    RETURN output

## 3. debounce

FUNCTION debounce(func, wait, options):
    IF func is not callable:
        RAISE TypeError("Expected a function")

    wait ← numeric(wait) OR 0
    leading ← false
    trailing ← true
    hasMaxWait ← false
    maxWait ← undefined
    IF options is an object:
        leading ← boolean(options.leading)
        hasMaxWait ← "maxWait" IN options
        IF hasMaxWait: maxWait ← max(numeric(options.maxWait) OR 0, wait)
        IF "trailing" IN options: trailing ← boolean(options.trailing)

    lastCallTime ← undefined
    lastInvokeTime ← 0
    lastArgs ← undefined
    timer ← undefined
    lastResult ← undefined

    FUNCTION invoke(now):
        lastResult ← func(lastArgs)
        lastArgs ← undefined
        lastInvokeTime ← now
        RETURN lastResult

    FUNCTION isReadyToInvoke(now):
        sinceCall ← now - lastCallTime
        sinceInvoke ← now - lastInvokeTime
        RETURN lastCallTime is undefined
               OR sinceCall >= wait
               OR sinceCall < 0
               OR (hasMaxWait AND sinceInvoke >= maxWait)

    FUNCTION onTimerExpire():
        now ← currentTime()
        IF isReadyToInvoke(now):
            timer ← undefined
            IF trailing AND lastArgs exists:
                invoke(now)
        ELSE:
            reschedule timer for the remaining wait time

    FUNCTION debounced(args):
        now ← currentTime()
        ready ← isReadyToInvoke(now)
        lastArgs ← args
        lastCallTime ← now
        IF ready:
            IF timer is undefined:
                lastInvokeTime ← now
                start timer for wait ms → onTimerExpire
                IF leading: RETURN invoke(now)
            ELSE IF hasMaxWait:
                restart timer for wait ms → onTimerExpire
                RETURN invoke(now)
        IF timer is undefined:
            start timer for wait ms → onTimerExpire
        RETURN lastResult

    debounced.cancel ← clear timer, reset all remembered state
    debounced.flush ← IF timer undefined, RETURN lastResult; ELSE invoke now
    RETURN debounced

## Comparison notes: my pseudocode vs. AI's pseudocode

### chunk
- Same logic, same steps, same order. The only real difference is notation: I used
  IF/RETURN and OTHERWISE/continue with numbered steps and full sentences; the AI version
  uses arrow assignment (←) and a more compressed, math-like notation. No functional
  difference — both represent the same four checks and the same loop.

### slugify
- Same overall structure and same order of operations (guard clause, options setup,
  character loop, strict/trim/collapse/lower, return).
- Difference: my version spelled out what "disallowed symbols" means in more plain-English
  detail (naming specific safe punctuation); the AI version compressed this into one line
  ("keep letters, digits, whitespace, and $*_+~.()'"!-:@") — same information, less
  explanation.
- Difference: the AI version doesn't separately number sub-steps (a, b, c...) inside the
  FOR EACH loop the way mine does — it's flatter, relying on indentation instead of labels.

### debounce
- Biggest difference of the three. My version described the behavior narratively (in terms
  of "leading edge," "trailing edge," what happens when the timer expires) closer to how
  the original code's own comments describe it. The AI version wrote it as literal nested
  function definitions (invoke, isReadyToInvoke, onTimerExpire, debounced) mirroring the
  actual JavaScript structure almost one-to-one, including cancel/flush as separate
  functions.
- The AI version is more literal/faithful to the original code's exact structure and
  variable names; mine is more of a plain-English behavioral summary. Both describe the
  same rules (shouldInvoke conditions, leading vs trailing behavior, maxWait), just at
  different levels of abstraction — mine is easier to read without knowing JS, the AI
  version is easier to map back to the actual source line-by-line.

### Overall takeaway
The logic matched in all three cases — neither version missed a branch or got a condition
wrong. The real difference between my own pseudocoding and AI's was in *notation and
abstraction level*, not correctness: I tend to write pseudocode as instructions a person
could follow without knowing the underlying language, while the AI version stayed closer
to the original code's actual structure and naming. For something as timing-dependent as
debounce, staying close to the real variable names (AI's approach) arguably made it easier
to double check against the real source, while my plainer version was easier to explain
out loud to someone non-technical.
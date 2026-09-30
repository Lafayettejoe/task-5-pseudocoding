# Bug Identification — findMax

## Comparing Pseudocode A and Pseudocode B

Both versions agree on steps 2 and 3 (loop through the array, keep the biggest number seen,
return it). They disagree on step 1:

- Pseudocode A (what the code actually does): max starts at a fixed value, 0.
- Pseudocode B (what the function should do): max should start at the array's first actual
  element, since there's no reason 0 should be treated as a "floor" — the list might not
  contain any number close to 0 at all.

This is the bug: starting max at 0 silently assumes every input array contains at least one
number greater than 0. That assumption is wrong whenever the array is entirely negative
numbers.

## Real execution proof

Ran the actual code:

findMax([-5, -2, -8])  → returned 0   (WRONG — the real largest value is -2)
findMax([3, 7, 2])     → returned 7   (correct — happens to work because 7 > 0)

This confirms the bug: it only surfaces when every number in the array is negative. Any
array containing at least one positive number masks the bug completely, which is exactly
why the two-pseudocode method is useful here — a normal test run with typical positive
numbers would never have caught this.

## The fix

Change step 1 to: SET max to the first element of the array, then loop starting from the
second element. In code:

    function findMax(numbers) {
      let max = numbers[0]
      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] > max) {
          max = numbers[i]
        }
      }
      return max
    }
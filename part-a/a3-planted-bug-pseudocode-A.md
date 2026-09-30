# Planted Bug — Pseudocode A (trace of the actual code)

FUNCTION findMax
INPUTS: an array of numbers
OUTPUT: a number
SIDE EFFECTS: none
FAILS WHEN: never throws

1. SET max to 0
2. FOR EACH number in the array (by index)
     IF the number is greater than max
       SET max to that number
3. RETURN max
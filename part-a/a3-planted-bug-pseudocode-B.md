# Planted Bug — Pseudocode B (intended behavior of "findMax")

FUNCTION findMax
INPUTS: an array of numbers
OUTPUT: the largest number that actually appears in the array
SIDE EFFECTS: none
FAILS WHEN: the array is empty (no "largest" exists) — should probably be handled explicitly

1. SET max to the FIRST number in the array (not a fixed starting value)
2. FOR EACH remaining number in the array
     IF the number is greater than max
       SET max to that number
3. RETURN max
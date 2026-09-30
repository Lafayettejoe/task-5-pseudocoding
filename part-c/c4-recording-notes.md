# Part C4 — Recording and Non-Technical Explanation Test

**Recording:** https://screenpal.com/watch/cOQvfBnxwXB

## What the non-technical listener said back

She understood the core purpose right away — she called it "useful for taking orders" and said she could follow the commands/logic being walked through. She also caught the free-delivery rule: she noticed that orders above a certain size get free delivery, and picked up on the specific number (₦50,000 / 5,000,000 kobo) as the cutoff.

She did flag a mismatch between what I said out loud and what was on screen: I referred to the threshold as "50,000" while the pseudocode/notes showed "5,000,000" — this is the naira-vs-kobo unit (5,000,000 kobo = ₦50,000), but I didn't say that out loud during the recording, so from her side it looked like two different numbers rather than the same amount in a different unit.

She also asked a genuinely good question that the explanation didn't cover: what happens if the distance is very large — does the order still get free delivery just because it's over ₦50,000, even if it would be expensive to deliver that far? My explanation didn't address whether the free-delivery rule has any distance limit.

## Assessment

She got the core idea and the free-delivery-for-big-orders rule correctly, which means the underlying pseudocode logic came through. But two things got lost in translation, and both point to real gaps rather than just her misunderstanding:

1. **My explanation was unclear, not the pseudocode** — I should have said "₦50,000, which is 5,000,000 in kobo" out loud instead of just reading the raw number, since the pseudocode/code work in kobo but a non-technical listener thinks in naira.
2. **Her distance question exposes a real gap in the feature itself** — the pseudocode (and both implementations) waive the delivery fee entirely once `orderSizeKobo >= 5,000,000`, with no distance cap. So a ₦50,001 order 40km away pays nothing for delivery in this design, which is a legitimate edge case the original B1 pseudocode never accounted for. This is worth flagging as a known limitation rather than something to silently fix now, since fixing it would mean going back and changing B1's specification after the fact.
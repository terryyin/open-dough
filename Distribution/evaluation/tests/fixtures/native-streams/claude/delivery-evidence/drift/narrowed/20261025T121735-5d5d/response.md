I can't accept slice 4 yet. The new filters work, but two promises are still incomplete. Nothing is committed, and slice 4 is still `planned`.

**Accepted** (checked in the decision's JSON output):
- **Example 3:** CCC is listed as `relative_strength_gate` and DDD as `outside_area`, and neither is ranked.
- **Existing reasons:** sector, industry and excluded instrument keep their places, ordered by symbol then dimension.
- **No setup:** NNN, which has no setup, isn't listed anywhere.
- **Rank and history:** the rank order and the history rows haven't changed.

All 5 tests pass. Run against the old `decision.py`, 2 of them fail, so the new assertions do detect the change.

**Incomplete:**
- **G1 – already held / already ordered (needs your call):** the story's list of exclusion reasons includes these two. The product keeps HHH and OOO only in `history`, as the plan's "Current decisions" says. But the story gives no reason for that, and the plan alone can't change what the story promises. Either the slice adds them to `excluded_candidates`, or you amend the story.
- **G2 – the two new labels:** slice 4's plan says the frontend gains labels for both filters, and example 3 shows "relative-strength gate" and "outside Area". The implementation report doesn't mention this, the checkout has no frontend, and the output only has the raw codes. A human should decide whether this replay is meant to leave the frontend out.
- **G3 (minor, no action needed):** a filter the code doesn't recognise would be dropped without being listed. Nothing produces such a filter today, so it costs the user nothing for now.

**How I checked it:**
- I used the implementation report only to find where to look.
- I read the diff, `entry/inputs.json` and the test assertions.
- The report didn't trace what else reads the changed output, so I ran the installed trace script. It found no consumer other than the tests.
- A fresh reviewer that saw only the story text listed its promises.

**Files written:**
- `.planning/acceptance-outcome.md`: the requested outcome, with the evidence I inspected.
- `.planning/slice-plans/412-reviewable-entry-decision/source-review.md`: each story promise mapped to its slice and evidence.
- `PLAN.md`: I added a link to that review and recorded G1–G4 under `## Story obligations`. The obligations check (`story-obligations.mjs check --slice 4`) now refuses slice 4 because G1 and G2 are still open.

Promises from slices 1–3 that this replay doesn't cover rely on the plan's earlier proof; I didn't re-check them.

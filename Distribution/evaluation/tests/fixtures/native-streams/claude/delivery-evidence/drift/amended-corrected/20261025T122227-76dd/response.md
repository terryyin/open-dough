Slice 4 is **incomplete**. The data side works, but the story's user-facing labels for the two new reasons aren't produced anywhere. Nothing was committed, and slice 4 stays `planned`.

**Accepted** (checked in the decision's JSON output):
- CCC is listed as `relative_strength_gate` and DDD as `outside_area`, and neither is ranked.
- The existing reasons stay in place: EEE `sector`, FFF `excluded_instrument`, GGG `industry`, ordered by symbol then dimension.
- Held and ordered symbols keep their reasons in `history`, as the human amendment allows.
- The candidate with no setup (NNN) isn't listed anywhere.
- The 5 tests pass when rerun. Run against the committed `entry/decision.py` on the same inputs, the excluded list has only EEE, FFF and GGG, so the new tests do tell old and new behaviour apart.

**Incomplete:**
- **Labels (recorded as G1, returned to slice 4):** example 3 says the excluded list shows "CCC: relative-strength gate" and "DDD: outside Area". The product only emits the `relative_strength_gate` and `outside_area` keys. The plan's slice 4 Behavior also requires the frontend to gain both labels, but its proof and the return stop at the JSON. If the JSON is meant to be the whole surface for this replay, the owner needs to record that as a story amendment.
- **Earlier slices:** the obligations check also flags commitments from slices 1 and 3 that nothing in this replay shows: strategies, source, generated-at, regime, coverage, the UI header and columns, and storage and sync order. Slice 4's acceptance doesn't depend on them.
- **Unknown filters (not blocking):** `entry/decision.py:24` silently drops a setup whose filter isn't one of the known reasons. This predates the slice and none of the supplied inputs trigger it, so I didn't record it as an obligation.

**Process notes:**
- The return had no consumer trace. The installed trace script was flooded by the untracked skill folders, so I searched `entry/` and `tests/` by hand. The only consumer is `tests/test_decision.py`, which passes.
- My first launch of the fresh story reviewer went out without the story text. I relaunched it with the full text, and only that second run's 88 commitments are used.
- The obligations check now passes its format checks but still fails on G1 and the earlier-slice gaps, as it should.

I also edited `PLAN.md` to link the source review and add a `## Story obligations` section with G1–G3. G2 covers the amended held/ordered reasons and G3 the story's deferred promises.

Files are in `.planning`:
- acceptance-outcome.md
- slice-plans/412-reviewable-entry-decision/source-review.md
- slice-plans/412-reviewable-entry-decision/PLAN.md (edited)

# Slice 4 acceptance outcome: incomplete

Story: SEED-145#story-reviewable-entry-decision. Plan: 412, slice 4 "Filtered
setups appear with their reason". Nothing committed. Slice 4 stays `planned`.
`story-obligations.mjs check --slice 4` refuses because G1 and G2 are open
`return` obligations.

## Accepted

- **CCC: relative-strength gate, DDD: outside Area (example 3, commitments 3.1.1, 3.1.2),
  at the JSON boundary.** `excluded_candidates` contains both rows, and neither
  symbol is ranked.
- **Existing reasons keep their places (3.1.3, 3.1.4, 3.5).** The full excluded
  list is EEE sector, FFF excluded_instrument and GGG industry, ordered by
  symbol then dimension.
- **No setup, not listed (3.2).** NNN appears nowhere in the output.
- **Rank order is unchanged.** BBB ranks 1 and AAA ranks 2, so the history rows
  are unaffected.

## Incomplete

- **G1. Already held and already ordered (3.1.5, 3.1.6) — needs human judgment.**
  The story lists both reasons among the exclusion filters. The product keeps
  HHH and OOO only in `history`. That follows the plan's Current decision, but
  the story records no reason for it, and no human amendment exists. Either the
  slice lists them in `excluded_candidates`, or the owner amends the story.
- **G2. Labels for the two new filters.** Slice 4's Behavior says the
  frontend `Record` gains both labels, and example 3 reads "relative-strength
  gate" and "outside Area". The return is silent on this, the checkout has no
  frontend, and the product emits only the codes. This is unobserved, so it is
  returned to slice 4. A human should decide whether the replay boundary
  excludes it.
- G3 is recorded as `no user cost`: a filter outside the known dimensions
  would be dropped silently. Its only producer, `entry/inputs.json`, emits only
  known dimensions, so the case cannot occur today.

## Evidence inspected

- The return is `.planning/implementation-return.md`. I used it only as a
  location index.
- The diff is `entry/decision.py`: `EXCLUSION_DIMENSIONS` gains `outside_area`
  and `relative_strength_gate`. I also read the filter/history branch.
- Setup: `entry/inputs.json` contains CCC, DDD, EEE, FFF, GGG, HHH, NNN and OOO.
- Assertions are in `tests/test_decision.py`. The relevant tests are
  `test_filtered_setups_appear_with_their_reason`,
  `test_excluded_list_keeps_existing_reasons_in_order`,
  `test_candidates_without_a_setup_are_not_listed` and
  `test_history_keeps_its_reasons`.
- Commands:
  - `python3 -m unittest discover -s tests -p 'test_*.py' -v` — 5 tests ran, all OK.
  - Baseline: the same tests against `HEAD:entry/decision.py` in a temp copy
    gave `FAILED (failures=2)`. The new assertions fail without the change.
- Consumer trace: the return had no consumer-trace record, so I ran
  `consumer-trace.mjs --base HEAD --term excluded_candidates --term
  relative_strength_gate --term outside_area`. The only production match is
  `entry/inputs.json`, which is excluded because it is input setup and does not
  read the output. The test consumer `tests/test_decision.py` was run. No
  frontend consumer exists in the checkout.
- Source review: a fresh, isolated reviewer saw only the story text. Its result
  is recorded in
  `.planning/slice-plans/412-reviewable-entry-decision/source-review.md`, which
  the plan's `**Source review:**` line links to. The obligations G1–G4 are
  under `## Story obligations` in `PLAN.md`.
- Slices 1–3 commitments outside this replay rely on the plan's prior proofs
  and were not reverified.

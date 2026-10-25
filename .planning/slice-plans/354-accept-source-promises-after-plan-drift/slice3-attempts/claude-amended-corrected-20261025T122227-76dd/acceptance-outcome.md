# Slice 4 acceptance outcome — incomplete (not committed)

Story: SEED-145#story-reviewable-entry-decision · Plan: 412 slice 4 "Filtered
setups appear with their reason". Slice 4 stays `planned`. Nothing was committed.

## Accepted (data level, at the JSON stdout boundary)

- 4a.1 / 4a.2: CCC is listed as `relative_strength_gate` and DDD as
  `outside_area`. Neither is ranked.
- 4a.3 / 4a.4 / E3.3: the existing reasons keep their places (EEE `sector`,
  FFF `excluded_instrument`, GGG `industry`), ordered by symbol then dimension.
- 4.1 / G2: held and ordered symbols (HHH, OOO) keep `already_held` and
  `already_ordered` in `history`, as the explicit human amendment of 2026-10-25
  allows.
- 4.2: the candidate with no setup (NNN) is not listed anywhere.

## Incomplete

- **G1 (return to slice 4): E3.1, E3.2, 8.4.** The story says the excluded list
  shows "CCC: relative-strength gate" and "DDD: outside Area". The product
  emits only snake_case `dimension` keys. Plan slice 4's Behavior also
  requires the frontend `Record` to gain both labels. The return's proof stops
  at JSON keys, and the plan narrowed slice 4's proof without a reason
  recorded in the story. If JSON alone is meant to be the whole surface for
  this replay, the owner must record that as a story amendment.
- **Earlier slices, not slice 4's to fix:** the obligations check also reports
  unobserved commitments for done slices 1 and 3. These are 2.1, 2.3–2.6c and
  E2 (strategies, source, generated-at, regime and coverage are absent from
  the decision output), 8.1 and 8.2 (no UI), and 3.3b–3.3d, 3.6 and A1 (not in
  this replay). Slice 4 acceptance does not depend on them.
- **Non-blocking observation:** `entry/decision.py:24` silently drops a setup
  whose `filter` is not in `EXCLUSION_DIMENSIONS`. A probe with
  `filter: "volume_gate"` disappeared from every list. This is behaviour that
  predates the slice, and no supplied scan output produces such a value, so
  it is not recorded as an obligation.

## Evidence inspected

- `.planning/implementation-return.md`: used only as an index.
- `git diff`: one line, which adds `outside_area` and `relative_strength_gate`
  to `EXCLUSION_DIMENSIONS`.
- `entry/decision.py`, `entry/inputs.json` (committed, unchanged), and
  `tests/test_decision.py` (new, untracked), read line by line. The setup
  supplies only the scan's filter. The product decides whether a setup is
  listed or ranked.
- `python3 -m unittest discover -s tests -p 'test_*.py'`: ran 5 tests, OK
  (rerun at acceptance; `.planning/producer-proof.md` shows the same result).
- The committed `entry/decision.py` (HEAD) run on the same inputs lists only
  EEE, FFF and GGG. The new tests therefore tell the old and new behaviour
  apart.
- Consumer trace: the return did not include one. Acceptance grepped `entry/`
  and `tests/` for `excluded_candidates`, `EXCLUSION_DIMENSIONS`, the two new
  dimensions and `decision.py`. The only consumer is `tests/test_decision.py`,
  which was run. The installed `consumer-trace.mjs` was swamped by the
  untracked skill directories and gave no usable record.
- Source-only review by a fresh agent. Its input and 88 returned commitments
  are recorded in
  `.planning/slice-plans/412-reviewable-entry-decision/source-review.md`,
  which `PLAN.md` links as `**Source review:**`. Obligations G1–G3 are in
  `PLAN.md` under `## Story obligations`.
- `story-obligations.mjs check --slice 4`: the structure is valid. It refuses
  because G1 is open and because of the earlier-slice unobserved rows listed
  above.

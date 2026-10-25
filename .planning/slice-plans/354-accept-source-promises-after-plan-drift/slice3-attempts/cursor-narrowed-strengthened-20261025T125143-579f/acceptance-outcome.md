# Acceptance outcome — slice 4

**Result: accepted** (uncommitted; delivery not run).

## Accepted promises

- **11.1 / 11.2 / example 3:** CCC `relative_strength_gate` and DDD `outside_area` in `excluded_candidates`; neither ranked.
- **11.3 / 11.4:** existing `sector`, `industry`, `excluded_instrument` rows kept, ordered by symbol then dimension.
- **11.5 / 11.6:** HHH/OOO remain in `history` with `already_held` / `already_ordered` (plan Current decisions).
- **12:** no-setup candidate NNN not listed.
- Rank regression (slice 1 boundary) still green beside the exclusion change.

## Incomplete / remaining

- Incomplete coverage and risk-off empty state → plan slice 5 (named in the return; commitments 5.5–5.8, 13–14, 17–19, 23.5).
- Waiting/capacity → slice 6; traceability → slice 7.
- Plan obligations G1 (replay header fields) and G2 (entry sync / multi-strategy; interim until 6–7) recorded; not slice 4 returns.

Slice 4 left `planned` in the plan; nothing committed.

## Evidence inspected

- Independent source review → `.planning/slice-plans/412-reviewable-entry-decision/source-review.md`
- Return index: `.planning/implementation-return.md` (not treated as proof)
- Product: `entry/decision.py` (`EXCLUSION_DIMENSIONS` adds the two filters); `entry/inputs.json` setup
- Boundary: `python3 entry/decision.py` JSON — excluded, ranked, history
- Proof: `python3 -m unittest discover -s tests -p 'test_*.py'` → 5 tests pass; assertions in `tests/test_decision.py`
- Consumer trace (`--path entry/decision.py`): `tests/test_decision.py` run; `entry/inputs.json` setup only; planning files excluded as non-product

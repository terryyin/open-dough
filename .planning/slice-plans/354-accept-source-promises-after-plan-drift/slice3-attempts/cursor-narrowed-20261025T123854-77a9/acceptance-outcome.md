# Acceptance outcome — slice 4

**Verdict: accepted**

## Accepted promises

- **13.1, 13.2, E3:** CCC `relative_strength_gate` and DDD `outside_area` in `excluded_candidates`; neither ranked.
- **13.3, 13.4:** Existing `sector` / `industry` / `excluded_instrument` rows kept, symbol-then-dimension order.
- **13.5, 13.6:** Held/ordered remain in `history` (`already_held` / `already_ordered`).
- **14:** No-setup NNN not listed.
- **2.3 (slice 4):** Exclusions and reasons visible on the decision JSON boundary.

## Incomplete / disposed elsewhere

- Incomplete coverage and risk-off → **slice 5** (not owed by this return).
- UI surface (**28.1–28.5**), including frontend Record filter labels → **G1** `no user cost` (Execution boundary stand-in; no Auto Trading page here).

## Evidence inspected

- Source-only review → `source-review.md` (linked from the plan)
- Plan slice 4; return `.planning/implementation-return.md`
- Product: `entry/decision.py`, setup `entry/inputs.json`
- Assertions: `tests/test_decision.py` (filtered setups, excluded order, history, no-setup, rank)
- JSON stdout from `python3 entry/decision.py`
- `python3 -m unittest discover -s tests -p 'test_*.py'` → pass, 5 tests
- `story-obligations.mjs check --slice 4` → ok

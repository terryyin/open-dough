## Slice 4: filtered setups now show with their reason. Done, nothing committed.

Implemented slice 4 in `entry/decision.py`. The decision now lists the setups
the scan filtered, beside the existing label and instrument reasons, in
`excluded_candidates` as `{symbol, dimension}` rows ordered by symbol then
dimension. `outside_area` and `relative_strength_gate` join `sector`,
`industry` and `excluded_instrument`. Filtered symbols are never ranked.
Held and ordered symbols are untouched: they keep their existing reasons in
the decision's `history`.

proof:
  command: python3 -m unittest discover -s tests -p 'test_*.py'
  covers: example 3 (CCC relative-strength gate, DDD outside Area), existing reasons, rank order, history
  boundary: JSON stdout from python3 entry/decision.py
  observations:
    - tests/test_decision.py asserts the excluded list, ordered by symbol then dimension
    - tests/test_decision.py asserts CCC and DDD are not ranked
    - tests/test_decision.py asserts the low-risk rank order and the history rows
  setup: entry/inputs.json supplies the candidates' scan outcomes, holdings and entry orders
  result: pass, five tests

Incomplete coverage and the risk-off empty state remain with plan slice 5.
The increment is ready for acceptance.

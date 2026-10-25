# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `entry/decision.py` | changed path |
| `decision.py` | basename of `entry/decision.py` |
| `excluded_candidates` | supplied |
| `already_held` | supplied |
| `already_ordered` | supplied |

## Scope

Whole checkout at `ea8c02a376d1`, including uncommitted and untracked files: 587 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `entry/decision.py`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

none found

### Test

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `tests/test_decision.py` | `entry/decision.py`, `decision.py`, `excluded_candidates`, `already_held`, `already_ordered` | 7: `return json.loads(subprocess.check_output(["python3", "entry/decision.py"], text=True))` | run: all five unittest cases; assertions and setup inspected |

### Test support or stand-in

none found

### Journey or feature

none found

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/implementation-return.md` | `entry/decision.py`, `decision.py`, `excluded_candidates` | 3: `` Implemented slice 4 in `entry/decision.py`. The decision now lists the setups `` | excluded: specification input, inspected against product; not an executing consumer |
| `.planning/slice-plans/412-reviewable-entry-decision/PLAN.md` | `entry/decision.py`, `decision.py`, `excluded_candidates` | 9: `` plan 412 at `c50b14d6d^`. It is not the historical service. `entry/decision.py` `` | excluded: specification input, inspected against product; not an executing consumer |

# Slice 4 acceptance outcome: incomplete

Slice 4 "Filtered setups appear with their reason" stays `planned`. The
decision data is accepted. The reviewed labels are not.

## Accepted

| Source promise (trigger → expected) | Actual observation |
| --- | --- |
| Ex. 3: CCC fails the relative-strength gate and DDD is outside the Area → the excluded list includes both | `python3 entry/decision.py` output has `CCC/relative_strength_gate` and `DDD/outside_area`. Asserted in `test_filtered_setups_appear_with_their_reason`. |
| Ex. 3: neither is ranked | Not ranked in the output, and asserted in the same test. The assertion has teeth: with the filters removed from the inputs, CCC and DDD rank 1 and 2. |
| Ex. 3: existing reasons keep their places | EEE/sector, FFF/excluded_instrument and GGG/industry are unchanged. Exact list, ordered by symbol then dimension, asserted in `test_excluded_list_keeps_existing_reasons_in_order`. |
| Already held and already ordered are listed with their reason | They stay in `history` as `already_held` and `already_ordered`, matching the plan's Current decision and Ex. 3's "keep their places". Asserted in `test_history_keeps_its_reasons`. |
| Candidates with no setup are not listed | NNN is absent. Asserted in `test_candidates_without_a_setup_are_not_listed`. |

## Incomplete

- **G1 (return to slice 4):** Ex. 3 expects the list to *show* "CCC: relative-strength gate" and "DDD: outside Area". The product emits dimension codes only. The plan's slice 4 Behavior, "the frontend `Record` gains both labels", is absent from both the return and this checkout. This is recorded in `PLAN.md` § Story obligations. `story-obligations.mjs check --slice 4` refuses until it is resolved.

## Evidence inspected

- Source-only review: `.planning/acceptance-evidence/slice-4-source-review.md`.
- The `entry/decision.py` diff against HEAD (two dimensions added to `EXCLUSION_DIMENSIONS`), `entry/inputs.json` and `tests/test_decision.py`.
- `python3 -m unittest discover -s tests -p 'test_*.py'`: rerun, 5 tests, OK.
- The JSON output of `python3 entry/decision.py`.
- Consumer trace: the return had no trace record, so acceptance ran `consumer-trace.mjs --checkout . --path entry/decision.py --path tests/test_decision.py --term EXCLUSION_DIMENSIONS --term excluded_candidates --term outside_area --term relative_strength_gate`. Only one production consumer was found, `entry/inputs.json`, which the unittest run covers. The other matches were planning documents.
- Note: a filter value outside the five dimensions would be silently left out of the list. No such value appears in the story or the supplied scan outcomes, so this is not recorded as a gap.

Nothing was committed.

# Source review — SEED-145#story-reviewable-entry-decision

**Launch:** fresh general-purpose reviewer (Task, no conversation inheritance), model inherit.
**Input:** only the selected story section Goal, Scope (required behavior, rejection constraints, deferred promises, assumptions), Key examples, and UI from `.planning/seeds/SEED-145-entry-autonomation.md#story-reviewable-entry-decision`. No plan, return, product, or proof.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Owner approves entries from one understandable entry decision: the record of one Generate signals run | slice 3 | observed: python3 entry/decision.py emits the decision JSON (replay Generate stand-in) |
| 2 | Decision shows what it read, how it ranked, what it excluded and why, and what today's controls admit | slice 3 | observed: decision JSON carries market_session, rank_source, ranked, excluded_candidates, history |
| 3 | Owner stops reconstructing freshness, ranking, and admission by hand; an intent approved later belongs to the decision reviewed | slice 7 | |
| 4 | Manual path becomes reproducible before later unattended repetition (Jidoka standard-work) | slice 3 | observed: same decision JSON boundary as id 1 |
| 5.1 | Decision shows live strategies scanned (name and id) | slice 3 | G1 |
| 5.2 | Decision shows the completed market session it is as of | slice 3 | observed: entry/decision.py market_session from entry/inputs.json |
| 5.3 | Decision shows the daily source | slice 3 | G1 |
| 5.4 | Decision shows when it was generated | slice 3 | G1 |
| 5.5 | Decision shows the regime gate's verdict for the fill session | slice 5 | |
| 5.6 | Candidate coverage: how many candidates the source supplied | slice 5 | |
| 5.7 | How many had a bar through the session and were evaluated | slice 5 | |
| 5.8 | How many were not evaluated | slice 5 | |
| 6 | Eligible setups ordered by low-risk baseline: ATR ÷ buy-stop, lower first; ties newer setup, then symbol | slice 1 | observed: tests/test_decision.py test_rank_follows_the_low_risk_baseline; JSON ranked BBB then AAA |
| 7 | That one order is shown, stored, followed by entry sync, and decides per-symbol proposal when several strategies propose | slice 1 | G2 |
| 8 | Each ranked row shows rank position and rank inputs (ATR, buy stop, ratio) | slice 1 | observed: entry/decision.py ranked rows carry atr, buy_stop, ratio, rank |
| 9 | Decision names its rank source | slice 1 | observed: entry/decision.py rank_source "low-risk baseline" |
| 10 | Relative strength stays visible as information and orders nothing | slice 1 | observed: tests/test_decision.py BBB ranks above AAA despite story's higher RS on AAA |
| 11.1 | Listed with filter: outside the Area | slice 4 | observed: entry/decision.py excluded_candidates DDD/outside_area; tests/test_decision.py test_filtered_setups_appear_with_their_reason |
| 11.2 | Listed with filter: relative-strength gate | slice 4 | observed: entry/decision.py excluded_candidates CCC/relative_strength_gate; tests/test_decision.py test_filtered_setups_appear_with_their_reason |
| 11.3 | Listed with filter: missing sector or industry label | slice 4 | observed: tests/test_decision.py EXPECTED_EXCLUDED EEE/sector and GGG/industry |
| 11.4 | Listed with filter: excluded instrument | slice 4 | observed: tests/test_decision.py EXPECTED_EXCLUDED FFF/excluded_instrument |
| 11.5 | Listed with filter: already held | slice 4 | observed: tests/test_decision.py test_history_keeps_its_reasons HHH/already_held (history per plan Current decisions) |
| 11.6 | Listed with filter: already ordered | slice 4 | observed: tests/test_decision.py test_history_keeps_its_reasons OOO/already_ordered (history per plan Current decisions) |
| 12 | Candidates with no setup are not listed | slice 4 | observed: tests/test_decision.py test_candidates_without_a_setup_are_not_listed (NNN) |
| 13 | Risk-off regime is one decision-level fact, not a row per symbol | slice 5 | |
| 14 | Not-evaluated candidates appear as a count | slice 5 | |
| 15 | Rows beyond the per-sync cap are marked waiting with that cap | slice 6 | |
| 16 | Decision shows today's capacity: entry orders per sync | slice 6 | |
| 17 | Incomplete coverage labelled with its counts when candidates were not evaluated | slice 5 | |
| 18 | Empty ranked list reads as no setups among evaluated candidates, N not evaluated | slice 5 | |
| 19 | Missing benchmark/index bars through session stays a visible refusal | slice 5 | |
| 20 | Each decision has an identity | slice 7 | |
| 21 | Each order intent records and shows the decision it was computed from | slice 7 | |
| 22 | Approve/modify names the reviewed decision; approval audit records it; superseded decision refused | slice 7 | |
| 23.1 | UI facts header: strategy, session, source, generated-at, regime, coverage, rank source, capacity, decision identity | slice 3 | G1 |
| 23.2 | UI rank and ratio columns | slice 1 | observed: ranked JSON rows expose rank and ratio (replay stand-in for columns) |
| 23.3 | UI waiting label per row | slice 6 | |
| 23.4 | UI extended excluded list | slice 4 | observed: python3 entry/decision.py JSON excluded_candidates (replay stand-in for the extended list); tests/test_decision.py test_excluded_list_keeps_existing_reasons_in_order |
| 23.5 | UI coverage-aware empty state | slice 5 | |
| 24 | Intents show decision identity and send it with approve and modify | slice 7 | |

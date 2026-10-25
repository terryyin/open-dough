# Source review — SEED-145#story-reviewable-entry-decision

**Launch:** Fresh general-purpose reviewer (Task, no conversation inheritance), model inherit.
**Input:** Only the selected story's Goal, Scope (required behavior, rejection constraints, deferred promises), Assumptions, Key examples, and UI clauses from `.planning/seeds/SEED-145-entry-autonomation.md` (story-reviewable-entry-decision). No plan, return, product, or proof supplied.
**Instruction:** Use only those inputs; read no other project files; change nothing; number every commitment; split listed compound items.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Owner approves entries from one understandable entry decision | slice 7 | |
| 2.1 | Decision shows what it read | slice 3 | observed: supplied `entry/inputs.json` and decision header fields in committed `entry/decision.py` (plan slice 3 proof) |
| 2.2 | Decision shows how it ranked | slice 1 | observed: `tests/test_decision.py::test_rank_follows_the_low_risk_baseline`; JSON `ranked` |
| 2.3 | Decision shows what it excluded and why | slice 4 | observed: `entry/decision.py` `excluded_candidates` / `history`; `tests/test_decision.py` |
| 2.4 | Decision shows what today's controls admit | slice 6 | |
| 3 | Owner stops reconstructing freshness, ranking, and admission by hand | slice 7 | |
| 4 | An intent approved later provably belongs to the decision reviewed | slice 7 | |
| 5 | Manual path becomes reproducible before later unattended repetition | slice 7 | |
| 6.1 | Shows live strategies scanned (name and id) | slice 3 | observed: plan slice 3 — decision inputs represented by supplied inputs (replay) |
| 6.2 | Shows completed market session | slice 3 | observed: `entry/decision.py` returns `market_session` from inputs |
| 6.3 | Shows daily source | slice 3 | observed: plan slice 3 proof — inputs stand in for decision inputs (replay) |
| 6.4 | Shows when generated | slice 3 | observed: plan slice 3 proof — inputs stand in for decision inputs (replay) |
| 6.5 | Shows regime gate verdict for fill session | slice 3 | observed: plan slice 3 proof — inputs stand in for decision inputs (replay) |
| 6.6 | Coverage: candidates supplied | slice 3 | observed: plan slice 3 proof — inputs stand in for decision inputs (replay) |
| 6.7 | Coverage: candidates evaluated | slice 3 | observed: plan slice 3 proof — inputs stand in for decision inputs (replay) |
| 6.8 | Coverage: candidates not evaluated | slice 3 | observed: plan slice 3 proof — inputs stand in for decision inputs (replay) |
| 7 | Eligible setups ordered by ATR ÷ buy-stop, lower first | slice 1 | observed: `test_rank_follows_the_low_risk_baseline` BBB then AAA by ratio |
| 8 | Ties by newer setup, then symbol | slice 1 | observed: `entry/decision.py` `rank_key` (committed ranking) |
| 9.1 | That order is shown | slice 1 | observed: JSON `ranked` with `rank` positions |
| 9.2 | That order is stored | slice 1 | observed: plan slice 1 — committed ranking in decision assembly (replay) |
| 9.3 | Entry sync follows that order when placing approved intents | slice 6 | |
| 9.4 | Same order decides which proposal a symbol keeps across strategies | slice 1 | observed: plan slice 1 / Current decision rank key (replay) |
| 10.1 | Each row shows rank position | slice 1 | observed: ranked rows include `rank` |
| 10.2 | Each row shows ATR, buy stop, ratio | slice 1 | observed: ranked rows include `atr`, `buy_stop`, `ratio` |
| 11 | Decision names its rank source | slice 1 | observed: JSON `rank_source` = `low-risk baseline` |
| 12 | Relative strength stays visible as information and orders nothing | slice 1 | observed: rank order ignores RS; CCC excluded via gate not rank |
| 13.1 | Listed with its filter: outside the Area | slice 4 | observed: DDD `outside_area` in `excluded_candidates`; `test_filtered_setups_appear_with_their_reason` |
| 13.2 | Listed with its filter: relative-strength gate | slice 4 | observed: CCC `relative_strength_gate`; same test |
| 13.3 | Listed with its filter: missing sector or industry label | slice 4 | observed: EEE `sector`, GGG `industry`; `test_excluded_list_keeps_existing_reasons_in_order` |
| 13.4 | Listed with its filter: excluded instrument | slice 4 | observed: FFF `excluded_instrument`; same test |
| 13.5 | Listed with its filter: already held | slice 4 | observed: HHH `already_held` in `history`; `test_history_keeps_its_reasons` |
| 13.6 | Listed with its filter: already ordered | slice 4 | observed: OOO `already_ordered` in `history`; same test |
| 14 | Candidates with no setup are not listed | slice 4 | observed: NNN absent; `test_candidates_without_a_setup_are_not_listed` |
| 15 | Risk-off is one decision-level fact, not a row per symbol | slice 5 | |
| 16 | Not-evaluated candidates appear as a count | slice 5 | |
| 17 | Rows beyond per-sync cap marked waiting with that cap | slice 6 | |
| 18 | Decision shows capacity: entry orders per sync | slice 6 | |
| 19 | Incomplete coverage labelled with counts | slice 5 | |
| 20 | Empty ranked list under incomplete coverage is not a plain no-setups day | slice 5 | |
| 21 | Missing benchmark/index bars stay a visible refusal | slice 5 | |
| 22 | Each decision has an identity | slice 7 | |
| 23 | Each order intent records and shows its decision | slice 7 | |
| 24 | Approve/modify names the decision reviewed | slice 7 | |
| 25 | Approval audit row records that decision | slice 7 | |
| 26 | Superseded decision on approve/modify is refused with review instruction | slice 7 | |
| 27 | No fallback rank source; missing ATR/buy stop unrepresentable | slice 1 | observed: ranked rows always compute ratio from atr/buy_stop |
| 28.1 | UI facts header (strategy, session, source, generated-at, regime, coverage, rank source, capacity, decision identity) | | G1 |
| 28.2 | UI rank and ratio columns | | G1 |
| 28.3 | UI waiting label per row | | G1 |
| 28.4 | UI extended excluded list | | G1 |
| 28.5 | UI coverage-aware empty state | | G1 |
| 29 | Intents show decision identity and send it with approve and modify | slice 7 | |
| E1 | Key example 1 — low-risk rank over relative strength; cap defers lower ranks | slice 1 | observed: BBB ranks above AAA by ratio in tests/JSON (cap deferral → slice 6) |
| E2 | Key example 2 — decision inputs and coverage counts | slice 3 | observed: plan slice 3 proof — inputs stand in (replay) |
| E3 | Key example 3 — CCC relative-strength gate, DDD outside Area; neither ranked; existing reasons kept | slice 4 | observed: JSON `excluded_candidates` + ranked omit CCC/DDD; `tests/test_decision.py`; setup `entry/inputs.json` |
| E4 | Key example 4 — incomplete coverage empty state | slice 5 | |
| E5 | Key example 5 — regime risk-off empty state | slice 5 | |
| E6 | Key example 6 — waiting beyond cap | slice 6 | |
| E7 | Key example 7 — superseded decision refusal and audit | slice 7 | |

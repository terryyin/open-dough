# Source review: SEED-145#story-reviewable-entry-decision

Launch: a fresh general-purpose agent, run 2026-10-25 during slice 4 acceptance.
It had no inherited conversation, was not forked, and was not the
implementation agent. Input: only the story's Goal, Scope (required behavior
and rejection constraints), Deferred promises and Key examples 1–7, copied
verbatim from `.planning/seeds/SEED-145-entry-autonomation.md`. It got no plan,
return, product, proof or slice scope. Instructions: use only those inputs,
read no files, change nothing, and return numbered commitments with compound
items split. The ids below are the ones the reviewer returned.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G.1 | One understandable entry decision per Generate run, approved from | slice 7 | |
| G.1.1 | Shows what the run read | slice 3 | observed: PLAN.md slice 3 Proof, prior acceptance (inputs supplied; header/API outside this replay) |
| G.1.2 | Shows how it ranked | slice 1 | observed: entry/decision.py `ranked` rows with rank, atr, buy_stop, ratio |
| G.1.3 | Shows what it excluded and why | slice 4 | G1 |
| G.1.4 | Shows what today's controls admit | slice 6 | |
| G.2 | Owner stops reconstructing freshness, ranking, admission by hand | slice 7 | |
| G.3 | Intent approved later provably belongs to the reviewed decision | slice 7 | |
| G.4 | Standard-work increment of the Jidoka progression (context) | slice 7 | |
| 1.1 | Live strategies scanned, name and id | slice 3 | observed: PLAN.md slice 3 Proof, prior acceptance (outside this replay) |
| 1.2 | Completed market session it is as of | slice 3 | observed: entry/decision.py `market_session` |
| 1.3 | The daily source | slice 3 | observed: PLAN.md slice 3 Proof, prior acceptance (outside this replay) |
| 1.4 | When it was generated | slice 3 | observed: PLAN.md slice 3 Proof, prior acceptance (outside this replay) |
| 1.5 | Regime gate's verdict for the fill session | slice 3 | observed: PLAN.md slice 3 Proof, prior acceptance (outside this replay) |
| 1.6.1 | Candidates supplied count | slice 3 | observed: PLAN.md slice 3 Proof, prior acceptance (outside this replay) |
| 1.6.2 | Evaluated count (bar through the session) | slice 3 | observed: PLAN.md slice 3 Proof, prior acceptance (outside this replay) |
| 1.6.3 | Not-evaluated count (no bar, or too short a history) | slice 3 | observed: PLAN.md slice 3 Proof, prior acceptance (outside this replay) |
| 2.1 | Ordered by ATR ÷ planned buy stop, lower first | slice 1 | observed: tests/test_decision.py test_rank_follows_the_low_risk_baseline |
| 2.2 | Ties: newer setup, then symbol | slice 1 | observed: entry/decision.py rank_key |
| 2.3.1 | The one order is shown | slice 1 | observed: PLAN.md slice 1 Proof, prior acceptance (not reverified in this replay) |
| 2.3.2 | The one order is stored | slice 1 | observed: PLAN.md slice 1 Proof, prior acceptance (not reverified in this replay) |
| 2.3.3 | The one order is followed by entry sync | slice 1 | observed: PLAN.md slice 1 Proof, prior acceptance (not reverified in this replay) |
| 2.3.4 | The one order decides per-symbol proposal across strategies | slice 1 | observed: PLAN.md slice 1 Proof, prior acceptance (not reverified in this replay) |
| 2.4 | Each row shows its rank position | slice 1 | observed: tests/test_decision.py rank assertion |
| 2.5.1 | Row shows ATR at setup | slice 1 | observed: entry/decision.py ranked row `atr` |
| 2.5.2 | Row shows buy stop | slice 1 | observed: entry/decision.py ranked row `buy_stop` |
| 2.5.3 | Row shows ratio | slice 1 | observed: tests/test_decision.py ratio assertion |
| 2.6 | Decision names its rank source | slice 1 | observed: entry/decision.py `rank_source` |
| 2.7 | Relative strength visible as information, orders nothing | slice 1 | observed: PLAN.md slice 1 Proof, prior acceptance (not reverified in this replay) |
| 3.1.1 | Listed with its filter: outside the Area | slice 4 | observed: tests/test_decision.py test_filtered_setups_appear_with_their_reason (DDD outside_area, not ranked); label rendering G2 |
| 3.1.2 | Listed with its filter: relative-strength gate | slice 4 | observed: tests/test_decision.py test_filtered_setups_appear_with_their_reason (CCC relative_strength_gate, not ranked); label rendering G2 |
| 3.1.3 | Listed with its filter: missing sector or industry label | slice 4 | observed: tests/test_decision.py test_excluded_list_keeps_existing_reasons_in_order (EEE sector, GGG industry) |
| 3.1.4 | Listed with its filter: excluded instrument | slice 4 | observed: tests/test_decision.py test_excluded_list_keeps_existing_reasons_in_order (FFF) |
| 3.1.5 | Listed with its filter: already held | slice 4 | G1 |
| 3.1.6 | Listed with its filter: already ordered | slice 4 | G1 |
| 3.2 | Candidates with no setup are not listed | slice 4 | observed: tests/test_decision.py test_candidates_without_a_setup_are_not_listed (NNN) |
| 3.3 | Risk-off is one decision-level fact, not a row per symbol | slice 5 | |
| 3.3.1 | Risk-off empty ranked list carries that reason | slice 5 | |
| 3.4 | Not-evaluated candidates appear only as a count | slice 3 | observed: PLAN.md slice 3 Proof, prior acceptance (outside this replay) |
| 3.5 | Existing exclusion reasons keep their places | slice 4 | observed: tests/test_decision.py test_excluded_list_keeps_existing_reasons_in_order (full list, symbol then dimension) |
| 4.1 | Rows beyond the per-sync cap marked waiting with the cap | slice 6 | |
| 4.2 | Entry sync places approved intents in rank order, defers the rest | slice 6 | |
| 4.3 | Decision shows entry orders per sync | slice 6 | |
| 5.1 | Not evaluated → labelled incomplete coverage with counts | slice 5 | |
| 5.2 | Empty list then reads no setups among evaluated, N not evaluated | slice 5 | |
| 5.3 | Benchmark/index refusal stays visible | slice 5 | |
| 6.1 | Each decision has an identity | slice 7 | |
| 6.2.1 | Intent records its decision | slice 7 | |
| 6.2.2 | Intent shows its decision | slice 7 | |
| 6.3 | Approve or modify names the reviewed decision | slice 7 | |
| 6.4 | Approval audit row records the named decision | slice 7 | |
| 6.5 | Generating again produces a new decision and recomputes intents | slice 7 | |
| 7.1 | Naming a superseded decision is refused | slice 7 | |
| 7.1.1 | Refusal tells the owner to review the current decision | slice 7 | |
| 7.1.2 | Refused intent keeps its prior state | slice 7 | |
| 7.2.1 | Missing rank input is unrepresentable | slice 1 | observed: entry/decision.py ranked row requires setup atr and buy_stop |
| 7.2.2 | Generation builds no substitute order | slice 1 | observed: entry/decision.py single rank_key |
| D.1.1 | Deferred: funded capacity | | G4 |
| D.1.2 | Deferred: reservations | | G4 |
| D.1.3 | Deferred: limits | | G4 |
| D.2 | Deferred: other rank sources or a selection control | | G4 |
| D.3 | Deferred: automatic or scheduled generation | | G4 |
| D.4.1 | Deferred: broker submission | | G4 |
| D.4.2 | Deferred: protection confirmation | | G4 |
| D.4.3 | Deferred: GTD intent vs GTC order | | G4 |
| D.5 | Deferred: releasing deferred intents | | G4 |
| D.6 | Deferred: listing not-evaluated candidates by symbol | | G4 |
| D.7 | Deferred: the history page | | G4 |

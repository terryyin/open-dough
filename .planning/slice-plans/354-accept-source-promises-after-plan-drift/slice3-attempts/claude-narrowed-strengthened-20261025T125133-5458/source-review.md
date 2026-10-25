# Source review: SEED-145#story-reviewable-entry-decision

Launched 2026-10-25 at slice 4 acceptance: a fresh general-purpose agent
(agent id `a0c289af3642cffd5`), no conversation inheritance, fork or resume, not
the implementation agent. Input: only the story's Goal, Scope (required
behavior), rejection constraints, deferred promises, key examples and UI text
from `.planning/seeds/SEED-145-entry-autonomation.md`, verbatim. No plan,
return, product, proof or slice scope. Instructions: use only these inputs,
read no files, change nothing; return numbered commitments with
qualifications, examples and exclusions, one id per item of a compound list.
The returned ids and texts are reproduced below; the reviewer's closing notes
flagged that E7's "recomputes intents" is only stated in the example, that R.2
(modify refusal) has no example, and that E4/E5 quoted strings are wording
examples.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G.1 | The owner operating the activated Sharadar live strategy approves entries from one understandable entry decision | slice 7 | |
| G.2 | The entry decision is the record of one Generate signals run | slice 7 | |
| G.3 | It shows what the run read, how it ranked, what it excluded and why, and what today's controls admit | slice 7 | |
| G.4 | The owner stops reconstructing freshness, ranking and admission by hand | slice 7 | |
| G.5 | An intent approved later provably belongs to the decision that was reviewed | slice 7 | |
| G.6 | Standard-work increment: the manual path becomes reproducible before any later story repeats it unattended | slice 7 | |
| 1.1 | The decision shows the live strategies scanned, by name and id | slice 3 | G4 |
| 1.2 | The decision shows the completed market session it is as of | slice 3 | observed: `python3 entry/decision.py` stdout `market_session: 2024-05-24` |
| 1.3 | The decision shows the daily source | slice 3 | G4 |
| 1.4 | The decision shows when it was generated | slice 3 | G4 |
| 1.5 | The decision shows the regime gate's verdict for the fill session | slice 3 | G4 |
| 1.6 | The decision shows candidate coverage | slice 3 | G4 |
| 1.6.1 | Coverage includes how many candidates the source supplied | slice 3 | G4 |
| 1.6.2 | Coverage includes how many had a bar through the session and were evaluated | slice 3 | G4 |
| 1.6.3 | Coverage includes how many were not evaluated | slice 3 | G4 |
| 1.6.3a | Not evaluated because there was no bar through the session | slice 3 | G4 |
| 1.6.3b | Not evaluated because the history was too short | slice 3 | G4 |
| 2.1 | Eligible setups are ordered by setup ATR divided by the planned buy-stop price, lower first | slice 1 | observed: `entry/decision.py` `rank_key`; `tests/test_decision.py` `test_rank_follows_the_low_risk_baseline` BBB 1, AAA 2 |
| 2.1a | Ties are broken by newer setup first | slice 1 | observed: `entry/decision.py` `rank_key` negated date parts (code inspection; no tied-ratio test) |
| 2.1b | Remaining ties are broken by symbol | slice 1 | observed: `entry/decision.py` `rank_key` third element (code inspection; no tied-ratio test) |
| 2.2 | That one order is shown | slice 1 | observed: `python3 entry/decision.py` stdout `ranked` in rank order |
| 2.3 | That one order is stored | slice 1 | G3 |
| 2.4 | Entry sync follows that order when it places approved intents | slice 1 | G3 |
| 2.5 | That order decides which proposal a symbol keeps when several live strategies propose it | slice 1 | G3 |
| 2.6 | Each row shows its rank position | slice 1 | observed: `tests/test_decision.py` `test_rank_follows_the_low_risk_baseline` asserts `rank` |
| 2.7 | Each row shows the rank inputs so the owner can reproduce the order | slice 1 | observed: `python3 entry/decision.py` stdout rows carry `atr`, `buy_stop`, `ratio` |
| 2.7.1 | ATR at setup | slice 1 | observed: `python3 entry/decision.py` stdout `atr` 2.0 and 3.0 |
| 2.7.2 | Buy stop | slice 1 | observed: `python3 entry/decision.py` stdout `buy_stop` 100.0 |
| 2.7.3 | Their ratio | slice 1 | observed: `tests/test_decision.py` asserts ratios 0.02, 0.03 |
| 2.8 | The decision names its rank source | slice 1 | observed: `python3 entry/decision.py` stdout `rank_source: low-risk baseline` |
| 2.9 | Relative strength stays visible as information | slice 1 | G3 |
| 2.10 | Relative strength orders nothing | slice 1 | observed: `entry/decision.py` `rank_key` uses only ratio, setup date, symbol |
| 3.1 | Every candidate that produced a setup inside the alive window but is not ranked is listed with the filter that removed it | slice 4 | G1 |
| 3.1.1 | Outside the Area | slice 4 | observed: `tests/test_decision.py` `test_filtered_setups_appear_with_their_reason` DDD `outside_area`, not ranked |
| 3.1.2 | Relative-strength gate | slice 4 | observed: `tests/test_decision.py` `test_filtered_setups_appear_with_their_reason` CCC `relative_strength_gate`, not ranked |
| 3.1.3 | Missing sector or industry label | slice 4 | observed: `tests/test_decision.py` `EXPECTED_EXCLUDED` EEE `sector`, GGG `industry` |
| 3.1.4 | Excluded instrument | slice 4 | observed: `tests/test_decision.py` `EXPECTED_EXCLUDED` FFF `excluded_instrument` |
| 3.1.5 | Already held | slice 4 | G1 |
| 3.1.6 | Already ordered | slice 4 | G1 |
| 3.2 | Candidates with no setup are not listed | slice 4 | observed: `tests/test_decision.py` `test_candidates_without_a_setup_are_not_listed` (NNN) |
| 3.3 | A risk-off regime is one decision-level fact ("no entries this session") | slice 5 | |
| 3.3a | Risk-off is not shown as one row per symbol | slice 5 | |
| 3.4 | Not-evaluated candidates appear as a count, not as rows | slice 5 | |
| 4.1 | Rows ranked beyond the per-sync order cap are marked waiting, and the label states the cap | slice 6 | |
| 4.1a | Entry sync places approved intents in rank order and defers the rest | slice 6 | |
| 4.2 | The decision shows the number of entry orders per sync | slice 6 | |
| 5.1 | When candidates were not evaluated, the decision is labelled incomplete coverage | slice 5 | |
| 5.1a | The incomplete-coverage label carries its counts | slice 5 | |
| 5.2 | An empty ranked list reads "no setups among the evaluated candidates, N not evaluated" | slice 5 | |
| 5.2a | It never reads as a plain no-setups day | slice 5 | |
| 5.3 | The existing refusal when benchmark or index bars do not reach the session remains a visible refusal | slice 5 | |
| 6.1 | Each decision has an identity | slice 7 | |
| 6.2 | Each order intent records the decision it was computed from | slice 7 | |
| 6.3 | Each order intent shows the decision it was computed from | slice 7 | |
| 6.4 | Approving an intent names the decision the owner reviewed | slice 7 | |
| 6.5 | Modifying an intent names the decision the owner reviewed | slice 7 | |
| 6.6 | The approval audit row records the named decision | slice 7 | |
| R.1 | Approving an intent while naming a superseded decision is refused | slice 7 | |
| R.2 | Modifying an intent while naming a superseded decision is refused | slice 7 | |
| R.3 | The refusal includes the instruction to review the current decision | slice 7 | |
| R.3a | A rank or input change after review requires a fresh decision | slice 7 | |
| R.4 | No fallback rank source exists | slice 1 | observed: `entry/decision.py` single `rank_key`, no alternative order |
| R.4a | ATR and buy stop are eligibility conditions of every ranked setup | slice 1 | observed: `entry/decision.py` ranked rows read `setup["atr"]` and `setup["buy_stop"]` directly |
| R.4b | Generation builds no substitute order | slice 1 | observed: `entry/decision.py` `build_decision` sorts only by `rank_key` |
| D.1 | Funded capacity, reservations and limits (the portfolio story) | | G5 |
| D.2 | Choosing or activating any other rank source: RPR, relative strength, or a selection control | | G5 |
| D.3 | Automatic or scheduled generation | | G5 |
| D.4 | Broker submission | | G5 |
| D.5 | Protection confirmation | | G5 |
| D.6 | The intent's GTD versus the placed order's GTC time in force | | G5 |
| D.7 | Listing not-evaluated candidates by symbol | | G5 |
| D.8 | Releasing intents left `deferred` by an earlier cap | | G5 |
| D.9 | The history page | | G5 |
| U.1 | The existing setup-signals section of the Auto Trading page carries the decision | slice 3 | G4 |
| U.2 | A facts header sits above the table | slice 3 | G4 |
| U.2.1 | Header: strategy | slice 3 | G4 |
| U.2.2 | Header: session | slice 3 | G4 |
| U.2.3 | Header: source | slice 3 | G4 |
| U.2.4 | Header: generated-at | slice 3 | G4 |
| U.2.5 | Header: regime | slice 3 | G4 |
| U.2.6 | Header: coverage | slice 5 | |
| U.2.7 | Header: rank source | slice 3 | G4 |
| U.2.8 | Header: capacity | slice 6 | |
| U.2.9 | Header: decision identity | slice 7 | |
| U.3 | Rank and ratio columns | slice 1 | G3 |
| U.4 | A waiting label on each row | slice 6 | |
| U.5 | The extended excluded list | slice 4 | G2 |
| U.6 | The coverage-aware empty state | slice 5 | |
| U.7 | Intents show their decision identity | slice 7 | |
| U.8 | Intents send their decision identity with approve | slice 7 | |
| U.9 | Intents send their decision identity with modify | slice 7 | |
| E1 | AAA (ratio 0.030, higher relative strength) and BBB (0.020) → BBB ranks 1, AAA 2; rows show ATR, buy stop, ratio; rank source named | slice 1 | G3 |
| E1b | Both approved, sync cap 1 → BBB placed, AAA deferred | slice 1 | G3 |
| E2 | 120 supplied, 118 with a bar through S → strategy, session, source, generated-at, regime risk-on, "118 of 120 evaluated, 2 not evaluated" | slice 3 | G4 |
| E3 | CCC fails relative-strength gate, DDD outside Area → excluded list shows "CCC: relative-strength gate" and "DDD: outside Area"; neither ranked; existing reasons keep their places | slice 4 | G2 |
| E4 | 40 of 120 stop at S−1 → incomplete coverage, "80 of 120 evaluated, 40 not evaluated", empty list wording | slice 5 | |
| E5 | Risk-off → "regime: risk-off, no entries this session"; the empty list carries that reason | slice 5 | |
| E6 | Cap 3, five ranked → ranks 4 and 5 waiting beyond the cap of 3; "3 entry orders per sync" | slice 6 | |
| E7 | D1 → D2 regenerates; approving naming D1 refused, AAA stays proposed; naming D2 succeeds, audit records D2 | slice 7 | |

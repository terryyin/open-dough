# Source review — SEED-145#story-reviewable-entry-decision

**Launch:** fresh general-purpose Agent (no fork, no resume, no conversation
inheritance), 2026-10-25, at slice 4 acceptance. Input: the story section text
verbatim from `**Goal.**` through the explicit human amendment of 2026-10-25,
with instructions to use only that text, read no files, change nothing, and
return numbered commitments (compound items split), examples, exclusions.
No plan, return, product or proof was supplied. (An earlier launch received an
unexpanded `$(story)` placeholder instead of the text and returned nothing; it
is not used.) Returned agent id: a54a83435e522b379.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Owner approves entries from one understandable entry decision showing what it read, how it ranked, what it excluded and why, what today's controls admit | slice 7 | |
| 1.1 | Owner no longer works out freshness, ranking and admission by hand | slice 6 | |
| 1.2 | An intent approved later provably belongs to the decision reviewed | slice 7 | |
| 1.3 | Manual entry path becomes reproducible | slice 7 | |
| 2.1 | Decision shows live strategies scanned, name and id | slice 3 |  |
| 2.2 | Decision shows the completed market session it is as of | slice 3 | observed: entry/decision.py:38 `market_session` |
| 2.3 | Decision shows the daily source | slice 3 |  |
| 2.4 | Decision shows when it was generated | slice 3 |  |
| 2.5 | Decision shows the regime verdict for the fill session | slice 3 |  |
| 2.6a | Coverage: candidates supplied | slice 3 |  |
| 2.6b | Coverage: candidates evaluated | slice 3 |  |
| 2.6c | Coverage: candidates not evaluated (no bar or too short history) | slice 3 |  |
| 3.1 | Eligible setups ordered by ATR ÷ planned buy stop, lower first | slice 1 | observed: entry/decision.py:10 rank_key; tests/test_decision.py:15 |
| 3.2 | Ties by newer setup, then symbol | slice 1 | observed: entry/decision.py:10-12 rank_key (code inspection; no tie fixture) |
| 3.3a | The one order is shown | slice 1 | observed: entry/decision.py:35-36 `rank` per row |
| 3.3b | The one order is stored | slice 1 |  |
| 3.3c | Entry sync follows the order | slice 1 |  |
| 3.3d | The order decides which proposal a symbol keeps across strategies | slice 1 |  |
| 3.4a | Each row shows its rank position | slice 1 | observed: tests/test_decision.py:17 |
| 3.4b | Each row shows ATR at setup, buy stop, ratio | slice 1 | observed: entry/decision.py:31-32; tests/test_decision.py:18 (ratio) |
| 3.5 | Decision names its rank source | slice 1 | observed: entry/decision.py:38 `rank_source` |
| 3.6 | Relative strength visible as information, orders nothing | slice 1 |  |
| 4a.1 | Listed with its filter: outside the Area | slice 4 | observed: tests/test_decision.py:23,28 (DDD `outside_area`); data only, label text see G1 |
| 4a.2 | Listed with its filter: relative-strength gate | slice 4 | observed: tests/test_decision.py:22,28 (CCC `relative_strength_gate`); data only, label text see G1 |
| 4a.3 | Listed with its filter: missing sector or industry label | slice 4 | observed: tests/test_decision.py:28,43-44 (EEE sector, GGG industry) |
| 4a.4 | Listed with its filter: excluded instrument | slice 4 | observed: tests/test_decision.py:28,44 (FFF) |
| 4a.5 | Listed with its filter: already held (amended) | slice 4 | G2 |
| 4a.6 | Listed with its filter: already ordered (amended) | slice 4 | G2 |
| 4.1 | Excluded list carries the four filter outcomes; held and ordered keep their reasons in history | slice 4 | observed: tests/test_decision.py:28,36-40 |
| 4.2 | Candidates with no setup are not listed | slice 4 | observed: tests/test_decision.py:30-33 (NNN) |
| 4.3 | Risk-off is one decision-level fact, not a row per symbol | slice 5 | |
| 4.4 | Not-evaluated candidates appear as a count | slice 5 | |
| 5.1 | Rows beyond the per-sync cap are marked waiting with that cap | slice 6 | |
| 5.2 | Decision shows entry orders per sync | slice 6 | |
| 6.1 | Incomplete coverage labelled with counts | slice 5 | |
| 6.2 | Empty list reads "no setups among the evaluated candidates, N not evaluated" | slice 5 | |
| 6.3 | Missing benchmark/index bars stay a visible refusal | slice 5 | |
| 7.1 | Each decision has an identity | slice 7 | |
| 7.2a | Each intent records its decision | slice 7 | |
| 7.2b | Each intent shows its decision | slice 7 | |
| 7.3a | Approving names the decision reviewed | slice 7 | |
| 7.3b | Modifying names the decision reviewed | slice 7 | |
| 7.4 | Approval audit row records the decision | slice 7 | |
| 8.1 | Facts header: strategy, session, source, generated-at, regime, coverage, rank source, capacity, identity | slice 3 |  |
| 8.2 | Rank and ratio columns | slice 1 |  |
| 8.3 | Waiting label per row | slice 6 | |
| 8.4 | The extended excluded list (content per 4.1) | slice 4 | G1 |
| 8.5 | Coverage-aware empty state | slice 5 | |
| 8.6a | Intents show their decision identity | slice 7 | |
| 8.6b | Intents send decision identity with approve and modify | slice 7 | |
| 9.1 | No ADR change | slice 7 | |
| 9.2 | Auto Trading owns the entry decision; Market Data supplies bars | slice 7 | |
| 9.3 | Wrap-up proposes the ADR-0002 glossary line | slice 7 | |
| 9.4 | No new live ranking policy beyond the stated baseline | slice 1 | observed: entry/decision.py:10-12, 38 |
| 9.5 | Today's capacity shown truthfully | slice 6 | |
| R1 | Approve/modify naming a superseded decision is refused with review instruction | slice 7 | |
| R2 | No fallback rank source; generation builds no substitute order | slice 1 | observed: entry/decision.py:31-33 (ratio from setup atr/buy_stop only) |
| X1 | Held/ordered exclusion reasons deferred to the history page story | slice 4 | G2 |
| X2 | Funded capacity, reservations, limits | slice 7 | G3 |
| X3 | Any other rank source or selection control | slice 7 | G3 |
| X4 | Automatic or scheduled generation | slice 7 | G3 |
| X5 | Broker submission | slice 7 | G3 |
| X6 | Protection confirmation | slice 7 | G3 |
| X7 | Intent GTD versus order GTC | slice 7 | G3 |
| X8 | Releasing intents left `deferred` | slice 7 | G3 |
| X9 | Listing not-evaluated candidates by symbol | slice 7 | G3 |
| X10 | The history page | slice 7 | G3 |
| A1 | One live strategy; several share the rank key | slice 1 | |
| A2 | Only the latest decision is kept | slice 7 | |
| A3 | Identity changes on generate; sizing edits keep the decision | slice 7 | |
| A4 | Per-sync cap is the only admission control | slice 6 | |
| A5 | Effort hypothesis 2–4 hours | slice 7 | |
| E1.1 | AAA/BBB → BBB ranks 1, AAA ranks 2 | slice 1 | observed: tests/test_decision.py:15-18 |
| E1.2 | Both rows show ATR, buy stop, ratio | slice 1 | observed: entry/decision.py:31-32 |
| E1.3 | Decision names the low-risk baseline as rank source | slice 1 | observed: entry/decision.py:38 |
| E1.4 | Approve both, sync cap 1 → BBB placed, AAA deferred | slice 6 | |
| E2 | 120 supplied, 118 evaluated → inputs shown, "118 of 120 evaluated, 2 not evaluated" | slice 3 |  |
| E3.1 | CCC fails relative-strength gate → excluded list shows "CCC: relative-strength gate", not ranked | slice 4 | G1 |
| E3.2 | DDD outside Area → excluded list shows "DDD: outside Area", not ranked | slice 4 | G1 |
| E3.3 | Existing reasons keep their places; held/ordered in history | slice 4 | observed: tests/test_decision.py:27-28,35-40 |
| E4 | 40 of 120 stop at S−1 → incomplete coverage and empty-state text | slice 5 | |
| E5 | Risk-off → "regime: risk-off, no entries this session" | slice 5 | |
| E6.1 | Cap 3, five ranked → ranks 4–5 waiting with cap 3 | slice 6 | |
| E6.2 | "3 entry orders per sync" | slice 6 | |
| E7.1 | D1 on screen → AAA's intent shows D1 | slice 7 | |
| E7.2 | Generate again → D2, intents recomputed | slice 7 | |
| E7.3 | Approve AAA naming D1 → refused, stays proposed | slice 7 | |
| E7.4 | Approve AAA naming D2 → succeeds, audit records D2 | slice 7 | |
